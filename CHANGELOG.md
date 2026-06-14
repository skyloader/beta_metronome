# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-06-14

### Added
- **Funding Size Calculation UI**: Detailed calculation breakdown displayed in the web UI showing:
  - Stock positions with individual calculations (quantity × price)
  - Deep ITM call options with strike prices and delta
  - QQQ price and Deep ITM threshold
  - Subtotals and total funding size

- **API Enhancement**: `/api/accounts/:accountNumber/details` now returns:
  - `calculationDetails` object with:
    - `stockPositions`: Array of stock positions with symbol, quantity, closePrice, and calculated value
    - `deepITMCalls`: Array of Deep ITM calls with symbol, strike, quantity, delta, and value
    - `qqqPrice`: Current QQQ price (from option strike)
    - `deepITMThreshold`: Calculated threshold (QQQ price × 0.9)

### Fixed
- **Missing `getClient()` function**: Added `getClient()` helper function to server.ts
- **Zombie process issue**: Fixed by properly killing Node processes and restarting fresh
- **Stock value calculation**: Changed to use `close-price` directly from positions instead of external price API

### Changed
- **funding.ts**: Simplified `calculateFundingSize` to calculate directly from positions
- **server.ts**: Updated to include detailed calculation breakdown in API response
- **App.tsx**: Added `calculationDetails` state and UI component to display calculation process

### Verification
For account 5WX57665:
- Stock positions: 2 (GOOGL, AAPL)
- Deep ITM calls: 1 (QQQ   260618C00610000 with strike $610)
- QQQ price: $743.00
- Deep ITM threshold: $668.70
- Total funding size: $59,657.06
  - Stock value: $58,897.06
  - Deep ITM calls: $760.00
