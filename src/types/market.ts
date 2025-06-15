export interface RiseFallRates {
  zone: string;
  r: number; // current rate
  v: number; // current value
  r7: number; // 7 days rate
  r30: number; // 30 days rate
  r90: number; // 90 days rate
  r180: number; // 180 days rate
  r365: number; // 365 days rate
}

export interface TickerData {
  contractId: number;
  symbol: string;
  lastPrice: number;
  bid1: number;
  ask1: number;
  volume24: number; // 24h volume
  amount24: number; // 24h amount
  holdVol: number; // open interest
  lower24Price: number; // 24h low
  high24Price: number; // 24h high
  riseFallRate: number; // price change rate
  riseFallValue: number; // price change value
  indexPrice: number;
  fairPrice: number;
  fundingRate: number;
  maxBidPrice: number;
  minAskPrice: number;
  timestamp: number;
  riseFallRates: RiseFallRates;
  riseFallRatesOfTimezone: number[];
}

export interface TickerResponse {
  success: boolean;
  code: number;
  data: TickerData;
}

export interface ContractDetail {
  symbol: string;
  displayName: string;
  displayNameEn: string;
  positionOpenType: number; // 1: isolated, 2: cross, 3: both
  baseCoin: string;
  quoteCoin: string;
  settleCoin: string;
  contractSize: number;
  minLeverage: number;
  maxLeverage: number;
  priceScale: number;
  volScale: number;
  amountScale: number;
  priceUnit: number;
  volUnit: number;
  minVol: number;
  maxVol: number;
  bidLimitPriceRate: number;
  askLimitPriceRate: number;
  takerFeeRate: number;
  makerFeeRate: number;
  maintenanceMarginRate: number;
  initialMarginRate: number;
  riskBaseVol: number;
  riskIncrVol: number;
  riskIncrMmr: number;
  riskIncrImr: number;
  riskLevelLimit: number;
  priceCoefficientVariation: number;
  indexOrigin: string[];
  state: number; // 0: enabled, 1: delivery, 2: completed, 3: offline, 4: pause
  isNew: boolean;
  isHot: boolean;
  isHidden: boolean;
  conceptPlate: string[];
  riskLimitType: string; // "BY_VOLUME" or "BY_VALUE"
  maxNumOrders: number[];
  marketOrderMaxLevel: number;
  marketOrderPriceLimitRate1: number;
  marketOrderPriceLimitRate2: number;
  triggerProtect: number;
  appraisal: number;
  showAppraisalCountdown: number;
  automaticDelivery: number;
  apiAllowed: boolean;
}

export interface ContractDetailResponse {
  success: boolean;
  code: number;
  data: ContractDetail | ContractDetail[]; // Can be single object or array
}

export interface DepthEntry {
  0: number; // price
  1: number; // volume
  2?: number; // order count (optional)
}

export interface ContractDepthData {
  asks: DepthEntry[]; // seller depth (ascending price)
  bids: DepthEntry[]; // buyer depth (descending price)
  version: number; // version number
  timestamp: number; // system timestamp
}

export interface ContractDepthResponse {
  success?: boolean; // Note: this endpoint may not return success/code fields
  code?: number;
  data?: ContractDepthData;
  asks?: DepthEntry[]; // Direct response format
  bids?: DepthEntry[];
  version?: number;
  timestamp?: number;
}
