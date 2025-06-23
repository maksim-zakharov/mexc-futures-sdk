import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { ENDPOINTS } from "./utils/constants";
import { generateHeaders } from "./utils/headers";
import { Logger, LogLevelString } from "./utils/logger";
import {
  MexcFuturesError,
  MexcValidationError,
  parseAxiosError,
  formatErrorForLogging,
} from "./utils/errors";
import {
  OrderHistoryParams,
  OrderHistoryResponse,
  OrderDealsParams,
  OrderDealsResponse,
  CancelOrderResponse,
  CancelOrderByExternalIdRequest,
  CancelOrderByExternalIdResponse,
  CancelAllOrdersRequest,
  CancelAllOrdersResponse,
  SubmitOrderRequest,
  SubmitOrderResponse,
  GetOrderResponse,
} from "./types/orders";
import {
  RiskLimit,
  FeeRate,
  AccountResponse,
  AccountAssetResponse,
  OpenPositionsResponse,
  PositionHistoryParams,
  PositionHistoryResponse,
} from "./types/account";
import {
  TickerResponse,
  ContractDetailResponse,
  ContractDepthResponse,
} from "./types/market";

export interface MexcFuturesSDKConfig {
  authToken: string; // WEB authentication key (starts with "WEB...")
  baseURL?: string;
  timeout?: number;
  userAgent?: string;
  customHeaders?: Record<string, string>;
  logLevel?: LogLevelString;
}

export class MexcFuturesSDK {
  private httpClient: AxiosInstance;
  private config: MexcFuturesSDKConfig;
  private logger: Logger;

  constructor(config: MexcFuturesSDKConfig) {
    this.config = config;
    this.logger = new Logger(config.logLevel);

    this.httpClient = axios.create({
      baseURL: config.baseURL || "https://futures.mexc.com/api/v1",
      timeout: config.timeout || 30000,
      headers: generateHeaders(config),
    });

    // Request interceptor for debugging
    this.httpClient.interceptors.request.use((requestConfig) => {
      this.logger.debug(
        `🌐 ${requestConfig.method?.toUpperCase()} ${requestConfig.baseURL}${
          requestConfig.url
        }`
      );
      if (requestConfig.data) {
        this.logger.debug(
          "📦 Request body:",
          JSON.stringify(requestConfig.data, null, 2)
        );
      }
      return requestConfig;
    });

    // Response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`✅ ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        // Parse the axios error into a user-friendly MEXC error
        const mexcError = parseAxiosError(
          error,
          error.config?.url,
          error.config?.method?.toUpperCase()
        );

        // Log the user-friendly error message
        this.logger.error(mexcError.getUserFriendlyMessage());

        // Log detailed error information in debug mode
        if (this.logger.isDebugEnabled()) {
          this.logger.debug(
            "Detailed error info:",
            formatErrorForLogging(mexcError)
          );
        }

        return Promise.reject(mexcError);
      }
    );
  }

  /**
   * Submit order using /api/v1/private/order/submit endpoint
   * This is the alternative order submission method used by MEXC browser
   */
  async submitOrder(
    orderParams: SubmitOrderRequest
  ): Promise<SubmitOrderResponse> {
    try {
      this.logger.info("🚀 Submitting order using /submit endpoint");

      this.logger.debug(
        "📦 Order parameters:",
        JSON.stringify(orderParams, null, 2)
      );

      // Generate headers with MEXC signature
      const headers = generateHeaders(
        {
          authToken: this.config.authToken,
          userAgent: this.config.userAgent,
          customHeaders: this.config.customHeaders,
        },
        true,
        orderParams
      );

      const response = await this.httpClient.post(
        ENDPOINTS.SUBMIT_ORDER,
        orderParams,
        {
          headers,
        }
      );

      this.logger.debug("🔍 Order response:", response.data);
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Cancel orders by order IDs (up to 50 orders at once)
   */
  async cancelOrder(orderIds: number[]): Promise<CancelOrderResponse> {
    try {
      if (orderIds.length === 0) {
        throw new MexcValidationError(
          "Order IDs array cannot be empty",
          "orderIds"
        );
      }
      if (orderIds.length > 50) {
        throw new MexcValidationError(
          "Cannot cancel more than 50 orders at once",
          "orderIds"
        );
      }

      // Generate headers with MEXC signature for POST request
      const headers = generateHeaders(
        {
          authToken: this.config.authToken,
          userAgent: this.config.userAgent,
          customHeaders: this.config.customHeaders,
        },
        true,
        orderIds
      );

      const response = await this.httpClient.post(
        ENDPOINTS.CANCEL_ORDER,
        orderIds,
        {
          headers,
        }
      );

      this.logger.debug("🔍 Cancel order response:", response.data);
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Cancel order by external order ID
   */
  async cancelOrderByExternalId(
    params: CancelOrderByExternalIdRequest
  ): Promise<CancelOrderByExternalIdResponse> {
    try {
      // Generate headers with MEXC signature for POST request
      const headers = generateHeaders(
        {
          authToken: this.config.authToken,
          userAgent: this.config.userAgent,
          customHeaders: this.config.customHeaders,
        },
        true,
        params
      );

      const response = await this.httpClient.post(
        ENDPOINTS.CANCEL_ORDER_BY_EXTERNAL_ID,
        params,
        {
          headers,
        }
      );

      this.logger.debug(
        "🔍 Cancel order by external ID response:",
        response.data
      );
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Cancel all orders under a contract (or all orders if no symbol provided)
   */
  async cancelAllOrders(
    params?: CancelAllOrdersRequest
  ): Promise<CancelAllOrdersResponse> {
    try {
      const payload = params || {};

      // Generate headers with MEXC signature for POST request
      const headers = generateHeaders(
        {
          authToken: this.config.authToken,
          userAgent: this.config.userAgent,
          customHeaders: this.config.customHeaders,
        },
        true,
        payload
      );

      const response = await this.httpClient.post(
        ENDPOINTS.CANCEL_ALL_ORDERS,
        payload,
        {
          headers,
        }
      );
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Get order history
   */
  async getOrderHistory(
    params: OrderHistoryParams
  ): Promise<OrderHistoryResponse> {
    try {
      const response = await this.httpClient.get(ENDPOINTS.ORDER_HISTORY, {
        params,
      });
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Get all transaction details of the user's orders
   */
  async getOrderDeals(params: OrderDealsParams): Promise<OrderDealsResponse> {
    try {
      const response = await this.httpClient.get(ENDPOINTS.ORDER_DEALS, {
        params,
      });
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Get order information by order ID
   * @param orderId Order ID to query
   * @returns Detailed order information
   */
  async getOrder(orderId: number | string): Promise<GetOrderResponse> {
    try {
      const response = await this.httpClient.get(
        `${ENDPOINTS.GET_ORDER}/${orderId}`
      );
      this.logger.debug("🔍 Order response:", response.data);
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Get order information by external order ID
   * @param symbol Contract symbol (e.g., "BTC_USDT")
   * @param externalOid External order ID
   * @returns Detailed order information
   */
  async getOrderByExternalId(
    symbol: string,
    externalOid: string
  ): Promise<GetOrderResponse> {
    try {
      const response = await this.httpClient.get(
        `${ENDPOINTS.GET_ORDER_BY_EXTERNAL_ID}/${symbol}/${externalOid}`
      );
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Get risk limits for account
   */
  async getRiskLimit(): Promise<AccountResponse<RiskLimit[]>> {
    try {
      const response = await this.httpClient.get(ENDPOINTS.RISK_LIMIT);
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Get fee rates for contracts
   */
  async getFeeRate(): Promise<AccountResponse<FeeRate[]>> {
    try {
      const response = await this.httpClient.get(ENDPOINTS.FEE_RATE);
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Get user's single currency asset information
   * @param currency Currency symbol (e.g., "USDT", "BTC")
   * @returns Account asset information for the specified currency
   */
  async getAccountAsset(currency: string): Promise<AccountAssetResponse> {
    try {
      const response = await this.httpClient.get(
        `${ENDPOINTS.ACCOUNT_ASSET}/${currency}`
      );
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Get user's current holding positions
   * @param symbol Optional: specific contract symbol to filter positions
   * @returns List of open positions
   */
  async getOpenPositions(symbol?: string): Promise<OpenPositionsResponse> {
    try {
      const params = symbol ? { symbol } : {};
      const response = await this.httpClient.get(ENDPOINTS.OPEN_POSITIONS, {
        params,
      });
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Get user's history position information
   * @param params Parameters for filtering position history
   * @returns List of historical positions
   */
  async getPositionHistory(
    params: PositionHistoryParams
  ): Promise<PositionHistoryResponse> {
    try {
      const response = await this.httpClient.get(ENDPOINTS.POSITION_HISTORY, {
        params,
      });
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Get ticker data for a specific symbol
   */
  async getTicker(symbol: string): Promise<TickerResponse> {
    try {
      const response = await this.httpClient.get(ENDPOINTS.TICKER, {
        params: { symbol },
      });
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Get contract information
   * @param symbol Optional: specific contract symbol (e.g., "BTC_USDT"). If not provided, returns all contracts
   * @returns Contract details for specified symbol or all contracts
   */
  async getContractDetail(symbol?: string): Promise<ContractDetailResponse> {
    try {
      const params = symbol ? { symbol } : {};
      const response = await this.httpClient.get(ENDPOINTS.CONTRACT_DETAIL, {
        params,
      });
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Get contract's depth information (order book)
   * @param symbol Contract symbol (e.g., "BTC_USDT")
   * @param limit Optional: depth tier limit
   * @returns Order book with bids and asks
   */
  async getContractDepth(
    symbol: string,
    limit?: number
  ): Promise<ContractDepthResponse> {
    try {
      const params = limit ? { limit } : {};
      const response = await this.httpClient.get(
        `${ENDPOINTS.CONTRACT_DEPTH}/${symbol}`,
        { params }
      );
      return response.data;
    } catch (error) {
      // Error is already logged by the interceptor with user-friendly message
      throw error;
    }
  }

  /**
   * Test connection to the API (using public endpoint)
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test with a common symbol
      await this.getTicker("BTC_USDT");
      return true;
    } catch (error) {
      // Error is already logged by the interceptor, just return false
      return false;
    }
  }
}
