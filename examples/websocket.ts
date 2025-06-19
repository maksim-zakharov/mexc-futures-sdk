import { MexcFuturesWebSocket } from "../src/index";

async function main() {
  // Initialize WebSocket client with your API credentials
  const ws = new MexcFuturesWebSocket({
    apiKey: "YOUR_API_KEY_HERE", // Get from MEXC API management
    secretKey: "YOUR_SECRET_KEY_HERE", // Get from MEXC API management
    autoReconnect: true,
    reconnectInterval: 5000,
    pingInterval: 15000,
  });

  // Connection events
  ws.on("connected", () => {
    console.log("🔌 WebSocket connected!");

    // Login to access private data (false = no default subscription)
    ws.login(false)
      .then(() => console.log("🔐 Login request sent"))
      .catch((error) => console.error("❌ Login failed:", error));
  });

  ws.on("login", (data) => {
    console.log("✅ Login successful:", data);

    // Option 1: Subscribe to ALL private data (recommended for most use cases)
    console.log("🔄 Subscribing to all private data...");
    ws.subscribeToAll();

    // Option 2: Subscribe to specific data types with symbol filters
    // Uncomment the lines below if you want to filter by specific symbols
    /*
    console.log("📋 Subscribing to specific symbols...");
    ws.subscribeToMultiple([
      {
        filter: "order",
        rules: ["BTC_USDT", "ETH_USDT"], // Only these symbols
      },
      {
        filter: "order.deal",
        rules: ["BTC_USDT", "ETH_USDT"],
      },
      {
        filter: "position",
        rules: ["BTC_USDT", "ETH_USDT"],
      },
      {
        filter: "asset", // All asset updates (no symbol filter needed)
      },
    ]);
    */
  });

  // Private data event handlers
  ws.on("orderUpdate", (data) => {
    console.log("📋 Order Update:", {
      orderId: data.orderId,
      symbol: data.symbol,
      side: data.side === 1 ? "BUY" : "SELL",
      type:
        data.orderType === 1
          ? "LIMIT"
          : data.orderType === 5
          ? "MARKET"
          : "OTHER",
      price: data.price,
      volume: data.vol,
      state: data.state, // 1=new, 2=pending, 3=filled, 4=cancelled
    });
  });

  ws.on("orderDeal", (data) => {
    console.log("💼 Order Execution:", {
      orderId: data.orderId,
      symbol: data.symbol,
      side: data.side === 1 ? "BUY" : "SELL",
      price: data.price,
      volume: data.vol,
      fee: data.fee,
      profit: data.profit,
    });
  });

  ws.on("positionUpdate", (data) => {
    console.log("📊 Position Update:", {
      positionId: data.positionId,
      symbol: data.symbol,
      side: data.positionType === 1 ? "LONG" : "SHORT",
      size: data.holdVol,
      avgPrice: data.holdAvgPrice,
      pnl: data.pnl,
      margin: data.im,
      liquidationPrice: data.liquidatePrice,
    });
  });

  ws.on("assetUpdate", (data) => {
    console.log("💰 Balance Update:", {
      currency: data.currency,
      available: data.availableBalance,
      frozen: data.frozenBalance,
      positionMargin: data.positionMargin,
    });
  });

  ws.on("stopOrder", (data) => {
    console.log("🛑 Stop Order:", {
      orderId: data.orderId,
      symbol: data.symbol,
      stopLoss: data.stopLossPrice,
      takeProfit: data.takeProfitPrice,
    });
  });

  ws.on("liquidateRisk", (data) => {
    console.log("⚠️ Liquidation Risk:", {
      positionId: data.positionId,
      symbol: data.symbol,
      liquidationPrice: data.liquidatePrice,
      marginRatio: data.marginRatio,
      adlLevel: data.adlLevel,
    });
  });

  // Public market data (optional - uncomment if needed)
  /*
  // Subscribe to market data after login
  setTimeout(() => {
    console.log("📊 Subscribing to market data...");
    
    // All tickers
    ws.subscribeToAllTickers();
    
    // Specific symbol data
    ws.subscribeToTicker("BTC_USDT");
    ws.subscribeToDepth("BTC_USDT");
    ws.subscribeToKline("BTC_USDT", "Min1");
    ws.subscribeToDeals("BTC_USDT");
  }, 2000);

  // Market data event handlers
  ws.on("tickers", (data) => {
    console.log("📈 All Tickers Update:", data.length, "symbols");
  });

  ws.on("ticker", (data) => {
    console.log("📊 Ticker:", {
      symbol: data.symbol,
      price: data.lastPrice,
      change: data.rate24h,
      volume: data.vol24h,
    });
  });

  ws.on("depth", (data) => {
    console.log("📚 Order Book:", {
      symbol: data.symbol,
      bids: data.bids?.slice(0, 3), // Top 3 bids
      asks: data.asks?.slice(0, 3), // Top 3 asks
    });
  });

  ws.on("kline", (data) => {
    console.log("🕯️ Kline:", {
      symbol: data.symbol,
      interval: data.interval,
      open: data.o,
      high: data.h,
      low: data.l,
      close: data.c,
      volume: data.v,
    });
  });
  */

  // Connection management
  ws.on("disconnected", ({ code, reason }) => {
    console.log(`🔌 Disconnected: ${code} ${reason}`);
  });

  ws.on("error", (error) => {
    console.error("❌ WebSocket error:", error);
  });

  ws.on("pong", (timestamp) => {
    console.log("🏓 Pong:", new Date(timestamp).toISOString());
  });

  // Connect and start
  try {
    await ws.connect();
    console.log(
      "🚀 WebSocket client running... Make some trades to see events!"
    );
    console.log("📝 Press Ctrl+C to exit");

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🔌 Shutting down...");
      ws.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to connect:", error);
  }
}

main().catch(console.error);
