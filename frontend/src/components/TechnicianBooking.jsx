import React, { useState, useEffect } from "react";
import { Star, MapPin, Clock, ShieldCheck, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { fetchTechnicians, createServiceRequest } from "../services/api";

export default function TechnicianBooking({ diagnosis, onBookingComplete, onCancel }) {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTechId, setSelectedTechId] = useState(null);
  const [dispatchType, setDispatchType] = useState("emergency"); // emergency or standard
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    const loadTechs = async () => {
      try {
        const data = await fetchTechnicians(diagnosis.appliance_type);
        setTechnicians(data);
        if (data.length > 0) {
          setSelectedTechId(data[0].id);
        }
      } catch (e) {
        console.error("Failed to load techs", e);
      } finally {
        setLoading(false);
      }
    };
    loadTechs();
  }, [diagnosis]);

  const handleConfirmBooking = async () => {
    setBookingInProgress(true);
    try {
      const payload = {
        diagnosis_id: diagnosis.id,
        customer_name: "Mahesh Peruri",
        customer_phone: "+91 98765 43210",
        customer_address: "Skyline Towers, Flat 402, Hitec City, Hyderabad",
        apartment_complex: "Skyline Towers",
        category: diagnosis.appliance_type,
        issue_title: diagnosis.detected_issue,
        severity: diagnosis.severity,
        preferred_technician_id: selectedTechId
      };
      const req = await createServiceRequest(payload);
      onBookingComplete(req);
    } catch (e) {
      console.error("Booking failed", e);
      alert("Booking failed. Please try again.");
    } finally {
      setBookingInProgress(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: "24px", border: "1px solid var(--border-active)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--primary)", fontWeight: "700" }}>
            FixIt Verified Dispatch Network
          </span>
          <h3 style={{ fontSize: "18px", fontWeight: "800" }}>
            Match with Nearby Verified Technicians
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Background checked, certified equipment, standardized upfront pricing
          </p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="btn-secondary" style={{ padding: "4px 10px", fontSize: "12px" }}>
            ✕ Back to Diagnosis
          </button>
        )}
      </div>

      {/* Dispatch Urgency Selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
        <button
          onClick={() => setDispatchType("emergency")}
          style={{
            background: dispatchType === "emergency" ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${dispatchType === "emergency" ? "#ef4444" : "var(--border-subtle)"}`,
            padding: "12px",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <Zap size={20} color="#ef4444" />
          <div>
            <div style={{ fontWeight: "700", fontSize: "13px", color: "#f87171" }}>
              Immediate Emergency Dispatch
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Arrives in ~15–20 mins (Priority routing)
            </div>
          </div>
        </button>

        <button
          onClick={() => setDispatchType("standard")}
          style={{
            background: dispatchType === "standard" ? "rgba(14, 165, 233, 0.15)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${dispatchType === "standard" ? "var(--primary)" : "var(--border-subtle)"}`,
            padding: "12px",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <Clock size={20} color="var(--primary)" />
          <div>
            <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--primary-glow)" }}>
              Scheduled Standard Visit
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Choose specific 1-hour convenience slot
            </div>
          </div>
        </button>
      </div>

      {/* Technicians List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
            Finding certified technicians nearby in Hitec City...
          </div>
        ) : (
          technicians.map((t) => {
            const isSelected = selectedTechId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTechId(t.id)}
                style={{
                  background: isSelected ? "rgba(14, 165, 233, 0.1)" : "rgba(255, 255, 255, 0.02)",
                  border: `1px solid ${isSelected ? "var(--primary)" : "var(--border-subtle)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <img
                    src={t.avatar_url || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150"}
                    alt={t.name}
                    style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border-active)" }}
                  />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>{t.name}</strong>
                      <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34d399", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px" }}>
                        {t.badge}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", fontSize: "12px", color: "var(--text-muted)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px", color: "#fbbf24", fontWeight: "700" }}>
                        <Star size={13} fill="#fbbf24" /> {t.rating} ({t.reviews_count} reviews)
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <MapPin size={13} /> {t.distance_km || 1.8} km away
                      </span>
                      <span>• {t.experience_years} yrs exp</span>
                    </div>

                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                      {t.bio}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right", paddingLeft: "16px" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Hourly Rate</div>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#38bdf8" }}>
                    ₹{t.hourly_rate_inr}
                  </div>
                  <div style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    border: `2px solid ${isSelected ? "var(--primary)" : "var(--text-muted)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "8px 0 0 auto",
                    background: isSelected ? "var(--primary)" : "transparent"
                  }}>
                    {isSelected && <CheckCircle2 size={14} color="#fff" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Button */}
      <button
        onClick={handleConfirmBooking}
        disabled={bookingInProgress || !selectedTechId}
        className="btn-primary"
        style={{ width: "100%", padding: "14px", fontSize: "15px", justifyContent: "center" }}
      >
        <Zap size={18} />
        {bookingInProgress ? "Dispatching Technician..." : "Confirm & Dispatch Verified Technician Now"}
      </button>
    </div>
  );
}
