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
    avgTransactionValue: 0
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

  // Estimate current value (simplified calculation)
  metrics.currentValue = metrics.totalInvestment * 1.08; // Assume 8% growth
  metrics.totalGainLoss = metrics.currentValue - metrics.totalInvestment;
  metrics.avgTransactionValue = totalAmount / Math.max(transactions.length, 1);

  return metrics;
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

      <div class="section">
        <h2 class="section-title">Portfolio Overview</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">₹${metrics.totalInvestment.toLocaleString('en-IN')}</div>
            <div class="metric-label">Total Investment</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">₹${metrics.currentValue.toLocaleString('en-IN')}</div>
            <div class="metric-label">Current Value</div>
          </div>
          <div class="metric-card">
            <div class="metric-value ${metrics.totalGainLoss >= 0 ? 'positive' : 'negative'}">
              ₹${metrics.totalGainLoss.toLocaleString('en-IN')}
            </div>
            <div class="metric-label">Total Gain/Loss</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.totalTransactions}</div>
            <div class="metric-label">Total Transactions</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Asset Allocation</h2>
        <div class="chart-container">
          <div class="chart-wrapper">
            <canvas id="assetChart"></canvas>
          </div>
        </div>
        ${Object.entries(allocation).map(([asset, percentage]) => `
          <div class="allocation-item">
            <span style="font-weight: bold;">${asset}</span>
            <div class="allocation-bar">
              <div class="allocation-fill" style="width: ${percentage}%"></div>
            </div>
            <span>${(percentage as number).toFixed(1)}%</span>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2 class="section-title">Transaction Trends</h2>
        <div class="chart-container">
          <div class="chart-wrapper">
            <canvas id="transactionChart"></canvas>
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