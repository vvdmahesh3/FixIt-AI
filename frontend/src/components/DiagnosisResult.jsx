import React, { useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Wrench,
  ShieldCheck,
  Zap,
  Info,
  ExternalLink,
  PhoneCall,
  DollarSign
} from "lucide-react";

export default function DiagnosisResult({ diagnosis, onBookTechnician, onOpenCostCalc, onOpenWarranty }) {
  const [checkedSteps, setCheckedSteps] = useState({});

  if (!diagnosis) return null;

  const toggleStep = (index) => {
    setCheckedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const isHighSeverity = diagnosis.severity === "High";
  const isMediumSeverity = diagnosis.severity === "Medium";
  const isLowSeverity = diagnosis.severity === "Low";

  return (
    <div className="glass-card" style={{ padding: "24px", marginTop: "24px" }}>
      {/* Top Header & Severity Banner */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700", letterSpacing: "0.05em" }}>
              {diagnosis.appliance_type} • {diagnosis.detected_brand || "Standard OEM"}
            </span>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)" }}>
            {diagnosis.detected_issue}
          </h2>
        </div>

        {/* Severity Badge */}
        <div>
          {isHighSeverity && (
            <div className="badge-severity-high">
              <ShieldAlert size={14} /> DANGER — HIGH SEVERITY
            </div>
          )}
          {isMediumSeverity && (
            <div className="badge-severity-med">
              <AlertTriangle size={14} /> CAUTION — MEDIUM SEVERITY
            </div>
          )}
          {isLowSeverity && (
            <div className="badge-severity-low">
              <ShieldCheck size={14} /> SAFE DIY — LOW SEVERITY
            </div>
          )}
        </div>
      </div>

      {/* Critical Safety Notice Banner */}
      <div
        style={{
          background: isHighSeverity
            ? "rgba(239, 68, 68, 0.14)"
            : isMediumSeverity
            ? "rgba(245, 158, 11, 0.12)"
            : "rgba(16, 185, 129, 0.12)",
          border: `1px solid ${
            isHighSeverity ? "#ef4444" : isMediumSeverity ? "#f59e0b" : "#10b981"
          }`,
          borderRadius: "var(--radius-md)",
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "flex-start",
          gap: "14px"
        }}
      >
        <div style={{ marginTop: "2px" }}>
          {isHighSeverity ? (
            <ShieldAlert size={22} color="#ef4444" />
          ) : isMediumSeverity ? (
            <AlertTriangle size={22} color="#f59e0b" />
          ) : (
            <CheckCircle2 size={22} color="#10b981" />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "14px", color: isHighSeverity ? "#f87171" : isMediumSeverity ? "#fbbf24" : "#34d399" }}>
            {isHighSeverity
              ? "STOP — HAZARD WARNING: DO NOT ATTEMPT DIY REPAIR"
              : isMediumSeverity
              ? "CAUTION ADVISED: SAFE TO INSPECT, NOT TO DISASSEMBLE"
              : "SAFE TO TOUCH: EASY DIY TROUBLESHOOTING"}
          </div>
          <p style={{ fontSize: "13px", marginTop: "4px", color: "var(--text-primary)", lineHeight: "1.5" }}>
            {diagnosis.summary}
          </p>
          {diagnosis.safety_warnings && diagnosis.safety_warnings.length > 0 && (
            <ul style={{ marginTop: "8px", paddingLeft: "18px", fontSize: "12px", color: isHighSeverity ? "#fca5a5" : "var(--text-secondary)" }}>
              {diagnosis.safety_warnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main Grid: Visual Bounding Box & DIY Actions */}
      <div className="grid-2col">
        {/* Left: Image with Bounding Box highlight */}
        <div>
          <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-subtle)", background: "#000" }}>
            <img
              src={diagnosis.image_url || "/sample_cases/ac_rattling.jpg"}
              alt="Detected Problem"
              style={{ width: "100%", height: "280px", objectFit: "cover", display: "block" }}
            />
            {/* Bounding Box Overlay */}
            {diagnosis.bounding_box && (
              <div
                style={{
                  position: "absolute",
                  top: `${(diagnosis.bounding_box.ymin || 0.25) * 100}%`,
                  left: `${(diagnosis.bounding_box.xmin || 0.2) * 100}%`,
                  width: `${((diagnosis.bounding_box.xmax || 0.8) - (diagnosis.bounding_box.xmin || 0.2)) * 100}%`,
                  height: `${((diagnosis.bounding_box.ymax || 0.75) - (diagnosis.bounding_box.ymin || 0.25)) * 100}%`,
                  border: "2px dashed #00f0ff",
                  boxShadow: "0 0 12px rgba(0, 240, 255, 0.5), inset 0 0 12px rgba(0, 240, 255, 0.2)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "4px"
                }}
              >
                <span
                  style={{
                    background: "#00f0ff",
                    color: "#000",
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "2px 6px",
                    borderRadius: "4px"
                  }}
                >
                  {diagnosis.bounding_box.label || "Fault Point"} ({(diagnosis.confidence * 100).toFixed(0)}% Conf)
                </span>
              </div>
            )}
          </div>

          {/* Quick Decision Bar */}
          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <button
              onClick={onOpenCostCalc}
              className="btn-secondary"
              style={{ flex: 1, fontSize: "12px", justifyContent: "center" }}
            >
              <DollarSign size={14} /> Repair vs Replace Calc
            </button>
            <button
              onClick={onOpenWarranty}
              className="btn-secondary"
              style={{ flex: 1, fontSize: "12px", justifyContent: "center" }}
            >
              <Info size={14} /> Check Warranty
            </button>
          </div>
        </div>

        {/* Right: Step-by-Step Troubleshooting / Technician Call-to-Action */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              <Wrench size={16} style={{ color: "var(--primary)" }} />
              {isHighSeverity ? "Mandatory Safe Action Steps" : "Step-by-Step DIY Troubleshooting"}
            </h4>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {diagnosis.diy_steps ? diagnosis.diy_steps.length : 0} steps
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto", paddingRight: "4px" }}>
            {diagnosis.diy_steps && diagnosis.diy_steps.map((step, idx) => {
              const done = checkedSteps[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  style={{
                    background: done ? "rgba(16, 185, 129, 0.08)" : "rgba(255,255,255,0.03)",
                    border: done ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--border-subtle)",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    transition: "all 0.15s ease"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!done}
                    onChange={() => {}}
                    style={{ marginTop: "3px", cursor: "pointer", accentColor: "#10b981" }}
                  />
                  <span style={{ fontSize: "13px", color: done ? "var(--text-muted)" : "var(--text-primary)", textDecoration: done ? "line-through" : "none" }}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Tools Required */}
          {diagnosis.tools_needed && diagnosis.tools_needed.length > 0 && (
            <div style={{ marginTop: "14px", fontSize: "12px", color: "var(--text-secondary)" }}>
              <strong>Tools / Items: </strong> {diagnosis.tools_needed.join(", ")}
            </div>
          )}

          {/* Booking Action Button */}
          <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Estimated Repair Range</div>
                <div style={{ fontSize: "17px", fontWeight: "800", color: "#38bdf8" }}>
                  ₹{diagnosis.estimated_repair_cost_min} – ₹{diagnosis.estimated_repair_cost_max}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Verified Technicians Available</div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#10b981" }}>● 3 Nearby in Hitec City</div>
              </div>
            </div>

            <button
              onClick={() => onBookTechnician(diagnosis)}
              className={isHighSeverity ? "btn-danger" : "btn-primary"}
              style={{ width: "100%", justifyContent: "center", fontSize: "14px", padding: "12px 20px" }}
            >
              <Zap size={16} />
              {isHighSeverity ? "One-Tap Emergency Technician Dispatch" : "Book Nearby Verified Technician"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
