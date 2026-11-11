# Seasify — System Architecture

**Formal Academic Title:** Coastal Water-Level Pattern Recognition and Anomaly Analysis Using Finite Automata  
**Domain:** Environmental Science × Automata Theory × Pattern Recognition  
**Stack:** React 18, TypeScript (Strict), Vite, Tailwind CSS, Zustand, Recharts, Leaflet, Lucide Icons  

---

## 1. High-Level Architecture Overview

Seasify is designed around a **client-first, scientifically grounded architecture** that operates with full offline resilience. It continuously monitors coastal water level telemetry from the NOAA CO-OPS network, extracts non-tidal astronomical residuals, encodes them into a formal finite alphabet, and recognizes oceanographic patterns via custom deterministic finite automata (DFA).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PRESENTATION LAYER                                   │
│  React 18 + TypeScript (Strict) + Tailwind CSS + Lucide Icons                          │
│  Design Tokens: --background: #DBE2DB, --surface: #F7F9F6, --charcoal: #242424         │
│                 --mint: #A5F5A6, --mint-strong: #68DD79, --lavender: #C5A8F8           │
│  10 Desktop Screens (Overview, Stations, Monitoring, Patterns, Events, Reports, etc.) │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                  STATE MANAGEMENT                                      │
│  Zustand Stores:                                                                       │
│  - useStationStore: Active & 10 seed NOAA stations, geo coordinates, status filters   │
│  - useTideDataStore: Aligned time series, residual calculations, detected events      │
│  - useAutomataStore: Active DFA, NFA conversion, transition tables, interactive sim    │
│  - useAlertStore: Local threshold rules, triggered alert log, notification channels    │
│  - useSettingsStore: Measurement units (m/ft), datums (MLLW/MSL), refresh intervals    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                             SCIENTIFIC ANALYSIS ENGINE                                 │
│  - Temporal Alignment & Normalization: UTC ISO 8601 timestamps, MLLW/MSL datum         │
│  - Non-Tidal Residual Calculation: R(t) = H_observed(t) - H_predicted(t)              │
│  - Dynamic Rate of Change: v_r(t) = (R(t) - R(t - dt)) / dt (m/hr, real elapsed time) │
│  - Data Quality & Gap Detection: dt > 30 min triggers GAP symbol & state suspension    │
│  - Rolling Z-Score Statistics: Windowed mean and standard deviation over 20 points     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                           FINITE AUTOMATA PATTERN ENGINE                               │
│  - Discretizer: Continuous R(t), v_r(t) -> Alphabet Σ = { L:F, L:S, L:R, ... GAP }     │
│  - Formal DFA Models: 5-tuple M = (Q, Σ, δ, q0, F) for 6 oceanographic patterns       │
│  - Thompson NFA Construction: Elementary symbols, concat, union, star, plus            │
│  - Subset Construction: ε-closure and move() for NFA -> DFA determinization            │
│  - Partition Refinement Minimization: Preserves distinct pattern output labels         │
│  - Stream Matcher & Tracer: Continuous recognition with audit step traces & dedup      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                DATA & TELEMETRY LAYER                                  │
│  - NOAA CO-OPS Data API: Direct CORS fetch for water_level & 6-min predictions         │
│  - In-Memory Request Cache: 5-minute TTL with bounded exponential backoff & timeout    │
│  - Bundled Reference Datasets: 10 real coastal stations + 6 historical extreme events  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
seasify/
├── docs/
│   ├── ARCHITECTURE.md          # Comprehensive software architecture
│   ├── AUTOMATA_THEORY.md       # Formal mathematical proofs, NFAs, DFAs
│   ├── DATA_PIPELINE.md         # NOAA telemetry ingest, residual math, quality
│   └── TEST_RESULTS.md          # Test execution reports and coverage
├── public/                      # Static web assets
├── ui-ref/                      # 10 UI design reference screenshots
├── src/
│   ├── components/
│   │   ├── automata/            # AutomataGraph, TransitionTable, EventTape, Simulator
│   │   ├── charts/              # TideChart, ResidualChart, RadialGauge, MiniSparkline
│   │   ├── common/              # Badge, Button, Card, Dropdown, Modal
│   │   ├── layout/              # Sidebar, Header
│   │   └── map/                 # StationMap (Leaflet integration)
│   ├── data/
│   │   ├── historicalEvents.ts  # 6 historical extreme storm benchmarks (Sandy, etc.)
│   │   └── stations.ts          # 10 curated real NOAA stations metadata
│   ├── engine/
│   │   ├── automata/            # NFA, subset construction, DFA minimization, regex
│   │   ├── noaa/                # NOAA Data and Metadata API client with fallback
│   │   └── science/             # Residual calculation, rate of change, symbol encoder
│   ├── screens/                 # All 10 Application Screens
│   │   ├── OverviewScreen.tsx   # Screen 1
│   │   ├── StationsScreen.tsx   # Screen 2
│   │   ├── MonitoringScreen.tsx # Screen 3
│   │   ├── PatternsScreen.tsx   # Screen 4
│   │   ├── EventsScreen.tsx     # Screen 5
│   │   ├── ReportsScreen.tsx    # Screen 6
│   │   ├── UploadScreen.tsx     # Screen 7
│   │   ├── AlertsScreen.tsx     # Screen 8
│   │   ├── SettingsScreen.tsx   # Screen 9
│   │   └── AutomataLabScreen.tsx# Screen 10
│   ├── stores/                  # Zustand state management
│   ├── types/                   # Strict TypeScript interfaces
│   ├── App.tsx                  # Root shell and tab router
│   └── main.tsx                 # React DOM entry
├── tests/                       # 14 test suites with 212 tests (100% pass)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 3. Design System & Tokens

The application strictly implements the design system defined in Section 3 of the specification:

```css
--background: #DBE2DB;     /* Calm sage-gray canvas */
--surface: #F7F9F6;        /* High-luminance panel surface */
--surface-muted: #EAEFEC;  /* Muted card inset */
--charcoal: #242424;       /* Primary contrast panel */
--text-primary: #171A18;   /* Deep obsidian typography */
--text-secondary: #737A75; /* Subdued explanatory typography */
--mint: #A5F5A6;           /* Positive residual, active pills, indicators */
--mint-strong: #68DD79;    /* High contrast mint for lines and gauges */
--lavender: #C5A8F8;       /* Astronomical predictions, low tides, secondary */
--border: #D9DEDA;         /* Ultra-thin hairline border */
```

Corner radii for modular cards are set to `rounded-[28px]` and `rounded-[24px]` across all screens.
