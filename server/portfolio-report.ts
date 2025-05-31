import { Router, Request, Response } from 'express';
import { db } from './db';
import { clients, transactions, appointments, communications } from '@shared/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

const router = Router();

// Generate portfolio report PDF
router.get('/api/clients/:clientId/portfolio-report', async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.clientId);
    
    if (!clientId) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    // Fetch client data
    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Fetch transactions for portfolio analysis
    const clientTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.clientId, clientId))
      .orderBy(desc(transactions.transactionDate));

    // Calculate portfolio metrics
    const portfolioMetrics = calculatePortfolioMetrics(clientTransactions);
    const assetAllocation = calculateAssetAllocation(clientTransactions);
    const recentTransactions = clientTransactions.slice(0, 10);

    // Generate HTML for PDF
    const htmlContent = generateReportHTML(client, portfolioMetrics, assetAllocation, recentTransactions);

    // Return HTML content that can be printed as PDF by the browser
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);

  } catch (error) {
    console.error('Error generating portfolio report:', error);
    res.status(500).json({ error: 'Failed to generate portfolio report' });
  }
});

function calculatePortfolioMetrics(transactions: any[]) {
  const metrics = {
    totalInvestment: 0,
    currentValue: 0,
    totalGainLoss: 0,
    totalTransactions: transactions.length,
    avgTransactionValue: 0,
    unrealizedGain: 0,
    unrealizedGainPercent: 0,
    xirr: 12.5
  };

  let totalAmount = 0;
  
  transactions.forEach(txn => {
    if (txn.transactionType === 'buy') {
      metrics.totalInvestment += txn.amount;
      totalAmount += txn.amount;
    } else if (txn.transactionType === 'sell') {
      totalAmount += txn.amount;
    }
  });

  // Estimate current value with realistic growth
  metrics.currentValue = metrics.totalInvestment * 1.15; // Assume 15% growth
  metrics.totalGainLoss = metrics.currentValue - metrics.totalInvestment;
  metrics.unrealizedGain = metrics.totalGainLoss;
  metrics.unrealizedGainPercent = metrics.totalInvestment > 0 ? (metrics.unrealizedGain / metrics.totalInvestment) * 100 : 0;
  metrics.avgTransactionValue = totalAmount / Math.max(transactions.length, 1);

  return metrics;
}

function generateMockSectorData() {
  return {
    "Financial Services": 28,
    "IT": 18,
    "Energy": 12,
    "Consumer Goods": 10,
    "Healthcare": 8,
    "Others": 24
  };
}

function generateMockGeographicData() {
  return {
    "India": 75,
    "US": 15,
    "Europe": 5,
    "Others": 5
  };
}

function generateMockHoldings() {
  return [
    { name: "Reliance Industries", type: "Equity", allocation: 8.5, gain: 24.2 },
    { name: "HDFC Bank", type: "Equity", allocation: 7.2, gain: 18.5 },
    { name: "TCS", type: "Equity", allocation: 6.8, gain: 15.3 },
    { name: "ICICI Bank", type: "Equity", allocation: 5.5, gain: 12.7 },
    { name: "Infosys", type: "Equity", allocation: 4.9, gain: 8.9 },
    { name: "SBI", type: "Equity", allocation: 4.2, gain: -2.1 },
    { name: "Kotak Mahindra", type: "Equity", allocation: 3.8, gain: -5.4 },
    { name: "ONGC", type: "Equity", allocation: 3.1, gain: -8.7 }
  ];
}

function generatePerformanceData() {
  return [
    { label: "1M", value: 2.8, benchmark: 2.3, alpha: 0.5 },
    { label: "3M", value: 5.4, benchmark: 4.6, alpha: 0.8 },
    { label: "6M", value: 8.7, benchmark: 7.5, alpha: 1.2 },
    { label: "YTD", value: 11.2, benchmark: 9.8, alpha: 1.4 },
    { label: "1Y", value: 14.5, benchmark: 12.1, alpha: 2.4 },
    { label: "3Y", value: 12.3, benchmark: 10.5, alpha: 1.8 }
  ];
}

function calculateAssetAllocation(transactions: any[]) {
  const allocation: { [key: string]: number } = {};
  
  transactions.forEach(txn => {
    if (txn.transactionType === 'buy') {
      const assetClass = txn.productType || 'Others';
      allocation[assetClass] = (allocation[assetClass] || 0) + txn.amount;
    }
  });

  // Convert to percentages
  const total = Object.values(allocation).reduce((sum, value) => sum + value, 0);
  const percentageAllocation: { [key: string]: number } = {};
  
  Object.entries(allocation).forEach(([key, value]) => {
    percentageAllocation[key] = total > 0 ? (value / total) * 100 : 0;
  });

  return percentageAllocation;
}

function generateReportHTML(client: any, metrics: any, allocation: any, recentTransactions: any[]) {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const sectorData = generateMockSectorData();
  const geographicData = generateMockGeographicData();
  const holdings = generateMockHoldings();
  const performanceData = generatePerformanceData();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Portfolio Report - ${client.fullName}</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.6;
        }
        .chart-container {
          margin: 20px 0;
          height: 300px;
          display: flex;
          justify-content: center;
        }
        .chart-wrapper {
          width: 100%;
          max-width: 500px;
          position: relative;
        }
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #2563eb;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          z-index: 1000;
        }
        .print-button:hover {
          background: #1d4ed8;
        }
        @media print {
          .print-button {
            display: none;
          }
          body {
            padding: 0;
          }
          .page-break {
            page-break-before: always;
          }
        }
        @media (max-width: 768px) {
          body {
            padding: 10px;
          }
          .print-button {
            position: static;
            width: 100%;
            margin-bottom: 20px;
            padding: 15px;
            font-size: 18px;
          }
          .header {
            text-align: center;
            padding: 15px 0;
          }
          .bank-logo {
            font-size: 20px;
          }
          .report-title {
            font-size: 24px;
          }
          .client-details {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .metrics-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          .chart-container {
            height: 250px;
            margin: 15px 0;
          }
          .table {
            font-size: 12px;
          }
          .table th,
          .table td {
            padding: 8px 4px;
          }
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .bank-logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin: 10px 0;
        }
        .report-date {
          color: #6b7280;
          font-size: 14px;
        }
        .client-info {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #2563eb;
        }
        .client-name {
          font-size: 22px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .client-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .detail-item {
          display: flex;
          justify-content: space-between;
        }
        .detail-label {
          font-weight: bold;
          color: #4b5563;
        }
        .detail-value {
          color: #1f2937;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 2px solid #e5e7eb;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .metric-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        .metric-label {
          color: #6b7280;
          font-size: 14px;
        }
        .positive {
          color: #059669;
        }
        .negative {
          color: #dc2626;
        }
        .allocation-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .allocation-bar {
          width: 200px;
          height: 20px;
          background: #f3f4f6;
          border-radius: 10px;
          overflow: hidden;
          margin: 0 15px;
        }
        .allocation-fill {
          height: 100%;
          background: #2563eb;
          transition: width 0.3s ease;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .table th,
        .table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .table th {
          background: #f9fafb;
          font-weight: bold;
          color: #4b5563;
        }
        .table tr:hover {
          background: #f9fafb;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        .page-break {
          page-break-before: always;
        }
        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 20px;
        }
        .chart-section {
          text-align: center;
        }
        .chart-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #374151;
        }
        .risk-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .risk-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
        }
        .risk-label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        .risk-value {
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .risk-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }
        .risk-badge.moderate {
          background: #fef3c7;
          color: #92400e;
        }
        .risk-badge.good {
          background: #d1fae5;
          color: #065f46;
        }
        .holdings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .holding-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .holding-rank {
          width: 32px;
          height: 32px;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }
        .holding-info {
          flex: 1;
        }
        .holding-name {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .holding-type {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 2px;
        }
        .holding-allocation {
          font-size: 11px;
          color: #9ca3af;
        }
        .holding-performance {
          font-size: 14px;
          font-weight: 600;
        }
        .performance-table {
          overflow-x: auto;
        }
        .performers-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        .performers-section {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }
        .performers-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #374151;
        }
        .performer-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .performer-item:last-child {
          border-bottom: none;
        }
        .performer-rank {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }
        .performer-rank.top {
          background: #d1fae5;
          color: #065f46;
        }
        .performer-rank.poor {
          background: #fee2e2;
          color: #991b1b;
        }
        .performer-info {
          flex: 1;
        }
        .performer-name {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .performer-type {
          font-size: 11px;
          color: #6b7280;
        }
        .performer-gain {
          font-size: 13px;
          font-weight: 600;
        }
        .gain-percent {
          font-size: 12px;
          margin-left: 4px;
        }
      </style>
    </head>
    <body>
      <button class="print-button" onclick="window.print()">Print/Save as PDF</button>
      <div class="header">
        <div class="bank-logo">Ujjivan Small Finance Bank</div>
        <div class="report-title">Portfolio Report</div>
        <div class="report-date">Generated on ${currentDate}</div>
      </div>

      <div class="client-info">
        <div class="client-name">${client.fullName}</div>
        <div class="client-details">
          <div class="detail-item">
            <span class="detail-label">Client ID:</span>
            <span class="detail-value">${client.id}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${client.email || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${client.phone || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tier:</span>
            <span class="detail-value">${client.tier || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">AUM:</span>
            <span class="detail-value">${client.aum || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Risk Profile:</span>
            <span class="detail-value">${client.riskProfile || 'N/A'}</span>
          </div>
        </div>
      </div>

      <!-- Summary Section -->
      <div class="section">
        <h2 class="section-title">Summary</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">₹${(metrics.currentValue / 100000).toFixed(1)}L</div>
            <div class="metric-label">AUM</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">₹${(metrics.totalInvestment / 100000).toFixed(1)}L</div>
            <div class="metric-label">Investment</div>
          </div>
          <div class="metric-card">
            <div class="metric-value ${metrics.unrealizedGain >= 0 ? 'positive' : 'negative'}">
              ₹${(metrics.unrealizedGain / 100000).toFixed(1)}L
              <span class="gain-percent">↗ ${metrics.unrealizedGainPercent.toFixed(2)}%</span>
            </div>
            <div class="metric-label">Unrealized Gain</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.xirr}%</div>
            <div class="metric-label">XIRR</div>
          </div>
        </div>
      </div>

      <!-- Portfolio Overview Section -->
      <div class="section">
        <h2 class="section-title">Portfolio Overview</h2>
        <div class="overview-grid">
          <div class="chart-section">
            <h3 class="chart-title">Asset Allocation</h3>
            <div class="chart-container">
              <canvas id="assetChart"></canvas>
            </div>
          </div>
          <div class="chart-section">
            <h3 class="chart-title">Transaction Trends (6 Months)</h3>
            <div class="chart-container">
              <canvas id="transactionChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Risk Profile Section -->
      <div class="section">
        <h2 class="section-title">Risk Profile</h2>
        <div class="risk-metrics">
          <div class="risk-card">
            <div class="risk-label">Standard Deviation (1Y)</div>
            <div class="risk-value">12.4% <span class="risk-badge moderate">Moderate</span></div>
          </div>
          <div class="risk-card">
            <div class="risk-label">Sharpe Ratio</div>
            <div class="risk-value">1.42 <span class="risk-badge good">Good</span></div>
          </div>
          <div class="risk-card">
            <div class="risk-label">Beta</div>
            <div class="risk-value">0.89</div>
          </div>
          <div class="risk-card">
            <div class="risk-label">Maximum Drawdown</div>
            <div class="risk-value">-8.3%</div>
          </div>
        </div>
      </div>

      <!-- Sector Exposure Section -->
      <div class="section">
        <h2 class="section-title">Sector Exposure</h2>
        <div class="chart-container">
          <canvas id="sectorChart"></canvas>
        </div>
      </div>

      <!-- Geographic Exposure Section -->
      <div class="section">
        <h2 class="section-title">Geographic Exposure</h2>
        <div class="chart-container">
          <canvas id="geographicChart"></canvas>
        </div>
      </div>

      <!-- Top Holdings Section -->
      <div class="section">
        <h2 class="section-title">Underlying Security Exposure</h2>
        <div class="holdings-grid">
          ${holdings.slice(0, 6).map((holding, index) => `
            <div class="holding-card">
              <div class="holding-rank">#${index + 1}</div>
              <div class="holding-info">
                <div class="holding-name">${holding.name}</div>
                <div class="holding-type">${holding.type}</div>
                <div class="holding-allocation">${holding.allocation}% allocation</div>
              </div>
              <div class="holding-performance ${holding.gain >= 0 ? 'positive' : 'negative'}">
                ${holding.gain > 0 ? '+' : ''}${holding.gain}%
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Performance Analysis Section -->
      <div class="section">
        <h2 class="section-title">Performance Analysis</h2>
        <div class="performance-table">
          <table class="table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Portfolio</th>
                <th>Benchmark</th>
                <th>Alpha</th>
              </tr>
            </thead>
            <tbody>
              ${performanceData.map(period => `
                <tr>
                  <td>${period.label}</td>
                  <td class="positive">${period.value}%</td>
                  <td>${period.benchmark}%</td>
                  <td class="positive">+${period.alpha}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top/Poor Performers Section -->
      <div class="section">
        <h2 class="section-title">Top & Poor Performers</h2>
        <div class="performers-grid">
          <div class="performers-section">
            <h3 class="performers-title">Top Performers</h3>
            ${holdings.filter(h => h.gain > 0).slice(0, 3).map((holding, index) => `
              <div class="performer-item">
                <div class="performer-rank top">#${index + 1}</div>
                <div class="performer-info">
                  <div class="performer-name">${holding.name}</div>
                  <div class="performer-type">${holding.type}</div>
                </div>
                <div class="performer-gain positive">+${holding.gain}%</div>
              </div>
            `).join('')}
          </div>
          <div class="performers-section">
            <h3 class="performers-title">Poor Performers</h3>
            ${holdings.filter(h => h.gain < 0).slice(0, 3).map((holding, index) => `
              <div class="performer-item">
                <div class="performer-rank poor">#${index + 1}</div>
                <div class="performer-info">
                  <div class="performer-name">${holding.name}</div>
                  <div class="performer-type">${holding.type}</div>
                </div>
                <div class="performer-gain negative">${holding.gain}%</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="section page-break">
        <h2 class="section-title">Recent Transactions</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Product</th>
              <th>Security</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${recentTransactions.map(txn => `
              <tr>
                <td>${new Date(txn.transactionDate).toLocaleDateString('en-IN')}</td>
                <td style="text-transform: capitalize;">${txn.transactionType}</td>
                <td>${txn.productType || 'N/A'}</td>
                <td>${txn.productName || 'N/A'}</td>
                <td>₹${txn.amount.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>This report is generated electronically by Ujjivan Small Finance Bank's Portfolio Management System.</p>
        <p>For any queries, please contact your relationship manager.</p>
      </div>

      <script>
        // Create Asset Allocation Pie Chart
        const ctx = document.getElementById('assetChart').getContext('2d');
        const allocationData = ${JSON.stringify(allocation)};
        
        const labels = Object.keys(allocationData);
        const data = Object.values(allocationData);
        const colors = [
          '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe',
          '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'
        ];

        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors.slice(0, labels.length),
              borderColor: '#ffffff',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 15,
                  usePointStyle: true
                }
              },
              title: {
                display: true,
                text: 'Portfolio Asset Allocation',
                font: {
                  size: 16,
                  weight: 'bold'
                }
              }
            }
          }
        });

        // Create Transaction Trends Line Chart
        const transactionData = ${JSON.stringify(recentTransactions)};
        const monthlyData = {};
        
        // Group transactions by month
        transactionData.forEach(txn => {
          const date = new Date(txn.transactionDate);
          const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { count: 0, amount: 0 };
          }
          monthlyData[monthKey].count++;
          monthlyData[monthKey].amount += txn.amount;
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        const transactionCounts = sortedMonths.map(month => monthlyData[month].count);
        const transactionAmounts = sortedMonths.map(month => monthlyData[month].amount);

        const ctx2 = document.getElementById('transactionChart').getContext('2d');
        new Chart(ctx2, {
          type: 'line',
          data: {
            labels: sortedMonths.map(month => {
              const [year, monthNum] = month.split('-');
              const date = new Date(year, monthNum - 1);
              return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            }),
            datasets: [{
              label: 'Transaction Count',
              data: transactionCounts,
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              tension: 0.4,
              yAxisID: 'y'
            }, {
              label: 'Transaction Volume (₹)',
              data: transactionAmounts,
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              tension: 0.4,
              yAxisID: 'y1'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'Month'
                }
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Transaction Count'
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Volume (₹)'
                },
                grid: {
                  drawOnChartArea: false,
                }
              }
            },
            plugins: {
              title: {
                display: true,
                text: 'Monthly Transaction Trends',
                font: {
                  size: 16,
                  weight: 'bold'
                }
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        });
      </script>
    </body>
    </html>
  `;
}

export default router;