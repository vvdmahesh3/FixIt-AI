import React, { useState, useEffect } from "react";
import { Share2, Download, Check, Sparkles, Star, ShieldCheck, Copy } from "lucide-react";
import { fetchProofOfWork } from "../services/api";

export default function ProofOfWorkStudio({ requestId = 1, onClose }) {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchProofOfWork(requestId);
        setData(res);
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, [requestId]);

  if (!data) return <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>Generating showcase...</div>;

  const handleCopyCaption = () => {
    const caption = `Job Done by ${data.technician_name} (${data.technician_badge})!\nProblem: ${data.issue_diagnosed}\nFix: ${data.solution_performed}\nCustomer: "${data.review}" (5/5 ★)\nVerified on FixIt AI Network\n${data.hashtags}`;
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card" style={{ padding: "26px", border: "1px solid var(--border-active)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} color="#38bdf8" />
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#38bdf8", textTransform: "uppercase" }}>
              Social Media Studio • Proof of Work
            </span>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "800" }}>
            Auto-Generated "Before → After, Job Done" Card
          </h3>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleCopyCaption} className="btn-secondary" style={{ fontSize: "12px" }}>
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Caption"}
          </button>
          {onClose && (
            <button onClick={onClose} className="btn-secondary" style={{ padding: "4px 10px", fontSize: "12px" }}>
              ✕ Close
            </button>
          )}
        </div>
      </div>

      {/* Branded Social Card Container */}
      <div
        id="proof-of-work-canvas"
        style={{
          background: "linear-gradient(135deg, #090d16 0%, #111827 100%)",
          border: "2px solid rgba(14, 165, 233, 0.4)",
          borderRadius: "var(--radius-md)",
          padding: "24px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Card Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "var(--primary-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "900",
              fontSize: "18px"
            }}>
              F
            </div>
            <div>
              <div style={{ fontWeight: "800", fontSize: "15px", color: "#fff" }}>FixIt AI Verified Repair</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>{data.customer_location}</div>
            </div>
          </div>

          <div style={{ background: "rgba(16, 185, 129, 0.2)", border: "1px solid #10b981", color: "#34d399", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
            <ShieldCheck size={14} /> {data.warranty_given}
          </div>
        </div>

        {/* Before and After Image Comparison */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
          <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(239, 68, 68, 0.4)" }}>
            <img
              src={data.before_image}
              alt="Before Repair"
              style={{ width: "100%", height: "180px", objectFit: "cover" }}
            />
            <span style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(239, 68, 68, 0.85)", color: "#fff", fontSize: "10px", fontWeight: "800", padding: "3px 8px", borderRadius: "4px" }}>
              BEFORE REPAIR
            </span>
          </div>

          <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(16, 185, 129, 0.4)" }}>
            <img
              src={data.after_image}
              alt="After Repair"
              style={{ width: "100%", height: "180px", objectFit: "cover" }}
            />
            <span style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(16, 185, 129, 0.85)", color: "#fff", fontSize: "10px", fontWeight: "800", padding: "3px 8px", borderRadius: "4px" }}>
              AFTER REPAIR (FIXED)
            </span>
          </div>
        </div>

        {/* Diagnosis & Solution Highlights */}
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "14px", marginBottom: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc", marginBottom: "4px" }}>
            Problem: <span style={{ color: "#ef4444" }}>{data.issue_diagnosed}</span>
          </div>
          <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
            Action: <strong style={{ color: "#10b981" }}>{data.solution_performed}</strong>
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            Replaced: {data.parts_replaced}
          </div>
        </div>

        {/* Customer Review & Star Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.2)", borderRadius: "8px", padding: "12px 16px" }}>
          <div>
            <div style={{ display: "flex", gap: "2px", color: "#fbbf24", marginBottom: "4px" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill="#fbbf24" />
              ))}
            </div>
            <div style={{ fontSize: "12px", fontStyle: "italic", color: "#e2e8f0" }}>
              "{data.review}"
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#fff" }}>{data.technician_name}</div>
            <div style={{ fontSize: "10px", color: "#38bdf8" }}>{data.technician_badge}</div>
          </div>
        </div>

        {/* Hashtag Footer */}
        <div style={{ marginTop: "14px", fontSize: "10px", color: "#64748b", textAlign: "center" }}>
          {data.hashtags}
        </div>
      </div>
    </div>
  );
}
