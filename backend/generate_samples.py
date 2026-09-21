import os
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = r"m:\mahesh\Intenships\FlyRank-AI\frontend\public\sample_cases"
os.makedirs(OUT_DIR, exist_ok=True)

SAMPLES = [
    {
        "filename": "ac_rattling.jpg",
        "title": "SPLIT AC INDOOR UNIT",
        "subtitle": "Voltas 1.5T • Severe Blower Rattle & Vibration",
        "color1": "#1e293b",
        "color2": "#0f172a",
        "accent": "#f59e0b",
        "badge": "VIBRATION DETECTED",
        "icon": "❄"
    },
    {
        "filename": "ac_warm_air.jpg",
        "title": "OUTDOOR CONDENSER UNIT",
        "subtitle": "Daikin R32 Inverter • Blowing Warm Room Air",
        "color1": "#1e293b",
        "color2": "#0f172a",
        "accent": "#ef4444",
        "badge": "LOW REFRIGERANT / LEAK",
        "icon": "⚡"
    },
    {
        "filename": "geyser_sparking.jpg",
        "title": "ELECTRIC WATER HEATER / GEYSER",
        "subtitle": "Havells 25L • Sparks from Power Switchboard",
        "color1": "#2d1515",
        "color2": "#140a0a",
        "accent": "#ef4444",
        "badge": "HIGH RISK: SHORT CIRCUIT",
        "icon": "🔥"
    },
    {
        "filename": "kitchen_sink_leak.jpg",
        "title": "KITCHEN SINK P-TRAP",
        "subtitle": "PVC Thread Joint • Continuous Water Drip",
        "color1": "#0c253b",
        "color2": "#061320",
        "accent": "#38bdf8",
        "badge": "SAFE DIY FIX: GASKET WEAR",
        "icon": "💧"
    },
    {
        "filename": "fridge_noise.jpg",
        "title": "FROST-FREE REFRIGERATOR",
        "subtitle": "LG Double Door • Grinding Noise in Freezer",
        "color1": "#1a2536",
        "color2": "#0c1522",
        "accent": "#a855f7",
        "badge": "FAN RUBBING ON ICE",
        "icon": "🧊"
    },
    {
        "filename": "switch_spark.jpg",
        "title": "16A HEAVY DUTY SOCKET",
        "subtitle": "Anchor Roma • Black Scorch & Smoldering",
        "color1": "#2a1515",
        "color2": "#130808",
        "accent": "#ef4444",
        "badge": "DANGER: ARC FLASH RISK",
        "icon": "⚡"
    },
    {
        "filename": "ac_dirty_coil.jpg",
        "title": "BEFORE REPAIR",
        "subtitle": "Clogged Black Dust & Grime on Evaporator",
        "color1": "#27272a",
        "color2": "#18181b",
        "accent": "#ef4444",
        "badge": "STATUS: DIRTY / RESTRICTED",
        "icon": "✖"
    },
    {
        "filename": "ac_clean_coil.jpg",
        "title": "AFTER REPAIR — JOB DONE",
        "subtitle": "Chemically Foam-Cleaned & 100% Unclogged",
        "color1": "#064e3b",
        "color2": "#022c22",
        "accent": "#10b981",
        "badge": "STATUS: 100% RESTORED (4.9 ★)",
        "icon": "✔"
    },
    {
        "filename": "geyser_spark_before.jpg",
        "title": "BEFORE REPAIR",
        "subtitle": "Melted Thermostat Terminals & Charred Wire",
        "color1": "#3b1212",
        "color2": "#1a0808",
        "accent": "#ef4444",
        "badge": "STATUS: HAZARDOUS SPARKING",
        "icon": "⚠"
    },
    {
        "filename": "geyser_fixed_after.jpg",
        "title": "AFTER REPAIR — JOB DONE",
        "subtitle": "OEM Heavy-Duty Thermostat & Ceramic Terminal",
        "color1": "#064e3b",
        "color2": "#022c22",
        "accent": "#10b981",
        "badge": "STATUS: TESTED & CERTIFIED SAFE",
        "icon": "✔"
    }
]

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

for s in SAMPLES:
    img = Image.new("RGB", (800, 500), hex_to_rgb(s["color1"]))
    draw = ImageDraw.Draw(img)
    
    # Draw background gradient/grid pattern
    for y in range(0, 500, 25):
        draw.line([(0, y), (800, y)], fill=hex_to_rgb("#334155"), width=1)
    for x in range(0, 800, 25):
        draw.line([(x, 0), (x, 500)], fill=hex_to_rgb("#334155"), width=1)
        
    # Draw center visual card
    draw.rounded_rectangle([(60, 60), (740, 440)], radius=16, fill=hex_to_rgb(s["color2"]), outline=hex_to_rgb(s["accent"]), width=3)
    
    # Draw top badge
    draw.rounded_rectangle([(90, 85), (420, 125)], radius=8, fill=hex_to_rgb(s["accent"]))
    
    # Draw technical bounding box simulation
    draw.rectangle([(220, 160), (580, 360)], outline=hex_to_rgb(s["accent"]), width=2)
    # Corner brackets
    draw.line([(220, 160), (240, 160)], fill=hex_to_rgb(s["accent"]), width=5)
    draw.line([(220, 160), (220, 180)], fill=hex_to_rgb(s["accent"]), width=5)
    draw.line([(580, 160), (560, 160)], fill=hex_to_rgb(s["accent"]), width=5)
    draw.line([(580, 160), (580, 180)], fill=hex_to_rgb(s["accent"]), width=5)
    draw.line([(220, 360), (240, 360)], fill=hex_to_rgb(s["accent"]), width=5)
    draw.line([(220, 360), (220, 340)], fill=hex_to_rgb(s["accent"]), width=5)
    draw.line([(580, 360), (560, 360)], fill=hex_to_rgb(s["accent"]), width=5)
    draw.line([(580, 360), (580, 340)], fill=hex_to_rgb(s["accent"]), width=5)
    
    # Text headers
    # Default font fallback
    draw.text((105, 95), s["badge"], fill=(255, 255, 255))
    draw.text((90, 150), s["title"], fill=(255, 255, 255))
    draw.text((90, 180), s["subtitle"], fill=(148, 163, 184))
    draw.text((240, 245), f"AI INSPECTION ZONE: {s['title']}", fill=(203, 213, 225))
    draw.text((240, 275), "Confidence: 94.8% • Real-time Triage Active", fill=(148, 163, 184))
    
    # Footer timestamp & metadata
    draw.text((90, 395), "FixIt AI Multi-modal Vision Model v2.4 • Geo-Hyderabad Active", fill=(100, 116, 139))
    
    out_path = os.path.join(OUT_DIR, s["filename"])
    img.save(out_path, quality=92)
    print(f"Generated sample: {s['filename']}")

print("All sample graphic assets generated successfully!")
