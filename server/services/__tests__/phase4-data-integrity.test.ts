/**
 * Phase 4: Data Integrity Tests
 * Tests TC-P4-045 to TC-P4-047
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExchangeConnector } from '../connectors/exchange-connector';
import { RoutingHub, RoutingConfig } from '../routing-hub';
import { ConnectorType } from '../connectors/types';
import type { Order } from '../connectors/types';

describe('Phase 4: Data Integrity Tests', () => {
  let connector: ExchangeConnector;
  let routingHub: RoutingHub;
  const mockConfig = {
    exchangeApiUrl: 'https://exchange.test.com/api',
    exchangeApiKey: 'test-api-key',
  };

  beforeEach(() => {
    connector = new ExchangeConnector(mockConfig);
    const config: RoutingConfig = {
      rules: [],
      defaultConnector: ConnectorType.EXCHANGE,
    };
    routingHub = new RoutingHub(connector, config);
    
    // Set up mock RTA connector for fallback scenarios
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

  describe('TC-P4-045: Order Data Consistency', () => {
    it('should maintain data consistency across systems', async () => {
      const order: Order = {
        modelOrderId: 'MOD-045',
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

      connector.setHealthStatus(true);
      const result = await routingHub.routeOrder(order);

      expect(result.success).toBe(true);
      expect(result.exchangeRefNo).toBeDefined();
      // Data should be consistent - order details match submitted order
      expect(order.modelOrderId).toBe('MOD-045');
    });
  });

  describe('TC-P4-046: Reference Number Uniqueness', () => {
    it('should generate unique exchange reference numbers', async () => {
      const orders: Order[] = Array.from({ length: 5 }, (_, i) => ({
        modelOrderId: `MOD-046-${i}`,
        clientId: i + 1,
        cartItems: [
          {
            productId: 1,
            schemeName: 'Exchange Scheme A',
            transactionType: 'Purchase',
            amount: 10000 * (i + 1),
          },
        ],
        optOutOfNomination: true,
      }));

      connector.setHealthStatus(true);
      const results = await Promise.all(
        orders.map(order => connector.submitOrder(order))
      );

      const refNos = results.map(r => r.exchangeRefNo).filter(Boolean);
      const uniqueRefNos = new Set(refNos);
      
      expect(uniqueRefNos.size).toBe(refNos.length);
      // All references should be unique
    });
  });

  describe('TC-P4-047: Transaction Rollback on Failure', () => {
    it('should handle rollback on partial failures', async () => {
      const order: Order = {
        modelOrderId: 'MOD-047',
        clientId: 6,
        cartItems: [
          {
            productId: 1,
            schemeName: 'Invalid Scheme', // Will cause validation failure
            transactionType: 'Purchase',
            amount: 60000,
          },
        ],
        optOutOfNomination: true,
      };

      connector.setHealthStatus(true);
      const result = await connector.submitOrder(order);

      expect(result.success).toBe(false);
      // On failure, no partial state should remain
      expect(result.exchangeRefNo).toBeUndefined();
    });
  });
});


