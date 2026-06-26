
<div align="center">

# 🔭 Project Zenith: The Celestial Eye

<img src="https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
<img src="https://img.shields.io/badge/CesiumJS-1.118-00A3E0?style=for-the-badge&logo=cesium&logoColor=white" />

<br /><br />

> **A high-fidelity real-time cosmic radar and predictive astronomical tracking platform.**  
> Track active orbital satellites using SGP4 mechanics, compute live planetary coordinates via Keplerian equations, and scan visible constellations above your exact horizon — all from a single interactive interface.

<br />

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square)
![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20bcrypt-orange?style=flat-square)
![DB](https://img.shields.io/badge/Database-MySQL-blue?style=flat-square)

</div>

---

## 📌 Problem Statement

Amateur astronomers and space enthusiasts lack a unified, scientifically rigorous platform that combines real-time satellite telemetry, accurate planetary ephemeris data, constellation detection, and localized stargazing predictions in a single intuitive interface.

**The Celestial Eye** solves this by integrating live SGP4-propagated orbital data, Keplerian geocentric coordinate calculations, Hipparcos star catalog constellation detection, and Open-Meteo weather quality scoring — delivering a production-grade astronomical observatory in the browser.

---

## 🎯 Key Objectives

- Provide **real-time ISS and satellite tracking** using SGP4 orbital mechanics with three-tier telemetry fallback
- Deliver **scientifically accurate planetary coordinates** (RA, Dec, Az, Alt, Rise/Set/Transit) via J2000 Keplerian elements
- Surface **constellation visibility** by querying the trimmed Hipparcos star catalog against the observer's horizon
- Compute a **24-hour celestial predictor timeline** covering satellite passes, planetary transits, and constellation rises
- Offer a **personalized dashboard** with saved locations, bookmarked celestial objects, and searchable coordinate history
- Apply **observation quality scoring** factoring cloud cover, wind speed, humidity, and Moon illumination

---

## ✨ Features

### 🌍 Interactive 3D Cesium Globe
- Full 3D Earth rendered with CesiumJS (Bing Maps satellite layer)
- Solar lighting model enabled — real-time day/night terminator visible
- Atmosphere and star field rendered in the scene
- Click anywhere on the globe to set your observation coordinate

### 🛰️ Live ISS Tracking
- Three-tier telemetry pipeline: Open-Notify API → wheretheiss.at → local SGP4 TLE propagation
- Real-time altitude (km) and velocity (km/h) computed from ECI velocity vectors
- Full SGP4-propagated orbital footprint drawn as a polyline over one complete orbital period (60-step)
- Auto-refreshes every 5 seconds

### 🛰️ Real-time Satellite Catalog Tracking
- Pulls the full active satellite TLE catalog from CelesTrak with a 5-minute in-memory cache
- Falls back to a local `active_satellites.tle` file when the network is unavailable
- Each satellite includes: live lat/lon/altitude, orbital velocity, inclination, eccentricity, RAAN, mean motion, orbital period, and orbit class (LEO/MEO/GEO)
- Clicking a satellite renders its individual SGP4-propagated 60-step orbital trajectory on the globe

### 🪐 Planet Visualization
- 7 planets tracked: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune
- Positions computed from J2000 Keplerian orbital elements with per-century rate corrections
- Returns geocentric equatorial coordinates (RA/Dec) and topocentric horizontal coordinates (Alt/Az) for the observer
- Rise, Set, and Transit times found via a 10-minute step numeric scan across a 24-hour window
- Planets projected onto the celestial sphere at radius ~100,000 km on the 3D globe

### ✨ Constellation Detection
- Hipparcos star catalog (magnitude < 6) loaded from a local JSON dataset
- Stars converted from equatorial (RA/Dec) to horizontal coordinates using Local Sidereal Time
- Returns all constellations with at least one star above the observer's horizon
- Constellation star clusters rendered as point entities on the globe

### 📍 Geographic Location Selection
- Global location search powered by Nominatim/OpenStreetMap geocoding
- Click-to-set on the 3D globe
- All calculations (weather, planets, constellations, predictor) update instantly on location change
- Authenticated users have their searches automatically saved to the backend database

### 🌦️ Live Weather & Stargazing Index
- Real-time weather via Open-Meteo API: temperature, wind speed, wind direction, cloud cover, WMO weather code
- Scientifically derived **Observation Quality Score (0–100)** computed from:
  - Cloud cover (primary factor)
  - Humidity derived from WMO weather code
  - Wind speed penalty above 25 km/h
  - Moon illumination penalty (up to 15 points) calculated from lunar phase
- Telescope recommendation based on quality score
- Visual stargazing outlook badge (Excellent / Good / Suboptimal)
- Location bookmark button for authenticated users

### 🌐 Timezone Detection
- IANA timezone resolved offline using `tz-lookup` (bundled boundary dataset — zero network calls)

### 🔭 Zenith Analysis
- Live Azimuth/Altitude rendering for all planets above the horizon
- Visual quality metrics per observation target
- Observer distance checks and elevation angle calculations

### 📅 Celestial Predictor Timeline (24-hour)
- SGP4 look-angle pass scanner stepping at 2-minute intervals over the full active satellite TLE catalog
- Detects passes where elevation exceeds 10° — records rise time, peak elevation, max-elevation time, set time, and pass duration
- Planetary transit events computed from Keplerian ephemeris
- Top 5 visible constellations added as horizon-rise events
- All events merged and sorted chronologically

### 🔍 Global Location Search
- Typeahead search backed by Nominatim geocoding API
- Selects coordinates and propagates to all live feeds instantly

### ❤️ Favorite Locations
- Authenticated users can bookmark any observation location from the WeatherWidget
- Stored in MySQL via Prisma `FavoriteLocation` model
- Accessible from the dashboard; clicking navigates directly to the Explore radar page

### ⭐ Favorite Celestial Objects
- Bookmark any satellite, planet, or star from the Object Details slide-out panel
- Stored with `objectId` and `objectType` (`SATELLITE` | `PLANET` | `STAR`)
- Visual star icon toggle — filled when bookmarked

### 👤 User Authentication
- Registration with bcrypt (salt rounds: 12) password hashing
- Duplicate email prevention via Prisma unique constraint
- Login returns `accessToken` (15-min JWT) and `refreshToken` (7-day JWT)
- Token refresh endpoint for transparent session extension
- Secure logout revokes the refresh token from the in-memory store
- Auth state persisted across page reloads using Zustand `persist` middleware

### 🔐 JWT Authorization Middleware
- `Authorization: Bearer <token>` header validation on all protected routes
- JWT verified with configurable `JWT_SECRET` env variable
- User ID and email attached to `req.user` for downstream handlers

### 📊 Observation Dashboard
- Protected route (auth wall with sign-in prompt)
- Profile overview: display name, email, saved places count, bookmarks count
- Tracked Coordinate Profiles: add/load/delete saved locations
- Bookmarked Space Objects: list all favorited satellites/planets/stars
- Search Registry Logs: full geocoding search history (up to 50 entries), clearable in bulk

### 📱 Responsive Design
- Mobile-first layout with Tailwind CSS
- Collapsible mobile navigation menu
- Glassmorphism UI panels with gradient accents and micro-animations via Framer Motion
- Dark-mode first with the Outfit Google Font

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 15.0.0 | App Router, SSR/CSR hybrid, routing |
| **React** | 19.0.0 | UI component framework |
| **TypeScript** | 5.5 | Static typing across all components |
| **Tailwind CSS** | 3.4 | Utility-first styling system |
| **CesiumJS** | 1.118.0 | Interactive 3D Earth globe via CDN |
| **@tanstack/react-query** | 5.51 | Server state, caching, background refetch |
| **Zustand** | 4.5 | Global client state (auth + location) with persistence |
| **Framer Motion** | 11.3 | Animations, slide-in panels, staggered transitions |
| **Lucide React** | 0.378 | Icon system |
| **Leaflet / react-leaflet** | 1.9 / 4.2 | 2D fallback map component |
| **Recharts** | 2.12 | Data visualization charts |
| **Axios** | 1.7 | HTTP client with auth interceptors |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js + Express** | 4.19 | REST API server |
| **TypeScript** | 5.5 | Static typing across all services |
| **Prisma ORM** | 5.22 | Type-safe database client and schema migrations |
| **bcryptjs** | 2.4 | Password hashing (12 salt rounds) |
| **jsonwebtoken** | 9.0 | JWT generation and verification |
| **satellite.js** | 5.0 | SGP4/SDP4 TLE orbital propagation |
| **express-rate-limit** | 7.3 | 60 req/min per IP rate limiting |
| **express-validator** | 7.1 | Input validation middleware |
| **helmet** | 7.1 | HTTP security headers |
| **cors** | 2.8 | Cross-origin resource sharing |
| **compression** | 1.7 | Gzip response compression |
| **tz-lookup** | 6.1 | Offline IANA timezone resolution |
| **Axios** | 1.7 | HTTP client for external API calls |
| **winston** | 3.13 | Structured application logging |

### Database

| Technology | Version | Purpose |
|---|---|---|
| **MySQL** | 8.0 | Primary relational database |
| **Prisma Migrate** | 5.22 | Schema migration management |

### External APIs & Data Sources

| Source | Usage |
|---|---|
| **CelesTrak** | Active satellite TLE catalog (GP endpoint) |
| **Open-Notify** | Primary ISS real-time position |
| **wheretheiss.at** | ISS position fallback (with altitude + velocity) |
| **Open-Meteo** | Free-tier real-time weather forecast API |
| **Nominatim / OpenStreetMap** | Frontend geocoding and reverse geocoding |
| **Hipparcos Catalog** | Local star dataset (magnitude < 6, bundled JSON) |
| **tz-lookup** | Offline timezone boundary dataset (bundled) |

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Client Browser"]
        direction TB
        UI["Next.js 15 App Router\nReact 19 Components"]
        ZUSTAND["Zustand Store\n(Auth + Location State)"]
        RQ["TanStack React Query\n(Server State Cache)"]
        CESIUM["CesiumJS Globe\n(CDN 1.118.0)"]
        UI <--> ZUSTAND
        UI <--> RQ
        UI --> CESIUM
    end

    subgraph API["⚙️ Express REST API (Port 4000)"]
        direction TB
        MW["Middleware Layer\nHelmet · CORS · Rate Limiter · JWT Auth"]
        ROUTES["Route Handlers\n/api/iss · /api/satellites · /api/planets\n/api/constellations · /api/predictor\n/api/locations · /api/object/:id\n/api/auth/** · /api/favorites/** · /api/history"]
        CTRL["Controllers"]
        SVC["Services\n(Business Logic)"]
        UTILS["Utils\nastroUtils.ts (Keplerian)\ntimezone.ts (tz-lookup)"]
        MW --> ROUTES --> CTRL --> SVC --> UTILS
    end

    subgraph DATA["💾 Data Layer"]
        PRISMA["Prisma ORM 5.22"]
        MYSQL["MySQL 8.0\ncelestial_eye_db"]
        TLE["Local TLE File\nactive_satellites.tle"]
        HIP["Hipparcos Dataset\nhipparcos.json"]
        PRISMA --> MYSQL
    end

    subgraph EXTERNAL["🌐 External APIs"]
        CELESTRAK["CelesTrak\nActive Satellite TLEs"]
        OPENNOTIFY["Open-Notify\nISS Position"]
        WHEREISS["wheretheiss.at\nISS Fallback"]
        OPENMETEO["Open-Meteo\nWeather Forecast"]
        NOMINATIM["Nominatim OSM\nGeocoding"]
    end

    RQ -->|"HTTP + Bearer JWT"| MW
    CESIUM -->|"Real-time data"| RQ
    SVC --> PRISMA
    SVC --> TLE
    SVC --> HIP
    SVC -->|"HTTP"| CELESTRAK
    SVC -->|"HTTP"| OPENNOTIFY
    SVC -->|"HTTP"| WHEREISS
    SVC -->|"HTTP"| OPENMETEO
    UI -->|"HTTP"| NOMINATIM
```

---

## 📁 Folder Structure

```
The Celestial Eye/
├── backend/
│   ├── data/
│   │   ├── active_satellites.tle       # Local CelesTrak TLE fallback catalog
│   │   └── hipparcos.json              # Trimmed Hipparcos star dataset (mag < 6)
│   ├── prisma/
│   │   ├── schema.prisma               # Prisma schema (MySQL, 5 models)
│   │   └── migrations/                 # Prisma migration history
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.ts               # Singleton Prisma client
│   │   ├── controllers/
│   │   │   ├── authController.ts       # Register, login, refresh, logout, profile
│   │   │   ├── constellationController.ts
│   │   │   ├── favoritesController.ts  # Favorite locations + objects CRUD
│   │   │   ├── historyController.ts    # Search history CRUD
│   │   │   ├── issController.ts
│   │   │   ├── locationController.ts   # Weather + timezone aggregation
│   │   │   ├── objectController.ts     # Unified object lookup (sat/planet/star)
│   │   │   ├── planetController.ts
│   │   │   ├── satelliteController.ts
│   │   │   └── userController.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts       # JWT Bearer token verification
│   │   │   ├── errorHandler.ts         # Global Express error handler
│   │   │   └── rateLimiter.ts          # 60 req/min per IP
│   │   ├── models/
│   │   │   ├── CelestialObject.ts
│   │   │   └── Satellite.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── celestialRoutes.ts
│   │   │   ├── constellationRoutes.ts
│   │   │   ├── favoritesRoutes.ts      # Protected (authMiddleware)
│   │   │   ├── historyRoutes.ts        # Protected (authMiddleware)
│   │   │   ├── issRoutes.ts
│   │   │   ├── locationRoutes.ts
│   │   │   ├── objectRoutes.ts
│   │   │   ├── planetRoutes.ts
│   │   │   ├── predictorRoutes.ts
│   │   │   └── satelliteRoutes.ts
│   │   ├── services/
│   │   │   ├── authService.ts          # bcrypt + JWT token management
│   │   │   ├── issService.ts           # 3-tier telemetry: HTTP → fallback → SGP4
│   │   │   ├── nasaService.ts          # Keplerian planetary positions
│   │   │   ├── planetService.ts
│   │   │   ├── predictorService.ts     # SGP4 pass scanner + planetary transits
│   │   │   ├── satelliteService.ts     # CelesTrak TLE fetch + SGP4 propagation
│   │   │   ├── starService.ts          # Hipparcos catalog + constellation grouping
│   │   │   ├── userService.ts
│   │   │   └── weatherService.ts       # Open-Meteo + moon illumination scoring
│   │   ├── utils/
│   │   │   ├── astroUtils.ts           # Keplerian elements, RA/Dec, Alt/Az, Rise/Set/Transit
│   │   │   └── timezone.ts             # tz-lookup IANA timezone
│   │   └── server.ts                   # Express app entry point
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── app/
    │   ├── about/page.tsx
    │   ├── dashboard/page.tsx          # Protected user dashboard
    │   ├── explore/page.tsx            # 3D Globe + Radar + Weather + Zenith
    │   ├── learn/page.tsx
    │   ├── predictor/page.tsx          # 24-hour celestial event timeline
    │   ├── globals.css                 # Tailwind base + glassmorphism design tokens
    │   ├── layout.tsx                  # Root layout with AppInitializer
    │   └── page.tsx                    # Home page / landing
    ├── components/
    │   ├── auth/
    │   │   └── AuthModal.tsx           # Login + Registration modal (Framer Motion)
    │   ├── globe/
    │   │   ├── CesiumGlobe.tsx         # Full CesiumJS 3D globe, satellites, planets, orbits
    │   │   ├── Globe.tsx               # CesiumGlobe wrapper with SSR guard
    │   │   └── LeafletMap.tsx          # 2D Leaflet fallback map
    │   ├── layout/
    │   │   ├── AppInitializer.tsx      # JWT validation on app boot
    │   │   ├── Navbar.tsx              # Responsive nav with auth state
    │   │   └── Providers.tsx           # React Query provider
    │   ├── predictor/
    │   │   └── PredictorTimeline.tsx   # 24-hour event list with type badges
    │   ├── radar/
    │   │   ├── ObjectDetails.tsx       # Slide-out satellite/planet/star details panel
    │   │   ├── RadarPanel.tsx          # Live satellite/ISS list with filters
    │   │   └── ZenithAnalysis.tsx      # Horizon visibility + planet position panel
    │   ├── ui/
    │   │   ├── ErrorAlert.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   └── LocationSearch.tsx      # Nominatim typeahead search
    │   └── weather/
    │       └── WeatherWidget.tsx       # Live weather + stargazing index + location bookmark
    ├── hooks/
    │   └── useCelestialQueries.ts      # All TanStack Query hooks + mutations
    ├── lib/
    │   └── api.ts                      # Axios client with Bearer auth interceptor
    ├── store/
    │   └── celestialStore.ts           # Zustand stores (celestial state + auth persist)
    ├── types/
    │   └── api.ts                      # Shared TypeScript interfaces
    ├── .env.local
    ├── next.config.ts
    ├── package.json
    ├── tailwind.config.ts
    └── tsconfig.json
```

---

## 🗄️ Database Schema

All models are managed by **Prisma ORM** against a **MySQL 8.0** database (`celestial_eye_db`).

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id              String           @id @default(uuid())
  name            String
  email           String           @unique
  passwordHash    String
  role            String           @default("USER")
  favorites       FavoriteLocation[]
  searchHistories SearchHistory[]
  favoriteObjects FavoriteObject[]
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
}

model FavoriteLocation {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  label     String
  latitude  Float
  longitude Float
  createdAt DateTime @default(now())
}

model SearchHistory {
  id         String   @id @default(uuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  query      String
  latitude   Float
  longitude  Float
  searchedAt DateTime @default(now())
}

model FavoriteObject {
  id         String   @id @default(uuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  objectId   String   // e.g. "25544", "planet_Mars", "star_HIP12345"
  objectType String   // "SATELLITE" | "PLANET" | "STAR"
  createdAt  DateTime @default(now())
}

model CelestialObject {
  id          String  @id @default(uuid())
  name        String
  type        String  // STAR | PLANET | SATELLITE
  description String? @db.Text
}
```

---

## 📡 API Reference

All endpoints are prefixed at `http://localhost:4000`. Protected routes require `Authorization: Bearer <accessToken>`.

### 🛰️ Telemetry & Astronomy

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/iss` | No | Current ISS position, altitude (km), velocity (km/h), and SGP4-propagated 60-point orbit path |
| `GET` | `/api/satellites` | No | Full CelesTrak active satellite catalog with live SGP4 coordinates, orbital elements (inclination, eccentricity, RAAN, mean motion) |
| `GET` | `/api/planets?lat=&lon=` | No | 7 planets with Keplerian geocentric RA/Dec, topocentric Alt/Az, rise/set/transit times when coordinates are provided |
| `GET` | `/api/constellations?lat=&lon=` | No | All Hipparcos constellations visible above the observer's horizon |
| `GET` | `/api/predictor?lat=&lon=` | No | Chronological 24-hour celestial event list: satellite passes (SGP4, elevation > 10°), planetary transits, constellation rises |
| `GET` | `/api/locations?lat=&lon=` | No | IANA timezone (offline) + real-time weather (temperature, wind, cloud cover, quality score 0–100) |
| `GET` | `/api/object/:id?lat=&lon=` | No | Unified object lookup — resolves `sat_*`, `planet_*`, `star_*` prefix IDs; returns full orbital data and SGP4 orbit path for satellites |

### 🔐 Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Create user (name, email, password). Returns `accessToken`, `refreshToken`, and `user` |
| `POST` | `/api/auth/login` | No | Authenticate (email, password). Returns `accessToken`, `refreshToken`, and `user` |
| `POST` | `/api/auth/refresh` | No | Exchange a valid `refreshToken` for a new `accessToken` |
| `POST` | `/api/auth/logout` | No | Revoke refresh token from server-side store |
| `GET` | `/api/auth/profile` | ✅ Yes | Return authenticated user's profile (id, name, email, role, createdAt) |

### ❤️ Favorites & History

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/favorites/locations` | ✅ Yes | List user's saved favorite locations |
| `POST` | `/api/favorites/locations` | ✅ Yes | Save a location `{ label, latitude, longitude }` |
| `DELETE` | `/api/favorites/locations/:id` | ✅ Yes | Remove a saved location by ID |
| `GET` | `/api/favorites/objects` | ✅ Yes | List user's bookmarked celestial objects |
| `POST` | `/api/favorites/objects` | ✅ Yes | Bookmark an object `{ objectId, objectType }` |
| `DELETE` | `/api/favorites/objects/:id` | ✅ Yes | Remove a bookmarked object by ID |
| `GET` | `/api/history` | ✅ Yes | List user's last 50 geocoding searches (newest first) |
| `POST` | `/api/history` | ✅ Yes | Add a search history entry `{ query, latitude, longitude }` |
| `DELETE` | `/api/history` | ✅ Yes | Clear all search history for the authenticated user |

---

## ⚙️ Installation & Setup

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MySQL** 8.0 running locally or remotely

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/the-celestial-eye.git
cd "the-celestial-eye"
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Backend Environment

Create `backend/.env`:

```env
# Server
PORT=4000
NODE_ENV=development

# Database — update with your MySQL credentials
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/celestial_eye_db"

# JWT — set a long, random secret in production
JWT_SECRET=your_long_random_secret_here

# CORS
FRONTEND_ORIGIN=http://localhost:3000

# External APIs
NASA_API_KEY=DEMO_KEY

# Logging
LOG_LEVEL=info
```

### 5. Configure Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 6. Create the MySQL Database

```sql
CREATE DATABASE IF NOT EXISTS celestial_eye_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Or via MySQL CLI:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS celestial_eye_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 7. Run Prisma Migration

```bash
cd backend
npx prisma migrate dev --name init
```

### 8. Generate Prisma Client

```bash
npx prisma generate
```

### 9. Start the Backend Server

```bash
npm run dev
# Server starts at http://localhost:4000
```

### 10. Start the Frontend Dev Server

```bash
cd ../frontend
npm run dev
# Application available at http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `4000` | Express server port |
| `NODE_ENV` | No | `development` | Environment (`development` / `production`) |
| `DATABASE_URL` | **Yes** | — | MySQL connection string (`mysql://user:pass@host:port/db`) |
| `JWT_SECRET` | **Yes** | — | Secret key for signing JWTs. Use a long random string in production |
| `FRONTEND_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin |
| `NASA_API_KEY` | No | `DEMO_KEY` | NASA API key (optional — used for future integrations) |
| `LOG_LEVEL` | No | `info` | Winston log level (`debug` / `info` / `warn` / `error`) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:4000` | Backend API base URL |

---

## 🚀 Running the Project

### Development

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

**Backend:**
```bash
cd backend
npm run build          # Compiles TypeScript to dist/
npm start              # Runs compiled dist/server.js
```

**Frontend:**
```bash
cd frontend
npm run build          # Creates optimized .next production build
npm start              # Starts Next.js production server
```

---

## ☁️ Deployment

### Frontend → Vercel

1. Import the repository in the [Vercel dashboard](https://vercel.com/new)
2. Set the **Root Directory** to `frontend`
3. Set the environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
4. Deploy — Vercel auto-detects Next.js and builds accordingly

### Backend → Railway

1. Create a new project at [Railway](https://railway.app)
2. Add a **MySQL** service — Railway provisions a MySQL 8.0 database automatically
3. Add a **Node.js** service linked to the repository
4. Set **Root Directory** to `backend`
5. Set **Build Command**: `npm run build`
6. Set **Start Command**: `npm start`
7. Add environment variables from the table above, using the Railway-provided `DATABASE_URL`
8. Run the Prisma migration via Railway shell:
   ```bash
   npx prisma migrate deploy
   ```

### Database → Railway MySQL

Railway provides a fully managed MySQL 8.0 instance. After provisioning:

```bash
# Copy the Railway-provided DATABASE_URL and set it in your backend service environment
DATABASE_URL=mysql://root:xxxx@containers-us-west-xxx.railway.app:7777/railway
```

---

## 🔬 Technical Highlights

<details>
<summary><strong>SGP4 Orbital Mechanics</strong></summary>

The backend uses `satellite.js` (SGP4/SDP4 implementation) to propagate every satellite's Two-Line Element (TLE) set. For any given satellite, the system:

1. Parses TLE line 1 and line 2 via `satellite.twoline2satrec()`
2. Propagates the ECI (Earth-Centered Inertial) position vector to the current UTC time
3. Converts ECI → geodetic coordinates using `satellite.eciToGeodetic()`
4. Computes velocity magnitude from the ECI velocity vector (`√(vx² + vy² + vz²) × 3600 km/h`)
5. For individual satellite lookup, runs 60-step orbit propagation over one full orbital period

</details>

<details>
<summary><strong>Keplerian Planetary Ephemeris</strong></summary>

Planetary positions are computed directly from J2000 Keplerian orbital elements (a, e, i, L, ω, Ω) with per-century rate corrections from the JPL Planetary Fact Sheet. The pipeline in `astroUtils.ts`:

1. Computes Julian centuries since J2000.0 (`T`)
2. Evaluates orbital elements for the current epoch
3. Solves Kepler's equation iteratively for Eccentric Anomaly (`E`)
4. Converts orbital → heliocentric ecliptic coordinates
5. Rotates to geocentric equatorial frame using Earth's orbital position and the obliquity of the ecliptic (ε = 23.4393°)
6. Converts geocentric equatorial (RA/Dec) → topocentric horizontal (Alt/Az) using Local Sidereal Time

</details>

<details>
<summary><strong>Observation Quality Scoring</strong></summary>

The stargazing quality index (0–100) is calculated as:

```
score = 100 - cloudCover
score -= max(0, humidity - 70) × 0.5      // humidity > 70% penalty
score -= max(0, windSpeed - 25) × 0.5     // wind > 25 km/h penalty
score -= moonIllumination × 15             // lunar sky glow (0–15 points)
score = clamp(score, 0, 100)
```

Moon illumination is calculated from the Moon's phase angle relative to the Sun using a standard astronomical formula.

</details>

---

## 🔮 Future Enhancements

- **Augmented Reality Mode** — WebXR overlay of live satellite positions on a phone camera feed
- **Push Notifications** — browser alerts for upcoming ISS passes above a configurable elevation threshold
- **Ephemeris Accuracy Upgrade** — integrate VSOP87 theory for sub-arcsecond planetary accuracy
- **Deep Sky Objects** — Messier and NGC catalog integration with Goto telescope motor control via WebSerial API
- **AI Observing Assistant** — natural language description of what's currently visible at your location
- **Astrophotography Planner** — moon-phase aware framing tool with DSO rise/set overlays
- **Multi-Observer Rooms** — collaborative real-time sessions for astronomy clubs
- **Historical Playback** — scrub through past satellite positions and sky states
- **Mobile App** — React Native port of the core tracking engine

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes with clear, descriptive messages:
   ```bash
   git commit -m "feat(predictor): add azimuth chart for satellite passes"
   ```
4. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open** a Pull Request against `main` with a detailed description

### Code Standards

- TypeScript strict mode is enabled on both frontend and backend
- Run `npx tsc --noEmit` in both directories before submitting a PR
- Follow existing service/controller/route patterns in the backend
- Use TanStack Query hooks for all server state in the frontend; do not use `useEffect` for data fetching

---

## 📄 License

```
MIT License

Copyright (c) 2026 Tarak Naga Venkata Durgesh Rowthu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author

<div align="center">

**Tarak Naga Venkata Durgesh Rowthu**

*Project Zenith: The Celestial Eye*

[![GitHub](https://img.shields.io/badge/GitHub-@your--username-181717?style=flat-square&logo=github)](https://github.com/your-username)

</div>

---

## 🙏 Acknowledgements

| Resource | Contribution |
|---|---|
| **[CesiumJS](https://cesium.com/)** | Open-source 3D globe engine powering the interactive Earth visualization |
| **[Prisma](https://www.prisma.io/)** | Type-safe ORM enabling rapid schema iteration with zero SQL boilerplate |
| **[satellite.js](https://github.com/shashwatak/satellite-js)** | JavaScript implementation of the SGP4/SDP4 orbital propagation algorithms |
| **[CelesTrak](https://celestrak.org/)** | Freely available Two-Line Element sets for the entire active satellite catalog |
| **[Open-Notify](http://api.open-notify.org/)** | Simple, reliable ISS real-time position API |
| **[Open-Meteo](https://open-meteo.com/)** | Open-source weather forecast API with no rate limits or API key required |
| **[Nominatim / OpenStreetMap](https://nominatim.org/)** | Free geocoding service powering the global location search |
| **[Hipparcos Catalog (ESA)](https://www.cosmos.esa.int/web/hipparcos)** | High-precision stellar astrometry data used for constellation detection |
| **[JPL Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/)** | J2000 Keplerian orbital elements for the solar system's planets |
| **[Railway](https://railway.app/)** | Deployment infrastructure for the Node.js backend and MySQL database |
| **[Vercel](https://vercel.com/)** | Zero-configuration deployment platform for the Next.js frontend |
| **[TanStack Query](https://tanstack.com/query)** | Powerful async state management for the frontend data layer |

---

<div align="center">

**Built with 🔭 and precision engineering**

*Project Zenith: The Celestial Eye — Where science meets the stars*

</div>
