import { storage } from "../server/storage";
import { Client, InsertTransaction } from "../shared/schema";
import { addDays, subDays, subMonths } from "date-fns";

// Product types
const productTypes = [
  "equity",
  "mutual_fund",
  "bond",
  "fixed_deposit",
  "insurance",
  "structured_product",
  "alternative_investment"
];

// Transaction types
const transactionTypes = [
  "buy",
  "sell",
  "dividend",
  "interest",
  "fee",
  "deposit",
  "withdrawal"
];

// Product names by type
const productNamesByType: Record<string, string[]> = {
  equity: [
    "Reliance Industries Ltd",
    "Tata Consultancy Services Ltd",
    "HDFC Bank Ltd",
    "Infosys Ltd",
    "ICICI Bank Ltd",
    "Hindustan Unilever Ltd",
    "Bharti Airtel Ltd",
    "ITC Ltd",
    "Kotak Mahindra Bank Ltd",
    "Larsen & Toubro Ltd"
  ],
  mutual_fund: [
    "HDFC Midcap Opportunities Fund",
    "SBI Blue Chip Fund",
    "Axis Bluechip Fund",
    "Aditya Birla Sun Life Tax Relief 96",
    "Mirae Asset Large Cap Fund",
    "Kotak Standard Multicap Fund",
    "ICICI Prudential Bluechip Fund",
    "Motilal Oswal Multicap 35 Fund",
    "Franklin India Prima Fund",
    "DSP Tax Saver Fund"
  ],
  bond: [
    "India Government Bond 7.26% 2029",
    "HDFC Ltd 8.50% 2025",
    "LIC Housing Finance 7.95% 2023",
    "NHAI 8.30% 2027",
    "REC Limited 8.12% 2026",
    "SBI 8.15% Perpetual",
    "PGCIL 8.25% 2028",
    "IRFC 7.85% 2024",
    "NABARD 7.89% 2025",
    "PFC 8.20% 2026"
  ],
  fixed_deposit: [
    "HDFC Bank FD 7.00% 1 Year",
    "SBI FD 6.75% 2 Year",
    "ICICI Bank FD 6.90% 3 Year",
    "Bajaj Finance FD 7.35% 5 Year",
    "Axis Bank FD 6.85% 18 Months",
    "Bank of Baroda FD 6.70% 2 Year",
    "PNB FD 6.60% 3 Year",
    "Kotak Mahindra Bank FD 6.80% 1 Year",
    "IDFC First Bank FD 7.25% 5 Year",
    "Union Bank FD 6.65% 2 Year"
  ],
  insurance: [
    "HDFC Life Click 2 Protect",
    "ICICI Prudential iProtect Smart",
    "Max Life Online Term Plan Plus",
    "SBI Life eShield",
    "Bajaj Allianz Life Smart Protect Goal",
    "Tata AIA Life Insurance Sampoorna Raksha",
    "Aditya Birla Sun Life DigiShield Plan",
    "Kotak e-Term Plan",
    "Canara HSBC OBC Life iSelect Term Plan",
    "Edelweiss Tokio Life - Total Secure+"
  ],
  structured_product: [
    "IIFL Nifty Enhancer Structure",
    "Edelweiss Market Linked Debenture",
    "Aditya Birla Capital Protected Structure",
    "ICICI Principal Protected Note",
    "Kotak Capital Protection Oriented Scheme",
    "Axis Bank Market Linked Debenture",
    "Anand Rathi Principal Protected Structure",
    "Centrum Wealth Capital Protected Note",
    "JM Financial Structured Product",
    "Tata Capital Market Linked Debenture"
  ],
  alternative_investment: [
    "Blackstone India Real Estate Fund",
    "HDFC India Real Estate Fund",
    "Kotak Alternate Asset India Special Situations Fund",
    "IIFL Special Opportunities Fund",
    "Edelweiss Alternative Equity Fund",
    "Avendus Structured Credit Fund",
    "ASK Real Estate Special Opportunities Fund",
    "Motilal Oswal Alternative Investment Fund",
    "Blume Ventures Fund",
    "India Quotient Fund"
  ]
};

// Product categories by type
const productCategoriesByType: Record<string, string[]> = {
  equity: [
    "large_cap",
    "mid_cap",
    "small_cap",
    "multi_cap",
    "thematic"
  ],
  mutual_fund: [
    "equity_large_cap",
    "equity_mid_cap",
    "equity_small_cap",
    "equity_multi_cap",
    "equity_elss",
    "hybrid_balanced",
    "hybrid_aggressive",
    "debt_corporate_bond",
    "debt_short_term",
    "debt_liquid"
  ],
  bond: [
    "government",
    "corporate_aaa",
    "corporate_aa",
    "psu",
    "state_development_loan",
    "tax_free",
    "perpetual",
    "zero_coupon"
  ],
  fixed_deposit: [
    "regular",
    "tax_saving",
    "special",
    "senior_citizen",
    "super_senior_citizen"
  ],
  insurance: [
    "term",
    "endowment",
    "ulip",
    "child",
    "pension",
    "health"
  ],
  structured_product: [
    "principal_protected",
    "market_linked",
    "capital_guaranteed",
    "auto_callable",
    "barrier_notes"
  ],
  alternative_investment: [
    "private_equity",
    "venture_capital",
    "hedge_fund",
    "real_estate",
    "infrastructure",
    "distressed_assets",
    "art",
    "commodity"
  ]
};

// Status types
const statusTypes = [
  "completed",
  "pending",
  "failed",
  "cancelled"
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomAmount(productType: string): number {
  const baseAmounts: Record<string, [number, number]> = {
    equity: [5000, 100000],
    mutual_fund: [10000, 200000],
    bond: [50000, 500000],
    fixed_deposit: [25000, 300000],
    insurance: [20000, 150000],
    structured_product: [100000, 1000000],
    alternative_investment: [200000, 2000000]
  };
  
  const [min, max] = baseAmounts[productType] || [10000, 100000];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFees(amount: number): number {
  // Typically between 0% and 2% of the amount
  return Math.floor(amount * (Math.random() * 0.02));
}

function getRandomTaxes(amount: number): number {
  // Typically between 0% and 1% of the amount
  return Math.floor(amount * (Math.random() * 0.01));
}

function generateTransactionDescription(transactionType: string, productType: string, productName: string): string {
  switch (transactionType) {
    case 'buy':
      return `Purchase of ${productName}`;
    case 'sell':
      return `Sale of ${productName}`;
    case 'dividend':
      return `Dividend received from ${productName}`;
    case 'interest':
      return `Interest earned on ${productName}`;
    case 'fee':
      return `Management fee for ${productName}`;
    case 'deposit':
      return `Deposit for investment in ${productType}`;
    case 'withdrawal':
      return `Withdrawal from ${productType} investment`;
    default:
      return `${transactionType} transaction for ${productName}`;
  }
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateTransactionForClient(clientId: number, date: Date): InsertTransaction {
  const productType = getRandomItem(productTypes);
  const transactionType = getRandomItem(transactionTypes);
  const productName = getRandomItem(productNamesByType[productType] || []);
  const productCategory = productCategoriesByType[productType] ? 
    getRandomItem(productCategoriesByType[productType]) : null;
  const status = getRandomItem(statusTypes);
  
  const amount = getRandomAmount(productType);
  const fees = getRandomFees(amount);
  const taxes = getRandomTaxes(amount);
  const totalAmount = amount + fees + taxes;
  
  const quantity = transactionType === 'buy' || transactionType === 'sell' ? 
    getRandomNumber(1, 100) : undefined;
  
  const price = transactionType === 'buy' || transactionType === 'sell' ? 
    amount / (quantity || 1) : undefined;
  
  const settlementDate = ['buy', 'sell'].includes(transactionType) ? 
    addDays(date, getRandomNumber(1, 5)) : undefined;
  
  const portfolioImpact = getRandomNumber(-5, 5) / 100;
  
  const description = generateTransactionDescription(transactionType, productType, productName);
  
  const reference = `REF-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${getRandomNumber(1000, 9999)}`;
  
  return {
    clientId,
    transactionDate: date,
    settlementDate,
    transactionType,
    productType,
    productName,
    productCategory,
    quantity,
    price,
    amount,
    fees,
    taxes,
    totalAmount,
    currencyCode: 'INR',
    status,
    reference,
    description,
    portfolioImpact
  };
}

async function generateTransactionsForClient(clientId: number, count: number): Promise<void> {
  const endDate = new Date();
  const startDate = subMonths(endDate, 12); // Last 12 months
  
  for (let i = 0; i < count; i++) {
    const transactionDate = getRandomDate(startDate, endDate);
    const transaction = generateTransactionForClient(clientId, transactionDate);
    
    try {
      await storage.createTransaction(transaction);
      console.log(`Created transaction for client ${clientId}`);
    } catch (error) {
      console.error(`Error creating transaction for client ${clientId}:`, error);
    }
  }
}

export async function populateTransactions(): Promise<void> {
  try {
    console.log("Starting transaction population...");
    
    // Get all clients
    const clients = await storage.getClients();
    console.log(`Found ${clients.length} clients`);
    
    // For each client, create between 10 and 30 transactions
    for (const client of clients) {
      const transactionCount = getRandomNumber(10, 30);
      console.log(`Generating ${transactionCount} transactions for client ${client.id} (${client.fullName})`);
      await generateTransactionsForClient(client.id, transactionCount);
      
      // Update client's last transaction date to the most recent transaction
      const transactions = await storage.getTransactions(client.id);
      if (transactions.length > 0) {
        const sortedTransactions = transactions.sort((a, b) => {
          return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
        });
        
        const lastTransactionDate = sortedTransactions[0].transactionDate;
        await storage.updateClient(client.id, {
          lastTransactionDate,
          totalTransactionCount: transactions.length,
          averageTransactionValue: transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
        });
        
        console.log(`Updated client ${client.id} with transaction stats`);
      }
    }
    
    console.log("Transaction population completed successfully!");
  } catch (error) {
    console.error("Error populating transactions:", error);
  }
}

// Execute the script when run directly
populateTransactions().then(() => {
  console.log("Transaction population script completed");
  process.exit(0);
}).catch(error => {
  console.error("Transaction population script failed:", error);
  process.exit(1);
});