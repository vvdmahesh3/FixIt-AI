import React, { useState } from "react";
import { MessageSquare, CheckCircle, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { answerTriageQuestion } from "../services/api";

export default function TriageChat({ diagnosis, onDiagnosisUpdated }) {
  const [loadingQuestionId, setLoadingQuestionId] = useState(null);

  if (!diagnosis || !diagnosis.follow_up_questions || diagnosis.follow_up_questions.length === 0) {
    return null;
  }

  const userAnswers = diagnosis.user_answers || {};

  const handleSelectOption = async (questionId, option) => {
    try {
      setLoadingQuestionId(questionId);
      const updated = await answerTriageQuestion(diagnosis.id, questionId, option);
      onDiagnosisUpdated(updated);
    } catch (err) {
      console.error("Failed to submit triage answer:", err);
    } finally {
      setLoadingQuestionId(null);
    }
  };

  return (
    <div className="glass-card" style={{ padding: "20px", marginTop: "20px", border: "1px solid var(--border-active)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(14, 165, 233, 0.15)",
            border: "1px solid var(--border-active)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)"
          }}>
            <MessageSquare size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Smart Multi-Turn Triage Assistant</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Answering these quick questions refines severity & safety warnings (like a real technician on a call)
            </p>
          </div>
        </div>

        <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: "12px", color: "var(--primary-glow)" }}>
          {Object.keys(userAnswers).length} / {diagnosis.follow_up_questions.length} answered
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {diagnosis.follow_up_questions.map((q, idx) => {
          const isAnswered = !!userAnswers[q.id];
          const selectedAnswer = userAnswers[q.id];
          const isLoading = loadingQuestionId === q.id;

          return (
            <div
              key={q.id}
              style={{
                background: isAnswered ? "rgba(16, 185, 129, 0.05)" : "rgba(255, 255, 255, 0.02)",
                border: isAnswered ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "14px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                  Q{idx + 1}: {q.question}
                </span>
                {isAnswered && (
                  <span style={{ fontSize: "11px", color: "#10b981", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
                    <CheckCircle size={13} /> Logged
                  </span>
                )}
              </div>

              {/* Options */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswer === opt;
                  return (
                    <button
                      key={optIdx}
                      disabled={isLoading}
                      onClick={() => handleSelectOption(q.id, opt)}
                      style={{
                        background: isSelected
                          ? "var(--primary-gradient)"
                          : "rgba(255, 255, 255, 0.05)",
                        border: isSelected
                          ? "1px solid var(--primary-glow)"
                          : "1px solid var(--border-subtle)",
                        color: isSelected ? "#ffffff" : "var(--text-secondary)",
                        padding: "6px 14px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "12px",
                        fontWeight: isSelected ? "700" : "500",
                        cursor: isLoading ? "wait" : "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {opt}
                      {isSelected && <CheckCircle size={12} />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
