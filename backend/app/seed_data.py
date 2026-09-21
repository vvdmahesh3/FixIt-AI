import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, Base, engine
from app.models.models import User, Technician, CommunityFault, Warranty, ServiceRequest

SAMPLE_TECHNICIANS = [
    {
        "name": "Ramesh Sharma",
        "phone": "+91 98490 11223",
        "category": "AC & HVAC",
        "experience_years": 8,
        "rating": 4.9,
        "reviews_count": 86,
        "hourly_rate_inr": 550.0,
        "lat": 17.4495,
        "lng": 78.3740,
        "is_available": True,
        "is_verified": True,
        "lead_wallet_balance_inr": 2400.0,
        "badge": "Master HVAC Certified",
        "bio": "Voltas & Daikin authorized specialist. 8 years expertise in inverter PCB diagnosis, gas recovery & compressor overhauls.",
        "avatar_url": "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80"
    },
    {
        "name": "Kiran Kumar Varma",
        "phone": "+91 97011 44556",
        "category": "Electrician",
        "experience_years": 6,
        "rating": 4.8,
        "reviews_count": 64,
        "hourly_rate_inr": 400.0,
        "lat": 17.4460,
        "lng": 78.3780,
        "is_available": True,
        "is_verified": True,
        "lead_wallet_balance_inr": 1800.0,
        "badge": "FixIt Verified Electrician",
        "bio": "Licensed electrical technician specializing in short circuits, MCB trip detection, geysers, and concealed home wiring.",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    {
        "name": "Mohammed Farooq",
        "phone": "+91 99887 77665",
        "category": "Plumber",
        "experience_years": 10,
        "rating": 4.9,
        "reviews_count": 112,
        "hourly_rate_inr": 450.0,
        "lat": 17.4420,
        "lng": 78.3820,
        "is_available": True,
        "is_verified": True,
        "lead_wallet_balance_inr": 1950.0,
        "badge": "Master Plumber Pro",
        "bio": "High-rise apartment plumbing expert. Specialized in hidden wall seepages, P-traps, pressure pumps, and CP fittings.",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    {
        "name": "Suresh Reddy",
        "phone": "+91 94401 22334",
        "category": "Appliance Repair",
        "experience_years": 7,
        "rating": 4.7,
        "reviews_count": 53,
        "hourly_rate_inr": 500.0,
        "lat": 17.4520,
        "lng": 78.3700,
        "is_available": True,
        "is_verified": True,
        "lead_wallet_balance_inr": 1400.0,
        "badge": "Appliance Specialist",
        "bio": "Expert in refrigerators, front-load washing machines, microwaves, and RO water purifiers.",
        "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
    }
]

SAMPLE_COMMUNITY_FAULTS = [
    {
        "apartment_complex": "Skyline Towers, Hitec City",
        "locality": "Hitec City Phase 2",
        "appliance_type": "Inverter AC",
        "fault_category": "PCB Capacitor Burnout",
        "severity": "High",
        "report_count": 4,
        "alert_active": True,
        "alert_message": "CRITICAL POWER SURGE DETECTED: 4 apartments in Tower B reported blown AC inverter PCBs within 48 hours.",
        "root_cause_hint": "Likely grid phase imbalance or 260V transient spike on Tower B distribution riser. Advise all residents to install voltage stabilizers."
    },
    {
        "apartment_complex": "Cyber Meadows Gated Enclave",
        "locality": "Kondapur",
        "appliance_type": "Kitchen Plumbing",
        "fault_category": "Low Water Pressure / Filter Clog",
        "severity": "Low",
        "report_count": 3,
        "alert_active": False,
        "alert_message": "Hard water calcium scale clogging aerator screens across Block C.",
        "root_cause_hint": "Society overhead tank filtration cycle was delayed."
    }
]

async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        # Check if users already seeded
        res = await session.execute(select(User).where(User.id == 1))
        user = res.scalar_one_or_none()
        if not user:
            user = User(
                id=1,
                name="Mahesh Peruri",
                email="mahesh@fixit.ai",
                phone="+91 98765 43210",
                apartment_complex="Skyline Towers, Hitec City",
                apartment_unit="Tower B - 402",
                subscription_tier="free",
                diagnoses_used_this_month=1
            )
            session.add(user)
            
        # Check technicians
        t_res = await session.execute(select(Technician))
        existing_techs = t_res.scalars().all()
        if not existing_techs:
            for t_data in SAMPLE_TECHNICIANS:
                tech = Technician(**t_data)
                session.add(tech)
                
        # Check community faults
        c_res = await session.execute(select(CommunityFault))
        existing_faults = c_res.scalars().all()
        if not existing_faults:
            for f_data in SAMPLE_COMMUNITY_FAULTS:
                fault = CommunityFault(**f_data)
                session.add(fault)
                
        # Check warranties
        w_res = await session.execute(select(Warranty))
        existing_warranties = w_res.scalars().all()
        if not existing_warranties:
            w1 = Warranty(
                user_id=1,
                appliance_type="Split Air Conditioner",
                brand="Voltas",
                model_number="VOLTAS-INV-153V",
                purchase_date="2025-05-10",
                warranty_duration_months=24,
                expiry_date="2027-05-10",
                retailer_name="Croma Inorbit Mall",
                status="active",
                authorized_center_phone="1860-599-4555"
            )
            session.add(w1)
            
        await session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())
