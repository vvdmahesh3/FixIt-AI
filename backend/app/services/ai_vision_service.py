import json
import os
import re
import base64
import traceback
import requests
from typing import Dict, Any, List, Optional
from pathlib import Path
from app.core.config import settings

# Rich domain knowledge catalog for home appliances and fixtures (FALLBACK ENGINE)
FAULT_CATALOG = {
    "ac": {
        "appliance_type": "Split Air Conditioner",
        "default_brand": "Voltas / Daikin",
        "issues": {
            "rattling": {
                "issue": "Blower Fan Vibration & Dust Clog",
                "severity": "Medium",
                "safe_to_touch": True,
                "summary": "The rattling vibration indicates loose indoor blower bearings or foreign object trapped in the filter mesh.",
                "bounding_box": {"ymin": 0.25, "xmin": 0.20, "ymax": 0.70, "xmax": 0.82, "label": "Indoor Blower Mesh & Coil"},
                "diy_steps": [
                    "Power down the AC from the dedicated MCB switch.",
                    "Gently flip open the front panel and remove both nylon dust filters.",
                    "Wash filters under running lukewarm water and dry completely.",
                    "Check if the blower barrel rotates freely without wobble."
                ],
                "tools_needed": ["Microfiber cloth", "Mild dish soap", "Step ladder"],
                "safety_warnings": ["Always cut 240V power before opening the front shroud.", "Do not touch sharp evaporator aluminum fins."],
                "repair_min": 600,
                "repair_max": 1200,
                "replace_cost": 38000,
                "follow_ups": [
                    {"id": "ac_age", "question": "How old is this AC unit?", "options": ["Under 2 years", "3 to 5 years", "Over 6 years"]},
                    {"id": "ac_smell", "question": "Do you notice any burning or chemical smell?", "options": ["No smell", "Dusty / musty smell", "Sharp burning plastic smell"]},
                    {"id": "ac_cooling", "question": "Is the unit blowing cool air or room-temperature air?", "options": ["Blowing chilled air normally", "Blowing room-temperature air", "Ice buildup visible on copper pipe"]}
                ]
            },
            "warm_air": {
                "issue": "Refrigerant Gas Leakage / Compressor Run Capacitor",
                "severity": "Medium",
                "safe_to_touch": False,
                "summary": "AC blower runs but air is warm. Likely depleted R32/R410A refrigerant charge or a failed starting capacitor on the outdoor compressor unit.",
                "bounding_box": {"ymin": 0.30, "xmin": 0.25, "ymax": 0.75, "xmax": 0.75, "label": "Compressor Valve Assembly"},
                "diy_steps": [
                    "Check if outdoor condenser unit fan is spinning.",
                    "Inspect indoor filter for severe blockage preventing airflow.",
                    "Do NOT attempt to pierce or patch pressurized refrigerant copper lines."
                ],
                "tools_needed": ["Visual flashlight inspection only"],
                "safety_warnings": ["Refrigerant gas is pressurized up to 450 PSI. Direct contact causes cryogenic skin burns."],
                "repair_min": 1800,
                "repair_max": 3400,
                "replace_cost": 38000,
                "follow_ups": [
                    {"id": "ac_age", "question": "How old is this AC unit?", "options": ["Under 2 years", "3 to 5 years", "Over 6 years"]},
                    {"id": "ac_smell", "question": "Any hissing sound from the indoor or outdoor unit?", "options": ["No sound", "Continuous faint hissing sound", "Loud buzzing buzz"]},
                    {"id": "ac_ice", "question": "Is there frost or ice frost visible on the thin copper pipe outside?", "options": ["No ice", "Yes, thick white frost visible"]}
                ]
            }
        }
    },
    "geyser": {
        "appliance_type": "Electric Water Heater / Geyser",
        "default_brand": "AO Smith / Havells",
        "issues": {
            "sparking": {
                "issue": "Thermostat Short Circuit & Ground Fault Sparking",
                "severity": "High",
                "safe_to_touch": False,
                "summary": "DANGER: Visible sparks or scorched terminal block at the geyser power entry. Severe risk of 240V electrocution or electrical fire!",
                "bounding_box": {"ymin": 0.35, "xmin": 0.40, "ymax": 0.85, "xmax": 0.78, "label": "Scorched Power Terminal & Thermostat"},
                "diy_steps": [
                    "CRITICAL: Do NOT touch the geyser casing or bathroom plumbing pipes!",
                    "Immediately switch OFF the Geyser MCB breaker on your main electrical distribution box.",
                    "Keep water taps shut to avoid ground leakage through wet tiles.",
                    "Do NOT attempt DIY repair — high voltage combined with water is lethal."
                ],
                "tools_needed": ["Main breaker switch only"],
                "safety_warnings": ["HIGH RISK: Lethal electric shock hazard. Cut main power immediately.", "Never use a geyser with faulty grounding."],
                "repair_min": 950,
                "repair_max": 1800,
                "replace_cost": 9500,
                "follow_ups": [
                    {"id": "geyser_tripped", "question": "Did the MCB or RCCB trip immediately when sparks occurred?", "options": ["Yes, breaker tripped automatically", "No, breaker remained ON until manually switched off"]},
                    {"id": "geyser_leak", "question": "Is there any water dripping down the electrical wire casing?", "options": ["Dry casing", "Yes, water dripping near wire gland"]},
                    {"id": "geyser_age", "question": "Approximate age of the geyser?", "options": ["Less than 2 years", "3 to 6 years", "More than 7 years"]}
                ]
            }
        }
    },
    "plumbing": {
        "appliance_type": "Kitchen Sink Drain & P-Trap",
        "default_brand": "Jaquar / Astral PVC",
        "issues": {
            "leak": {
                "issue": "Degraded P-Trap Slip-Joint Washer & Thread Leak",
                "severity": "Low",
                "safe_to_touch": True,
                "summary": "Continuous dripping from the PVC threaded union under the sink bowl during drain discharge. Safe for simple DIY gasket reseating.",
                "bounding_box": {"ymin": 0.42, "xmin": 0.32, "ymax": 0.82, "xmax": 0.65, "label": "P-Trap Union Nut & Rubber Washer"},
                "diy_steps": [
                    "Place a plastic bucket or towel directly below the curved P-trap.",
                    "Turn the large threaded collar nut counter-clockwise by hand or with channel locks.",
                    "Inspect the black rubber/beveled silicone washer for tears or calcified grime.",
                    "Clean threads, wrap 3 turns of Teflon PTFE tape clockwise, and hand-tighten firmly."
                ],
                "tools_needed": ["Bucket", "PTFE Thread Seal Tape", "Channel lock pliers", "Dry rag"],
                "safety_warnings": ["Avoid chemical drain cleaners immediately before taking apart trap — caustic splash hazard."],
                "repair_min": 250,
                "repair_max": 450,
                "replace_cost": 1500,
                "follow_ups": [
                    {"id": "plumb_frequency", "question": "When does the drip occur?", "options": ["Only when tap is running and sink drains", "Constantly even when no water is running in the house", "Only when dishwasher empties"]},
                    {"id": "plumb_odor", "question": "Is there sewer gas or foul odor coming from under the sink?", "options": ["No foul smell", "Yes, strong sewer odor"]},
                    {"id": "plumb_crack", "question": "Is the PVC pipe itself cracked, or is water oozing from the joint?", "options": ["Oozing from the joint ring", "Hairline crack visible on the plastic pipe body"]}
                ]
            }
        }
    },
    "fridge": {
        "appliance_type": "Frost-Free Refrigerator",
        "default_brand": "LG / Samsung Inverter",
        "issues": {
            "noise": {
                "issue": "Evaporator Defrost Fan Blade Rubbing on Ice",
                "severity": "Medium",
                "safe_to_touch": True,
                "summary": "Grinding or buzzing noise from the freezer compartment that stops whenever the freezer door is opened. Indicates defrost drain blockage and frost buildup.",
                "bounding_box": {"ymin": 0.20, "xmin": 0.30, "ymax": 0.65, "xmax": 0.72, "label": "Freezer Evaporator Fan Duct"},
                "diy_steps": [
                    "Unplug the refrigerator from the wall outlet.",
                    "Move frozen items to a cooler box.",
                    "Leave freezer door open for 6-8 hours with towels beneath for a thorough manual thaw.",
                    "Plug back in; if noise returns within 48 hours, the defrost bi-metal heater or sensor needs technician replacement."
                ],
                "tools_needed": ["Towels", "Hair dryer on gentle low heat (keep 12 inches away)"],
                "safety_warnings": ["Never use sharp knives or screwdrivers to chip ice from freezer plastic walls — puncture hazard to evaporator coil."],
                "repair_min": 750,
                "repair_max": 1600,
                "replace_cost": 28000,
                "follow_ups": [
                    {"id": "fridge_door_stop", "question": "Does the buzzing/grinding sound immediately cut off when you open the freezer door?", "options": ["Yes, stops instantly when door opens", "No, keeps buzzing from behind the bottom of the fridge"]},
                    {"id": "fridge_cooling_status", "question": "Is the fresh food (bottom) compartment staying cold?", "options": ["Bottom compartment is warm", "Normal cold temperature everywhere"]},
                    {"id": "fridge_age", "question": "How old is this refrigerator?", "options": ["Under 3 years", "4 to 7 years", "8+ years"]}
                ]
            }
        }
    },
    "switch": {
        "appliance_type": "Electrical Socket / Power Switchboard",
        "default_brand": "Anchor Roma / Schneider",
        "issues": {
            "spark": {
                "issue": "Loose Terminal Arc & Melting Bakelite Socket",
                "severity": "High",
                "safe_to_touch": False,
                "summary": "DANGER: Arcing or black soot marks around the 16A plug pins. High risk of electrical arc flash and wall cavity fire!",
                "bounding_box": {"ymin": 0.30, "xmin": 0.35, "ymax": 0.75, "xmax": 0.70, "label": "Arcing Socket Faceplate & Scorch"},
                "diy_steps": [
                    "STOP: Do NOT plug or unplug any device into this socket.",
                    "Switch OFF the Room Power circuit breaker from your main distribution board.",
                    "Tape over the socket faceplate with insulation tape and leave a warning sign for other family members.",
                    "Have a certified electrician replace the socket receptacle and trim charred wire leads."
                ],
                "tools_needed": ["Main breaker switch", "Warning tape"],
                "safety_warnings": ["230V Arc flash can ignite curtains or wall paint within seconds.", "Loose neutral wires can backfeed dangerous voltage."],
                "repair_min": 350,
                "repair_max": 650,
                "replace_cost": 1200,
                "follow_ups": [
                    {"id": "switch_smell", "question": "Can you smell pungent fishy or burning plastic odor?", "options": ["Yes, strong burning smell", "Faint smell only right next to the plate", "No smell"]},
                    {"id": "switch_warm", "question": "Is the plastic faceplate hot to the touch?", "options": ["Noticeably hot or deformed", "Slightly warm", "Cool"]},
                    {"id": "switch_appliances", "question": "What high-power appliance was plugged into this socket?", "options": ["AC or Geyser (15A/16A)", "Microwave / Air Fryer", "Iron / Room Heater", "Mobile Charger"]}
                ]
            }
        }
    }
}


# ═══════════════════════════════════════════════════════════════════════════
# REAL-TIME HUGGING FACE INFERENCE API INTEGRATION
# ═══════════════════════════════════════════════════════════════════════════

HF_INFERENCE_URL = "https://api-inference.huggingface.co/models"

def _hf_headers():
    return {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}


def _caption_image_hf(image_bytes: bytes) -> Optional[str]:
    """Use BLIP image-captioning model to extract a textual description from a photo."""
    try:
        url = f"{HF_INFERENCE_URL}/{settings.HF_VISION_MODEL}"
        resp = requests.post(url, headers=_hf_headers(), data=image_bytes, timeout=30)
        if resp.status_code == 200:
            result = resp.json()
            if isinstance(result, list) and len(result) > 0:
                caption = result[0].get("generated_text", "")
                print(f"[HF VISION] Image caption: {caption}")
                return caption
        else:
            print(f"[HF VISION] Status {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        print(f"[HF VISION] Caption error: {e}")
    return None


def _llm_diagnose_hf(user_description: str, image_caption: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Call a real HuggingFace LLM (Mistral / Zephyr) with a structured prompt
    to produce a real-time AI diagnosis with severity, steps, and cost estimate.
    """
    context_parts = []
    if image_caption:
        context_parts.append(f"Image analysis shows: {image_caption}")
    if user_description:
        context_parts.append(f"User says: {user_description}")
    context = ". ".join(context_parts) if context_parts else "A household appliance issue"

    prompt = f"""<s>[INST] You are FixIt AI, an expert home appliance repair diagnostician for Indian households.

Given this input from a user who has a broken item at home:
{context}

Respond ONLY with valid JSON (no markdown, no explanation before or after) using exactly this structure:
{{
  "appliance_type": "<type of appliance, e.g. Split Air Conditioner, Electric Geyser, Kitchen Sink, Refrigerator, Electrical Socket>",
  "detected_brand": "<likely brand or 'Generic'>",
  "detected_issue": "<specific technical fault name>",
  "severity": "<Low or Medium or High>",
  "confidence": <float 0.80 to 0.98>,
  "summary": "<2-3 sentence expert explanation of what is likely wrong and why>",
  "safe_to_touch": <true or false>,
  "diy_steps": ["<step 1>", "<step 2>", "<step 3>", "<step 4>"],
  "tools_needed": ["<tool 1>", "<tool 2>"],
  "safety_warnings": ["<warning 1>", "<warning 2>"],
  "follow_up_questions": [
    {{"id": "q1", "question": "<triage question 1>", "options": ["<option a>", "<option b>", "<option c>"]}},
    {{"id": "q2", "question": "<triage question 2>", "options": ["<option a>", "<option b>"]}},
    {{"id": "q3", "question": "<triage question 3>", "options": ["<option a>", "<option b>", "<option c>"]}}
  ],
  "estimated_repair_cost_min": <int INR>,
  "estimated_repair_cost_max": <int INR>,
  "estimated_replace_cost": <int INR>,
  "economic_recommendation": "<one-line verdict>"
}}

Rules:
- severity High means danger, do NOT touch, call professional immediately
- severity Medium means safe to inspect but not to disassemble
- severity Low means safe DIY fix
- All costs should be realistic Indian market prices in INR
- safety_warnings should mention specific voltage or chemical hazards if applicable
- follow_up_questions should be the 1-3 most useful triage questions a real technician would ask over the phone
[/INST]"""

    try:
        url = f"{HF_INFERENCE_URL}/{settings.HF_TEXT_MODEL}"
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 900,
                "temperature": 0.3,
                "return_full_text": False,
                "do_sample": True
            }
        }
        resp = requests.post(url, headers=_hf_headers(), json=payload, timeout=45)
        
        if resp.status_code == 200:
            result = resp.json()
            generated = ""
            if isinstance(result, list) and len(result) > 0:
                generated = result[0].get("generated_text", "")
            elif isinstance(result, dict):
                generated = result.get("generated_text", "")

            print(f"[HF LLM] Raw response length: {len(generated)} chars")
            
            # Extract JSON from the response — find the first { ... } block
            json_match = re.search(r'\{[\s\S]*\}', generated)
            if json_match:
                raw_json = json_match.group(0)
                parsed = json.loads(raw_json)
                
                # Validate required fields exist
                required = ["appliance_type", "detected_issue", "severity", "summary"]
                if all(k in parsed for k in required):
                    # Normalize severity
                    sev = str(parsed.get("severity", "Medium")).strip().capitalize()
                    if sev not in ("Low", "Medium", "High"):
                        sev = "Medium"
                    parsed["severity"] = sev
                    
                    # Ensure numeric fields
                    parsed["confidence"] = float(parsed.get("confidence", 0.88))
                    parsed["estimated_repair_cost_min"] = float(parsed.get("estimated_repair_cost_min", 500))
                    parsed["estimated_repair_cost_max"] = float(parsed.get("estimated_repair_cost_max", 1500))
                    parsed["estimated_replace_cost"] = float(parsed.get("estimated_replace_cost", 15000))
                    
                    # Ensure list fields
                    for list_field in ["diy_steps", "tools_needed", "safety_warnings"]:
                        if not isinstance(parsed.get(list_field), list):
                            parsed[list_field] = []
                    
                    # Ensure follow_up_questions is well-formed
                    fqs = parsed.get("follow_up_questions", [])
                    if not isinstance(fqs, list):
                        fqs = []
                    valid_fqs = []
                    for fq in fqs:
                        if isinstance(fq, dict) and "id" in fq and "question" in fq and "options" in fq:
                            valid_fqs.append(fq)
                    parsed["follow_up_questions"] = valid_fqs if valid_fqs else [
                        {"id": "q_age", "question": "How old is this appliance?", "options": ["Under 2 years", "3-5 years", "Over 6 years"]},
                        {"id": "q_smell", "question": "Any burning or unusual smell?", "options": ["No smell", "Mild smell", "Strong burning smell"]},
                        {"id": "q_sound", "question": "Any unusual sounds?", "options": ["No sound", "Clicking noise", "Grinding noise", "Buzzing"]}
                    ]
                    
                    # Ensure bool fields
                    parsed["safe_to_touch"] = bool(parsed.get("safe_to_touch", True))
                    
                    # Add defaults for missing fields
                    parsed.setdefault("detected_brand", "Generic / OEM")
                    parsed.setdefault("bounding_box", {"ymin": 0.25, "xmin": 0.20, "ymax": 0.75, "xmax": 0.80, "label": "Detected Fault Zone"})
                    parsed.setdefault("user_answers", {})
                    parsed.setdefault("warranty_detected", False)
                    parsed.setdefault("warranty_notes", "Upload purchase invoice to check warranty coverage.")
                    if "economic_recommendation" not in parsed:
                        r_avg = (parsed["estimated_repair_cost_min"] + parsed["estimated_repair_cost_max"]) / 2
                        ratio = r_avg / max(1, parsed["estimated_replace_cost"]) * 100
                        parsed["economic_recommendation"] = f"Repair Recommended ({ratio:.0f}% of replacement)" if ratio < 40 else "Consider Replacement"
                    
                    print(f"[HF LLM] Successfully parsed AI diagnosis: {parsed['detected_issue']} [{parsed['severity']}]")
                    return parsed
                else:
                    print(f"[HF LLM] Missing required fields in parsed JSON. Found keys: {list(parsed.keys())}")
            else:
                print(f"[HF LLM] No JSON block found in response. First 300 chars: {generated[:300]}")
        
        elif resp.status_code == 503:
            # Model is loading — HF returns 503 with estimated_time
            body = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
            wait_time = body.get("estimated_time", 20)
            print(f"[HF LLM] Model loading, est wait: {wait_time}s. Falling back to heuristics.")
        else:
            print(f"[HF LLM] HTTP {resp.status_code}: {resp.text[:300]}")
            
    except json.JSONDecodeError as je:
        print(f"[HF LLM] JSON parse error: {je}")
    except Exception as e:
        print(f"[HF LLM] Unexpected error: {e}")
        traceback.print_exc()
    
    return None


def _llm_triage_hf(diagnosis_summary: str, question: str, answer: str) -> Optional[Dict[str, Any]]:
    """
    Use the LLM to re-evaluate severity after a triage answer.
    Returns updated severity, summary addition, and any new safety warnings.
    """
    prompt = f"""<s>[INST] You are FixIt AI safety triage system. A home repair diagnosis was done:

Diagnosis: {diagnosis_summary}

The user answered a follow-up question:
Q: {question}
A: {answer}

Based on this new information, respond ONLY with valid JSON:
{{
  "severity_change": "<same or escalate_to_high or escalate_to_medium or de_escalate_to_low>",
  "new_severity": "<Low or Medium or High>",
  "safe_to_touch": <true or false>,
  "additional_warning": "<one new safety warning if severity increased, or empty string>",
  "summary_update": "<one sentence update to append to the diagnosis based on the new info>"
}}
[/INST]"""

    try:
        url = f"{HF_INFERENCE_URL}/{settings.HF_TEXT_MODEL}"
        payload = {
            "inputs": prompt,
            "parameters": {"max_new_tokens": 250, "temperature": 0.2, "return_full_text": False, "do_sample": True}
        }
        resp = requests.post(url, headers=_hf_headers(), json=payload, timeout=30)
        if resp.status_code == 200:
            result = resp.json()
            generated = ""
            if isinstance(result, list) and len(result) > 0:
                generated = result[0].get("generated_text", "")
            json_match = re.search(r'\{[\s\S]*?\}', generated)
            if json_match:
                parsed = json.loads(json_match.group(0))
                if "new_severity" in parsed:
                    return parsed
    except Exception as e:
        print(f"[HF TRIAGE] Error: {e}")
    return None


# ═══════════════════════════════════════════════════════════════════════════
# MAIN SERVICE CLASS
# ═══════════════════════════════════════════════════════════════════════════

class AIVisionService:
    def __init__(self):
        self.hf_key = settings.HUGGINGFACE_API_KEY
        self.use_live_ai = bool(self.hf_key and len(self.hf_key) > 10)
        if self.use_live_ai:
            print(f"[FixIt AI] HuggingFace API key loaded (***{self.hf_key[-4:]}). LIVE AI mode enabled.")
        else:
            print("[FixIt AI] No HF API key found. Using offline heuristic engine only.")
    
    def diagnose_media(self, filename: str, note_text: str = "", language: str = "en",
                       image_bytes: Optional[bytes] = None) -> Dict[str, Any]:
        """
        Analyzes image/video along with user voice note/text to diagnose problem.
        
        Pipeline:
        1. If image bytes are provided, run BLIP vision captioning via HF API
        2. Send combined context (image caption + user description) to Mistral LLM
        3. Parse structured JSON diagnosis
        4. If any step fails, gracefully fall back to the deterministic heuristic engine
        """
        
        # ─── STEP 1: Try LIVE AI diagnosis via HuggingFace ───
        if self.use_live_ai:
            print(f"[FixIt AI] Running LIVE AI diagnosis for: '{filename}' | note: '{note_text[:80]}...'")
            
            # Optional: Caption the image if raw bytes were provided
            image_caption = None
            if image_bytes and len(image_bytes) > 100:
                image_caption = _caption_image_hf(image_bytes)
            
            # Build user description from filename hints + voice note text
            user_desc_parts = []
            if note_text and note_text.strip():
                user_desc_parts.append(note_text.strip())
            if filename:
                # Extract meaningful keywords from preset filenames
                clean_name = filename.replace("_", " ").replace(".jpg", "").replace(".png", "").replace(".mp4", "")
                user_desc_parts.append(f"Photo filename context: {clean_name}")
            
            user_description = ". ".join(user_desc_parts)
            
            # Call the LLM for real-time AI diagnosis
            ai_result = _llm_diagnose_hf(user_description, image_caption)
            
            if ai_result:
                print(f"[FixIt AI] LIVE AI diagnosis SUCCESS: {ai_result['detected_issue']}")
                return ai_result
            else:
                print("[FixIt AI] Live AI returned no result, falling back to heuristic engine.")
        
        # ─── STEP 2: FALLBACK — Deterministic heuristic domain engine ───
        return self._heuristic_diagnose(filename, note_text)
    
    def _heuristic_diagnose(self, filename: str, note_text: str = "") -> Dict[str, Any]:
        """Offline heuristic engine using FAULT_CATALOG keyword matching."""
        text_lower = (filename + " " + note_text).lower()
        
        matched_cat = None
        matched_issue_key = None
        
        if any(k in text_lower for k in ["ac", "air condition", "cooling", "condenser", "blower", "compressor"]):
            matched_cat = "ac"
            if any(k in text_lower for k in ["warm", "not cool", "hot", "gas", "refrigerant"]):
                matched_issue_key = "warm_air"
            else:
                matched_issue_key = "rattling"
        elif any(k in text_lower for k in ["geyser", "water heater", "heater", "hot water", "spark"]):
            matched_cat = "geyser"
            matched_issue_key = "sparking"
        elif any(k in text_lower for k in ["sink", "pipe", "tap", "drain", "leak", "plumb", "p-trap", "faucet"]):
            matched_cat = "plumbing"
            matched_issue_key = "leak"
        elif any(k in text_lower for k in ["fridge", "refrigerator", "freezer", "grinding", "whirring", "buzzing"]):
            matched_cat = "fridge"
            matched_issue_key = "noise"
        elif any(k in text_lower for k in ["switch", "socket", "plug", "sparking", "burnt", "electric", "mcb"]):
            matched_cat = "switch"
            matched_issue_key = "spark"
        else:
            matched_cat = "ac"
            matched_issue_key = "rattling"

        cat_data = FAULT_CATALOG[matched_cat]
        issue_data = cat_data["issues"][matched_issue_key]
        
        repair_avg = (issue_data["repair_min"] + issue_data["repair_max"]) / 2
        replace_val = issue_data["replace_cost"]
        ratio = (repair_avg / replace_val) * 100
        
        if issue_data["severity"] == "Low":
            econ_rec = "Safe DIY Fix Recommended (Cost ~INR {})".format(int(repair_avg))
        elif ratio < 25:
            econ_rec = f"Repair Recommended (Cost is only {ratio:.1f}% of replacement)"
        else:
            econ_rec = "Consider Replacement if Appliance > 7 Years Old"

        return {
            "appliance_type": cat_data["appliance_type"],
            "detected_brand": cat_data["default_brand"],
            "detected_issue": issue_data["issue"],
            "severity": issue_data["severity"],
            "confidence": 0.94,
            "summary": issue_data["summary"],
            "safe_to_touch": issue_data["safe_to_touch"],
            "bounding_box": issue_data["bounding_box"],
            "diy_steps": issue_data["diy_steps"],
            "tools_needed": issue_data["tools_needed"],
            "safety_warnings": issue_data["safety_warnings"],
            "follow_up_questions": issue_data["follow_ups"],
            "user_answers": {},
            "estimated_repair_cost_min": float(issue_data["repair_min"]),
            "estimated_repair_cost_max": float(issue_data["repair_max"]),
            "estimated_replace_cost": float(issue_data["replace_cost"]),
            "economic_recommendation": econ_rec,
            "warranty_detected": False,
            "warranty_notes": "Upload appliance purchase invoice to verify remaining warranty and free manufacturer coverage."
        }

    def process_triage_answers(self, diagnosis_dict: Dict[str, Any], question_id: str, answer: str) -> Dict[str, Any]:
        """
        Updates diagnosis based on multi-turn triage answers.
        Tries live AI re-evaluation first, then falls back to rule-based escalation.
        """
        answers = diagnosis_dict.get("user_answers", {})
        answers[question_id] = answer
        diagnosis_dict["user_answers"] = answers
        
        # ─── Try LIVE AI triage re-evaluation ───
        if self.use_live_ai:
            # Find the original question text for context
            q_text = question_id  # fallback
            fqs = diagnosis_dict.get("follow_up_questions", [])
            if isinstance(fqs, list):
                for fq in fqs:
                    if isinstance(fq, dict) and fq.get("id") == question_id:
                        q_text = fq.get("question", question_id)
                        break
            
            ai_triage = _llm_triage_hf(
                diagnosis_dict.get("summary", ""),
                q_text,
                answer
            )
            if ai_triage:
                new_sev = ai_triage.get("new_severity", diagnosis_dict["severity"])
                if new_sev in ("Low", "Medium", "High"):
                    diagnosis_dict["severity"] = new_sev
                diagnosis_dict["safe_to_touch"] = ai_triage.get("safe_to_touch", diagnosis_dict["safe_to_touch"])
                
                additional = ai_triage.get("additional_warning", "")
                if additional and additional.strip():
                    if additional not in diagnosis_dict.get("safety_warnings", []):
                        diagnosis_dict.setdefault("safety_warnings", []).insert(0, additional)
                
                update_text = ai_triage.get("summary_update", "")
                if update_text and update_text.strip():
                    diagnosis_dict["summary"] = diagnosis_dict.get("summary", "") + f" [AI Update: {update_text}]"
                
                if new_sev == "High":
                    diagnosis_dict["economic_recommendation"] = "DANGER: Professional Inspection Mandatory"
                
                print(f"[FixIt AI] Live triage update: severity={new_sev}")
                return diagnosis_dict
        
        # ─── FALLBACK: Rule-based safety escalation ───
        ans_lower = answer.lower()
        if any(h in ans_lower for h in ["burning", "plastic smell", "hissing", "crack visible", "hot or deformed", "ice buildup"]):
            if "burning" in ans_lower or "plastic smell" in ans_lower or "hot or deformed" in ans_lower:
                diagnosis_dict["severity"] = "High"
                diagnosis_dict["safe_to_touch"] = False
                if "CRITICAL SAFETY ALERT: Potential electrical fire hazard detected from triage answer!" not in diagnosis_dict.get("safety_warnings", []):
                    diagnosis_dict.setdefault("safety_warnings", []).insert(0, "CRITICAL SAFETY ALERT: Potential electrical fire hazard detected from triage answer! Cut power immediately.")
                diagnosis_dict["economic_recommendation"] = "DANGER: Professional Inspection Mandatory"
            elif "ice" in ans_lower or "hissing" in ans_lower:
                diagnosis_dict["severity"] = "Medium"
                diagnosis_dict["safe_to_touch"] = False
                diagnosis_dict["summary"] = diagnosis_dict.get("summary", "") + " [Triage Update: User confirmed hissing/frost indicating active refrigerant charge loss]."
        
        return diagnosis_dict

    def calculate_cost_matrix(
        self,
        appliance_age_years: float,
        original_purchase_price: float,
        estimated_repair_cost: float,
        new_replacement_cost: float,
        appliance_type: str = "Appliance"
    ) -> Dict[str, Any]:
        """
        Applies the industry standard 50% Rule and Depreciation Matrix.
        """
        lifespans = {
            "ac": 10.0, "air conditioner": 10.0, "geyser": 8.0, "water heater": 8.0,
            "refrigerator": 12.0, "fridge": 12.0, "washing machine": 9.0, "microwave": 7.0
        }
        
        expected_life = 10.0
        for k, v in lifespans.items():
            if k in appliance_type.lower():
                expected_life = v
                break
                
        remaining_life = max(0.5, expected_life - appliance_age_years)
        depreciation_rate = max(0.10, (1.0 - (appliance_age_years / expected_life) * 0.90))
        current_depreciated_value = max(1000.0, original_purchase_price * depreciation_rate)
        
        repair_pct_of_new = (estimated_repair_cost / max(1.0, new_replacement_cost)) * 100
        repair_pct_of_value = (estimated_repair_cost / max(1.0, current_depreciated_value)) * 100
        
        is_economical = True
        verdict = "Repair"
        title = "Fix It -- Highly Economical Decision"
        detail = (
            f"The estimated repair cost (INR {estimated_repair_cost:,.0f}) is only {repair_pct_of_new:.1f}% "
            f"of a brand new replacement (INR {new_replacement_cost:,.0f}). The appliance still has approximately "
            f"{remaining_life:.1f} years of useful operating life remaining."
        )
        
        if repair_pct_of_new > 45 or repair_pct_of_value > 50 or appliance_age_years >= (expected_life * 0.75):
            is_economical = False
            verdict = "Replace"
            title = "Replace -- Diminishing Returns on Aging Unit"
            detail = (
                f"This unit is {appliance_age_years:.1f} years old (near its {expected_life:.0f}-year design lifespan). "
                f"The repair cost of INR {estimated_repair_cost:,.0f} accounts for {repair_pct_of_value:.1f}% of its current depreciated value. "
                f"Investing in a new 5-star energy efficient model will lower your monthly electricity bill and provide fresh manufacturer warranty."
            )
            
        return {
            "repair_cost_percentage_of_new": round(repair_pct_of_new, 1),
            "depreciated_current_value": round(current_depreciated_value, 0),
            "is_repair_economical": is_economical,
            "verdict": verdict,
            "recommendation_title": title,
            "recommendation_detail": detail,
            "estimated_lifespan_remaining_years": round(remaining_life, 1)
        }

ai_vision_service = AIVisionService()
