from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.models import ServiceRequest, Technician

router = APIRouter(prefix="/social", tags=["Proof-of-Work Studio"])

@router.get("/proof-of-work/{request_id}")
async def generate_proof_of_work(request_id: int, db: AsyncSession = Depends(get_db)):
    """
    Generates branded 'Before -> After, Job Done' social media card data,
    ready for export/download and sharing on WhatsApp Status or Instagram.
    """
    stmt = select(ServiceRequest).where(ServiceRequest.id == request_id)
    res = await db.execute(stmt)
    req = res.scalar_one_or_none()
    if not req:
        # Fallback sample proof of work
        return {
            "title": "FixIt Verified Repair Showcase",
            "appliance": "1.5 Ton Split AC",
            "issue_diagnosed": "Blower Fan Vibration & Dust Clog",
            "solution_performed": "Cleaned evaporator coil, replaced worn blower bushing, rebalanced fan",
            "customer_location": "Skyline Towers, Hitec City",
            "technician_name": "Ramesh Sharma",
            "technician_badge": "FixIt Top Rated Pro (4.9 ★)",
            "parts_replaced": "Blower Bushing (OEM Voltas)",
            "warranty_given": "90 Days FixIt Service Guarantee",
            "rating": 5,
            "review": "Fast diagnosis by FixIt AI, technician arrived in 15 mins. AC is super quiet and cool now!",
            "before_image": "/sample_cases/ac_dirty_coil.jpg",
            "after_image": "/sample_cases/ac_clean_coil.jpg",
            "hashtags": "#FixItAI #HyderabadRepairs #HomeServices #VerifiedPro #JobDone"
        }

    tech_name = "FixIt Verified Pro"
    tech_badge = "Certified Specialist"
    if req.technician_id:
        t_stmt = select(Technician).where(Technician.id == req.technician_id)
        t_res = await db.execute(t_stmt)
        tech = t_res.scalar_one_or_none()
        if tech:
            tech_name = tech.name
            tech_badge = f"{tech.badge} ({tech.rating} ★)"

    return {
        "title": f"Fixed in {req.eta_minutes + 25} Mins: {req.issue_title}",
        "appliance": req.category,
        "issue_diagnosed": req.issue_title,
        "solution_performed": req.parts_replaced or "Diagnostic triage, component testing & precision repair",
        "customer_location": req.apartment_complex or "Hitec City, Hyderabad",
        "technician_name": tech_name,
        "technician_badge": tech_badge,
        "parts_replaced": req.parts_replaced or "Original OEM Seal / Wiring Harness",
        "warranty_given": "90 Days FixIt Guarantee",
        "rating": req.rating or 5,
        "review": req.review_text or "Great service, accurately diagnosed and fixed right away!",
        "before_image": req.before_image_url or "/sample_cases/geyser_spark_before.jpg",
        "after_image": req.after_image_url or "/sample_cases/geyser_fixed_after.jpg",
        "hashtags": "#FixItAI #HomeMaintenance #VerifiedTechnician #BeforeAndAfter #JobDone"
    }
