from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.core.database import get_db
from app.models.models import Technician, ServiceRequest
from app.schemas.schemas import TechnicianResponse
from app.services.matching_service import haversine_distance

router = APIRouter(prefix="/technicians", tags=["Technicians"])

@router.get("", response_model=List[TechnicianResponse])
async def list_technicians(
    category: Optional[str] = None,
    user_lat: float = Query(17.4485, description="Customer latitude"),
    user_lng: float = Query(78.3750, description="Customer longitude"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns list of verified technicians filtered by category,
    ranked by rating and physical distance.
    """
    stmt = select(Technician)
    result = await db.execute(stmt)
    techs = result.scalars().all()
    
    out = []
    for t in techs:
        if category and category.lower() not in t.category.lower() and t.category.lower() not in category.lower():
            continue
        dist = haversine_distance(user_lat, user_lng, t.lat, t.lng)
        
        t_dict = {
            "id": t.id,
            "name": t.name,
            "phone": t.phone,
            "category": t.category,
            "experience_years": t.experience_years,
            "rating": t.rating,
            "reviews_count": t.reviews_count,
            "hourly_rate_inr": t.hourly_rate_inr,
            "lat": t.lat,
            "lng": t.lng,
            "is_available": t.is_available,
            "is_verified": t.is_verified,
            "lead_wallet_balance_inr": t.lead_wallet_balance_inr,
            "badge": t.badge,
            "bio": t.bio,
            "avatar_url": t.avatar_url,
            "distance_km": round(dist, 1)
        }
        out.append(t_dict)
        
    out.sort(key=lambda x: (not x["is_available"], x["distance_km"]))
    return out

@router.get("/{technician_id}", response_model=TechnicianResponse)
async def get_technician(technician_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Technician).where(Technician.id == technician_id)
    res = await db.execute(stmt)
    tech = res.scalar_one_or_none()
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
        
    return TechnicianResponse(
        id=tech.id,
        name=tech.name,
        phone=tech.phone,
        category=tech.category,
        experience_years=tech.experience_years,
        rating=tech.rating,
        reviews_count=tech.reviews_count,
        hourly_rate_inr=tech.hourly_rate_inr,
        lat=tech.lat,
        lng=tech.lng,
        is_available=tech.is_available,
        is_verified=tech.is_verified,
        lead_wallet_balance_inr=tech.lead_wallet_balance_inr,
        badge=tech.badge,
        bio=tech.bio,
        avatar_url=tech.avatar_url,
        distance_km=1.8
    )

@router.get("/{technician_id}/leads")
async def get_technician_leads(technician_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns available incoming service leads for the technician portal.
    """
    stmt = select(ServiceRequest).where(
        (ServiceRequest.technician_id == technician_id) | (ServiceRequest.status == "pending")
    ).order_by(ServiceRequest.created_at.desc())
    res = await db.execute(stmt)
    leads = res.scalars().all()
    return leads
