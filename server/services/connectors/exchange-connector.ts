/**
 * Exchange Connector Implementation
 * Phase 4: Multi-Route Expansion
 * Implements IConnector interface for exchange platforms (e.g., BSE Star)
 */

import {
  IConnector,
  ConnectorType,
  ConnectorResponse,
  ValidationResult,
  OrderStatus,
  CancelResponse,
  Order,
} from './types';
import { randomUUID } from 'crypto';

export class ExchangeConnector implements IConnector {
  private exchangeApiUrl: string;
  private exchangeApiKey: string;
  private isHealthy: boolean = true;

  constructor(config: { exchangeApiUrl: string; exchangeApiKey: string }) {
    this.exchangeApiUrl = config.exchangeApiUrl;
    this.exchangeApiKey = config.exchangeApiKey;
  }

  getConnectorType(): ConnectorType {
    return ConnectorType.EXCHANGE;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Health check - in real implementation, this would call exchange health endpoint
      // For now, return the cached health status
      return this.isHealthy;
    } catch (error) {
      this.isHealthy = false;
      return false;
    }
  }

  async validateOrder(order: Order): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate exchange-supported schemes
    const exchangeSupportedSchemes = this.getExchangeSupportedSchemes();
    const orderSchemes = order.cartItems.map(item => item.schemeName);

    for (const scheme of orderSchemes) {
      if (!exchangeSupportedSchemes.includes(scheme)) {
        errors.push(`Scheme "${scheme}" is not supported by exchange platform`);
      }
    }

    // Validate required fields
    if (!order.modelOrderId) {
      errors.push('ModelOrderID is required');
    }

    if (!order.cartItems || order.cartItems.length === 0) {
      errors.push('Order must contain at least one cart item');
    }

    // Validate transaction types supported by exchange
    const supportedTypes = ['Purchase', 'Redemption', 'Switch'];
    for (const item of order.cartItems) {
      if (!supportedTypes.includes(item.transactionType)) {
        errors.push(`Transaction type "${item.transactionType}" not supported by exchange`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async submitOrder(order: Order): Promise<ConnectorResponse> {
    const traceId = order.traceId || randomUUID();
    const ipAddress = order.ipAddress || '0.0.0.0';

    try {
      // Validate order first
      const validation = await this.validateOrder(order);
      if (!validation.isValid) {
        return {
          success: false,
          submittedAt: new Date(),
          traceId,
          error: validation.errors.join('; '),
          errorCode: 'EXCH-VAL-001',
        };
      }

      // Map order to exchange format
      const exchangePayload = this.mapOrderToExchangeFormat(order, ipAddress);

      // Submit to exchange API (mocked for now)
      const exchangeRefNo = await this.callExchangeApi(exchangePayload);

      // Log with IP/date/time stamps
      this.logSubmission(order, exchangeRefNo, ipAddress, traceId);

      return {
        success: true,
        exchangeRefNo,
        submittedAt: new Date(),
        traceId,
      };
    } catch (error: any) {
      return {
        success: false,
        submittedAt: new Date(),
        traceId,
        error: error.message || 'Exchange submission failed',
        errorCode: 'EXCH-ERR-001',
      };
    }
  }

  async getStatus(orderId: string): Promise<OrderStatus> {
    try {
      // In real implementation, this would call exchange status API
      // For now, return mock status
      return {
        orderId,
        status: 'Pending',
        lastUpdated: new Date(),
        exchangeRefNo: `EXCH-${orderId}`,
      };
    } catch (error: any) {
      throw new Error(`Failed to get status: ${error.message}`);
    }
  }

  async cancelOrder(orderId: string, reason: string): Promise<CancelResponse> {
    try {
      // Check if order can be cancelled
      const status = await this.getStatus(orderId);
      if (status.status === 'Executed' || status.status === 'Settled') {
        return {
          success: false,
          cancelledAt: new Date(),
          reason,
          error: `Order cannot be cancelled. Current status: ${status.status}`,
        };
      }

      // Cancel order via exchange API (mocked)
      await this.callExchangeCancelApi(orderId, reason);

      return {
        success: true,
        cancelledAt: new Date(),
        reason,
      };
    } catch (error: any) {
      return {
        success: false,
        cancelledAt: new Date(),
        reason,
        error: error.message || 'Cancellation failed',
      };
    }
  }

  private getExchangeSupportedSchemes(): string[] {
    // In real implementation, this would come from configuration or master data
    return ['Exchange Scheme A', 'Exchange Scheme B'];
  }

  private mapOrderToExchangeFormat(order: Order, ipAddress: string): any {
    const now = new Date();
    const date = this.formatDate(now); // DDMMYYYY
    const time = this.formatTime(now); // hhmmss

    return {
      modelOrderId: order.modelOrderId,
      clientId: order.clientId,
      items: order.cartItems.map(item => ({
        schemeCode: item.schemeName,
        transactionType: item.transactionType,
        amount: item.amount,
        units: item.units,
      })),
      bankDetails: order.settlementAccount,
      investorDetails: {
        clientId: order.clientId,
      },
      metadata: {
        ipAddress,
        date,
        time,
        traceId: order.traceId,
      },
    };
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}${minutes}${seconds}`;
  }

  private async callExchangeApi(payload: any): Promise<string> {
    // Mock implementation - in real scenario, this would make HTTP call to exchange API
    // Use randomUUID for better uniqueness in concurrent scenarios
    const { randomUUID } = await import('crypto');
    const uuid = randomUUID();
    return `EXCH-${Date.now()}-${uuid.substring(0, 9)}`;
  }

  private async callExchangeCancelApi(orderId: string, reason: string): Promise<void> {
    // Mock implementation
    return Promise.resolve();
  }

  private logSubmission(order: Order, exchangeRefNo: string, ipAddress: string, traceId: string): void {
    const now = new Date();
    const date = this.formatDate(now);
    const time = this.formatTime(now);

    console.log(JSON.stringify({
      event: 'exchange_order_submitted',
      orderId: order.id,
      modelOrderId: order.modelOrderId,
      exchangeRefNo,
      ipAddress,
      date,
      time,
      traceId,
      timestamp: now.toISOString(),
    }));
  }

  // Method to set health status for testing
  setHealthStatus(healthy: boolean): void {
    this.isHealthy = healthy;
  }
}

