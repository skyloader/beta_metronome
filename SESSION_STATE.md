# Session State - Beta Metronome

**Date:** 2026-06-14  
**Git Commit:** 321f650  
**Branch:** master

---

## Project Overview

Build a dashboard to:
1. Calculate real-time funding size (stock positions + Deep ITM Call options)
2. Recommend QQQ Put option count for hedging
3. Support multiple Tastytrade accounts via dropdown selector
4. Display live QQQ price and hedge recommendations

**Target Account:** 5WX57665 (with dropdown for account selection)

**Funding Size Formula:**
```
Funding Size = Σ[stock_qty × stock_price] + Σ[deep_itm_call_qty × 100 × delta × stock_price]
```

Where:
- **Deep ITM Call threshold:** strike_price < stock_price × 0.9
- **Delta for Deep ITM Calls:** 0.95 (approximate)

---

## Git Repository Setup

**Repository:** `~/workspace/pi_workspace/beta_metronome`

**Git Commands:**
```bash
cd ~/workspace/pi_workspace/beta_metronome
git status
git log --oneline -3
git diff HEAD~1 HEAD
```

---

## Recent Changes (Current Session)

### 1. Deep ITM Call Calculation Fix
- **Issue:** Deep ITM Call value was missing QQQ stock price multiplication
- **Fix:** Updated `calculateDeepITMCallValue()` to use `quantity × 100 × 0.95 × stockPrice`
- **Result:** Deep ITM Call now correctly calculates as 8 × 100 × 0.95 × $743 = $564,680

### 2. API Enhancement
- Added `calculationDetails` to `/api/accounts/:accountNumber/details` response
- Includes:
  - `stockPositions`: Array with symbol, quantity, closePrice, value
  - `deepITMCalls`: Array with symbol, strike, quantity, delta, value
  - `qqqPrice`: Current QQQ price from option strike
  - `deepITMThreshold`: Calculated threshold (QQQ × 0.9)

### 3. UI Update
- Added "Calculation Details" section in frontend
- Shows individual stock calculations
- Shows Deep ITM call calculations with strike/threshold comparison
- Updated description to include QQQ price

---

## Key Files Modified (Current Session)

| File | Change |
|------|--------|
| `src/funding.ts` | Fixed `calculateDeepITMCallValue()` to multiply by `stockPrice` |
| `src/server.ts` | Added `calculationDetails` to API response with QQQ price in description |
| `frontend/src/App.tsx` | Added `calculationDetails` state and UI component |
| `SESSION_STATE.md` | Updated with new calculations |
| `FUNDING_SIZE_CALCULATION.md` | Updated with correct formula |

---

## Running the Application

```bash
# Development (server + frontend)
npm run start:all

# Or individually
npm run dev:server      # Backend on port 3001
npm run dev             # Frontend on port 5173
```

---

## Verification

For account 5WX57665:
- **Stock Positions:** 2 (GOOGL, AAPL) → $58,897.06
- **Deep ITM Calls:** 1 (QQQ 260618C00610000) → $564,680.00
- **Total Funding Size:** $623,577.06

**API Response:**
```
description: "Stock positions + Deep ITM Call options (quantity × stock price + deep ITM calls × 100 × delta × QQQ price ($743.00))"
```

---

## Git Commands for Next Session

```bash
cd ~/workspace/pi_workspace/beta_metronome

# Check current state
git status
git log --oneline -5

# View recent changes
git diff HEAD~1 HEAD

# Start development servers
npm run start:all
```
