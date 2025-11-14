/**
 * Phase 4: Regression Tests
 * Tests TC-P4-059 to TC-P4-060
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExchangeConnector } from '../connectors/exchange-connector';
import { RoutingHub, RoutingConfig } from '../routing-hub';
import { ConnectorType } from '../connectors/types';
import type { Order } from '../connectors/types';

describe('Phase 4: Regression Tests', () => {
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
      defaultConnector: ConnectorType.RTA,
    };
    routingHub = new RoutingHub(connector, config);
  });

  describe('TC-P4-059: RTA Route Unaffected', () => {
    it('should not affect existing RTA routes', async () => {
      // Create a mock RTA connector
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

      const order: Order = {
        modelOrderId: 'MOD-059',
        clientId: 1,
        cartItems: [
          {
            productId: 1,
            schemeName: 'RTA Scheme',
            transactionType: 'Purchase',
            amount: 10000,
          },
        ],
        optOutOfNomination: true,
      };

      const result = await routingHub.routeOrder(order);

      // RTA route should still work
      expect(result.success).toBe(true);
      expect(result.rtaRefNo).toBeDefined();
    });
  });

  describe('TC-P4-060: Core Flows Unchanged', () => {
    it('should not break core order management flows', async () => {
      const order: Order = {
        modelOrderId: 'MOD-060',
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

      connector.setHealthStatus(true);
      const result = await connector.submitOrder(order);

      // Core submission flow should work
      expect(result.success).toBe(true);
      expect(result.exchangeRefNo).toBeDefined();
      expect(result.submittedAt).toBeInstanceOf(Date);
      expect(result.traceId).toBeDefined();
    });
  });
});


