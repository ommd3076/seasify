# Project: Seasify — Coastal Water-Level Monitoring & Automata Pattern Recognition

## Architecture

Seasify is a high-performance, client-first web application connecting NOAA coastal oceanographic telemetry with formal finite automata theory across 10 desktop screens.

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                   PRESENTATION LAYER                                  │
│  React 18 + TypeScript (Strict) + Tailwind CSS + Lucide Icons                         │
│  Layout Shell: Left Floating Nav Sidebar (10 Screens) + Top Header Bar + Modular Cards │
│  Design Tokens: --background: #DBE2DB, --surface: #F7F9F6, --charcoal: #242424        │
│                 --mint: #A5F5A6, --mint-strong: #68DD79, --lavender: #C5A8F8          │
├───────────────────────────────────────────────────────────────────────────────────────┤
│                                   APPLICATION SCREENS                                 │
│  [Screen 1: Overview]         [Screen 2: Stations]         [Screen 3: Monitoring]     │
│  [Screen 4: Patterns]         [Screen 5: Events]           [Screen 6: Reports]        │
│  [Screen 7: Upload]           [Screen 8: Alerts]           [Screen 9: Settings]       │
│  [Screen 10: Pattern Engine / Automata Lab]                                           │
├───────────────────────────────────────────────────────────────────────────────────────┤
│                                 STATE & VISUALIZATION                                 │
│  Zustand Stores: Stations, TideData, Automata, Alerts, Reports, Settings               │
│  Visualizations: Leaflet Maps, Recharts / ECharts, Custom SVG Automata Graph, Gauges  │
├───────────────────────────────────────────────────────────────────────────────────────┤
│                                  WEB WORKER PIPELINE                                  │
│  Worker Thread: Background Network Fetch, Cache Management (IndexedDB)                │
│                 PCHIP Cubic Spline / Temporal Alignment                               │
│                 Residual Calculation: R(t) = Observed(t) - Predicted(t)               │
│                 Rolling Statistics: Mean, Variance, Z-Score, dR/dt Velocity           │
├───────────────────────────────────────────────────────────────────────────────────────┤
│                            FINITE AUTOMATA PATTERN ENGINE                             │
│  Discretizer: R(t), dR/dt -> Alphabet Σ = { EL, L, N, H, EH, RR, RF, G }             │
│  6 Formal DFAs: (Q, Σ, δ, q₀, F) for Sustained Surge, Blowout, Rapid Rise, Seiche,   │
│                 Abnormal Recovery, and Telemetry Data Gaps                            │
│  Audit Trace Recorder + Oceanographic Explanation Generator                           │
├───────────────────────────────────────────────────────────────────────────────────────┤
│                                   DATA LAYER & API                                    │
│  NOAA CO-OPS Metadata API + Data API (Direct CORS: Access-Control-Allow-Origin: *)    │
│  Offline Bundled Datasets: 13 Coastal Stations + 6 Historical Extreme Events          │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| F01 | Design System & Color Tokens | Tailwind theme with exact tokens (#DBE2DB, #F7F9F6, #242424, #A5F5A6, #68DD79, #C5A8F8, etc.) & rounded-28px geometry | M1 | UI Survey §1.2 |
| F02 | Desktop Application Shell | Floating left sidebar with 10 nav pills, wave logo, top header bar, global station & date filters | M1 | UI Survey §1.3 |
| F03 | Core Shared UI Components | Metric cards (dark & light), radial gauge, status badges, buttons, dropdowns, date pickers, modals | M1 | UI Survey §4 |
| F04 | NOAA CO-OPS API Client | Live metadata (303 stations) and data API client with error handling, timeout, and direct CORS | M2 | NOAA Survey §1.2, §1.3 |
| F05 | Water-Level Residual Engine | Non-tidal residual calculation $R(t) = obs(t) - pred(t)$ with temporal alignment & PCHIP interpolation | M2 | NOAA Survey §2.1, §2.2 |
| F06 | Rolling Statistics & Anomaly Scoring | Rolling mean, standard deviation, deviation z-scores, surge velocity $dR/dt$ | M2 | NOAA Survey §2.3 |
| F07 | Bundled Offline Coastal Datasets | 13 representative coastal stations with full offline metadata & time-series cache | M2 | NOAA Survey §3.1 |
| F08 | Historical Storm Benchmark Datasets | 6 bundled historical extreme events (Sandy, Grayson, Ian, Annapolis King Tide, SF, Glitch) | M2 | NOAA Survey §3.2 |
| F09 | Web Worker Pipeline | Typed RPC protocol for background data fetching, interpolation, residual math, and automata parsing | M2 | NOAA Survey §4 |
| F10 | Time-Series Discretization Layer | Discretization of continuous residuals into master alphabet $\Sigma = \{EL, L, N, H, EH, RR, RF, G\}$ & UI aliases | M3 | Automata Survey §2.1 |
| F11 | Formal 5-Tuple DFA Models | Formal DFAs for Sustained Surge, Depressed, Rapid Transition, Seiche, Abnormal Recovery, Data Gap | M3 | Automata Survey §2.2 |
| F12 | Deterministic Automata Engine | Pure TypeScript state machine execution with full step trace logging and accepting state detection | M3 | Automata Survey §2.3 |
| F13 | Scientific Explanation Generator | Oceanographically sound automated narrative generation explaining matched patterns and peak values | M3 | Automata Survey §2.3.2 |
| F14 | Screen 1 — Overview | Tide activity summary, recent events, live water level radial gauge, pattern forecast timeline | M4 | UI Survey §1.3 (Screen 1) |
| F15 | Screen 2 — Stations | Station explorer with search, interactive Leaflet coastal map with status pins, quick details | M4 | UI Survey §1.3 (Screen 2) |
| F16 | Screen 3 — Monitoring | Observed vs predicted time-series chart with crosshairs, metrics grid, sensor status, anomaly flags | M4 | UI Survey §1.3 (Screen 3) |
| F17 | Screen 4 — Patterns | Pattern library with archetypes, pattern coverage gauge, active detections, severity badges | M4 | UI Survey §1.3 (Screen 4) |
| F18 | Screen 10 — Pattern Engine / Automata Lab | Interactive SVG state diagram, transition table, synchronized event tape trace, sequence simulator | M4 | Automata Survey §2.4, UI Survey §1.3 |
| F19 | Screen 5 — Events | Detected anomaly list, event time series, 3-stage progression cards (before/during/after), notes | M5 | UI Survey §1.3 (Screen 5) |
| F20 | Screen 6 — Reports | Monthly anomaly summary, key trends dual chart, station comparison diverging bars, PDF/CSV export | M5 | UI Survey §1.3 (Screen 6) |
| F21 | Screen 7 — Upload | Drag & drop file uploader, file validation checklist, dataset preview table & wave chart | M5 | UI Survey §1.3 (Screen 7) |
| F22 | Screen 8 — Alerts | Alert rules manager with toggles, threshold sliders, notification channels, quiet hours | M5 | UI Survey §1.3 (Screen 8) |
| F23 | Screen 9 — Settings | Organization profile, refresh intervals, unit preferences (Meters/Feet), theme toggle, station manager | M5 | UI Survey §1.3 (Screen 9) |
| F24 | E2E Integration & Test Pass | Pass 100% of Tiers 1-4 tests published by E2E Testing Track | M6 | ORIGINAL_REQUEST §Acceptance |
| F25 | Adversarial Coverage Hardening | White-box stress testing, edge case verification, boundary stability, race condition audit | M6 | Project Pattern Final Milestone |
| F26 | Git Version Control & Deployment | Continuous commits, clean build, zero TypeScript/ESLint errors, push to GitHub `ommd3076/seasify` | M6 | ORIGINAL_REQUEST R5 |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Foundation Scaffolding, Design Tokens & Shell | Project scaffold, Tailwind design tokens, router (10 routes), layout shell, sidebar, shared UI components | none | IN_PROGRESS |
| M2 | NOAA Data Engine, Residuals & Web Worker | NOAA API client, residual calculations, interpolation, 13 stations + 6 fallback datasets, Web Worker | M1 | PLANNED |
| M3 | Finite Automata Pattern Engine & Trace System | Discretizer, 6 DFA specifications, deterministic execution engine, trace logger, explanation generator | M1 | PLANNED |
| M4 | Core Monitoring & Automata Screens | Screen 1 (Overview), Screen 2 (Stations & Map), Screen 3 (Monitoring), Screen 4 (Patterns), Screen 10 (Automata Lab) | M2, M3 | PLANNED |
| M5 | Operations, Analysis & Management Screens | Screen 5 (Events), Screen 6 (Reports & Export), Screen 7 (Upload), Screen 8 (Alerts), Screen 9 (Settings) | M4 | PLANNED |
| M6 | Final Milestone: 100% E2E Pass, Hardening & Git | Verify 100% pass on Tiers 1-4 E2E tests, Tier 5 adversarial hardening, production build, GitHub push | M5, TEST_READY | PLANNED |

*Parallel Track*:
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| E2E | E2E Testing Suite Track | Test harness (Vitest + Playwright), Tiers 1-4 test suites across all 10 screens, publish `TEST_READY.md` | M1 (shell routes) | IN_PROGRESS |

---

## Interface Contracts

### 1. Data Layer ↔ Presentation Layer (`src/types/noaa.ts`)
```typescript
export interface StationMetadata {
  id: string;
  name: string;
  lat: number;
  lng: number;
  state: string;
  status: 'normal' | 'elevated' | 'low_tide' | 'maintenance';
  waterLevel: number; // meters
  delta24h: number; // meters
  trend30d: number; // meters
  lastAnomaly?: {
    timestamp: string;
    description: string;
    delta: number;
  };
}

export interface WaterLevelPoint {
  timestamp: string; // ISO 8601
  observed: number | null; // meters
  predicted: number | null; // meters
  residual: number | null; // observed - predicted
  rateOfChange: number | null; // m/hr
  zScore: number | null;
  qualityFlag: 'verified' | 'preliminary' | 'interpolated' | 'missing';
}
```

### 2. Discretizer & Automata Engine (`src/types/automata.ts`)
```typescript
export type ResidualSymbol = 'N' | 'H' | 'EH' | 'L' | 'EL' | 'RR' | 'RF' | 'G';
export type EventAlias = 'Rise' | 'Hold' | 'Fall' | 'Stabilize' | 'Low' | 'Extreme' | 'Gap' | 'Normal';

export interface AutomataStepTrace {
  stepIndex: number;
  timestamp: string;
  observedLevel: number | null;
  predictedLevel: number | null;
  residual: number | null;
  rateOfChange: number | null;
  symbol: ResidualSymbol;
  symbolAlias: EventAlias;
  symbolConfidence: number;
  previousState: string;
  activeState: string;
  transitionCondition: string;
  isAccepting: boolean;
  matchEvent?: PatternMatchSummary;
}

export interface PatternMatchSummary {
  matchId: string;
  patternId: 'sustained_elevated' | 'sustained_depressed' | 'rapid_transition' | 'oscillatory' | 'abnormal_recovery' | 'record_gap';
  patternName: string;
  stationId: string;
  stationName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  peakTime: string;
  peakResidual: number;
  baselineResidual: number;
  confidence: number;
  statePath: string[];
  triggerSteps: AutomataStepTrace[];
  explanation: string;
}
```

### 3. Web Worker RPC Contract (`src/types/worker.ts`)
```typescript
export interface WorkerRequest {
  id: string;
  type: 'FETCH_AND_ANALYZE' | 'ANALYZE_RAW_SERIES' | 'SIMULATE_AUTOMATA';
  payload: any;
}

export interface WorkerResponse {
  id: string;
  type: 'SUCCESS' | 'PROGRESS' | 'ERROR';
  payload: any;
}
```

---

## Code Layout

```
c:\ommd3076\Proejcts\Automata-theory-A\
├── .agents/                      # Agent orchestration metadata (NO source code here)
├── public/                       # Static assets, fallback datasets
├── ui-ref/                       # Visual design reference images
├── src/
│   ├── assets/                   # Icons, SVG waves, brand marks
│   ├── components/               # Reusable UI components
│   │   ├── common/               # Buttons, Badges, Dropdowns, DatePickers, Modals
│   │   ├── layout/               # Sidebar, Header, PageContainer, CardPanels
│   │   ├── charts/               # TideChart, AnomalyChart, GaugeMeter, MiniSparkline
│   │   ├── map/                  # StationMap (Leaflet integration)
│   │   └── automata/             # AutomataGraph, TransitionTable, EventTape, Simulator
│   ├── engine/                   # Pure TypeScript scientific algorithms
│   │   ├── noaa/                 # API client, datum converter, unit conversions
│   │   ├── residual/             # Spline interpolation, residual math, rolling stats
│   │   └── automata/             # Discretizer, 6 DFAs, execution engine, explanation
│   ├── data/                     # Offline fallback datasets
│   │   ├── stations.json         # 13 representative coastal stations metadata
│   │   └── fallback/             # 6 historical event datasets (Sandy, Grayson, etc.)
│   ├── stores/                   # Zustand stores
│   │   ├── stationStore.ts
│   │   ├── tideDataStore.ts
│   │   ├── automataStore.ts
│   │   ├── alertStore.ts
│   │   └── settingsStore.ts
│   ├── workers/                  # Web Worker scripts
│   │   └── timeSeriesWorker.ts
│   ├── screens/                  # 10 Application Screens
│   │   ├── OverviewScreen.tsx    # Screen 1
│   │   ├── StationsScreen.tsx    # Screen 2
│   │   ├── MonitoringScreen.tsx  # Screen 3
│   │   ├── PatternsScreen.tsx    # Screen 4
│   │   ├── EventsScreen.tsx      # Screen 5
│   │   ├── ReportsScreen.tsx     # Screen 6
│   │   ├── UploadScreen.tsx      # Screen 7
│   │   ├── AlertsScreen.tsx      # Screen 8
│   │   ├── SettingsScreen.tsx    # Screen 9
│   │   └── AutomataLabScreen.tsx # Screen 10
│   ├── types/                    # Shared TypeScript interfaces & types
│   ├── utils/                    # Export utilities (PDF, CSV), date helpers
│   ├── App.tsx                   # Main app & route configuration
│   └── main.tsx                  # React entry point
├── tests/
│   ├── unit/                     # Vitest unit tests (automata, residual, math)
│   ├── integration/              # Vitest integration tests (worker, stores)
│   └── e2e/                      # Playwright E2E tests (10 screens & user flows)
├── index.html                    # Root HTML
├── package.json                  # Dependencies & scripts
├── tailwind.config.js            # Custom design tokens & radii
├── tsconfig.json                 # TypeScript strict mode configuration
└── vite.config.ts                # Vite build configuration
```
