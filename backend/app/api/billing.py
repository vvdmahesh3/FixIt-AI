from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.models import User, Technician, BillingTransaction
from app.schemas.schemas import (
    HouseholdTierUpgradeRequest,
    TechnicianWalletTopupRequest,
    BillingTransactionResponse
)
from app.core.config import settings

router = APIRouter(prefix="/billing", tags=["Billing & Metering"])

@router.get("/summary")
async def get_billing_summary(db: AsyncSession = Depends(get_db)):
    """
    Returns household subscription status, monthly diagnostic quota,
    technician lead balance, and metering statistics.
    """
    u_stmt = select(User).where(User.id == 1)
    u_res = await db.execute(u_stmt)
    user = u_res.scalar_one_or_none()
    
    t_stmt = select(Technician).where(Technician.id == 1)
    t_res = await db.execute(t_stmt)
    tech = t_res.scalar_one_or_none()
    
    user_tier = user.subscription_tier if user else "free"
    monthly_limit = settings.PRO_TIER_MONTHLY_LIMIT if user_tier == "pro" else settings.FREE_TIER_MONTHLY_LIMIT
    used = user.diagnoses_used_this_month if user else 1
    
    return {
        "household": {
            "tier": user_tier.upper(),
            "monthly_diagnoses_limit": monthly_limit,
            "monthly_diagnoses_used": used,
            "quota_remaining": max(0, monthly_limit - used),
            "pro_price_inr": 299,
            "is_unlimited": user_tier == "pro",
            "priority_dispatch": user_tier == "pro"
        },
        "technician": {
            "name": tech.name if tech else "Ramesh Sharma",
            "lead_wallet_balance_inr": tech.lead_wallet_balance_inr if tech else 1500.0,
            "cost_per_lead_inr": settings.LEAD_BASE_PRICE_INR,
            "estimated_leads_affordable": int((tech.lead_wallet_balance_inr if tech else 1500.0) / settings.LEAD_BASE_PRICE_INR)
        },
        "metering_stats": {
            "llm_vision_tokens_processed": 142500,
            "avg_latency_ms": 420,
            "cost_per_diagnosis_usd": 0.0032,
            "gross_platform_revenue_inr": 18450.0
        }
    }

@router.post("/household/upgrade")
async def upgrade_household(payload: HouseholdTierUpgradeRequest, db: AsyncSession = Depends(get_db)):
    """
    Upgrades household user account to FixIt Pro (Mock Stripe transaction).
    """
    u_stmt = select(User).where(User.id == 1)
    u_res = await db.execute(u_stmt)
    user = u_res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.subscription_tier = "pro"
    
    tx = BillingTransaction(
        user_id=user.id,
        transaction_type="household_pro_subscription",
        amount_inr=299.0,
        status="succeeded",
        description="FixIt Pro Monthly Membership — Unlimited Diagnoses & Priority Dispatch"
    )
    db.add(tx)
    await db.commit()
    return {"message": "Upgraded to FixIt Pro successfully!", "subscription_tier": "pro"}

@router.post("/technician/topup")
async def topup_technician_wallet(payload: TechnicianWalletTopupRequest, db: AsyncSession = Depends(get_db)):
    """
    Adds funds to technician lead wallet (Mock Stripe/Razorpay flow).
    """
    t_stmt = select(Technician).where(Technician.id == payload.technician_id)
    t_res = await db.execute(t_stmt)
    tech = t_res.scalar_one_or_none()
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
        
    tech.lead_wallet_balance_inr += payload.amount_inr
    
    tx = BillingTransaction(
        technician_id=tech.id,
        transaction_type="wallet_topup",
        amount_inr=payload.amount_inr,
        status="succeeded",
        description=f"Technician Lead Wallet Recharge (₹{payload.amount_inr:,.0f})"
    )
    db.add(tx)
    await db.commit()
    return {
        "message": f"Successfully recharged ₹{payload.amount_inr:,.0f} to technician wallet.",
        "new_balance_inr": tech.lead_wallet_balance_inr
    }

@router.get("/transactions", response_model=List[BillingTransactionResponse])
async def list_transactions(db: AsyncSession = Depends(get_db)):
    stmt = select(BillingTransaction).order_by(BillingTransaction.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()
