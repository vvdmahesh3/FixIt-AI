/**
 * FixIt AI — Embeddable "Diagnose My Problem" Widget
 * Lightweight, zero-dependency widget for society portals (MyGate, NoBroker, Hostel Wardens).
 */
(function () {
  const API_URL = "http://localhost:8000/api/v1";

  // Create launcher button
  const launcher = document.createElement("div");
  launcher.id = "fixit-widget-launcher";
  launcher.innerHTML = `
    <button id="fixit-bubble-btn" style="
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 62px;
      height: 62px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
      box-shadow: 0 8px 24px rgba(14, 165, 233, 0.45);
      border: 2px solid rgba(255,255,255,0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      transition: all 0.25s ease;
    ">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    </button>
  `;
  document.body.appendChild(launcher);

  // Create Modal Overlay
  const modal = document.createElement("div");
  modal.id = "fixit-modal-container";
  modal.style.cssText = `
    position: fixed;
    bottom: 96px;
    right: 24px;
    width: 380px;
    max-height: 580px;
    background: #0f172a;
    color: #f8fafc;
    border-radius: 20px;
    box-shadow: 0 20px 45px rgba(0,0,0,0.6);
    border: 1px solid rgba(255,255,255,0.15);
    display: none;
    flex-direction: column;
    overflow: hidden;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  modal.innerHTML = `
    <div style="background: linear-gradient(135deg, #0ea5e9, #4f46e5); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 20px;">⚡</span>
        <div>
          <div style="font-weight: 700; font-size: 15px;">FixIt AI Assistant</div>
          <div style="font-size: 11px; opacity: 0.85;">Point your camera at the problem</div>
        </div>
      </div>
      <button id="fixit-close-btn" style="background: transparent; border: none; color: white; font-size: 20px; cursor: pointer;">&times;</button>
    </div>

    <div style="padding: 16px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px;" id="fixit-modal-body">
      <div style="background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; padding: 20px; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 6px;">📷</div>
        <div style="font-size: 13px; font-weight: 600;">Snap or Upload Broken Item</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">AC, Geyser, Plumbing, Fridge</div>
        <button id="fixit-demo-btn" style="margin-top: 12px; background: #0ea5e9; border: none; color: white; padding: 7px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">
          Run Quick AI Diagnosis
        </button>
      </div>

      <div id="fixit-result-box" style="display: none; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px;">
        <div id="fixit-badge" style="display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; margin-bottom: 6px;"></div>
        <div id="fixit-issue-title" style="font-size: 14px; font-weight: 700; color: #f8fafc;"></div>
        <div id="fixit-summary" style="font-size: 12px; color: #cbd5e1; margin-top: 4px; line-height: 1.4;"></div>
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; display: flex; justify-content: space-between;">
          <span style="color: #94a3b8;">Est. Repair: <strong id="fixit-cost" style="color: #38bdf8;">₹850</strong></span>
          <a href="http://localhost:5173" target="_blank" style="color: #38bdf8; text-decoration: none; font-weight: 600;">Open Full FixIt App &rarr;</a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const bubbleBtn = document.getElementById("fixit-bubble-btn");
  const closeBtn = document.getElementById("fixit-close-btn");
  const demoBtn = document.getElementById("fixit-demo-btn");
  const resultBox = document.getElementById("fixit-result-box");
  const badge = document.getElementById("fixit-badge");
  const issueTitle = document.getElementById("fixit-issue-title");
  const summary = document.getElementById("fixit-summary");

  bubbleBtn.addEventListener("click", () => {
    modal.style.display = modal.style.display === "none" ? "flex" : "none";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  demoBtn.addEventListener("click", async () => {
    demoBtn.innerText = "Analyzing Photo...";
    try {
      const formData = new FormData();
      formData.append("preset_name", "ac_rattling.jpg");
      formData.append("note_text", "Rattling fan sound");
      formData.append("language", "en");

      const res = await fetch(`${API_URL}/diagnosis/diagnose`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      resultBox.style.display = "block";
      issueTitle.innerText = data.detected_issue;
      summary.innerText = data.summary;
      
      if (data.severity === "High") {
        badge.style.background = "#ef4444";
        badge.innerText = "DANGER — HIGH SEVERITY";
      } else if (data.severity === "Medium") {
        badge.style.background = "#f59e0b";
        badge.innerText = "CAUTION — MEDIUM SEVERITY";
      } else {
        badge.style.background = "#10b981";
        badge.innerText = "SAFE DIY — LOW SEVERITY";
      }
      demoBtn.innerText = "Re-scan with Camera";
    } catch (e) {
      demoBtn.innerText = "Analysis Failed (Backend Offline)";
    }
  });
})();
