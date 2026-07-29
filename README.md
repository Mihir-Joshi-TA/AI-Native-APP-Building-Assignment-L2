# Weather Intelligence Dashboard

A high-density real-time weather intelligence dashboard powered by Open-Meteo telemetry and forecast analytics.

## 🌟 Overview

**Weather Intelligence** delivers precision atmospheric telemetry, interactive trend visualizations, and actionable health & operational advisories. Designed with a dark cyber-slate UI, the app provides real-time conditions, 24-hour micro-forecasts, a 7-day extended outlook, and intelligent advisory engines for clothing, outdoor safety, and health risks.

---

## ✨ Features

- **Real-Time Telemetry Hero**: View current temperature, felt temperature, humidity, dew point, wind velocity & direction, UV index, cloud cover, and surface barometric pressure.
- **Hourly Forecast Trends**: Interactive hourly temperature and precipitation probability chart powered by Recharts with dynamic granularity filters.
- **7-Day Extended Outlook**: Comprehensive daily min/max temperature bands, weather conditions, sunrise/sunset times, and max wind gust trends.
- **Smart Advisory Engine**: Automated recommendations for daily outfit selection, UV protection, outdoor activity feasibility, and weather-driven health advisories (e.g., joint sensitivity, hydration, air quality).
- **City Search & Autocomplete**: Debounced location search across global geocoding databases with search history tracking.
- **GPS Location Detection**: One-click geolocation integration with reverse geocoding lookup.
- **Unit Toggle**: Instant switching between Metric (°C, km/h, mm) and Imperial (°F, mph, in) units.
- **Resilient Error Handling**: Robust error recovery for empty search queries, invalid city names, missing search results, API timeouts, and offline connection loss with built-in telemetry fallback and easy retry mechanisms.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion
- **Charts & Data Viz**: Recharts
- **Icons**: Lucide React
- **Backend & Proxy**: Express server with Vite middleware for dev mode and esbuild bundling for production
- **Weather Data**: Open-Meteo Forecast & Geocoding APIs

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm** or **bun**

### Installation

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally (Development Mode)

Start the local development server (runs on `http://localhost:3000` by default):

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Building & Running Locally (Production Mode)

1. Build the frontend client assets and backend Express bundle:
   ```bash
   npm run build
   ```

2. Start the production Node server:
   ```bash
   npm start
   ```

Open `http://localhost:3000` in your browser.

---

## 🐳 Docker Setup & Execution

### 1. Docker Files Overview

- **`Dockerfile`**: Multi-stage build process using `node:20-alpine` for asset building and `nginx:1.27-alpine` for serving static files on port 8080.
- **`.dockerignore`**: Excludes `node_modules`, `dist`, logs, and local environment files.
- **`nginx.conf`**: Configures Nginx with SPA fallback (`try_files`) and a `/health` endpoint returning `200 ok`.

### 2. Verify Docker access inside WSL

Run these commands inside Ubuntu WSL:

```bash
docker --version
docker ps
```

*Note: If Docker is not available inside WSL, follow the Docker Engine setup reference in the WSL and Docker Setup Guidelines. Contact IT Helpdesk only if installation fails, permissions are blocked, package repositories are unavailable, or the Docker daemon cannot be started.*

### 3. Build the Docker Image

Run this from the WSL or terminal project root:

```bash
docker build -t weather-intelligence .
```

### 4. Run the Docker Container

Run the built image mapping port `8080` to host port `8080`:

```bash
docker run -d -p 8080:8080 --name weather-intelligence-app weather-intelligence
```

- **Application URL**: Open `http://localhost:8080` in your browser.
- **Healthcheck Endpoint**: Visit `http://localhost:8080/health` (returns `200 ok`).

### 5. Managing the Running Container

To view logs, stop, or remove the container:

```bash
# View container logs
docker logs -f weather-intelligence-app

# Stop the container
docker stop weather-intelligence-app

# Remove the container
docker rm weather-intelligence-app
```

---

## 🔍 Validation & Linting

Run TypeScript type check:

```bash
npm run lint
```

---

## 📄 License

MIT License. Open-Meteo data is provided under non-commercial open database terms (WMO standard compliant).
