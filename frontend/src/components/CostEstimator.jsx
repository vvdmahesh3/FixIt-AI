import React, { useState, useEffect } from "react";
import { DollarSign, Sliders, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { calculateCostMatrix } from "../services/api";

export default function CostEstimator({ initialData = {}, onClose }) {
  const [age, setAge] = useState(3.0);
  const [origPrice, setOrigPrice] = useState(35000);
  const [repairCost, setRepairCost] = useState(initialData.estimated_repair_cost_min || 1200);
  const [replaceCost, setReplaceCost] = useState(initialData.estimated_replace_cost || 38000);
  const [applianceType, setApplianceType] = useState(initialData.appliance_type || "Split Air Conditioner");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCalc = async () => {
      setLoading(true);
      try {
        const res = await calculateCostMatrix({
          appliance_age_years: parseFloat(age),
          original_purchase_price: parseFloat(origPrice),
          estimated_repair_cost: parseFloat(repairCost),
          new_replacement_cost: parseFloat(replaceCost),
          appliance_type: applianceType
        });
        setResult(res);
      } catch (e) {
        console.error("Calc error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCalc();
  }, [age, origPrice, repairCost, replaceCost, applianceType]);

  return (
    <div className="glass-card" style={{ padding: "24px", border: "1px solid var(--border-active)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "rgba(14, 165, 233, 0.15)",
            border: "1px solid var(--border-active)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)"
          }}>
            <DollarSign size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: "700" }}>Repair vs. Replace Decision Engine</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Data-backed economic reasoning using the 50% Rule & lifespan depreciation curves
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn-secondary" style={{ padding: "4px 10px", fontSize: "12px" }}>
            ✕ Close
          </button>
        )}
      </div>

      <div className="grid-2col">
        {/* Sliders Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "rgba(0,0,0,0.2)", padding: "18px", borderRadius: "var(--radius-sm)" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Appliance Age</span>
              <strong style={{ color: "var(--primary-glow)" }}>{age} Years</strong>
            </div>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              style={{ width: "100%", accentColor: "var(--primary)" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Estimated Repair Cost</span>
              <strong style={{ color: "#38bdf8" }}>₹{repairCost.toLocaleString()}</strong>
            </div>
            <input
              type="range"
              min="300"
              max="15000"
              step="100"
              value={repairCost}
              onChange={(e) => setRepairCost(e.target.value)}
              style={{ width: "100%", accentColor: "var(--primary)" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-secondary)" }}>New Replacement Cost</span>
              <strong style={{ color: "#a855f7" }}>₹{replaceCost.toLocaleString()}</strong>
            </div>
            <input
              type="range"
              min="2000"
              max="90000"
              step="1000"
              value={replaceCost}
              onChange={(e) => setReplaceCost(e.target.value)}
              style={{ width: "100%", accentColor: "#a855f7" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Original Purchase Price</span>
              <span style={{ color: "var(--text-muted)" }}>₹{origPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="80000"
              step="1000"
              value={origPrice}
              onChange={(e) => setOrigPrice(e.target.value)}
              style={{ width: "100%", accentColor: "var(--text-muted)" }}
            />
          </div>
        </div>

        {/* Output Decision Card */}
        {result && (
          <div
            style={{
              background: result.is_repair_economical
                ? "rgba(16, 185, 129, 0.08)"
                : "rgba(245, 158, 11, 0.08)",
              border: `1px solid ${result.is_repair_economical ? "#10b981" : "#f59e0b"}`,
              borderRadius: "var(--radius-sm)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                {result.is_repair_economical ? (
                  <CheckCircle size={20} color="#10b981" />
                ) : (
                  <AlertCircle size={20} color="#f59e0b" />
                )}
                <span style={{ fontSize: "15px", fontWeight: "800", color: result.is_repair_economical ? "#34d399" : "#fbbf24" }}>
                  {result.recommendation_title}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: "1.5" }}>
                {result.recommendation_detail}
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Repair % of New Cost</div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: result.repair_cost_percentage_of_new < 30 ? "#10b981" : "#f59e0b" }}>
                  {result.repair_cost_percentage_of_new}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Depreciated Old Value</div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)" }}>
                  ₹{result.depreciated_current_value.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Est. Life Remaining</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary-glow)" }}>
                  ~{result.estimated_lifespan_remaining_years} Years
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Economic Formula</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>
                  Industry 50% Rule
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
