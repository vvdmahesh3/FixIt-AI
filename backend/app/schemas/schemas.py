from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Diagnosis Schemas ---
class BoundingBox(BaseModel):
    ymin: float = 0.1
    xmin: float = 0.1
    ymax: float = 0.9
    xmax: float = 0.9
    label: str = "Defect area"

class FollowUpQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    hint: Optional[str] = None

class DiagnosisBase(BaseModel):
    appliance_type: str
    detected_brand: Optional[str] = None
    detected_issue: str
    severity: str # "Low", "Medium", "High"
    confidence: float
    summary: str
    safe_to_touch: bool
    diy_steps: List[str]
    tools_needed: List[str]
    safety_warnings: List[str]
    follow_up_questions: List[FollowUpQuestion]
    user_answers: Dict[str, str] = {}
    estimated_repair_cost_min: float
    estimated_repair_cost_max: float
    estimated_replace_cost: float
    economic_recommendation: str
    warranty_detected: bool = False
    warranty_notes: Optional[str] = None

class DiagnosisResponse(DiagnosisBase):
    id: int
    user_id: Optional[int] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    voice_language: str = "en"
    bounding_box: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

class TriageAnswerRequest(BaseModel):
    question_id: str
    answer: str

class CostCalculatorRequest(BaseModel):
    appliance_age_years: float = 3.0
    original_purchase_price: float = 35000.0
    estimated_repair_cost: float = 1200.0
    new_replacement_cost: float = 38000.0
    appliance_type: str = "Split AC"

class CostCalculatorResponse(BaseModel):
    repair_cost_percentage_of_new: float
    depreciated_current_value: float
    is_repair_economical: bool
    verdict: str
    recommendation_title: str
    recommendation_detail: str
    estimated_lifespan_remaining_years: float

# --- Technician Schemas ---
class TechnicianBase(BaseModel):
    name: str
    phone: str
    category: str
    experience_years: int
    rating: float
    reviews_count: int
    hourly_rate_inr: float
    lat: float
    lng: float
    is_available: bool
    is_verified: bool
    badge: str
    bio: str
    avatar_url: Optional[str] = None

class TechnicianResponse(TechnicianBase):
    id: int
    lead_wallet_balance_inr: float
    distance_km: Optional[float] = 1.5

    class Config:
        from_attributes = True

# --- Service Request Schemas ---
class ServiceRequestCreate(BaseModel):
    diagnosis_id: Optional[int] = None
    customer_name: str = "Mahesh Peruri"
    customer_phone: str = "+91 98765 43210"
    customer_address: str = "Skyline Towers, Flat 402, Hitec City, Hyderabad"
    apartment_complex: str = "Skyline Towers"
    category: str
    issue_title: str
    severity: str = "Medium"
    preferred_technician_id: Optional[int] = None

class ServiceRequestStatusUpdate(BaseModel):
    status: str # "assigned", "en_route", "in_progress", "resolved", "cancelled"
    technician_lat: Optional[float] = None
    technician_lng: Optional[float] = None
    eta_minutes: Optional[int] = None

class ServiceRequestRating(BaseModel):
    rating: int = Field(ge=1, le=5)
    review_text: Optional[str] = None
    parts_replaced: Optional[str] = None
    final_cost: Optional[float] = None
    before_image_url: Optional[str] = None
    after_image_url: Optional[str] = None

class ChatMessageCreate(BaseModel):
    sender_type: str = "customer" # "customer", "technician"
    sender_name: str = "Customer"
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    service_request_id: int
    sender_type: str
    sender_name: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

class ServiceRequestResponse(BaseModel):
    id: int
    diagnosis_id: Optional[int] = None
    customer_name: str
    customer_phone: str
    customer_address: str
    apartment_complex: str
    category: str
    issue_title: str
    severity: str
    estimated_cost: float
    status: str
    technician_id: Optional[int] = None
    technician: Optional[TechnicianResponse] = None
    technician_lat: float
    technician_lng: float
    eta_minutes: int
    distance_km: float
    rating: Optional[int] = None
    review_text: Optional[str] = None
    before_image_url: Optional[str] = None
    after_image_url: Optional[str] = None
    parts_replaced: Optional[str] = None
    final_cost: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Warranty Schemas ---
class WarrantyCreate(BaseModel):
    appliance_type: str
    brand: str
    model_number: Optional[str] = None
    purchase_date: str # YYYY-MM-DD
    warranty_duration_months: int = 24
    retailer_name: str = "Croma Electronics"
    authorized_center_phone: str = "1800-419-0000"

class WarrantyResponse(BaseModel):
    id: int
    appliance_type: str
    brand: str
    model_number: Optional[str] = None
    purchase_date: str
    warranty_duration_months: int
    expiry_date: str
    invoice_image_url: Optional[str] = None
    retailer_name: str
    status: str # "active", "expired"
    authorized_center_phone: str
    days_remaining: int
    is_under_warranty: bool

    class Config:
        from_attributes = True

# --- Community Fault Schemas ---
class CommunityFaultResponse(BaseModel):
    id: int
    apartment_complex: str
    locality: str
    appliance_type: str
    fault_category: str
    severity: str
    report_count: int
    alert_active: bool
    alert_message: Optional[str] = None
    root_cause_hint: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Billing Schemas ---
class HouseholdTierUpgradeRequest(BaseModel):
    target_tier: str = "pro" # "pro"

class TechnicianWalletTopupRequest(BaseModel):
    technician_id: int
    amount_inr: float = 1000.0

class BillingTransactionResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    technician_id: Optional[int] = None
    transaction_type: str
    amount_inr: float
    status: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True
