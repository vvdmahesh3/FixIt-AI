import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, Sparkles } from "lucide-react";

export default function VoiceInput({ language, noteText, setNoteText }) {
  const [isRecording, setIsRecording] = useState(false);
  const [waveformHeight, setWaveformHeight] = useState([12, 24, 16, 32, 18, 28, 14]);

  const VERNACULAR_PROMPTS = {
    en: [
      "It is making a loud grinding sound from the bottom freezer.",
      "AC is blowing warm room air and compressor is buzzing.",
      "Water is dripping steadily from the PVC sink pipe below.",
      "Sparks and burning plastic smell coming from the geyser switch."
    ],
    hi: [
      "गीजर के स्विच से चिंगारी निकल रही है और जलने की बदबू आ रही है।",
      "एसी चल तो रहा है पर ठंडा नहीं कर रहा, सिर्फ गर्म हवा आ रही है।",
      "फ्रिज के फ्रीजर से बहुत तेज घड़-घड़ की आवाज आ रही है।",
      "सिंक के नीचे वाले पाइप से लगातार पानी टपक रहा है।"
    ],
    te: [
      "గీజర్ స్విచ్ బోర్డు నుండి మెరుపులు వస్తున్నాయి, కాలిపోయిన వాసన వస్తోంది.",
      "ఏసీ ఆన్ అవుతోంది కానీ చల్లటి గాలి రావడం లేదు, బాగా వేడిగా ఉంది.",
      "ఫ్రిజ్ లోపల ఫ్రీజర్ నుంచి చాలా శబ్దం వస్తోంది.",
      "కిచెన్ సింక్ పైపు కింది నుంచి నీళ్లు లీక్ అవుతున్నాయి."
    ]
  };

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setWaveformHeight([
          Math.floor(Math.random() * 25) + 8,
          Math.floor(Math.random() * 32) + 12,
          Math.floor(Math.random() * 28) + 10,
          Math.floor(Math.random() * 36) + 15,
          Math.floor(Math.random() * 28) + 10,
          Math.floor(Math.random() * 32) + 12,
          Math.floor(Math.random() * 25) + 8,
        ]);
      }, 120);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate real-time speech transcription after 2 seconds
      setTimeout(() => {
        const pool = VERNACULAR_PROMPTS[language] || VERNACULAR_PROMPTS.en;
        const randomPick = pool[Math.floor(Math.random() * pool.length)];
        setNoteText(randomPick);
        setIsRecording(false);
      }, 2200);
    } else {
      setIsRecording(false);
    }
  };

  const setSample = (text) => {
    setNoteText(text);
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)", padding: "16px", border: "1px solid var(--border-subtle)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600" }}>
          <Volume2 size={16} style={{ color: "var(--primary)" }} />
          <span>Add Voice Note ({language === "te" ? "తెలుగు" : language === "hi" ? "हिन्दी" : "English"})</span>
        </div>
        
        {isRecording && (
          <span style={{ fontSize: "11px", color: "#ef4444", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", animation: "pulse-danger 1s infinite" }}></span>
            Listening...
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={handleToggleRecord}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: isRecording ? "linear-gradient(135deg, #ef4444, #b91c1c)" : "var(--primary-gradient)",
            border: "none",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            boxShadow: isRecording ? "0 0 16px rgba(239,68,68,0.6)" : "0 4px 12px rgba(14,165,233,0.3)"
          }}
          title={isRecording ? "Stop Recording" : "Click to Speak"}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {isRecording ? (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", height: "40px", flex: 1 }}>
            {waveformHeight.map((h, i) => (
              <span
                key={i}
                style={{
                  width: "4px",
                  height: `${h}px`,
                  background: "var(--primary-glow)",
                  borderRadius: "2px",
                  transition: "height 0.1s ease"
                }}
              />
            ))}
            <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "12px" }}>
              Speak in {language === "te" ? "Telugu" : language === "hi" ? "Hindi" : "English"}...
            </span>
          </div>
        ) : (
          <input
            type="text"
            placeholder={
              language === "te" ? "ఉదా: 'ఫ్రిజ్ లోపల పెద్ద శబ్దం వస్తోంది' లేదా మైక్ నొక్కండి" :
              language === "hi" ? "उदा: 'गीजर से चिंगारी निकल रही है' या माइक दबाएं" :
              "e.g. 'It's making a grinding sound' or click mic to speak..."
            }
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            style={{
              flex: 1,
              background: "rgba(0,0,0,0.25)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              padding: "11px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: "13px",
              outline: "none"
            }}
          />
        )}
      </div>

      {/* Quick Voice Prompt Suggestions */}
      <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
          <Sparkles size={11} /> Quick phrases:
        </span>
        {(VERNACULAR_PROMPTS[language] || VERNACULAR_PROMPTS.en).slice(0, 2).map((phrase, idx) => (
          <button
            key={idx}
            onClick={() => setSample(phrase)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              padding: "3px 8px",
              borderRadius: "var(--radius-sm)",
              fontSize: "11px",
              cursor: "pointer",
              maxWidth: "280px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
            title={phrase}
          >
            "{phrase}"
          </button>
        ))}
      </div>
    </div>
  );
}
