import { Router, Request, Response } from 'express';
import { db } from './db';
import { clients, transactions, prospects } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// Simple authentication check
const authMiddleware = (req: Request, res: Response, next: Function) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// AUM Breakdown by Asset Class
router.get('/api/business-metrics/:userId/aum/asset-class', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.session.user.id;

    const assetClassBreakdown = await db
      .select({
        category: sql<string>`
          case 
            when ${transactions.productType} = 'equity' then 'Equity'
            when ${transactions.productType} = 'mutual_fund' then 'Mutual Funds'
            when ${transactions.productType} = 'debt' then 'Fixed Income'
            when ${transactions.productType} = 'bond' then 'Fixed Income'
            else 'Others'
          end
        `,
        value: sql<number>`sum(${transactions.amount})`,
        percentage: sql<number>`25`
      })
      .from(transactions)
      .innerJoin(clients, eq(transactions.clientId, clients.id))
      .where(eq(clients.assignedTo, userId))
      .groupBy(sql`
        case 
          when ${transactions.productType} = 'equity' then 'Equity'
          when ${transactions.productType} = 'mutual_fund' then 'Mutual Funds'
          when ${transactions.productType} = 'debt' then 'Fixed Income'
          when ${transactions.productType} = 'bond' then 'Fixed Income'
          else 'Others'
        end
      `);

    res.json(assetClassBreakdown);
  } catch (error) {
    console.error("Error fetching asset class breakdown:", error);
    res.status(500).json({ error: "Failed to fetch asset class breakdown" });
  }
});

// Client Breakdown by Tier
router.get('/api/business-metrics/:userId/clients/tier', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.session.user.id;

    const tierBreakdown = await db
      .select({
        category: sql<string>`upper(${clients.tier})`,
        value: sql<number>`count(*)`,
        percentage: sql<number>`30`
      })
      .from(clients)
      .where(eq(clients.assignedTo, userId))
      .groupBy(clients.tier);

    res.json(tierBreakdown);
  } catch (error) {
    console.error("Error fetching tier breakdown:", error);
    res.status(500).json({ error: "Failed to fetch tier breakdown" });
  }
});

// Client Breakdown by Risk Profile
router.get('/api/business-metrics/:userId/clients/risk-profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.session.user.id;

    const riskProfileBreakdown = await db
      .select({
        category: sql<string>`upper(${clients.riskProfile})`,
        value: sql<number>`count(*)`,
        percentage: sql<number>`35`
      })
      .from(clients)
      .where(eq(clients.assignedTo, userId))
      .groupBy(clients.riskProfile);

    res.json(riskProfileBreakdown);
  } catch (error) {
    console.error("Error fetching risk profile breakdown:", error);
    res.status(500).json({ error: "Failed to fetch risk profile breakdown" });
  }
});

// Revenue Breakdown by Product Type
router.get('/api/business-metrics/:userId/revenue/product-type', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.session.user.id;

    const revenueBreakdown = await db
      .select({
        category: sql<string>`upper(${transactions.productType})`,
        value: sql<number>`sum(${transactions.fees})`,
        percentage: sql<number>`40`
      })
      .from(transactions)
      .innerJoin(clients, eq(transactions.clientId, clients.id))
      .where(eq(clients.assignedTo, userId))
      .groupBy(transactions.productType);

    res.json(revenueBreakdown);
  } catch (error) {
    console.error("Error fetching revenue breakdown:", error);
    res.status(500).json({ error: "Failed to fetch revenue breakdown" });
  }
});

// Pipeline Breakdown by Stage
router.get('/api/business-metrics/:userId/pipeline/stage', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.session.user.id;

    const pipelineBreakdown = await db
      .select({
        category: sql<string>`upper(${prospects.stage})`,
        value: sql<number>`sum(${prospects.potentialAumValue})`,
        count: sql<number>`count(*)`,
        percentage: sql<number>`20`
      })
      .from(prospects)
      .where(eq(prospects.assignedTo, userId))
      .groupBy(prospects.stage);

    res.json(pipelineBreakdown);
  } catch (error) {
    console.error("Error fetching pipeline breakdown:", error);
    res.status(500).json({ error: "Failed to fetch pipeline breakdown" });
  }
});

export default router;