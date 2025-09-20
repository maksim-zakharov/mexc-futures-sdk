export interface OrderHistoryParams {
  category: number;
  page_num: number;
  page_size: number;
  states: number;
  symbol: string;
}

export interface OpenOrder {
  orderId: string;
  symbol: string;
  // Если 0 - не привязано к позиции
  positionId: number;
  price: number;
  priceStr: string;
  vol: number;
  leverage: number;
  side: OrderSide;
  category: number;
  orderType: OrderType;
  dealAvgPrice: number;
  dealAvgPriceStr: string;
  dealVol: number;
  orderMargin: number;
  takerFee: number;
  makerFee: number;
  profit: number;
  feeCurrency: string;
  openType: OrderOpenType;
  state: OrderState;
  externalOid: string;
  errorCode: number;
  usedMargin: number;
  createTime: number;
  updateTime: number;
  positionMode: PositionMode;
  reduceOnly: boolean;
  version: number;
  showCancelReason: number;
  showProfitRateShare: number;
  bboTypeNum: number;
  totalFee: number;
  zeroSaveTotalFeeBinance: number;
  zeroTradeTotalFeeBinance: number;
}

export enum OrderState {
  Uninformed = 1,
  Uncompleted = 2,
  Completed = 3,
  Canceled = 4,
  Invalid = 5,
}

export enum OrderSide {
  CloseSell = 4,
  Sell = 3,
  CloseBuy = 2,
  Buy = 1,
}

export enum OrderType {
  Limit = 1,
  PostOnlyMarket = 2,
  Market = 5,
}

export enum OrderOpenType {
  Isolated = 1,
  Cross = 2,
}

export enum COrderState {
  Uninformed = 1,
  Uncompleted = 2,
  Completed = 3,
  Canceled = 4,
  Invalid = 5,
}

export enum PositionMode {
  Hedge = 1,
  OneWay = 2,
}

export interface OrderParams {
  category?: number;
  page_num?: number;
  page_size?: number;
  states?: number;
  symbol?: string;
}

export interface Order {
  id: string;
  symbol: string;
  side: number;
  type: string;
  vol: number;
  price: string;
  leverage: number;
  status: string;
  createTime: number;
  updateTime: number;
}

export interface OrderHistoryResponse {
  success: boolean;
  code: number;
  data: {
    orders: Order[];
    total: number;
  };
}

export interface OpenOrdersResponse {
  success: boolean;
  code: number;
  data: OpenOrder;
}

export interface OrderDealsParams {
  symbol: string;
  start_time?: number; // timestamp in milliseconds
  end_time?: number; // timestamp in milliseconds
  page_num: number;
  page_size: number;
}

export interface OrderDeal {
  id: number;
  symbol: string;
  side: number; // 1 open long, 2 close short, 3 open short, 4 close long
  vol: string; // transaction volume
  price: string; // transaction price
  fee: string; // fee amount
  feeCurrency: string; // fee currency
  profit: string; // profit
  isTaker: boolean; // is taker order
  category: number; // 1 limit order, 2 system take-over delegate, 3 close delegate, 4 ADL reduction
  orderId: number; // order id
  timestamp: number; // transaction timestamp
}

export interface OrderDealsResponse {
  success: boolean;
  code: number;
  data: OrderDeal[];
}

// Cancel orders types
export interface CancelOrderResult {
  orderId: number;
  errorCode: number; // 0 means success, non-zero means failure
  errorMsg: string;
}

export interface CancelOrderResponse {
  success: boolean;
  code: number;
  data: CancelOrderResult[];
}

export interface CancelOrderByExternalIdRequest {
  symbol: string;
  externalOid: string;
}

export interface CancelOrderByExternalIdResponse {
  success: boolean;
  code: number;
  data?: {
    symbol: string;
    externalOid: string;
  };
}

export interface CancelAllOrdersRequest {
  symbol?: string; // optional: cancel specific symbol orders, if not provided cancels all
}

export interface CancelAllOrdersResponse {
  success: boolean;
  code: number;
  data?: any;
}

// Submit order types (using /api/v1/private/order/submit endpoint)
export interface SubmitOrderRequest {
  symbol: string; // the name of the contract (mandatory)
  price: number; // price (mandatory)
  vol: number; // volume (mandatory)
  leverage?: number; // leverage, necessary on Isolated Margin (optional)
  side: 1 | 2 | 3 | 4; // order direction: 1=open long, 2=close short, 3=open short, 4=close long (mandatory)
  type: 1 | 2 | 3 | 4 | 5 | 6; // order type: 1=price limited order, 2=Post Only Maker, 3=transact or cancel instantly, 4=transact completely or cancel completely, 5=market orders, 6=convert market price to current price (mandatory)
  openType: 1 | 2; // open type: 1=isolated, 2=cross (mandatory)
  positionId?: number; // position ID, recommended when closing a position (optional)
  externalOid?: string; // external order ID (optional)
  stopLossPrice?: number; // stop-loss price (optional)
  takeProfitPrice?: number; // take-profit price (optional)
  positionMode?: 1 | 2; // position mode: 1=hedge, 2=one-way, default: user's current config (optional)
  reduceOnly?: boolean; // default false, for one-way positions to only reduce positions, two-way positions will not accept this parameter (optional)
}

export interface SubmitOrderResponse {
  success: boolean;
  code: number;
  message?: string;
  data?: number; // Order ID is returned directly as a number
}

// Get order by ID types
export interface GetOrderResponse {
  success: boolean;
  code: number;
  data: {
    orderId: string;
    symbol: string;
    positionId: number;
    price: number;
    vol: number;
    leverage: number;
    side: number; // 1 open long, 2 close short, 3 open short, 4 close long
    category: number; // 1 limit order, 2 system take-over delegate, 3 close delegate, 4 ADL reduction
    orderType: number; // 1:price limited order,2:Post Only Maker,3:transact or cancel instantly ,4 : transact completely or cancel completely，5:market orders,6 convert market price to current price
    dealAvgPrice: number;
    dealVol: number;
    orderMargin: number;
    takerFee: number;
    makerFee: number;
    profit: number;
    feeCurrency: string;
    openType: number; // 1 isolated, 2 cross
    state: number; // 1 uninformed, 2 uncompleted, 3 completed, 4 cancelled, 5 invalid
    externalOid: string;
    errorCode: number;
    usedMargin: number;
    createTime: number;
    updateTime: number;
  };
}
