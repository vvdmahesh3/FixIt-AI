import React, { useState, useEffect, useRef } from "react";
import {
  Navigation,
  Phone,
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  MapPin,
  ShieldCheck,
  Send,
  Sparkles,
  ChevronRight
} from "lucide-react";
import {
  fetchServiceRequest,
  fetchRequestRoute,
  updateRequestStatus,
  submitRating,
  fetchChatMessages,
  sendChatMessage
} from "../services/api";

export default function LiveTracker({ requestId, onCompleteFlow }) {
  const [request, setRequest] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [eta, setEta] = useState(15);
  const [isDriving, setIsDriving] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [starRating, setStarRating] = useState(5);
  const [reviewText, setReviewText] = useState("Technician arrived quickly and solved the issue cleanly!");
  const [partsReplaced, setPartsReplaced] = useState("Blower Bushing & Filter Mesh");
  const [finalCost, setFinalCost] = useState(750);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadRequest();
    loadRoute();
    loadChat();

    // Setup WebSocket connection
    const ws = new WebSocket(`ws://localhost:8000/ws/tracker/${requestId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "GPS_UPDATE") {
          setCurrentProgress(data.progress_percent);
          setEta(data.eta_minutes);
          if (data.status === "in_progress") {
            setRequest((prev) => (prev ? { ...prev, status: "in_progress" } : null));
          }
        } else if (data.type === "CHAT_MESSAGE") {
          setMessages((prev) => [...prev, data]);
        } else if (data.type === "STATUS_CHANGED") {
          setRequest((prev) => (prev ? { ...prev, status: data.status } : null));
        }
      } catch (e) {
        console.error("WS message parse error", e);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const data = await fetchServiceRequest(requestId);
      setRequest(data);
      setEta(data.eta_minutes);
      if (data.status === "resolved") {
        setShowRatingModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadRoute = async () => {
    try {
      const data = await fetchRequestRoute(requestId);
      setRouteData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadChat = async () => {
    try {
      const msgs = await fetchChatMessages(requestId);
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    }
  };

  // Start realistic GPS driving simulation
  const handleStartSimulation = () => {
    setIsDriving(true);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "START_GPS_SIMULATION",
          start_lat: 17.4485,
          start_lng: 78.3750,
          dest_lat: 17.4435,
          dest_lng: 78.3810,
        })
      );
    }
    // Also advance DB status to en_route
    updateRequestStatus(requestId, "en_route");
    setRequest((prev) => ({ ...prev, status: "en_route" }));
  };

  const handleArrived = async () => {
    await updateRequestStatus(requestId, "in_progress");
    setRequest((prev) => ({ ...prev, status: "in_progress" }));
    setEta(0);
  };

  const handleResolveRepair = async () => {
    await updateRequestStatus(requestId, "resolved");
    setRequest((prev) => ({ ...prev, status: "resolved" }));
    setShowRatingModal(true);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    try {
      const sent = await sendChatMessage(requestId, "customer", "Mahesh Peruri", chatInput);
      setMessages((prev) => [...prev, sent]);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "CHAT_MESSAGE",
            sender_type: "customer",
            sender_name: "Mahesh Peruri",
            message: chatInput,
          })
        );
      }
      setChatInput("");

      // Simulate technician auto-reply after 1.5s
      setTimeout(async () => {
        const replyText = "Understood! I'm carrying the specific parts and tools. ETA ~5 mins.";
        const techMsg = await sendChatMessage(requestId, "technician", request?.technician?.name || "Technician", replyText);
        setMessages((prev) => [...prev, techMsg]);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitRating = async () => {
    try {
      await submitRating(requestId, starRating, reviewText);
      setShowRatingModal(false);
      if (onCompleteFlow) {
        onCompleteFlow(requestId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!request) {
    return <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>Loading live tracker...</div>;
  }

  const tech = request.technician || {};
  const statusSteps = ["assigned", "en_route", "in_progress", "resolved"];
  const currentStepIdx = statusSteps.indexOf(request.status);

  return (
    <div className="glass-card" style={{ padding: "24px", border: "1px solid var(--border-active)" }}>
      {/* Top Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", animation: "pulse-danger 2s infinite" }} />
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#34d399", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Live Real-Time Dispatch Stream • #{request.id}
            </span>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "2px" }}>
            {request.issue_title}
          </h2>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Destination: {request.customer_address}
          </div>
        </div>

        {/* Live Simulation Controls */}
        <div style={{ display: "flex", gap: "8px" }}>
          {request.status === "assigned" && (
            <button onClick={handleStartSimulation} className="btn-primary" style={{ fontSize: "13px" }}>
              <Navigation size={14} /> Start Live GPS Drive
            </button>
          )}
          {request.status === "en_route" && (
            <button onClick={handleArrived} className="btn-secondary" style={{ fontSize: "13px" }}>
              Mark Arrived at House
            </button>
          )}
          {request.status === "in_progress" && (
            <button onClick={handleResolveRepair} className="btn-primary" style={{ fontSize: "13px", background: "linear-gradient(135deg, #10b981, #059669)" }}>
              <CheckCircle size={14} /> Finish & Mark Resolved
            </button>
          )}
          {request.status === "resolved" && (
            <button onClick={() => setShowRatingModal(true)} className="btn-secondary" style={{ fontSize: "13px" }}>
              <Star size={14} /> View Rating / Proof
            </button>
          )}
        </div>
      </div>

      {/* Progress Pipeline Stepper */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "20px" }}>
        {[
          { label: "Assigned", desc: "Technician accepted" },
          { label: "En Route", desc: "Driving with tools" },
          { label: "In Progress", desc: "Diagnosing & fixing" },
          { label: "Resolved", desc: "Certified fixed" },
        ].map((st, i) => {
          const isDone = i <= currentStepIdx;
          const isCurrent = i === currentStepIdx;
          return (
            <div
              key={i}
              style={{
                background: isCurrent ? "rgba(14, 165, 233, 0.15)" : isDone ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isCurrent ? "var(--primary)" : isDone ? "#10b981" : "var(--border-subtle)"}`,
                borderRadius: "var(--radius-sm)",
                padding: "10px",
                position: "relative"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "700", color: isCurrent ? "var(--primary-glow)" : isDone ? "#34d399" : "var(--text-muted)" }}>
                {isDone ? <CheckCircle size={14} /> : <Clock size={14} />}
                {st.label}
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                {st.desc}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid-2col">
        {/* Animated Map Visualizer */}
        <div style={{ background: "#060911", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", padding: "16px", position: "relative", minHeight: "340px", overflow: "hidden" }}>
          {/* Map Grid Background Lines */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }} />

          {/* Road Network Lines (Simulated SVG road map) */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <path
              d="M 60 260 Q 180 200, 240 180 T 400 90"
              fill="none"
              stroke="rgba(14, 165, 233, 0.25)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 60 260 Q 180 200, 240 180 T 400 90"
              fill="none"
              stroke="var(--primary-glow)"
              strokeWidth="3"
              strokeDasharray="6 6"
            />
          </svg>

          {/* Customer Building Destination Pin */}
          <div style={{ position: "absolute", top: "70px", right: "60px", textAlign: "center" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)",
              margin: "0 auto"
            }}>
              <MapPin size={22} />
            </div>
            <div style={{ background: "rgba(0,0,0,0.7)", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", marginTop: "4px" }}>
              Skyline Towers
            </div>
          </div>

          {/* Animated Technician Vehicle */}
          <div
            style={{
              position: "absolute",
              bottom: `${Math.min(75, 20 + currentProgress * 0.6)}%`,
              left: `${Math.min(80, 15 + currentProgress * 0.7)}%`,
              transition: "all 1.6s ease",
              textAlign: "center"
            }}
          >
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "var(--primary-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 0 22px rgba(0, 240, 255, 0.7)",
              margin: "0 auto",
              border: "2px solid #fff"
            }}>
              <Navigation size={22} style={{ transform: "rotate(45deg)" }} />
            </div>
            <div style={{ background: "rgba(0,0,0,0.85)", border: "1px solid var(--border-active)", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", color: "#38bdf8", marginTop: "4px", whiteSpace: "nowrap" }}>
              {tech.name || "Technician"} • {eta}m away
            </div>
          </div>

          {/* Bottom Map Overlay HUD */}
          <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(12px)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>LIVE ETA COUNTDOWN</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#38bdf8" }}>
                {eta > 0 ? `${eta} mins` : "Arrived On Site"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>DISTANCE</div>
              <div style={{ fontSize: "14px", fontWeight: "700" }}>
                {Math.max(0.1, (request.distance_km * (1 - currentProgress / 100))).toFixed(1)} km
              </div>
            </div>

            <div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>SPEED</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#10b981" }}>
                {request.status === "en_route" ? "28 km/h" : "0 km/h"}
              </div>
            </div>
          </div>
        </div>

        {/* Technician Profile & Live Chat Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Tech Card */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src={tech.avatar_url || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150"}
                alt={tech.name}
                style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div>
                <strong style={{ fontSize: "15px" }}>{tech.name || "Ramesh Sharma"}</strong>
                <div style={{ fontSize: "11px", color: "#34d399", fontWeight: "600" }}>
                  {tech.badge || "FixIt Master Certified"}
                </div>
                <div style={{ fontSize: "11px", color: "#fbbf24", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                  <Star size={12} fill="#fbbf24" /> {tech.rating || 4.9} ({tech.reviews_count || 86} reviews)
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <a
                href={`tel:${tech.phone || "+919849011223"}`}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid #10b981",
                  color: "#34d399",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none"
                }}
                title="Call Technician"
              >
                <Phone size={16} />
              </a>
              <button
                onClick={() => setChatOpen(!chatOpen)}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "rgba(14, 165, 233, 0.15)",
                  border: "1px solid var(--primary)",
                  color: "var(--primary-glow)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
                title="Message Technician"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>

          {/* Live Chat Box */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", height: "260px" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              <MessageSquare size={14} color="var(--primary)" />
              In-App Dispatch Chat (Direct Line)
            </div>

            {/* Message list */}
            <div style={{ flex: 1, padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
              {messages.map((m, idx) => {
                const isCustomer = m.sender_type === "customer";
                const isSystem = m.sender_type === "system";
                return (
                  <div
                    key={idx}
                    style={{
                      alignSelf: isSystem ? "center" : isCustomer ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      background: isSystem ? "rgba(255,255,255,0.05)" : isCustomer ? "var(--primary-gradient)" : "rgba(255,255,255,0.08)",
                      border: isSystem ? "1px dashed var(--border-subtle)" : "none",
                      color: "#fff",
                      padding: "7px 12px",
                      borderRadius: "10px",
                      fontSize: "12px"
                    }}
                  >
                    {!isSystem && (
                      <div style={{ fontSize: "10px", opacity: 0.7, marginBottom: "2px" }}>
                        {m.sender_name}
                      </div>
                    )}
                    <div>{m.message}</div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} style={{ padding: "8px", display: "flex", gap: "6px", borderTop: "1px solid var(--border-subtle)" }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask technician ETA, gate pass info..."
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-subtle)",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  outline: "none"
                }}
              />
              <button type="submit" className="btn-primary" style={{ padding: "8px 14px", fontSize: "12px" }}>
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Post-Repair Rating Modal */}
      {showRatingModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div className="glass-card" style={{ maxWidth: "480px", width: "100%", padding: "26px", border: "1px solid var(--border-active)" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                border: "2px solid #10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px",
                color: "#10b981"
              }}>
                <CheckCircle size={28} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "800" }}>Repair Completed & Verified!</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                Rate {tech.name || "your technician"} to build community trust & generate proof-of-work
              </p>
            </div>

            {/* Star Rating */}
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setStarRating(s)}
                  style={{ background: "transparent", border: "none", cursor: "pointer" }}
                >
                  <Star size={28} fill={s <= starRating ? "#fbbf24" : "none"} color="#fbbf24" />
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Parts Replaced
                </label>
                <input
                  type="text"
                  value={partsReplaced}
                  onChange={(e) => setPartsReplaced(e.target.value)}
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", padding: "8px 12px", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Final Amount Paid (₹)
                </label>
                <input
                  type="number"
                  value={finalCost}
                  onChange={(e) => setFinalCost(e.target.value)}
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", padding: "8px 12px", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Review & Feedback
                </label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", padding: "8px 12px", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
                />
              </div>
            </div>

            <button
              onClick={handleSubmitRating}
              className="btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: "14px", justifyContent: "center" }}
            >
              <Sparkles size={16} /> Submit Rating & View Social Proof
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
