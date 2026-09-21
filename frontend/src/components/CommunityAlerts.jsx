import React, { useState, useEffect } from "react";
import { Users, AlertTriangle, Building, Zap, CheckCircle, ShieldAlert, Sparkles } from "lucide-react";
import { fetchCommunityAlerts } from "../services/api";

export default function CommunityAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await fetchCommunityAlerts();
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="glass-card" style={{ padding: "26px", marginBottom: "24px", border: "1px solid rgba(239, 68, 68, 0.4)", background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(14, 165, 233, 0.05) 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#f87171", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Community Intelligence & Anomaly Radar
            </span>
            <h2 style={{ fontSize: "22px", fontWeight: "800" }}>Apartment Complex Fault Clustering</h2>
          </div>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "800px" }}>
          FixIt AI groups recurring diagnosis reports across residents in the same building. When multiple units suffer the same fault within 48 hours, it alerts the society association to systemic power surges or batch defects before individual appliances burn out.
        </p>
      </div>

      {/* Alerts Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {alerts.map((item) => (
          <div
            key={item.id}
            className="glass-card"
            style={{
              padding: "22px",
              border: item.alert_active ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid var(--border-subtle)",
              background: item.alert_active ? "rgba(239, 68, 68, 0.04)" : "var(--bg-surface)"
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Building size={16} color="var(--primary)" />
                <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>{item.apartment_complex}</strong>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>• {item.locality}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  background: item.alert_active ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                  color: item.alert_active ? "#f87171" : "#34d399",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "700"
                }}>
                  {item.report_count} Reports Logged
                </span>
              </div>
            </div>

            {/* Alert Message */}
            <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "14px", marginBottom: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: item.alert_active ? "#f87171" : "var(--text-primary)", marginBottom: "4px" }}>
                {item.alert_message}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                <strong>AI Root Cause Assessment: </strong> {item.root_cause_hint}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
              <span>Affected: <strong>{item.appliance_type} ({item.fault_category})</strong></span>
              <span style={{ color: "#38bdf8", cursor: "pointer", fontWeight: "600" }}>
                Notify Society Management (RWA) &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
