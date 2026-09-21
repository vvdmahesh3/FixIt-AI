from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.models import ServiceRequest, Technician, Diagnosis, ChatMessage, BillingTransaction
from app.schemas.schemas import (
    ServiceRequestCreate,
    ServiceRequestResponse,
    ServiceRequestStatusUpdate,
    ServiceRequestRating,
    ChatMessageCreate,
    ChatMessageResponse
)
from app.services.matching_service import matching_service, haversine_distance

router = APIRouter(prefix="/service-requests", tags=["Service Requests"])

@router.post("", response_model=ServiceRequestResponse)
async def create_service_request(payload: ServiceRequestCreate, db: AsyncSession = Depends(get_db)):
    """
    Creates a new service request from diagnosis. Automatically matches top nearby verified technician.
    Deducts technician lead fee from lead wallet.
    """
    matched_tech = None
    if payload.preferred_technician_id:
        t_stmt = select(Technician).where(Technician.id == payload.preferred_technician_id)
        t_res = await db.execute(t_stmt)
        matched_tech = t_res.scalar_one_or_none()
        
    if not matched_tech:
        # Match nearest available verified technician in this category
        all_techs_stmt = select(Technician)
        all_res = await db.execute(all_techs_stmt)
        all_techs = all_res.scalars().all()
        
        ranked = matching_service.rank_technicians(all_techs, payload.category, 17.4485, 78.3750)
        if ranked:
            matched_tech = ranked[0]["technician"]
        elif all_techs:
            matched_tech = all_techs[0]

    dist = 1.8
    if matched_tech:
        dist = haversine_distance(17.4485, 78.3750, matched_tech.lat, matched_tech.lng)
        # Deduct lead fee from technician wallet
        matched_tech.lead_wallet_balance_inr = max(0.0, matched_tech.lead_wallet_balance_inr - 99.0)
        
        lead_tx = BillingTransaction(
            technician_id=matched_tech.id,
            transaction_type="technician_lead_fee",
            amount_inr=99.0,
            status="succeeded",
            description=f"Qualified lead fee: {payload.issue_title} ({payload.apartment_complex})"
        )
        db.add(lead_tx)

    req = ServiceRequest(
        diagnosis_id=payload.diagnosis_id,
        user_id=1,
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        customer_address=payload.customer_address,
        apartment_complex=payload.apartment_complex,
        category=payload.category,
        issue_title=payload.issue_title,
        severity=payload.severity,
        estimated_cost=850.0,
        status="assigned" if matched_tech else "pending",
        technician_id=matched_tech.id if matched_tech else None,
        technician_lat=matched_tech.lat if matched_tech else 17.4485,
        technician_lng=matched_tech.lng if matched_tech else 78.3750,
        eta_minutes=int(max(5, dist * 6)), # ~6 min per km in city traffic
        distance_km=round(dist, 1)
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    
    # Add initial greeting system message in chat
    welcome_msg = ChatMessage(
        service_request_id=req.id,
        sender_type="system",
        sender_name="FixIt Dispatch",
        message=f"Verified technician {matched_tech.name if matched_tech else 'assigned'} has accepted your request. Estimated ETA: {req.eta_minutes} mins."
    )
    db.add(welcome_msg)
    await db.commit()
    
    # Reload with technician relationship
    stmt = select(ServiceRequest).where(ServiceRequest.id == req.id)
    r = await db.execute(stmt)
    full_req = r.scalar_one()
    return full_req

@router.get("/{request_id}", response_model=ServiceRequestResponse)
async def get_service_request(request_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(ServiceRequest).where(ServiceRequest.id == request_id)
    res = await db.execute(stmt)
    req = res.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Service request not found")
    return req

@router.get("/{request_id}/route")
async def get_request_route(request_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns live navigation waypoints from technician location to customer apartment.
    """
    stmt = select(ServiceRequest).where(ServiceRequest.id == request_id)
    res = await db.execute(stmt)
    req = res.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    customer_lat = 17.4435
    customer_lng = 78.3810
    waypoints = matching_service.generate_route_waypoints(
        req.technician_lat,
        req.technician_lng,
        customer_lat,
        customer_lng,
        steps=20
    )
    return {
        "status": req.status,
        "eta_minutes": req.eta_minutes,
        "distance_km": req.distance_km,
        "customer_location": {"lat": customer_lat, "lng": customer_lng},
        "technician_location": {"lat": req.technician_lat, "lng": req.technician_lng},
        "waypoints": waypoints
    }

@router.patch("/{request_id}/status", response_model=ServiceRequestResponse)
async def update_request_status(
    request_id: int,
    payload: ServiceRequestStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Advances status: assigned -> en_route -> in_progress -> resolved -> cancelled.
    Updates live technician coordinates and ETA.
    """
    stmt = select(ServiceRequest).where(ServiceRequest.id == request_id)
    res = await db.execute(stmt)
    req = res.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    req.status = payload.status
    if payload.technician_lat is not None:
        req.technician_lat = payload.technician_lat
    if payload.technician_lng is not None:
        req.technician_lng = payload.technician_lng
    if payload.eta_minutes is not None:
        req.eta_minutes = payload.eta_minutes
        
    # Status change log message in chat
    status_messages = {
        "en_route": "Technician is now en route with toolkit & spare parts.",
        "in_progress": "Technician has arrived on site and started diagnosis/repair.",
        "resolved": "Repair successfully completed! Please review and rate your technician."
    }
    if payload.status in status_messages:
        chat_log = ChatMessage(
            service_request_id=req.id,
            sender_type="system",
            sender_name="FixIt Dispatch",
            message=status_messages[payload.status]
        )
        db.add(chat_log)
        
    await db.commit()
    await db.refresh(req)
    return req

@router.post("/{request_id}/rating", response_model=ServiceRequestResponse)
async def rate_service_request(
    request_id: int,
    payload: ServiceRequestRating,
    db: AsyncSession = Depends(get_db)
):
    """
    Submits post-repair rating, review, parts replaced, and final cost.
    Also updates technician's aggregate rating.
    """
    stmt = select(ServiceRequest).where(ServiceRequest.id == request_id)
    res = await db.execute(stmt)
    req = res.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    req.rating = payload.rating
    req.review_text = payload.review_text
    req.status = "resolved"
    if payload.parts_replaced:
        req.parts_replaced = payload.parts_replaced
    if payload.final_cost:
        req.final_cost = payload.final_cost
    if payload.before_image_url:
        req.before_image_url = payload.before_image_url
    if payload.after_image_url:
        req.after_image_url = payload.after_image_url
        
    # Update technician aggregate rating
    if req.technician_id:
        t_stmt = select(Technician).where(Technician.id == req.technician_id)
        t_res = await db.execute(t_stmt)
        tech = t_res.scalar_one_or_none()
        if tech:
            total_score = (tech.rating * tech.reviews_count) + payload.rating
            tech.reviews_count += 1
            tech.rating = round(total_score / tech.reviews_count, 1)

    await db.commit()
    await db.refresh(req)
    return req

@router.get("/{request_id}/messages", response_model=List[ChatMessageResponse])
async def list_chat_messages(request_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(ChatMessage).where(ChatMessage.service_request_id == request_id).order_by(ChatMessage.created_at.asc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/{request_id}/messages", response_model=ChatMessageResponse)
async def post_chat_message(
    request_id: int,
    payload: ChatMessageCreate,
    db: AsyncSession = Depends(get_db)
):
    msg = ChatMessage(
        service_request_id=request_id,
        sender_type=payload.sender_type,
        sender_name=payload.sender_name,
        message=payload.message
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg
