# Session State - Beta Metronome

**Date:** 2026-06-14  
**Project:** Tastytrade Portfolio Monitoring & QQQ Put Hedging Dashboard

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
Funding Size = Σ[stock_qty × stock_price] + Σ[deep_itm_call_qty × 100 × delta]
```

Where:
- **Deep ITM Call threshold:** strike_price < stock_price × 0.9
- **Delta for Deep ITM Calls:** 0.95 (approximate)

---

## Execution Results (as of 2026-06-14)

**Running the application:**
```bash
cd ~/workspace/pi_workspace/beta_metronome
npm run start:all
# or individually:
npm run dev:server      # Backend on port 3001
npm run dev             # Frontend on port 5173
```

**Test results for account 5WX57665:**

| Component | Calculation | Value |
|-----------|-------------|-------|
| GOOGL | 65 × $359.68 | $23,379.20 |
| AAPL | 122 × $291.13 | $35,517.86 |
| **Stock Total** | | **$58,897.06** |
| QQQ   260618C00610000 | 8 × 100 × 0.95 | $760.00 |
| **Total Funding Size** | | **$59,657.06** |

**Verification:**
- QQQ price from strike: $743.00
- Deep ITM threshold: $743 × 0.9 = $668.70
- QQQ   260618C00610000 strike: $610 < $668.70 → IS Deep ITM ✓
- Other QQQ options have strikes > $668.70 → NOT Deep ITM ✓

---

## Architecture

```
beta_metronome/
├── src/
│   ├── client.ts         # Tastytrade API client with OAuth
│   ├── positions.ts      # Position retrieval (getPositionsList)
│   ├── funding.ts        # Funding size calculation logic
│   ├── hedge.ts          # QQQ Put hedge ratio recommendations
│   ├── server.ts         # Express backend (port 3001)
│   └── index.ts          # CLI entry point
├── frontend/
│   └── src/
│       ├── App.tsx       # Main React dashboard
│       ├── main.tsx
│       └── index.css     # Tailwind CSS
├── token.info            # API credentials (gitignored)
├── package.json
└── tsconfig.json
```

---

## Key Files

### src/server.ts
- `GET /api/accounts` - List all accounts with metadata
- `GET /api/accounts/:accountNumber/details` - Full account details with positions, funding, hedge recommendations
- Calculates `stockValue` using `close-price` from positions
- Calculates `deepITMCallValue` using strike-based threshold

### src/funding.ts
- `isDeepITMCall(option, stockPrice)` - Check if option is Deep ITM Call
- `calculateDeepITMCallValue(option, _stockPrice)` - qty × 100 × 0.95
- `getLiveStockPrices(client, positions)` - Extract stock prices from positions
- `getQQQPriceFromPositions(positions)` - Extract QQQ price from option strikes

### src/client.ts
- `createTastytradeClient()` - Initialize Tastytrade OAuth client
- `getCustomerAccounts()` - Fetch all customer accounts
- `getQuote()` - Placeholder (Tastytrade API v7 doesn't have direct quote endpoint)

---

## Current Status

**Backend:**
- ✅ Tastytrade client initialization with OAuth
- ✅ Account listing endpoint
- ✅ Position retrieval via `getPositionsList`
- ✅ Funding size calculation using `close-price` from positions
- ✅ Deep ITM Call detection with 10% OTM threshold
- ✅ Express server running on port 3001

**Frontend:**
- ✅ React dashboard with Tailwind CSS
- ✅ Account selector dropdown
- ✅ Account summary display with funding size
- ✅ Positions table with delta
- ✅ Hedge recommendations section
- ✅ Auto-refresh QQQ price every 5 seconds

**Issues Fixed:**
- Fixed `marketMakerQuotesService` not found error
- Fixed missing `getClient()` function
- Fixed duplicate variable declarations
- Fixed `stockValue` calculation to use `close-price` from positions directly
- Zombie process issue causing stale code to run

---

## Running the Application

```bash
# Development (server + frontend)
npm run start:all

# Individual servers
npm run dev:server      # Backend on port 3001
npm run dev             # Frontend on port 5173

# Build
npm run build
npm start               # Production server
```

**Ports:**
- Backend: 3001
- Frontend: 5173

---

## Next Steps

1. Deploy and validate end-to-end
2. Add unit tests if needed
3. Update `FUNDING_SIZE_CALCULATION.md` with verified calculations
