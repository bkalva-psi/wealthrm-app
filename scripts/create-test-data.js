// A simpler script to create test data
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Configure database connection
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable not set");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createTestData() {
  const client = await pool.connect();
  
  try {
    console.log("🌱 Creating test data...");
    
    // Start a transaction
    await client.query('BEGIN');
    
    // Get or create test user
    let userId;
    const userResult = await client.query('SELECT id FROM users WHERE username = $1', ['test']);
    
    if (userResult.rows.length === 0) {
      console.log("Creating test user...");
      const newUserResult = await client.query(
        'INSERT INTO users (username, password, full_name, role, email, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        ['test', 'password', 'Test User', 'admin', 'test@example.com', '+1234567890']
      );
      userId = newUserResult.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }
    
    console.log(`Using user ID: ${userId}`);
    
    // Clear existing data for this user
    await client.query('DELETE FROM clients WHERE assigned_to = $1', [userId]);
    await client.query('DELETE FROM prospects WHERE assigned_to = $1', [userId]);
    await client.query('DELETE FROM tasks WHERE assigned_to = $1', [userId]);
    await client.query('DELETE FROM appointments WHERE assigned_to = $1', [userId]);
    await client.query('DELETE FROM portfolio_alerts');
    await client.query('DELETE FROM performance_metrics WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM aum_trends WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM sales_pipeline WHERE user_id = $1', [userId]);
    
    // Add clients
    console.log("Adding clients...");
    const clients = [
      ['Rahul Sharma', 'RS', 'platinum', '₹75,00,000', 7500000, 'rahul.sharma@example.com', '+91 98765 43210', '2025-05-10', 'moderate'],
      ['Priya Patel', 'PP', 'gold', '₹45,00,000', 4500000, 'priya.patel@example.com', '+91 87654 32109', '2025-05-15', 'conservative'],
      ['Vikram Malhotra', 'VM', 'platinum', '₹90,00,000', 9000000, 'vikram.malhotra@example.com', '+91 76543 21098', '2025-05-05', 'aggressive'],
      ['Ananya Singh', 'AS', 'silver', '₹25,00,000', 2500000, 'ananya.singh@example.com', '+91 65432 10987', '2025-04-28', 'moderate'],
      ['Rajesh Kumar', 'RK', 'gold', '₹55,00,000', 5500000, 'rajesh.kumar@example.com', '+91 54321 09876', '2025-05-18', 'conservative']
    ];
    
    const clientIds = [];
    
    for (const client of clients) {
      const result = await client.query(
        `INSERT INTO clients 
         (full_name, initials, tier, aum, aum_value, email, phone, last_contact_date, risk_profile, assigned_to) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING id`,
        [...client, userId]
      );
      clientIds.push(result.rows[0].id);
    }
    
    // Add prospects
    console.log("Adding prospects...");
    const prospects = [
      ['Anjali Desai', 'AD', '₹30,00,000', 3000000, 'anjali.desai@example.com', '+91 43210 98765', 'discovery', 30, 'referral', '2025-05-17', 'Initial meeting went well. Interested in mutual funds.'],
      ['Deepak Verma', 'DV', '₹60,00,000', 6000000, 'deepak.verma@example.com', '+91 32109 87654', 'proposal', 60, 'website', '2025-05-14', 'Presented portfolio options. Following up next week.'],
      ['Meera Iyer', 'MI', '₹40,00,000', 4000000, 'meera.iyer@example.com', '+91 21098 76543', 'negotiation', 80, 'event', '2025-05-19', 'Close to finalizing. Need to discuss fee structure.']
    ];
    
    const prospectIds = [];
    
    for (const prospect of prospects) {
      const result = await client.query(
        `INSERT INTO prospects 
         (full_name, initials, potential_aum, potential_aum_value, email, phone, stage, probability, source, last_contact_date, notes, assigned_to) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
         RETURNING id`,
        [...prospect, userId]
      );
      prospectIds.push(result.rows[0].id);
    }
    
    // Add tasks
    console.log("Adding tasks...");
    const tasks = [
      ['Call Rahul Sharma about portfolio rebalancing', 'Discuss recent market changes and suggest adjustments', '2025-05-26', false, clientIds[0], null],
      ['Send investment proposal to Deepak Verma', 'Include conservative and moderate risk options', '2025-05-27', false, null, prospectIds[1]],
      ['Prepare for quarterly review with Priya Patel', 'Gather performance data and prepare presentation', '2025-05-28', false, clientIds[1], null],
      ['Follow up with Meera Iyer on contract signing', 'Address remaining questions about fees', '2025-05-25', false, null, prospectIds[2]]
    ];
    
    for (const task of tasks) {
      await client.query(
        `INSERT INTO tasks 
         (title, description, due_date, completed, client_id, prospect_id, assigned_to) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [...task, userId]
      );
    }
    
    // Add appointments
    console.log("Adding appointments...");
    const appointments = [
      ['meeting', 'Portfolio Review with Vikram Malhotra', 'Quarterly performance review', '2025-05-25 10:00:00', '2025-05-25 11:00:00', 'Virtual Meeting', 'high', clientIds[2], null],
      ['call', 'Initial Consultation with Anjali Desai', 'Understand investment goals and risk appetite', '2025-05-24 14:00:00', '2025-05-24 14:30:00', 'Phone', 'medium', null, prospectIds[0]],
      ['meeting', 'Contract Signing with Meera Iyer', 'Finalize investment terms and sign agreement', '2025-05-26 15:00:00', '2025-05-26 16:00:00', 'Ujjivan Branch Office', 'high', null, prospectIds[2]]
    ];
    
    for (const appointment of appointments) {
      await client.query(
        `INSERT INTO appointments 
         (type, title, description, start_time, end_time, location, priority, client_id, prospect_id, assigned_to) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [...appointment, userId]
      );
    }
    
    // Add portfolio alerts
    console.log("Adding portfolio alerts...");
    const alerts = [
      ['Market Volatility Alert', 'Recent market fluctuations may impact Rahul Sharma\'s aggressive fund positions', 'medium', clientIds[0], false, true],
      ['Investment Opportunity', 'New fixed income product available that matches Priya Patel\'s risk profile', 'low', clientIds[1], false, false],
      ['Portfolio Rebalance Needed', 'Vikram Malhotra\'s equity allocation has exceeded target threshold by 7%', 'high', clientIds[2], false, true]
    ];
    
    for (const alert of alerts) {
      await client.query(
        `INSERT INTO portfolio_alerts 
         (title, description, severity, client_id, read, action_required) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        alert
      );
    }
    
    // Add performance metrics
    console.log("Adding performance metrics...");
    const metrics = [
      ['new_clients', 3, 5, 20, 5, 2025],
      ['aum_growth', 22500000, 25000000, 15, 5, 2025],
      ['conversion_rate', 65, 70, 8, 5, 2025],
      ['client_retention', 95, 98, 2, 5, 2025]
    ];
    
    for (const metric of metrics) {
      await client.query(
        `INSERT INTO performance_metrics 
         (user_id, metric_type, current_value, target_value, percentage_change, month, year) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, ...metric]
      );
    }
    
    // Add AUM trends
    console.log("Adding AUM trends...");
    const baseValue = 18000000;
    const months = 6;
    const currentDate = new Date();
    
    for (let i = 0; i < months; i++) {
      const month = new Date(currentDate);
      month.setMonth(month.getMonth() - i);
      
      const currentValue = baseValue + (i * 1000000);
      const previousValue = i > 0 ? baseValue + ((i-1) * 1000000) : baseValue - 500000;
      
      await client.query(
        `INSERT INTO aum_trends 
         (user_id, month, year, current_value, previous_value) 
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, month.getMonth() + 1, month.getFullYear(), currentValue, previousValue]
      );
    }
    
    // Add sales pipeline
    console.log("Adding sales pipeline data...");
    const pipeline = [
      ['discovery', 2, 4000000],
      ['proposal', 1, 6000000],
      ['negotiation', 1, 4000000],
      ['closed', 1, 3000000]
    ];
    
    for (const entry of pipeline) {
      await client.query(
        `INSERT INTO sales_pipeline 
         (user_id, stage, count, value) 
         VALUES ($1, $2, $3, $4)`,
        [userId, ...entry]
      );
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log("✅ Test data created successfully!");
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error("Error creating test data:", error);
  } finally {
    client.release();
    pool.end();
  }
}

createTestData();