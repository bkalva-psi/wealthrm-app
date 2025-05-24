import { faker } from '@faker-js/faker';
import { db } from '../../server/db';
import { clients } from '../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * This script populates detailed portfolio data for all clients.
 * It creates realistic investment holdings, asset allocations, and performance metrics.
 */

// Define asset classes with realistic properties
const ASSET_CLASSES = [
  { name: 'Equity', riskLevel: 7, expectedReturn: 12, color: '#4B7BF5' },
  { name: 'Fixed Income', riskLevel: 3, expectedReturn: 6, color: '#92D050' },
  { name: 'Cash & Equivalents', riskLevel: 1, expectedReturn: 3, color: '#B3B3B3' },
  { name: 'Alternative Investments', riskLevel: 8, expectedReturn: 14, color: '#9966FF' },
  { name: 'Gold', riskLevel: 5, expectedReturn: 7, color: '#FFD700' },
  { name: 'Real Estate', riskLevel: 6, expectedReturn: 9, color: '#FF9966' },
];

// Define security types
const SECURITY_TYPES = [
  { name: 'Mutual Fund - Equity', assetClass: 'Equity' },
  { name: 'Mutual Fund - Debt', assetClass: 'Fixed Income' },
  { name: 'Mutual Fund - Hybrid', assetClass: 'Equity' },
  { name: 'ETF', assetClass: 'Equity' },
  { name: 'Direct Equity', assetClass: 'Equity' },
  { name: 'Corporate Bond', assetClass: 'Fixed Income' },
  { name: 'Government Security', assetClass: 'Fixed Income' },
  { name: 'Fixed Deposit', assetClass: 'Fixed Income' },
  { name: 'Savings Account', assetClass: 'Cash & Equivalents' },
  { name: 'Alternative Investment Fund', assetClass: 'Alternative Investments' },
  { name: 'Physical Gold', assetClass: 'Gold' },
  { name: 'Gold ETF', assetClass: 'Gold' },
  { name: 'Real Estate Investment', assetClass: 'Real Estate' },
  { name: 'REIT', assetClass: 'Real Estate' },
];

// Define portfolio risk profiles
const RISK_PROFILES = [
  {
    name: 'Conservative',
    allocation: { 'Equity': 20, 'Fixed Income': 50, 'Cash & Equivalents': 20, 'Gold': 10 },
    targetReturn: 7,
    riskLevel: 3
  },
  {
    name: 'Moderate',
    allocation: { 'Equity': 40, 'Fixed Income': 35, 'Cash & Equivalents': 10, 'Gold': 10, 'Alternative Investments': 5 },
    targetReturn: 10,
    riskLevel: 5
  },
  {
    name: 'Aggressive',
    allocation: { 'Equity': 65, 'Fixed Income': 15, 'Cash & Equivalents': 5, 'Gold': 5, 'Alternative Investments': 10 },
    targetReturn: 14,
    riskLevel: 7
  },
  {
    name: 'Very Aggressive',
    allocation: { 'Equity': 80, 'Fixed Income': 5, 'Alternative Investments': 15 },
    targetReturn: 18,
    riskLevel: 9
  }
];

// Sample securities to populate the portfolio
const SAMPLE_SECURITIES = [
  // Equity Mutual Funds
  { name: 'HDFC Top 100 Fund', symbol: 'HDFCTO100', type: 'Mutual Fund - Equity', assetClass: 'Equity', sector: 'Diversified', return1Y: 18.2, return3Y: 12.5, return5Y: 14.3 },
  { name: 'Axis Bluechip Fund', symbol: 'AXISBCHIP', type: 'Mutual Fund - Equity', assetClass: 'Equity', sector: 'Large Cap', return1Y: 16.5, return3Y: 11.8, return5Y: 13.2 },
  { name: 'SBI Small Cap Fund', symbol: 'SBISMCAP', type: 'Mutual Fund - Equity', assetClass: 'Equity', sector: 'Small Cap', return1Y: 22.4, return3Y: 15.6, return5Y: 17.8 },
  { name: 'Mirae Asset Emerging Bluechip', symbol: 'MIRAEAEB', type: 'Mutual Fund - Equity', assetClass: 'Equity', sector: 'Mid Cap', return1Y: 20.1, return3Y: 14.2, return5Y: 16.5 },
  
  // Debt Mutual Funds
  { name: 'ICICI Prudential Corporate Bond Fund', symbol: 'ICICIPRCBF', type: 'Mutual Fund - Debt', assetClass: 'Fixed Income', sector: 'Corporate Debt', return1Y: 7.8, return3Y: 8.2, return5Y: 7.5 },
  { name: 'Kotak Bond Fund', symbol: 'KOTAKBOND', type: 'Mutual Fund - Debt', assetClass: 'Fixed Income', sector: 'Government Debt', return1Y: 6.5, return3Y: 7.1, return5Y: 6.8 },
  
  // Hybrid Funds
  { name: 'HDFC Balanced Advantage Fund', symbol: 'HDFCBALAD', type: 'Mutual Fund - Hybrid', assetClass: 'Equity', sector: 'Hybrid', return1Y: 14.2, return3Y: 10.8, return5Y: 12.1 },
  
  // ETFs
  { name: 'Nippon India ETF Nifty BeES', symbol: 'NIFTYBEES', type: 'ETF', assetClass: 'Equity', sector: 'Index', return1Y: 15.3, return3Y: 11.2, return5Y: 12.8 },
  
  // Direct Equity
  { name: 'Reliance Industries Ltd.', symbol: 'RELIANCE', type: 'Direct Equity', assetClass: 'Equity', sector: 'Energy', return1Y: 25.4, return3Y: 18.7, return5Y: 22.3 },
  { name: 'HDFC Bank Ltd.', symbol: 'HDFCBANK', type: 'Direct Equity', assetClass: 'Equity', sector: 'Banking', return1Y: 12.8, return3Y: 15.3, return5Y: 17.9 },
  { name: 'Infosys Ltd.', symbol: 'INFY', type: 'Direct Equity', assetClass: 'Equity', sector: 'IT', return1Y: 10.5, return3Y: 13.8, return5Y: 15.2 },
  
  // Fixed Income
  { name: 'HDFC Corporate FD', symbol: 'HDFCFD', type: 'Fixed Deposit', assetClass: 'Fixed Income', sector: 'Bank Deposits', return1Y: 7.2, return3Y: 6.9, return5Y: 6.7 },
  { name: 'National Highway Authority Bond', symbol: 'NHAIBOND', type: 'Government Security', assetClass: 'Fixed Income', sector: 'Infrastructure', return1Y: 7.8, return3Y: 7.5, return5Y: 7.3 },
  
  // Cash
  { name: 'HDFC Savings Account', symbol: 'HDFCSAV', type: 'Savings Account', assetClass: 'Cash & Equivalents', sector: 'Banking', return1Y: 3.5, return3Y: 3.5, return5Y: 3.5 },
  
  // Gold
  { name: 'Gold ETF', symbol: 'GOLDBEES', type: 'Gold ETF', assetClass: 'Gold', sector: 'Commodities', return1Y: 8.2, return3Y: 11.7, return5Y: 9.8 },
  
  // Alternative Investments
  { name: 'HDFC Real Estate Fund', symbol: 'HDFCREF', type: 'Alternative Investment Fund', assetClass: 'Alternative Investments', sector: 'Real Estate', return1Y: 12.5, return3Y: 9.8, return5Y: 11.2 },
  
  // Real Estate
  { name: 'Embassy Office Parks REIT', symbol: 'EMBASSY', type: 'REIT', assetClass: 'Real Estate', sector: 'Commercial Real Estate', return1Y: 9.8, return3Y: 8.5, return5Y: 10.2 },
];

// Helper function to get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to generate asset allocation based on risk profile
function generateAssetAllocation(riskProfile: string) {
  const profile = RISK_PROFILES.find(p => p.name === riskProfile) || RISK_PROFILES[1]; // Default to Moderate
  return profile.allocation;
}

// Helper function to generate sector exposure
function generateSectorExposure() {
  return {
    'Financial Services': faker.number.int({ min: 15, max: 30 }),
    'IT': faker.number.int({ min: 10, max: 25 }),
    'Energy': faker.number.int({ min: 5, max: 15 }),
    'Consumer Goods': faker.number.int({ min: 5, max: 15 }),
    'Healthcare': faker.number.int({ min: 5, max: 12 }),
    'Infrastructure': faker.number.int({ min: 3, max: 10 }),
    'Automobile': faker.number.int({ min: 3, max: 8 }),
    'Others': faker.number.int({ min: 5, max: 15 }),
  };
}

// Helper function to generate geographic exposure
function generateGeographicExposure() {
  return {
    'India': faker.number.int({ min: 60, max: 85 }),
    'US': faker.number.int({ min: 5, max: 20 }),
    'Europe': faker.number.int({ min: 2, max: 10 }),
    'Asia-Pacific': faker.number.int({ min: 2, max: 10 }),
    'Others': faker.number.int({ min: 0, max: 5 }),
  };
}

// Function to generate a portfolio for a client
async function generateClientPortfolio(clientId: number, riskProfile: string) {
  const assetAllocation = generateAssetAllocation(riskProfile);
  const sectorExposure = generateSectorExposure();
  const geographicExposure = generateGeographicExposure();
  
  // Calculate total invested amount based on AUM value (in lakhs)
  const client = await db.query.clients.findFirst({
    where: eq(clients.id, clientId)
  });
  
  if (!client || !client.aumValue) return;
  
  const totalInvestedAmount = Math.round(client.aumValue * 0.85); // 85% of AUM is invested
  const currentValue = client.aumValue;
  const unrealizedGains = currentValue - totalInvestedAmount;
  const unrealizedGainsPercent = (unrealizedGains / totalInvestedAmount) * 100;
  
  // Generate performance metrics
  const oneYearReturn = faker.number.float({ min: -5, max: 25, fractionDigits: 1 });
  const threeYearReturn = faker.number.float({ min: 5, max: 18, fractionDigits: 1 });
  const fiveYearReturn = faker.number.float({ min: 8, max: 15, fractionDigits: 1 });
  
  // Generate risk metrics
  const riskScore = faker.number.int({ min: 1, max: 10 });
  const volatility = faker.number.float({ min: 5, max: 25, fractionDigits: 1 });
  const sharpeRatio = faker.number.float({ min: 0.5, max: 2.5, fractionDigits: 2 });
  
  // Convert dates to strings to avoid type issues
  const portfolioStartDate = faker.date.past({ years: 5 }).toISOString();
  const lastValuationDate = faker.date.recent({ days: 5 }).toISOString();

  // Update client with portfolio data
  await db.update(clients)
    .set({
      totalInvestedAmount,
      currentValue,
      unrealizedGains,
      unrealizedGainsPercent,
      oneYearReturn,
      threeYearReturn,
      fiveYearReturn,
      riskScore,
      volatility,
      sharpeRatio,
      assetAllocation: assetAllocation as any,
      sectorExposure: sectorExposure as any,
      geographicExposure: geographicExposure as any,
      portfolioStartDate,
      lastValuationDate,
    })
    .where(eq(clients.id, clientId));
    
  console.log(`Updated portfolio data for client ${clientId} - ${client.fullName}`);
}

// Main function to populate portfolio data for all clients
async function populatePortfolioData() {
  try {
    // Get all clients
    const allClients = await db.query.clients.findMany();
    
    console.log(`Found ${allClients.length} clients. Populating portfolio data...`);
    
    // Generate portfolio data for each client
    for (const client of allClients) {
      await generateClientPortfolio(client.id, client.riskProfile || 'Moderate');
    }
    
    console.log('Portfolio data population completed successfully!');
  } catch (error) {
    console.error('Error populating portfolio data:', error);
  }
}

// Execute the function
populatePortfolioData()
  .then(() => {
    console.log('Portfolio data population script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error in portfolio data population script:', error);
    process.exit(1);
  });