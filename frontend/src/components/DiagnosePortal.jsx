import React, { useState } from "react";
import {
  Camera,
  Upload,
  Zap,
  Sparkles,
  AlertTriangle,
  Flame,
  Wind,
  Droplets,
  Volume2,
  Refrigerator,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ShieldCheck
} from "lucide-react";
import { DEMO_PRESETS } from "../data/presets";
import { runDiagnosis } from "../services/api";
import VoiceInput from "./VoiceInput";
import TriageChat from "./TriageChat";
import DiagnosisResult from "./DiagnosisResult";
import CostEstimator from "./CostEstimator";
import WarrantyChecker from "./WarrantyChecker";
import TechnicianBooking from "./TechnicianBooking";

export default function DiagnosePortal({ language, onStartLiveTracking }) {
  const [selectedPreset, setSelectedPreset] = useState(DEMO_PRESETS[0]);
  const [customFile, setCustomFile] = useState(null);
  const [customPreview, setCustomPreview] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);

  // Sub-views / Modals
  const [showCostCalc, setShowCostCalc] = useState(false);
  const [showWarranty, setShowWarranty] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setCustomFile(null);
    setCustomPreview(null);
    setNoteText(preset.voice_note[language] || preset.voice_note.en);
    setDiagnosis(null);
    setShowCostCalc(false);
    setShowWarranty(false);
    setShowBooking(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomFile(file);
      setCustomPreview(URL.createObjectURL(file));
      setSelectedPreset(null);
      setDiagnosis(null);
    }
  };

  const handleRunDiagnosis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await runDiagnosis({
        presetName: selectedPreset ? selectedPreset.filename : null,
        file: customFile,
        noteText: noteText,
        language: language,
      });
      setDiagnosis(res);
    } catch (err) {
      console.error("Diagnosis error:", err);
      alert("Error contacting FixIt AI diagnosis backend. Please ensure the backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPresetIcon = (iconName) => {
    switch (iconName) {
      case "Flame": return <Flame size={16} />;
      case "Wind": return <Wind size={16} />;
      case "Droplets": return <Droplets size={16} />;
      case "Volume2": return <Volume2 size={16} />;
      case "Refrigerator": return <Refrigerator size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 28px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(14, 165, 233, 0.1)",
          border: "1px solid var(--border-active)",
          padding: "6px 14px",
          borderRadius: "var(--radius-full)",
          fontSize: "12px",
          color: "var(--primary-glow)",
          marginBottom: "12px",
          fontWeight: "600"
        }}>
          <Sparkles size={14} /> Multi-Modal AI Decision & Safety Platform
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: "800", lineHeight: "1.2", marginBottom: "10px" }}>
          Point your camera at the problem.<br />
          <span style={{
            background: "linear-gradient(135deg, #00f0ff, #7000ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Get an answer.
          </span>
        </h1>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)" }}>
          Identifies the fault, scores safety & severity, computes repair-vs-replace math, and connects you to verified nearby technicians.
        </p>
      </div>

      {/* 1-Click Instant Presets Carousel */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
            1-Click Sample Scenarios (Try Instant Diagnosis)
          </span>
          <span style={{ fontSize: "11px", color: "var(--primary-glow)" }}>
            ⚡ 5 Ready Presets
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          {DEMO_PRESETS.map((preset) => {
            const isSelected = selectedPreset?.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                style={{
                  background: isSelected ? "rgba(14, 165, 233, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  border: `1px solid ${isSelected ? "var(--primary)" : "var(--border-subtle)"}`,
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 14px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 0 14px rgba(14, 165, 233, 0.3)" : "none"
                }}
              >
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: `${preset.color}22`,
                  color: preset.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {getPresetIcon(preset.icon)}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontWeight: "700", fontSize: "13px", color: isSelected ? "#fff" : "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {preset.title}
                  </div>
                  <div style={{ fontSize: "10px", color: preset.color, fontWeight: "600" }}>
                    {preset.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Core: Camera Upload & Voice Note */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div className="grid-2col">
          {/* Photo Dropzone or Preview */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Camera size={16} style={{ color: "var(--primary)" }} />
              <span>Step 1: Appliance Photo or Video</span>
            </div>

            <div
              style={{
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: "2px dashed var(--border-subtle)",
                background: "rgba(0,0,0,0.3)",
                height: "220px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              {customPreview ? (
                <img
                  src={customPreview}
                  alt="Custom Upload"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : selectedPreset ? (
                <img
                  src={`/sample_cases/${selectedPreset.filename}`}
                  alt={selectedPreset.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Upload size={32} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>Drag & drop or Click to upload</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>JPG, PNG, WebP or MP4 video</div>
                </div>
              )}

              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  cursor: "pointer"
                }}
              />
            </div>

            <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--text-muted)" }}>
              <span>Using: <strong>{selectedPreset ? selectedPreset.title : (customFile?.name || "Uploaded Photo")}</strong></span>
              <label style={{ color: "var(--primary-glow)", cursor: "pointer", fontWeight: "600" }}>
                Browse Files
                <input type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          {/* Voice Input & Diagnosis Trigger */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>
                Step 2: Add Sound Note or Voice Memo
              </div>
              <VoiceInput
                language={language}
                noteText={noteText}
                setNoteText={setNoteText}
              />
            </div>

            {/* Run Button */}
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={handleRunDiagnosis}
                disabled={isAnalyzing}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  fontSize: "15px",
                  fontWeight: "700",
                  justifyContent: "center"
                }}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Analyzing Vision & Sound Waves...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Run FixIt AI Diagnosis Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Turn Triage Q&A Assistant */}
      {diagnosis && (
        <TriageChat
          diagnosis={diagnosis}
          onDiagnosisUpdated={(updated) => setDiagnosis(updated)}
        />
      )}

      {/* Diagnostic Result Card */}
      {diagnosis && (
        <DiagnosisResult
          diagnosis={diagnosis}
          onBookTechnician={() => {
            setShowBooking(true);
            setShowCostCalc(false);
            setShowWarranty(false);
          }}
          onOpenCostCalc={() => setShowCostCalc(!showCostCalc)}
          onOpenWarranty={() => setShowWarranty(!showWarranty)}
        />
      )}

      {/* Repair vs Replace Cost Calculator Toggle View */}
      {showCostCalc && (
        <div style={{ marginTop: "24px" }}>
          <CostEstimator
            initialData={diagnosis || {}}
            onClose={() => setShowCostCalc(false)}
          />
        </div>
      )}

      {/* Warranty Checker Toggle View */}
      {showWarranty && (
        <div style={{ marginTop: "24px" }}>
          <WarrantyChecker
            onClose={() => setShowWarranty(false)}
          />
        </div>
      )}

      {/* Verified Technician Booking View */}
      {showBooking && diagnosis && (
        <div style={{ marginTop: "24px" }}>
          <TechnicianBooking
            diagnosis={diagnosis}
            onBookingComplete={(createdReq) => {
              setShowBooking(false);
              onStartLiveTracking(createdReq.id);
            }}
            onCancel={() => setShowBooking(false)}
          />
        </div>
      )}
    </div>
  );
}
