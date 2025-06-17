export const API_BASE_URL = "https://futures.mexc.com/api/v1";

export const ENDPOINTS = {
  // Private endpoints (require authentication)
  SUBMIT_ORDER: "/private/order/submit",
  CANCEL_ORDER: "/private/order/cancel",
  CANCEL_ORDER_BY_EXTERNAL_ID: "/private/order/cancel_with_external",
  CANCEL_ALL_ORDERS: "/private/order/cancel_all",
  ORDER_HISTORY: "/private/order/list/history_orders",
  ORDER_DEALS: "/private/order/list/order_deals",
  GET_ORDER: "/private/order/get", // GET /private/order/get/{order_id}
  GET_ORDER_BY_EXTERNAL_ID: "/private/order/external", // GET /private/order/external/{symbol}/{external_oid}
  RISK_LIMIT: "/private/account/risk_limit",
  FEE_RATE: "/private/account/contract/fee_rate",
  ACCOUNT_ASSET: "/private/account/asset",
  OPEN_POSITIONS: "/private/position/open_positions",
  POSITION_HISTORY: "/private/position/list/history_positions",

  // Public endpoints (no authentication required)
  TICKER: "/contract/ticker",
  CONTRACT_DETAIL: "/contract/detail",
  CONTRACT_DEPTH: "/contract/depth",
} as const;

// Default browser headers (can be overridden via SDK options)
export const DEFAULT_HEADERS = {
  accept: "*/*",
  "accept-language":
    "en-US,en;q=0.9,ru;q=0.8,it;q=0.7,la;q=0.6,vi;q=0.5,lb;q=0.4",
  "cache-control": "no-cache",
  "content-type": "application/json",
  dnt: "1",
  language: "English",
  origin: "https://www.mexc.com",
  pragma: "no-cache",
  priority: "u=1, i",
  referer: "https://www.mexc.com/",
  "sec-ch-ua":
    '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  "x-language": "en-US",
} as const;
