export interface RiskLimit {
  symbol: string;
  level: number;
  maxLeverage: number;
  riskLimit: number;
  maintMarginRate: number;
}

export interface FeeRate {
  symbol: string;
  takerFeeRate: number;
  makerFeeRate: number;
}

export interface AccountResponse<T> {
  success: boolean;
  code: number;
  data: T;
}

export interface AccountAsset {
  currency: string;
  positionMargin: number;
  availableBalance: number;
  cashBalance: number;
  frozenBalance: number;
  equity: number;
  unrealized: number;
  bonus: number;
}

export interface AccountAssetResponse {
  success: boolean;
  code: number;
  data: AccountAsset;
}

export interface Position {
  positionId: number;
  symbol: string;
  positionType: 1 | 2; // 1 = long, 2 = short
  openType: 1 | 2; // 1 = isolated, 2 = cross
  state: 1 | 2 | 3; // 1 = holding, 2 = system auto-holding, 3 = closed
  holdVol: number; // holding volume
  frozenVol: number; // frozen volume
  closeVol: number; // close volume
  holdAvgPrice: number; // holdings average price
  openAvgPrice: number; // open average price
  closeAvgPrice: number; // close average price
  liquidatePrice: number; // liquidate price
  oim: number; // original initial margin
  adlLevel?: number; // ADL level 1-5, may be empty
  im: number; // initial margin
  holdFee: number; // holding fee (positive = received, negative = paid)
  realised: number; // realized profit and loss
  leverage: number; // leverage
  createTime: number; // create timestamp
  updateTime: number; // update timestamp
  autoAddIm?: boolean; // auto add initial margin
}

export interface OpenPositionsResponse {
  success: boolean;
  code: number;
  data: Position[];
}

export interface PositionHistoryParams {
  symbol?: string; // Optional: the name of the contract
  type?: 1 | 2; // Optional: position type, 1=long, 2=short
  page_num: number; // Required: current page number, default is 1
  page_size: number; // Required: page size, default 20, maximum 100
}

export interface PositionHistoryResponse {
  success: boolean;
  code: number;
  message: string;
  data: Position[];
}
