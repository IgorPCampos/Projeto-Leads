export interface QuoteDimensions {
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
}

export interface Quote {
  id: string;
  originCep: string;
  destCep: string;
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  value: number;
  dimensions?: QuoteDimensions;
  createdAt: string;
}

export interface Lead {
  name: string;
  email: string;
  quotes: Quote[];
  createdAt: string;
}
