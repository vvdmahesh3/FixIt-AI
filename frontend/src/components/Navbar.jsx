import React from "react";
import { Wrench, Zap, Users, CreditCard, Code, Sun, Moon, Globe } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, language, setLanguage, theme, toggleTheme }) {
  return (
    <header className="navbar">
      <div className="nav-brand" style={{ cursor: "pointer" }} onClick={() => setActiveTab("diagnose")}>
        <div className="brand-icon">
          <Wrench size={22} />
        </div>
        <div>
          <div className="brand-title">FixIt AI</div>
          <div className="brand-tagline">Point your camera at the problem. Get an answer.</div>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === "diagnose" ? "active" : ""}`}
          onClick={() => setActiveTab("diagnose")}
        >
          <Zap size={15} /> Diagnose & Fix
        </button>
        <button
          className={`nav-tab-btn ${activeTab === "technician" ? "active" : ""}`}
          onClick={() => setActiveTab("technician")}
        >
          <Wrench size={15} /> Technician Hub
        </button>
        <button
          className={`nav-tab-btn ${activeTab === "community" ? "active" : ""}`}
          onClick={() => setActiveTab("community")}
        >
          <Users size={15} /> Community Radar
        </button>
        <button
          className={`nav-tab-btn ${activeTab === "billing" ? "active" : ""}`}
          onClick={() => setActiveTab("billing")}
        >
          <CreditCard size={15} /> Billing & Metering
        </button>
        <button
          className={`nav-tab-btn ${activeTab === "widget" ? "active" : ""}`}
          onClick={() => setActiveTab("widget")}
        >
          <Code size={15} /> Embed Widget
        </button>
      </nav>

      <div className="nav-actions">
        {/* Multilingual Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Globe size={14} style={{ color: "var(--text-muted)" }} />
          <select
            className="lang-selector"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिन्दी (HI)</option>
            <option value="te">తెలుగు (TE)</option>
          </select>
        </div>

        {/* Theme Toggle */}
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}
