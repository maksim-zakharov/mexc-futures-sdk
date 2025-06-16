import WebSocket from "ws";
import { EventEmitter } from "events";
import * as crypto from "crypto";
import { Logger, LogLevelString } from "./utils/logger";

export interface WebSocketConfig {
  apiKey: string; // API Key from MEXC API management
  secretKey: string; // Secret Key from MEXC API management (needed for HMAC signature)
  autoReconnect?: boolean;
  reconnectInterval?: number;
  pingInterval?: number;
  logLevel?: LogLevelString;
}

export interface LoginParams {
  apiKey: string;
  signature: string;
  reqTime: string;
  subscribe?: boolean; // false to cancel default push
}

export interface FilterParams {
  filters?: Array<{
    filter:
      | "order"
      | "order.deal"
      | "position"
      | "plan.order"
      | "stop.order"
      | "stop.planorder"
      | "risk.limit"
      | "adl.level"
      | "asset";
    rules?: string[]; // symbol rules for filtering
  }>;
}

export interface WebSocketMessage {
  method?: string;
  channel?: string;
  data?: any;
  param?: any;
  subscribe?: boolean;
}

export class MexcFuturesWebSocket extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private pingTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private isLoggedIn = false;
  private readonly wsUrl = "wss://contract.mexc.com/edge";
  private logger: Logger;

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      autoReconnect: true,
      reconnectInterval: 5000,
      pingInterval: 15000, // 15 seconds (recommended 10-20s)
      ...config,
    };
    this.logger = new Logger(config.logLevel);
  }

  /**
   * Connect to WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.logger.info("🔌 Connecting to MEXC Futures WebSocket...");
        this.ws = new WebSocket(this.wsUrl);

        this.ws.on("open", () => {
          this.logger.info("✅ WebSocket connected");
          this.isConnected = true;
          this.startPing();
          this.emit("connected");
          resolve();
        });

        this.ws.on("message", (data: WebSocket.Data) => {
          try {
            const message: WebSocketMessage = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            this.logger.error("❌ Error parsing WebSocket message:", error);
            this.emit("error", error);
          }
        });

        this.ws.on("close", (code: number, reason: string) => {
          this.logger.warn(`🔌 WebSocket closed: ${code} ${reason}`);
          this.isConnected = false;
          this.isLoggedIn = false;
          this.stopPing();
          this.emit("disconnected", { code, reason });

          if (this.config.autoReconnect) {
            this.scheduleReconnect();
          }
        });

        this.ws.on("error", (error: Error) => {
          this.logger.error("❌ WebSocket error:", error);
          this.emit("error", error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.logger.info("🔌 Disconnecting WebSocket...");
    this.config.autoReconnect = false;
    this.stopPing();
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.isLoggedIn = false;
  }

  /**
   * Login to access private data streams
   * @param subscribe - false to cancel default push of all private data
   */
  async login(subscribe: boolean = true): Promise<void> {
    if (!this.isConnected) {
      throw new Error("WebSocket not connected");
    }

    // Generate signature for login using API Key and Secret Key
    const reqTime = Date.now().toString();

    // For WebSocket, signature is HMAC SHA256 of (apiKey + timestamp) using secret key
    const signatureString = `${this.config.apiKey}${reqTime}`;
    const signature = crypto
      .createHmac("sha256", this.config.secretKey)
      .update(signatureString)
      .digest("hex");

    const loginMessage: WebSocketMessage = {
      subscribe,
      method: "login",
      param: {
        apiKey: this.config.apiKey,
        signature: signature,
        reqTime,
      },
    };

    this.send(loginMessage);
  }

  /**
   * Set personal data filters
   * @param filters - Array of filters to apply
   */
  setPersonalFilter(filters?: FilterParams["filters"]): void {
    if (!this.isLoggedIn) {
      throw new Error("Must login first before setting filters");
    }

    const filterMessage: WebSocketMessage = {
      method: "personal.filter",
      param: {
        filters: filters || [], // Empty array means all data
      },
    };

    this.send(filterMessage);
  }

  /**
   * Subscribe to specific order updates for symbols
   */
  subscribeToOrders(symbols?: string[]): void {
    this.setPersonalFilter([
      {
        filter: "order",
        rules: symbols,
      },
    ]);
  }

  /**
   * Subscribe to order deals (executions) for symbols
   */
  subscribeToOrderDeals(symbols?: string[]): void {
    this.setPersonalFilter([
      {
        filter: "order.deal",
        rules: symbols,
      },
    ]);
  }

  /**
   * Subscribe to position updates for symbols
   */
  subscribeToPositions(symbols?: string[]): void {
    this.setPersonalFilter([
      {
        filter: "position",
        rules: symbols,
      },
    ]);
  }

  /**
   * Subscribe to asset (balance) updates
   */
  subscribeToAssets(): void {
    this.setPersonalFilter([
      {
        filter: "asset",
      },
    ]);
  }

  /**
   * Subscribe to ADL level updates
   */
  subscribeToADLLevels(): void {
    this.setPersonalFilter([
      {
        filter: "adl.level",
      },
    ]);
  }

  /**
   * Subscribe to multiple data types with custom filters
   */
  subscribeToMultiple(filters: FilterParams["filters"]): void {
    this.setPersonalFilter(filters);
  }

  /**
   * Subscribe to all private data (default after login)
   */
  subscribeToAll(): void {
    this.setPersonalFilter([]);
  }

  /**
   * Send message to WebSocket
   */
  private send(message: WebSocketMessage): void {
    if (this.ws && this.isConnected) {
      const messageString = JSON.stringify(message);
      this.logger.debug("➡️ Sending WebSocket message:", messageString);
      this.ws.send(messageString);
    } else {
      this.logger.error(
        "❌ Cannot send message: WebSocket not connected or not ready"
      );
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    this.logger.debug(
      "⬅️ Received WebSocket message:",
      JSON.stringify(message)
    );

    // Handle pong response
    if (message.channel === "pong") {
      this.emit("pong", message.data);
      return;
    }

    // Handle login response
    if (message.method === "login" && message.channel === "rs.login") {
      if (message.data?.code === 0) {
        this.isLoggedIn = true;
        this.logger.info("✅ WebSocket login successful");
        this.emit("login", message);
      } else {
        this.isLoggedIn = false;
        this.logger.error("❌ WebSocket login failed:", message.data);
        this.emit("login_failed", message.data);
      }
      return;
    }

    // Handle filter response
    if (
      message.method === "personal.filter" &&
      message.channel === "rs.personal.filter"
    ) {
      if (message.data?.code === 0) {
        this.logger.info("✅ WebSocket filter set successfully");
        this.emit("filter_set", message.data);
      } else {
        this.logger.error("❌ WebSocket filter set failed:", message.data);
        this.emit("filter_failed", message.data);
      }
      return;
    }

    // Handle error responses
    if (message.channel === "rs.error") {
      this.logger.error("❌ WebSocket error response:", message.data);
      this.emit("error", new Error(message.data));
      return;
    }

    // Handle private data updates
    this.handlePrivateDataUpdate(message);
  }

  /**
   * Handle private data updates (orders, positions, etc.)
   */
  private handlePrivateDataUpdate(message: WebSocketMessage): void {
    const { method, data } = message;

    switch (method) {
      case "order.update":
        this.emit("orderUpdate", data);
        break;
      case "order.deal":
        this.emit("orderDeal", data);
        break;
      case "position.update":
        this.emit("positionUpdate", data);
        break;
      case "asset.update":
        this.emit("assetUpdate", data);
        break;
      case "adl.level":
        this.emit("adlLevel", data);
        break;
      case "risk.limit":
        this.emit("riskLimit", data);
        break;
      case "plan.order":
        this.emit("planOrder", data);
        break;
      case "stop.order":
        this.emit("stopOrder", data);
        break;
      case "stop.planorder":
        this.emit("stopPlanOrder", data);
        break;
      default:
        this.emit("message", message);
        break;
    }
  }

  /**
   * Start ping timer
   */
  private startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.isConnected) {
        this.logger.debug("➡️ Sending ping");
        this.send({ method: "ping" });
      }
    }, this.config.pingInterval);
  }

  /**
   * Stop ping timer
   */
  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
      this.logger.debug("⏹️ Stopped ping timer");
    }
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    this.clearReconnectTimer();
    this.logger.info(
      `🔌 Scheduling reconnect in ${this.config.reconnectInterval}ms...`
    );
    this.reconnectTimer = setTimeout(() => {
      this.logger.info("🔌 Reconnecting...");
      this.connect().catch((error) => {
        this.logger.error("❌ Reconnect failed:", error);
      });
    }, this.config.reconnectInterval);
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Get connection status
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Get login status
   */
  get loggedIn(): boolean {
    return this.isLoggedIn;
  }
}
