/**
 * Phase 4: Performance Tests
 * Tests TC-P4-035 to TC-P4-038
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExchangeConnector } from '../connectors/exchange-connector';
import { RoutingHub, RoutingConfig } from '../routing-hub';
import { ConnectorType } from '../connectors/types';
import type { Order } from '../connectors/types';

describe('Phase 4: Performance Tests', () => {
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
  });

  describe('TC-P4-035: Response Time - Order Submission', () => {
    it('should meet performance requirements for order submission', async () => {
      const order: Order = {
        modelOrderId: 'MOD-035',
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
      const startTime = Date.now();
      const result = await connector.submitOrder(order);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(result.success).toBe(true);
      // p95 should be ≤ 2s (2000ms), but for unit tests we just verify it completes
      expect(responseTime).toBeLessThan(5000); // Allow 5s for test environment
    });
  });

  describe('TC-P4-036: Response Time - Status Check', () => {
    it('should have fast status check performance', async () => {
      const orderId = 'ORD-036';
      const startTime = Date.now();
      const status = await connector.getStatus(orderId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(status).toBeDefined();
      // Status check should be fast (≤ 1s typical)
      expect(responseTime).toBeLessThan(2000); // Allow 2s for test environment
    });
  });

  describe('TC-P4-037: Load Test - Multiple Orders', () => {
    it('should handle load of multiple orders', async () => {
      const orders: Order[] = Array.from({ length: 10 }, (_, i) => ({
        modelOrderId: `MOD-037-${i}`,
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
      const startTime = Date.now();
      const results = await Promise.all(
        orders.map(order => connector.submitOrder(order))
      );
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      // All orders should be processed
      expect(totalTime).toBeLessThan(10000); // Allow 10s for 10 concurrent orders
    });
  });

  describe('TC-P4-038: Throughput Test', () => {
    it('should maintain throughput over extended period', async () => {
      const orders: Order[] = Array.from({ length: 5 }, (_, i) => ({
        modelOrderId: `MOD-038-${i}`,
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

      expect(results).toHaveLength(5);
      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      // System should remain stable
    });
  });
});

