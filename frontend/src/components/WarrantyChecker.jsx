import React, { useState, useEffect } from "react";
import { ShieldCheck, FileText, Upload, AlertCircle, Phone, Building } from "lucide-react";
import { uploadInvoiceOCR, fetchWarranties } from "../services/api";

export default function WarrantyChecker({ onClose }) {
  const [warranties, setWarranties] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [brandHint, setBrandHint] = useState("Voltas");
  const [activeTab, setActiveTab] = useState("scan");
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    loadWarranties();
  }, []);

  const loadWarranties = async () => {
    try {
      const data = await fetchWarranties();
      setWarranties(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulatedUpload = async () => {
    setUploading(true);
    try {
      const res = await uploadInvoiceOCR(null, brandHint);
      setScanResult(res);
      loadWarranties();
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: "24px", border: "1px solid var(--border-active)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#10b981"
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: "700" }}>Warranty & Invoice OCR Vault</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Detect active brand coverage to save money & avoid paying local technicians
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
        {/* Upload / OCR Area */}
        <div style={{ background: "rgba(0,0,0,0.25)", padding: "20px", borderRadius: "var(--radius-sm)" }}>
          <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>
            Upload Appliance Receipt or Invoice
          </h4>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Appliance Brand
            </label>
            <select
              value={brandHint}
              onChange={(e) => setBrandHint(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px"
              }}
            >
              <option value="Voltas">Voltas (TATA)</option>
              <option value="Daikin">Daikin Inverter</option>
              <option value="LG">LG Electronics</option>
              <option value="Samsung">Samsung</option>
              <option value="Havells">Havells</option>
              <option value="AO Smith">AO Smith Geyser</option>
            </select>
          </div>

          <div
            style={{
              border: "2px dashed var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              padding: "24px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: "rgba(255,255,255,0.02)"
            }}
            onClick={handleSimulatedUpload}
          >
            <FileText size={32} style={{ color: "var(--primary)", margin: "0 auto 8px" }} />
            <div style={{ fontSize: "13px", fontWeight: "600" }}>
              {uploading ? "Analyzing Invoice OCR..." : "Click to Scan Sample Invoice"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              PDF, JPG, PNG invoices from Croma, Reliance Digital, Amazon
            </div>
          </div>

          <button
            onClick={handleSimulatedUpload}
            disabled={uploading}
            className="btn-primary"
            style={{ width: "100%", marginTop: "14px", fontSize: "13px" }}
          >
            <Upload size={15} /> {uploading ? "Extracting Data..." : "Run Instant Invoice OCR"}
          </button>
        </div>

        {/* Scan Result or Active Vault */}
        <div>
          {scanResult ? (
            <div
              style={{
                background: scanResult.is_under_warranty ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                border: `1px solid ${scanResult.is_under_warranty ? "#10b981" : "#f59e0b"}`,
                borderRadius: "var(--radius-sm)",
                padding: "18px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <ShieldCheck size={20} color={scanResult.is_under_warranty ? "#10b981" : "#f59e0b"} />
                <strong style={{ fontSize: "15px", color: scanResult.is_under_warranty ? "#34d399" : "#fbbf24" }}>
                  {scanResult.is_under_warranty ? "ACTIVE WARRANTY COVERAGE DETECTED!" : "OUT OF WARRANTY"}
                </strong>
              </div>

              <div style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: "1.5", marginBottom: "12px" }}>
                {scanResult.advisory}
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div><strong>Retailer:</strong> {scanResult.retailer_name}</div>
                <div><strong>Model:</strong> {scanResult.model_number}</div>
                <div><strong>Expires On:</strong> {scanResult.expiry_date} ({scanResult.days_remaining} days left)</div>
                <div style={{ color: "#38bdf8", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={13} /> <strong>Toll Free:</strong> {scanResult.authorized_phone}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "10px" }}>
                Saved Appliance Warranties ({warranties.length})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "240px", overflowY: "auto" }}>
                {warranties.map((w) => (
                  <div
                    key={w.id}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "8px",
                      padding: "12px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "13px" }}>{w.brand} {w.appliance_type}</strong>
                      <span style={{ fontSize: "11px", color: w.is_under_warranty ? "#10b981" : "#f59e0b", fontWeight: "700" }}>
                        {w.is_under_warranty ? `Active (${w.days_remaining}d left)` : "Expired"}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                      Expires: {w.expiry_date} • Center: {w.authorized_center_phone}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
