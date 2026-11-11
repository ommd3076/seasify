# Seasify 🌊

**Coastal Water-Level Pattern Recognition and Anomaly Analysis Using Finite Automata**  
*Environmental Science × Automata Theory × Pattern Recognition*

---

## Overview

**Seasify** is a complete, scientifically grounded web application that transforms continuous coastal water-level telemetry from NOAA monitoring stations into discrete symbolic sequences and identifies oceanographic patterns using custom deterministic finite automata (DFA).

Unlike simple threshold alert systems, Seasify models multi-stage coastal hydrodynamic processes—such as storm surge plateaus, negative tide blowouts, resonant harbor seiches, and atypical surge recovery trajectories—using formal automata theory.

---

## Key Features

- **Real NOAA CO-OPS Telemetry:** Real-time water levels and 6-minute harmonic astronomical predictions fetched directly via NOAA Data and Metadata APIs.
- **24 Curated Coastal Stations:** Full network coverage spanning East Coast, Mid-Atlantic, Southeast, Gulf Coast, West Coast, Pacific Northwest, Alaska, and Pacific Islands.
- **Offline Resilience & Benchmarks:** Bundled historical benchmark datasets for real coastal stations and extreme events (including Hurricane Sandy, Bomb Cyclone Grayson, and Key West wind blowouts).
- **Custom Theory of Computation Engine:**
  - Deterministic symbol encoder mapping continuous residuals $r(t) = H_{\text{obs}}(t) - H_{\text{pred}}(t)$ and velocity $v_r(t)$ into a formal 9-symbol alphabet $\Sigma = \{ L:F, L:S, L:R, N:F, N:S, N:R, H:F, H:S, H:R, \text{GAP} \}$.
  - Thompson NFA construction from regular expressions with $\varepsilon$-transitions.
  - Subset construction ($\varepsilon$-closure and move function) for NFA-to-DFA determinization.
  - Partition-refinement DFA minimization preserving distinct pattern output labels.
  - Continuous stream pattern matcher with step-by-step state audit traces and deduplication.
- **Ten Coherent Desktop Screens:**
  1. **Overview:** Network activity, active stations, radial gauge, and pattern forecast.
  2. **Stations:** Real NOAA stations explorer, interactive Leaflet coastal map, status badges, and station metadata.
  3. **Monitoring:** High-resolution Recharts time series comparing observed water levels and astronomical predictions with interactive crosshairs and sensor status.
  4. **Patterns:** Curated library of 6 oceanographic patterns with archetypes and coverage metrics.
  5. **Events:** Detected anomaly log, 3-stage progression cards (Before, During Peak, After), and scientific explanations.
  6. **Reports:** Monthly anomaly summaries, key trend curves, diverging station comparisons, and working PDF & CSV exports.
  7. **Upload:** Custom user CSV observation uploader with datum/units declaration and schema validation.
  8. **Alerts:** Local rule manager with toggles, thresholds, notification channels, and quiet hours.
  9. **Settings:** Measurement preferences (metric/feet, datums), telemetry refresh intervals, and theme controls.
  10. **Pattern Engine / Automata Lab:** Interactive SVG automata diagrams, state transition tables, synchronized event stream tapes, and step-by-step simulator.
- **Refined Visual Design:** Faithfully matches the provided design reference with soft neutral backgrounds (`#DBE2DB`), crisp panels (`#F7F9F6`), dark charcoal contrast cards (`#242424`), and vibrant mint (`#A5F5A6`) and lavender (`#C5A8F8`) accents with rounded-28px card geometry.

---

## Technology Stack

- **Frontend:** React 18, TypeScript (Strict Mode), Vite, Tailwind CSS
- **State Management:** Zustand
- **Visualization:** Recharts (time series & charts), Leaflet (station mapping), Custom SVG (automata diagrams & radial gauges)
- **Data & Parsing:** NOAA CO-OPS REST APIs, PapaParse (CSV ingest & export)
- **Testing:** Vitest, Testing Library, JSDOM (18 test suites, 303 tests, 100% pass)
- **Deployment:** Production Vite build ready for Cloudflare Pages / Vercel / GitHub Pages

---

## Quick Start

### 1. Installation
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run Automated Tests
```bash
npm run test
```
Executes all 303 unit, integration, and routing adversarial tests across scientific calculations, automata, and components.

### 4. Build for Production
```bash
npm run build
```
Type-checks with strict TypeScript compiler (`tsc`) and compiles optimized static assets into `dist/`.

---

## College / Academic Demonstration Guide

1. **Real-World Telemetry Flow:**
   - Navigate to **Monitoring** (Screen 3).
   - Switch between real coastal stations (e.g., *The Battery, NY* or *San Francisco, CA*).
   - Observe the live green curve (Observed water level) aligned against the lavender curve (Astronomical prediction).
   - View the calculated non-tidal residual $r(t)$ and rate of change $v_r(t)$.

2. **Automata Pattern Recognition Flow:**
   - Open **Events** (Screen 5).
   - Select a detected anomaly event (e.g., *Elevated water level* or *Rapid water-level rise*).
   - Inspect the 3-stage progression (Before, During Peak, After) and read the generated oceanographic explanation.
   - Click to inspect the underlying automata trace.

3. **Theory of Computation Demonstration (Automata Lab):**
   - Open **Automata Lab** (Screen 10).
   - Select a formal pattern rule (e.g., *Elevated Tide Event with Recovery*).
   - Switch between **State Flow**, **NFA**, **DFA**, and **Minimized DFA** views.
   - Review the formal transition table $\delta(Q \times \Sigma \to Q)$.
   - Use the **Sequence Simulator**: add tokens `Rise`, `Hold`, `Hold`, `Fall`, and step through transitions to observe the machine reach the accepting state with 94% confidence.
   - Test a rejected sequence (e.g., `Normal`, `Fall`, `Fall`) and observe rejection.

4. **Data Ingestion & Export:**
   - Navigate to **Upload** (Screen 7) and drag in a CSV file or inspect the dataset preview.
   - Navigate to **Reports** (Screen 6) and click **CSV** to download formatted telemetry reports or **PDF** to print.

---

## Scientific Limitation & Disclaimer

*Seasify is an academic, educational, and analytical monitoring software designed for pattern recognition and research in coastal oceanography. A positive residual is not necessarily a flood, and a negative residual is not necessarily a hazardous blowout. Seasify is NOT a certified maritime navigation, tsunami warning, or official life-safety flood forecasting system.*

---

## License

MIT License. Developed for coastal research and automata theory education.
