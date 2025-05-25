import { db } from '../server/db';
import { transactions, clients } from '../shared/schema';
import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';

// Helper functions from original populate-transactions.ts
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomAmount(productType: string): number {
  switch (productType) {
    case 'equity':
      return getRandomNumber(5000, 100000);
    case 'mutual_fund':
      return getRandomNumber(10000, 200000);
    case 'fixed_deposit':
      return getRandomNumber(50000, 500000);
    case 'bond':
      return getRandomNumber(100000, 1000000);
    case 'insurance':
      return getRandomNumber(5000, 50000);
    default:
      return getRandomNumber(1000, 50000);
  }
}

function getRandomFees(amount: number): number {
  return Math.round(amount * (getRandomNumber(10, 50) / 1000)) / 100;
}

function getRandomTaxes(amount: number): number {
  return Math.round(amount * (getRandomNumber(5, 150) / 1000)) / 100;
}

function generateTransactionDescription(transactionType: string, productType: string, productName: string): string {
  if (transactionType === 'buy') {
    return `Purchase of ${productName} (${productType})`;
  } else if (transactionType === 'sell') {
    return `Sale of ${productName} (${productType})`;
  } else if (transactionType === 'dividend') {
    return `Dividend payment from ${productName}`;
  } else if (transactionType === 'interest') {
    return `Interest payment from ${productName}`;
  } else {
    return `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} transaction for ${productName}`;
  }
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateTransactionForClient(clientId: number, date: Date) {
  const transactionTypes = ['buy', 'sell', 'dividend', 'interest', 'fee', 'transfer'];
  const productTypes = ['equity', 'mutual_fund', 'fixed_deposit', 'bond', 'insurance'];
  const statuses = ['completed', 'pending', 'failed'];
  
  const transactionType = getRandomItem(transactionTypes);
  const productType = getRandomItem(productTypes);
  
  let productNames: { [key: string]: string[] } = {
    equity: [
      'Reliance Industries Ltd.', 'HDFC Bank Ltd.', 'Infosys Ltd.', 'ICICI Bank Ltd.',
      'Tata Consultancy Services Ltd.', 'Hindustan Unilever Ltd.', 'ITC Ltd.',
      'State Bank of India', 'Bajaj Finance Ltd.', 'Bharti Airtel Ltd.'
    ],
    mutual_fund: [
      'HDFC Mid-Cap Opportunities Fund', 'Axis Bluechip Fund', 'SBI Small Cap Fund',
      'Mirae Asset Large Cap Fund', 'Kotak Standard Multicap Fund', 'ICICI Prudential Bluechip Fund',
      'Aditya Birla Sun Life Tax Relief 96', 'Nippon India Small Cap Fund',
      'Franklin India Prima Fund', 'DSP Midcap Fund'
    ],
    fixed_deposit: [
      'HDFC Bank FD', 'SBI Fixed Deposit', 'ICICI Bank FD', 'Axis Bank Fixed Deposit',
      'Bajaj Finance FD', 'Bank of Baroda Fixed Deposit', 'Punjab National Bank FD',
      'Shriram Transport Finance FD', 'Mahindra Finance Fixed Deposit', 'Canara Bank FD'
    ],
    bond: [
      'Government of India Bonds', 'NHAI Bonds', 'REC Limited Bonds', 'IRFC Bonds',
      'SBI Bonds', 'HDFC Bonds', 'LIC Housing Finance Bonds', 'Shriram Transport Finance Bonds',
      'Tata Capital Bonds', 'L&T Finance Bonds'
    ],
    insurance: [
      'LIC Jeevan Anand', 'HDFC Life Click2Protect', 'ICICI Prudential iProtect Smart',
      'Max Life Online Term Plan Plus', 'SBI Life eShield', 'Bajaj Allianz Life Goal Assure',
      'Kotak Life Preferred e-Term', 'Aditya Birla Sun Life ABSLI DigiShield Plan',
      'Exide Life Secured Income RP', 'Tata AIA Life Insurance Sampoorna Raksha'
    ]
  };
  
  const productName = getRandomItem(productNames[productType]);
  const amount = getRandomAmount(productType);
  const fees = transactionType === 'buy' || transactionType === 'sell' ? getRandomFees(amount) : 0;
  const taxes = transactionType === 'sell' ? getRandomTaxes(amount) : 0;
  
  // Generate some random quantity and price for buy/sell transactions
  const quantity = transactionType === 'buy' || transactionType === 'sell' 
    ? (productType === 'equity' ? getRandomNumber(1, 100) : getRandomNumber(1, 50)) 
    : null;
  
  const price = transactionType === 'buy' || transactionType === 'sell' 
    ? Math.round((amount / (quantity || 1)) * 100) / 100 
    : null;
  
  // Settlement date is usually a few days after transaction date for buy/sell
  const settlementDate = transactionType === 'buy' || transactionType === 'sell'
    ? new Date(date.getTime() + 1000 * 60 * 60 * 24 * getRandomNumber(1, 3))
    : null;
  
  // Generate a reference number
  const reference = `TX${Date.now().toString().substring(5)}${getRandomNumber(1000, 9999)}`;
  
  // Generate transaction description
  const description = generateTransactionDescription(transactionType, productType, productName);
  
  // Portfolio impact only for buy/sell
  const portfolioImpact = transactionType === 'buy' ? amount : (transactionType === 'sell' ? -amount : 0);
  
  return {
    clientId,
    transactionDate: date,
    settlementDate,
    transactionType,
    productType,
    productName,
    productCategory: productType === 'equity' ? getRandomItem(['Large Cap', 'Mid Cap', 'Small Cap']) : null,
    quantity,
    price,
    amount,
    fees,
    taxes,
    totalAmount: amount + fees + taxes,
    currencyCode: 'INR',
    status: getRandomItem(statuses),
    reference,
    description,
    portfolioImpact,
    createdAt: new Date()
  };
}

async function generateTransactionsForClient(clientId: number, clientName: string, count: number): Promise<void> {
  console.log(`Generating ${count} transactions for client ${clientId} (${clientName})`);
  
  // Generate transactions over the past 3 years
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 3);
  
  // Generate transactions for this client
  for (let i = 0; i < count; i++) {
    const transactionDate = getRandomDate(startDate, endDate);
    const transaction = generateTransactionForClient(clientId, transactionDate);
    
    await db.insert(transactions).values(transaction);
    console.log(`Created transaction for client ${clientId}`);
  }
  
  // Update client with transaction stats
  const clientTransactions = await db.select().from(transactions).where(eq(transactions.clientId, clientId));
  
  if (clientTransactions.length > 0) {
    // Calculate total invested amount
    const totalInvestedAmount = clientTransactions
      .filter(t => t.transactionType === 'buy')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate current value (with some random growth)
    const growthFactor = 1 + (Math.random() * 0.5); // 0% to 50% growth
    const currentValue = Math.round(totalInvestedAmount * growthFactor);
    
    // Calculate unrealized gains
    const unrealizedGains = currentValue - totalInvestedAmount;
    const unrealizedGainsPercent = (unrealizedGains / totalInvestedAmount) * 100;
    
    // Set some random performance metrics
    const oneYearReturn = Math.random() * 30 - 5; // -5% to 25%
    const threeYearReturn = Math.random() * 40; // 0% to 40%
    const fiveYearReturn = Math.random() * 60 + 10; // 10% to 70%
    
    // Calculate portfolio start date (earliest transaction)
    const portfolioStartDate = new Date(Math.min(...clientTransactions.map(t => t.transactionDate.getTime())));
    
    // Last valuation date (most recent transaction)
    const lastValuationDate = new Date(Math.max(...clientTransactions.map(t => t.transactionDate.getTime())));
    
    // Set some risk metrics
    const riskScore = getRandomNumber(1, 10);
    const esgScore = getRandomNumber(50, 95);
    const volatility = Math.random() * 15 + 5; // 5% to 20%
    const sharpeRatio = Math.random() * 2 + 0.5; // 0.5 to 2.5
    
    // Asset allocation (random)
    const assetAllocation = {
      Equity: getRandomNumber(20, 60),
      'Fixed Income': getRandomNumber(20, 40),
      'Alternative Investments': getRandomNumber(5, 20),
      Cash: getRandomNumber(5, 15)
    };
    
    // Normalize to 100%
    const totalAllocation = Object.values(assetAllocation).reduce((sum, value) => sum + value, 0);
    Object.keys(assetAllocation).forEach(key => {
      assetAllocation[key as keyof typeof assetAllocation] = Math.round((assetAllocation[key as keyof typeof assetAllocation] / totalAllocation) * 100);
    });
    
    // Sector exposure (for equities)
    const sectorExposure = {
      'Financial Services': getRandomNumber(15, 30),
      'Information Technology': getRandomNumber(10, 25),
      'Consumer Goods': getRandomNumber(10, 20),
      'Healthcare': getRandomNumber(5, 15),
      'Energy': getRandomNumber(5, 15),
      'Manufacturing': getRandomNumber(5, 15),
      'Others': getRandomNumber(5, 10)
    };
    
    // Normalize to 100%
    const totalSectorExposure = Object.values(sectorExposure).reduce((sum, value) => sum + value, 0);
    Object.keys(sectorExposure).forEach(key => {
      sectorExposure[key as keyof typeof sectorExposure] = Math.round((sectorExposure[key as keyof typeof sectorExposure] / totalSectorExposure) * 100);
    });
    
    // Geographic exposure
    const geographicExposure = {
      'India': getRandomNumber(50, 70),
      'USA': getRandomNumber(10, 20),
      'Europe': getRandomNumber(5, 15),
      'Asia (ex-India)': getRandomNumber(5, 15),
      'Others': getRandomNumber(2, 10)
    };
    
    // Normalize to 100%
    const totalGeoExposure = Object.values(geographicExposure).reduce((sum, value) => sum + value, 0);
    Object.keys(geographicExposure).forEach(key => {
      geographicExposure[key as keyof typeof geographicExposure] = Math.round((geographicExposure[key as keyof typeof geographicExposure] / totalGeoExposure) * 100);
    });
    
    // Update client record
    await db.update(clients)
      .set({
        totalTransactionCount: clientTransactions.length,
        lastTransactionDate: lastValuationDate,
        averageTransactionValue: Math.round(clientTransactions.reduce((sum, t) => sum + t.amount, 0) / clientTransactions.length),
        totalInvestedAmount,
        currentValue,
        unrealizedGains,
        unrealizedGainsPercent,
        oneYearReturn,
        threeYearReturn,
        fiveYearReturn,
        portfolioStartDate,
        lastValuationDate,
        riskScore,
        esgScore,
        volatility,
        sharpeRatio,
        assetAllocation,
        sectorExposure,
        geographicExposure
      })
      .where(eq(clients.id, clientId));
    
    console.log(`Updated client ${clientId} with transaction stats`);
  }
}

async function populateSpecificClient(): Promise<void> {
  console.log('Starting specific client transaction population...');
  
  try {
    // Get specific client info
    const client = await db.select().from(clients).where(eq(clients.id, 10)).limit(1);
    
    if (client.length > 0) {
      await generateTransactionsForClient(client[0].id, client[0].fullName, 30);
    } else {
      console.log('Client with ID 10 not found');
    }
    
    console.log('Specific client transaction population completed successfully');
  } catch (error) {
    console.error('Error populating transactions for specific client:', error);
  }
}

populateSpecificClient();
