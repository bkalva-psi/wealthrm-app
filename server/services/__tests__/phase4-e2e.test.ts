/**
 * Phase 4: End-to-End Tests
 * Tests TC-P4-048 to TC-P4-051
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExchangeConnector } from '../connectors/exchange-connector';
import { RoutingHub, RoutingConfig } from '../routing-hub';
import { ConnectorType } from '../connectors/types';
import type { Order } from '../connectors/types';

describe('Phase 4: End-to-End Tests', () => {
  let connector: ExchangeConnector;
  let routingHub: RoutingHub;
  const mockConfig = {
    exchangeApiUrl: 'https://exchange.test.com/api',
    exchangeApiKey: 'test-api-key',
  };

  beforeEach(() => {
    connector = new ExchangeConnector(mockConfig);
    const config: RoutingConfig = {
      rules: [
        {
          priority: 10,
          scheme: 'Exchange Scheme A',
          preferredConnector: ConnectorType.EXCHANGE,
          fallbackConnector: ConnectorType.RTA,
        },
      ],
      defaultConnector: ConnectorType.RTA,
    };
    routingHub = new RoutingHub(connector, config);

    // Set up mock RTA connector
    const mockRtaConnector = {
      async submitOrder(order: Order) {
        return {
          success: true,
          rtaRefNo: `RTA-${Date.now()}`,
          submittedAt: new Date(),
          traceId: order.traceId || 'trace-rta',
        };
      },
      async validateOrder() {
        return { isValid: true, errors: [], warnings: [] };
      },
      async getStatus() {
        return { orderId: 'test', status: 'Pending', lastUpdated: new Date() };
      },
      async cancelOrder() {
        return { success: true, cancelledAt: new Date(), reason: 'test' };
      },
      getConnectorType() {
        return ConnectorType.RTA;
      },
      async isAvailable() {
        return true;
      },
    };
    routingHub.setRtaConnector(mockRtaConnector as any);
  });

  describe('TC-P4-048: E2E - Complete Order Flow via Exchange', () => {
    it('should complete full order flow from submission to settlement', async () => {
      // Step 1: Create order
      const order: Order = {
        modelOrderId: 'MOD-048',
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
        traceId: 'trace-048',
      };

      // Step 2: Submit through routing hub
      connector.setHealthStatus(true);
      const routeResult = await routingHub.routeOrder(order);
      expect(routeResult.success).toBe(true);
      expect(routeResult.exchangeRefNo).toBeDefined();

      // Step 3: Verify exchange reference persisted
      const exchangeRefNo = routeResult.exchangeRefNo;
      expect(exchangeRefNo).toMatch(/^EXCH-/);

      // Step 4: Check status
      const status = await connector.getStatus(exchangeRefNo || 'test');
      expect(status).toBeDefined();
      expect(status.exchangeRefNo).toBeDefined();

      // Complete E2E flow verified
    });
  });

  describe('TC-P4-049: E2E - Exchange Route with Fallback to RTA', () => {
    it('should fallback to RTA when exchange unavailable', async () => {
      const order: Order = {
        modelOrderId: 'MOD-049',
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

      // Exchange unavailable
      connector.setHealthStatus(false);
      const result = await routingHub.routeOrder(order);

      expect(result.success).toBe(true);
      expect(result.rtaRefNo).toBeDefined();
      expect(result.exchangeRefNo).toBeUndefined();
    });
  });

  describe('TC-P4-050: E2E - Multiple Routes Concurrent', () => {
    it('should handle orders via different routes concurrently', async () => {
      const exchangeOrder: Order = {
        modelOrderId: 'MOD-050A',
        clientId: 3,
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

      const rtaOrder: Order = {
        modelOrderId: 'MOD-050B',
        clientId: 4,
        cartItems: [
          {
            productId: 2,
            schemeName: 'RTA Scheme',
            transactionType: 'Redemption',
            amount: 40000,
          },
        ],
        optOutOfNomination: true,
      };

      connector.setHealthStatus(true);
      const results = await Promise.all([
        routingHub.routeOrder(exchangeOrder),
        routingHub.routeOrder(rtaOrder),
      ]);

      // Exchange order should go to exchange
      expect(results[0].success).toBe(true);
      expect(results[0].exchangeRefNo).toBeDefined();

      // RTA order should go to RTA
      expect(results[1].success).toBe(true);
      expect(results[1].rtaRefNo).toBeDefined();
    });
  });

  describe('TC-P4-051: E2E - Order Status Synchronization', () => {
    it('should synchronize order status across systems', async () => {
      const order: Order = {
        modelOrderId: 'MOD-051',
        clientId: 5,
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

      connector.setHealthStatus(true);
      const submitResult = await connector.submitOrder(order);
      expect(submitResult.success).toBe(true);
      expect(submitResult.exchangeRefNo).toBeDefined();

      // Status should be retrievable
      const status = await connector.getStatus(submitResult.exchangeRefNo || 'test');
      expect(status.orderId).toBeDefined();
      expect(status.status).toBeDefined();
      expect(status.lastUpdated).toBeInstanceOf(Date);
    });
  });
});

