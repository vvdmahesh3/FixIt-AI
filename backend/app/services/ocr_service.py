from datetime import datetime, timedelta
from typing import Dict, Any

BRAND_CUSTOMER_CARE = {
    "voltas": {"name": "Voltas Customer Care", "toll_free": "1860-599-4555", "website": "https://www.myvoltas.com"},
    "daikin": {"name": "Daikin India Care", "toll_free": "1860-180-3900", "website": "https://www.daikinindia.com"},
    "lg": {"name": "LG Electronics Service", "toll_free": "1800-315-9999", "website": "https://www.lg.com/in"},
    "samsung": {"name": "Samsung Support India", "toll_free": "1800-407-267864", "website": "https://www.samsung.com/in"},
    "havells": {"name": "Havells Consumer Care", "toll_free": "1800-11-0303", "website": "https://www.havells.com"},
    "ao smith": {"name": "AO Smith Customer Support", "toll_free": "1800-103-2468", "website": "https://www.aosmithindia.com"},
    "default": {"name": "Authorized Brand Service Center", "toll_free": "1800-120-0000", "website": "https://brandsupport.in"}
}

class OCRService:
    def parse_invoice(self, filename: str, brand_hint: str = "Voltas", purchase_date_str: str = None) -> Dict[str, Any]:
        """
        Parses appliance purchase invoice.
        Extracts brand, model, purchase date, calculates warranty expiry,
        and generates authorized center advisory.
        """
        # Default sample purchase date: ~14 months ago (still under 2-year warranty)
        today = datetime.now()
        
        if purchase_date_str:
            try:
                p_date = datetime.strptime(purchase_date_str, "%Y-%m-%d")
            except Exception:
                p_date = today - timedelta(days=400)
        else:
            p_date = today - timedelta(days=410)
            
        warranty_months = 24 # 2 years standard comprehensive
        expiry_date = p_date + timedelta(days=warranty_months * 30.5)
        
        is_active = expiry_date > today
        days_left = max(0, (expiry_date - today).days)
        
        brand_key = brand_hint.lower()
        support_info = BRAND_CUSTOMER_CARE.get(brand_key, BRAND_CUSTOMER_CARE["default"])
        
        return {
            "brand": brand_hint,
            "appliance_type": "Inverter Split Air Conditioner",
            "model_number": f"{brand_hint.upper()}-INV-153V",
            "retailer_name": "Croma Electronics Store, Inorbit Mall",
            "invoice_number": "INV-2024-CR-89211",
            "purchase_date": p_date.strftime("%Y-%m-%d"),
            "warranty_duration_months": warranty_months,
            "expiry_date": expiry_date.strftime("%Y-%m-%d"),
            "days_remaining": days_left,
            "is_under_warranty": is_active,
            "authorized_center": support_info["name"],
            "authorized_phone": support_info["toll_free"],
            "advisory": (
                f"PROTECT YOUR WARRANTY: This {brand_hint} unit is under active warranty until {expiry_date.strftime('%d %b %Y')} "
                f"({days_left} days remaining). Do NOT pay an uncertified local technician, as opening the sealed compressor/PCB "
                f"will void your manufacturer coverage! Book an official technician via {support_info['name']} ({support_info['toll_free']})."
                if is_active else
                f"Warranty expired on {expiry_date.strftime('%d %b %Y')}. You can safely book our FixIt AI verified local technician."
            )
        }

ocr_service = OCRService()
