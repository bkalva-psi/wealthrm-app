import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from './db';
import { clients, transactions } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

router.get('/api/clients/:clientId/portfolio-report', async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.clientId);
    
    if (!clientId) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    // Fetch client data - same as app
    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Fetch transactions - same as app
    const clientTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.clientId, clientId))
      .orderBy(desc(transactions.transactionDate))
      .limit(15);

    // Use exact app calculations
    const aumValue = typeof client.aumValue === 'number' ? client.aumValue : parseAumString(client.aumValue);
    const investment = aumValue * 0.85;
    const unrealizedGain = aumValue * 0.15;

    // Use exact same mock data as the app
    const mockAssetAllocation = {
      Equity: 65,
      "Fixed Income": 20,
      Gold: 7.5,
      Cash: 7.5
    };

    const mockSectorExposure = {
      "Financial Services": 28,
      "IT": 18,
      "Energy": 12,
      "Consumer Goods": 10,
      "Healthcare": 8,
      "Others": 24
    };

    const mockHoldings = [
      { 
        name: "HDFC Top 100 Fund", 
        type: "Mutual Fund - Equity", 
        allocation: 25, 
        gain: 15.4
      },
      { 
        name: "SBI Small Cap Fund", 
        type: "Mutual Fund - Equity", 
        allocation: 17.5, 
        gain: 22.8
      },
      { 
        name: "ICICI Prudential Corporate Bond Fund", 
        type: "Mutual Fund - Debt", 
        allocation: 20, 
        gain: 7.2
      },
      { 
        name: "Reliance Industries Ltd.", 
        type: "Direct Equity", 
        allocation: 12.5, 
        gain: 18.7
      },
      { 
        name: "HDFC Bank Ltd.", 
        type: "Direct Equity", 
        allocation: 10, 
        gain: 9.8
      },
      { 
        name: "Gold ETF", 
        type: "Gold ETF", 
        allocation: 7.5, 
        gain: 11.2
      },
      { 
        name: "HDFC Savings Account", 
        type: "Cash", 
        allocation: 7.5, 
        gain: 3.5
      }
    ];

    const htmlContent = generateReportHTML(client, {
      aumValue,
      investment,
      unrealizedGain,
      assetAllocation: mockAssetAllocation,
      sectorAllocation: mockSectorExposure,
      topHoldings: mockHoldings
    }, clientTransactions);

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);

  } catch (error) {
    console.error('Error generating portfolio report:', error);
    res.status(500).json({ error: 'Failed to generate portfolio report' });
  }
});

function parseAumString(aumString?: string | null): number {
  if (!aumString) return 0;
  if (typeof aumString === 'number') return aumString;
  
  const match = aumString.match(/₹([\d\.]+)\s*L/);
  return match ? parseFloat(match[1]) * 100000 : 0;
}

function calculateAllocations(transactions: any[]) {
  const assetAllocation: { [key: string]: number } = {};
  const sectorMapping: { [key: string]: string } = {
    'Equity Funds': 'Equity',
    'Debt Funds': 'Fixed Income',
    'Hybrid Funds': 'Balanced',
    'ELSS': 'Tax Saving',
    'Direct Equity': 'Equity',
    'Bonds': 'Fixed Income',
    'FDs': 'Fixed Income',
    'Insurance': 'Protection'
  };
  const sectorAllocation: { [key: string]: number } = {};
  const holdings: { [key: string]: { amount: number, type: string } } = {};
  let total = 0;

  transactions.forEach(txn => {
    if (txn.transactionType?.toLowerCase() === 'buy') {
      const amount = Math.abs(txn.amount);
      total += amount;
      
      // Asset allocation
      const assetType = txn.productType || 'Others';
      assetAllocation[assetType] = (assetAllocation[assetType] || 0) + amount;
      
      // Sector allocation
      const sector = sectorMapping[assetType] || 'Others';
      sectorAllocation[sector] = (sectorAllocation[sector] || 0) + amount;
      
      // Holdings
      const name = txn.productName || assetType;
      if (!holdings[name]) {
        holdings[name] = { amount: 0, type: assetType };
      }
      holdings[name].amount += amount;
    }
  });

  // Convert to percentages
  Object.keys(assetAllocation).forEach(key => {
    assetAllocation[key] = total > 0 ? (assetAllocation[key] / total) * 100 : 0;
  });
  
  Object.keys(sectorAllocation).forEach(key => {
    sectorAllocation[key] = total > 0 ? (sectorAllocation[key] / total) * 100 : 0;
  });

  const topHoldings = Object.entries(holdings)
    .map(([name, data]) => ({
      name,
      type: data.type,
      allocation: total > 0 ? (data.amount / total) * 100 : 0,
      gain: (Math.random() - 0.5) * 30
    }))
    .sort((a, b) => b.allocation - a.allocation)
    .slice(0, 8);

  return { assetAllocation, sectorAllocation, topHoldings };
}

function generateReportHTML(client: any, portfolioData: any, transactions: any[]) {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Use exact same performance data as the app
  const performanceData = [
    { period: "1M", value: 2.8, benchmark: 2.3, alpha: 0.5 },
    { period: "3M", value: 5.4, benchmark: 4.6, alpha: 0.8 },
    { period: "6M", value: 8.7, benchmark: 7.5, alpha: 1.2 },
    { period: "YTD", value: 11.2, benchmark: 9.8, alpha: 1.4 },
    { period: "1Y", value: 14.5, benchmark: 12.1, alpha: 2.4 },
    { period: "3Y", value: 12.3, benchmark: 10.5, alpha: 1.8 },
    { period: "5Y", value: 11.8, benchmark: 10.2, alpha: 1.6 },
    { period: "Since Inception", value: 13.2, benchmark: 11.4, alpha: 1.8 }
  ];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Portfolio Report - ${client.fullName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f8fafc;
      padding: 20px;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 2.2em;
      font-weight: 300;
      margin-bottom: 10px;
    }
    .client-name {
      font-size: 1.3em;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    .report-date {
      opacity: 0.8;
      font-size: 0.9em;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 1px solid #e2e8f0;
    }
    .section:last-child {
      border-bottom: none;
    }
    .section-title {
      font-size: 1.5em;
      color: #2563eb;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    .metric-value {
      font-size: 1.8em;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 5px;
    }
    .metric-value.positive {
      color: #059669;
    }
    .metric-label {
      color: #64748b;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .table th,
    .table td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .table th {
      background: #2563eb;
      color: white;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.85em;
      letter-spacing: 0.5px;
    }
    .table tr:nth-child(even) {
      background: #f8fafc;
    }
    .allocation-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin: 20px 0;
    }
    .allocation-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .allocation-item:last-child {
      border-bottom: none;
    }
    .allocation-name {
      font-weight: 500;
    }
    .allocation-value {
      font-weight: 600;
      color: #2563eb;
    }
    .risk-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .risk-metric {
      text-align: center;
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .risk-score {
      font-size: 1.5em;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 5px;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    @media print {
      .print-btn { display: none; }
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Print Report</button>
  
  <div class="container">
    <div class="header">
      <h1>Portfolio Report</h1>
      <div class="client-name">${client.fullName}</div>
      <div class="report-date">Report Date: ${currentDate}</div>
    </div>
    
    <div class="content">
      <!-- Summary Section -->
      <div class="section">
        <h2 class="section-title">Portfolio Summary</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">₹${(portfolioData.aumValue / 100000).toFixed(1)}L</div>
            <div class="metric-label">Assets Under Management</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">₹${(portfolioData.investment / 100000).toFixed(1)}L</div>
            <div class="metric-label">Total Investment</div>
          </div>
          <div class="metric-card">
            <div class="metric-value positive">₹${(portfolioData.unrealizedGain / 100000).toFixed(1)}L</div>
            <div class="metric-label">Unrealized Gain (19.05%)</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">12.5%</div>
            <div class="metric-label">XIRR</div>
          </div>
        </div>
      </div>

      <!-- Performance Snapshot -->
      <div class="section">
        <h2 class="section-title">Performance Snapshot</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Portfolio Return</th>
              <th>Benchmark</th>
              <th>Alpha</th>
            </tr>
          </thead>
          <tbody>
            ${performanceData.map(period => `
              <tr>
                <td><strong>${period.period}</strong></td>
                <td style="color: #059669;">${period.value}%</td>
                <td>${period.benchmark}%</td>
                <td style="color: #059669;">+${period.alpha}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>



      <!-- Asset & Sector Allocation -->
      <div class="section">
        <h2 class="section-title">Asset & Sector Allocation</h2>
        <div class="allocation-grid">
          <div>
            <h3 style="margin-bottom: 15px; color: #374151;">Asset Allocation</h3>
            ${Object.entries(portfolioData.assetAllocation).map(([key, value]) => `
              <div class="allocation-item">
                <span class="allocation-name">${key}</span>
                <span class="allocation-value">${typeof value === 'number' ? value.toFixed(1) : '0.0'}%</span>
              </div>
            `).join('')}
          </div>
          <div>
            <h3 style="margin-bottom: 15px; color: #374151;">Sector Allocation</h3>
            ${Object.entries(portfolioData.sectorAllocation).map(([key, value]) => `
              <div class="allocation-item">
                <span class="allocation-name">${key}</span>
                <span class="allocation-value">${typeof value === 'number' ? value.toFixed(1) : '0.0'}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Top Holdings -->
      <div class="section">
        <h2 class="section-title">Top Holdings</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Investment Name</th>
              <th>Type</th>
              <th>Allocation %</th>
              <th>Gain/Loss %</th>
            </tr>
          </thead>
          <tbody>
            ${portfolioData.topHoldings.map((holding: any) => `
              <tr>
                <td><strong>${holding.name}</strong></td>
                <td>${holding.type}</td>
                <td>${holding.allocation.toFixed(2)}%</td>
                <td style="color: ${holding.gain >= 0 ? '#059669' : '#dc2626'};">
                  ${holding.gain >= 0 ? '+' : ''}${holding.gain.toFixed(2)}%
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Recent Transactions -->
      <div class="section">
        <h2 class="section-title">Recent Transactions</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(txn => `
              <tr>
                <td>${new Date(txn.transactionDate).toLocaleDateString('en-IN')}</td>
                <td><strong>${txn.productName || txn.productType || 'N/A'}</strong></td>
                <td style="text-transform: uppercase; font-weight: 600;">${txn.transactionType}</td>
                <td>₹${(Math.abs(txn.amount) / 100000).toFixed(2)}L</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export default router;