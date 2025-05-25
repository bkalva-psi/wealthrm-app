import {
  users, User, InsertUser,
  clients, Client, InsertClient,
  prospects, Prospect, InsertProspect,
  tasks, Task, InsertTask,
  appointments, Appointment, InsertAppointment,
  portfolioAlerts, PortfolioAlert, InsertPortfolioAlert,
  performanceMetrics, PerformanceMetric, InsertPerformanceMetric,
  aumTrends, AumTrend, InsertAumTrend,
  salesPipeline, SalesPipeline, InsertSalesPipeline,
  transactions, Transaction, InsertTransaction
} from "@shared/schema";
import { eq, and, gte, lt, lte, desc } from "drizzle-orm";
import { db } from "./db";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  // Client methods
  getClient(id: number): Promise<Client | undefined>;
  getClients(assignedTo?: number): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  getRecentClients(limit: number, assignedTo?: number): Promise<Client[]>;

  // Prospect methods
  getProspect(id: number): Promise<Prospect | undefined>;
  getProspects(assignedTo?: number): Promise<Prospect[]>;
  createProspect(prospect: InsertProspect): Promise<Prospect>;
  updateProspect(id: number, prospect: Partial<InsertProspect>): Promise<Prospect | undefined>;
  deleteProspect(id: number): Promise<boolean>;
  getProspectsByStage(stage: string, assignedTo?: number): Promise<Prospect[]>;

  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getTasks(assignedTo?: number, completed?: boolean): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Appointment methods
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointments(assignedTo?: number, date?: Date): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  getTodaysAppointments(assignedTo?: number): Promise<Appointment[]>;

  // Portfolio Alert methods
  getPortfolioAlert(id: number): Promise<PortfolioAlert | undefined>;
  getPortfolioAlerts(read?: boolean): Promise<PortfolioAlert[]>;
  createPortfolioAlert(alert: InsertPortfolioAlert): Promise<PortfolioAlert>;
  updatePortfolioAlert(id: number, alert: Partial<InsertPortfolioAlert>): Promise<PortfolioAlert | undefined>;
  deletePortfolioAlert(id: number): Promise<boolean>;

  // Performance Metric methods
  getPerformanceMetrics(userId: number): Promise<PerformanceMetric[]>;
  createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric>;
  updatePerformanceMetric(id: number, metric: Partial<InsertPerformanceMetric>): Promise<PerformanceMetric | undefined>;
  
  // AUM Trend methods
  getAumTrends(userId: number): Promise<AumTrend[]>;
  createAumTrend(trend: InsertAumTrend): Promise<AumTrend>;
  
  // Sales Pipeline methods
  getSalesPipeline(userId: number): Promise<SalesPipeline[]>;
  createSalesPipelineEntry(entry: InsertSalesPipeline): Promise<SalesPipeline>;
  updateSalesPipelineEntry(id: number, entry: Partial<InsertSalesPipeline>): Promise<SalesPipeline | undefined>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactions(clientId: number, startDate?: Date, endDate?: Date): Promise<Transaction[]>;
  getTransactionsByType(clientId: number, type: string): Promise<Transaction[]>;
  getTransactionsByProduct(clientId: number, productType: string): Promise<Transaction[]>;
  getTransactionSummary(clientId: number, groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year', startDate?: Date, endDate?: Date): Promise<any[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private prospects: Map<number, Prospect>;
  private tasks: Map<number, Task>;
  private appointments: Map<number, Appointment>;
  private portfolioAlerts: Map<number, PortfolioAlert>;
  private performanceMetrics: Map<number, PerformanceMetric>;
  private aumTrends: Map<number, AumTrend>;
  private salesPipeline: Map<number, SalesPipeline>;
  private transactions: Map<number, Transaction>;
  
  userCurrentId: number;
  clientCurrentId: number;
  prospectCurrentId: number;
  taskCurrentId: number;
  appointmentCurrentId: number;
  portfolioAlertCurrentId: number;
  performanceMetricCurrentId: number;
  aumTrendCurrentId: number;
  salesPipelineCurrentId: number;
  transactionCurrentId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.prospects = new Map();
    this.tasks = new Map();
    this.appointments = new Map();
    this.portfolioAlerts = new Map();
    this.performanceMetrics = new Map();
    this.aumTrends = new Map();
    this.salesPipeline = new Map();
    this.transactions = new Map();
    
    this.userCurrentId = 1;
    this.clientCurrentId = 1;
    this.prospectCurrentId = 1;
    this.taskCurrentId = 1;
    this.appointmentCurrentId = 1;
    this.portfolioAlertCurrentId = 1;
    this.performanceMetricCurrentId = 1;
    this.aumTrendCurrentId = 1;
    this.salesPipelineCurrentId = 1;
    this.transactionCurrentId = 1;
    
    // Seed with a default user
    this.createUser({
      username: "rahul.sharma",
      password: "password123",
      fullName: "Rahul Sharma",
      role: "relationship_manager",
      jobTitle: "Senior Relationship Manager",
      email: "rahul.sharma@bank.com",
      phone: "+91 9876543210"
    });
    
    // Seed with some sample clients
    this.createClient({
      fullName: "Anand Patel",
      initials: "AP",
      tier: "platinum",
      aum: "₹1.8 Cr",
      aumValue: 18000000,
      email: "anand.patel@example.com",
      phone: "+91 9876543201",
      lastContactDate: new Date(),
      lastTransactionDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      riskProfile: "moderate",
      yearlyPerformance: 9.2,
      alertCount: 2,
      assignedTo: 1
    });
    
    this.createClient({
      fullName: "Sonia Mehta",
      initials: "SM",
      tier: "gold",
      aum: "₹75 L",
      aumValue: 7500000,
      email: "sonia.mehta@example.com",
      lastTransactionDate: new Date(new Date().setDate(new Date().getDate() - 14)),
      yearlyPerformance: 6.5,
      alertCount: 1,
      phone: "+91 9876543202",
      lastContactDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      riskProfile: "conservative",
      assignedTo: 1
    });
    
    this.createClient({
      fullName: "Rahul Joshi",
      initials: "RJ",
      tier: "platinum",
      aum: "₹2.3 Cr",
      aumValue: 23000000,
      email: "rahul.joshi@example.com",
      phone: "+91 9876543203",
      lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      lastTransactionDate: new Date(new Date().setDate(new Date().getDate() - 5)),
      riskProfile: "aggressive",
      yearlyPerformance: 11.2,
      alertCount: 2,
      assignedTo: 1
    });
    
    this.createClient({
      fullName: "Priya Malhotra",
      initials: "PM",
      tier: "silver",
      aum: "₹55 L",
      aumValue: 5500000,
      email: "priya.malhotra@example.com",
      phone: "+91 9876543204",
      lastContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      lastTransactionDate: new Date(new Date().setDate(new Date().getDate() - 12)),
      riskProfile: "moderate",
      yearlyPerformance: 5.8,
      alertCount: 0,
      assignedTo: 1
    });
    
    // Seed tasks
    this.createTask({
      title: "Prepare portfolio proposal for Sharma family",
      description: "Create a comprehensive investment proposal for the Sharma family's ₹1.2 Cr portfolio",
      dueDate: new Date(),
      completed: false,
      assignedTo: 1
    });
    
    this.createTask({
      title: "Follow up on Mehra account documentation",
      description: "Call Mr. Mehra to remind about pending KYC documents",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      completed: false,
      assignedTo: 1
    });
    
    this.createTask({
      title: "Send market update newsletter",
      description: "Send the monthly market update newsletter to all platinum clients",
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      completed: true,
      assignedTo: 1
    });
    
    this.createTask({
      title: "Update risk profile for Joshi portfolio",
      description: "Review and update the risk profile for Rahul Joshi's portfolio",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      completed: false,
      clientId: 3,
      assignedTo: 1
    });
    
    // Seed appointments
    this.createAppointment({
      title: "Meeting with Anand Patel",
      description: "Portfolio Review",
      startTime: new Date(new Date().setHours(10, 30, 0, 0)),
      endTime: new Date(new Date().setHours(11, 30, 0, 0)),
      location: "Office",
      clientId: 1,
      assignedTo: 1,
      priority: "high",
      type: "meeting"
    });
    
    this.createAppointment({
      title: "Call with Priya Mehta",
      description: "Insurance Discussion",
      startTime: new Date(new Date().setHours(13, 0, 0, 0)),
      endTime: new Date(new Date().setHours(13, 30, 0, 0)),
      location: "Phone",
      clientId: 4,
      assignedTo: 1,
      priority: "medium",
      type: "call"
    });
    
    this.createAppointment({
      title: "Client Review - Vikram Singh",
      description: "Quarterly Review",
      startTime: new Date(new Date().setHours(15, 30, 0, 0)),
      endTime: new Date(new Date().setHours(16, 30, 0, 0)),
      location: "Client Office",
      assignedTo: 1,
      priority: "medium",
      type: "meeting"
    });
    
    // Seed portfolio alerts
    this.createPortfolioAlert({
      title: "Portfolio Deviation - Gupta Family",
      description: "Equity allocation exceeds target by 8.5%",
      clientId: 1,
      severity: "critical",
      read: false,
      actionRequired: true
    });
    
    this.createPortfolioAlert({
      title: "Risk Profile Update - Sanjay Kapoor",
      description: "Changed from Moderate to Conservative",
      clientId: 2,
      severity: "warning",
      read: false,
      actionRequired: true
    });
    
    this.createPortfolioAlert({
      title: "Bond Maturity - Kumar Holdings",
      description: "Corporate bonds maturing in 14 days",
      clientId: 3,
      severity: "info",
      read: false,
      actionRequired: true
    });
    
    // Seed performance metrics
    this.createPerformanceMetric({
      userId: 1,
      metricType: "new_aum",
      currentValue: 12000000, // 1.2 Cr
      targetValue: 20000000,  // 2 Cr
      percentageChange: 18,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
    
    this.createPerformanceMetric({
      userId: 1,
      metricType: "new_clients",
      currentValue: 12,
      targetValue: 15,
      percentageChange: 8,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
    
    this.createPerformanceMetric({
      userId: 1,
      metricType: "revenue",
      currentValue: 1850000, // 18.5 L
      targetValue: 4000000,  // 40 L
      percentageChange: -5,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
    
    this.createPerformanceMetric({
      userId: 1,
      metricType: "retention",
      currentValue: 96,
      targetValue: 90,
      percentageChange: 2,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
    
    // Seed AUM trends
    const months = [1, 2, 3, 4, 5, 6];
    const currentValues = [50, 70, 65, 80, 90, 60];
    const previousValues = [60, 65, 50, 75, 60, 40];
    
    months.forEach((month, index) => {
      this.createAumTrend({
        userId: 1,
        month,
        year: new Date().getFullYear(),
        currentValue: currentValues[index],
        previousValue: previousValues[index]
      });
    });
    
    // Seed sales pipeline
    this.createSalesPipelineEntry({
      userId: 1,
      stage: "new_leads",
      count: 18,
      value: 32000000 // 3.2 Cr
    });
    
    this.createSalesPipelineEntry({
      userId: 1,
      stage: "qualified",
      count: 12,
      value: 25000000 // 2.5 Cr
    });
    
    this.createSalesPipelineEntry({
      userId: 1,
      stage: "proposal",
      count: 7,
      value: 18000000 // 1.8 Cr
    });
    
    this.createSalesPipelineEntry({
      userId: 1,
      stage: "closed",
      count: 4,
      value: 12000000 // 1.2 Cr
    });
    
    // Seed prospects
    this.createProspect({
      fullName: "Amit Sharma",
      initials: "AS",
      potentialAum: "₹50L",
      potentialAumValue: 5000000,
      email: "amit.sharma@example.com",
      phone: "+91 9876543205",
      stage: "proposal",
      lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      probabilityScore: 95,
      productsOfInterest: "Mutual Funds",
      assignedTo: 1
    });
    
    this.createProspect({
      fullName: "Neha Verma",
      initials: "NV",
      potentialAum: "₹75L",
      potentialAumValue: 7500000,
      email: "neha.verma@example.com",
      phone: "+91 9876543206",
      stage: "proposal",
      lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      probabilityScore: 80,
      productsOfInterest: "Wealth Management",
      assignedTo: 1
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async getClients(assignedTo?: number): Promise<Client[]> {
    let clients = Array.from(this.clients.values());
    
    if (assignedTo) {
      clients = clients.filter(client => client.assignedTo === assignedTo);
    }
    
    return clients.sort((a, b) => b.aumValue - a.aumValue);
  }
  
  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.clientCurrentId++;
    const client: Client = { ...insertClient, id, createdAt: new Date() };
    this.clients.set(id, client);
    return client;
  }
  
  async updateClient(id: number, clientUpdate: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    
    if (!client) {
      return undefined;
    }
    
    const updatedClient = { ...client, ...clientUpdate };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }
  
  async getRecentClients(limit: number, assignedTo?: number): Promise<Client[]> {
    let clients = Array.from(this.clients.values());
    
    if (assignedTo) {
      clients = clients.filter(client => client.assignedTo === assignedTo);
    }
    
    // Sort by last contact date, most recent first
    return clients
      .sort((a, b) => {
        if (!a.lastContactDate) return 1;
        if (!b.lastContactDate) return -1;
        return b.lastContactDate.getTime() - a.lastContactDate.getTime();
      })
      .slice(0, limit);
  }

  // Prospect methods
  async getProspect(id: number): Promise<Prospect | undefined> {
    return this.prospects.get(id);
  }
  
  async getProspects(assignedTo?: number): Promise<Prospect[]> {
    let prospects = Array.from(this.prospects.values());
    
    if (assignedTo) {
      prospects = prospects.filter(prospect => prospect.assignedTo === assignedTo);
    }
    
    return prospects.sort((a, b) => {
      if (!a.potentialAumValue) return 1;
      if (!b.potentialAumValue) return -1;
      return b.potentialAumValue - a.potentialAumValue;
    });
  }
  
  async createProspect(insertProspect: InsertProspect): Promise<Prospect> {
    const id = this.prospectCurrentId++;
    const prospect: Prospect = { ...insertProspect, id, createdAt: new Date() };
    this.prospects.set(id, prospect);
    return prospect;
  }
  
  async updateProspect(id: number, prospectUpdate: Partial<InsertProspect>): Promise<Prospect | undefined> {
    const prospect = this.prospects.get(id);
    
    if (!prospect) {
      return undefined;
    }
    
    const updatedProspect = { ...prospect, ...prospectUpdate };
    this.prospects.set(id, updatedProspect);
    return updatedProspect;
  }
  
  async deleteProspect(id: number): Promise<boolean> {
    return this.prospects.delete(id);
  }
  
  async getProspectsByStage(stage: string, assignedTo?: number): Promise<Prospect[]> {
    let prospects = Array.from(this.prospects.values()).filter(prospect => prospect.stage === stage);
    
    if (assignedTo) {
      prospects = prospects.filter(prospect => prospect.assignedTo === assignedTo);
    }
    
    return prospects;
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTasks(assignedTo?: number, completed?: boolean): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());
    
    if (assignedTo !== undefined) {
      tasks = tasks.filter(task => task.assignedTo === assignedTo);
    }
    
    if (completed !== undefined) {
      tasks = tasks.filter(task => task.completed === completed);
    }
    
    return tasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskCurrentId++;
    const task: Task = { ...insertTask, id, createdAt: new Date() };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    
    if (!task) {
      return undefined;
    }
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getAppointments(assignedTo?: number, date?: Date): Promise<Appointment[]> {
    let appointments = Array.from(this.appointments.values());
    
    if (assignedTo) {
      appointments = appointments.filter(appointment => appointment.assignedTo === assignedTo);
    }
    
    if (date) {
      appointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.startTime);
        return appointmentDate.getDate() === date.getDate() &&
               appointmentDate.getMonth() === date.getMonth() &&
               appointmentDate.getFullYear() === date.getFullYear();
      });
    }
    
    return appointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentCurrentId++;
    const appointment: Appointment = { ...insertAppointment, id, createdAt: new Date() };
    this.appointments.set(id, appointment);
    return appointment;
  }
  
  async updateAppointment(id: number, appointmentUpdate: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    
    if (!appointment) {
      return undefined;
    }
    
    const updatedAppointment = { ...appointment, ...appointmentUpdate };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }
  
  async getTodaysAppointments(assignedTo?: number): Promise<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let appointments = Array.from(this.appointments.values()).filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate.getTime() === today.getTime();
    });
    
    if (assignedTo) {
      appointments = appointments.filter(appointment => appointment.assignedTo === assignedTo);
    }
    
    return appointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  // Portfolio Alert methods
  async getPortfolioAlert(id: number): Promise<PortfolioAlert | undefined> {
    return this.portfolioAlerts.get(id);
  }
  
  async getPortfolioAlerts(read?: boolean): Promise<PortfolioAlert[]> {
    let alerts = Array.from(this.portfolioAlerts.values());
    
    if (read !== undefined) {
      alerts = alerts.filter(alert => alert.read === read);
    }
    
    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createPortfolioAlert(insertAlert: InsertPortfolioAlert): Promise<PortfolioAlert> {
    const id = this.portfolioAlertCurrentId++;
    const alert: PortfolioAlert = { ...insertAlert, id, createdAt: new Date() };
    this.portfolioAlerts.set(id, alert);
    return alert;
  }
  
  async updatePortfolioAlert(id: number, alertUpdate: Partial<InsertPortfolioAlert>): Promise<PortfolioAlert | undefined> {
    const alert = this.portfolioAlerts.get(id);
    
    if (!alert) {
      return undefined;
    }
    
    const updatedAlert = { ...alert, ...alertUpdate };
    this.portfolioAlerts.set(id, updatedAlert);
    return updatedAlert;
  }
  
  async deletePortfolioAlert(id: number): Promise<boolean> {
    return this.portfolioAlerts.delete(id);
  }

  // Performance Metric methods
  async getPerformanceMetrics(userId: number): Promise<PerformanceMetric[]> {
    return Array.from(this.performanceMetrics.values())
      .filter(metric => metric.userId === userId);
  }
  
  async createPerformanceMetric(insertMetric: InsertPerformanceMetric): Promise<PerformanceMetric> {
    const id = this.performanceMetricCurrentId++;
    const metric: PerformanceMetric = { ...insertMetric, id, createdAt: new Date() };
    this.performanceMetrics.set(id, metric);
    return metric;
  }
  
  async updatePerformanceMetric(id: number, metricUpdate: Partial<InsertPerformanceMetric>): Promise<PerformanceMetric | undefined> {
    const metric = this.performanceMetrics.get(id);
    
    if (!metric) {
      return undefined;
    }
    
    const updatedMetric = { ...metric, ...metricUpdate };
    this.performanceMetrics.set(id, updatedMetric);
    return updatedMetric;
  }

  // AUM Trend methods
  async getAumTrends(userId: number): Promise<AumTrend[]> {
    return Array.from(this.aumTrends.values())
      .filter(trend => trend.userId === userId)
      .sort((a, b) => a.month - b.month);
  }
  
  async createAumTrend(insertTrend: InsertAumTrend): Promise<AumTrend> {
    const id = this.aumTrendCurrentId++;
    const trend: AumTrend = { ...insertTrend, id, createdAt: new Date() };
    this.aumTrends.set(id, trend);
    return trend;
  }

  // Sales Pipeline methods
  async getSalesPipeline(userId: number): Promise<SalesPipeline[]> {
    return Array.from(this.salesPipeline.values())
      .filter(entry => entry.userId === userId);
  }
  
  async createSalesPipelineEntry(insertEntry: InsertSalesPipeline): Promise<SalesPipeline> {
    const id = this.salesPipelineCurrentId++;
    const entry: SalesPipeline = { ...insertEntry, id, createdAt: new Date() };
    this.salesPipeline.set(id, entry);
    return entry;
  }
  
  async updateSalesPipelineEntry(id: number, entryUpdate: Partial<InsertSalesPipeline>): Promise<SalesPipeline | undefined> {
    const entry = this.salesPipeline.get(id);
    
    if (!entry) {
      return undefined;
    }
    
    const updatedEntry = { ...entry, ...entryUpdate };
    this.salesPipeline.set(id, updatedEntry);
    return updatedEntry;
  }
}

import { db } from "./db";
import { eq } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClients(assignedTo?: number): Promise<Client[]> {
    if (assignedTo) {
      return db.select().from(clients).where(eq(clients.assignedTo, assignedTo));
    }
    return db.select().from(clients);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values({
      ...insertClient,
      createdAt: new Date()
    }).returning();
    return client;
  }

  async updateClient(id: number, clientUpdate: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db.update(clients)
      .set(clientUpdate)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients)
      .where(eq(clients.id, id))
      .returning({ id: clients.id });
    return result.length > 0;
  }

  async getRecentClients(limit: number, assignedTo?: number): Promise<Client[]> {
    let query = db.select().from(clients).orderBy(desc(clients.createdAt));
    
    if (assignedTo) {
      query = query.where(eq(clients.assignedTo, assignedTo));
    }
    
    return query.limit(limit);
  }

  // Prospect methods
  async getProspect(id: number): Promise<Prospect | undefined> {
    const [prospect] = await db.select().from(prospects).where(eq(prospects.id, id));
    return prospect || undefined;
  }

  async getProspects(assignedTo?: number): Promise<Prospect[]> {
    if (assignedTo) {
      return db.select().from(prospects).where(eq(prospects.assignedTo, assignedTo));
    }
    return db.select().from(prospects);
  }

  async createProspect(insertProspect: InsertProspect): Promise<Prospect> {
    const [prospect] = await db.insert(prospects).values({
      ...insertProspect,
      createdAt: new Date()
    }).returning();
    return prospect;
  }

  async updateProspect(id: number, prospectUpdate: Partial<InsertProspect>): Promise<Prospect | undefined> {
    try {
      // Get the current prospect for safe updates
      const currentProspect = await this.getProspect(id);
      if (!currentProspect) return undefined;
      
      // Create a clean update object with only the fields we want to update
      const updateData: Record<string, any> = {};
      
      // Copy non-date fields directly
      if (prospectUpdate.fullName !== undefined) updateData.fullName = prospectUpdate.fullName;
      if (prospectUpdate.initials !== undefined) updateData.initials = prospectUpdate.initials;
      if (prospectUpdate.potentialAum !== undefined) updateData.potentialAum = prospectUpdate.potentialAum;
      if (prospectUpdate.potentialAumValue !== undefined) updateData.potentialAumValue = prospectUpdate.potentialAumValue;
      if (prospectUpdate.email !== undefined) updateData.email = prospectUpdate.email;
      if (prospectUpdate.phone !== undefined) updateData.phone = prospectUpdate.phone;
      if (prospectUpdate.stage !== undefined) updateData.stage = prospectUpdate.stage;
      if (prospectUpdate.probabilityScore !== undefined) updateData.probabilityScore = prospectUpdate.probabilityScore;
      if (prospectUpdate.notes !== undefined) updateData.notes = prospectUpdate.notes;
      if (prospectUpdate.assignedTo !== undefined) updateData.assignedTo = prospectUpdate.assignedTo;
      
      // Skip lastContactDate to avoid date conversion issues
      
      // Handle productsOfInterest specially
      if (prospectUpdate.productsOfInterest !== undefined) {
        if (prospectUpdate.productsOfInterest === null) {
          updateData.productsOfInterest = null;
        } else if (typeof prospectUpdate.productsOfInterest === 'string') {
          updateData.productsOfInterest = [prospectUpdate.productsOfInterest];
        } else if (Array.isArray(prospectUpdate.productsOfInterest)) {
          updateData.productsOfInterest = prospectUpdate.productsOfInterest;
        }
      }
      
      console.log("Clean database update with data:", updateData);
      
      // Only perform the update if we have fields to update
      if (Object.keys(updateData).length === 0) {
        return currentProspect; // Nothing to update
      }
      
      const [prospect] = await db.update(prospects)
        .set(updateData)
        .where(eq(prospects.id, id))
        .returning();
      
      return prospect || currentProspect; // Return updated prospect or current if update failed
    } catch (error) {
      console.error("Database error updating prospect:", error);
      return undefined;
    }
  }

  async deleteProspect(id: number): Promise<boolean> {
    await db.delete(prospects).where(eq(prospects.id, id));
    return true;
  }

  async getProspectsByStage(stage: string, assignedTo?: number): Promise<Prospect[]> {
    let query = db.select().from(prospects).where(eq(prospects.stage, stage));
    
    if (assignedTo) {
      query = query.where(eq(prospects.assignedTo, assignedTo));
    }
    
    return query;
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasks(assignedTo?: number, completed?: boolean): Promise<Task[]> {
    let query = db.select().from(tasks);
    
    if (assignedTo) {
      query = query.where(eq(tasks.assignedTo, assignedTo));
    }
    
    if (completed !== undefined) {
      query = query.where(eq(tasks.completed, completed));
    }
    
    return query;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values({
      ...insertTask,
      createdAt: new Date()
    }).returning();
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db.update(tasks)
      .set(taskUpdate)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    await db.delete(tasks).where(eq(tasks.id, id));
    return true;
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async getAppointments(assignedTo?: number, date?: Date): Promise<Appointment[]> {
    let query = db.select().from(appointments);
    
    if (assignedTo) {
      query = query.where(eq(appointments.assignedTo, assignedTo));
    }
    
    // If date is provided, we would need a more complex query to filter by date
    // This would depend on how dates are stored and compared
    
    return query;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values({
      ...insertAppointment,
      createdAt: new Date()
    }).returning();
    return appointment;
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [appointment] = await db.update(appointments)
      .set(appointmentUpdate)
      .where(eq(appointments.id, id))
      .returning();
    return appointment || undefined;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    await db.delete(appointments).where(eq(appointments.id, id));
    return true;
  }

  async getTodaysAppointments(assignedTo?: number): Promise<Appointment[]> {
    // Getting today's appointments would require date filtering
    // This is a simplified implementation
    let query = db.select().from(appointments);
    
    if (assignedTo) {
      query = query.where(eq(appointments.assignedTo, assignedTo));
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // This would require comparing date parts which depends on the database
    // For a complete implementation, we'd need to adjust based on specific database capabilities
    
    return query;
  }

  // Portfolio Alert methods
  async getPortfolioAlert(id: number): Promise<PortfolioAlert | undefined> {
    const [alert] = await db.select().from(portfolioAlerts).where(eq(portfolioAlerts.id, id));
    return alert || undefined;
  }

  async getPortfolioAlerts(read?: boolean): Promise<PortfolioAlert[]> {
    let query = db.select().from(portfolioAlerts);
    
    if (read !== undefined) {
      query = query.where(eq(portfolioAlerts.read, read));
    }
    
    return query;
  }

  async createPortfolioAlert(insertAlert: InsertPortfolioAlert): Promise<PortfolioAlert> {
    const [alert] = await db.insert(portfolioAlerts).values({
      ...insertAlert,
      createdAt: new Date()
    }).returning();
    return alert;
  }

  async updatePortfolioAlert(id: number, alertUpdate: Partial<InsertPortfolioAlert>): Promise<PortfolioAlert | undefined> {
    const [alert] = await db.update(portfolioAlerts)
      .set(alertUpdate)
      .where(eq(portfolioAlerts.id, id))
      .returning();
    return alert || undefined;
  }

  async deletePortfolioAlert(id: number): Promise<boolean> {
    await db.delete(portfolioAlerts).where(eq(portfolioAlerts.id, id));
    return true;
  }

  // Performance Metric methods
  async getPerformanceMetrics(userId: number): Promise<PerformanceMetric[]> {
    return db.select().from(performanceMetrics).where(eq(performanceMetrics.userId, userId));
  }

  async createPerformanceMetric(insertMetric: InsertPerformanceMetric): Promise<PerformanceMetric> {
    const [metric] = await db.insert(performanceMetrics).values({
      ...insertMetric,
      createdAt: new Date()
    }).returning();
    return metric;
  }

  async updatePerformanceMetric(id: number, metricUpdate: Partial<InsertPerformanceMetric>): Promise<PerformanceMetric | undefined> {
    const [metric] = await db.update(performanceMetrics)
      .set(metricUpdate)
      .where(eq(performanceMetrics.id, id))
      .returning();
    return metric || undefined;
  }

  // AUM Trend methods
  async getAumTrends(userId: number): Promise<AumTrend[]> {
    return db.select().from(aumTrends).where(eq(aumTrends.userId, userId));
  }

  async createAumTrend(insertTrend: InsertAumTrend): Promise<AumTrend> {
    const [trend] = await db.insert(aumTrends).values({
      ...insertTrend,
      createdAt: new Date()
    }).returning();
    return trend;
  }

  // Sales Pipeline methods
  async getSalesPipeline(userId: number): Promise<SalesPipeline[]> {
    return db.select().from(salesPipeline).where(eq(salesPipeline.userId, userId));
  }

  async createSalesPipelineEntry(insertEntry: InsertSalesPipeline): Promise<SalesPipeline> {
    const [entry] = await db.insert(salesPipeline).values({
      ...insertEntry,
      createdAt: new Date()
    }).returning();
    return entry;
  }

  async updateSalesPipelineEntry(id: number, entryUpdate: Partial<InsertSalesPipeline>): Promise<SalesPipeline | undefined> {
    const [entry] = await db.update(salesPipeline)
      .set(entryUpdate)
      .where(eq(salesPipeline.id, id))
      .returning();
    return entry || undefined;
  }
}

export const storage = new DatabaseStorage();
