import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function migrateClientSchema() {
  console.log("Migrating client schema with new columns...");

  try {
    // First, we need to add all the new columns to the table
    // We'll do this in a transaction to ensure it's atomic
    await db.transaction(async (tx) => {
      // Basic Personal Information
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS date_of_birth TIMESTAMP`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS marital_status TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS anniversary_date TIMESTAMP`);
      
      // Address Information
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS home_address TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS home_city TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS home_state TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS home_pincode TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS work_address TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS work_city TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS work_state TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS work_pincode TEXT`);
      
      // Professional Information
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS profession TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS sector_of_employment TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS designation TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS company_name TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS annual_income TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS work_experience INTEGER`);
      
      // KYC & Compliance Information
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_date TIMESTAMP`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS kyc_status TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS identity_proof_type TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS identity_proof_number TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_proof_type TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS pan_number TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_residency_status TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS fatca_status TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS risk_assessment_score INTEGER`);
      
      // Family Information
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS spouse_name TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS dependents_count INTEGER`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS children_details TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS nominee_details TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS family_financial_goals TEXT`);
      
      // Investment Profile
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS investment_horizon TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS investment_objectives TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_products TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS source_of_wealth TEXT`);
      
      // Communication & Relationship
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_contact_time TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS communication_frequency TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_since TIMESTAMP`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_acquisition_source TEXT`);
      
      // Transaction Information
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_transaction_count INTEGER`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS average_transaction_value REAL`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS recurring_investments TEXT`);
      
      // Additional Wealth Management Fields
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_planning_preferences TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS insurance_coverage TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS retirement_goals TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS major_life_events TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS financial_interests TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS net_worth TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS liquidity_requirements TEXT`);
      await tx.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS foreign_investments TEXT`);
    });

    console.log("Successfully migrated client schema!");
  } catch (error) {
    console.error("Error migrating client schema:", error);
    throw error;
  }
}

// Execute the function
migrateClientSchema()
  .then(() => {
    console.log("Schema migration completed successfully");
    process.exit(0);
  })
  .catch(error => {
    console.error("Schema migration failed:", error);
    process.exit(1);
  });