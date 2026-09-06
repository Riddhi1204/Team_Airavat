# CivicPulse Frontend

The CivicPulse frontend is a Next.js application providing both a public civic issue reporting interface and an administrative operations dashboard.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + react-leaflet
- **Icons**: lucide-react
- **Deployment**: Designed for Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- CivicPulse backend running on `http://localhost:8000`

### Setup

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local if your backend is not on localhost:8000

# 3. Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Public landing page
│   ├── report/            # Report submission flow
│   ├── track/             # Report tracking (by reference)
│   └── admin/
│       ├── login/         # Admin authentication
│       ├── dashboard/     # Operations dashboard
│       ├── reports/       # Report list + detail views
│       ├── map/           # Interactive map view
│       └── analytics/     # Statistics and charts
├── components/
│   ├── ui/                # Reusable UI components
│   ├── admin/             # Admin layout
│   └── map/               # Map components
├── lib/
│   ├── api.ts             # Centralized API client
│   ├── auth.ts            # Auth token management
│   └── utils.ts           # Utility functions
└── types/
    └── index.ts           # TypeScript interfaces
```

## Public Features

- **Landing Page**: Overview of CivicPulse with call-to-action
- **Report Submission**: Multi-step form with:
  - Category selection (fetched from backend)
  - Text description with speech-to-text support
  - Multi-language support with translation
  - Browser GPS location capture with reverse geocoding
  - Image upload (up to 5 photos, validated)
  - Review & submit
  - Confirmation with public reference number
- **Report Tracking**: Look up report status by ID or reference

## Admin Dashboard

Access at `/admin/login`. Default credentials:
- Email: `admin@civicpulse.org`
- Password: `Admin@123456`

### Dashboard Features

- **Overview**: KPI cards, priority queue, distribution breakdowns
- **Map View**: Interactive Leaflet map with all reports as markers, filterable by status/category/priority/district
- **Reports List**: Paginated table with search and multi-criteria filtering
- **Report Detail**: Complete report view with:
  - AI analysis results
  - Priority score breakdown (visual progress bars)
  - Context data (population, infrastructure, weather)
  - Status history timeline
  - Assignment management
  - Image evidence gallery
  - Status update modal
  - Re-run AI analysis
  - Recalculate priority
- **Analytics**: Charts and distributions for reports over time, categories, statuses, priorities, and districts

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript compiler checks
```

## Connecting to Backend

The frontend communicates with the backend through a centralized API client at `src/lib/api.ts`. All endpoints match the actual backend routes under `/api/v1/`.

In development, Next.js rewrites proxy `/api/*` and `/uploads/*` requests to the backend URL configured in `NEXT_PUBLIC_API_URL`.

## Deployment

For Vercel deployment:

1. Set `NEXT_PUBLIC_API_URL` environment variable to your production backend URL
2. Deploy with `vercel` CLI or connect to GitHub
3. The `next.config.js` rewrites handle API proxying
