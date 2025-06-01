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
  estimatedValue: real("estimated_value"),
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
  productsOfInterest: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Task model
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  priority: text("priority").default("medium"), // low, medium, high
  clientId: integer("client_id").references(() => clients.id),
  prospectId: integer("prospect_id").references(() => prospects.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
}).extend({
  dueDate: z.string().transform((str) => new Date(str)).optional(),
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
}).extend({
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)),
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

// Business Metrics Aggregation Tables for Dashboard Analytics

// Client Portfolio Breakdown - stores current AUM breakdowns by various dimensions
export const clientPortfolioBreakdowns = pgTable("client_portfolio_breakdowns", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(), // RM managing the client
  
  // Dimension and value pairs
  dimension: text("dimension").notNull(), // asset_class, product_type, risk_profile, customer_segment, geography
  category: text("category").notNull(), // equity, debt, mf, etc. OR platinum, gold, silver, etc.
  
  // Financial values
  aumAmount: real("aum_amount").notNull(),
  investedAmount: real("invested_amount").notNull(),
  currentValue: real("current_value").notNull(),
  unrealizedGains: real("unrealized_gains").notNull(),
  
  // Metadata
  asOfDate: date("as_of_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// RM Business Metrics - aggregated metrics per RM for dashboard
export const rmBusinessMetrics = pgTable("rm_business_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Core business metrics
  totalAum: real("total_aum").notNull(),
  totalClients: integer("total_clients").notNull(),
  revenueMonthToDate: real("revenue_month_to_date").notNull(),
  pipelineValue: real("pipeline_value").notNull(),
  
  // Client tier distribution
  platinumClients: integer("platinum_clients").notNull().default(0),
  goldClients: integer("gold_clients").notNull().default(0),
  silverClients: integer("silver_clients").notNull().default(0),
  
  // Asset class distribution (amounts)
  equityAum: real("equity_aum").notNull().default(0),
  debtAum: real("debt_aum").notNull().default(0),
  mutualFundAum: real("mutual_fund_aum").notNull().default(0),
  othersAum: real("others_aum").notNull().default(0),
  
  // Risk profile distribution
  conservativeClients: integer("conservative_clients").notNull().default(0),
  moderateClients: integer("moderate_clients").notNull().default(0),
  aggressiveClients: integer("aggressive_clients").notNull().default(0),
  
  // Time-based data
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  asOfDate: date("as_of_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product Revenue Breakdown - for revenue drill-down analysis
export const productRevenue = pgTable("product_revenue", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Product information
  productType: text("product_type").notNull(), // mutual_fund, equity, bond, insurance, etc.
  productCategory: text("product_category"), // large_cap, debt, term_plan, etc.
  productName: text("product_name"),
  
  // Revenue metrics
  grossRevenue: real("gross_revenue").notNull(),
  netRevenue: real("net_revenue").notNull(),
  commissionRate: real("commission_rate"),
  trailCommission: real("trail_commission").notNull().default(0),
  upfrontCommission: real("upfront_commission").notNull().default(0),
  
  // Volume metrics
  transactionCount: integer("transaction_count").notNull().default(0),
  clientCount: integer("client_count").notNull().default(0),
  totalVolume: real("total_volume").notNull().default(0),
  
  // Time period
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer Segment Analysis - for client drill-down by segments
export const customerSegmentAnalysis = pgTable("customer_segment_analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Segment definition
  segmentType: text("segment_type").notNull(), // tier, age_group, profession, geography, aum_band
  segmentValue: text("segment_value").notNull(), // platinum, 25-35, corporate, mumbai, 1cr-5cr
  
  // Metrics for this segment
  clientCount: integer("client_count").notNull(),
  totalAum: real("total_aum").notNull(),
  averageAum: real("average_aum").notNull(),
  revenueContribution: real("revenue_contribution").notNull(),
  
  // Behavioral metrics
  averageTransactionSize: real("average_transaction_size"),
  transactionFrequency: real("transaction_frequency"), // transactions per month
  retentionRate: real("retention_rate"),
  
  // Growth metrics
  newClientsThisMonth: integer("new_clients_this_month").notNull().default(0),
  aumGrowthRate: real("aum_growth_rate"),
  
  // Time period
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  asOfDate: date("as_of_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pipeline Analysis - for prospect/pipeline drill-down
export const pipelineAnalysis = pgTable("pipeline_analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Pipeline stage breakdown
  stage: text("stage").notNull(), // new, qualified, proposal, negotiation, won, lost
  prospectCount: integer("prospect_count").notNull(),
  totalValue: real("total_value").notNull(),
  averageValue: real("average_value").notNull(),
  averageProbability: real("average_probability"),
  
  // Velocity metrics
  averageStageTime: integer("average_stage_time"), // days in this stage
  conversionRate: real("conversion_rate"), // to next stage
  
  // Source analysis
  leadSource: text("lead_source"), // referral, digital, events, cold_calling
  sourceProspectCount: integer("source_prospect_count"),
  sourceConversionRate: real("source_conversion_rate"),
  
  // Time period
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  asOfDate: date("as_of_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Client Complaints - for tracking customer service issues
export const clientComplaints = pgTable("client_complaints", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  assignedTo: integer("assigned_to").references(() => users.id).notNull(),
  
  // Complaint details
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // service_quality, transaction_issue, product_complaint, documentation, fees_charges, others
  subcategory: text("subcategory"), // delayed_execution, wrong_advice, mis_selling, etc.
  
  // Severity and status
  severity: text("severity").notNull(), // critical, high, medium, low
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  priority: text("priority").notNull(), // urgent, high, normal, low
  
  // Resolution details
  resolutionDetails: text("resolution_details"),
  resolutionDate: timestamp("resolution_date"),
  resolutionBy: integer("resolution_by").references(() => users.id),
  
  // Regulatory compliance
  isRegulatory: boolean("is_regulatory").notNull().default(false), // SEBI/RBI reportable
  regulatoryRefNumber: text("regulatory_ref_number"),
  
  // Timeline tracking
  reportedDate: timestamp("reported_date").notNull().defaultNow(),
  acknowledgmentDate: timestamp("acknowledgment_date"),
  targetResolutionDate: timestamp("target_resolution_date"),
  
  // Source and channel
  reportedVia: text("reported_via"), // phone, email, branch, online, mobile_app
  escalationLevel: integer("escalation_level").notNull().default(1), // 1=L1, 2=L2, etc.
  
  // Customer satisfaction
  resolutionRating: integer("resolution_rating"), // 1-5 scale
  customerFeedback: text("customer_feedback"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas for the new tables
export const insertClientPortfolioBreakdownSchema = createInsertSchema(clientPortfolioBreakdowns).omit({
  id: true,
  createdAt: true,
});

export const insertRmBusinessMetricSchema = createInsertSchema(rmBusinessMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertClientComplaintSchema = createInsertSchema(clientComplaints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Complaint = typeof clientComplaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertClientComplaintSchema>;

export const insertProductRevenueSchema = createInsertSchema(productRevenue).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSegmentAnalysisSchema = createInsertSchema(customerSegmentAnalysis).omit({
  id: true,
  createdAt: true,
});

export const insertPipelineAnalysisSchema = createInsertSchema(pipelineAnalysis).omit({
  id: true,
  createdAt: true,
});

// Export types for the new tables
export type ClientPortfolioBreakdown = typeof clientPortfolioBreakdowns.$inferSelect;
export type InsertClientPortfolioBreakdown = z.infer<typeof insertClientPortfolioBreakdownSchema>;

export type RmBusinessMetric = typeof rmBusinessMetrics.$inferSelect;
export type InsertRmBusinessMetric = z.infer<typeof insertRmBusinessMetricSchema>;

export type ProductRevenue = typeof productRevenue.$inferSelect;
export type InsertProductRevenue = z.infer<typeof insertProductRevenueSchema>;

export type CustomerSegmentAnalysis = typeof customerSegmentAnalysis.$inferSelect;
export type InsertCustomerSegmentAnalysis = z.infer<typeof insertCustomerSegmentAnalysisSchema>;

export type PipelineAnalysis = typeof pipelineAnalysis.$inferSelect;
export type InsertPipelineAnalysis = z.infer<typeof insertPipelineAnalysisSchema>;

// Communications model - track all client interactions
export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  initiatedBy: integer("initiated_by").references(() => users.id).notNull(), // the RM who initiated or received
  communicationType: text("communication_type").notNull(), // call, email, meeting, message, note
  direction: text("direction").notNull(), // inbound, outbound
  subject: text("subject").notNull(),
  summary: text("summary").notNull(),
  details: text("details"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
  channel: text("channel"), // phone, video, in-person, email, chat
  sentiment: text("sentiment").default("neutral"), // positive, neutral, negative
  followupRequired: boolean("followup_required").default(false),
  followupDate: timestamp("followup_date"),
  hasAttachments: boolean("has_attachments").default(false),
  tags: text("tags").array(), // topics discussed, categorization
  status: text("status").default("completed"), // scheduled, in-progress, completed, cancelled
  location: text("location"), // for in-person meetings
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommunicationSchema = createInsertSchema(communications).omit({
  id: true,
  createdAt: true,
});

// Communication Action Items - tasks generated from communications
export const communicationActionItems = pgTable("communication_action_items", {
  id: serial("id").primaryKey(),
  communicationId: integer("communication_id").references(() => communications.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: integer("assigned_to").references(() => users.id),
  dueDate: timestamp("due_date"),
  priority: text("priority").default("medium"), // low, medium, high
  status: text("status").default("pending"), // pending, in-progress, completed, cancelled
  completedAt: timestamp("completed_at"),
  actionType: text("action_type").default("task"), // task, deal_closure, follow_up
  dealValue: real("deal_value"), // monetary value for deal_closure type
  expectedCloseDate: timestamp("expected_close_date"), // expected closure date for deals
});

export const insertCommunicationActionItemSchema = createInsertSchema(communicationActionItems).omit({
  id: true,
  createdAt: true,
}).extend({
  dueDate: z.string().transform((str) => new Date(str)).optional(),
});

// Communication Attachments - documents exchanged in communications
export const communicationAttachments = pgTable("communication_attachments", {
  id: serial("id").primaryKey(),
  communicationId: integer("communication_id").references(() => communications.id).notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // PDF, DOCX, XLSX, JPG, etc.
  fileSize: integer("file_size").notNull(), // in bytes
  filePath: text("file_path").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  description: text("description"),
  isClientVisible: boolean("is_client_visible").default(true),
  viewedByClient: boolean("viewed_by_client").default(false),
  viewedAt: timestamp("viewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommunicationAttachmentSchema = createInsertSchema(communicationAttachments).omit({
  id: true,
  createdAt: true,
});

// Client Communication Preferences - detailed preferences for client communications
export const clientCommunicationPreferences = pgTable("client_communication_preferences", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).unique().notNull(),
  preferredChannels: text("preferred_channels").array(), // ranked list: [email, phone, in-person]
  preferredFrequency: text("preferred_frequency").default("monthly"), // daily, weekly, monthly, quarterly
  preferredDays: text("preferred_days").array(), // Monday, Tuesday, etc.
  preferredTimeSlots: text("preferred_time_slots").array(), // morning, afternoon, evening
  doNotContactTimes: text("do_not_contact_times"),
  preferredLanguage: text("preferred_language").default("English"),
  communicationStyle: text("communication_style"), // formal, informal, detailed, concise
  topicsOfInterest: text("topics_of_interest").array(), // market updates, tax planning, etc.
  optOutCategories: text("opt_out_categories").array(), // marketing, newsletters, etc.
  specialInstructions: text("special_instructions"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertClientCommunicationPreferenceSchema = createInsertSchema(clientCommunicationPreferences).omit({
  id: true,
  lastUpdated: true,
});

// Communication Templates - reusable templates for common communications
export const communicationTemplates = pgTable("communication_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // market update, portfolio review, birthday wish, etc.
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  variables: text("variables").array(), // placeholders like {{client_name}}, {{portfolio_value}}
  createdBy: integer("created_by").references(() => users.id).notNull(),
  isGlobal: boolean("is_global").default(false), // available to all RMs or just creator
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommunicationTemplateSchema = createInsertSchema(communicationTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Products - wealth management products offered by the bank
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  productCode: text("product_code").unique().notNull(),
  category: text("category").notNull(), // mutual_funds, bonds, equity, margin_lending, deposits, insurance, structured_products
  subCategory: text("sub_category"), // large_cap, debt, term_plan, etc.
  
  // Basic Details
  description: text("description").notNull(),
  keyFeatures: text("key_features").array(), // array of key features
  targetAudience: text("target_audience"), // HNI, retail, corporate, etc.
  
  // Investment Details
  minInvestment: integer("min_investment").notNull(), // in rupees
  maxInvestment: integer("max_investment"), // in rupees, null for no limit
  investmentMultiples: integer("investment_multiples").default(1000), // minimum increment amount
  
  // Risk and Returns
  riskLevel: text("risk_level").notNull(), // Low, Moderate, High, Very High
  expectedReturns: text("expected_returns"), // e.g., "8-12% p.a."
  lockInPeriod: integer("lock_in_period"), // in months, null if no lock-in
  
  // Terms and Conditions
  tenure: text("tenure"), // e.g., "1-5 years", "Open ended"
  exitLoad: text("exit_load"), // e.g., "1% if redeemed within 1 year"
  managementFee: real("management_fee"), // annual fee as percentage
  
  // Regulatory Information
  regulatoryApprovals: text("regulatory_approvals").array(), // SEBI, RBI, etc.
  taxImplications: text("tax_implications"),
  
  // Documents
  factsheetUrl: text("factsheet_url"), // path to PDF factsheet
  kimsUrl: text("kims_url"), // Key Information Memorandum
  applicationFormUrl: text("application_form_url"), // application form PDF
  
  // Status and Availability
  isActive: boolean("is_active").default(true),
  isOpenForSubscription: boolean("is_open_for_subscription").default(true),
  launchDate: timestamp("launch_date"),
  maturityDate: timestamp("maturity_date"), // for fixed tenure products
  
  // Performance Metrics (for tracking)
  totalSubscriptions: doublePrecision("total_subscriptions").default(0), // total amount subscribed
  totalInvestors: integer("total_investors").default(0),
  
  // Metadata
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Communication Analytics - aggregated metrics for communication analysis
export const communicationAnalytics = pgTable("communication_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // optional, if null = all RMs
  clientId: integer("client_id").references(() => clients.id), // optional, if null = all clients
  period: text("period").notNull(), // daily, weekly, monthly, quarterly, yearly
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalCommunications: integer("total_communications").notNull(),
  communicationsByType: jsonb("communications_by_type").notNull(), // {call: 10, email: 15, meeting: 5}
  communicationsByDirection: jsonb("communications_by_direction").notNull(), // {inbound: 15, outbound: 15}
  averageResponseTime: integer("average_response_time"), // in minutes
  averageDuration: integer("average_duration"), // in minutes
  communicationsByChannel: jsonb("communications_by_channel"), // {phone: 10, video: 5, in-person: 5, email: 10}
  sentimentAnalysis: jsonb("sentiment_analysis"), // {positive: 60, neutral: 30, negative: 10} (percentages)
  mostDiscussedTopics: jsonb("most_discussed_topics"), // {portfolio_review: 5, tax_planning: 3}
  communicationEffectiveness: real("communication_effectiveness"), // 0-100 score based on outcomes
  followupCompletion: real("followup_completion"), // percentage of follow-ups completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommunicationAnalyticSchema = createInsertSchema(communicationAnalytics).omit({
  id: true,
  createdAt: true,
});

// Export types for new tables
export type Communication = typeof communications.$inferSelect;
export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;

export type CommunicationActionItem = typeof communicationActionItems.$inferSelect;
export type InsertCommunicationActionItem = z.infer<typeof insertCommunicationActionItemSchema>;

export type CommunicationAttachment = typeof communicationAttachments.$inferSelect;
export type InsertCommunicationAttachment = z.infer<typeof insertCommunicationAttachmentSchema>;

export type ClientCommunicationPreference = typeof clientCommunicationPreferences.$inferSelect;
export type InsertClientCommunicationPreference = z.infer<typeof insertClientCommunicationPreferenceSchema>;

export type CommunicationTemplate = typeof communicationTemplates.$inferSelect;
export type InsertCommunicationTemplate = z.infer<typeof insertCommunicationTemplateSchema>;

export type CommunicationAnalytic = typeof communicationAnalytics.$inferSelect;
export type InsertCommunicationAnalytic = z.infer<typeof insertCommunicationAnalyticSchema>;

// Talking Points - insights and conversation starters for RMs
export const talkingPoints = pgTable("talking_points", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // quarterly_results, market_analysis, regulatory_update, product_launch, etc.
  summary: text("summary").notNull(),
  detailedContent: text("detailed_content").notNull(),
  source: text("source"), // Research team, Market analysis, News, etc.
  relevanceScore: integer("relevance_score").default(5), // 1-10 scale
  validUntil: timestamp("valid_until"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const insertTalkingPointSchema = createInsertSchema(talkingPoints).omit({
  id: true,
  createdAt: true,
});

// Announcements - messages from product team/CIO to RMs
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // campaign, compliance, incentive, product_update, regulation
  priority: text("priority").default("medium"), // high, medium, low
  targetAudience: text("target_audience").default("all_rms"), // all_rms, senior_rms, new_rms
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  author: text("author").notNull(), // Product Team, CIO, Compliance, etc.
  actionRequired: boolean("action_required").default(false),
  actionDeadline: timestamp("action_deadline"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

// Performance Targets - targets set for each RM by period
export const performanceTargets = pgTable("performance_targets", {
  id: serial("id").primaryKey(),
  rmId: integer("rm_id").references(() => users.id).notNull(),
  period: text("period").notNull(), // M, Q, HY, Y
  year: integer("year").notNull(),
  quarter: integer("quarter"), // 1-4 for quarterly, null for others
  month: integer("month"), // 1-12 for monthly, null for others
  
  // Primary Metrics Targets
  newClientsTarget: integer("new_clients_target").default(0),
  netNewMoneyTarget: doublePrecision("net_new_money_target").default(0), // in lakhs
  clientMeetingsTarget: integer("client_meetings_target").default(0),
  prospectPipelineTarget: doublePrecision("prospect_pipeline_target").default(0), // in lakhs
  revenueTarget: doublePrecision("revenue_target").default(0), // in lakhs
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPerformanceTargetSchema = createInsertSchema(performanceTargets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Performance Actuals - actual performance achieved by each RM
export const performanceActuals = pgTable("performance_actuals", {
  id: serial("id").primaryKey(),
  rmId: integer("rm_id").references(() => users.id).notNull(),
  period: text("period").notNull(), // M, Q, HY, Y
  year: integer("year").notNull(),
  quarter: integer("quarter"), // 1-4 for quarterly, null for others
  month: integer("month"), // 1-12 for monthly, null for others
  
  // Primary Metrics Actuals
  newClientsActual: integer("new_clients_actual").default(0),
  netNewMoneyActual: doublePrecision("net_new_money_actual").default(0), // in lakhs
  clientMeetingsActual: integer("client_meetings_actual").default(0),
  prospectPipelineActual: doublePrecision("prospect_pipeline_actual").default(0), // in lakhs
  revenueActual: doublePrecision("revenue_actual").default(0), // in lakhs
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPerformanceActualSchema = createInsertSchema(performanceActuals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Performance Peer Rankings - peer comparison data
export const performancePeerRankings = pgTable("performance_peer_rankings", {
  id: serial("id").primaryKey(),
  rmId: integer("rm_id").references(() => users.id).notNull(),
  period: text("period").notNull(), // M, Q, HY, Y
  year: integer("year").notNull(),
  quarter: integer("quarter"), // 1-4 for quarterly, null for others
  month: integer("month"), // 1-12 for monthly, null for others
  
  // Rankings (1 = best performer)
  newClientsRank: integer("new_clients_rank"),
  netNewMoneyRank: integer("net_new_money_rank"),
  clientMeetingsRank: integer("client_meetings_rank"),
  prospectPipelineRank: integer("prospect_pipeline_rank"),
  revenueRank: integer("revenue_rank"),
  overallRank: integer("overall_rank"),
  
  // Percentiles (0-100, higher is better)
  newClientsPercentile: integer("new_clients_percentile"),
  netNewMoneyPercentile: integer("net_new_money_percentile"),
  clientMeetingsPercentile: integer("client_meetings_percentile"),
  prospectPipelinePercentile: integer("prospect_pipeline_percentile"),
  revenuePercentile: integer("revenue_percentile"),
  overallPercentile: integer("overall_percentile"),
  
  totalRMs: integer("total_rms").notNull(), // total number of RMs for context
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPerformancePeerRankingSchema = createInsertSchema(performancePeerRankings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types for all tables
export type TalkingPoint = typeof talkingPoints.$inferSelect;
export type InsertTalkingPoint = z.infer<typeof insertTalkingPointSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export type PerformanceTarget = typeof performanceTargets.$inferSelect;
export type InsertPerformanceTarget = z.infer<typeof insertPerformanceTargetSchema>;

export type PerformanceActual = typeof performanceActuals.$inferSelect;
export type InsertPerformanceActual = z.infer<typeof insertPerformanceActualSchema>;

export type PerformancePeerRanking = typeof performancePeerRankings.$inferSelect;
export type InsertPerformancePeerRanking = z.infer<typeof insertPerformancePeerRankingSchema>;

// Performance Incentives - earned, projected, and possible incentives
export const performanceIncentives = pgTable("performance_incentives", {
  id: serial("id").primaryKey(),
  rmId: integer("rm_id").references(() => users.id).notNull(),
  period: text("period").notNull(), // M, Q, HY, Y
  year: integer("year").notNull(),
  quarter: integer("quarter"), // 1-4 for quarterly, null for others
  month: integer("month"), // 1-12 for monthly, null for others
  
  // Incentive amounts in rupees
  earnedAmount: doublePrecision("earned_amount").default(0), // Already earned
  projectedAmount: doublePrecision("projected_amount").default(0), // Projected for full period
  possibleAmount: doublePrecision("possible_amount").default(0), // Maximum possible
  
  // Target achievement percentages
  targetAchievementPercent: doublePrecision("target_achievement_percent").default(0),
  
  // Incentive breakdown by category
  baseIncentive: doublePrecision("base_incentive").default(0),
  performanceBonus: doublePrecision("performance_bonus").default(0),
  teamBonus: doublePrecision("team_bonus").default(0),
  specialIncentives: doublePrecision("special_incentives").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPerformanceIncentiveSchema = createInsertSchema(performanceIncentives).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PerformanceIncentive = typeof performanceIncentives.$inferSelect;
export type InsertPerformanceIncentive = z.infer<typeof insertPerformanceIncentiveSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
