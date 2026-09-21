import React, { useState, useEffect } from "react";
import { CreditCard, Check, Zap, DollarSign, Activity, Sparkles, ArrowRight } from "lucide-react";
import { fetchBillingSummary, upgradeHouseholdPlan } from "../services/api";

export default function BillingDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadBilling();
  }, []);

  const loadBilling = async () => {
    try {
      const data = await fetchBillingSummary();
      setSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await upgradeHouseholdPlan();
      await loadBilling();
      alert("Upgraded to FixIt Pro! Unlimited diagnoses & priority dispatch enabled.");
    } catch (e) {
      console.error(e);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading || !summary) return <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>Loading billing...</div>;

  const h = summary.household;
  const m = summary.metering_stats;

  return (
    <div>
      {/* Platform Metering & Revenue Metrics */}
      <div className="grid-3col" style={{ marginBottom: "24px" }}>
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
            <Activity size={14} color="var(--primary)" /> LLM VISION TOKENS
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#38bdf8", marginTop: "4px" }}>
            {m.llm_vision_tokens_processed.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            Avg Latency: {m.avg_latency_ms}ms • Cost: ${m.cost_per_diagnosis_usd}/call
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
            <DollarSign size={14} color="#10b981" /> GROSS PLATFORM REVENUE
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#34d399", marginTop: "4px" }}>
            ₹{m.gross_platform_revenue_inr.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            Two-sided: Household subs + Tech pay-per-lead
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
            <Zap size={14} color="#fbbf24" /> CURRENT HOUSEHOLD QUOTA
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#fbbf24", marginTop: "4px" }}>
            {h.is_unlimited ? "UNLIMITED" : `${h.monthly_diagnoses_used} / ${h.monthly_diagnoses_limit}`}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            {h.is_unlimited ? "FixIt Pro Member" : `${h.quota_remaining} free diagnoses remaining this month`}
          </div>
        </div>
      </div>

      {/* Household Subscription Tiers */}
      <div className="grid-2col" style={{ marginBottom: "24px" }}>
        {/* Free Tier */}
        <div
          className="glass-card"
          style={{
            padding: "26px",
            border: !h.is_unlimited ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
            position: "relative"
          }}
        >
          {!h.is_unlimited && (
            <span style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(14, 165, 233, 0.2)", color: "#38bdf8", padding: "3px 10px", borderRadius: "12px", fontSize: "10px", fontWeight: "800" }}>
              CURRENT PLAN
            </span>
          )}
          <h3 style={{ fontSize: "18px", fontWeight: "800" }}>Household Free Tier</h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Essential self-triage for students, flatmates & casual home issues
          </p>

          <div style={{ fontSize: "32px", fontWeight: "800", margin: "16px 0", color: "#fff" }}>
            ₹0 <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-muted)" }}>/ month</span>
          </div>

          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", marginBottom: "20px" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} color="#10b981" /> 3 AI Vision Diagnoses / month</li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} color="#10b981" /> Multi-Turn Safety & Triage</li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} color="#10b981" /> Standard Technician Matching</li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)" }}>✕ Priority Emergency Dispatch</li>
          </ul>

          <button disabled className="btn-secondary" style={{ width: "100%", justifyContent: "center", opacity: !h.is_unlimited ? 0.7 : 1 }}>
            {!h.is_unlimited ? "Active Free Tier" : "Downgrade to Free"}
          </button>
        </div>

        {/* Pro Tier */}
        <div
          className="glass-card"
          style={{
            padding: "26px",
            border: h.is_unlimited ? "2px solid #10b981" : "1px solid rgba(14, 165, 233, 0.5)",
            background: "linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)",
            position: "relative"
          }}
        >
          {h.is_unlimited && (
            <span style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(16, 185, 129, 0.2)", color: "#34d399", padding: "3px 10px", borderRadius: "12px", fontSize: "10px", fontWeight: "800" }}>
              ACTIVE MEMBERSHIP
            </span>
          )}
          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary-glow)" }}>FixIt Pro Household</h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Complete home safety, unlimited diagnoses & instant priority dispatch
          </p>

          <div style={{ fontSize: "32px", fontWeight: "800", margin: "16px 0", color: "#38bdf8" }}>
            ₹299 <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-muted)" }}>/ month</span>
          </div>

          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", marginBottom: "20px" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} color="#10b981" /> <strong>Unlimited</strong> AI Vision Diagnoses</li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} color="#10b981" /> <strong>Priority Dispatch</strong> (15 min ETA guarantee)</li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} color="#10b981" /> Digital Warranty Vault & Invoice OCR</li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} color="#10b981" /> Society Power Surge Warnings</li>
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={upgrading || h.is_unlimited}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            {h.is_unlimited ? "Active Pro Membership" : upgrading ? "Processing Stripe Mock..." : "Upgrade to FixIt Pro (₹299/mo)"}
          </button>
        </div>
      </div>
    </div>
  );
}
