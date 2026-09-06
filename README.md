# NASMR

A public civic issue reporting platform with an authority/admin operations dashboard.

Refer to [`backend/README.md`](backend/README.md) for full architectural documentation, API specifications, and local setup instructions.

### Quick Start
```bash
# 1. Start PostGIS container
docker run -d --name civicpulse_postgres -e POSTGRES_USER=civicpulse -e POSTGRES_PASSWORD=civicpulse -e POSTGRES_DB=civicpulse_db -p 5433:5432 postgis/postgis:16-3.4

# 2. Setup Virtual Environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# 3. Configure & Migrate Database
cd backend
cp .env.example .env
alembic upgrade head
python3 scripts/seed.py
python3 scripts/setup_population_data.py

# 4. Start Server
uvicorn app.main:app --reload --port 8000

# 5. Run Tests
pytest -v
```

### Frontend

```bash
# In a new terminal:
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### URLs

| Service | URL |
|---------|-----|
| **Frontend** | `http://localhost:3000` |
| **Backend API** | `http://localhost:8000` |
| **Swagger UI** | `http://localhost:8000/docs` |
| **Health Check** | `http://localhost:8000/health` |

### Admin Login

- Email: `admin@civicpulse.org`
- Password: `Admin@123456`

Refer to [`backend/README.md`](backend/README.md) for backend documentation and [`frontend/README.md`](frontend/README.md) for frontend documentation.
