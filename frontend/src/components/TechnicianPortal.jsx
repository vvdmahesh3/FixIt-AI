import React, { useState, useEffect } from "react";
import { Wrench, DollarSign, Bell, CheckCircle, Navigation, Star, MapPin, Zap, RefreshCw } from "lucide-react";
import { fetchTechnicians, topupTechWallet } from "../services/api";

export default function TechnicianPortal({ onSelectLeadToTrack }) {
  const [tech, setTech] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState(500);

  // Sample incoming leads for technician
  const [leads, setLeads] = useState([
    {
      id: 101,
      customer_name: "Sneha Rao",
      apartment_complex: "Skyline Towers, Tower A - 804",
      issue_title: "1.5T Voltas Split AC Blower Rattle & Vibration",
      severity: "Medium",
      distance_km: 1.2,
      estimated_earning: "₹750 - ₹1,100",
      lead_cost_inr: 99,
      status: "new"
    },
    {
      id: 102,
      customer_name: "Vikram Malhotra",
      apartment_complex: "Cyber Meadows, Villa 42",
      issue_title: "Electric Geyser Thermostat Sparking & Ground Fault",
      severity: "High",
      distance_km: 2.1,
      estimated_earning: "₹1,200 - ₹1,800",
      lead_cost_inr: 99,
      status: "new"
    }
  ]);

  useEffect(() => {
    loadTech();
  }, []);

  const loadTech = async () => {
    try {
      const all = await fetchTechnicians();
      if (all.length > 0) setTech(all[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    if (!tech) return;
    try {
      const res = await topupTechWallet(tech.id, topupAmount);
      setTech((prev) => ({ ...prev, lead_wallet_balance_inr: res.new_balance_inr }));
      alert(`Wallet topped up by ₹${topupAmount}!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptLead = (lead) => {
    setTech((prev) => ({
      ...prev,
      lead_wallet_balance_inr: Math.max(0, prev.lead_wallet_balance_inr - lead.lead_cost_inr)
    }));
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    alert(`Lead Accepted! ₹${lead.lead_cost_inr} deducted from Lead Wallet. Navigating to customer location.`);
    if (onSelectLeadToTrack) {
      onSelectLeadToTrack(lead.id);
    }
  };

  if (loading || !tech) return <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>Loading technician hub...</div>;

  return (
    <div>
      {/* Top Stats Banner */}
      <div className="grid-3col" style={{ marginBottom: "24px" }}>
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>LEAD WALLET BALANCE</div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#38bdf8", marginTop: "4px" }}>
            ₹{tech.lead_wallet_balance_inr.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "#34d399", marginTop: "4px" }}>
            ● Good for ~{Math.floor(tech.lead_wallet_balance_inr / 99)} qualified leads (₹99/lead)
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>REPUTATION & RATINGS</div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#fbbf24", display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <Star size={24} fill="#fbbf24" /> {tech.rating}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            Based on {tech.reviews_count} verified apartment repairs
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>QUICK WALLET RECHARGE</div>
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button onClick={() => setTopupAmount(500)} className={topupAmount === 500 ? "btn-primary" : "btn-secondary"} style={{ padding: "6px 12px", fontSize: "12px" }}>
              +₹500
            </button>
            <button onClick={() => setTopupAmount(1000)} className={topupAmount === 1000 ? "btn-primary" : "btn-secondary"} style={{ padding: "6px 12px", fontSize: "12px" }}>
              +₹1,000
            </button>
            <button onClick={handleTopup} className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }}>
              Recharge
            </button>
          </div>
        </div>
      </div>

      {/* Main Leads Board */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Bell size={18} color="var(--primary)" />
              <h3 style={{ fontSize: "18px", fontWeight: "800" }}>Live Qualified Leads Radar (Hitec City)</h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Pre-triaged by FixIt AI with photo, severity & parts diagnosis before dispatch
            </p>
          </div>
          <span style={{ fontSize: "11px", background: "rgba(14, 165, 233, 0.15)", color: "#38bdf8", padding: "4px 10px", borderRadius: "12px", fontWeight: "700" }}>
            {leads.length} Available Nearby
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {leads.map((lead) => (
            <div
              key={lead.id}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "18px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <strong style={{ fontSize: "16px" }}>{lead.issue_title}</strong>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: lead.severity === "High" ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)",
                    color: lead.severity === "High" ? "#f87171" : "#fbbf24"
                  }}>
                    {lead.severity} Severity
                  </span>
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={13} /> {lead.apartment_complex} ({lead.distance_km} km away)
                  </span>
                  <span>Customer: {lead.customer_name}</span>
                </div>

                <div style={{ fontSize: "12px", color: "#34d399", fontWeight: "700", marginTop: "6px" }}>
                  Est. Job Earnings: {lead.estimated_earning}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Pay-Per-Lead Fee</div>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: "#f87171" }}>-₹{lead.lead_cost_inr}</div>
                </div>

                <button
                  onClick={() => handleAcceptLead(lead)}
                  className="btn-primary"
                  style={{ fontSize: "13px", padding: "10px 18px" }}
                >
                  <Zap size={15} /> Accept & Unlock Lead
                </button>
              </div>
            </div>
          ))}

          {leads.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              No more pending leads right now. New alerts will buzz when residents run FixIt AI!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
