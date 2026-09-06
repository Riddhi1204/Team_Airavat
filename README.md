# NASMR — National AI-System for Municipal & Regional development

> **Turning citizen voices into actionable, data-driven decisions.**

CivicPulse is a full-stack civic technology platform that connects **citizens and government authorities through a unified, intelligent civic issue management system**.

Citizens can report problems such as damaged roads, water supply issues, garbage, streetlights, drainage, and other infrastructure concerns using **text, images, voice, location, and multilingual input**.

On the authority side, CivicPulse transforms these reports into an **intelligent operational dashboard** with AI-assisted analysis, geospatial visualization, contextual data, priority scoring, duplicate detection, assignment workflows, and analytics.

---

## 🚀 Why NASMR?

Traditional civic complaint systems often suffer from:

* Fragmented complaint channels
* Limited accessibility for multilingual and non-technical users
* Poor geographical visibility of issues
* Lack of contextual information around complaints
* Manual prioritization
* Duplicate complaints
* Limited transparency in complaint resolution
* Difficulty identifying high-impact infrastructure problems

### NASMR addresses these gaps by creating a single intelligent pipeline:

```text
Citizen
   ↓
Report Issue
   ↓
Location + Media + Voice + Text
   ↓
AI & Data Processing
   ↓
Context Enrichment
   ↓
Priority Scoring
   ↓
Authority Dashboard
   ↓
Assignment & Action
   ↓
Status Tracking
   ↓
Data-Driven Governance
```

---

# ✨ Key Features

## 👥 Citizen Platform

### 📝 Multi-Modal Issue Reporting

Citizens can submit civic issues using:

* Text descriptions
* Images and evidence
* Voice input
* Geographical location
* Multilingual input

Reports receive a unique public reference number that can be used for tracking.

### 🌐 Multilingual Accessibility

The platform is designed to reduce language barriers through:

* Speech-to-text processing
* Translation services
* Language-independent backend processing

This makes civic participation more accessible to users from diverse linguistic backgrounds.

### 📍 Location-Aware Reporting

NASMR can capture a citizen's geographical coordinates and perform reverse geocoding to identify:

* Locality
* District
* Geographic position

This enables authorities to understand **where problems are concentrated**.

### 📷 Evidence Upload

Citizens can attach photographic evidence to reports.

Supported formats include:

* JPEG
* PNG
* WebP

Uploads are validated before being stored.

### 🔎 Report Tracking

Citizens can track their submitted complaints using their report/reference information.

---

# 🧠 Intelligent Issue Processing

NASMR goes beyond simply storing complaints.

Each report can be enriched using multiple contextual signals.

```text
                 ┌──────────────────┐
                 │  Citizen Report  │
                 └────────┬─────────┘
                          ↓
              ┌───────────────────────┐
              │ Issue Classification  │
              └───────────┬───────────┘
                          ↓
       ┌──────────────────┼──────────────────┐
       ↓                  ↓                  ↓
   Population       Infrastructure       Weather
       │                  │                  │
       └──────────────────┼──────────────────┘
                          ↓
                  Priority Engine
                          ↓
                 Authority Workflow
```

---

# 🎯 Intelligent Priority Scoring

NASMR uses a deterministic priority scoring model to help authorities identify the issues that require the most urgent attention.

The final score is calculated using:

```text
Final Score =
    0.35 × Severity
  + 0.25 × Population
  + 0.15 × Infrastructure
  + 0.10 × Weather
  + 0.10 × Duration
  + 0.05 × Recurrence
```

Each factor is normalized to a **0–100 scale**.

### Priority Levels

|   Score | Priority        |
| ------: | --------------- |
|  90–100 | 🔴 CRITICAL     |
| 75–89.9 | 🟠 HIGH         |
| 50–74.9 | 🟡 MEDIUM       |
| 25–49.9 | 🟢 LOW          |
|  0–24.9 | ⚪ INFORMATIONAL |

The weights are configurable through environment variables, allowing the prioritization strategy to be adapted to different governance requirements.

---

# 🗺️ Geospatial Intelligence

NASMR uses **PostgreSQL + PostGIS** for location-aware civic intelligence.

The platform supports:

* Spatial report storage
* Bounding-box queries
* Distance/proximity analysis
* Geographic filtering
* Map-based issue visualization
* Population context analysis
* Duplicate detection based on proximity

Authorities can visualize civic problems directly on an interactive map and identify geographic clusters.

---

# 🤖 AI-Assisted Analysis

NASMR includes an AI service abstraction that can analyze reports and provide additional intelligence for authority workflows.

AI capabilities can support:

* Report analysis
* Issue understanding
* Recommendations
* Priority-related insights
* Context-aware assessment

The architecture keeps AI providers isolated behind a service layer, allowing the implementation to be changed without rewriting the rest of the application.

---

# 🔁 Duplicate Issue Detection

Multiple citizens may report the same physical problem.

NASMR includes proximity-based duplicate detection to help identify potentially related reports.

Instead of treating every complaint independently, authorities can identify clusters of reports referring to the same underlying issue.

This can reduce:

* Duplicate workload
* Repeated manual processing
* Fragmented issue tracking

---

# 🏛️ Authority Operations Dashboard

The administrative dashboard provides a centralized command center for civic operations.

### Dashboard capabilities include:

* KPI overview
* Pending/resolved reports
* Priority queue
* Category distribution
* Status distribution
* Timeline analytics
* District analytics
* Interactive issue map
* Report search
* Multi-criteria filtering
* Pagination
* Report assignment
* Status management
* AI analysis
* Priority recalculation
* Status history

---

# 📊 Analytics

Authorities can analyze civic problems through multiple dimensions.

### Available analytics include:

```text
Reports Over Time
        ↓
Category Distribution
        ↓
Status Distribution
        ↓
Priority Distribution
        ↓
District Distribution
```

This enables decision-makers to move from:

> **"What complaints have been received?"**

to:

> **"Where are the most critical problems, why are they occurring, and where should resources be allocated?"**

---

# 🔐 Authentication & Security

Administrative access is protected using:

* JWT authentication
* Password hashing
* Role-based access control
* Protected administrative endpoints
* File validation
* Request validation
* Centralized error handling

Public users do not require administrative authentication to submit civic reports.

---

# 🏗️ Architecture

NASMR follows a modular full-stack architecture.

```text
┌───────────────────────────────────────────────┐
│                FRONTEND                       │
│                                               │
│ Next.js + React + TypeScript + Tailwind CSS  │
│ Leaflet / React-Leaflet                       │
└───────────────────────┬───────────────────────┘
                        │
                        │ REST API
                        ↓
┌───────────────────────────────────────────────┐
│                 BACKEND                       │
│                                               │
│ FastAPI + Python                              │
│ Pydantic + SQLAlchemy                         │
│ JWT Authentication                            │
└───────────────────────┬───────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
     AI Services    Geo Services   Data Services
          │             │             │
          └─────────────┼─────────────┘
                        ↓
┌───────────────────────────────────────────────┐
│              PostgreSQL + PostGIS             │
└───────────────────────────────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

| Technology        | Purpose                   |
| ----------------- | ------------------------- |
| **Next.js 14**    | Web application framework |
| **React 18**      | UI development            |
| **TypeScript**    | Type-safe development     |
| **Tailwind CSS**  | Styling                   |
| **Leaflet**       | Interactive maps          |
| **React-Leaflet** | React map integration     |
| **Lucide React**  | UI icons                  |

## Backend

| Technology           | Purpose             |
| -------------------- | ------------------- |
| **Python 3.11+**     | Backend language    |
| **FastAPI**          | REST API framework  |
| **Uvicorn**          | ASGI server         |
| **Pydantic v2**      | Validation          |
| **Alembic**          | Database migrations |
| **GeoAlchemy2**      | PostGIS integration |
| **PyJWT**            | JWT authentication  |
| **Passlib / bcrypt** | Password security   |
| **Pytest**           | Testing             |

## Database & Geospatial

* PostgreSQL
* PostGIS
* GeoAlchemy2
* Shapely

## External / Data Services

* OpenStreetMap / Nominatim
* Open-Meteo
* OSM Overpass
* Sarvam AI integration
* AI provider abstraction

---

# 📁 Project Structure

```text
Team_Airavat/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── reports.py
│   │   │       ├── admin_reports.py
│   │   │       ├── dashboard.py
│   │   │       ├── map.py
│   │   │       ├── location.py
│   │   │       ├── processing.py
│   │   │       ├── categories.py
│   │   │       └── auth.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── errors.py
│   │   │   └── logging.py
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── migrations/
│   ├── scripts/
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   │
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

# ⚙️ Local Development Setup

## Prerequisites

Make sure you have:

* Python 3.11+
* Node.js 18+
* npm
* Docker
* Git

---

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Team_Airavat
```

---

# 🐘 2. Start PostgreSQL + PostGIS

Using Docker:

```bash
docker run -d \
  --name civicpulse_postgres \
  -e POSTGRES_USER=civicpulse \
  -e POSTGRES_PASSWORD=civicpulse \
  -e POSTGRES_DB=civicpulse_db \
  -p 5433:5432 \
  postgis/postgis:16-3.4
```

Verify that the container is running:

```bash
docker ps
```

---

# 🐍 3. Setup Backend

Create a virtual environment:

### Windows

```powershell
python -m venv .venv
.venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

---

# 🔑 4. Configure Backend Environment

Copy the environment template:

### Windows

```powershell
copy backend\.env.example backend\.env
```

### macOS / Linux

```bash
cp backend/.env.example backend/.env
```

Update the environment variables if required.

The default database configuration is:

```env
DATABASE_URL=postgresql+psycopg2://civicpulse:civicpulse@localhost:5433/civicpulse_db
```

> **Important:** Never commit your `.env` file or real API keys to GitHub.

---

# 🗄️ 5. Run Database Migrations

```bash
cd backend
alembic upgrade head
```

---

# 🌱 6. Seed Initial Data

```bash
python scripts/seed.py
```

This initializes the application's standard civic categories and administrator account.

### Development administrator

```text
Email:    admin@civicpulse.org
Password: Admin@123456
Role:     SUPER_ADMIN
```

> ⚠️ Change the default credentials before deploying the application publicly.

---

# 👥 Optional Population Dataset

For local PostGIS population testing:

```bash
python scripts/setup_population_data.py
```

---

# ▶️ 7. Start the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

ReDoc:

```text
http://localhost:8000/redoc
```

---

# 💻 8. Setup Frontend

Open a new terminal.

```bash
cd frontend
npm install
```

Create the environment file:

### Windows

```powershell
copy .env.example .env.local
```

### macOS / Linux

```bash
cp .env.example .env.local
```

Default configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# 🔌 API Overview

The backend exposes a REST API under:

```text
/api/v1/
```

### Core endpoints

| Method | Endpoint                                          | Purpose                   |
| ------ | ------------------------------------------------- | ------------------------- |
| GET    | `/health`                                         | API/database health       |
| GET    | `/api/v1/categories`                              | Civic issue categories    |
| POST   | `/api/v1/reports`                                 | Submit civic report       |
| GET    | `/api/v1/reports/{id}`                            | View report               |
| POST   | `/api/v1/reports/{id}/media`                      | Upload evidence           |
| POST   | `/api/v1/location/reverse-geocode`                | Reverse geocoding         |
| POST   | `/api/v1/processing/transcribe`                   | Speech-to-text            |
| POST   | `/api/v1/processing/translate`                    | Translation               |
| GET    | `/api/v1/map/reports`                             | Geospatial report markers |
| POST   | `/api/v1/auth/login`                              | Admin login               |
| GET    | `/api/v1/auth/me`                                 | Current admin profile     |
| GET    | `/api/v1/admin/reports`                           | Admin report management   |
| PATCH  | `/api/v1/admin/reports/{id}/status`               | Update status             |
| POST   | `/api/v1/admin/reports/{id}/assign`               | Assign report             |
| POST   | `/api/v1/admin/reports/{id}/run-ai`               | Run AI analysis           |
| POST   | `/api/v1/admin/reports/{id}/recalculate-priority` | Recalculate priority      |
| GET    | `/api/v1/dashboard/overview`                      | Dashboard KPIs            |
| GET    | `/api/v1/dashboard/statistics`                    | Dashboard analytics       |
| GET    | `/api/v1/dashboard/priority`                      | Priority queue            |

---

# 🧪 Testing

The backend contains automated tests covering:

* Report creation
* Validation
* Authentication
* Role-based permissions
* Priority calculation
* Duplicate detection
* Geospatial queries
* Dashboard statistics
* AI integration
* Media validation
* Service-layer functionality

Run:

```bash
cd backend
pytest -v
```

---

# 📈 Scalability

NASMR is designed with modularity and future scalability in mind.

### Backend scalability

The service-based architecture allows heavy operations such as:

* AI analysis
* Priority calculation
* External API calls
* Data enrichment

to be moved to asynchronous/background processing when required.

Potential future integrations include:

```text
FastAPI
   ↓
Task Queue
   ↓
Celery / RQ / SQS
   ↓
Worker Nodes
```

### Storage scalability

The media storage layer is abstracted so local storage can later be replaced by:

* Amazon S3
* Google Cloud Storage
* Azure Blob Storage
* Other object-storage providers

without changing the core report workflow.

---

# ☁️ Deployment

The application can be deployed using a variety of architectures.

### Example production architecture

```text
                    Internet
                       │
                       ↓
                ┌─────────────┐
                │   Frontend  │
                │   Next.js   │
                └──────┬──────┘
                       │
                       ↓
                ┌─────────────┐
                │   FastAPI   │
                │   Backend   │
                └──────┬──────┘
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
     PostgreSQL      AI APIs     External APIs
       + PostGIS
```

Possible deployment targets include:

* Vercel
* AWS
* Google Cloud
* Azure
* Docker
* Kubernetes
* VPS infrastructure

---

# 🔒 Production Security Checklist

Before deploying publicly:

* [ ] Change default administrator password
* [ ] Generate a strong `JWT_SECRET`
* [ ] Restrict `CORS_ORIGINS`
* [ ] Configure production database credentials
* [ ] Configure real AI API keys
* [ ] Configure speech/translation providers
* [ ] Move uploads to object storage
* [ ] Enable HTTPS
* [ ] Configure production logging
* [ ] Add rate limiting
* [ ] Review file-upload security
* [ ] Never commit `.env` files or secrets

---

# 🧩 Design Principles

NASMR follows several core engineering principles:

### Modular Architecture

Business logic is separated into:

```text
API
 ↓
Services
 ↓
Repositories
 ↓
Database
```

### Provider Abstraction

External services are isolated behind service interfaces, allowing providers to be changed without restructuring the application.

### Data-Driven Prioritization

Civic issues are not prioritized solely on subjective judgment. The system combines multiple contextual signals.

### Geospatial-First Design

Location is treated as a core component of civic intelligence rather than simply metadata attached to a complaint.

### Citizen + Authority Perspective

The system is designed around two complementary workflows:

```text
Citizen Experience
        ↕
CivicPulse
        ↕
Authority Operations
```

---

# 🛣️ Future Roadmap

Potential future improvements include:

* [ ] Real-time notifications
* [ ] SMS/WhatsApp citizen updates
* [ ] Advanced AI issue classification
* [ ] Automatic department routing
* [ ] Real-time IoT infrastructure data
* [ ] Satellite/geospatial data integration
* [ ] Predictive infrastructure failure detection
* [ ] Advanced hotspot prediction
* [ ] Government ERP integration
* [ ] Mobile application
* [ ] Automated SLA monitoring
* [ ] Background AI processing
* [ ] Cloud object storage
* [ ] Production observability and monitoring

---

# 🎯 Impact

NASMR aims to transform civic governance from a **reactive complaint-management model** into a **proactive, data-driven decision-making system**.

Instead of simply answering:

> **"How many complaints did we receive?"**

NASMR enables authorities to answer:

> **"What problems are most critical, where are they concentrated, how many people may be affected, what contextual factors matter, and where should resources be deployed first?"**

---

# 👨‍💻 Team Airavat

Built by **Team Airavat** as a civic technology solution focused on improving the connection between citizens, data, and public administration.

### Core Vision

**Listen → Understand → Prioritize → Act → Improve**

---

# 📜 License

This project is currently intended for demonstration, development, and hackathon purposes.

Add an appropriate open-source license such as **MIT** before publishing the project for public reuse.

---

## ⭐ If you find this project interesting

Give the repository a ⭐ and feel free to explore, fork, and improve the platform.

**NASMR — From Citizen Voice to Civic Action.**
