import { db } from '../server/db.js';
import { transactions, clients } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function addJuneTransactions() {
  console.log('Adding June 2025 transactions for revenue generation...');

  // Get active clients assigned to RM (userId = 1)
  const activeClients = await db
    .select({ id: clients.id, fullName: clients.fullName, aumValue: clients.aumValue })
    .from(clients)
    .where(eq(clients.assignedTo, 1))
    .limit(15); // Focus on top clients for transactions

  if (activeClients.length === 0) {
    console.log('No clients found for RM userId = 1');
    return;
  }

  const juneTransactions = [];
  const currentDate = new Date();
  const juneStart = new Date(2025, 5, 1); // June 1, 2025
  const juneEnd = new Date(2025, 5, currentDate.getDate()); // Up to current date in June

  const productTypes = ['Mutual Fund', 'Insurance', 'Fixed Deposit', 'Equity', 'Bonds', 'SIP'];
  const transactionTypes = ['BUY', 'SELL', 'SIP', 'REDEMPTION', 'SWITCH'];

  // Generate transactions for each client
  for (const client of activeClients) {
    const transactionCount = Math.floor(Math.random() * 4) + 1; // 1-4 transactions per client
    
    for (let i = 0; i < transactionCount; i++) {
      const transactionDate = new Date(
        juneStart.getTime() + Math.random() * (juneEnd.getTime() - juneStart.getTime())
      );
      
      const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
      const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      
      // Generate realistic transaction amounts based on client AUM
      const baseAmount = Math.max(50000, (client.aumValue || 1000000) * 0.1); // 10% of AUM or min 50k
      const amount = Math.floor(baseAmount * (0.5 + Math.random() * 1.5)); // ±50% variation
      
      // Calculate fees based on product type and amount
      let feePercentage = 0;
      switch (productType) {
        case 'Mutual Fund':
          feePercentage = transactionType === 'SIP' ? 0.5 : 1.0;
          break;
        case 'Insurance':
          feePercentage = 2.5;
          break;
        case 'Equity':
          feePercentage = 0.25;
          break;
        case 'Fixed Deposit':
          feePercentage = 0.1;
          break;
        case 'Bonds':
          feePercentage = 0.15;
          break;
        default:
          feePercentage = 0.5;
      }
      
      const fees = Math.floor(amount * (feePercentage / 100));
      const taxes = Math.floor(fees * 0.18); // 18% GST on fees
      const totalAmount = amount + fees + taxes;

      juneTransactions.push({
        clientId: client.id,
        transactionDate,
        settlementDate: new Date(transactionDate.getTime() + 2 * 24 * 60 * 60 * 1000), // T+2
        transactionType,
        productType,
        productName: `${productType} - Premium Plan`,
        amount,
        fees,
        taxes,
        totalAmount,
        status: 'COMPLETED',
        description: `${transactionType} transaction for ${productType}`,
        portfolioImpact: transactionType === 'BUY' ? amount : -amount,
        createdAt: transactionDate
      });
    }
  }

  // Insert transactions in batches
  const batchSize = 10;
  for (let i = 0; i < juneTransactions.length; i += batchSize) {
    const batch = juneTransactions.slice(i, i + batchSize);
    await db.insert(transactions).values(batch);
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(juneTransactions.length / batchSize)}`);
  }

  console.log(`✅ Successfully added ${juneTransactions.length} June transactions`);
  
  // Calculate and display total fees for verification
  const totalFees = juneTransactions.reduce((sum, t) => sum + t.fees, 0);
  console.log(`💰 Total fees generated: ₹${(totalFees / 100000).toFixed(2)} Lakh`);
  console.log(`📊 Revenue MTD should now show: ₹${(totalFees / 10000000).toFixed(2)} Cr`);
}

addJuneTransactions().catch(console.error);