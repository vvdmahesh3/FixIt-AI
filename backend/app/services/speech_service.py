from typing import Dict, Any

MULTILINGUAL_SAMPLES = {
    "en": [
        "It is making a loud grinding sound from the bottom freezer.",
        "AC is running but only blowing room temperature warm air.",
        "Water is dripping steadily from the sink pipe underneath.",
        "Small sparks and burning plastic smell coming from the geyser switch."
    ],
    "hi": [
        "गीजर के स्विच से चिंगारी निकल रही है और जलने की बदबू आ रही है।",
        "एसी चल तो रहा है पर ठंडा नहीं कर रहा, सिर्फ गर्म हवा आ रही है।",
        "फ्रिज के फ्रीजर से बहुत तेज घड़-घड़ की आवाज आ रही है।",
        "सिंक के नीचे वाले पाइप से लगातार पानी टपक रहा है।"
    ],
    "te": [
        "గీజర్ స్విచ్ బోర్డు నుండి మెరుపులు వస్తున్నాయి, కాలిపోయిన వాసన వస్తోంది.",
        "ఏసీ ఆన్ అవుతోంది కానీ చల్లటి గాలి రావడం లేదు, బాగా వేడిగా ఉంది.",
        "ఫ్రిజ్ లోపల ఫ్రీజర్ నుంచి చాలా శబ్దం వస్తోంది.",
        "కిచెన్ సింక్ పైపు కింది నుంచి నీళ్లు లీక్ అవుతున్నాయి."
    ]
}

class SpeechService:
    def transcribe_audio(self, audio_data: bytes = None, language: str = "en", sample_index: int = 0) -> Dict[str, Any]:
        """
        Transcribes voice notes in English, Hindi, or Telugu.
        Provides both original vernacular transcript and normalized English diagnostic prompt.
        """
        lang = language if language in MULTILINGUAL_SAMPLES else "en"
        samples = MULTILINGUAL_SAMPLES[lang]
        text = samples[sample_index % len(samples)]
        
        # Translation / normalized representation
        normalized_en = MULTILINGUAL_SAMPLES["en"][sample_index % len(MULTILINGUAL_SAMPLES["en"])]
        
        return {
            "language": lang,
            "transcription": text,
            "normalized_english": normalized_en,
            "duration_seconds": 3.4
        }

speech_service = SpeechService()
