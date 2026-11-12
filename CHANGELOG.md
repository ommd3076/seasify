# Changelog

All notable changes to the **Seasify** coastal water-level monitoring and automata pattern recognition platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-12

### Added
- **Automata Pattern Engine**:
  - Continuous-to-discrete 9-symbol alphabet encoder $\Sigma = \{ L:F, L:S, L:R, N:F, N:S, N:R, H:F, H:S, H:R, \text{GAP} \}$.
  - Thompson NFA construction with $\varepsilon$-transitions from regular expressions.
  - Subset construction determinization algorithm converting NFAs to DFAs.
  - Hopcroft-style partition refinement for DFA state minimization preserving event labels.
  - Step-by-step interactive automata simulator with state trace auditing and acceptance testing.
- **Real-Time NOAA CO-OPS Integration**:
  - Live 6-minute water level observations and harmonic predictions fetched from NOAA REST APIs.
  - Offline fallback system with bundled historical benchmark datasets (Hurricane Sandy, Grayson Bomb Cyclone, Key West blowout).
- **Interactive Map & Coastal Stations**:
  - Carto Voyager basemap with custom squircle station pins and status indicators.
  - Searchable 24-station explorer with regional filtering, pagination, and synchronized detail view.
- **Monitoring & Telemetry**:
  - High-resolution Recharts time-series chart comparing observed levels against predictions.
  - Interactive station selector popover with instant telemetry reloading.
  - Interactive Change Rate card with 1h / 6h / 24h horizon toggles and dynamic wave sparklines.
- **Events & Anomaly Hydrographs**:
  - Dynamic 6-hour event hydrograph recalculating time-series data and Y-axis domains on event selection.
  - Dynamic gradient and badge styling: mint theme for surge/rise anomalies, lavender theme for drop/oscillation anomalies.
  - 3-stage progression cards (Before, During Peak, After) with live timestamp and unit conversions.
- **Patterns & Analytics Hub**:
  - 12-column Active Detections & Automata Pipeline command hub with live state stream tracking.
  - Live KPI ribbon (In-flight automata, detection velocity, mean confidence, DFA latency).
  - 12-hour detection volume histogram with interactive hover cards and archetype breakdowns.
  - Pattern Coverage gauge with live trigonometry arc calculation and 7D / 30D / 90D horizon toggles.
- **Alerts & Quiet Hours**:
  - Local rule manager with toggles, thresholds, and multi-channel notifications.
  - Stateful Quiet Hours scheduler with From / To popover time pickers and timezone selector.
- **Settings & Units**:
  - Global metric (meters) vs. imperial (feet) unit conversion system with store synchronization ($1\text{ m} = 3.28084\text{ ft}$).
  - Informational popovers on acoustic sensor precision and tidal datums (MLLW, MHHW).
  - Educational research and scientific limitation disclaimer.

### Changed
- Refined typography and card geometry to rounded-28px design system with mint (`#A5F5A6`) and lavender (`#C5A8F8`) accents.
- Replaced static version badge with permanent live NOAA CO-OPS indicator.
- Fully consolidated branding to **Seasify**.

---
*Maintained by the Seasify Core Engineering Team.*
