import React, { useState } from "react";
import { Code, Copy, Check, ExternalLink, Sparkles, Building, ShieldCheck } from "lucide-react";

export default function WidgetPlayground() {
  const [copiedScript, setCopiedScript] = useState(false);
  const [widgetModalOpen, setWidgetModalOpen] = useState(false);
  const [widgetLoading, setWidgetLoading] = useState(false);
  const [widgetResult, setWidgetResult] = useState(null);

  const snippet = `<script src="http://localhost:8000/widget.js" data-apartment="Skyline Towers" defer></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleTestWidgetScan = () => {
    setWidgetLoading(true);
    setTimeout(() => {
      setWidgetLoading(false);
      setWidgetResult({
        issue: "Blower Fan Vibration & Dust Clog",
        severity: "Medium",
        cost: "₹850",
        summary: "Indoor unit blower barrel out of balance due to caked lint on evaporator coil."
      });
    }, 1200);
  };

  return (
    <div>
      {/* Code Snippet Box */}
      <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Code size={18} color="var(--primary)" />
              <h3 style={{ fontSize: "17px", fontWeight: "800" }}>Embeddable FixIt AI Script</h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              One line of code drops FixIt AI camera triage directly into any hostel, MyGate, or housing society website
            </p>
          </div>

          <button onClick={handleCopy} className="btn-secondary" style={{ fontSize: "12px" }}>
            {copiedScript ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copiedScript ? "Copied Snippet!" : "Copy Embed Code"}
          </button>
        </div>

        <div style={{ background: "#060911", padding: "14px 18px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#38bdf8", overflowX: "auto" }}>
          {snippet}
        </div>
      </div>

      {/* Mock Partner Website Preview */}
      <div className="glass-card" style={{ padding: "20px", border: "2px solid var(--border-active)", overflow: "hidden", position: "relative" }}>
        {/* Browser Mock Chrome Bar */}
        <div style={{ background: "rgba(0,0,0,0.4)", padding: "10px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "8px 8px 0 0" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "3px 20px", borderRadius: "12px" }}>
            https://skylinetowers.residents.portal/dashboard
          </div>
          <div style={{ fontSize: "11px", color: "var(--primary-glow)", fontWeight: "600" }}>
            Live Partner Society Preview
          </div>
        </div>

        {/* Mock Society Portal Content */}
        <div style={{ padding: "24px", minHeight: "360px", background: "rgba(10, 15, 26, 0.95)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "14px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Building size={22} color="#0ea5e9" />
              <strong style={{ fontSize: "16px" }}>Skyline Towers Residents Portal</strong>
            </div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Flat 402 • Tower B</span>
          </div>

          <div className="grid-3col">
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>MAINTENANCE DUES</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#10b981", marginTop: "4px" }}>₹4,250 Paid</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Next due Oct 1, 2026</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>GATEPASS / VISITORS</div>
              <div style={{ fontSize: "18px", fontWeight: "700", marginTop: "4px" }}>1 Expected</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Courier OTP: 4920</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>SOCIETY NOTICES</div>
              <div style={{ fontSize: "13px", fontWeight: "600", marginTop: "4px", color: "#f87171" }}>Tower B Power Fluctuation</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Maintenance inspecting</div>
            </div>
          </div>

          <div style={{ marginTop: "24px", padding: "16px", background: "rgba(14, 165, 233, 0.05)", border: "1px dashed rgba(14, 165, 233, 0.3)", borderRadius: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
            👉 <strong>Notice:</strong> Look at the bottom-right corner of this society portal! The FixIt AI floating bubble is active. Click it to test the embedded diagnosis flow.
          </div>

          {/* Floating Widget Bubble Inside Mock Portal */}
          <div style={{ position: "absolute", bottom: "24px", right: "24px" }}>
            <button
              onClick={() => setWidgetModalOpen(!widgetModalOpen)}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--primary-gradient)",
                border: "2px solid rgba(255,255,255,0.4)",
                color: "#fff",
                boxShadow: "0 8px 24px rgba(14, 165, 233, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
              title="FixIt AI Assistant"
            >
              <Sparkles size={24} />
            </button>
          </div>

          {/* Floating Widget Modal Inside Mock Portal */}
          {widgetModalOpen && (
            <div
              style={{
                position: "absolute",
                bottom: "90px",
                right: "24px",
                width: "320px",
                background: "#0d1322",
                border: "1px solid var(--border-active)",
                borderRadius: "14px",
                boxShadow: "0 16px 36px rgba(0,0,0,0.8)",
                overflow: "hidden",
                zIndex: 10
              }}
            >
              <div style={{ background: "var(--primary-gradient)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>⚡ FixIt AI Quick Scanner</div>
                <button onClick={() => setWidgetModalOpen(false)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: "16px" }}>
                  &times;
                </button>
              </div>

              <div style={{ padding: "14px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px" }}>
                  Point phone camera at broken item to get instant safety triage & estimate.
                </div>

                {!widgetResult ? (
                  <button
                    onClick={handleTestWidgetScan}
                    disabled={widgetLoading}
                    className="btn-primary"
                    style={{ width: "100%", fontSize: "12px", padding: "8px 12px" }}
                  >
                    {widgetLoading ? "Analyzing AC Photo..." : "Test Snap: Rattling AC Unit"}
                  </button>
                ) : (
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontSize: "10px", fontWeight: "800", background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", padding: "2px 6px", borderRadius: "4px" }}>
                      MEDIUM CAUTION
                    </span>
                    <div style={{ fontSize: "12px", fontWeight: "700", marginTop: "4px" }}>{widgetResult.issue}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{widgetResult.summary}</div>
                    <div style={{ fontSize: "11px", color: "#38bdf8", marginTop: "6px", fontWeight: "700" }}>
                      Est: {widgetResult.cost}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
