PROJECT: NASMR

Build NASMR, a public civic issue reporting platform with an authority/admin dashboard.

IMPORTANT:
This is V1/MVP development.

Prioritize:
- simplicity
- reliability
- maintainability
- clear architecture
- local development
- minimal dependencies
- understandable code
- easy future expansion

DO NOT overengineer the project.

Do NOT introduce:
- microservices
- Kubernetes
- Kafka
- RabbitMQ
- Elasticsearch
- Redis unless genuinely required later
- Celery unless genuinely required later
- GraphQL
- event-driven architecture
- complex authentication systems
- unnecessary cloud infrastructure

The application must run locally during development and testing.

The frontend will eventually be deployed to Vercel.

The backend will initially run locally and should be designed so it can later be deployed to a normal server/VPS/cloud service without architectural changes.

==================================================
1. PRODUCT
==================================================

NASMR is a public reporting platform.

A citizen visits the website and reports an issue in their local area.

The citizen can:

1. Describe an issue using text.
2. Speak their issue using their microphone.
3. Convert speech to text.
4. Detect the spoken language.
5. Translate the description into English.
6. Review the English translation.
7. Upload one or more images.
8. Allow browser GPS permission.
9. Capture latitude and longitude.
10. Reverse geocode the location.
11. Submit the report.

OTP/SMS verification is NOT part of V1.

Do NOT implement phone verification or SMS.

The public reporting flow should be as simple as possible.

==================================================
2. ADMIN SYSTEM
==================================================

Administrators have a separate dashboard.

The dashboard should provide:

- interactive map
- all reports
- pending reports
- resolved reports
- filtering
- category filtering
- severity filtering
- priority filtering
- district/locality filtering
- date filtering
- search
- report detail panel
- image viewing
- location information
- AI analysis
- priority score
- population impact
- nearby infrastructure
- weather/context information
- report status
- assignment
- status history
- dashboard statistics

The UI should resemble a professional civic/government operations dashboard.

The provided reference UI shows the desired general direction:

Dark navigation/sidebar.
Large interactive map.
Report list.
Status filters.
Category filters.
Top-level statistics.
Incident/report detail panel.

Do not blindly copy the reference image.
Use it as a visual/product reference.

==================================================
3. BACKEND TECHNOLOGY
==================================================

Use ONLY the following core backend stack:

Python
FastAPI
PostgreSQL
PostGIS
SQLAlchemy
Alembic
Pydantic

Use standard Python tooling.

Do not add unnecessary frameworks.

The backend must expose REST APIs.

Use API versioning:

/api/v1/...

Use OpenAPI/Swagger automatically provided by FastAPI.

==================================================
4. PROJECT STRUCTURE
==================================================

Create a clean modular structure similar to:

backend/

    app/

        main.py

        core/
            config.py
            database.py
            logging.py

        models/
            report.py
            category.py
            media.py
            ai_analysis.py
            priority.py
            status_history.py
            assignment.py

        schemas/
            report.py
            category.py
            media.py
            ai.py
            priority.py
            dashboard.py

        api/
            v1/
                reports.py
                admin_reports.py
                map.py
                dashboard.py
                categories.py
                location.py
                processing.py

        services/
            report_service.py
            media_service.py
            geocoding_service.py
            population_service.py
            infrastructure_service.py
            weather_service.py
            speech_service.py
            translation_service.py
            ai_service.py
            priority_service.py
            duplicate_service.py

        repositories/
            report_repository.py
            category_repository.py
            ...

        utils/
            geo.py
            files.py
            validation.py

    migrations/

    tests/

    scripts/

    uploads/

    .env.example
    requirements.txt
    README.md

Keep business logic out of route handlers.

Routes should call services.
Services should contain business logic.
Repositories should contain database operations where useful.

Do not create unnecessary abstractions.

==================================================
5. DATABASE
==================================================

Use PostgreSQL with PostGIS.

Enable the PostGIS extension.

The report location MUST use a PostGIS geography/geometry field rather than storing only latitude/longitude.

Still expose latitude and longitude through the API where convenient.

Core tables:

categories

Fields:
- id
- name
- description
- is_active
- created_at

reports

Fields:

- id
- public_reference
- category_id
- original_description
- english_description
- original_language
- status
- severity
- latitude
- longitude
- location
- address
- locality
- district
- state
- country
- created_at
- updated_at
- resolved_at

report_media

Fields:

- id
- report_id
- file_path
- original_filename
- mime_type
- file_size
- created_at

ai_analyses

Fields:

- id
- report_id
- detected_category
- detected_severity
- confidence
- risk_indicators
- reasoning_summary
- model_name
- created_at

priority_scores

Fields:

- id
- report_id
- severity_score
- population_score
- infrastructure_score
- weather_score
- duration_score
- recurrence_score
- final_score
- priority_level
- scoring_version
- explanation
- created_at

status_history

Fields:

- id
- report_id
- old_status
- new_status
- changed_by
- created_at
- note

assignments

Fields:

- id
- report_id
- department
- assigned_to
- assigned_at
- completed_at

Use proper foreign keys and indexes.

Create geospatial indexes.

Create indexes for:
- status
- category
- created_at
- priority
- district
- location

==================================================
6. REPORT STATUS
==================================================

Use:

SUBMITTED
VERIFIED
PRIORITIZED
ASSIGNED
IN_PROGRESS
RESOLVED
CLOSED

Also support:

REJECTED
DUPLICATE

For V1, status transitions should be simple.

Every status change must create a status_history record.

==================================================
7. PUBLIC REPORT API
==================================================

Implement:

POST /api/v1/reports

Create a new report.

Input:

- category
- original_description
- english_description
- original_language
- latitude
- longitude

Return:

- report ID
- public reference
- status
- created timestamp

Do not expose internal database IDs unnecessarily.

Implement:

GET /api/v1/reports/{id}

Return public-safe report information.

Implement:

POST /api/v1/reports/{id}/media

Support image uploads.

Validate:
- MIME type
- extension
- maximum file size

Do not trust client-provided MIME types.

Store files outside the database.

For local development use:

backend/uploads/

Design the media service so it can later support S3-compatible storage without rewriting report logic.

==================================================
8. SPEECH TO TEXT
==================================================

Implement a speech processing abstraction.

Example interface:

SpeechService

Methods:

transcribe(audio_file)

The actual provider must be configurable.

Do not hardcode the application to one provider.

Environment variables should control the provider/API key.

The service should return:

- text
- detected language if available
- confidence if available

The backend endpoint:

POST /api/v1/processing/transcribe

should accept audio and return the transcription.

The frontend can later use this endpoint.

Do not store audio permanently unless explicitly required.

==================================================
9. TRANSLATION
==================================================

Implement:

POST /api/v1/processing/translate

Input:

- text
- source_language
- target_language

Target language for NASMR reports is English.

Return:

- translated_text
- source_language
- target_language

Store both:

original_description
english_description

NEVER discard the original language text.

The translation provider must be configurable.

==================================================
10. LOCATION
==================================================

The browser will obtain GPS coordinates.

The backend receives:

latitude
longitude

Validate coordinate ranges.

Use PostGIS.

Implement:

POST /api/v1/location/reverse-geocode

Input:

latitude
longitude

Return:

- address
- locality
- district
- state
- country

Use a configurable reverse-geocoding provider.

Initially support Nominatim.

Do not hardcode provider logic into report creation.

==================================================
11. POPULATION
==================================================

Population is extremely important to NASMR.

Do NOT make a remote population API call for every report if avoidable.

Design a PopulationService.

The initial implementation should support a local population dataset.

Potential source:

WorldPop or another appropriate gridded population dataset.

The system should be able to calculate:

estimated population around incident

Example:

population within 500m
population within 1km

Use PostGIS/geospatial calculations.

Do not pretend this is an exact number.

Label it:

Estimated affected population

Store:
- population estimate
- radius
- source
- calculation date

If a population dataset has not yet been installed, create a clean fallback implementation that returns:

population_available = false

Do NOT fabricate population numbers.

==================================================
12. INFRASTRUCTURE
==================================================

Create InfrastructureService.

Use OpenStreetMap/Overpass initially.

Find nearby:

- hospitals
- schools
- police stations
- fire stations
- railway stations
- major roads
- bridges
- important public infrastructure where available

Calculate distance from incident.

Example:

Hospital: 450m
School: 120m
Fire station: 1.8km

Do not call external infrastructure services repeatedly if avoidable.

Cache/store useful results locally.

Keep the provider configurable.

==================================================
13. WEATHER
==================================================

Create WeatherService.

Initially use Open-Meteo or another simple weather provider.

Use coordinates and time.

Retrieve relevant context such as:

- precipitation
- temperature
- wind
- weather condition

Example:

Heavy rain + drainage problem

should increase contextual urgency.

Weather should be a scoring input, not an automatic decision.

If weather data is unavailable, scoring must continue without it.

==================================================
14. AI ANALYSIS
==================================================

AI is an assistant, NOT the final decision-maker.

Do NOT implement:

AI → final priority score

Instead:

Report
+
Image
+
Description
+
Location/context

↓

AI analysis

↓

Category suggestion
Severity
Risk indicators
Confidence

↓

Deterministic Priority Engine

↓

Final priority score

The AI service must be provider-independent.

Create:

AIService

Methods:

analyze_text()
analyze_image()
analyze_report()

The AI should return structured JSON.

Example:

{
    "category": "pothole",
    "severity": 8,
    "confidence": 0.91,
    "risk_indicators": [
        "major road damage",
        "possible traffic hazard"
    ],
    "reasoning_summary": "..."
}

Validate AI responses with Pydantic.

Never blindly trust arbitrary AI JSON.

If the AI API is unavailable, the report must still be created.

AI processing should be optional/failure-tolerant.

==================================================
15. PRIORITY ENGINE
==================================================

This is a core NASMR component.

Implement a deterministic scoring system.

Initial weights:

Severity: 35%
Population impact: 25%
Critical infrastructure: 15%
Weather/context: 10%
Duration: 10%
Recurrence/repeated reports: 5%

Make these weights configurable.

Do not hardcode them throughout the application.

Normalize every component to 0-100.

Final score:

0-24 = INFORMATIONAL
25-49 = LOW
50-74 = MEDIUM
75-89 = HIGH
90-100 = CRITICAL

The final priority score must be reproducible.

Store each component.

Example:

Severity: 82
Population: 74
Infrastructure: 90
Weather: 70
Duration: 40
Recurrence: 20

Final:
78.1

Priority:
HIGH

Generate a human-readable explanation:

"High priority because the incident has high severity, is near critical infrastructure, and affects a significant estimated population."

Do not let AI generate the numerical final score.

AI can provide supporting analysis.

==================================================
16. DUPLICATE DETECTION
==================================================

Implement a simple duplicate detection service.

Do not build a complex ML system initially.

Potential duplicate criteria:

- same/similar category
- geographic proximity
- similar description
- close reporting time

Example:

Report A:
Pothole
Location X
10:00

Report B:
Large pothole
150m away
10:20

Mark as:

potential_duplicate = true

Do not automatically delete or merge reports.

Admin should decide.

Repeated reports about the same problem can contribute to the recurrence/repeated-report score.

==================================================
17. MAP API
==================================================

Implement:

GET /api/v1/map/reports

Support query parameters:

status
category
priority
severity
district
start_date
end_date
min_lat
max_lat
min_lng
max_lng

Return only the fields needed for map rendering.

Do not return huge report payloads for map markers.

Example:

{
    "id": "...",
    "public_reference": "CP-1023",
    "latitude": 24.123,
    "longitude": 87.456,
    "category": "pothole",
    "status": "HIGH",
    "priority_score": 87
}

Support geographic bounding-box filtering using PostGIS.

This is important for map performance.

==================================================
18. DASHBOARD API
==================================================

Implement:

GET /api/v1/dashboard/overview

Return:

- total reports
- pending
- resolved
- critical
- high
- medium
- low
- average resolution time

Implement:

GET /api/v1/dashboard/statistics

Support date ranges.

Return:

- reports over time
- category distribution
- status distribution
- priority distribution
- district distribution

Implement:

GET /api/v1/dashboard/priority

Return highest-priority unresolved reports.

==================================================
19. ADMIN AUTHENTICATION
==================================================

For V1, implement simple admin authentication.

Do NOT implement citizen accounts.

Admin authentication can use:

- email
- password
- JWT

Passwords must be hashed securely.

Create roles:

SUPER_ADMIN
ADMIN
OPERATOR
VIEWER

Implement basic role-based access control.

Do not expose admin endpoints publicly.

Keep authentication modular so MFA can be added later.

==================================================
20. SECURITY
==================================================

Implement basic production-quality security.

Requirements:

- environment variables for secrets
- password hashing
- JWT expiration
- CORS configuration
- request validation
- upload validation
- file size limits
- safe filenames
- SQL injection protection through SQLAlchemy
- error handling
- no stack traces in production responses
- rate limiting abstraction for future use
- never expose secrets
- never commit .env
- .env.example must be provided

Do not store unnecessary personal information.

Since OTP is removed, the public report should not require a phone number.

==================================================
21. ERROR HANDLING
==================================================

Use consistent API error responses.

Example:

{
    "error": {
        "code": "REPORT_NOT_FOUND",
        "message": "Report not found"
    }
}

Do not leak internal exceptions.

Log detailed errors server-side.

==================================================
22. LOGGING
==================================================

Use Python logging.

Log:

- request errors
- AI failures
- external API failures
- geocoding failures
- population processing failures
- database failures

Do not log:
- passwords
- API keys
- sensitive secrets

==================================================
23. EXTERNAL SERVICE FAILURE
==================================================

NASMR must not completely break when an external API is unavailable.

For example:

If weather API fails:

report creation still succeeds.

If AI fails:

report creation still succeeds.

If geocoding fails:

coordinates are still stored.

If population data is unavailable:

priority calculation continues with the population component marked unavailable.

Every external integration should fail gracefully.

==================================================
24. LOCAL DEVELOPMENT
==================================================

The project must run locally.

Required local services:

PostgreSQL + PostGIS

Everything else should be optional unless needed.

Do not require cloud infrastructure.

Create clear setup instructions.

Example:

1. Install PostgreSQL/PostGIS.
2. Create database.
3. Configure .env.
4. Run Alembic migrations.
5. Seed categories.
6. Start FastAPI.
7. Open Swagger.
8. Test APIs.

Backend should run with:

uvicorn app.main:app --reload

==================================================
25. ENVIRONMENT CONFIGURATION
==================================================

Create:

.env.example

Variables should include only necessary settings.

Example categories:

DATABASE_URL=
JWT_SECRET=
AI_API_KEY=
AI_PROVIDER=
TRANSLATION_API_KEY=
TRANSLATION_PROVIDER=
GEOCODING_PROVIDER=
GEOCODING_API_URL=
WEATHER_PROVIDER=
UPLOAD_DIRECTORY=

Do not force every integration to be configured before the server starts.

Optional integrations should be optional.

==================================================
26. SEED DATA
==================================================

Create initial categories:

Road Damage
Pothole
Flooding
Garbage
Broken Streetlight
Water Leakage
Blocked Drain
Fallen Tree
Traffic Obstruction
Fire/Smoke
Public Infrastructure Damage
Other

Make categories database-driven.

==================================================
27. TESTING
==================================================

Create tests for:

- report creation
- validation
- status transitions
- priority calculation
- priority thresholds
- geospatial queries
- duplicate detection
- admin permissions
- file validation
- API error handling

The priority engine must have unit tests.

Example test:

Given:

severity = 90
population = 80
infrastructure = 70
weather = 50
duration = 60
recurrence = 40

verify final score exactly.

==================================================
28. API DOCUMENTATION
==================================================

FastAPI Swagger must clearly document:

- request bodies
- response models
- query parameters
- errors
- authentication
- admin endpoints

Group endpoints by:

Public Reports
Processing
Location
Map
Admin
Dashboard

==================================================
29. FRONTEND CONTRACT
==================================================

Do not build the frontend yet.

Instead, make the backend API clean enough for a future Next.js frontend.

The frontend will eventually be:

Next.js
TypeScript
Leaflet/MapLibre
Vercel deployment

The backend should not depend on the frontend implementation.

==================================================
30. IMPORTANT ARCHITECTURAL RULE
==================================================

Do not make every operation synchronous.

The initial implementation may perform processing synchronously for simplicity.

However, structure services so heavy operations can later be moved into background jobs.

Do not add Redis/job queues now unless actual testing shows they are necessary.

The priority calculation should be callable independently:

PriorityService.calculate(report_id)

AI analysis should be callable independently:

AIService.analyze_report(report_id)

Population analysis should be callable independently:

PopulationService.calculate_impact(report_id)

This allows background processing to be introduced later without rewriting the application.

==================================================
31. DEVELOPMENT ORDER
==================================================

Do NOT attempt to implement the entire project in one uncontrolled pass.

Build in this order:

PHASE 1
Project setup
FastAPI
PostgreSQL
PostGIS
SQLAlchemy
Alembic
Configuration
Logging
Health check

PHASE 2
Database models
Migrations
Seed categories

PHASE 3
Public report creation
Report retrieval
Media upload
Validation

PHASE 4
Location
PostGIS
Reverse geocoding

PHASE 5
Admin authentication
Roles
Admin report APIs

PHASE 6
Map APIs
Bounding-box queries
Filters

PHASE 7
Priority engine
Unit tests
Priority explanation

PHASE 8
Population service

PHASE 9
Infrastructure service

PHASE 10
Weather service

PHASE 11
Speech-to-text

PHASE 12
Translation

PHASE 13
AI analysis

PHASE 14
Duplicate detection

PHASE 15
Dashboard analytics

PHASE 16
Integration testing
Security review
Performance review
Documentation

==================================================
32. DEVELOPMENT BEHAVIOR
==================================================

Before creating code:

1. Inspect the project directory.
2. Identify existing files.
3. Do not overwrite existing work unnecessarily.
4. Create a clear implementation plan.
5. Implement one phase at a time.
6. Run tests after each major phase.
7. Fix errors before moving forward.
8. Keep dependencies minimal.
9. Do not invent APIs.
10. Do not leave placeholder implementations disguised as complete functionality.

If an external API requires a key that is not available:

- implement the provider interface
- implement a development/mock provider
- clearly document where the real key is required

The application must still start locally without every external API being configured.

==================================================
33. HEALTH CHECK
==================================================

Implement:

GET /health

Response:

{
    "status": "ok",
    "database": "connected"
}

If database is unavailable, return an appropriate unhealthy status.

==================================================
34. README
==================================================

Create a detailed README containing:

- NASMR overview
- architecture
- requirements
- installation
- PostgreSQL/PostGIS setup
- environment variables
- migrations
- seed data
- starting server
- Swagger URL
- testing
- external APIs
- population dataset setup
- future deployment notes

==================================================
35. FINAL PRINCIPLE
==================================================

NASMR should be:

Simple enough to develop locally.

Reliable enough not to break when an external API fails.

Structured enough to grow later.

Geospatially correct.

AI-assisted but not AI-controlled.

Explainable in how it calculates priority.

Privacy-conscious.

Easy for another developer to understand.

Do not optimize for theoretical massive scale.

Optimize for a strong, stable MVP that can later scale when actual usage requires it.
