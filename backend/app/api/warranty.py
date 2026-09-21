from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.models import Warranty
from app.schemas.schemas import WarrantyResponse, WarrantyCreate
from app.services.ocr_service import ocr_service

router = APIRouter(prefix="/warranty", tags=["Warranty"])

@router.post("/upload-invoice", response_model=WarrantyResponse)
async def upload_invoice(
    file: Optional[UploadFile] = File(None),
    brand_hint: Optional[str] = Form("Voltas"),
    purchase_date: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Simulates OCR invoice scanning. Detects appliance brand, purchase date,
    calculates remaining warranty, and flags official warranty vs. local repair advice.
    """
    filename = file.filename if file else "croma_invoice_voltas_ac.pdf"
    parsed = ocr_service.parse_invoice(filename, brand_hint or "Voltas", purchase_date)
    
    warranty = Warranty(
        user_id=1,
        appliance_type=parsed["appliance_type"],
        brand=parsed["brand"],
        model_number=parsed["model_number"],
        purchase_date=parsed["purchase_date"],
        warranty_duration_months=parsed["warranty_duration_months"],
        expiry_date=parsed["expiry_date"],
        invoice_image_url=f"/uploads/{filename}",
        retailer_name=parsed["retailer_name"],
        status="active" if parsed["is_under_warranty"] else "expired",
        authorized_center_phone=parsed["authorized_phone"]
    )
    db.add(warranty)
    await db.commit()
    await db.refresh(warranty)
    
    return WarrantyResponse(
        id=warranty.id,
        appliance_type=warranty.appliance_type,
        brand=warranty.brand,
        model_number=warranty.model_number,
        purchase_date=warranty.purchase_date,
        warranty_duration_months=warranty.warranty_duration_months,
        expiry_date=warranty.expiry_date,
        invoice_image_url=warranty.invoice_image_url,
        retailer_name=warranty.retailer_name,
        status=warranty.status,
        authorized_center_phone=warranty.authorized_center_phone,
        days_remaining=parsed["days_remaining"],
        is_under_warranty=parsed["is_under_warranty"]
    )

@router.get("/list", response_model=List[WarrantyResponse])
async def list_warranties(db: AsyncSession = Depends(get_db)):
    stmt = select(Warranty).order_by(Warranty.created_at.desc())
    res = await db.execute(stmt)
    warranties = res.scalars().all()
    
    today = datetime.now()
    out = []
    for w in warranties:
        try:
            exp = datetime.strptime(w.expiry_date, "%Y-%m-%d")
            days = max(0, (exp - today).days)
            active = exp > today
        except Exception:
            days = 120
            active = True
            
        out.append(WarrantyResponse(
            id=w.id,
            appliance_type=w.appliance_type,
            brand=w.brand,
            model_number=w.model_number,
            purchase_date=w.purchase_date,
            warranty_duration_months=w.warranty_duration_months,
            expiry_date=w.expiry_date,
            invoice_image_url=w.invoice_image_url,
            retailer_name=w.retailer_name,
            status="active" if active else "expired",
            authorized_center_phone=w.authorized_center_phone,
            days_remaining=days,
            is_under_warranty=active
        ))
    return out
