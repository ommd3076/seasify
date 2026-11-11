# Seasify — Data Pipeline & Scientific Processing

---

## 1. NOAA CO-OPS Telemetry Integration

Seasify interfaces directly with the National Oceanic and Atmospheric Administration (NOAA) Center for Operational Oceanographic Products and Services (CO-OPS).

### 1.1 Official API Endpoints
- **Data API:** `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter`
- **Metadata API:** `https://api.tidesandcurrents.noaa.gov/mdapi/prod/`
- **Application Identifier:** `application=Seasify`

### 1.2 Observation Query Parameters
```http
GET /api/prod/datagetter?
  product=water_level&
  station=8518750&
  begin_date=20241111 00:00&
  end_date=20241112 00:00&
  datum=MLLW&
  time_zone=gmt&
  units=metric&
  format=json&
  application=Seasify
```

### 1.3 Astronomical Tide Predictions
Continuous 6-minute harmonic tide predictions are retrieved concurrently:
```http
GET /api/prod/datagetter?
  product=predictions&
  station=8518750&
  begin_date=20241111 00:00&
  end_date=20241112 00:00&
  datum=MLLW&
  time_zone=gmt&
  units=metric&
  interval=6&
  format=json&
  application=Seasify
```

---

## 2. Temporal Alignment & Residual Math

### 2.1 Synchronization
Raw observation packets and prediction values are aligned by exact UTC timestamp. Timestamps are formatted as ISO 8601 strings (`YYYY-MM-DDTHH:mm:ss.sssZ`).

### 2.2 Non-Tidal Residual Calculation
For each aligned observation at time $t$:
\[
r(t) = H_{\text{observed}}(t) - H_{\text{predicted}}(t) \quad [\text{meters}]
\]
- **$r(t) > 0$:** Water level is higher than predicted (e.g. storm surge, onshore wind setup, freshwater riverine discharge).
- **$r(t) < 0$:** Water level is lower than predicted (e.g. offshore gale blowout, strong anticyclonic high pressure).
- **$r(t) \approx 0$:** Astronomical tide matches physical water level.

### 2.3 Rate-of-Change Velocity
Velocity of non-tidal residual change is computed using true elapsed time $\Delta t$ between consecutive valid samples:
\[
v_r(t) = \frac{r(t) - r(t - \Delta t)}{\Delta t} \quad [\text{meters per hour}]
\]
Where $\Delta t = \frac{T_t - T_{t - \Delta t}}{3600000}$ hours.

### 2.4 Data Gaps & Quality Control
- If $\Delta t > 30\text{ minutes}$, the software strictly avoids linear or spline interpolation across the void.
- The reading is tagged with quality flag `'missing'`.
- The rate of change $v_r(t)$ is marked as `null`.
- The finite automata engine emits the formal `GAP` symbol and suspends state progression.

### 2.5 Windowed Rolling Statistics & Z-Scores
A sliding window of 20 samples ($\approx 2$ hours of 6-minute data) calculates local statistics:
\[
\mu_r(t) = \frac{1}{K}\sum_{i=0}^{K-1} r(t - i)
\]
\[
\sigma_r(t) = \sqrt{\frac{1}{K}\sum_{i=0}^{K-1} (r(t - i) - \mu_r(t))^2}
\]
\[
z(t) = \frac{r(t) - \mu_r(t)}{\sigma_r(t)}
\]
Z-scores indicate anomalous standard deviations relative to the immediate ambient window.

---

## 3. Offline Fallback & Historical Extreme Datasets

To ensure reliable classroom demonstrations, automated testing, and resilient operation during NOAA network maintenance, Seasify embeds 10 real seed stations and 6 benchmark storm events:

1. **Hurricane Sandy Extreme Surge (2012) — The Battery, NY (`8518750`)**  
   Peak non-tidal surge: $+2.86$ m coincident with spring high tide.
2. **Bomb Cyclone Grayson Flash Surge (2018) — Boston Harbor, MA (`8443970`)**  
   Surge velocity exceeding $+0.48$ m/hr.
3. **Offshore Gale Blowout Event (2023) — Key West, FL (`8724580`)**  
   Negative non-tidal residual reaching $-0.44$ m.
4. **Annapolis King Tide Nuisance Flooding (2023) — Annapolis, MD (`8575512`)**  
   Persistent sunny-day tidal elevation $+0.42$ m.
5. **San Francisco Bay Harmonic Seiche (2023) — San Francisco, CA (`9414290`)**  
   Resonant 45-minute harmonic standing wave oscillation.
6. **Cook Inlet Telemetry Dropout (2024) — Anchorage, AK (`9455920`)**  
   3.5-hour communication gap demonstrating automata suspension and recovery.

---

## 4. User CSV Dataset Ingestion

The **Upload** screen supports user observation files up to 20 MB:
- Format: RFC 4180 CSV
- Required Columns: `timestamp`, `water_level` (or `observed`, `predicted`)
- Units & Datum: User declares units (Meters vs. Feet) and datum (MLLW, MSL, NAVD88) before processing
- Automated Validation Checklist: Validates header schema, numeric ranges, timestamp continuity, and missing values before feeding observations into the automata engine.
