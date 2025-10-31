import { pool } from "../server/db";

async function addGenderColumn() {
  try {
    console.log("Adding gender column to clients table...");
    
    await pool.query(`
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS gender TEXT;
    `);
    
    console.log("✅ Gender column added successfully!");
    
    // Verify the column exists
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clients' AND column_name = 'gender';
    `);
    
    console.log("Column verification:", result.rows);
    
  } catch (error) {
    console.error("Error adding gender column:", error);
  } finally {
    await pool.end();
  }
}

addGenderColumn();
