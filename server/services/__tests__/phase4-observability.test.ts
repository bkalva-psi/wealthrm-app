/**
 * Phase 4: Observability & Monitoring Tests
 * Tests TC-P4-052 to TC-P4-055
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExchangeConnector } from '../connectors/exchange-connector';
import { RoutingHub, RoutingConfig } from '../routing-hub';
import { ConnectorType } from '../connectors/types';
import type { Order } from '../connectors/types';

describe('Phase 4: Observability & Monitoring Tests', () => {
  let connector: ExchangeConnector;
  let routingHub: RoutingHub;
  const mockConfig = {
    exchangeApiUrl: 'https://exchange.test.com/api',
    exchangeApiKey: 'test-api-key',
  };

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    connector = new ExchangeConnector(mockConfig);
    const config: RoutingConfig = {
      rules: [],
      defaultConnector: ConnectorType.EXCHANGE,
    };
    routingHub = new RoutingHub(connector, config);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('TC-P4-052: Structured Logging', () => {
    it('should log operations in structured format', async () => {
      const order: Order = {
        modelOrderId: 'MOD-052',
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
        traceId: 'trace-052',
      };

      connector.setHealthStatus(true);
      await connector.submitOrder(order);

      // Verify structured logging occurred (via console.log spy)
      expect(console.log).toHaveBeenCalled();
      const logCall = vi.mocked(console.log).mock.calls.find(call => 
        call[0] && typeof call[0] === 'string' && call[0].includes('exchange_order_submitted')
      );
      expect(logCall).toBeDefined();
    });
  });

  describe('TC-P4-053: Error Code Standardization', () => {
    it('should use standardized error codes', async () => {
      const order: Order = {
        modelOrderId: 'MOD-053',
        clientId: 2,
        cartItems: [
          {
            productId: 1,
            schemeName: 'Invalid Scheme',
            transactionType: 'Purchase',
            amount: 20000,
          },
        ],
        optOutOfNomination: true,
      };

      connector.setHealthStatus(true);
      const result = await connector.submitOrder(order);

      expect(result.success).toBe(false);
      // Error codes should follow standard format
      if (result.errorCode) {
        expect(result.errorCode).toMatch(/^EXCH-/);
      }
    });
  });

  describe('TC-P4-054: Metrics Collection', () => {
    it('should support metrics collection', async () => {
      const order: Order = {
        modelOrderId: 'MOD-054',
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

      connector.setHealthStatus(true);
      const result = await connector.submitOrder(order);

      expect(result.success).toBe(true);
      // Metrics should be collectible (traceId, timestamps, etc.)
      expect(result.traceId).toBeDefined();
      expect(result.submittedAt).toBeInstanceOf(Date);
    });
  });

  describe('TC-P4-055: Health Check Endpoint', () => {
    it('should support health check functionality', async () => {
      // Test availability check
      connector.setHealthStatus(true);
      const available = await connector.isAvailable();
      expect(available).toBe(true);

      connector.setHealthStatus(false);
      const unavailable = await connector.isAvailable();
      expect(unavailable).toBe(false);
    });
  });
});

