export const DEMO_PRESETS = [
  {
    id: "geyser_sparking",
    filename: "geyser_sparking.jpg",
    title: "Geyser Switch Sparks",
    category: "Electrician",
    appliance: "Electric Geyser",
    severity: "High",
    voice_note: {
      en: "There are sparks coming from the geyser switch and a burnt smell.",
      hi: "गीजर के स्विच से चिंगारी निकल रही है और जलने की बदबू आ रही है।",
      te: "గీజర్ స్విచ్ బోర్డు నుండి మెరుపులు వస్తున్నాయి, కాలిపోయిన వాసన వస్తోంది."
    },
    icon: "Flame",
    color: "#ef4444",
    description: "High Risk • Active Short Circuit • 240V Hazard"
  },
  {
    id: "ac_warm_air",
    filename: "ac_warm_air.jpg",
    title: "AC Blowing Warm Air",
    category: "AC & HVAC",
    appliance: "Split Inverter AC",
    severity: "Medium",
    voice_note: {
      en: "AC fan is running but blowing warm room air, outdoor compressor humming.",
      hi: "एसी चल तो रहा है पर ठंडा नहीं कर रहा, सिर्फ गर्म हवा आ रही है।",
      te: "ఏసీ ఆన్ అవుతోంది కానీ చల్లటి గాలి రావడం లేదు, బాగా వేడిగా ఉంది."
    },
    icon: "Wind",
    color: "#f59e0b",
    description: "Caution • Low Refrigerant Gas / Capacitor"
  },
  {
    id: "kitchen_sink_leak",
    filename: "kitchen_sink_leak.jpg",
    title: "Sink P-Trap Water Leak",
    category: "Plumber",
    appliance: "Kitchen Plumbing",
    severity: "Low",
    voice_note: {
      en: "Water is continuously dripping from the plastic pipe joint below the sink.",
      hi: "सिंक के नीचे वाले पाइप से लगातार पानी टपक रहा है।",
      te: "కిచెన్ సింక్ పైపు కింది నుంచి నీళ్లు లీక్ అవుతున్నాయి."
    },
    icon: "Droplets",
    color: "#10b981",
    description: "Safe DIY Fix • Slip-joint Washer Reseating"
  },
  {
    id: "ac_rattling",
    filename: "ac_rattling.jpg",
    title: "AC Blower Noise & Rattle",
    category: "AC & HVAC",
    appliance: "Split AC Indoor Unit",
    severity: "Medium",
    voice_note: {
      en: "AC is making a loud rattling sound whenever the blower fan spins up.",
      hi: "एसी के ब्लोअर से तेज खड़खड़ाहट की आवाज आ रही है।",
      te: "ఏసీ బ్లోవర్ తిరుగుతున్నప్పుడు పెద్ద శబ్దం వస్తోంది."
    },
    icon: "Volume2",
    color: "#f59e0b",
    description: "Caution • Filter Dust Clog & Bearing Wobble"
  },
  {
    id: "fridge_noise",
    filename: "fridge_noise.jpg",
    title: "Freezer Grinding Sound",
    category: "Appliance Repair",
    appliance: "Frost-Free Refrigerator",
    severity: "Medium",
    voice_note: {
      en: "Deep grinding sound from inside the freezer that stops when door opens.",
      hi: "फ्रिज के फ्रीजर से बहुत तेज घड़-घड़ की आवाज आ रही है।",
      te: "ఫ్రిజ్ లోపల ఫ్రీజర్ నుంచి చాలా శబ్దం వస్తోంది."
    },
    icon: "Refrigerator",
    color: "#8b5cf6",
    description: "Caution • Evaporator Fan Rubbing Frost"
  }
];
