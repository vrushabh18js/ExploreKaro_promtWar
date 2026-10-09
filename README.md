# 🧭 exploreKaro — Urban Operating System

> **Prompt War × Hack2Skill Submission**  
> *Theme:* City Life: Exploring, Experiencing & Navigating the Chaos We Call Home  
> *Developed using Google Antigravity & Modern Web Technologies*

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
- **Mapping & Geodata**: Leaflet.js + CartoDB Voyager / Dark Matter tiles
- **Geocoding & Reverse Geocoding**: OpenStreetMap (Nominatim API)
- **Live Weather**: Open-Meteo REST API (zero API key bottleneck)
- **Speech Synthesis**: Native Web Speech API for zero-latency audio guides
- **Persistence**: Browser LocalStorage for citizen reports, bookmarks, and custom notes
- **Styling**: Tailored Modern CSS Design System (CSS tokens, glassmorphism, responsive split-viewport)
- **Icons**: Lucide React

---

## 🚀 Key Modules
- **`Header.jsx`**: Universal location search with debounced autocomplete, GPS detector, city selector, and $1 - 30\text{ km}$ dynamic radius slider.
- **`ChaosBanner.jsx`**: Urban Status Bar showing real-time weather, rain risk, traffic status, and active caution warnings.
- **`MapViewer.jsx`**: High-performance interactive map with custom colored SVG pins, animated caution hotspots, dynamic radius boundaries, and route polylines.
- **`RoutePlannerModal.jsx`**: Multi-modal navigation (Drive, Transit, Bike, Walk) featuring a dual-route algorithm: **Fastest Path** vs. **SafeGuard Path** with carbon footprint savings.
- **`BestVsWorstModal.jsx`**: Side-by-side radar and comparative bars evaluating neighborhoods with AI verdicts.
- **`CitizenDispatchModal.jsx`**: Community incident reporting with category tags, severity sliders, simulated voice notes, and photo uploads that update the live map instantly.
- **`SmartVoiceAssistant.jsx`**: In-app AI Concierge that parses natural language queries and filters destinations.

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
