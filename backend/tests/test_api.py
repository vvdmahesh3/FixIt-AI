import asyncio
import sys
from app.seed_data import seed_database
from app.services.ai_vision_service import ai_vision_service

async def run_tests():
    print("Running FixIt AI Core Tests...")
    await seed_database()
    
    # 1. Test diagnosis heuristic
    res = ai_vision_service.diagnose_media("geyser_sparking.jpg", "small sparks from switch", "en")
    assert res["severity"] == "High", f"Expected High severity for geyser sparks, got {res['severity']}"
    assert res["safe_to_touch"] is False
    print("[PASS] Test 1: High severity safety triage passed.")
    
    # 2. Test Low severity for tap leak
    res2 = ai_vision_service.diagnose_media("kitchen_sink_leak.jpg", "water dripping", "en")
    assert res2["severity"] == "Low", f"Expected Low severity for sink leak, got {res2['severity']}"
    assert res2["safe_to_touch"] is True
    print("[PASS] Test 2: Low severity DIY triage passed.")
    
    # 3. Test Cost matrix
    calc = ai_vision_service.calculate_cost_matrix(
        appliance_age_years=3.0,
        original_purchase_price=35000,
        estimated_repair_cost=1200,
        new_replacement_cost=38000,
        appliance_type="AC"
    )
    assert calc["is_repair_economical"] is True
    assert calc["verdict"] == "Repair"
    print("[PASS] Test 3: Economic Repair-vs-Replace math passed.")
    
    # 4. Test Triage dynamic escalation
    updated = ai_vision_service.process_triage_answers(res2, "plumb_odor", "Yes, burning plastic smell")
    assert updated["severity"] == "High"
    print("[PASS] Test 4: Dynamic triage escalation passed.")
    
    print("\nALL CORE BACKEND TESTS PASSED SUCCESSFULLY! OK")

if __name__ == "__main__":
    asyncio.run(run_tests())
