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
  description: text("description").notNull(),
  dueDate: timestamp("due_date"),
  priority: text("priority").default("medium"), // low, medium, high
  status: text("status").default("pending"), // pending, in-progress, completed, cancelled
  assignedTo: integer("assigned_to").references(() => users.id).notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommunicationActionItemSchema = createInsertSchema(communicationActionItems).omit({
  id: true,
  createdAt: true,
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
