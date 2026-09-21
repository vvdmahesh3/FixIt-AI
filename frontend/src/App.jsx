import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import DiagnosePortal from "./components/DiagnosePortal";
import LiveTracker from "./components/LiveTracker";
import TechnicianPortal from "./components/TechnicianPortal";
import CommunityAlerts from "./components/CommunityAlerts";
import BillingDashboard from "./components/BillingDashboard";
import WidgetPlayground from "./components/WidgetPlayground";
import ProofOfWorkStudio from "./components/ProofOfWorkStudio";
import { AlertTriangle, Sparkles, ShieldAlert, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

export default function App() {
  const [activeTab, setActiveTab] = useState("diagnose");
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("dark");
  const [activeRequestId, setActiveRequestId] = useState(1);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleStartLiveTracking = (reqId) => {
    setActiveRequestId(reqId);
    setActiveTab("tracker");
  };

  const handleCompleteFlow = (reqId) => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    setActiveRequestId(reqId);
    setActiveTab("proof");
  };

  return (
    <div>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="app-container">
        {/* Global Community Anomaly Alert Ticker */}
        <div className="community-ticker">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              background: "#ef4444",
              color: "#fff",
              fontSize: "10px",
              fontWeight: "900",
              padding: "2px 8px",
              borderRadius: "4px",
              letterSpacing: "0.05em"
            }}>
              COMMUNITY RADAR
            </span>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
              Skyline Towers (Tower B): 4 AC Inverter PCB faults reported in 48h. Possible 260V power surge detected.
            </span>
          </div>

          <button
            onClick={() => setActiveTab("community")}
            style={{
              background: "transparent",
              border: "none",
              color: "#38bdf8",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            Inspect Complex Radar <ArrowRight size={13} />
          </button>
        </div>

        {/* Dynamic Portal Views */}
        {activeTab === "diagnose" && (
          <DiagnosePortal
            language={language}
            onStartLiveTracking={handleStartLiveTracking}
          />
        )}

        {activeTab === "tracker" && (
          <div>
            <div style={{ marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => setActiveTab("diagnose")} className="btn-secondary" style={{ fontSize: "12px" }}>
                &larr; Back to Camera Diagnosis
              </button>
              <button onClick={() => handleCompleteFlow(activeRequestId)} className="btn-secondary" style={{ fontSize: "12px" }}>
                Skip to Proof of Work Studio &rarr;
              </button>
            </div>
            <LiveTracker
              requestId={activeRequestId}
              onCompleteFlow={handleCompleteFlow}
            />
          </div>
        )}

        {activeTab === "technician" && (
          <TechnicianPortal
            onSelectLeadToTrack={(leadId) => {
              setActiveRequestId(leadId);
              setActiveTab("tracker");
            }}
          />
        )}

        {activeTab === "community" && (
          <CommunityAlerts />
        )}

        {activeTab === "billing" && (
          <BillingDashboard />
        )}

        {activeTab === "widget" && (
          <WidgetPlayground />
        )}

        {activeTab === "proof" && (
          <div>
            <div style={{ marginBottom: "14px" }}>
              <button onClick={() => setActiveTab("diagnose")} className="btn-secondary" style={{ fontSize: "12px" }}>
                &larr; Start New Diagnosis
              </button>
            </div>
            <ProofOfWorkStudio
              requestId={activeRequestId}
              onClose={() => setActiveTab("diagnose")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
