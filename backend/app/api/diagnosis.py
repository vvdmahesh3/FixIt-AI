import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.models.models import Diagnosis, User
from app.schemas.schemas import DiagnosisResponse, TriageAnswerRequest, CostCalculatorRequest, CostCalculatorResponse
from app.services.ai_vision_service import ai_vision_service
from app.services.speech_service import speech_service

router = APIRouter(prefix="/diagnosis", tags=["Diagnosis"])

@router.post("/diagnose", response_model=DiagnosisResponse)
async def create_diagnosis(
    image: Optional[UploadFile] = File(None),
    preset_name: Optional[str] = Form(None),
    note_text: Optional[str] = Form(""),
    language: Optional[str] = Form("en"),
    db: AsyncSession = Depends(get_db)
):
    """
    Submits a photo or preset, along with optional voice note text / language.
    Runs vision + multi-turn diagnosis to extract issue, severity, bounding box, and follow-ups.
    """
    filename = preset_name or (image.filename if image else "ac_rattling.jpg")
    
    # Read actual image bytes if uploaded (for real AI vision captioning)
    image_bytes = None
    if image and image.filename:
        try:
            image_bytes = await image.read()
            await image.seek(0)  # Reset for potential further use
        except Exception:
            pass
    
    # Run AI Vision & Domain Diagnostic Service (LIVE AI + fallback)
    diag_data = ai_vision_service.diagnose_media(filename, note_text or "", language or "en", image_bytes=image_bytes)
    
    # Save into DB
    db_diag = Diagnosis(
        user_id=1,
        image_url=f"/sample_cases/{filename}" if not image else f"/uploads/{image.filename}",
        voice_language=language or "en",
        appliance_type=diag_data["appliance_type"],
        detected_brand=diag_data["detected_brand"],
        detected_issue=diag_data["detected_issue"],
        severity=diag_data["severity"],
        confidence=diag_data["confidence"],
        bounding_box=json.dumps(diag_data["bounding_box"]),
        summary=diag_data["summary"],
        safe_to_touch=diag_data["safe_to_touch"],
        diy_steps=json.dumps(diag_data["diy_steps"]),
        tools_needed=json.dumps(diag_data["tools_needed"]),
        safety_warnings=json.dumps(diag_data["safety_warnings"]),
        follow_up_questions=json.dumps(diag_data["follow_up_questions"]),
        user_answers=json.dumps({}),
        estimated_repair_cost_min=diag_data["estimated_repair_cost_min"],
        estimated_repair_cost_max=diag_data["estimated_repair_cost_max"],
        estimated_replace_cost=diag_data["estimated_replace_cost"],
        economic_recommendation=diag_data["economic_recommendation"],
        warranty_detected=diag_data["warranty_detected"],
        warranty_notes=diag_data["warranty_notes"]
    )
    db.add(db_diag)
    await db.commit()
    await db.refresh(db_diag)
    
    return DiagnosisResponse(
        id=db_diag.id,
        user_id=db_diag.user_id,
        image_url=db_diag.image_url,
        audio_url=db_diag.audio_url,
        voice_language=db_diag.voice_language,
        appliance_type=db_diag.appliance_type,
        detected_brand=db_diag.detected_brand,
        detected_issue=db_diag.detected_issue,
        severity=db_diag.severity,
        confidence=db_diag.confidence,
        bounding_box=json.loads(db_diag.bounding_box),
        summary=db_diag.summary,
        safe_to_touch=db_diag.safe_to_touch,
        diy_steps=json.loads(db_diag.diy_steps),
        tools_needed=json.loads(db_diag.tools_needed),
        safety_warnings=json.loads(db_diag.safety_warnings),
        follow_up_questions=json.loads(db_diag.follow_up_questions),
        user_answers=json.loads(db_diag.user_answers),
        estimated_repair_cost_min=db_diag.estimated_repair_cost_min,
        estimated_repair_cost_max=db_diag.estimated_repair_cost_max,
        estimated_replace_cost=db_diag.estimated_replace_cost,
        economic_recommendation=db_diag.economic_recommendation,
        warranty_detected=db_diag.warranty_detected,
        warranty_notes=db_diag.warranty_notes,
        created_at=db_diag.created_at
    )

@router.post("/{diagnosis_id}/triage", response_model=DiagnosisResponse)
async def submit_triage_answer(
    diagnosis_id: int,
    payload: TriageAnswerRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Answers a follow-up triage question. Re-evaluates safety and severity in real-time.
    """
    stmt = select(Diagnosis).where(Diagnosis.id == diagnosis_id)
    result = await db.execute(stmt)
    db_diag = result.scalar_one_or_none()
    if not db_diag:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
        
    diag_dict = {
        "severity": db_diag.severity,
        "safe_to_touch": db_diag.safe_to_touch,
        "summary": db_diag.summary,
        "safety_warnings": json.loads(db_diag.safety_warnings),
        "user_answers": json.loads(db_diag.user_answers),
        "economic_recommendation": db_diag.economic_recommendation
    }
    
    updated = ai_vision_service.process_triage_answers(diag_dict, payload.question_id, payload.answer)
    
    db_diag.severity = updated["severity"]
    db_diag.safe_to_touch = updated["safe_to_touch"]
    db_diag.summary = updated["summary"]
    db_diag.safety_warnings = json.dumps(updated["safety_warnings"])
    db_diag.user_answers = json.dumps(updated["user_answers"])
    db_diag.economic_recommendation = updated["economic_recommendation"]
    
    await db.commit()
    await db.refresh(db_diag)
    
    return DiagnosisResponse(
        id=db_diag.id,
        user_id=db_diag.user_id,
        image_url=db_diag.image_url,
        audio_url=db_diag.audio_url,
        voice_language=db_diag.voice_language,
        appliance_type=db_diag.appliance_type,
        detected_brand=db_diag.detected_brand,
        detected_issue=db_diag.detected_issue,
        severity=db_diag.severity,
        confidence=db_diag.confidence,
        bounding_box=json.loads(db_diag.bounding_box),
        summary=db_diag.summary,
        safe_to_touch=db_diag.safe_to_touch,
        diy_steps=json.loads(db_diag.diy_steps),
        tools_needed=json.loads(db_diag.tools_needed),
        safety_warnings=json.loads(db_diag.safety_warnings),
        follow_up_questions=json.loads(db_diag.follow_up_questions),
        user_answers=json.loads(db_diag.user_answers),
        estimated_repair_cost_min=db_diag.estimated_repair_cost_min,
        estimated_repair_cost_max=db_diag.estimated_repair_cost_max,
        estimated_replace_cost=db_diag.estimated_replace_cost,
        economic_recommendation=db_diag.economic_recommendation,
        warranty_detected=db_diag.warranty_detected,
        warranty_notes=db_diag.warranty_notes,
        created_at=db_diag.created_at
    )

@router.post("/calculate-cost", response_model=CostCalculatorResponse)
async def calculate_cost(payload: CostCalculatorRequest):
    """
    Computes interactive Repair vs. Replace economic recommendation
    using depreciation curves and 50% rule.
    """
    res = ai_vision_service.calculate_cost_matrix(
        appliance_age_years=payload.appliance_age_years,
        original_purchase_price=payload.original_purchase_price,
        estimated_repair_cost=payload.estimated_repair_cost,
        new_replacement_cost=payload.new_replacement_cost,
        appliance_type=payload.appliance_type
    )
    return CostCalculatorResponse(**res)

@router.get("/voice-samples")
async def get_voice_samples(language: str = "en"):
    """
    Returns pre-recorded vernacular speech samples and transcriptions for voice notes.
    """
    samples = []
    for i in range(4):
        t = speech_service.transcribe_audio(language=language, sample_index=i)
        samples.append(t)
    return {"language": language, "samples": samples}
