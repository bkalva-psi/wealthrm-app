import "../server/load-env";
import { pool } from "../server/db";

async function listAllTables() {
  try {
    console.log("🔍 Querying database for all tables...\n");
    
    // Query all tables in the public schema
    const result = await pool.query(`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log(`📊 Total Tables Found: ${result.rows.length}\n`);
    console.log("=" .repeat(50));
    
    result.rows.forEach((row, index) => {
      console.log(`${(index + 1).toString().padStart(2, ' ')}. ${row.table_name}`);
    });
    
    console.log("=".repeat(50));
    
    // Get detailed info for each table
    console.log("\n📋 Detailed Schema Information:\n");
    
    for (const row of result.rows) {
      const tableName = row.table_name;
      console.log(`\n📌 Table: ${tableName}`);
      console.log("-".repeat(50));
      
      const columns = await pool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);
      
      columns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
        const defaultVal = col.column_default ? ` ${col.column_default}` : '';
        console.log(`  • ${col.column_name.padEnd(30)} ${col.data_type} ${nullable}${defaultVal}`);
      });
    }
    
  } catch (error) {
    console.error("Error listing tables:", error);
  } finally {
    await pool.end();
  }
}

listAllTables();
