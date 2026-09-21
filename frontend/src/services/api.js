const BASE_URL = "http://localhost:8000/api/v1";

export async function runDiagnosis({ presetName, file, noteText, language = "en" }) {
  const formData = new FormData();
  if (file) {
    formData.append("image", file);
  }
  if (presetName) {
    formData.append("preset_name", presetName);
  }
  formData.append("note_text", noteText || "");
  formData.append("language", language || "en");

  const res = await fetch(`${BASE_URL}/diagnosis/diagnose`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Diagnosis failed");
  return res.json();
}

export async function answerTriageQuestion(diagnosisId, questionId, answer) {
  const res = await fetch(`${BASE_URL}/diagnosis/${diagnosisId}/triage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question_id: questionId, answer }),
  });
  if (!res.ok) throw new Error("Triage answer failed");
  return res.json();
}

export async function calculateCostMatrix(payload) {
  const res = await fetch(`${BASE_URL}/diagnosis/calculate-cost`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Cost calculation failed");
  return res.json();
}

export async function fetchTechnicians(category) {
  const url = category ? `${BASE_URL}/technicians?category=${encodeURIComponent(category)}` : `${BASE_URL}/technicians`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch technicians");
  return res.json();
}

export async function createServiceRequest(payload) {
  const res = await fetch(`${BASE_URL}/service-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create service request");
  return res.json();
}

export async function fetchServiceRequest(id) {
  const res = await fetch(`${BASE_URL}/service-requests/${id}`);
  if (!res.ok) throw new Error("Failed to fetch service request");
  return res.json();
}

export async function fetchRequestRoute(id) {
  const res = await fetch(`${BASE_URL}/service-requests/${id}/route`);
  if (!res.ok) throw new Error("Failed to fetch route");
  return res.json();
}

export async function updateRequestStatus(id, status, lat, lng, eta) {
  const res = await fetch(`${BASE_URL}/service-requests/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status,
      technician_lat: lat,
      technician_lng: lng,
      eta_minutes: eta,
    }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function submitRating(id, rating, reviewText) {
  const res = await fetch(`${BASE_URL}/service-requests/${id}/rating`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating, review_text: reviewText }),
  });
  if (!res.ok) throw new Error("Failed to submit rating");
  return res.json();
}

export async function fetchChatMessages(requestId) {
  const res = await fetch(`${BASE_URL}/service-requests/${requestId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function sendChatMessage(requestId, senderType, senderName, message) {
  const res = await fetch(`${BASE_URL}/service-requests/${requestId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender_type: senderType, sender_name: senderName, message }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function uploadInvoiceOCR(file, brandHint) {
  const formData = new FormData();
  if (file) formData.append("file", file);
  formData.append("brand_hint", brandHint || "Voltas");

  const res = await fetch(`${BASE_URL}/warranty/upload-invoice`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to parse invoice");
  return res.json();
}

export async function fetchWarranties() {
  const res = await fetch(`${BASE_URL}/warranty/list`);
  if (!res.ok) throw new Error("Failed to fetch warranties");
  return res.json();
}

export async function fetchCommunityAlerts() {
  const res = await fetch(`${BASE_URL}/community/alerts`);
  if (!res.ok) throw new Error("Failed to fetch community alerts");
  return res.json();
}

export async function fetchBillingSummary() {
  const res = await fetch(`${BASE_URL}/billing/summary`);
  if (!res.ok) throw new Error("Failed to fetch billing");
  return res.json();
}

export async function upgradeHouseholdPlan() {
  const res = await fetch(`${BASE_URL}/billing/household/upgrade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_tier: "pro" }),
  });
  if (!res.ok) throw new Error("Failed to upgrade plan");
  return res.json();
}

export async function topupTechWallet(technicianId, amount) {
  const res = await fetch(`${BASE_URL}/billing/technician/topup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ technician_id: technicianId, amount_inr: amount }),
  });
  if (!res.ok) throw new Error("Failed to topup wallet");
  return res.json();
}

export async function fetchProofOfWork(requestId) {
  const res = await fetch(`${BASE_URL}/social/proof-of-work/${requestId}`);
  if (!res.ok) throw new Error("Failed to fetch proof of work");
  return res.json();
}
