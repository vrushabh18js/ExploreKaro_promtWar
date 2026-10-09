<<<<<<< HEAD
# 🧭 exploreKaro — Urban Operating System

> **Prompt War × Hack2Skill Submission**  
> *Theme:* City Life: Exploring, Experiencing & Navigating the Chaos We Call Home  
> *Developed using Google Antigravity & Modern Web Technologies*

---

## 🚀 Live Web Deployment
- **Live URL**: [https://explorekaro.web.app](https://explorekaro.web.app)
- **Alternate Mirror**: [https://explorekaro.firebaseapp.com](https://explorekaro.firebaseapp.com)
- **Status**: 🟢 **Live & Deployed on Firebase Hosting**

---

## 🌟 Overview & Core Value Proposition
Urban exploration is fraught with fragmented information, unverified safety risks, traffic snarls, and missing cultural depth. **exploreKaro** turns this urban chaos into an intelligent, seamless, and memorable adventure.

Whether searching by **city**, **GPS location**, or **any arbitrary global address** with a custom radius ($1 - 30\text{ km}$), exploreKaro synthesizes:
1. **Exploration & Hospitality**: Curated cultural attractions, street food secrets, budget stays, and hidden gems.
2. **History & Culture**: Rich historical origins and in-depth cultural lore with **native interactive audio narration** (Web Speech API).
3. **Safety & Security**: Active caution heatzones, citizen hazard reports, and a **SafeGuard Route** engine prioritizing well-lit, CCTV-monitored boulevards over dark alleys.
4. **Best vs. Worst Places**: An interactive **City Reality Index** providing side-by-side neighborhood scorecards across *Safety, Cleanliness, Affordability, Walkability, and Transit*.
5. **Smart City Insights**: Real-time weather, traffic congestion indicators, air quality (AQI), optimal visiting hours, and a citizen dispatch portal supporting voice note simulations and photo evidence.
6. **AI Concierge**: A natural-language query parser understanding real human intent (e.g., *"Find late-night safe food spots with wheelchair accessibility"*).

---

## 🛠️ Tech Stack & Architecture
- **Framework**: React 19 + Vite 8
- **Hosting & Deployment**: Firebase Hosting (`explorekaro.web.app`)
- **Authentication**: Firebase Authentication (Optional Google OAuth Login)
- **Database & Telemetry**: Firebase Realtime Database for live community hazard dispatches + Firebase Analytics
- **Live AI & Web Intelligence**: Gemini 2.5 Flash / OpenRouter / Grok APIs for dynamic tourism discovery
- **Navigation & Directions**: Universal **Google Maps Turn-by-Turn Redirection** with multi-modal transit modes
- **Mapping & Geodata**: Leaflet.js + OpenStreetMap tile service (zero API key bottleneck)
- **Geocoding & Reverse Geocoding**: Photon by Komoot + Nominatim OpenStreetMap API
- **Live Weather**: Open-Meteo REST API for realtime temperatures, condition codes, and rain probabilities
- **Speech Synthesis**: Native Web Speech API for zero-latency audio lore narration
- **Persistence**: Browser LocalStorage + Firebase Cloud Realtime sync
- **Styling**: Tailored Modern CSS Design System (Permanent Light Theme, sleek glassmorphism, responsive split-viewport)
- **Icons**: Lucide React

---

## 🚀 Key Modules
- **`Header.jsx`**: Universal location search with debounced autocomplete, GPS detector, city selector, $1 - 30\text{ km}$ dynamic radius slider, and top-right optional Google Sign-In.
- **`ChaosBanner.jsx`**: Urban Status Bar showing real-time weather, rain risk, traffic bottlenecks, and active caution warnings.
- **`MapViewer.jsx`**: Interactive Leaflet map with custom colored pins, animated caution hotspots, dynamic radius boundaries, live route polylines, and direct Google Maps navigation triggers.
- **`RoutePlannerModal.jsx`**: Multi-modal navigation (Drive, Transit, Bike, Walk) with **SafeGuard Path** vs. **Fastest Path** and 1-click **Launch Google Maps Turn-by-Turn Navigation**.
- **`PlaceCard.jsx` & `PlaceDetailModal.jsx`**: Curated dossiers featuring audio lore player, distance calculations, safety scores, and instant Google Maps directions.
- **`AIDataInspectorModal.jsx`**: Realtime telemetry inspector displaying live AI provider statuses, weather parameters, and raw JSON dossiers.
- **`BestVsWorstModal.jsx`**: Side-by-side radar and comparative bars evaluating neighborhoods with AI verdicts.
- **`CitizenDispatchModal.jsx`**: Community incident reporting with category tags, severity sliders, and live sync to Firebase Realtime Database.
- **`SmartVoiceAssistant.jsx`**: In-app AI Concierge parsing natural language queries and filtering destinations.

---

## 💻 Running Locally
```bash
# Install dependencies
npm install

# Start local development server
npm run dev
# -> Runs on http://localhost:5173/

# Run production build
npm run build
```

---

## 🏆 Official Hack2Skill Judging Rubric Alignment
- **Problem Impact**: Solves the complete "City Life" challenge statement across all 5 mandatory pillars.
- **Technical Depth**: Zero fake mocks. Real geocoding, live weather, real dynamic distance filtering, speech synthesis, and local persistence.
- **UI/UX Excellence**: High-contrast, responsive, accessible, dark/light theme toggle, and smooth micro-interactions.
- **Dual Submission Ready**: Structured and clean for both live web deployment and LinkedIn build-in-public documentation.
=======
# ExploreKaro_promtWar
ExploreKaro is an AI-powered travel planning platform designed to help users discover tourist destinations, explore hidden gems, and plan personalized trips. It combines intelligent recommendations, interactive maps, live location, route planning, and travel insights to make exploring easier, smarter, and more convenient.
>>>>>>> 6f75d14016722a28dbf351f44aeda7ce060df1e8
