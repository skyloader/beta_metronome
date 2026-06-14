# Funding Size Calculation Breakdown

## Formula

```
Funding Size = Σ[stock_qty × stock_price] + Σ[deep_itm_call_qty × 100 × delta × stock_price]
```

Where:
- **Deep ITM Call threshold**: strike_price < stock_price × 0.9
- **Delta for Deep ITM Calls**: 0.95 (approximate)
- **stock_price**: QQQ current price (e.g., $743.00)

## Tastytrade Symbol Format

```
"QQQ   260618C00743000"
│     │       └──┬───┘
│     │         └─ Strike price (divide by 1000) → $743.00
│     └─────────── Expiration date (YYMMDD) → June 18, 2026
└───────────────── Underlying symbol
```

## Live Calculation Example

### Account: 5WX57665

**Live Prices:**
- QQQ: $743.00 (from option strike)
- GOOGL: $359.68
- AAPL: $291.13

---

### 1. Stock Positions

| Symbol | Quantity | Price | Value |
|--------|----------|-------|-------|
| GOOGL | 65 | $359.68 | $23,379.20 |
| AAPL | 122 | $291.13 | $35,517.86 |

**Subtotal (Stocks): $58,897.06**

---

### 2. Deep ITM Call Options

**Threshold:** strike < $743.00 × 0.9 = **$668.70**

| Symbol | Strike | Deep ITM? | Value Calculation |
|--------|--------|-----------|-------------------|
| QQQ 260618C00610000 | $610.00 | ✅ YES ($610 < $668.70) | 8 × 100 × 0.95 × $743.00 = $564,680.00 |

**Deep ITM Calculation:**
```
QQQ   260618C00610000
Quantity: 8 contracts
Strike: $610.00
Stock Price (QQQ): $743.00
Delta: 0.95 (Deep ITM)
Threshold: $743.00 × 0.9 = $668.70

Calculation: quantity × 100 × delta × stock_price
= 8 × 100 × 0.95 × $743.00
= $564,680.00
```

**Subtotal (Deep ITM Calls): $564,680.00**

---

### Total Funding Size

| Component | Amount |
|-----------|--------|
| Stock Positions | $58,897.06 |
| Deep ITM Call Options | $564,680.00 |
| **TOTAL** | **$623,577.06** |

---

## How to Verify

1. **Check stock positions**: Verify quantity × close_price matches
2. **Check option symbols**: Parse strike from Tastytrade format
3. **Deep ITM check**: Verify strike < stock_price × 0.9
4. **Delta application**: Confirm delta = 0.95 for Deep ITM calls
5. **Stock price**: Use QQQ price from option strike ($743)

**Formula:** `quantity × 100 × delta × stock_price`
