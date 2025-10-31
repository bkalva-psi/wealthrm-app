import "../server/load-env";
import { pool } from "../server/db";
import fs from "fs";

/**
 * Export script to migrate from Neon to Supabase
 * This exports schema SQL and data as CSV/JSON
 */

async function exportNeonDatabase() {
  try {
    console.log("📦 Starting Neon database export...\n");

    // 1. Export schema (DDL)
    console.log("1️⃣ Exporting database schema...");
    const schemaResult = await pool.query(`
      SELECT 
        'CREATE TABLE IF NOT EXISTS ' || schemaname || '.' || tablename || ' (' || 
        string_agg(column_definition, ', ') || ');' as create_statement
      FROM (
        SELECT 
          c.table_schema as schemaname,
          c.table_name as tablename,
          c.column_name || ' ' || 
          CASE 
            WHEN c.data_type = 'character varying' THEN 'VARCHAR(' || COALESCE(c.character_maximum_length::text, '255') || ')'
            WHEN c.data_type = 'character' THEN 'CHAR(' || COALESCE(c.character_maximum_length::text, '1') || ')'
            WHEN c.data_type = 'numeric' THEN 'NUMERIC(' || COALESCE(c.numeric_precision::text, '') || ',' || COALESCE(c.numeric_scale::text, '') || ')'
            WHEN c.data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
            WHEN c.data_type = 'timestamp with time zone' THEN 'TIMESTAMPTZ'
            WHEN c.data_type = 'integer' THEN 'INTEGER'
            WHEN c.data_type = 'bigint' THEN 'BIGINT'
            WHEN c.data_type = 'real' THEN 'REAL'
            WHEN c.data_type = 'double precision' THEN 'DOUBLE PRECISION'
            WHEN c.data_type = 'boolean' THEN 'BOOLEAN'
            WHEN c.data_type = 'text' THEN 'TEXT'
            WHEN c.data_type = 'jsonb' THEN 'JSONB'
            WHEN c.data_type = 'date' THEN 'DATE'
            ELSE c.data_type
          END ||
          CASE WHEN c.is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
          CASE 
            WHEN c.column_default IS NOT NULL THEN ' DEFAULT ' || c.column_default
            ELSE ''
          END as column_definition
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
        ORDER BY c.table_name, c.ordinal_position
      ) t
      GROUP BY schemaname, tablename;
    `);

    const schemaSQL = schemaResult.rows.map(r => r.create_statement).join('\n\n');
    fs.writeFileSync('neon-export-schema.sql', schemaSQL);
    console.log("✅ Schema exported to: neon-export-schema.sql\n");

    // 2. Get all table names
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`2️⃣ Found ${tables.length} tables to export data from\n`);

    // 3. Export data for each table
    console.log("3️⃣ Exporting table data...");
    const dataExports: Record<string, any[]> = {};

    for (const table of tables) {
      try {
        const dataResult = await pool.query(`SELECT * FROM ${table}`);
        dataExports[table] = dataResult.rows;
        console.log(`   ✅ ${table}: ${dataResult.rows.length} rows`);
      } catch (error) {
        console.error(`   ❌ Error exporting ${table}:`, error);
      }
    }

    // Save data as JSON
    fs.writeFileSync('neon-export-data.json', JSON.stringify(dataExports, null, 2));
    console.log("\n✅ Data exported to: neon-export-data.json\n");

    // 4. Export sequences
    console.log("4️⃣ Exporting sequences...");
    const sequencesResult = await pool.query(`
      SELECT sequence_name, last_value
      FROM information_schema.sequences
      WHERE sequence_schema = 'public';
    `);

    fs.writeFileSync('neon-export-sequences.json', JSON.stringify(sequencesResult.rows, null, 2));
    console.log("✅ Sequences exported to: neon-export-sequences.json\n");

    console.log("🎉 Export complete!");
    console.log("\nNext steps:");
    console.log("1. Review neon-export-schema.sql");
    console.log("2. Review neon-export-data.json");
    console.log("3. Import to Supabase (see migration guide)");

  } catch (error) {
    console.error("❌ Export failed:", error);
  } finally {
    await pool.end();
  }
}

exportNeonDatabase();
