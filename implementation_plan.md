# FixIt AI — "Point your camera at the problem. Get an answer."

FixIt AI is an intelligent home maintenance & emergency repair decision platform. It solves the triple dilemma faced by households, students, and hostel wardens when an appliance or fixture breaks:
1. **What is actually wrong?** (Multi-modal vision + multilingual voice triage)
2. **Is it safe to touch?** (Rigorous safety & severity rating: Low DIY vs. Medium Caution vs. High DANGER)
3. **Is it cheaper to fix or replace?** (Data-driven repair-vs-replace economic calculator + warranty invoice checker)
4. **Who can fix it right now?** (One-tap verified technician matching, live animated tracking pipeline, two-way chat, and auto-generated social proof-of-work)

---

## User Review Required

> [!IMPORTANT]
> **Key Architecture & Technology Stack Alignment:**
> - **Backend**: FastAPI (Python 3.13) with SQLite / async SQLAlchemy for persistent storage, WebSockets for real-time live technician movement and status updates, and a dual-mode AI engine (Gemini Vision 1.5/2.0 with an intelligent zero-config offline fallback engine packed with rich electrical, plumbing, HVAC, and appliance domain knowledge).
> - **Frontend**: React + Vite using clean, modern Vanilla CSS with design tokens, glassmorphism, responsive layouts, micro-animations, and full dark/light theme support (avoiding Tailwind to maintain maximum custom aesthetic control as per guidelines).
> - **Real-Time Tracking**: WebSockets delivering simulated live GPS coordinates, distance countdown, speed, and status pipeline (`Requested` → `Assigned` → `En Route` → `In Progress` → `Resolved`).
> - **Embeddable Widget**: A standalone, zero-dependency `widget.js` script with an interactive embedding playground simulating a residential society portal (e.g. MyGate / NoBroker).
> - **Multilingual Voice Support**: English, Hindi, and Telugu voice recording, speech recognition, and audio prompts.

---

## System Architecture

```mermaid
graph TD
    User([User: Camera / Voice / Invoice]) --> Frontend[FixIt AI React Web App & Embeddable Widget]
    Frontend -->|REST API & WebSockets| Backend[FastAPI Backend Server]
    
    subgraph AI Decision Core
        Backend --> VisionEngine[Vision & Multi-turn Diagnosis Engine]
        VisionEngine --> SeverityScorer[Safety & Severity Scorer (Low / Med / High)]
        VisionEngine --> RepairReplaceCalc[Repair vs. Replace Economic Matrix]
        VisionEngine --> WarrantyParser[Invoice OCR & Warranty Tracker]
    end
    
    subgraph Real-Time Dispatch & Ecosystem
        Backend --> MatchingService[Verified Technician Geo-Matcher]
        Backend --> LiveTrackerWS[WebSocket Live GPS & Status Pipeline]
        Backend --> CommunityEngine[Apartment Fault Cluster Detector]
        Backend --> SocialStudio[Proof-of-Work Social Card Generator]
        Backend --> MeteringEngine[Stripe-Style Household & Technician Metering]
    end

    Backend --> SQLite[(Persistent Database)]
```

---

## Proposed Changes

All files will be placed under the requested folder: `m:\mahesh\Intenships\FlyRank-AI\FixIt-AI\`.

### 1. Backend Service (`FixIt-AI/backend/`)

#### [NEW] [requirements.txt](file:///m:/mahesh/Intenships/FlyRank-AI/FixIt-AI/backend/requirements.txt)
- Dependencies: `fastapi`, `uvicorn[standard]`, `pydantic`, `sqlalchemy`, `aiosqlite`, `python-multipart`, `pillow`, `google-genai`, `requests`.

#### [NEW] [app/core/config.py](file:///m:/mahesh/Intenships/FlyRank-AI/FixIt-AI/backend/app/core/config.py)
- Settings configuration, CORS origins, optional `GEMINI_API_KEY`, upload directory, and default constants.

#### [NEW] [app/core/database.py](file:///m:/mahesh/Intenships/FlyRank-AI/FixIt-AI/backend/app/core/database.py)
- SQLAlchemy async engine, session factory, and base model declaration.

#### [NEW] [app/models/](file:///m:/mahesh/Intenships/FlyRank-AI/FixIt-AI/backend/app/models/)
- `technician.py`: Verified technician profile, category (Electrician, Plumber, AC/HVAC, Appliance Repair), rating, distance, hourly rate, lead wallet balance.
- `diagnosis.py`: Diagnostic session, image path, multi-turn follow-up Q&A history, identified issue, severity level, DIY steps, cost estimate.
- `service_request.py`: Customer booking, matched technician, status history (`pending`, `assigned`, `en_route`, `in_progress`, `resolved`), live GPS coordinates, customer review & rating.
- `warranty.py`: Registered appliance warranties, invoice OCR extracted date, validity period.
- `community.py`: Community fault logs, apartment complexes, defect pattern alert flags.
- `billing.py`: Household subscription tier (Free vs. Pro), usage counter, technician pay-per-lead ledger.

#### [NEW] [app/services/](file:///m:/mahesh/Intenships/FlyRank-AI/FixIt-AI/backend/app/services/)
- `ai_vision_service.py`: Intelligent multi-modal vision diagnosis with bounding box coordinates, follow-up triage question generator, severity assessment, and DIY safety checklist. Supports Gemini Vision API when configured, paired with a deterministic, rich domain knowledge engine.
- `speech_service.py`: Multilingual audio transcript simulator supporting English, Hindi, and Telugu.
- `ocr_service.py`: Invoice reader detecting purchase dates, warranty duration, and authorized service center routing.
- `matching_service.py`: Geo-spatial & category ranking algorithm matching requests with top nearby verified technicians.

#### [NEW] [app/api/](file:///m:/mahesh/Intenships/FlyRank-AI/FixIt-AI/backend/app/api/)
- `diagnosis.py`: Endpoints for uploading images/voice, initial identification, answering follow-up questions, generating repair-vs-replace calculations.
- `technicians.py`: Endpoints for technician list, filtering by category/rating, technician dashboard views.
- `service_requests.py`: Endpoints for creating service requests, advancing status, rating technicians.
- `warranty.py`: Endpoints for uploading invoices, checking remaining warranty.
- `community.py`: Endpoints for apartment community fault alerts and anomaly detection.
- `billing.py`: Household tier quotas, Stripe-style metering logs, technician lead wallet management.
- `social.py`: Dynamic "Before → After" proof-of-work graphic generator for completed repairs.
- `websocket.py`: Real-time WebSocket router broadcasting technician live movements, GPS updates, and chat messages.

#### [NEW] [app/seed_data.py](file:///m:/mahesh/Intenships/FlyRank-AI/FixIt-AI/backend/app/seed_data.py)
- Pre-populated verified technicians in Hyderabad (Hitec City, Madhapur, Gachibowli, Kondapur), realistic apartment complexes (Skyline Towers, Cyber Meadows), and sample historical fault records.

#### [NEW] [run.py](file:///m:/mahesh/Intenships/FlyRank-AI/FixIt-AI/backend/run.py)
- Fast startup script with database initialization and server launcher.

---

### 2. Frontend Application (`FixIt-AI/frontend/`)

Built with modern React (Vite) and bespoke Vanilla CSS design tokens.

#### [NEW] [src/index.css](file:///m:/mahesh/Intenships/FlyRank-AI/FixIt-AI/frontend/src/index.css)
- Sleek modern design system:
  - Deep dark mode & crisp light mode theme variables
  - Glassmorphic card surfaces (`backdrop-filter: blur(12px)`)
  - Accent gradients (electric cyan, amber warning, emerald success, coral danger)
  - Animated glowing borders, pulsing status pills, and micro-interactions
  - Responsive layout tokens for mobile, tablet, and desktop

#### [NEW] [src/components/](file:///m:/mahesh/Intenships/FlyRank-AI/FixIt-AI/frontend/src/components/)
- `Navbar.jsx`: Brand header, navigation between Customer View, Technician View, Community Radar, and Metering Dashboard; theme switch, and language selector (EN / HI / TE).
- `DiagnosePortal.jsx`: Main hub for user interaction:
  - Photo / video upload dropzone with live webcam capture option
  - Instant One-Click Demo Presets (e.g., "Sparking Geyser Switch", "Dripping PVC Sink Pipe", "Whirring LG Refrigerator", "AC Compressor Warm Air")
  - Voice Note Recorder with visualizer and EN/HI/TE selection
  - Interactive Multi-Turn AI Triage Dialog (asking and answering 1–3 contextual follow-up questions)
- `DiagnosisResult.jsx`:
  - Interactive Image viewer with AI bounding-box problem highlight
  - Severity Level Banner (Low DIY / Medium Caution / High DANGER STOP) with contextual safety instructions
  - Step-by-Step DIY troubleshooting checklist with safety gear reminders
- `CostEstimator.jsx`:
  - Interactive Repair vs. Replace economic calculator
  - Sliders for appliance age, original cost, estimated repair cost vs. new appliance cost
  - Visual 50% economic rule meter recommendation
- `WarrantyChecker.jsx`:
  - Invoice scanner / receipt upload
  - Warranty status banner ("Under Warranty until March 2027 — contact authorized center")
- `TechnicianBooking.jsx`:
  - Match card showing nearby verified technicians with badges, distance, rating, and hourly rate
  - One-tap booking with emergency or scheduled dispatch
- `LiveTracker.jsx`:
  - Real-time animated map interface with moving technician vehicle
  - Live progress pipeline: `Requested` → `Assigned` → `En Route` → `In Progress` → `Resolved`
  - Real-time WebSocket event listener
  - In-app two-way customer-technician live chat modal
- `TechnicianPortal.jsx`:
  - Dedicated view for technicians: incoming leads board, accept/decline, status updater, earnings wallet
  - "Before & After" photo upload tool
- `ProofOfWorkStudio.jsx`:
  - Auto-generated viral social media share cards ("Before → After, Job Done") with technician branding, warranty tag, and download/share button
- `CommunityAlerts.jsx`:
  - Neighborhood fault cluster map and apartment complex anomaly alerts
- `BillingDashboard.jsx`:
  - Household tier cards (Free vs. Pro)
  - Technician Pay-Per-Lead wallet & transaction history
  - LLM token metering & API cost analytics
- `WidgetPlayground.jsx`:
  - Interactive demonstration showing FixIt AI embedded on a mock apartment portal ("Skyline Towers Residents Hub") with copyable embed script snippet

#### [NEW] [public/widget.js](file:///m:/mahesh/Intenships/FlyRank-AI/FixIt-AI/frontend/public/widget.js)
- Standalone embeddable JavaScript widget that renders a floating launcher button and self-contained diagnosis modal on any webpage.

---

## Verification Plan

### Automated Tests
1. Backend test suite (`FixIt-AI/backend/tests/`):
   - `test_diagnosis.py`: Verify multi-turn diagnosis, severity calculation, and repair-vs-replace math.
   - `test_service_requests.py`: Verify technician matching, booking lifecycle, and status transitions.
   - `test_billing.py`: Verify household quota limits and technician lead wallet deductions.
2. Frontend build verification:
   - Run `npm run build` in `FixIt-AI/frontend` to ensure 0 lint/type/bundling errors.

### Manual & Interactive Verification
1. **Full Diagnostic Flow**:
   - Select a sample preset (or upload a photo) + attach a voice note in Hindi/Telugu.
   - Answer the follow-up triage questions.
   - Verify severity badge (High for electrical/gas risk, Low for tap aerator).
   - Inspect the Repair-vs-Replace calculator slider.
2. **Technician Booking & Real-Time Tracking**:
   - One-tap book a verified technician.
   - Observe the live animated GPS map and WebSocket status advancement (`Assigned` → `En Route` → `In Progress` → `Resolved`).
   - Send live messages in the in-app chat.
3. **Proof-of-Work Generation**:
   - Complete a repair and generate the "Before → After" social media card; verify high-res visual render.
4. **Community Fault Clustering**:
   - Verify apartment anomaly detection when multiple faults are logged for the same complex.
5. **Widget Integration**:
   - Open the Widget Playground and verify the floating embeddable widget functions autonomously.
