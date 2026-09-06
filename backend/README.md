# CivicPulse — Public Civic Issue Reporting & Authority Operations Platform

CivicPulse is a modern, reliable, production-ready civic issue reporting platform with a unified authority operations dashboard. It enables citizens to easily report municipal and civic infrastructure problems (roads, potholes, water leaks, blocked drains, hazards) with multimedia evidence and automatic geolocation, while providing municipal administrators with a powerful geospatial operations center equipped with deterministic priority scoring, AI-assisted triage, and duplicate detection.

---

## Key Highlights & Architectural Principles

- **Deterministic Priority Engine:** Priority scores ($0 - 100$) are calculated via a strictly explainable, reproducible, deterministic weighted formula rather than black-box AI scores.
- **Geospatially Accurate:** Uses PostgreSQL + PostGIS with true spatial indexing (`GIST`) and native bounding-box queries (`ST_MakeEnvelope`, `ST_DWithin`, `ST_Within`).
- **Resilient & Graceful External Integrations:** All third-party services (reverse geocoding, weather forecasts, infrastructure queries, translation, speech-to-text, AI evaluation) have zero-failure fallback modes. If an external API is down, report creation and triage continue without interruption.
- **Multilingual Support:** Preserves original submitted text while generating standard English descriptions for administrative workflows.
- **Role-Based Access Control (RBAC):** Built-in permission tiers for administrative users: `SUPER_ADMIN`, `ADMIN`, `OPERATOR`, and `VIEWER`.
- **Duplicate Triage:** Real-time spatial and textual proximity detection marks potential duplicates without deleting citizen submissions.

---

## Technology Stack

- **Language:** Python 3.11+ (Tested on Python 3.14)
- **Framework:** FastAPI
- **Database:** PostgreSQL 16 + PostGIS 3.4
- **ORM & Migrations:** SQLAlchemy 2.0 + Alembic + GeoAlchemy2
- **Data Validation:** Pydantic v2
- **Authentication:** OAuth2 JWT (PyJWT + Passlib/Bcrypt)
- **Testing:** Pytest + Pytest-Asyncio

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                  # Application entry point, lifespan, CORS, error handlers
│   ├── core/
│   │   ├── config.py            # Pydantic Settings and priority weights configuration
│   │   ├── database.py          # SQLAlchemy engine, sessionmaker, Base
│   │   ├── errors.py            # Custom exception classes and unified error response handler
│   │   └── logging.py           # Standardized Python logging
│   ├── models/
│   │   ├── category.py          # Category model
│   │   ├── user.py              # Admin user model and RBAC enums
│   │   ├── report.py            # Core incident report model with PostGIS Geometry
│   │   ├── media.py             # Attached evidence photos
│   │   ├── ai_analysis.py       # AI analysis recommendations
│   │   ├── priority.py          # Deterministic priority breakdown scores
│   │   ├── status_history.py    # Audit trail of report lifecycle changes
│   │   ├── assignment.py        # Departmental personnel assignments
│   │   └── context_data.py      # Population, infrastructure, and weather context
│   ├── schemas/                 # Pydantic request/response validation schemas
│   ├── api/
│   │   └── v1/
│   │       ├── reports.py       # Public citizen report endpoints
│   │       ├── admin_reports.py # Authority triage, assignment, status APIs
│   │       ├── map.py           # Lightweight geospatial bounding-box marker APIs
│   │       ├── dashboard.py     # Operational analytics and statistics
│   │       ├── categories.py    # Public category listing
│   │       ├── location.py      # Reverse-geocoding API
│   │       ├── processing.py    # Speech-to-text & translation APIs
│   │       └── auth.py          # Admin JWT login and profile APIs
│   ├── services/                # Business logic layer
│   │   ├── report_service.py    # Orchestration of report lifecycle
│   │   ├── priority_service.py  # Deterministic scoring engine
│   │   ├── geocoding_service.py # Reverse geocoding (Nominatim / Fallback)
│   │   ├── weather_service.py   # Open-Meteo weather integration
│   │   ├── infrastructure_service.py # Nearby facilities (OSM Overpass / Fallback)
│   │   ├── population_service.py     # Local PostGIS gridded population analysis
│   │   ├── speech_service.py    # Speech-to-text abstraction
│   │   ├── translation_service.py    # Text translation abstraction
│   │   ├── ai_service.py        # Provider-independent AI assessment
│   │   ├── duplicate_service.py # Proximity duplicate detection
│   │   ├── media_service.py     # Secure file storage and validation
│   │   └── auth_service.py      # RBAC and JWT verification
│   ├── repositories/            # Data access layer
│   │   ├── report_repository.py
│   │   ├── category_repository.py
│   │   └── user_repository.py
│   └── utils/                   # Helper functions (geo, files, validation, security)
├── migrations/                  # Alembic database migrations
├── tests/                       # Automated test suites (36 passing tests)
├── scripts/
│   ├── seed.py                  # Seed initial categories and default super-admin
│   └── setup_population_data.py # Setup PostGIS population grid dataset
├── uploads/                     # Storage for uploaded media evidence
├── .env.example                 # Template environment variables
├── requirements.txt             # Pip dependencies
└── README.md
```

---

## Quickstart & Local Setup

### 1. Requirements
- Python 3.11+
- Docker (or local PostgreSQL with PostGIS extension installed)

### 2. Run PostgreSQL with PostGIS
You can launch the official PostGIS container via Docker:

```bash
docker run -d \
  --name civicpulse_postgres \
  -e POSTGRES_USER=civicpulse \
  -e POSTGRES_PASSWORD=civicpulse \
  -e POSTGRES_DB=civicpulse_db \
  -p 5433:5432 \
  postgis/postgis:16-3.4
```

### 3. Setup Virtual Environment
From the project root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 4. Configure Environment Variables
Copy the example environment file:

```bash
cp backend/.env.example backend/.env
```

Ensure `DATABASE_URL` matches your local database settings (default: `postgresql+psycopg2://civicpulse:civicpulse@localhost:5433/civicpulse_db`).

### 5. Run Database Migrations
Run Alembic migrations to build the complete database schema:

```bash
cd backend
alembic upgrade head
```

### 6. Seed Initial Data
Seed standard civic categories and default super-admin credentials:

```bash
python3 scripts/seed.py
```

*Default Administrator Credentials:*
- **Email:** `admin@civicpulse.org`
- **Password:** `Admin@123456`
- **Role:** `SUPER_ADMIN`

*(Optional)* Seed sample high-density population grids for testing PostGIS population estimation:
```bash
python3 scripts/setup_population_data.py
```

### 7. Run the Application Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## API Documentation & Endpoints

Once the server is running, open the interactive Swagger UI:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI Schema:** [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

### Core Endpoints Overview

| Group | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/health` | Liveness and PostGIS connectivity check |
| **Categories** | `GET` | `/api/v1/categories` | List active issue categories |
| **Public Reports** | `POST` | `/api/v1/reports` | Submit citizen report |
| | `GET` | `/api/v1/reports/{id}` | Public-safe report status & details |
| | `POST` | `/api/v1/reports/{id}/media` | Upload photos (JPEG, PNG, WebP) |
| **Location** | `POST` | `/api/v1/location/reverse-geocode` | Reverse geocode coordinates to locality/district |
| **Processing** | `POST` | `/api/v1/processing/transcribe` | Speech-to-text audio processing |
| | `POST` | `/api/v1/processing/translate` | Multilingual text translation |
| **Map** | `GET` | `/api/v1/map/reports` | Lightweight markers with bounding box filters |
| **Admin Auth** | `POST` | `/api/v1/auth/login` | Login and receive Bearer JWT |
| | `GET` | `/api/v1/auth/me` | Current authenticated user profile |
| **Admin Reports** | `GET` | `/api/v1/admin/reports` | Search, filter, and paginate reports |
| | `GET` | `/api/v1/admin/reports/{id}` | Full triage detail with AI & priority breakdown |
| | `PATCH` | `/api/v1/admin/reports/{id}/status` | Update report status (with audit trail) |
| | `POST` | `/api/v1/admin/reports/{id}/assign` | Assign report to department & officer |
| | `POST` | `/api/v1/admin/reports/{id}/recalculate-priority` | Trigger priority recalculation |
| | `POST` | `/api/v1/admin/reports/{id}/run-ai` | Trigger AI analysis |
| **Dashboard** | `GET` | `/api/v1/dashboard/overview` | Total, pending, resolved counts & resolution time |
| | `GET` | `/api/v1/dashboard/statistics` | Timeline, category, status & priority distributions |
| | `GET` | `/api/v1/dashboard/priority` | Highest-priority unresolved reports queue |

---

## Priority Scoring Formula & Thresholds

Priority is calculated deterministically through normalized factors ($0 - 100$):

$$\text{Final Score} = 0.35 \times \text{Severity} + 0.25 \times \text{Population} + 0.15 \times \text{Infrastructure} + 0.10 \times \text{Weather} + 0.10 \times \text{Duration} + 0.05 \times \text{Recurrence}$$

### Priority Levels
- **$90.0 - 100.0$:** `CRITICAL`
- **$75.0 - 89.9$:** `HIGH`
- **$50.0 - 74.9$:** `MEDIUM`
- **$25.0 - 49.9$:** `LOW`
- **$0.0 - 24.9$:** `INFORMATIONAL`

Weights are configurable in `.env` without modifying application code:
- `WEIGHT_SEVERITY` (default 0.35)
- `WEIGHT_POPULATION` (default 0.25)
- `WEIGHT_INFRASTRUCTURE` (default 0.15)
- `WEIGHT_WEATHER` (default 0.10)
- `WEIGHT_DURATION` (default 0.10)
- `WEIGHT_RECURRENCE` (default 0.05)

---

## Running Automated Tests

CivicPulse includes a comprehensive test suite covering all phases:
- Priority calculation unit tests & exact formula validation
- PostGIS spatial bounding box and distance queries
- Proximity duplicate detection
- Public report creation and media upload verification
- MIME and file extension validation
- Admin authentication and role-based permissions
- Operations dashboard statistics and queue sorting

Run the tests with:

```bash
cd backend
pytest -v
```

All 36 tests run and pass cleanly against the local PostGIS test database.

---

## Deployment Considerations

- **Backend:** Designed as a 12-factor modular application. Can be containerized via Docker and deployed to any VPS, AWS EC2, GCP Cloud Run, or Kubernetes cluster.
- **Frontend Contract:** API responses are structured for standard frontend consumption (Next.js, TypeScript, Leaflet / MapLibre).
- **Storage:** The media service uses a decoupled interface (`save_upload_file`) that can be redirected to S3/GCS buckets without altering report business logic.
- **Background Jobs:** Heavy computations (AI analysis, priority recalculations) are implemented as isolated service methods that can be easily dispatched to Celery, RQ, or AWS SQS if scale demands.
