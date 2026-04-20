# 🏁 Pit Wall Pro — Full Upgrade Plan
### Powered by FastF1 + Ergast | Next.js 15 + Python FastAPI

---

> [!IMPORTANT]
> This plan uses all 15 FastF1 notebook analyses to upgrade the website into a professional, fully functional F1 analytics platform. Every page will be backed by **real data** from the Python backend — no more mock/random values.

---

## 📊 Notebook → Feature Mapping

| Notebook | Analysis Type | Target Page/Component |
|---|---|---|
| `plot_annotate_corners` | Track layout with annotated corners (braking, DRS, gear) | `/analysis` → Track Map tab |
| `plot_annotate_speed_trace` | Speed trace with corner annotations | `/analysis` → Speed Trace tab |
| `plot_driver_laptimes` | All driver lap times scatter over race | `/analysis` → Lap Times tab |
| `plot_driver_styling` | FastF1 team/driver color styling system | Global CSS + all charts |
| `plot_gear_shifts_on_track` | Gear shift visualization on track map | `/analysis` → Track Map tab (gear overlay) |
| `plot_laptimes_distribution` | Violin/box plot of lap time distributions | `/analytics` → Distribution section |
| `plot_position_changes` | Position changes per lap (race) | `/analytics` → Race History section |
| `plot_qualifying_results` | Q1/Q2/Q3 lap times comparison | NEW: `/qualifying` page |
| `plot_results_tracker` | Driver result heatmap across season | NEW: `/history` page upgrade |
| `plot_season_summary` | Podiums + race wins season summary | Dashboard upgrade |
| `plot_speed_on_track` | Speed colormap plotted on track layout | `/analysis` → Track Map tab |
| `plot_speed_traces` | Multi-driver speed trace comparison | `/analysis` → Speed Trace tab |
| `plot_strategy` | Pit stop strategy visualization (actual data) | `/strategy` page upgrade |
| `plot_team_pace_ranking` | Team pace ranking box plot | `/analytics` → Team Pace section |
| `plot_who_can_still_win_wdc` | Championship mathematical possibilities | NEW: `/championship` page |

---

## 🗂️ Phase 1 — Backend Expansion (Python FastAPI)

**File: `python-backend/main.py`**

Add **10 new FastF1-powered endpoints** that directly mirror the notebook analyses:

| New Endpoint | Data Returned | From Notebook |
|---|---|---|
| `GET /laps` | All lap times for all drivers in a session | `plot_driver_laptimes` |
| `GET /position-changes` | Per-lap position data for all drivers | `plot_position_changes` |
| `GET /qualifying` | Q1/Q2/Q3 lap times per driver | `plot_qualifying_results` |
| `GET /track-map` | X/Y coordinates + speed + gear per telemetry point | `plot_speed_on_track`, `plot_gear_shifts_on_track`, `plot_annotate_corners` |
| `GET /strategy-actual` | Actual pit stop data + compound history | `plot_strategy` |
| `GET /lap-distribution` | Lap time distribution per driver/compound | `plot_laptimes_distribution` |
| `GET /team-pace` | Median lap time per team for pace ranking | `plot_team_pace_ranking` |
| `GET /season-results` | Results tracker: per-round finish positions | `plot_results_tracker` |
| `GET /season-summary` | Season wins, podiums, DNFs per driver | `plot_season_summary` |
| `GET /wdc-scenarios` | Championship math: points gap, max available | `plot_who_can_still_win_wdc` |

---

## 🗂️ Phase 2 — Global Improvements

### 2.1 Driver Color System (`src/lib/driver-colors.ts`)
- Extract the exact color map from `plot_driver_styling.ipynb` (FastF1's official team+driver colors)
- Replace all current hardcoded `getTeamColor()` with a proper `getDriverColor(driverCode)` and `getTeamColorFastF1(teamName)` function
- Apply globally across all charts and cards

### 2.2 Enhanced `useFastF1` Hook (`src/hooks/useFastF1.ts`)
- Add new hook methods for all 10 new endpoints
- Add proper loading state per request (not global)
- Add retry logic with exponential backoff
- Add response caching (30s TTL for hot data, 5min for session data)

### 2.3 Session Selector Component (`src/components/ui/SessionSelector.tsx`)
- Reusable year/event/session type picker
- Powered by Ergast schedule API for dropdown (real circuit list, not manual text input)
- Appears on: Analysis, Strategy, Qualifying, History pages

---

## 🗂️ Phase 3 — Page-by-Page Upgrades

### 3.1 `/analysis` — TELEMETRY_LAB (Major Upgrade)
**Current:** Basic speed/RPM charts with hardcoded Bahrain default  
**Upgraded to 5 tabbed views:**

| Tab | Visualization | Data Source |
|---|---|---|
| **SPEED TRACE** | Multi-driver annotated speed trace (with braking zones, DRS, corners) | `/telemetry` + `/comparison` |
| **TRACK MAP** | SVG track rendered from X/Y coordinates, colored by speed or gear | `/track-map` |
| **LAP TIMES** | Scatter plot of all laps — filtered by compound (with FastF1 compound colors) | `/laps` |
| **PEDALS** | Throttle/brake/gear overlay for selected driver's fastest lap | `/telemetry` |
| **COMPARISON** | Side-by-side speed traces of 2 drivers with delta chart below | `/comparison` |

**Additional upgrades:**
- Real session selector (dropdown, not text input)  
- Driver selector updates dynamically from session results  
- All charts use FastF1 official team colors  

---

### 3.2 `/analytics` — DRIVER ANALYTICS (Major Upgrade)
**Current:** Simple bar + radar chart with seeded/fake metrics  
**Upgraded to 3 sections:**

| Section | Visualization | Data Source |
|---|---|---|
| **POSITION CHANGES** | Animated line chart — position per lap per driver (race) | `/position-changes` |
| **LAP TIME DISTRIBUTION** | Violin/box plot — lap time spread per driver, colored by compound | `/lap-distribution` |
| **TEAM PACE RANKING** | Horizontal box plot — teams ranked by median pace (like FastF1 example) | `/team-pace` |

**Additional upgrades:**
- Remove all mock/seeded data entirely  
- Session-specific: user picks any race to analyze  
- Driver cards show real PTS/wins from Ergast (already exists, keep)  

---

### 3.3 `/strategy` — RACE STRATEGY SIMULATOR (Upgrade)
**Current:** Pure simulation with manual lap inputs  
**Upgraded:**
- Add **"Load Actual Strategy"** button — pulls real pit stop data from `/strategy-actual`
- Renders actual race stints as horizontal Gantt-style bars (like `plot_strategy`)
- Overlay the simulation curve on top of actual data for comparison
- Tire compound colors match FastF1 official colors

---

### 3.4 NEW `/qualifying` — QUALIFYING BREAKDOWN (New Page)
**Based on:** `plot_qualifying_results.ipynb`  
**Features:**
- Q1/Q2/Q3 horizontal bar chart per driver
- Color coded by team (FastF1 colors)
- Gap-to-pole visualization
- Driver eliminated in each segment clearly marked
- Session picker

---

### 3.5 NEW `/championship` — WDC SCENARIOS (New Page)
**Based on:** `plot_who_can_still_win_wdc.ipynb`  
**Features:**
- Championship standings with max possible points chart
- "Can still win" bar visualization
- Animated bar chart showing gap to leader
- Updates from `/wdc-scenarios` endpoint

---

### 3.6 `/history` — SEASON RESULTS TRACKER (Major Upgrade)
**Current:** Basic race cards  
**Upgraded:**
- Full season heatmap grid: drivers × rounds (like `plot_results_tracker`)
- Color cells by finish position (P1=gold, P2=silver, P3=bronze, DNF=red)
- Click a cell → shows race podium details
- Season summary cards: wins, podiums, fastest laps, DNFs per driver

---

### 3.7 Dashboard `/` — SEASON SUMMARY UPGRADE
**Based on:** `plot_season_summary.ipynb`  
**Upgrades:**
- `SeasonAnalyticsPreview` replaces fake chart with real **wins + podiums bar chart per driver**
- `PitWallStats` shows actual 2026 season stats from Ergast
- Add WDC leader card with championship progress bar

---

## 🗂️ Phase 4 — Navigation & UX

### 4.1 Navbar — Add New Pages
Add links to:  
- `/qualifying` — "QUALIFYING"  
- `/championship` — "WDC SCENARIOS"  

### 4.2 QuickLinks Dashboard Widget
Update with new pages.

### 4.3 Global Session Context (`src/store/sessionStore.ts`)
- Zustand store: `selectedYear`, `selectedEvent`, `selectedSession`
- Shared across Analysis, Qualifying, Strategy pages (no re-entering same info)

---

## 🗂️ Phase 5 — Visual Polish

| Item | Change |
|---|---|
| Chart tooltips | Dark glass tooltip with team color accent border |
| Loading states | FastF1-specific loading message ("FETCHING TELEMETRY FROM FASTF1 CACHE…") |
| Error states | Styled error panel with retry button |
| Track Map SVG | Smooth path rendering from X/Y coords, animated draw-on effect |
| Compound badges | Official circle badges: S=red, M=yellow, H=white, I=green, W=blue |
| Animated charts | Recharts with stroke-dashoffset animation on initial load |

---

## 📁 File Change Summary

### New Files
```
python-backend/main.py                        (ADD 10 endpoints)
src/lib/driver-colors.ts                      (NEW — FastF1 color system)
src/store/sessionStore.ts                     (NEW — shared session context)
src/hooks/useFastF1.ts                        (UPGRADE — 10 new methods)
src/components/ui/SessionSelector.tsx         (NEW — reusable selector)
src/components/ui/CompoundBadge.tsx           (NEW — tire compound badge)
src/components/ui/TrackMap.tsx                (NEW — SVG track renderer)
src/app/qualifying/page.tsx                   (NEW PAGE)
src/app/championship/page.tsx                 (NEW PAGE)
```

### Modified Files
```
src/app/analysis/page.tsx                     (5-tab upgrade)
src/app/analytics/page.tsx                    (3 real-data sections)
src/app/strategy/page.tsx                     (actual data overlay)
src/app/history/page.tsx                      (heatmap upgrade)
src/app/page.tsx                              (season summary upgrade)
src/components/dashboard/SeasonAnalyticsPreview.tsx  (real data)
src/components/dashboard/QuickLinks.tsx       (add new pages)
src/components/layout/Navbar.tsx              (add new nav items)
```

---

## ⚡ Execution Order

```
Phase 1 → Backend (main.py) — all 10 new endpoints
Phase 2 → driver-colors.ts + sessionStore.ts + useFastF1.ts upgrade
Phase 3 → UI components (SessionSelector, CompoundBadge, TrackMap)
Phase 4 → Page upgrades (analysis → analytics → strategy → history → dashboard)
Phase 5 → New pages (qualifying → championship)
Phase 6 → Navbar + QuickLinks updates
Phase 7 → Final visual polish
```

---

> [!NOTE]
> All chart libraries already installed (recharts). The track map SVG will be rendered purely from FastF1 telemetry X/Y coordinates — no external map tiles needed. The backend Python server must be running at `localhost:8000` for FastF1 data.

> [!WARNING]
> FastF1 data loads can take 10-30 seconds for first fetch (building cache). The UI will handle this gracefully with a skeleton loading state and progress message.
