import { MexcFuturesClient } from "../src/index";

async function main() {
  // Replace with your actual WEB token from browser
  const client = new MexcFuturesClient({
    authToken: "WEB_YOUR_TOKEN_HERE", // Get from browser Developer Tools
    timeout: 15000, // Optional: request timeout in milliseconds
  });

  try {
    // Test connection
    console.log("🔌 Testing connection...");
    const isConnected = await client.testConnection();
    console.log("Connection:", isConnected ? "✅ SUCCESS" : "❌ FAILED");

    if (!isConnected) {
      console.log("❌ Connection failed. Check your WEB token.");
      return;
    }

    // Get market data
    console.log("\n📈 Fetching market data...");

    const symbols = ["BTC_USDT", "CAKE_USDT"];
    for (const symbol of symbols) {
      try {
        console.log(`\n🔍 ${symbol}:`);
        const ticker = await client.getTicker(symbol);

        console.log(`  💰 Price: $${ticker.data?.lastPrice}`);
        console.log(
          `  📈 24h Change: ${((ticker.data?.riseFallRate || 0) * 100).toFixed(
            2
          )}%`
        );
        console.log(
          `  📊 24h Volume: ${ticker.data?.volume24?.toLocaleString()}`
        );
        console.log(
          `  🏦 Open Interest: ${ticker.data?.holdVol?.toLocaleString()}`
        );
        console.log(`  💸 Funding Rate: ${ticker.data?.fundingRate}`);
      } catch (error) {
        console.log(
          `  ❌ Failed to fetch ${symbol}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    // Get contract details
    console.log("\n📋 Fetching contract details...");
    try {
      const btcContract = await client.getContractDetail("BTC_USDT");
      if (btcContract.data) {
        // Handle both single object and array responses
        const contract = Array.isArray(btcContract.data)
          ? btcContract.data[0]
          : btcContract.data;

        console.log(`✅ BTC_USDT Contract:`);
        console.log(`   Max Leverage: ${contract.maxLeverage}x`);
        console.log(`   Contract Size: ${contract.contractSize}`);
        console.log(
          `   Taker Fee: ${(contract.takerFeeRate * 100).toFixed(4)}%`
        );
        console.log(
          `   Maker Fee: ${(contract.makerFeeRate * 100).toFixed(4)}%`
        );
        console.log(`   Min Volume: ${contract.minVol}`);
        console.log(`   Max Volume: ${contract.maxVol.toLocaleString()}`);
      }
    } catch (error) {
      console.log(
        `❌ Contract details failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Get order book depth
    console.log("\n📊 Fetching order book depth...");
    try {
      const depth = await client.getContractDepth("BTC_USDT", 5);

      // Handle different response formats
      const asks = depth.asks || depth.data?.asks || [];
      const bids = depth.bids || depth.data?.bids || [];

      if (asks.length > 0 && bids.length > 0) {
        console.log(`✅ BTC_USDT Order Book:`);
        console.log(`   Best Ask: $${asks[0][0]} (${asks[0][1]} contracts)`);
        console.log(`   Best Bid: $${bids[0][0]} (${bids[0][1]} contracts)`);
        console.log(`   Spread: $${(asks[0][0] - bids[0][0]).toFixed(2)}`);
        console.log(`   Depth: ${asks.length} asks, ${bids.length} bids`);
      }
    } catch (error) {
      console.log(
        `❌ Order book depth failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Get account information (requires valid auth)
    console.log("\n🛡️ Fetching account info...");

    try {
      const riskLimits = await client.getRiskLimit();
      console.log(`✅ Risk limits: ${riskLimits.data?.length || 0} contracts`);
    } catch (error) {
      console.log(
        `❌ Risk limits failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    try {
      const feeRates = await client.getFeeRate();
      console.log(`✅ Fee rates: ${feeRates.data?.length || 0} contracts`);
    } catch (error) {
      console.log(
        `❌ Fee rates failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    try {
      const usdtAsset = await client.getAccountAsset("USDT");
      console.log(
        `✅ USDT balance: ${usdtAsset.data?.availableBalance || 0} USDT`
      );
      console.log(`   Total equity: ${usdtAsset.data?.equity || 0} USDT`);
    } catch (error) {
      console.log(
        `❌ Account asset failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    try {
      const positions = await client.getOpenPositions();
      console.log(`✅ Open positions: ${positions.data?.length || 0}`);

      if (positions.data && positions.data.length > 0) {
        positions.data.slice(0, 3).forEach((position) => {
          const side = position.positionType === 1 ? "LONG" : "SHORT";
          const pnl =
            position.realised >= 0
              ? `+${position.realised}`
              : position.realised;
          console.log(
            `   ${position.symbol} ${side}: ${position.holdVol} @ $${position.holdAvgPrice} (PnL: ${pnl})`
          );
        });
      }
    } catch (error) {
      console.log(
        `❌ Open positions failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Get order history
    console.log("\n📋 Fetching order history...");
    try {
      const orderHistory = await client.getOrderHistory({
        category: 1,
        page_num: 1,
        page_size: 5,
        states: 3,
        symbol: "CAKE_USDT",
      });
      console.log(
        `✅ Order history: ${orderHistory.data?.orders?.length || 0} orders`
      );
    } catch (error) {
      console.log(
        `❌ Order history failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Get order deals
    console.log("\n💼 Fetching order deals...");
    try {
      const orderDeals = await client.getOrderDeals({
        symbol: "CAKE_USDT",
        page_num: 1,
        page_size: 5,
      });
      console.log(
        `✅ Order deals: ${orderDeals.data?.length || 0} transactions`
      );
    } catch (error) {
      console.log(
        `❌ Order deals failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Get specific order information (example with a test order ID)
    console.log("\n🔍 Fetching specific order info...");
    try {
      // Replace with actual order ID from your order history
      const testOrderId = "102015012431820288"; // Example order ID
      console.log(`   Attempting to fetch order: ${testOrderId}`);

      const orderInfo = await client.getOrder(testOrderId);
      if (orderInfo.success && orderInfo.data) {
        console.log(`✅ Order ${orderInfo.data.orderId}:`);
        console.log(`   Symbol: ${orderInfo.data.symbol}`);
        console.log(
          `   Side: ${orderInfo.data.side} (1=open long, 2=close short, 3=open short, 4=close long)`
        );
        console.log(
          `   Order Type: ${orderInfo.data.orderType} (1=limit, 2=Post Only, 3=IOC, 4=FOK, 5=market, 6=convert)`
        );
        console.log(
          `   State: ${orderInfo.data.state} (1=uninformed, 2=uncompleted, 3=completed, 4=cancelled, 5=invalid)`
        );
        console.log(`   Price: $${orderInfo.data.price}`);
        console.log(`   Volume: ${orderInfo.data.vol}`);
        console.log(`   Deal Avg Price: $${orderInfo.data.dealAvgPrice}`);
        console.log(`   Deal Volume: ${orderInfo.data.dealVol}`);
        console.log(
          `   Taker Fee: ${orderInfo.data.takerFee} ${orderInfo.data.feeCurrency}`
        );
        console.log(
          `   Profit: ${orderInfo.data.profit} ${orderInfo.data.feeCurrency}`
        );
        console.log(`   External OID: ${orderInfo.data.externalOid}`);
        console.log(`   Created: ${new Date(orderInfo.data.createTime)}`);
        console.log(`   Updated: ${new Date(orderInfo.data.updateTime)}`);
      }
    } catch (error) {
      console.log(
        `❌ Get order failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      console.log(
        "   Note: Replace testOrderId with a real order ID from your history"
      );
    }

    // Get order by external ID (example with a test external order ID)
    console.log("\n🔍 Fetching order by external ID...");
    try {
      // Replace with actual external order ID from your orders
      const testSymbol = "BTC_USDT";
      const testExternalOid = "_m_f95eb99b061d4eef8f64a04e9ac4dad3"; // Example external OID
      console.log(
        `   Attempting to fetch order: ${testSymbol} / ${testExternalOid}`
      );

      const orderByExternal = await client.getOrderByExternalId(
        testSymbol,
        testExternalOid
      );
      if (orderByExternal.success && orderByExternal.data) {
        console.log(
          `✅ Order ${orderByExternal.data.orderId} (External: ${orderByExternal.data.externalOid}):`
        );
        console.log(`   Symbol: ${orderByExternal.data.symbol}`);
        console.log(
          `   Side: ${orderByExternal.data.side} (1=open long, 2=close short, 3=open short, 4=close long)`
        );
        console.log(
          `   Order Type: ${orderByExternal.data.orderType} (1=limit, 2=Post Only, 3=IOC, 4=FOK, 5=market, 6=convert)`
        );
        console.log(
          `   State: ${orderByExternal.data.state} (1=uninformed, 2=uncompleted, 3=completed, 4=cancelled, 5=invalid)`
        );
        console.log(`   Price: $${orderByExternal.data.price}`);
        console.log(`   Volume: ${orderByExternal.data.vol}`);
        console.log(`   Deal Avg Price: $${orderByExternal.data.dealAvgPrice}`);
        console.log(`   Deal Volume: ${orderByExternal.data.dealVol}`);
        console.log(
          `   Profit: ${orderByExternal.data.profit} ${orderByExternal.data.feeCurrency}`
        );
        console.log(`   Created: ${new Date(orderByExternal.data.createTime)}`);
        console.log(`   Updated: ${new Date(orderByExternal.data.updateTime)}`);
      }
    } catch (error) {
      console.log(
        `❌ Get order by external ID failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      console.log(
        "   Note: Replace testExternalOid with a real external order ID from your history"
      );
    }

    // Example order submission (COMMENTED OUT FOR SAFETY)
    console.log("\n🚀 Order submission examples (commented out for safety):");
    console.log("Uncomment the code below to test real order submission");
    console.log("⚠️  WARNING: This will create real orders on the exchange!\n");

    /*
    // Example 1: Market order (instant execution)
    console.log("🎯 Market Order Example:");
    const ticker = await client.getTicker("CAKE_USDT");
    const currentPrice = ticker.data.lastPrice;
    
    const marketOrder = await client.submitOrder({
      symbol: "CAKE_USDT",
      price: currentPrice, // price is mandatory even for market orders
      vol: 5, // volume in tokens
      side: 1, // 1 = open long
      type: 5, // 5 = market order (instant execution)
      openType: 1, // 1 = isolated margin
      leverage: 10, // required for isolated margin
    });
    console.log("Market order result:", marketOrder);

    // Example 2: IOC order (recommended for fast execution)
    const ask = ticker.data.ask1;
    const iocPrice = ask * 1.005; // +0.5% from ask

    console.log("⚡ IOC Order Example:");
    const iocOrder = await client.submitOrder({
      symbol: "CAKE_USDT",
      price: iocPrice,
      vol: 5,
      side: 1, // 1 = open long
      type: 3, // 3 = IOC (Immediate or Cancel)
      openType: 1, // 1 = isolated margin
      leverage: 10,
    });
    console.log("IOC order result:", iocOrder);

    // Example 3: FOK order (all or nothing)
    const fokPrice = ask * 1.01; // +1% from ask

    console.log("🎯 FOK Order Example:");
    const fokOrder = await client.submitOrder({
      symbol: "CAKE_USDT",
      price: fokPrice,
      vol: 5,
      side: 1, // 1 = open long
      type: 4, // 4 = FOK (Fill or Kill)
      openType: 1, // 1 = isolated margin
      leverage: 10,
    });
    console.log("FOK order result:", fokOrder);

    // Example 4: Limit order with Stop Loss and Take Profit
    console.log("📈 Limit Order with SL/TP Example:");
    const limitOrder = await client.submitOrder({
      symbol: "CAKE_USDT",
      price: currentPrice * 0.98, // limit price 2% below current
      vol: 5,
      side: 1, // 1 = open long
      type: 1, // 1 = limit order
      openType: 1, // 1 = isolated margin
      leverage: 10,
      stopLossPrice: currentPrice * 0.95, // stop loss 5% below current
      takeProfitPrice: currentPrice * 1.1, // take profit 10% above current
      externalOid: "my-limit-order-123", // external order ID
    });
    console.log("Limit order result:", limitOrder);

    // Example 5: Cancel orders
    if (marketOrder.success && marketOrder.data?.orderId) {
      console.log("🗑️ Canceling test order...");
      const cancelResult = await client.cancelOrder([marketOrder.data.orderId]);
      console.log("Cancel result:", cancelResult);
    }
    */

    console.log("\n✅ Example completed successfully!");
    console.log("\n💡 Order Parameters Guide (Updated to match official API):");
    console.log("📋 Mandatory Parameters:");
    console.log("   symbol: Contract name (e.g., 'BTC_USDT')");
    console.log(
      "   price: Order price (mandatory for ALL order types, including market)"
    );
    console.log("   vol: Order volume");
    console.log(
      "   side: 1=open long, 2=close short, 3=open short, 4=close long"
    );
    console.log(
      "   type: 1=limit, 2=Post Only, 3=IOC, 4=FOK, 5=market, 6=convert"
    );
    console.log("   openType: 1=isolated margin, 2=cross margin");
    console.log("\n🔧 Optional Parameters:");
    console.log("   leverage: Required for isolated margin (openType: 1)");
    console.log("   positionId: Recommended when closing a position");
    console.log("   externalOid: External order ID for tracking");
    console.log("   stopLossPrice: Stop-loss price (number)");
    console.log("   takeProfitPrice: Take-profit price (number)");
    console.log("   positionMode: 1=hedge, 2=one-way");
    console.log("   reduceOnly: For one-way positions only (boolean)");
  } catch (error) {
    console.error(
      "❌ Error:",
      error instanceof Error ? error.message : String(error)
    );
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as any;
      console.error("   Status:", axiosError.response?.status);
      console.error("   Data:", axiosError.response?.data);
    }
  }
}

main();
