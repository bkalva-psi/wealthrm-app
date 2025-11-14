/**
 * Routing Hub
 * Phase 4: Multi-Route Expansion
 * Orchestrates order routing to appropriate connector (RTA or Exchange)
 */

import { IConnector, ConnectorType, ConnectorResponse, Order } from './connectors/types';
import { ExchangeConnector } from './connectors/exchange-connector';
import { randomUUID } from 'crypto';

export interface RoutingRule {
  priority: number;
  scheme?: string;
  transactionType?: string;
  preferredConnector: ConnectorType;
  fallbackConnector?: ConnectorType;
}

export interface RoutingConfig {
  rules: RoutingRule[];
  defaultConnector: ConnectorType;
}

export class RoutingHub {
  private exchangeConnector: ExchangeConnector;
  private rtaConnector: IConnector | null = null; // RTA connector would be implemented separately
  private config: RoutingConfig;

  constructor(
    exchangeConnector: ExchangeConnector,
    config: RoutingConfig
  ) {
    this.exchangeConnector = exchangeConnector;
    this.config = config;
  }

  async routeOrder(order: Order): Promise<ConnectorResponse> {
    const traceId = order.traceId || randomUUID();
    const selectedConnector = await this.selectConnector(order);
    const routeReason = this.getRouteReason(order, selectedConnector);

    // Log routing decision
    this.logRoutingDecision(order, selectedConnector, routeReason, traceId);

    // Submit order through selected connector
    const orderWithTrace = { ...order, traceId };
    return await selectedConnector.submitOrder(orderWithTrace);
  }

  private async selectConnector(order: Order): Promise<IConnector> {
    // Evaluate rules in priority order
    for (const rule of this.config.rules.sort((a, b) => b.priority - a.priority)) {
      if (this.ruleMatches(order, rule)) {
        const preferred = rule.preferredConnector === ConnectorType.EXCHANGE
          ? this.exchangeConnector
          : this.rtaConnector;

        if (preferred) {
          // Check availability
          const isAvailable = await preferred.isAvailable();
          if (isAvailable) {
            return preferred;
          }

          // Fallback if preferred unavailable
          if (rule.fallbackConnector) {
            const fallback = rule.fallbackConnector === ConnectorType.EXCHANGE
              ? this.exchangeConnector
              : this.rtaConnector;

            if (fallback && await fallback.isAvailable()) {
              return fallback;
            }
          }
        }
      }
    }

    // Default connector
    const defaultConnector = this.config.defaultConnector === ConnectorType.EXCHANGE
      ? this.exchangeConnector
      : this.rtaConnector;

    if (!defaultConnector) {
      throw new Error('No available connector found');
    }

    return defaultConnector;
  }

  private ruleMatches(order: Order, rule: RoutingRule): boolean {
    // Check scheme match
    if (rule.scheme) {
      const orderSchemes = order.cartItems.map(item => item.schemeName);
      if (!orderSchemes.includes(rule.scheme)) {
        return false;
      }
    }

    // Check transaction type match
    if (rule.transactionType) {
      const orderTypes = order.cartItems.map(item => item.transactionType);
      if (!orderTypes.includes(rule.transactionType)) {
        return false;
      }
    }

    return true;
  }

  private getRouteReason(order: Order, connector: IConnector): string {
    const connectorType = connector.getConnectorType();
    const scheme = order.cartItems[0]?.schemeName;
    const transactionType = order.cartItems[0]?.transactionType;

    if (connectorType === ConnectorType.EXCHANGE) {
      return `Exchange route selected for scheme: ${scheme}, transaction: ${transactionType}`;
    } else {
      return `RTA route selected (fallback or default)`;
    }
  }

  private logRoutingDecision(
    order: Order,
    connector: IConnector,
    reason: string,
    traceId: string
  ): void {
    console.log(JSON.stringify({
      event: 'routing_decision',
      orderId: order.id,
      modelOrderId: order.modelOrderId,
      connectorType: connector.getConnectorType(),
      reason,
      traceId,
      timestamp: new Date().toISOString(),
    }));
  }

  setRtaConnector(connector: IConnector): void {
    this.rtaConnector = connector;
  }

  updateConfig(config: RoutingConfig): void {
    this.config = config;
  }
}

