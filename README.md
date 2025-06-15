# MEXC Futures SDK

⚠️ **IMPORTANT DISCLAIMER** ⚠️

**MEXC does not officially support futures trading through API.** This SDK uses browser session tokens and reverse-engineered endpoints. Use at your own risk.

**TRADING DISCLAIMER:** This software is provided "as is" without warranty of any kind. The authors are not responsible for any financial losses. Only trade with money you can afford to lose. Understand the risks before using this software. Cryptocurrency futures trading is highly risky and can result in significant losses.

---

## 🚀 Key Features

**This SDK provides unique advantages over standard API approaches:**

- ✅ **Bypass Maintenance Mode** - Works when official API is down for maintenance
- ✅ **Full Trading Access** - Complete access to all futures trading functions
- ✅ **Real-time WebSocket** - Live market data and account updates
- ✅ **TypeScript Support** - Full type definitions for better development experience

**Perfect for automated trading systems that need 24/7 reliability!**

---

SDK for MEXC Futures trading using web-based authentication (browser session tokens).

## Official Documentation

For official MEXC API documentation, visit: https://mexcdevelop.github.io/apidocs/contract_v1_en/

## Installation

```bash
npm install
npm run build
```

## Setup

### Browser Session Authentication

1. Login to your MEXC account via browser
2. Open Developer Tools (F12)
3. Go to Network tab
4. Make any request to futures.mexc.com
5. Find the `authorization` header in the request (starts with "WEB...")
6. Copy the token value

### Signature Algorithm

The SDK uses MEXC's custom MD5-based signature algorithm:

```javascript
function mexcCrypto(key, obj) {
  let timestamp = String(Date.now());
  let g = md5(key + timestamp).substring(7);
  let s = JSON.stringify(obj);
  let signature = md5(timestamp + s + g);

  return {
    "x-mxc-nonce": timestamp,
    "x-mxc-sign": signature,
  };
}
```

## Usage

```typescript
import { MexcFuturesSDK } from "mexc-futures-sdk";

const sdk = new MexcFuturesSDK({
  authToken: "WEB_YOUR_TOKEN_HERE", // Browser session token
  timeout: 15000, // Optional: request timeout in milliseconds (default: 30000)
  userAgent: "Mozilla/5.0...", // Optional: custom user agent
});
```

## API Methods

### Public Endpoints (No Authentication Required)

#### `getTicker(symbol: string)`

Get ticker data for a specific symbol.

```typescript
const ticker = await sdk.getTicker("BTC_USDT");
console.log("Price:", ticker.data.lastPrice);
console.log("24h Change:", `${(ticker.data.riseFallRate * 100).toFixed(2)}%`);
console.log("Funding Rate:", ticker.data.fundingRate);
```

#### `getContractDetail(symbol?: string)`

Get contract information. If symbol is provided, returns specific contract; otherwise returns all contracts.

```typescript
// Get specific contract
const btcContract = await sdk.getContractDetail("BTC_USDT");
const contract = Array.isArray(btcContract.data)
  ? btcContract.data[0]
  : btcContract.data;
console.log("Max Leverage:", contract.maxLeverage + "x");
console.log("Taker Fee:", (contract.takerFeeRate * 100).toFixed(4) + "%");

// Get all contracts
const allContracts = await sdk.getContractDetail();
```

#### `getContractDepth(symbol: string, limit?: number)`

Get contract's depth information (order book) with bids and asks.

```typescript
const depth = await sdk.getContractDepth("BTC_USDT", 10);

// Access order book data
const asks = depth.asks || depth.data?.asks || [];
const bids = depth.bids || depth.data?.bids || [];

console.log("Best Ask:", asks[0]?.[0], "Price:", asks[0]?.[1], "Volume");
console.log("Best Bid:", bids[0]?.[0], "Price:", bids[0]?.[1], "Volume");
console.log("Spread:", asks[0]?.[0] - bids[0]?.[0]);

// Each entry format: [price, volume, orderCount?]
asks.slice(0, 5).forEach(([price, volume, orders]) => {
  console.log(
    `Ask: ${price} USDT, Volume: ${volume}, Orders: ${orders || "N/A"}`
  );
});
```

#### `testConnection()`

Test API connection using public endpoint.

```typescript
const isConnected = await sdk.testConnection();
console.log("Connected:", isConnected);
```

### Private Endpoints (Authentication Required)

#### `submitOrder(params: SubmitOrderRequest)`

Submit a new futures order.

```typescript
// Market order (instant execution)
const marketOrder = await sdk.submitOrder({
  symbol: "BTC_USDT",
  price: 105000, // price is mandatory even for market orders
  vol: 0.001,
  side: 1, // 1 = open long
  type: 5, // 5 = market order
  openType: 1, // 1 = isolated margin
  leverage: 10, // required for isolated margin
});

// IOC order (Immediate or Cancel)
const iocOrder = await sdk.submitOrder({
  symbol: "BTC_USDT",
  price: 105000, // limit price
  vol: 0.001,
  side: 1, // 1 = open long
  type: 3, // 3 = IOC (Immediate or Cancel)
  openType: 1, // 1 = isolated margin
  leverage: 10,
});

// FOK order (Fill or Kill)
const fokOrder = await sdk.submitOrder({
  symbol: "BTC_USDT",
  price: 105500,
  vol: 0.001,
  side: 1, // 1 = open long
  type: 4, // 4 = FOK (Fill or Kill)
  openType: 1, // 1 = isolated margin
  leverage: 10,
});

// Limit order
const limitOrder = await sdk.submitOrder({
  symbol: "BTC_USDT",
  price: 104000,
  vol: 0.001,
  side: 1, // 1 = open long
  type: 1, // 1 = limit order
  openType: 1, // 1 = isolated margin
  leverage: 10,
});

// Market order with Stop Loss and Take Profit
const orderWithSLTP = await sdk.submitOrder({
  symbol: "BTC_USDT",
  price: 105000, // price is mandatory
  vol: 0.001,
  side: 1, // 1 = open long
  type: 5, // 5 = market order
  openType: 1, // 1 = isolated margin
  leverage: 10,
  stopLossPrice: 100000, // Stop loss price (number)
  takeProfitPrice: 110000, // Take profit price (number)
});

// Close position order (reduce only)
const closeOrder = await sdk.submitOrder({
  symbol: "BTC_USDT",
  price: 105000, // price is mandatory
  vol: 0.001,
  side: 2, // 2 = close short
  type: 5, // 5 = market order
  openType: 2, // 2 = cross margin
  positionId: 12345, // position ID to close
  reduceOnly: true, // only reduce position, don't open new
});

// Order with external ID and hedge mode
const hedgeOrder = await sdk.submitOrder({
  symbol: "BTC_USDT",
  price: 104000,
  vol: 0.001,
  side: 1, // 1 = open long
  type: 1, // 1 = limit order
  openType: 1, // 1 = isolated margin
  leverage: 10,
  externalOid: "my-order-123", // external order ID
  positionMode: 1, // 1 = hedge mode
});
```

**Order Parameters (all according to official API documentation):**

**Mandatory Parameters:**

- `symbol: string` - Contract name (e.g., "BTC_USDT")
- `price: number` - Order price (mandatory for all order types)
- `vol: number` - Order volume
- `side: 1 | 2 | 3 | 4` - Order direction:
  - `1` = Open long
  - `2` = Close short
  - `3` = Open short
  - `4` = Close long
- `type: 1 | 2 | 3 | 4 | 5 | 6` - Order type:
  - `1` = Limit order
  - `2` = Post Only Maker
  - `3` = IOC (Immediate or Cancel)
  - `4` = FOK (Fill or Kill)
  - `5` = Market order
  - `6` = Convert market price to current price
- `openType: 1 | 2` - Margin type:
  - `1` = Isolated margin
  - `2` = Cross margin

**Optional Parameters:**

- `leverage?: number` - Leverage (necessary for isolated margin)
- `positionId?: number` - Position ID (recommended when closing a position)
- `externalOid?: string` - External order ID for tracking
- `stopLossPrice?: number` - Stop-loss price
- `takeProfitPrice?: number` - Take-profit price
- `positionMode?: 1 | 2` - Position mode:
  - `1` = Hedge mode
  - `2` = One-way mode (default: user's current config)
- `reduceOnly?: boolean` - For one-way positions only, to reduce positions only (default: false)

**Important Notes:**

- `price` is mandatory for ALL order types, including market orders
- `leverage` is required when using isolated margin (`openType: 1`)
- `reduceOnly` parameter is only accepted for one-way positions, not for hedge positions
- Stop loss and take profit prices are numbers, not strings

#### `cancelOrder(orderIds: number[])`

Cancel orders by order IDs (up to 50 orders at once).

```typescript
const cancelResult = await sdk.cancelOrder([12345, 67890]);
```

#### `cancelOrderByExternalId(params: CancelOrderByExternalIdRequest)`

Cancel order by external order ID.

```typescript
const cancelExternal = await sdk.cancelOrderByExternalId({
  symbol: "BTC_USDT",
  externalOid: "my-order-123",
});
```

#### `cancelAllOrders(params?: CancelAllOrdersRequest)`

Cancel all orders for a symbol or all orders.

```typescript
// Cancel all orders for specific symbol
const cancelSymbol = await sdk.cancelAllOrders({
  symbol: "BTC_USDT",
});

// Cancel ALL orders (dangerous!)
const cancelAll = await sdk.cancelAllOrders();
```

#### `getOrderHistory(params: OrderHistoryParams)`

Get order history with pagination.

```typescript
const history = await sdk.getOrderHistory({
  category: 1,
  page_num: 1,
  page_size: 20,
  states: 3, // order state
  symbol: "BTC_USDT",
});
```

#### `getOrderDeals(params: OrderDealsParams)`

Get transaction details for orders.

```typescript
const deals = await sdk.getOrderDeals({
  symbol: "BTC_USDT",
  page_num: 1,
  page_size: 20,
  start_time: Date.now() - 7 * 24 * 60 * 60 * 1000, // Optional: 7 days ago
  end_time: Date.now(), // Optional: now
});
```

#### `getOrder(orderId: number | string)`

Get detailed information about a specific order by order ID.

```typescript
const orderInfo = await sdk.getOrder("102015012431820288");
console.log("Order ID:", orderInfo.data.orderId);
console.log("Symbol:", orderInfo.data.symbol);
console.log("Side:", orderInfo.data.side); // 1=open long, 2=close short, 3=open short, 4=close long
console.log("Order Type:", orderInfo.data.orderType); // 1=limit, 2=Post Only, 3=IOC, 4=FOK, 5=market, 6=convert market
console.log("State:", orderInfo.data.state); // 1=uninformed, 2=uncompleted, 3=completed, 4=cancelled, 5=invalid
console.log("Price:", orderInfo.data.price);
console.log("Volume:", orderInfo.data.vol);
console.log("Deal Avg Price:", orderInfo.data.dealAvgPrice);
console.log("Deal Volume:", orderInfo.data.dealVol);
console.log("Taker Fee:", orderInfo.data.takerFee);
console.log("Maker Fee:", orderInfo.data.makerFee);
console.log("Profit:", orderInfo.data.profit);
console.log("External OID:", orderInfo.data.externalOid);
console.log("Create Time:", new Date(orderInfo.data.createTime));
console.log("Update Time:", new Date(orderInfo.data.updateTime));
```

**Order States:**

- `1` - Uninformed
- `2` - Uncompleted (partially filled or pending)
- `3` - Completed (fully filled)
- `4` - Cancelled
- `5` - Invalid

**Order Categories:**

- `1` - Limit order
- `2` - System take-over delegate
- `3` - Close delegate
- `4` - ADL reduction

#### `getOrderByExternalId(symbol: string, externalOid: string)`

Get detailed information about a specific order by external order ID.

```typescript
const orderInfo = await sdk.getOrderByExternalId(
  "BTC_USDT",
  "my-external-order-123"
);
console.log("Order ID:", orderInfo.data.orderId);
console.log("Symbol:", orderInfo.data.symbol);
console.log("External OID:", orderInfo.data.externalOid);
console.log("Side:", orderInfo.data.side); // 1=open long, 2=close short, 3=open short, 4=close long
console.log("Order Type:", orderInfo.data.orderType); // 1=limit, 2=Post Only, 3=IOC, 4=FOK, 5=market, 6=convert
console.log("State:", orderInfo.data.state); // 1=uninformed, 2=uncompleted, 3=completed, 4=cancelled, 5=invalid
console.log("Price:", orderInfo.data.price);
console.log("Volume:", orderInfo.data.vol);
console.log("Deal Avg Price:", orderInfo.data.dealAvgPrice);
console.log("Deal Volume:", orderInfo.data.dealVol);
console.log("Profit:", orderInfo.data.profit);
console.log("Created:", new Date(orderInfo.data.createTime));
```

This method is useful when you track orders using your own external IDs and need to query their status.

## WebSocket API (Real-time Updates)

The SDK includes a WebSocket client for real-time updates of orders, positions, balances, and other account data. This is much more efficient than polling REST endpoints.

### Basic WebSocket Usage

```typescript
import { MexcFuturesWebSocket } from "mexc-futures-sdk";

const ws = new MexcFuturesWebSocket({
  apiKey: "YOUR_API_KEY_HERE", // API Key from MEXC API management
  secretKey: "YOUR_SECRET_KEY_HERE", // Secret Key from MEXC API management
  autoReconnect: true,
  reconnectInterval: 5000,
  pingInterval: 15000, // 15 seconds (recommended 10-20s)
});

// Connect and login
await ws.connect();
await ws.login(true); // true = subscribe to all private data by default
```

### Event Listeners

```typescript
// Connection events
ws.on("connected", () => console.log("Connected!"));
ws.on("disconnected", ({ code, reason }) =>
  console.log("Disconnected:", code, reason)
);
ws.on("login", (data) => console.log("Login successful:", data));
ws.on("loginError", (error) => console.error("Login failed:", error));

// Data events
ws.on("orderUpdate", (data) => console.log("Order update:", data));
ws.on("orderDeal", (data) => console.log("Order execution:", data));
ws.on("positionUpdate", (data) => console.log("Position update:", data));
ws.on("assetUpdate", (data) => console.log("Balance update:", data));
ws.on("adlLevel", (data) => console.log("ADL level update:", data));
ws.on("riskLimit", (data) => console.log("Risk limit update:", data));

// Ping/pong
ws.on("pong", (timestamp) => console.log("Pong:", new Date(timestamp)));
```

### Subscription Methods

#### Subscribe to Orders

```typescript
// Subscribe to all order updates
ws.subscribeToOrders();

// Subscribe to specific symbols only
ws.subscribeToOrders(["BTC_USDT", "ETH_USDT"]);
```

#### Subscribe to Order Executions

```typescript
// Subscribe to all order deals (executions)
ws.subscribeToOrderDeals();

// Subscribe to specific symbols only
ws.subscribeToOrderDeals(["BTC_USDT"]);
```

#### Subscribe to Positions

```typescript
// Subscribe to all position updates
ws.subscribeToPositions();

// Subscribe to specific symbols only
ws.subscribeToPositions(["BTC_USDT", "ETH_USDT"]);
```

#### Subscribe to Balance Updates

```typescript
// Subscribe to asset (balance) updates
ws.subscribeToAssets();
```

#### Subscribe to ADL Levels

```typescript
// Subscribe to ADL (Auto-Deleveraging) level updates
ws.subscribeToADLLevels();
```

#### Custom Filters

```typescript
// Subscribe to multiple data types with custom filters
ws.subscribeToMultiple([
  {
    filter: "order",
    rules: ["BTC_USDT", "ETH_USDT"], // Only BTC and ETH orders
  },
  {
    filter: "order.deal",
    rules: ["BTC_USDT"], // Only BTC order executions
  },
  {
    filter: "position",
    rules: ["BTC_USDT", "ETH_USDT"], // Only BTC and ETH positions
  },
  {
    filter: "asset", // All asset updates (no symbol filtering)
  },
]);
```

#### Subscribe to All Data

```typescript
// Subscribe to all available private data
ws.subscribeToAll();
```

### Available Filters

- `order` - Order status updates (supports symbol filtering)
- `order.deal` - Order executions/fills (supports symbol filtering)
- `position` - Position updates (supports symbol filtering)
- `plan.order` - Plan order updates (supports symbol filtering)
- `stop.order` - Stop order updates (supports symbol filtering)
- `stop.planorder` - Stop plan order updates (supports symbol filtering)
- `risk.limit` - Risk limit updates (supports symbol filtering)
- `adl.level` - ADL level updates (no symbol filtering)
- `asset` - Asset/balance updates (no symbol filtering)

### WebSocket Configuration

```typescript
const ws = new MexcFuturesWebSocket({
  apiKey: "YOUR_API_KEY_HERE", // Required: API Key from MEXC API management
  secretKey: "YOUR_SECRET_KEY_HERE", // Required: Secret Key from MEXC API management
  autoReconnect: true, // Optional: Auto-reconnect on disconnect (default: true)
  reconnectInterval: 5000, // Optional: Reconnect delay in ms (default: 5000)
  pingInterval: 15000, // Optional: Ping interval in ms (default: 15000)
});
```

### Connection Management

```typescript
// Connect
await ws.connect();

// Check connection status
console.log("Connected:", ws.connected);
console.log("Logged in:", ws.loggedIn);

// Disconnect
ws.disconnect();
```

### Error Handling

```typescript
ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

ws.on("disconnected", ({ code, reason }) => {
  console.log(`Disconnected: ${code} ${reason}`);
  // Auto-reconnect is handled automatically if enabled
});
```

### Complete Example

See `examples/websocket.ts` for a complete working example.

**Important Notes:**

- WebSocket requires API Key and Secret Key from MEXC API management (different from REST API WEB token)
- WebSocket uses HMAC SHA256 signature: `HMAC-SHA256(apiKey + timestamp, secretKey)`
- Although MEXC docs mention simple concatenation, HMAC signature is required in practice
- Connection will be closed if no ping is received within 1 minute
- Auto-reconnection is enabled by default
- All private data is pushed by default after login unless `subscribe: false` is used

#### `getRiskLimit()`

Get account risk limits.

```typescript
const riskLimits = await sdk.getRiskLimit();
console.log("Risk limits:", riskLimits.data.length);
```

#### `getFeeRate()`

Get trading fee rates for all contracts.

```typescript
const feeRates = await sdk.getFeeRate();
console.log("Fee rates:", feeRates.data.length);
```

#### `getAccountAsset(currency: string)`

Get user's single currency asset information.

```typescript
const usdtAsset = await sdk.getAccountAsset("USDT");
console.log("Available Balance:", usdtAsset.data.availableBalance);
console.log("Total Equity:", usdtAsset.data.equity);
console.log("Position Margin:", usdtAsset.data.positionMargin);
console.log("Unrealized P&L:", usdtAsset.data.unrealized);
```

#### `getOpenPositions(symbol?: string)`

Get user's current holding positions.

```typescript
// Get all open positions
const allPositions = await sdk.getOpenPositions();
console.log("Open positions:", allPositions.data.length);

allPositions.data.forEach((position) => {
  console.log(
    `${position.symbol}: ${position.positionType === 1 ? "LONG" : "SHORT"}`
  );
  console.log(`  Volume: ${position.holdVol}`);
  console.log(`  Avg Price: $${position.holdAvgPrice}`);
  console.log(`  Liquidation: $${position.liquidatePrice}`);
  console.log(`  PnL: ${position.realised} USDT`);
  console.log(`  Leverage: ${position.leverage}x`);
});

// Get positions for specific symbol
const btcPositions = await sdk.getOpenPositions("BTC_USDT");
```

## Configuration Options

```typescript
const sdk = new MexcFuturesSDK({
  authToken: "WEB_YOUR_TOKEN_HERE", // Required: Browser session token
  baseURL: "https://futures.mexc.com/api/v1", // Optional: API base URL
  timeout: 30000, // Optional: Request timeout in milliseconds
  userAgent: "Mozilla/5.0...", // Optional: Custom user agent
  customHeaders: { "x-custom": "value" }, // Optional: Additional headers
});
```

## Run Example

```bash
# Edit examples/basic.ts with your WEB token
npm run build
node dist/examples/basic.js
```

## Rate Limits

Please respect MEXC's rate limits:

- Public endpoints: Various limits per endpoint
- Private endpoints: Various limits per endpoint
- Refer to official documentation: https://mexcdevelop.github.io/apidocs/contract_v1_en/

## Error Handling

```typescript
try {
  const order = await sdk.submitOrder({
    symbol: "BTC_USDT",
    side: 1,
    openType: 1,
    type: "5",
    vol: 0.001,
    leverage: 10,
  });
  console.log("Order created:", order.data);
} catch (error) {
  console.error("Error:", error.message);
  if (error.response) {
    console.error("Status:", error.response.status);
    console.error("Data:", error.response.data);
  }
}
```

## Project Structure

```
src/
├── client.ts          # Main SDK class
├── types/             # TypeScript definitions
│   ├── account.ts     # Account-related types
│   ├── market.ts      # Market data types
│   └── orders.ts      # Order-related types
├── utils/             # Helper functions
│   ├── constants.ts   # API endpoints and constants
│   └── headers.ts     # Header generation and signature
└── index.ts           # Main export

examples/
└── basic.ts           # Usage example
```

## Features

✅ **Full TypeScript support** with comprehensive type definitions  
✅ **Browser session authentication** using WEB token
✅ **Complete trading functionality**: submit, cancel, and manage orders  
✅ **Market data access**: real-time tickers, prices, and contract details  
✅ **Account management**: risk limits, fee rates, and asset balances  
✅ **Order management**: history, transaction details, and cancellation  
✅ **Multiple order types**: Market, Limit, IOC, FOK, Post Only Maker  
✅ **Configurable timeouts** and request settings  
✅ **Error handling** with detailed error messages  
✅ **Rate limiting compliance** according to MEXC API specifications

## Important Notes

⚠️ **Authentication**: This SDK uses browser session tokens with MD5 signature algorithm. Tokens may expire and need to be refreshed.

⚠️ **Trading Risk**: Order creation methods create real trades on the exchange! Always test with small amounts first.

⚠️ **Unofficial**: This SDK is not officially supported by MEXC and uses reverse-engineered endpoints.

🚀 **Maintenance Bypass**: This SDK continues working during MEXC maintenance periods when official API is unavailable, making it ideal for 24/7 automated trading systems.

💡 **Best Practices**:

- Always validate your orders before submission
- Use appropriate order types for your strategy
- Monitor your positions and risk exposure
- Keep your WEB token secure and refresh when needed
- Take advantage of maintenance bypass for uninterrupted trading

## License

MIT

**USE AT YOUR OWN RISK. THE AUTHORS ARE NOT RESPONSIBLE FOR ANY FINANCIAL LOSSES.**
