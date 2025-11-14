/**
 * Connector Types and Interfaces
 * Phase 4: Multi-Route Expansion
 */

export enum ConnectorType {
  RTA = 'RTA',
  EXCHANGE = 'EXCHANGE',
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConnectorResponse {
  success: boolean;
  orderId?: string;
  exchangeRefNo?: string;
  rtaRefNo?: string;
  submittedAt: Date;
  traceId: string;
  error?: string;
  errorCode?: string;
}

export interface CancelResponse {
  success: boolean;
  cancelledAt: Date;
  reason: string;
  error?: string;
}

export interface OrderStatus {
  orderId: string;
  status: string;
  lastUpdated: Date;
  exchangeRefNo?: string;
  rtaRefNo?: string;
}

export interface Order {
  id?: string;
  modelOrderId?: string;
  clientId: number;
  cartItems: Array<{
    productId: number;
    schemeName: string;
    transactionType: string;
    amount: number;
    units?: number;
  }>;
  transactionMode?: {
    mode: string;
    euin?: string;
  };
  investmentAccount?: any;
  settlementAccount?: any;
  branchCode?: string;
  nominees?: Array<any>;
  optOutOfNomination: boolean;
  ipAddress?: string;
  traceId?: string;
}

/**
 * IConnector Interface
 * All connectors (RTA, Exchange) must implement this interface
 */
export interface IConnector {
  submitOrder(order: Order): Promise<ConnectorResponse>;
  validateOrder(order: Order): Promise<ValidationResult>;
  getStatus(orderId: string): Promise<OrderStatus>;
  cancelOrder(orderId: string, reason: string): Promise<CancelResponse>;
  getConnectorType(): ConnectorType;
  isAvailable(): Promise<boolean>;
}


