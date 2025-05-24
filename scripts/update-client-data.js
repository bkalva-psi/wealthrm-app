// Script to update client data with missing alert counts and transaction dates
import { pool } from '../server/db.js';

async function updateClientData() {
  try {
    console.log('Updating client data with alert counts and transaction dates...');

    // Get all clients
    const clientsResult = await pool.query('SELECT id FROM clients');
    const clients = clientsResult.rows;
    
    console.log(`Found ${clients.length} clients to update`);
    
    // Update each client with random alert counts and transaction dates
    for (const client of clients) {
      // Generate random alert count (0-3)
      const alertCount = Math.floor(Math.random() * 4);
      
      // Generate random transaction date (between 1-30 days ago)
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const lastTransactionDate = new Date();
      lastTransactionDate.setDate(lastTransactionDate.getDate() - daysAgo);
      
      // Generate random yearly performance (-2% to +15%)
      const yearlyPerformance = (Math.random() * 17 - 2).toFixed(1);
      
      // Update the client record
      await pool.query(
        'UPDATE clients SET alert_count = $1, last_transaction_date = $2, yearly_performance = $3 WHERE id = $4',
        [alertCount, lastTransactionDate, yearlyPerformance, client.id]
      );
      
      console.log(`Updated client ID ${client.id} with alert_count=${alertCount}, last_transaction_date=${lastTransactionDate.toISOString()}, yearly_performance=${yearlyPerformance}`);
    }
    
    console.log('Client data update completed successfully!');
    
  } catch (error) {
    console.error('Error updating client data:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the update function
updateClientData();