import { MexcFuturesWebSocket } from "../src/index";

async function main() {
  // Replace with your actual API credentials from MEXC API management
  const ws = new MexcFuturesWebSocket({
    apiKey: "YOUR_API_KEY_HERE", // Get from MEXC API management
    secretKey: "YOUR_SECRET_KEY_HERE", // Get from MEXC API management
    autoReconnect: true,
    reconnectInterval: 5000,
    pingInterval: 15000, // 15 seconds
  });

  // Set up event listeners
  ws.on("connected", () => {
    console.log("🔌 WebSocket connected!");

    // Login to access private data
    ws.login(true) // true = subscribe to all private data by default
      .then(() => {
        console.log("🔐 Login request sent");
      })
      .catch((error) => {
        console.error("❌ Login failed:", error);
      });
  });

  ws.on("login", (data) => {
    console.log("✅ Login successful:", data);

    // Example 1: Subscribe to orders for specific symbols
    console.log("📋 Subscribing to BTC_USDT and CAKE_USDT orders...");
    ws.subscribeToOrders(["BTC_USDT", "CAKE_USDT"]);

    // Example 2: Subscribe to position updates for specific symbols
    console.log("📊 Subscribing to position updates...");
    ws.subscribeToPositions(["BTC_USDT", "CAKE_USDT"]);

    // Example 3: Subscribe to order deals (executions)
    console.log("💼 Subscribing to order deals...");
    ws.subscribeToOrderDeals(["BTC_USDT", "CAKE_USDT"]);

    // Example 4: Subscribe to asset (balance) updates
    console.log("💰 Subscribing to asset updates...");
    ws.subscribeToAssets();

    // Example 5: Subscribe to multiple data types at once
    setTimeout(() => {
      console.log("🔄 Setting custom filters...");
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
          filter: "asset", // All asset updates (no rules needed)
        },
      ]);
    }, 5000);
  });

  ws.on("loginError", (error) => {
    console.error("❌ Login error:", error);
  });

  // Handle order updates
  ws.on("orderUpdate", (data) => {
    console.log("📋 Order Update:", JSON.stringify(data, null, 2));
  });

  // Handle order deals (executions)
  ws.on("orderDeal", (data) => {
    console.log("💼 Order Deal:", JSON.stringify(data, null, 2));
  });

  // Handle position updates
  ws.on("positionUpdate", (data) => {
    console.log("📊 Position Update:", JSON.stringify(data, null, 2));
  });

  // Handle asset (balance) updates
  ws.on("assetUpdate", (data) => {
    console.log("💰 Asset Update:", JSON.stringify(data, null, 2));
  });

  // Handle ADL level updates
  ws.on("adlLevel", (data) => {
    console.log("⚠️ ADL Level Update:", JSON.stringify(data, null, 2));
  });

  // Handle risk limit updates
  ws.on("riskLimit", (data) => {
    console.log("🛡️ Risk Limit Update:", JSON.stringify(data, null, 2));
  });

  // Handle plan orders
  ws.on("planOrder", (data) => {
    console.log("📅 Plan Order Update:", JSON.stringify(data, null, 2));
  });

  // Handle stop orders
  ws.on("stopOrder", (data) => {
    console.log("🛑 Stop Order Update:", JSON.stringify(data, null, 2));
  });

  // Handle pong responses
  ws.on("pong", (timestamp) => {
    console.log("🏓 Pong received:", new Date(timestamp));
  });

  // Handle disconnection
  ws.on("disconnected", ({ code, reason }) => {
    console.log(`🔌 WebSocket disconnected: ${code} ${reason}`);
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error("❌ WebSocket error:", error);
  });

  // Handle any other messages
  ws.on("message", (message) => {
    console.log("📥 Other message:", JSON.stringify(message, null, 2));
  });

  try {
    // Connect to WebSocket
    await ws.connect();

    // Keep the connection alive
    console.log("🔄 WebSocket example running... Press Ctrl+C to exit");

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🔌 Shutting down WebSocket...");
      ws.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to connect:", error);
  }
}

main().catch(console.error);
