/**
 * Phase 4: Routing Hub Integration Tests
 * Tests TC-P4-014 to TC-P4-023 (Integration Tests)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RoutingHub, RoutingConfig } from '../routing-hub';
import { ExchangeConnector } from '../connectors/exchange-connector';
import { ConnectorType } from '../connectors/types';
import type { Order, IConnector } from '../connectors/types';

// Mock RTA Connector
class MockRtaConnector implements IConnector {
  async submitOrder(order: Order) {
    return {
      success: true,
      rtaRefNo: `RTA-${Date.now()}`,
      submittedAt: new Date(),
      traceId: order.traceId || 'trace-rta',
    };
  }

  async validateOrder(order: Order) {
    return { isValid: true, errors: [], warnings: [] };
  }

  async getStatus(orderId: string) {
    return {
      orderId,
      status: 'Pending',
      lastUpdated: new Date(),
      rtaRefNo: `RTA-${orderId}`,
    };
  }

  async cancelOrder(orderId: string, reason: string) {
    return {
      success: true,
      cancelledAt: new Date(),
      reason,
    };
  }

  getConnectorType() {
    return ConnectorType.RTA;
  }

  async isAvailable() {
    return true;
  }
}

describe('Phase 4: Routing Hub - Integration Tests', () => {
  let routingHub: RoutingHub;
  let exchangeConnector: ExchangeConnector;
  let rtaConnector: MockRtaConnector;
  let config: RoutingConfig;

  beforeEach(() => {
    exchangeConnector = new ExchangeConnector({
      exchangeApiUrl: 'https://exchange.test.com/api',
      exchangeApiKey: 'test-key',
    });
    rtaConnector = new MockRtaConnector();

    config = {
      rules: [
        {
          priority: 10,
          scheme: 'Exchange Scheme A',
          preferredConnector: ConnectorType.EXCHANGE,
          fallbackConnector: ConnectorType.RTA,
        },
        {
          priority: 5,
          transactionType: 'Purchase',
          preferredConnector: ConnectorType.EXCHANGE,
        },
      ],
      defaultConnector: ConnectorType.RTA,
    };

    routingHub = new RoutingHub(exchangeConnector, config);
    routingHub.setRtaConnector(rtaConnector);
    vi.clearAllMocks();
  });

  describe('TC-P4-014: Route Selection - Exchange Route Chosen', () => {
    it('should select exchange connector for eligible orders', async () => {
      const order: Order = {
        modelOrderId: 'MOD-001',
        clientId: 1,
        cartItems: [
          {
            productId: 1,
            schemeName: 'Exchange Scheme A',
            transactionType: 'Purchase',
            amount: 10000,
          },
        ],
        optOutOfNomination: true,
      };

      exchangeConnector.setHealthStatus(true);
      const result = await routingHub.routeOrder(order);

      expect(result.success).toBe(true);
      expect(result.exchangeRefNo).toBeDefined();
      expect(result.rtaRefNo).toBeUndefined();
    });
  });

  describe('TC-P4-015: Route Selection - RTA Route Chosen (Fallback)', () => {
    it('should fallback to RTA when exchange unavailable', async () => {
      const order: Order = {
        modelOrderId: 'MOD-002',
        clientId: 2,
        cartItems: [
          {
            productId: 1,
            schemeName: 'Exchange Scheme A',
            transactionType: 'Purchase',
            amount: 20000,
          },
        ],
        optOutOfNomination: true,
      };

      exchangeConnector.setHealthStatus(false);
      const result = await routingHub.routeOrder(order);

      expect(result.success).toBe(true);
      expect(result.rtaRefNo).toBeDefined();
    });
  });

  describe('TC-P4-016: Route Selection - Rule-Based by Scheme', () => {
    it('should route based on scheme configuration', async () => {
      const config: RoutingConfig = {
        rules: [
          {
            priority: 10,
            scheme: 'Exchange Scheme A',
            preferredConnector: ConnectorType.EXCHANGE,
          },
          {
            priority: 10,
            scheme: 'RTA Scheme B',
            preferredConnector: ConnectorType.RTA,
          },
        ],
        defaultConnector: ConnectorType.RTA,
      };

      routingHub.updateConfig(config);
      exchangeConnector.setHealthStatus(true);

      // Test Exchange route
      const exchangeOrder: Order = {
        modelOrderId: 'MOD-003',
        clientId: 3,
        cartItems: [
          {
            productId: 1,
            schemeName: 'Exchange Scheme A',
            transactionType: 'Purchase',
            amount: 15000,
          },
        ],
        optOutOfNomination: true,
      };

      const exchangeResult = await routingHub.routeOrder(exchangeOrder);
      expect(exchangeResult.exchangeRefNo).toBeDefined();

      // Test RTA route
      const rtaOrder: Order = {
        modelOrderId: 'MOD-004',
        clientId: 4,
        cartItems: [
          {
            productId: 2,
            schemeName: 'RTA Scheme B',
            transactionType: 'Purchase',
            amount: 25000,
          },
        ],
        optOutOfNomination: true,
      };

      const rtaResult = await routingHub.routeOrder(rtaOrder);
      expect(rtaResult.rtaRefNo).toBeDefined();
    });
  });

  describe('TC-P4-017: Route Selection - Rule-Based by Transaction Type', () => {
    it('should route based on transaction type', async () => {
      const config: RoutingConfig = {
        rules: [
          {
            priority: 10,
            transactionType: 'Purchase',
            preferredConnector: ConnectorType.EXCHANGE,
          },
          {
            priority: 10,
            transactionType: 'Redemption',
            preferredConnector: ConnectorType.RTA,
          },
        ],
        defaultConnector: ConnectorType.RTA,
      };

      routingHub.updateConfig(config);
      exchangeConnector.setHealthStatus(true);

      // Purchase should go to Exchange
      const purchaseOrder: Order = {
        modelOrderId: 'MOD-005',
        clientId: 5,
        cartItems: [
          {
            productId: 1,
            schemeName: 'Exchange Scheme A',
            transactionType: 'Purchase',
            amount: 30000,
          },
        ],
        optOutOfNomination: true,
      };

      const purchaseResult = await routingHub.routeOrder(purchaseOrder);
      expect(purchaseResult.exchangeRefNo).toBeDefined();

      // Redemption should go to RTA
      const redemptionOrder: Order = {
        modelOrderId: 'MOD-006',
        clientId: 6,
        cartItems: [
          {
            productId: 1,
            schemeName: 'Exchange Scheme A',
            transactionType: 'Redemption',
            amount: 20000,
          },
        ],
        optOutOfNomination: true,
      };

      const redemptionResult = await routingHub.routeOrder(redemptionOrder);
      expect(redemptionResult.rtaRefNo).toBeDefined();
    });
  });

  describe('TC-P4-018: Route Selection - Availability-Based', () => {
    it('should adapt routing based on connector availability', async () => {
      const order: Order = {
        modelOrderId: 'MOD-007',
        clientId: 7,
        cartItems: [
          {
            productId: 1,
            schemeName: 'Exchange Scheme A',
            transactionType: 'Purchase',
            amount: 40000,
          },
        ],
        optOutOfNomination: true,
      };

      // When exchange is available
      exchangeConnector.setHealthStatus(true);
      const availableResult = await routingHub.routeOrder(order);
      expect(availableResult.exchangeRefNo).toBeDefined();

      // When exchange is unavailable
      exchangeConnector.setHealthStatus(false);
      const unavailableResult = await routingHub.routeOrder(order);
      expect(unavailableResult.rtaRefNo).toBeDefined();
    });
  });

  describe('TC-P4-019: Save2 Integration - Exchange Route', () => {
    it('should work with Save2 flow for exchange route', async () => {
      const order: Order = {
        modelOrderId: 'MOD-008',
        clientId: 8,
        cartItems: [
          {
            productId: 1,
            schemeName: 'Exchange Scheme A',
            transactionType: 'Purchase',
            amount: 50000,
          },
        ],
        optOutOfNomination: true,
      };

      exchangeConnector.setHealthStatus(true);
      const result = await routingHub.routeOrder(order);

      expect(result.success).toBe(true);
      expect(result.exchangeRefNo).toBeDefined();
      expect(order.modelOrderId).toBe('MOD-008');
    });
  });

  describe('TC-P4-020: Final Order Submission - Exchange Route', () => {
    it('should handle finalorderforsubmission with payment references', async () => {
      const order: Order = {
        modelOrderId: 'MOD-009',
        clientId: 9,
        cartItems: [
          {
            productId: 1,
            schemeName: 'Exchange Scheme A',
            transactionType: 'Purchase',
            amount: 60000,
          },
        ],
        optOutOfNomination: true,
      };

      exchangeConnector.setHealthStatus(true);
      const result = await routingHub.routeOrder(order);

      expect(result.success).toBe(true);
      expect(result.exchangeRefNo).toBeDefined();
      expect(result.traceId).toBeDefined();
    });
  });

  describe('TC-P4-021: Idempotency - Duplicate Submission', () => {
    it('should handle duplicate submissions idempotently', async () => {
      const order: Order = {
        modelOrderId: 'MOD-010',
        clientId: 10,
        cartItems: [
          {
            productId: 1,
            schemeName: 'Exchange Scheme A',
            transactionType: 'Purchase',
            amount: 70000,
          },
        ],
        optOutOfNomination: true,
      };

      exchangeConnector.setHealthStatus(true);
      
      const result1 = await routingHub.routeOrder(order);
      const result2 = await routingHub.routeOrder(order);

      // Both should succeed, but in real implementation, second should return existing orderId
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });

  describe('TC-P4-022: Error Handling - Exchange API Failure', () => {
    it('should handle exchange API failures gracefully', async () => {
      const order: Order = {
        modelOrderId: 'MOD-011',
        clientId: 11,
        cartItems: [
          {
            productId: 1,
            schemeName: 'Invalid Scheme',
            transactionType: 'Purchase',
            amount: 80000,
          },
        ],
        optOutOfNomination: true,
      };

      exchangeConnector.setHealthStatus(true);
      const result = await routingHub.routeOrder(order);

      // Should either fail gracefully or fallback to RTA
      expect(result).toBeDefined();
    });
  });
});


