from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.models import CommunityFault
from app.schemas.schemas import CommunityFaultResponse

router = APIRouter(prefix="/community", tags=["Community Intelligence"])

@router.get("/alerts", response_model=List[CommunityFaultResponse])
async def get_community_alerts(db: AsyncSession = Depends(get_db)):
    """
    Returns neighborhood & apartment complex defect clusters and power surge anomaly alerts.
    """
    stmt = select(CommunityFault).order_by(CommunityFault.report_count.desc())
    res = await db.execute(stmt)
    faults = res.scalars().all()
    return faults
