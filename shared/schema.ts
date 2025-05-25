import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, date, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("relationship_manager"),
  avatarUrl: text("avatar_url"),
  jobTitle: text("job_title"),
  email: text("email"),
  phone: text("phone"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Client model
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  // Basic Personal Information
  fullName: text("full_name").notNull(),
  initials: text("initials"),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth"),
  maritalStatus: text("marital_status"), // Single, Married, Divorced, Widowed
  anniversaryDate: timestamp("anniversary_date"),
  
  // Address Information
  homeAddress: text("home_address"),
  homeCity: text("home_city"),
  homeState: text("home_state"),
  homePincode: text("home_pincode"),
  workAddress: text("work_address"),
  workCity: text("work_city"),
  workState: text("work_state"),
  workPincode: text("work_pincode"),
  
  // Professional Information
  profession: text("profession"),
  sectorOfEmployment: text("sector_of_employment"),
  designation: text("designation"),
  companyName: text("company_name"),
  annualIncome: text("annual_income"),
  workExperience: integer("work_experience"), // in years
  
  // KYC & Compliance Information
  kycDate: timestamp("kyc_date"),
  kycStatus: text("kyc_status"), // Verified, Pending, Expired
  identityProofType: text("identity_proof_type"), // Aadhaar, PAN, Passport
  identityProofNumber: text("identity_proof_number"),
  addressProofType: text("address_proof_type"),
  panNumber: text("pan_number"),
  taxResidencyStatus: text("tax_residency_status"),
  fatcaStatus: text("fatca_status"),
  riskAssessmentScore: integer("risk_assessment_score"),
  
  // Family Information
  spouseName: text("spouse_name"),
  dependentsCount: integer("dependents_count"),
  childrenDetails: text("children_details"), // Stored as JSON text
  nomineeDetails: text("nominee_details"),
  familyFinancialGoals: text("family_financial_goals"),
  
  // Investment Profile
  tier: text("tier").notNull().default("silver"), // silver, gold, platinum
  aum: text("aum").notNull(), // Assets Under Management
  aumValue: real("aum_value").notNull(), // Numeric value for sorting
  riskProfile: text("risk_profile").default("moderate"), // conservative, moderate, aggressive
  investmentHorizon: text("investment_horizon"), // Short-term, Medium-term, Long-term
  
  // Portfolio Information
  totalInvestedAmount: integer("total_invested_amount"),
  currentValue: integer("current_value"),
  unrealizedGains: integer("unrealized_gains"),
  unrealizedGainsPercent: doublePrecision("unrealized_gains_percent"),
  oneYearReturn: doublePrecision("one_year_return"),
  threeYearReturn: doublePrecision("three_year_return"),
  fiveYearReturn: doublePrecision("five_year_return"),
  portfolioStartDate: date("portfolio_start_date"),
  lastValuationDate: date("last_valuation_date"),
  riskScore: integer("risk_score"),
  esgScore: integer("esg_score"),
  volatility: doublePrecision("volatility"),
  sharpeRatio: doublePrecision("sharpe_ratio"),
  assetAllocation: jsonb("asset_allocation"), // {equity: 60, fixedIncome: 30, cash: 5, alternative: 5}
  sectorExposure: jsonb("sector_exposure"), // {financial: 30, technology: 25, ...}
  geographicExposure: jsonb("geographic_exposure"), // {india: 80, us: 15, ...}
  investmentObjectives: text("investment_objectives"), // Comma-separated or JSON
  preferredProducts: text("preferred_products"), // Comma-separated or JSON
  sourceOfWealth: text("source_of_wealth"),
  
  // Communication & Relationship
  lastContactDate: timestamp("last_contact_date"),
  preferredContactMethod: text("preferred_contact_method"), // Email, Phone, In-person
  preferredContactTime: text("preferred_contact_time"), // Morning, Afternoon, Evening
  communicationFrequency: text("communication_frequency"), // Weekly, Monthly, Quarterly
  clientSince: timestamp("client_since"),
  clientAcquisitionSource: text("client_acquisition_source"),
  
  // Transaction Information
  lastTransactionDate: timestamp("last_transaction_date"),
  totalTransactionCount: integer("total_transaction_count"),
  averageTransactionValue: real("average_transaction_value"),
  recurringInvestments: text("recurring_investments"), // JSON text
  
  // Additional Wealth Management Fields
  taxPlanningPreferences: text("tax_planning_preferences"),
  insuranceCoverage: text("insurance_coverage"), // JSON text
  retirementGoals: text("retirement_goals"),
  majorLifeEvents: text("major_life_events"), // JSON text
  financialInterests: text("financial_interests"), // Comma-separated
  netWorth: text("net_worth"),
  liquidityRequirements: text("liquidity_requirements"),
  foreignInvestments: text("foreign_investments"),
  
  // System Fields
  alertCount: integer("alert_count").default(0), // Number of active alerts
  createdAt: timestamp("created_at").defaultNow(),
  assignedTo: integer("assigned_to").references(() => users.id),
  
  // Document references could be added here or in a separate table
  // For now, we'll assume documents are stored in a separate table
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

// Prospect model (leads in pipeline)
export const prospects = pgTable("prospects", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  initials: text("initials"),
  potentialAum: text("potential_aum"),
  potentialAumValue: real("potential_aum_value"),
  email: text("email"),
  phone: text("phone"),
  stage: text("stage").notNull().default("new"), // new, qualified, proposal, won, lost
  lastContactDate: timestamp("last_contact_date"),
  probabilityScore: integer("probability_score").default(50), // 0-100
  productsOfInterest: text("products_of_interest").array(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  assignedTo: integer("assigned_to").references(() => users.id),
});

// Base prospect schema
const baseProspectSchema = createInsertSchema(prospects).omit({
  id: true,
  createdAt: true,
});

// Enhanced prospect schema with better validation and error messages
export const insertProspectSchema = baseProspectSchema.extend({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^[+]?[0-9\s-()]+$/, "Invalid phone number format"),
  potentialAum: z.string().min(1, "Potential AUM is required"),
  potentialAumValue: z.number().min(0, "Potential AUM value cannot be negative"),
  stage: z.string().min(1, "Stage is required"),
  probabilityScore: z.number().min(0, "Probability must be at least 0%").max(100, "Probability cannot exceed 100%"),
  initials: z.string().optional(),
  lastContactDate: z.date().optional().nullable(),
  productsOfInterest: z.string().optional(),
  notes: z.string().optional(),
});

// Task model
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  clientId: integer("client_id").references(() => clients.id),
  prospectId: integer("prospect_id").references(() => prospects.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Meeting/Appointment model
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  clientId: integer("client_id").references(() => clients.id),
  prospectId: integer("prospect_id").references(() => prospects.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  priority: text("priority").default("medium"), // low, medium, high
  type: text("type").notNull(), // meeting, call, email, other
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

// Portfolio Alert model
export const portfolioAlerts = pgTable("portfolio_alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  clientId: integer("client_id").references(() => clients.id),
  severity: text("severity").notNull(), // info, warning, critical
  read: boolean("read").default(false),
  actionRequired: boolean("action_required").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPortfolioAlertSchema = createInsertSchema(portfolioAlerts).omit({
  id: true,
  createdAt: true,
});

// Performance Metrics model
export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  metricType: text("metric_type").notNull(), // new_aum, new_clients, revenue, retention
  currentValue: real("current_value").notNull(),
  targetValue: real("target_value").notNull(),
  percentageChange: real("percentage_change"),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  createdAt: true,
});

// Monthly AUM Trend model
export const aumTrends = pgTable("aum_trends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  currentValue: real("current_value").notNull(),
  previousValue: real("previous_value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAumTrendSchema = createInsertSchema(aumTrends).omit({
  id: true,
  createdAt: true,
});

// Sales Pipeline model
export const salesPipeline = pgTable("sales_pipeline", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stage: text("stage").notNull(), // new_leads, qualified, proposal, closed
  count: integer("count").notNull().default(0),
  value: real("value").notNull().default(0), // value in the pipeline
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSalesPipelineSchema = createInsertSchema(salesPipeline).omit({
  id: true,
  createdAt: true,
});

// Transactions model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  settlementDate: timestamp("settlement_date"),
  transactionType: text("transaction_type").notNull(), // buy, sell, dividend, interest, fee, deposit, withdrawal
  productType: text("product_type").notNull(), // equity, mutual_fund, bond, fixed_deposit, insurance, etc.
  productName: text("product_name").notNull(),
  productCategory: text("product_category"), // large_cap, mid_cap, small_cap, debt, hybrid, etc.
  quantity: real("quantity"),
  price: real("price"),
  amount: real("amount").notNull(),
  fees: real("fees").default(0),
  taxes: real("taxes").default(0),
  totalAmount: real("total_amount").notNull(),
  currencyCode: text("currency_code").default("INR"),
  status: text("status").notNull().default("completed"), // pending, completed, failed, cancelled
  reference: text("reference"), // Reference number or ID
  description: text("description"),
  portfolioImpact: real("portfolio_impact"), // Percentage change in portfolio value
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Prospect = typeof prospects.$inferSelect;
export type InsertProspect = z.infer<typeof insertProspectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type PortfolioAlert = typeof portfolioAlerts.$inferSelect;
export type InsertPortfolioAlert = z.infer<typeof insertPortfolioAlertSchema>;

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;

export type AumTrend = typeof aumTrends.$inferSelect;
export type InsertAumTrend = z.infer<typeof insertAumTrendSchema>;

export type SalesPipeline = typeof salesPipeline.$inferSelect;
export type InsertSalesPipeline = z.infer<typeof insertSalesPipelineSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
