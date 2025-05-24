import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
  insertSalesPipelineSchema
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
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

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
  app.get("/api/clients", authMiddleware, async (req, res) => {
    try {
      const assignedTo = req.session.userId;
      const clients = await storage.getClients(assignedTo);
      res.json(clients);
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/clients/recent", authMiddleware, async (req, res) => {
    try {
      const assignedTo = req.session.userId;
      const limit = Number(req.query.limit) || 4;
      const clients = await storage.getRecentClients(limit, assignedTo);
      res.json(clients);
    } catch (error) {
      console.error("Get recent clients error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/clients/:id", authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
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
      const parseResult = insertTaskSchema.safeParse(req.body);
      
      if (!parseResult.success) {
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
      const assignedTo = req.session.userId;
      let date: Date | undefined = undefined;
      
      if (req.query.date) {
        date = new Date(req.query.date as string);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      }
      
      const appointments = await storage.getAppointments(assignedTo, date);
      res.json(appointments);
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
      const parseResult = insertAppointmentSchema.safeParse(req.body);
      
      if (!parseResult.success) {
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

  const httpServer = createServer(app);
  return httpServer;
}
