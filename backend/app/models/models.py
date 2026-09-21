import datetime
import json
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="Guest Resident")
    email = Column(String(100), nullable=True)
    phone = Column(String(20), default="+91 98765 43210")
    apartment_complex = Column(String(150), default="Skyline Towers, Hitec City")
    apartment_unit = Column(String(50), default="Tower B - 402")
    subscription_tier = Column(String(20), default="free") # "free", "pro"
    diagnoses_used_this_month = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    diagnoses = relationship("Diagnosis", back_populates="user")
    service_requests = relationship("ServiceRequest", back_populates="user")


class Technician(Base):
    __tablename__ = "technicians"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    category = Column(String(50), nullable=False) # Electrician, Plumber, AC & HVAC, Appliance Repair
    experience_years = Column(Integer, default=5)
    rating = Column(Float, default=4.8)
    reviews_count = Column(Integer, default=42)
    hourly_rate_inr = Column(Float, default=450.0)
    lat = Column(Float, default=17.4485) # Hyderabad sample lat
    lng = Column(Float, default=78.3750) # Hyderabad sample lng
    is_available = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    lead_wallet_balance_inr = Column(Float, default=1500.0)
    avatar_url = Column(String(255), nullable=True)
    badge = Column(String(50), default="FixIt Verified Pro")
    bio = Column(Text, default="Expert technician with verified background check and 500+ fixes completed.")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    service_requests = relationship("ServiceRequest", back_populates="technician")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    image_url = Column(String(255), nullable=True)
    audio_url = Column(String(255), nullable=True)
    voice_language = Column(String(10), default="en") # en, hi, te
    appliance_type = Column(String(100), nullable=False)
    detected_brand = Column(String(100), nullable=True)
    detected_issue = Column(String(255), nullable=False)
    severity = Column(String(20), nullable=False) # Low, Medium, High
    confidence = Column(Float, default=0.92)
    bounding_box = Column(Text, default="{}") # JSON: {ymin, xmin, ymax, xmax, label}
    summary = Column(Text, nullable=False)
    safe_to_touch = Column(Boolean, default=False)
    diy_steps = Column(Text, default="[]") # JSON list of strings
    tools_needed = Column(Text, default="[]") # JSON list of strings
    safety_warnings = Column(Text, default="[]") # JSON list of strings
    follow_up_questions = Column(Text, default="[]") # JSON list of {id, question, options}
    user_answers = Column(Text, default="{}") # JSON dict of {question_id: answer}
    estimated_repair_cost_min = Column(Float, default=500.0)
    estimated_repair_cost_max = Column(Float, default=1200.0)
    estimated_replace_cost = Column(Float, default=15000.0)
    economic_recommendation = Column(String(50), default="Repair Recommended")
    warranty_detected = Column(Boolean, default=False)
    warranty_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="diagnoses")
    service_request = relationship("ServiceRequest", back_populates="diagnosis", uselist=False)


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, index=True)
    diagnosis_id = Column(Integer, ForeignKey("diagnoses.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_name = Column(String(100), default="Mahesh Peruri")
    customer_phone = Column(String(20), default="+91 98765 43210")
    customer_address = Column(String(255), default="Skyline Towers, Flat 402, Hitec City, Hyderabad")
    apartment_complex = Column(String(150), default="Skyline Towers")
    category = Column(String(50), nullable=False)
    issue_title = Column(String(255), nullable=False)
    severity = Column(String(20), default="Medium")
    estimated_cost = Column(Float, default=850.0)
    
    # Status Pipeline: pending -> assigned -> en_route -> in_progress -> resolved -> cancelled
    status = Column(String(30), default="pending")
    technician_id = Column(Integer, ForeignKey("technicians.id"), nullable=True)
    technician_lat = Column(Float, default=17.4485)
    technician_lng = Column(Float, default=78.3750)
    eta_minutes = Column(Integer, default=18)
    distance_km = Column(Float, default=2.4)
    
    rating = Column(Integer, nullable=True)
    review_text = Column(Text, nullable=True)
    before_image_url = Column(String(255), nullable=True)
    after_image_url = Column(String(255), nullable=True)
    parts_replaced = Column(String(255), nullable=True)
    final_cost = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    diagnosis = relationship("Diagnosis", back_populates="service_request")
    user = relationship("User", back_populates="service_requests")
    technician = relationship("Technician", back_populates="service_requests")
    chat_messages = relationship("ChatMessage", back_populates="service_request", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    service_request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False)
    sender_type = Column(String(20), nullable=False) # "customer", "technician", "system"
    sender_name = Column(String(100), default="Technician")
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    service_request = relationship("ServiceRequest", back_populates="chat_messages")


class Warranty(Base):
    __tablename__ = "warranties"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    appliance_type = Column(String(100), nullable=False)
    brand = Column(String(100), nullable=False)
    model_number = Column(String(100), nullable=True)
    purchase_date = Column(String(30), nullable=False)
    warranty_duration_months = Column(Integer, default=24)
    expiry_date = Column(String(30), nullable=False)
    invoice_image_url = Column(String(255), nullable=True)
    retailer_name = Column(String(100), default="Croma Electronics")
    status = Column(String(20), default="active") # "active", "expired"
    authorized_center_phone = Column(String(30), default="1800-419-0000")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class CommunityFault(Base):
    __tablename__ = "community_faults"

    id = Column(Integer, primary_key=True, index=True)
    apartment_complex = Column(String(150), nullable=False)
    locality = Column(String(100), default="Hitec City, Hyderabad")
    appliance_type = Column(String(100), nullable=False)
    fault_category = Column(String(100), nullable=False)
    severity = Column(String(20), default="Medium")
    report_count = Column(Integer, default=1)
    alert_active = Column(Boolean, default=False)
    alert_message = Column(Text, nullable=True)
    root_cause_hint = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class BillingTransaction(Base):
    __tablename__ = "billing_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    technician_id = Column(Integer, ForeignKey("technicians.id"), nullable=True)
    transaction_type = Column(String(50), nullable=False) # "household_pro_subscription", "technician_lead_fee", "wallet_topup"
    amount_inr = Column(Float, nullable=False)
    status = Column(String(20), default="succeeded")
    description = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
