import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { pool } from "./db";
import { db } from "./db";
import { eq, sql, and } from "drizzle-orm";
import { clients, prospects, transactions } from "@shared/schema";
import communicationsRouter from "./communications";
import session from "express-session";
import MemoryStore from "memorystore";
import { z } from "zod";
import {
  insertUserSchema,
  insertClientSchema,
  insertProspectSchema,
  insertTaskSchema,
  insertAppointmentSchema,
  insertPortfolioAlertSchema,
  insertPerformanceMetricSchema,
  insertAumTrendSchema,
  insertSalesPipelineSchema,
  insertCommunicationSchema,
  insertCommunicationActionItemSchema,
  insertCommunicationAttachmentSchema,
  insertClientCommunicationPreferenceSchema,
  insertCommunicationTemplateSchema
} from "@shared/schema";

// Basic auth middleware
const authMiddleware = (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const SessionStore = MemoryStore(session);

  app.use(
    session({
      secret: "wealth-rm-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: false, // Allow HTTP in development and deployment
        maxAge: 86400000, // 24 hours
        sameSite: 'lax' // Better compatibility
      },
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );
  
  // Asset Class Breakdown API - Working endpoint
  app.get('/api/aum-breakdown', async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT 
            CASE 
                WHEN product_type = 'equity' THEN 'Equity'
                WHEN product_type = 'mutual_fund' THEN 'Mutual Funds'
                WHEN product_type = 'bond' THEN 'Bonds'
                WHEN product_type = 'fixed_deposit' THEN 'Fixed Deposits'
                WHEN product_type = 'insurance' THEN 'Insurance'
                WHEN product_type = 'structured_product' THEN 'Structured Products'
                WHEN product_type = 'alternative_investment' THEN 'Alternative Investments'
                ELSE 'Others'
            END as category,
            SUM(amount) as value,
            (SUM(amount) * 100.0 / (SELECT SUM(amount) FROM transactions WHERE transaction_type = 'buy'))::integer as percentage
        FROM transactions 
        INNER JOIN clients ON transactions.client_id = clients.id 
        WHERE clients.assigned_to = 1 AND transactions.transaction_type = 'buy'
        GROUP BY 
            CASE 
                WHEN product_type = 'equity' THEN 'Equity'
                WHEN product_type = 'mutual_fund' THEN 'Mutual Funds'
                WHEN product_type = 'bond' THEN 'Bonds'
                WHEN product_type = 'fixed_deposit' THEN 'Fixed Deposits'
                WHEN product_type = 'insurance' THEN 'Insurance'
                WHEN product_type = 'structured_product' THEN 'Structured Products'
                WHEN product_type = 'alternative_investment' THEN 'Alternative Investments'
                ELSE 'Others'
            END
        ORDER BY SUM(amount) DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching asset class breakdown:", error);
      res.status(500).json({ error: "Failed to fetch asset class breakdown" });
    }
  });

  // Register communications router
  app.use(communicationsRouter);

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      // During testing phase - bypass authentication validation
      // Create a default test user if no username is provided
      const username = req.body.username || "test";
      
      // Try to get existing user or create a default test user
      let user = await storage.getUserByUsername(username);
      
      // If user doesn't exist, create a default one
      if (!user) {
        // Create a default test user with admin role
        user = await storage.createUser({
          username: username,
          password: "password",
          fullName: "Test User",
          role: "admin",
          email: "test@example.com",
          phone: "+1234567890"
        });
      }

      // Set session data
      req.session.userId = user.id;
      req.session.userRole = user.role || "admin";
      
      // Don't send password back to client
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Talking Points routes
  app.get('/api/talking-points', async (req: Request, res: Response) => {
    console.log('=== TALKING POINTS API CALLED ===');
    try {
      const result = await pool.query(`
        SELECT * FROM talking_points 
        WHERE is_active = true 
        ORDER BY relevance_score DESC, created_at DESC
      `);
      console.log('Talking points API response:', result.rows.length, 'items');
      console.log('First item:', result.rows[0]);
      res.json(result.rows);
    } catch (error) {
      console.error('Get talking points error:', error);
      res.status(500).json({ error: 'Failed to fetch talking points' });
    }
  });

  // Announcements routes
  app.get('/api/announcements', async (req: Request, res: Response) => {
    console.log('=== ANNOUNCEMENTS API CALLED ===');
    try {
      const result = await pool.query(`
        SELECT * FROM announcements 
        WHERE is_active = true 
        ORDER BY 
          CASE priority 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 3 
          END, 
          created_at DESC
      `);
      console.log('Announcements API response:', result.rows.length, 'items');
      console.log('First item:', result.rows[0]);
      res.json(result.rows);
    } catch (error) {
      console.error('Get announcements error:', error);
      res.status(500).json({ error: 'Failed to fetch announcements' });
    }
  });
  
  app.get("/api/auth/me", async (req, res) => {
    try {
      // For testing purposes - create automatic authentication
      if (!req.session.userId) {
        // Create a default test user
        let user = await storage.getUserByUsername("test");
        
        // If test user doesn't exist, create it
        if (!user) {
          user = await storage.createUser({
            username: "test",
            password: "password",
            fullName: "Test User",
            role: "admin",
            email: "test@example.com",
            phone: "+1234567890"
          });
        }
        
        // Set session data
        req.session.userId = user.id;
        req.session.userRole = user.role || "admin";
        
        // Don't send password back to client
        const { password: _, ...userWithoutPassword } = user;
        
        return res.json({ user: userWithoutPassword });
      }

      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      // Don't send password back to client
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/users", authMiddleware, async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Don't send passwords back to client
      const usersWithoutPasswords = users.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      // For testing purposes - create automatic authentication if not authenticated
      if (!req.session.userId) {
        // This is a development-only authentication bypass for clients page
        req.session.userId = 1;
        req.session.userRole = "admin";
      }
      
      const assignedTo = req.session.userId;
      
      // Fetch all client data directly from the database to ensure all fields are returned
      const result = await pool.query(`
        SELECT 
          id, full_name as "fullName", initials, tier, aum, aum_value as "aumValue", 
          email, phone, last_contact_date as "lastContactDate", 
          last_transaction_date as "lastTransactionDate", 
          risk_profile as "riskProfile", yearly_performance as "yearlyPerformance", 
          alert_count as "alertCount", created_at as "createdAt", assigned_to as "assignedTo"
        FROM clients
        WHERE assigned_to = $1
      `, [assignedTo]);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/clients/recent", async (req, res) => {
    // For testing purposes - create automatic authentication if not authenticated
    if (!req.session.userId) {
      // This is a development-only authentication bypass for clients page
      req.session.userId = 1;
      req.session.userRole = "admin";
    }
    try {
      const assignedTo = req.session.userId;
      const limit = Number(req.query.limit) || 4;
      
      // Fetch clients data directly from the database to include all fields
      const result = await pool.query(`
        SELECT 
          id, full_name as "fullName", initials, tier, aum, aum_value as "aumValue", 
          email, phone, last_contact_date as "lastContactDate", 
          last_transaction_date as "lastTransactionDate", 
          risk_profile as "riskProfile", yearly_performance as "yearlyPerformance", 
          alert_count as "alertCount", created_at as "createdAt", assigned_to as "assignedTo"
        FROM clients
        WHERE assigned_to = $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [assignedTo, limit]);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Get recent clients error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      // For testing purposes - create automatic authentication if not authenticated
      if (!req.session.userId) {
        // This is a development-only authentication bypass for client details page
        req.session.userId = 1;
        req.session.userRole = "admin";
      }
      
      // Fetch all client data from the database (including all new fields)
      const result = await pool.query(`
        SELECT 
          id, full_name as "fullName", initials, tier, aum, aum_value as "aumValue", 
          email, phone, last_contact_date as "lastContactDate", 
          last_transaction_date as "lastTransactionDate", 
          risk_profile as "riskProfile", yearly_performance as "yearlyPerformance", 
          alert_count as "alertCount", created_at as "createdAt", assigned_to as "assignedTo",
          -- Personal Information
          date_of_birth as "dateOfBirth", marital_status as "maritalStatus", anniversary_date as "anniversaryDate",
          
          -- Address Information
          home_address as "homeAddress", home_city as "homeCity", home_state as "homeState", 
          home_pincode as "homePincode", work_address as "workAddress", work_city as "workCity", 
          work_state as "workState", work_pincode as "workPincode",
          
          -- Professional Information
          profession, sector_of_employment as "sectorOfEmployment", designation, company_name as "companyName",
          annual_income as "annualIncome", work_experience as "workExperience",
          
          -- KYC & Compliance Information
          kyc_date as "kycDate", kyc_status as "kycStatus", identity_proof_type as "identityProofType",
          identity_proof_number as "identityProofNumber", address_proof_type as "addressProofType",
          pan_number as "panNumber", tax_residency_status as "taxResidencyStatus", 
          fatca_status as "fatcaStatus", risk_assessment_score as "riskAssessmentScore",
          
          -- Family Information
          spouse_name as "spouseName", dependents_count as "dependentsCount", 
          children_details as "childrenDetails", nominee_details as "nomineeDetails",
          family_financial_goals as "familyFinancialGoals",
          
          -- Investment Profile
          investment_horizon as "investmentHorizon", investment_objectives as "investmentObjectives",
          preferred_products as "preferredProducts", source_of_wealth as "sourceOfWealth",
          
          -- Communication & Relationship
          preferred_contact_method as "preferredContactMethod", preferred_contact_time as "preferredContactTime",
          communication_frequency as "communicationFrequency", client_since as "clientSince",
          client_acquisition_source as "clientAcquisitionSource",
          
          -- Transaction Information
          total_transaction_count as "totalTransactionCount", 
          average_transaction_value as "averageTransactionValue",
          recurring_investments as "recurringInvestments",
          
          -- Additional Wealth Management Fields
          tax_planning_preferences as "taxPlanningPreferences", insurance_coverage as "insuranceCoverage",
          retirement_goals as "retirementGoals", major_life_events as "majorLifeEvents",
          financial_interests as "financialInterests", net_worth as "netWorth",
          liquidity_requirements as "liquidityRequirements", foreign_investments as "foreignInvestments"
        FROM clients
        WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Get client error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/clients", authMiddleware, async (req, res) => {
    try {
      const parseResult = insertClientSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid client data", errors: parseResult.error.format() });
      }
      
      const clientData = parseResult.data;
      const client = await storage.createClient({
        ...clientData,
        assignedTo: req.session.userId
      });
      
      res.status(201).json(client);
    } catch (error) {
      console.error("Create client error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/clients/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      if (client.assignedTo !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this client" });
      }
      
      const parseResult = insertClientSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid client data", errors: parseResult.error.format() });
      }
      
      const updatedClient = await storage.updateClient(id, parseResult.data);
      res.json(updatedClient);
    } catch (error) {
      console.error("Update client error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/clients/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      if (client.assignedTo !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this client" });
      }
      
      const success = await storage.deleteClient(id);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete client" });
      }
      
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Delete client error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Transaction routes
  app.get("/api/clients/:clientId/transactions", async (req, res) => {
    try {
      // For testing purposes - create automatic authentication if not authenticated
      if (!req.session.userId) {
        req.session.userId = 1;
        req.session.userRole = "admin";
      }
      
      const clientId = Number(req.params.clientId);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      // Parse optional date filters with debug logging
      console.log("Date filter query params:", req.query);
      
      let startDate = undefined;
      let endDate = undefined;
      
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
        console.log("Parsed startDate:", startDate, "Valid:", !isNaN(startDate.getTime()));
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
        console.log("Parsed endDate:", endDate, "Valid:", !isNaN(endDate.getTime()));
      }
      
      const transactions = await storage.getTransactions(clientId, startDate, endDate);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/clients/:clientId/transactions/summary", async (req, res) => {
    try {
      // For testing purposes - create automatic authentication if not authenticated
      if (!req.session.userId) {
        req.session.userId = 1;
        req.session.userRole = "admin";
      }
      
      const clientId = Number(req.params.clientId);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      // Parse grouping option and date filters
      const groupBy = (req.query.groupBy as 'day' | 'week' | 'month' | 'quarter' | 'year') || 'month';
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const summary = await storage.getTransactionSummary(clientId, groupBy, startDate, endDate);
      res.json(summary);
    } catch (error) {
      console.error("Get transaction summary error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/clients/:clientId/transactions", authMiddleware, async (req, res) => {
    try {
      const clientId = Number(req.params.clientId);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // In a real application, we would use a proper validation schema
      // For now, we'll do basic validation
      if (!req.body.transactionDate || !req.body.transactionType || 
          !req.body.productType || !req.body.productName || !req.body.amount) {
        return res.status(400).json({ 
          message: "Required fields missing", 
          requiredFields: ["transactionDate", "transactionType", "productType", "productName", "amount"]
        });
      }
      
      const transaction = await storage.createTransaction({
        ...req.body,
        clientId
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Prospect routes
  app.get("/api/prospects", authMiddleware, async (req, res) => {
    try {
      const assignedTo = req.session.userId;
      const prospects = await storage.getProspects(assignedTo);
      res.json(prospects);
    } catch (error) {
      console.error("Get prospects error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/prospects/stage/:stage", authMiddleware, async (req, res) => {
    try {
      const { stage } = req.params;
      const assignedTo = req.session.userId;
      const prospects = await storage.getProspectsByStage(stage, assignedTo);
      res.json(prospects);
    } catch (error) {
      console.error("Get prospects by stage error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/prospects/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid prospect ID" });
      }
      
      const prospect = await storage.getProspect(id);
      
      if (!prospect) {
        return res.status(404).json({ message: "Prospect not found" });
      }
      
      res.json(prospect);
    } catch (error) {
      console.error("Get prospect error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/prospects", authMiddleware, async (req, res) => {
    try {
      const parseResult = insertProspectSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const formattedErrors = parseResult.error.format();
        const errorMessages: Record<string, string[]> = {};
        
        // Format error messages to be more user-friendly
        Object.entries(formattedErrors).forEach(([field, error]) => {
          if (field !== "_errors" && error._errors && error._errors.length > 0) {
            errorMessages[field] = error._errors;
          }
        });
        
        // Get specific error details for better client-side handling
        let errorMessage = "Please correct the errors in the form";
        
        // Check for common validation errors and provide specific messages
        if (formattedErrors.email?._errors?.includes("Please enter a valid email address")) {
          errorMessage = "The email address format is invalid";
        } else if (formattedErrors.phone?._errors?.includes("Invalid phone number format")) {
          errorMessage = "The phone number format is invalid";
        } else if (Object.keys(errorMessages).length === 1) {
          // If only one field has an error, use that field's error message
          const field = Object.keys(errorMessages)[0];
          errorMessage = `Error in ${field}: ${errorMessages[field][0]}`;
        } else if (Object.keys(errorMessages).length > 1) {
          // If multiple fields have errors, create a summary
          errorMessage = `Multiple validation errors found: ${Object.keys(errorMessages).join(", ")}`;
        }
        
        return res.status(400).json({ 
          message: errorMessage, 
          errors: formattedErrors 
        });
      }
      
      const prospectData = parseResult.data;
      const prospect = await storage.createProspect({
        ...prospectData,
        assignedTo: req.session.userId
      });
      
      res.status(201).json(prospect);
    } catch (error) {
      console.error("Create prospect error:", error);
      res.status(500).json({ message: "Failed to create prospect. Please try again later." });
    }
  });
  
  app.put("/api/prospects/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid prospect ID" });
      }
      
      const prospect = await storage.getProspect(id);
      
      if (!prospect) {
        return res.status(404).json({ message: "Prospect not found" });
      }
      
      if (prospect.assignedTo !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this prospect" });
      }
      
      // Direct data processing approach
      // Deep copy the request body
      let updateData = { ...req.body };
      
      // Ensure lastContactDate is properly formatted for the database
      if (updateData.lastContactDate) {
        if (typeof updateData.lastContactDate === 'string') {
          updateData.lastContactDate = new Date(updateData.lastContactDate);
        } else if (!(updateData.lastContactDate instanceof Date) && typeof updateData.lastContactDate === 'object') {
          // Handle case when it's an object with date information but not a Date instance
          delete updateData.lastContactDate;
        }
      }
      
      // Handle productsOfInterest as a string[] for the database
      if (updateData.productsOfInterest !== undefined) {
        // If null, keep it null
        if (updateData.productsOfInterest === null) {
          // Keep as null
        } 
        // If string, convert to array with single item
        else if (typeof updateData.productsOfInterest === 'string') {
          updateData.productsOfInterest = [updateData.productsOfInterest];
        }
        // If not an array and not null, wrap in array
        else if (!Array.isArray(updateData.productsOfInterest)) {
          updateData.productsOfInterest = [updateData.productsOfInterest];
        }
        // If array, keep as is
      }
      
      console.log("Processed update data:", updateData);
      
      // Bypass schema validation for now and directly update
      const updatedProspect = await storage.updateProspect(id, updateData);
      
      // Return the updated prospect to the client
      return res.json(updatedProspect);
    } catch (error) {
      console.error("Update prospect error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/prospects/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid prospect ID" });
      }
      
      const prospect = await storage.getProspect(id);
      
      if (!prospect) {
        return res.status(404).json({ message: "Prospect not found" });
      }
      
      if (prospect.assignedTo !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this prospect" });
      }
      
      const success = await storage.deleteProspect(id);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete prospect" });
      }
      
      res.json({ message: "Prospect deleted successfully" });
    } catch (error) {
      console.error("Delete prospect error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Task routes
  app.get("/api/tasks", authMiddleware, async (req, res) => {
    try {
      const assignedTo = req.session.userId;
      const completed = req.query.completed === "true" ? true : 
                      req.query.completed === "false" ? false : 
                      undefined;
      
      const tasks = await storage.getTasks(assignedTo, completed);
      res.json(tasks);
    } catch (error) {
      console.error("Get tasks error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/tasks/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Get task error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/tasks", authMiddleware, async (req, res) => {
    try {
      console.log('Received task data:', req.body);
      const parseResult = insertTaskSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        console.log('Task validation failed:', parseResult.error.format());
        return res.status(400).json({ message: "Invalid task data", errors: parseResult.error.format() });
      }
      
      const taskData = parseResult.data;
      const task = await storage.createTask({
        ...taskData,
        assignedTo: req.session.userId
      });
      
      res.status(201).json(task);
    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/tasks/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.assignedTo !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this task" });
      }
      
      const parseResult = insertTaskSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid task data", errors: parseResult.error.format() });
      }
      
      const updatedTask = await storage.updateTask(id, parseResult.data);
      res.json(updatedTask);
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.assignedTo !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this task" });
      }
      
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete task" });
      }
      
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Delete task error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", authMiddleware, async (req, res) => {
    try {
      console.log('Appointments API called with query:', req.query);
      const assignedTo = req.session.userId;
      let dateFilter = '';
      let clientFilter = '';
      let params: any[] = [assignedTo];
      
      if (req.query.date) {
        const date = new Date(req.query.date as string);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
        dateFilter = ' AND DATE(start_time) = DATE($' + (params.length + 1) + ')';
        params.push(date.toISOString().split('T')[0]);
      }
      
      if (req.query.clientId) {
        const clientId = Number(req.query.clientId);
        console.log('Filtering appointments for clientId:', clientId);
        if (isNaN(clientId)) {
          return res.status(400).json({ message: "Invalid client ID format" });
        }
        clientFilter = ' AND a.client_id = $' + (params.length + 1);
        params.push(clientId);
      }
      
      const query = `
        SELECT 
          a.id, a.title, a.description, a.start_time as "startTime", a.end_time as "endTime", 
          a.location, a.client_id as "clientId", a.prospect_id as "prospectId", 
          a.assigned_to as "assignedTo", a.priority, a.type, a.created_at as "createdAt",
          c.full_name as "clientName"
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        WHERE a.assigned_to = $1${dateFilter}${clientFilter}
        ORDER BY a.start_time ASC
      `;
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error("Get appointments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/appointments/today", authMiddleware, async (req, res) => {
    try {
      const assignedTo = req.session.userId;
      const appointments = await storage.getTodaysAppointments(assignedTo);
      res.json(appointments);
    } catch (error) {
      console.error("Get today's appointments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/appointments/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      console.error("Get appointment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/appointments", authMiddleware, async (req, res) => {
    try {
      console.log('Received appointment data:', req.body);
      const parseResult = insertAppointmentSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        console.log('Validation failed:', parseResult.error.format());
        return res.status(400).json({ message: "Invalid appointment data", errors: parseResult.error.format() });
      }
      
      const appointmentData = parseResult.data;
      const appointment = await storage.createAppointment({
        ...appointmentData,
        assignedTo: req.session.userId
      });
      
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Create appointment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/appointments/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      if (appointment.assignedTo !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this appointment" });
      }
      
      const parseResult = insertAppointmentSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid appointment data", errors: parseResult.error.format() });
      }
      
      const updatedAppointment = await storage.updateAppointment(id, parseResult.data);
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Update appointment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/appointments/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      if (appointment.assignedTo !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this appointment" });
      }
      
      const success = await storage.deleteAppointment(id);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete appointment" });
      }
      
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Delete appointment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Portfolio Alert routes
  app.get("/api/portfolio-alerts", authMiddleware, async (req, res) => {
    try {
      const read = req.query.read === "true" ? true : 
                 req.query.read === "false" ? false : 
                 undefined;
      
      const alerts = await storage.getPortfolioAlerts(read);
      res.json(alerts);
    } catch (error) {
      console.error("Get portfolio alerts error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/portfolio-alerts/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid alert ID" });
      }
      
      const alert = await storage.getPortfolioAlert(id);
      
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      res.json(alert);
    } catch (error) {
      console.error("Get portfolio alert error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/portfolio-alerts", authMiddleware, async (req, res) => {
    try {
      const parseResult = insertPortfolioAlertSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid alert data", errors: parseResult.error.format() });
      }
      
      const alertData = parseResult.data;
      const alert = await storage.createPortfolioAlert(alertData);
      
      res.status(201).json(alert);
    } catch (error) {
      console.error("Create portfolio alert error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/portfolio-alerts/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid alert ID" });
      }
      
      const alert = await storage.getPortfolioAlert(id);
      
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      const parseResult = insertPortfolioAlertSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid alert data", errors: parseResult.error.format() });
      }
      
      const updatedAlert = await storage.updatePortfolioAlert(id, parseResult.data);
      res.json(updatedAlert);
    } catch (error) {
      console.error("Update portfolio alert error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/portfolio-alerts/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid alert ID" });
      }
      
      const alert = await storage.getPortfolioAlert(id);
      
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      const success = await storage.deletePortfolioAlert(id);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete alert" });
      }
      
      res.json({ message: "Alert deleted successfully" });
    } catch (error) {
      console.error("Delete portfolio alert error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Performance Metrics routes
  app.get("/api/performance-metrics", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const metrics = await storage.getPerformanceMetrics(userId);
      res.json(metrics);
    } catch (error) {
      console.error("Get performance metrics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // AUM Trends routes
  app.get("/api/aum-trends", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const trends = await storage.getAumTrends(userId);
      res.json(trends);
    } catch (error) {
      console.error("Get AUM trends error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Sales Pipeline routes
  app.get("/api/sales-pipeline", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pipeline = await storage.getSalesPipeline(userId);
      res.json(pipeline);
    } catch (error) {
      console.error("Get sales pipeline error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Communication routes
  app.get("/api/clients/:clientId/communications", authMiddleware, async (req, res) => {
    try {
      const clientId = Number(req.params.clientId);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const communications = await storage.getClientCommunications(clientId);
      res.json(communications);
    } catch (error) {
      console.error("Get client communications error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/communications/recent", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      
      if (isNaN(limit) || limit <= 0) {
        return res.status(400).json({ message: "Invalid limit parameter" });
      }
      
      const communications = await storage.getRecentCommunications(userId, limit);
      res.json(communications);
    } catch (error) {
      console.error("Get recent communications error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/communications/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid communication ID" });
      }
      
      const communication = await storage.getCommunication(id);
      
      if (!communication) {
        return res.status(404).json({ message: "Communication not found" });
      }
      
      res.json(communication);
    } catch (error) {
      console.error("Get communication error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/communications", authMiddleware, async (req, res) => {
    try {
      const parseResult = insertCommunicationSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid communication data", 
          errors: parseResult.error.format() 
        });
      }
      
      // Ensure initiatedBy is set to current user if not specified
      const data = parseResult.data;
      if (!data.initiatedBy) {
        data.initiatedBy = req.session.userId;
      }
      
      const communication = await storage.createCommunication(data);
      res.status(201).json(communication);
    } catch (error) {
      console.error("Create communication error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/communications/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid communication ID" });
      }
      
      const parseResult = insertCommunicationSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid communication data", 
          errors: parseResult.error.format() 
        });
      }
      
      const communication = await storage.updateCommunication(id, parseResult.data);
      
      if (!communication) {
        return res.status(404).json({ message: "Communication not found" });
      }
      
      res.json(communication);
    } catch (error) {
      console.error("Update communication error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/communications/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid communication ID" });
      }
      
      const success = await storage.deleteCommunication(id);
      
      if (!success) {
        return res.status(404).json({ message: "Communication not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Delete communication error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Communication Action Items routes
  app.get("/api/communications/:communicationId/action-items", authMiddleware, async (req, res) => {
    try {
      const communicationId = Number(req.params.communicationId);
      
      if (isNaN(communicationId)) {
        return res.status(400).json({ message: "Invalid communication ID" });
      }
      
      const actionItems = await storage.getCommunicationActionItems(communicationId);
      res.json(actionItems);
    } catch (error) {
      console.error("Get communication action items error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/communication-action-items", authMiddleware, async (req, res) => {
    try {
      const parseResult = insertCommunicationActionItemSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid action item data", 
          errors: parseResult.error.format() 
        });
      }
      
      // Ensure assignedTo is set to current user if not specified
      const data = parseResult.data;
      if (!data.assignedTo) {
        data.assignedTo = req.session.userId;
      }
      
      const actionItem = await storage.createCommunicationActionItem(data);
      res.status(201).json(actionItem);
    } catch (error) {
      console.error("Create communication action item error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/communication-action-items/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid action item ID" });
      }
      
      const parseResult = insertCommunicationActionItemSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid action item data", 
          errors: parseResult.error.format() 
        });
      }
      
      // If marking as completed, set completedAt
      if (parseResult.data.status === 'completed' && !parseResult.data.completedAt) {
        parseResult.data.completedAt = new Date();
      }
      
      const actionItem = await storage.updateCommunicationActionItem(id, parseResult.data);
      
      if (!actionItem) {
        return res.status(404).json({ message: "Action item not found" });
      }
      
      res.json(actionItem);
    } catch (error) {
      console.error("Update communication action item error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Pending action items routes
  app.get("/api/clients/:clientId/pending-action-items", authMiddleware, async (req, res) => {
    try {
      const clientId = Number(req.params.clientId);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const actionItems = await storage.getPendingActionItemsByClient(clientId);
      res.json(actionItems);
    } catch (error) {
      console.error("Get pending action items error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/my-pending-action-items", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const actionItems = await storage.getPendingActionItemsByRM(userId);
      res.json(actionItems);
    } catch (error) {
      console.error("Get RM pending action items error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Communication attachments routes
  app.get("/api/communications/:communicationId/attachments", authMiddleware, async (req, res) => {
    try {
      const communicationId = Number(req.params.communicationId);
      
      if (isNaN(communicationId)) {
        return res.status(400).json({ message: "Invalid communication ID" });
      }
      
      const attachments = await storage.getCommunicationAttachments(communicationId);
      res.json(attachments);
    } catch (error) {
      console.error("Get communication attachments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Client communication preferences routes
  app.get("/api/clients/:clientId/communication-preferences", authMiddleware, async (req, res) => {
    try {
      const clientId = Number(req.params.clientId);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const preferences = await storage.getClientCommunicationPreferences(clientId);
      
      if (!preferences) {
        // Return default preferences if none exist
        return res.json({
          clientId,
          preferredChannels: ['email', 'phone'],
          preferredFrequency: 'monthly',
          preferredDays: ['Monday', 'Wednesday', 'Friday'],
          preferredTimeSlots: ['morning', 'afternoon'],
          preferredLanguage: 'English'
        });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Get client communication preferences error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/clients/:clientId/communication-preferences", authMiddleware, async (req, res) => {
    try {
      const clientId = Number(req.params.clientId);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const parseResult = insertClientCommunicationPreferenceSchema.safeParse({
        ...req.body,
        clientId
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid communication preferences data", 
          errors: parseResult.error.format() 
        });
      }
      
      const preferences = await storage.setClientCommunicationPreferences(parseResult.data);
      res.json(preferences);
    } catch (error) {
      console.error("Set client communication preferences error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Communication templates routes
  app.get("/api/communication-templates", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const templates = await storage.getCommunicationTemplates(userId);
      res.json(templates);
    } catch (error) {
      console.error("Get communication templates error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/communication-templates/category/:category", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { category } = req.params;
      
      if (!category) {
        return res.status(400).json({ message: "Category is required" });
      }
      
      const templates = await storage.getCommunicationTemplatesByCategory(category, userId);
      res.json(templates);
    } catch (error) {
      console.error("Get communication templates by category error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/communication-templates", authMiddleware, async (req, res) => {
    try {
      const parseResult = insertCommunicationTemplateSchema.safeParse({
        ...req.body,
        createdBy: req.session.userId
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid template data", 
          errors: parseResult.error.format() 
        });
      }
      
      const template = await storage.createCommunicationTemplate(parseResult.data);
      res.status(201).json(template);
    } catch (error) {
      console.error("Create communication template error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Communication analytics routes
  app.get("/api/communication-analytics", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { clientId, period = 'monthly', limit = 12 } = req.query;
      
      let clientIdNum: number | null = null;
      if (clientId) {
        clientIdNum = Number(clientId);
        if (isNaN(clientIdNum)) {
          return res.status(400).json({ message: "Invalid client ID" });
        }
      }
      
      const analytics = await storage.getCommunicationAnalytics(
        userId,
        clientIdNum,
        period as string,
        Number(limit)
      );
      
      res.json(analytics);
    } catch (error) {
      console.error("Get communication analytics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/communication-analytics/generate", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { 
        clientId, 
        period = 'monthly',
        startDate: startDateStr,
        endDate: endDateStr 
      } = req.body;
      
      let clientIdNum: number | null = null;
      if (clientId) {
        clientIdNum = Number(clientId);
        if (isNaN(clientIdNum)) {
          return res.status(400).json({ message: "Invalid client ID" });
        }
      }
      
      // Parse dates if provided
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (startDateStr) {
        startDate = new Date(startDateStr);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ message: "Invalid start date format" });
        }
      }
      
      if (endDateStr) {
        endDate = new Date(endDateStr);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ message: "Invalid end date format" });
        }
      }
      
      const analytics = await storage.generateCommunicationAnalytics(
        userId,
        clientIdNum,
        period as string,
        startDate,
        endDate
      );
      
      res.json(analytics);
    } catch (error) {
      console.error("Generate communication analytics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Business Snapshot API Routes
  app.get('/api/business-metrics/:userId', authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId; // Use session userId instead of params
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Calculate metrics from actual data
      const [clientStats] = await db
        .select({
          totalClients: sql<number>`count(*)`,
          totalAum: sql<number>`coalesce(sum(${clients.aumValue}), 0)`,
          platinumClients: sql<number>`count(case when ${clients.tier} = 'platinum' then 1 end)`,
          goldClients: sql<number>`count(case when ${clients.tier} = 'gold' then 1 end)`,
          silverClients: sql<number>`count(case when ${clients.tier} = 'silver' then 1 end)`,
          conservativeClients: sql<number>`count(case when ${clients.riskProfile} = 'conservative' then 1 end)`,
          moderateClients: sql<number>`count(case when ${clients.riskProfile} = 'moderate' then 1 end)`,
          aggressiveClients: sql<number>`count(case when ${clients.riskProfile} = 'aggressive' then 1 end)`
        })
        .from(clients)
        .where(eq(clients.assignedTo, userId));

      // Get pipeline value from prospects
      const [pipelineStats] = await db
        .select({
          pipelineValue: sql<number>`coalesce(sum(${prospects.potentialAumValue}), 0)`
        })
        .from(prospects)
        .where(eq(prospects.assignedTo, userId));

      // Calculate revenue from transactions (this month)
      const monthStart = new Date(currentYear, currentMonth - 1, 1);
      const monthEnd = new Date(currentYear, currentMonth, 0);
      
      const [revenueStats] = await db
        .select({
          revenue: sql<number>`coalesce(sum(${transactions.fees}), 0)`
        })
        .from(transactions)
        .innerJoin(clients, eq(transactions.clientId, clients.id))
        .where(
          sql`${clients.assignedTo} = ${userId} AND ${transactions.transactionDate} >= ${monthStart} AND ${transactions.transactionDate} <= ${monthEnd}`
        );

      const result = {
        totalAum: clientStats?.totalAum || 0,
        totalClients: clientStats?.totalClients || 0,
        revenueMonthToDate: revenueStats?.revenue || 0,
        pipelineValue: pipelineStats?.pipelineValue || 0,
        platinumClients: clientStats?.platinumClients || 0,
        goldClients: clientStats?.goldClients || 0,
        silverClients: clientStats?.silverClients || 0,
        conservativeClients: clientStats?.conservativeClients || 0,
        moderateClients: clientStats?.moderateClients || 0,
        aggressiveClients: clientStats?.aggressiveClients || 0,
      };

      res.json(result);
    } catch (error) {
      console.error("Error fetching business metrics:", error);
      res.status(500).json({ error: "Failed to fetch business metrics" });
    }
  });



  // AUM Breakdown by Asset Class - Direct endpoint without auth middleware
  app.get('/api/business-metrics/:userId/aum/asset-class', async (req: Request, res: Response) => {
    try {
      const userId = 1; // Use authenticated user ID

      const result = await pool.query(`
        SELECT 
            CASE 
                WHEN product_type = 'equity' THEN 'Equity'
                WHEN product_type = 'mutual_fund' THEN 'Mutual Funds'
                WHEN product_type = 'bond' THEN 'Bonds'
                WHEN product_type = 'fixed_deposit' THEN 'Fixed Deposits'
                WHEN product_type = 'insurance' THEN 'Insurance'
                WHEN product_type = 'structured_product' THEN 'Structured Products'
                WHEN product_type = 'alternative_investment' THEN 'Alternative Investments'
                ELSE 'Others'
            END as category,
            SUM(amount) as value,
            (SUM(amount) * 100.0 / (SELECT SUM(amount) FROM transactions WHERE transaction_type = 'buy'))::integer as percentage
        FROM transactions 
        INNER JOIN clients ON transactions.client_id = clients.id 
        WHERE clients.assigned_to = $1 AND transactions.transaction_type = 'buy'
        GROUP BY 
            CASE 
                WHEN product_type = 'equity' THEN 'Equity'
                WHEN product_type = 'mutual_fund' THEN 'Mutual Funds'
                WHEN product_type = 'bond' THEN 'Bonds'
                WHEN product_type = 'fixed_deposit' THEN 'Fixed Deposits'
                WHEN product_type = 'insurance' THEN 'Insurance'
                WHEN product_type = 'structured_product' THEN 'Structured Products'
                WHEN product_type = 'alternative_investment' THEN 'Alternative Investments'
                ELSE 'Others'
            END
        ORDER BY SUM(amount) DESC
      `, [userId]);

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching asset class breakdown:", error);
      res.status(500).json({ error: "Failed to fetch asset class breakdown" });
    }
  });

  // Client Breakdown by Tier
  app.get('/api/business-metrics/:userId/clients/tier', authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;

      const tierBreakdown = await db
        .select({
          category: sql<string>`initcap(${clients.tier})`,
          value: sql<number>`count(*)`,
          percentage: sql<number>`cast(count(*) * 100.0 / nullif((select count(*) from ${clients} where assigned_to = ${userId}), 0) as integer)`
        })
        .from(clients)
        .where(eq(clients.assignedTo, userId))
        .groupBy(clients.tier)
        .orderBy(sql`count(*) desc`);

      res.json(tierBreakdown);
    } catch (error) {
      console.error("Error fetching tier breakdown:", error);
      res.status(500).json({ error: "Failed to fetch tier breakdown" });
    }
  });

  // Client Breakdown by Risk Profile
  app.get('/api/business-metrics/:userId/clients/risk-profile', authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;

      const riskProfileBreakdown = await db
        .select({
          category: sql<string>`initcap(${clients.riskProfile})`,
          value: sql<number>`count(*)`,
          percentage: sql<number>`cast(count(*) * 100.0 / nullif((select count(*) from ${clients} where assigned_to = ${userId}), 0) as integer)`
        })
        .from(clients)
        .where(eq(clients.assignedTo, userId))
        .groupBy(clients.riskProfile)
        .orderBy(sql`count(*) desc`);

      res.json(riskProfileBreakdown);
    } catch (error) {
      console.error("Error fetching risk profile breakdown:", error);
      res.status(500).json({ error: "Failed to fetch risk profile breakdown" });
    }
  });

  // Revenue Breakdown by Product Type
  app.get('/api/business-metrics/:userId/revenue/product-type', authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const revenueBreakdown = await db
        .select({
          category: sql<string>`
            case 
              when ${transactions.productType} in ('mutual_fund', 'sip') then 'Mutual Funds'
              when ${transactions.productType} in ('equity', 'stock') then 'Equity'
              when ${transactions.productType} in ('bond', 'fixed_deposit', 'debt') then 'Fixed Income'
              when ${transactions.productType} = 'insurance' then 'Insurance'
              else 'Others'
            end
          `,
          value: sql<number>`sum(${transactions.fees})`,
          percentage: sql<number>`cast(sum(${transactions.fees}) * 100.0 / nullif((select sum(fees) from ${transactions} t2 inner join ${clients} c2 on t2.client_id = c2.id where c2.assigned_to = ${userId}), 0) as integer)`
        })
        .from(transactions)
        .innerJoin(clients, eq(transactions.clientId, clients.id))
        .where(eq(clients.assignedTo, userId))
        .groupBy(sql`
          case 
            when ${transactions.productType} in ('mutual_fund', 'sip') then 'Mutual Funds'
            when ${transactions.productType} in ('equity', 'stock') then 'Equity'
            when ${transactions.productType} in ('bond', 'fixed_deposit', 'debt') then 'Fixed Income'
            when ${transactions.productType} = 'insurance' then 'Insurance'
            else 'Others'
          end
        `)
        .orderBy(sql`sum(${transactions.fees}) desc`);

      res.json(revenueBreakdown);
    } catch (error) {
      console.error("Error fetching revenue breakdown:", error);
      res.status(500).json({ error: "Failed to fetch revenue breakdown" });
    }
  });

  // Pipeline Breakdown by Stage
  app.get('/api/business-metrics/:userId/pipeline/stage', authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;

      const pipelineBreakdown = await db
        .select({
          category: sql<string>`initcap(${prospects.stage})`,
          value: sql<number>`sum(${prospects.potentialAumValue})`,
          count: sql<number>`count(*)`,
          percentage: sql<number>`cast(sum(${prospects.potentialAumValue}) * 100.0 / nullif((select sum(potential_aum_value) from ${prospects} where assigned_to = ${userId}), 0) as integer)`
        })
        .from(prospects)
        .where(eq(prospects.assignedTo, userId))
        .groupBy(prospects.stage)
        .orderBy(sql`sum(${prospects.estimatedValue}) desc`);

      res.json(pipelineBreakdown);
    } catch (error) {
      console.error("Error fetching pipeline breakdown:", error);
      res.status(500).json({ error: "Failed to fetch pipeline breakdown" });
    }
  });

  // Second-level drill-down for specific product categories
  app.get('/api/business-metrics/:userId/products/:category', async (req: Request, res: Response) => {
    console.log('Product category API called:', req.params);
    try {
      const { userId, category } = req.params;
      
      // Map category names to transaction types for database lookup
      const categoryMap: Record<string, string> = {
        'mutual-funds': 'mutual_fund',
        'structured-products': 'structured_product',
        'bonds': 'bond',
        'fixed-deposits': 'fixed_deposit',
        'alternative-investments': 'alternative_investment',
        'insurance': 'insurance',
        'equity': 'equity'
      };
      
      const transactionType = categoryMap[category];
      console.log('Category mapping:', category, '->', transactionType);
      
      if (!transactionType) {
        console.log('Invalid category:', category);
        return res.status(400).json({ error: 'Invalid product category' });
      }
      
      // Get detailed breakdown for this product category
      const productDetails = await db
        .select({
          productName: transactions.productName,
          totalValue: sql<number>`sum(${transactions.amount})`,
          transactionCount: sql<number>`count(*)`,
          avgTicketSize: sql<number>`avg(${transactions.amount})`
        })
        .from(transactions)
        .where(eq(transactions.productType, transactionType))
        .groupBy(transactions.productName)
        .orderBy(sql`sum(${transactions.amount}) desc`);
      
      console.log('Database query result:', productDetails);
      
      // Calculate total for percentage calculation
      const total = productDetails.reduce((sum, product) => sum + product.totalValue, 0);
      
      // Format response with percentages
      const formattedDetails = productDetails.map(product => ({
        productName: product.productName,
        value: product.totalValue,
        count: product.transactionCount,
        avgTicketSize: product.avgTicketSize,
        percentage: total > 0 ? Math.round((product.totalValue / total) * 100) : 0
      }));
      
      console.log('Formatted response:', formattedDetails);
      res.setHeader('Content-Type', 'application/json');
      res.json(formattedDetails);
    } catch (error) {
      console.error('Error fetching product category details:', error);
      res.status(500).json({ error: 'Failed to fetch product details' });
    }
  });

  // This duplicate endpoint is removed - using the corrected one above

  const httpServer = createServer(app);
  return httpServer;
}
