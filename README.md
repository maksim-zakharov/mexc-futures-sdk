# MEXC Futures SDK

A TypeScript SDK for MEXC Futures trading with REST API and WebSocket support.

⚠️ **DISCLAIMER**: This SDK uses browser session tokens and reverse-engineered endpoints. MEXC does not officially support futures trading through API. Use at your own risk.

## Features

- ✅ **REST API** - Complete trading functionality
- ✅ **WebSocket** - Real-time market data and account updates
- ✅ **TypeScript** - Full type definitions
- ✅ **Auto-reconnect** - Reliable WebSocket connections
- ✅ **Error handling** - Comprehensive error management

## Installation

```bash
npm install mexc-futures-sdk
```

## Quick Start

### REST API

```typescript
import { MexcFuturesClient } from "mexc-futures-sdk";

const client = new MexcFuturesClient({
  authToken: "WEB_YOUR_TOKEN_HERE", // Get from browser Developer Tools
});

// Get ticker data
const ticker = await client.getTicker("BTC_USDT");
console.log("BTC Price:", ticker.data.lastPrice);

// Place a market order
const order = await client.submitOrder({
  symbol: "BTC_USDT",
  price: 50000,
  vol: 0.001,
  side: 1, // 1=open long, 3=open short
  type: 5, // 5=market order
  openType: 1, // 1=isolated margin
  leverage: 10,
});
```

### WebSocket

```typescript
import { MexcFuturesWebSocket } from "mexc-futures-sdk";

const ws = new MexcFuturesWebSocket({
  apiKey: "YOUR_API_KEY",
  secretKey: "YOUR_SECRET_KEY",
  autoReconnect: true,
});

// Connect and login
ws.on("connected", () => {
  ws.login(false).then(() => {
    console.log("Login successful");
    ws.subscribeToAll(); // Subscribe to all private data
  });
});

// Handle trading events
ws.on("orderUpdate", (data) => {
  console.log("Order Update:", data.orderId, data.symbol, data.state);
});

ws.on("positionUpdate", (data) => {
  console.log("Position:", data.symbol, data.holdVol, data.pnl);
});

ws.on("assetUpdate", (data) => {
  console.log("Balance:", data.currency, data.availableBalance);
});

await ws.connect();
```

## Authentication

### REST API - Browser Session Token

1. Login to MEXC futures in your browser
2. Open Developer Tools (F12) → Network tab
3. Make any request to futures.mexc.com
4. Find the `authorization` header (starts with "WEB...")
5. Copy the token value

### WebSocket - API Keys

1. Go to MEXC API Management
2. Create API Key and Secret
3. Enable futures trading permissions

## WebSocket Events

### Private Data Events

| Event            | Description           | Data                                 |
| ---------------- | --------------------- | ------------------------------------ |
| `orderUpdate`    | Order status changes  | Order details, state, fills          |
| `orderDeal`      | Order executions      | Trade details, fees, profit          |
| `positionUpdate` | Position changes      | Size, PnL, margin, liquidation price |
| `assetUpdate`    | Balance changes       | Available, frozen, position margin   |
| `stopOrder`      | Stop-loss/take-profit | Stop prices for positions            |
| `liquidateRisk`  | Liquidation warnings  | Margin ratio, liquidation price      |

### Public Data Events (Optional)

| Event     | Description         | Data                                  |
| --------- | ------------------- | ------------------------------------- |
| `tickers` | All symbol prices   | Price, volume, change for all symbols |
| `ticker`  | Single symbol price | Real-time price updates               |
| `depth`   | Order book          | Bids and asks                         |
| `kline`   | Candlestick data    | OHLCV data                            |
| `deal`    | Recent trades       | Trade executions                      |

## WebSocket Subscription Options

### Option 1: All Private Data (Recommended)

```typescript
ws.on("login", () => {
  ws.subscribeToAll(); // Get all trading events
});
```

### Option 2: Filtered by Symbols

```typescript
ws.on("login", () => {
  ws.subscribeToMultiple([
    {
      filter: "order",
      rules: ["BTC_USDT", "ETH_USDT"], // Only these symbols
    },
    {
      filter: "position",
      rules: ["BTC_USDT", "ETH_USDT"],
    },
    {
      filter: "asset", // All balance updates
    },
  ]);
});
```

### Option 3: Public Market Data

```typescript
// Subscribe to market data
ws.subscribeToAllTickers(); // All symbol prices
ws.subscribeToTicker("BTC_USDT"); // Single symbol
ws.subscribeToDepth("BTC_USDT"); // Order book
ws.subscribeToKline("BTC_USDT", "Min1"); // 1-minute candles
```

## Order Types and Parameters

### Order Sides

- `1` = Open long position
- `2` = Close short position
- `3` = Open short position
- `4` = Close long position

### Order Types

- `1` = Limit order
- `5` = Market order
- `3` = IOC (Immediate or Cancel)
- `4` = FOK (Fill or Kill)

### Order States (WebSocket)

- `1` = New
- `2` = Pending
- `3` = Filled
- `4` = Cancelled

### Example Orders

```typescript
// Market order
await client.submitOrder({
  symbol: "BTC_USDT",
  price: 50000, // Required even for market orders
  vol: 0.001,
  side: 1, // Open long
  type: 5, // Market
  openType: 1, // Isolated margin
  leverage: 10,
});

// Limit order with stop-loss
await client.submitOrder({
  symbol: "BTC_USDT",
  price: 49000,
  vol: 0.001,
  side: 1, // Open long
  type: 1, // Limit
  openType: 1, // Isolated margin
  leverage: 10,
  stopLossPrice: 45000,
  takeProfitPrice: 55000,
});

// Close position
await client.submitOrder({
  symbol: "BTC_USDT",
  price: 51000,
  vol: 0.001,
  side: 4, // Close long
  type: 5, // Market
  openType: 1,
  positionId: 12345, // Position to close
});
```

## Error Handling

```typescript
try {
  const order = await client.submitOrder({...});
  console.log("Order placed:", order.data);
} catch (error) {
  console.error("Order failed:", error.message);
}

// WebSocket errors
ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

ws.on("disconnected", ({ code, reason }) => {
  console.log("Disconnected:", code, reason);
});
```

## Complete Example

See `examples/websocket.ts` for a complete working example with:

- Connection management
- Event handlers for all data types
- Error handling
- Graceful shutdown

```bash
# Run the example
npm install
ts-node examples/websocket.ts
```

## API Reference

### REST Methods

- `getTicker(symbol)` - Get ticker data
- `getContractDetail(symbol?)` - Get contract info
- `getContractDepth(symbol, limit?)` - Get order book
- `submitOrder(params)` - Place order
- `cancelOrder(orderIds)` - Cancel orders
- `getOrderHistory(params)` - Get order history
- `getPositionHistory(params)` - Get position history
- `getAssets()` - Get account balance

### WebSocket Methods

- `connect()` - Connect to WebSocket
- `login(subscribe?)` - Login and optionally auto-subscribe
- `subscribeToAll()` - Subscribe to all private data
- `subscribeToMultiple(filters)` - Subscribe with filters
- `subscribeToTicker(symbol)` - Market data subscriptions
- `disconnect()` - Close connection

## Support

This is an unofficial SDK. Use at your own risk. For issues and feature requests, please open a GitHub issue.

## License

MIT
