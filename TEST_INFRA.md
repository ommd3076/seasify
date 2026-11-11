# E2E Test Infra: Seasify

## Test Philosophy
- Opaque-box, requirement-driven derived strictly from `ORIGINAL_REQUEST.md` and `PROJECT.md § Feature Inventory`.
- Independent of implementation internals: tests interact through user entry points (DOM elements, client-side routing, API responses, files).
- Methodology: 4-Tier Test Architecture (Category-Partition, Boundary Value Analysis, Pairwise Combinatorial, Real-World Workloads).

## Feature Inventory Mapping
| # | Feature | Requirement Source | Tier 1 (Min 5) | Tier 2 (Min 5) | Tier 3 (Pairwise) | Tier 4 (Workflows) |
|---|---|---|:---:|:---:|:---:|:---:|
| F01 | Design Tokens & CSS | R1 Visual design system | 5 | 5 | ✓ | ✓ |
| F02 | Application Shell & Nav | R1 Sidebar & 10 screens | 5 | 5 | ✓ | ✓ |
| F03 | Core Shared Components | R1 Interactive controls | 5 | 5 | ✓ | ✓ |
| F04 | NOAA API Client | R2 Live NOAA data | 5 | 5 | ✓ | ✓ |
| F05 | Water-Level Residuals | R2 Residual computation | 5 | 5 | ✓ | ✓ |
| F06 | Rolling Statistics | R2 Statistical analysis | 5 | 5 | ✓ | ✓ |
| F07 | Bundled Offline Stations| R2 Fallback datasets | 5 | 5 | ✓ | ✓ |
| F08 | Historical Storm Events | R2 Fallback datasets | 5 | 5 | ✓ | ✓ |
| F09 | Web Worker Pipeline | R2 Web Worker processing | 5 | 5 | ✓ | ✓ |
| F10 | Residual Discretization | R3 Symbol alphabet | 5 | 5 | ✓ | ✓ |
| F11 | 6 Formal DFA Models | R3 Pattern automata | 5 | 5 | ✓ | ✓ |
| F12 | Deterministic Engine | R3 State transitions & trace | 5 | 5 | ✓ | ✓ |
| F13 | Explanation Generator | R3 Pattern explanations | 5 | 5 | ✓ | ✓ |
| F14 | Screen 1 — Overview | R1 Overview screen | 5 | 5 | ✓ | ✓ |
| F15 | Screen 2 — Stations | R1 Stations screen & map | 5 | 5 | ✓ | ✓ |
| F16 | Screen 3 — Monitoring | R1 Monitoring screen | 5 | 5 | ✓ | ✓ |
| F17 | Screen 4 — Patterns | R1 Patterns screen | 5 | 5 | ✓ | ✓ |
| F18 | Screen 10 — Automata Lab| R1, R3 Pattern Engine Lab | 5 | 5 | ✓ | ✓ |
| F19 | Screen 5 — Events | R1 Events screen | 5 | 5 | ✓ | ✓ |
| F20 | Screen 6 — Reports | R1 Reports & exports | 5 | 5 | ✓ | ✓ |
| F21 | Screen 7 — Upload | R1 Upload screen | 5 | 5 | ✓ | ✓ |
| F22 | Screen 8 — Alerts | R1 Alerts screen | 5 | 5 | ✓ | ✓ |
| F23 | Screen 9 — Settings | R1 Settings screen | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Unit & Integration Runner**: Vitest (`npm run test:unit`)
- **End-to-End Runner**: Playwright (`npx playwright test` or `npm run test:e2e`)
- **Directory Layout**:
  ```
  tests/
  ├── unit/                     # Automata, residual math, symbol discretization
  │   ├── automata-engine.test.ts
  │   ├── residual-math.test.ts
  │   └── discretization.test.ts
  ├── integration/              # Web worker, NOAA client, stores, fallbacks
  │   ├── noaa-client.test.ts
  │   ├── fallback-datasets.test.ts
  │   └── worker-rpc.test.ts
  └── e2e/                      # Playwright tests for all 10 screens & workflows
      ├── 01-navigation-shell.spec.ts
      ├── 02-overview-screen.spec.ts
      ├── 03-stations-map.spec.ts
      ├── 04-monitoring-charts.spec.ts
      ├── 05-pattern-library.spec.ts
      ├── 06-automata-lab.spec.ts
      ├── 07-events-inspection.spec.ts
      ├── 08-reports-export.spec.ts
      ├── 09-upload-validation.spec.ts
      ├── 10-alerts-config.spec.ts
      ├── 11-settings-preferences.spec.ts
      └── 12-offline-resilience.spec.ts
  ```

## Real-World Application Scenarios (Tier 4)
1. **Hurricane Sandy Surge Trace**: Load Sandy dataset at The Battery, verify +9.33 ft peak residual, verify automata flags Sustained Elevated Surge and triggers high alert, verify Screen 5 events list and Screen 10 tape trace.
2. **Offline Fallback Resilience**: Disconnect network or simulate offline mode, navigate across all 10 screens, verify bundled fallback data renders smoothly with zero broken states or unhandled rejections.
3. **Interactive Automata Lab Simulation**: Build sequence `Rise -> Hold -> Hold -> Fall -> Stabilize` in Sequence Simulator on Screen 10, verify pattern match `Elevated Tide Event` with high confidence, verify step-by-step playback highlights state nodes.
4. **Data Ingestion to Anomaly Detection Workflow**: Upload custom CSV on Screen 7, verify format checklist validation, preview chart, import into active station series, verify anomaly detection on Screen 5.
5. **Report Generation & Export**: Navigate to Screen 6, configure date range, trigger CSV and PDF exports, verify generated blobs and history log.

## Coverage Thresholds
- Tier 1: $\ge 115$ test cases (5 per feature across 23 features)
- Tier 2: $\ge 115$ boundary/corner cases
- Tier 3: $\ge 25$ cross-feature combinatorial interactions
- Tier 4: $\ge 12$ full end-to-end application scenarios
- **Total Minimum Test Cases**: $\ge 267$ tests
- **Output Artifact**: `TEST_READY.md` published at project root when test suite is ready.
