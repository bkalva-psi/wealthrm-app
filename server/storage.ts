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
  transactions, Transaction, InsertTransaction,
  communications, Communication, InsertCommunication,
  communicationActionItems, CommunicationActionItem, InsertCommunicationActionItem,
  communicationAttachments, CommunicationAttachment, InsertCommunicationAttachment,
  clientCommunicationPreferences, ClientCommunicationPreference, InsertClientCommunicationPreference,
  communicationTemplates, CommunicationTemplate, InsertCommunicationTemplate,
  communicationAnalytics, CommunicationAnalytic, InsertCommunicationAnalytic
} from "@shared/schema";
import { eq, and, gte, lt, lte, desc, sql, or } from "drizzle-orm";
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
  getTasks(assignedTo?: number, completed?: boolean, clientId?: number): Promise<Task[]>;
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
      username: "priya.krishnan",
      password: "password123",
      fullName: "Priya Krishnan",
      role: "relationship_manager",
      jobTitle: "Senior Relationship Manager",
      email: "priya.krishnan@ujjivan.com",
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
  
  async getTasks(assignedTo?: number, completed?: boolean, clientId?: number): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());
    
    if (assignedTo !== undefined) {
      tasks = tasks.filter(task => task.assignedTo === assignedTo);
    }
    
    if (completed !== undefined) {
      tasks = tasks.filter(task => task.completed === completed);
    }
    
    if (clientId !== undefined) {
      tasks = tasks.filter(task => task.clientId === clientId);
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
  
  async getAppointments(assignedTo?: number, date?: Date, clientId?: number): Promise<Appointment[]> {
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
    
    if (clientId) {
      appointments = appointments.filter(appointment => appointment.clientId === clientId);
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

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactions(clientId: number, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    const transactions = Array.from(this.transactions.values())
      .filter(transaction => transaction.clientId === clientId);
    
    if (startDate) {
      const startTimestamp = startDate.getTime();
      return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.transactionDate).getTime();
        return transactionDate >= startTimestamp;
      });
    }
    
    if (endDate) {
      const endTimestamp = endDate.getTime();
      return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.transactionDate).getTime();
        return transactionDate <= endTimestamp;
      });
    }
    
    return transactions.sort((a, b) => {
      const dateA = new Date(a.transactionDate).getTime();
      const dateB = new Date(b.transactionDate).getTime();
      return dateB - dateA; // Most recent first
    });
  }

  async getTransactionsByType(clientId: number, type: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => 
        transaction.clientId === clientId && 
        transaction.transactionType === type
      )
      .sort((a, b) => {
        const dateA = new Date(a.transactionDate).getTime();
        const dateB = new Date(b.transactionDate).getTime();
        return dateB - dateA; // Most recent first
      });
  }

  async getTransactionsByProduct(clientId: number, productType: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => 
        transaction.clientId === clientId && 
        transaction.productType === productType
      )
      .sort((a, b) => {
        const dateA = new Date(a.transactionDate).getTime();
        const dateB = new Date(b.transactionDate).getTime();
        return dateB - dateA; // Most recent first
      });
  }

  async getTransactionSummary(
    clientId: number, 
    groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year', 
    startDate?: Date, 
    endDate?: Date
  ): Promise<any[]> {
    const transactions = await this.getTransactions(clientId, startDate, endDate);
    
    // Group transactions by the specified period
    const groupedTransactions = new Map();
    
    for (const transaction of transactions) {
      const date = new Date(transaction.transactionDate);
      let period: string;
      
      switch (groupBy) {
        case 'day':
          period = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'week':
          // Get the week number
          const weekNum = Math.ceil((date.getDate() + (date.getDay() + 1)) / 7);
          period = `${date.getFullYear()}-W${weekNum}`;
          break;
        case 'month':
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          period = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'year':
          period = `${date.getFullYear()}`;
          break;
        default:
          period = date.toISOString().split('T')[0];
      }
      
      if (!groupedTransactions.has(period)) {
        groupedTransactions.set(period, {
          period,
          transactionCount: 0,
          totalAmount: 0,
          totalFees: 0,
          totalTaxes: 0,
          netAmount: 0,
          buyCount: 0,
          sellCount: 0,
          otherCount: 0,
          transactions: []
        });
      }
      
      const summary = groupedTransactions.get(period);
      summary.transactionCount += 1;
      summary.totalAmount += transaction.amount;
      summary.totalFees += transaction.fees || 0;
      summary.totalTaxes += transaction.taxes || 0;
      summary.netAmount += transaction.totalAmount;
      
      if (transaction.transactionType === 'buy') {
        summary.buyCount += 1;
      } else if (transaction.transactionType === 'sell') {
        summary.sellCount += 1;
      } else {
        summary.otherCount += 1;
      }
      
      summary.transactions.push(transaction);
    }
    
    // Convert Map to Array and sort by period
    return Array.from(groupedTransactions.values()).sort((a, b) => a.period.localeCompare(b.period));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = ++this.transactionCurrentId;
    const newTransaction: Transaction = { ...transaction, id, createdAt: new Date() };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateTransaction(id: number, transactionUpdate: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    
    if (!transaction) {
      return undefined;
    }
    
    const updatedTransaction = { ...transaction, ...transactionUpdate };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }
}

import { db } from "./db";
import { eq } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getTransactions(clientId: number, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    let query = db.select().from(transactions).where(eq(transactions.clientId, clientId));
    
    if (startDate) {
      query = query.where(gte(transactions.transactionDate, startDate));
    }
    
    if (endDate) {
      query = query.where(lte(transactions.transactionDate, endDate));
    }
    
    return query.orderBy(desc(transactions.transactionDate));
  }

  async getTransactionsByType(clientId: number, type: string): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(eq(transactions.clientId, clientId))
      .where(eq(transactions.transactionType, type))
      .orderBy(transactions.transactionDate);
  }

  async getTransactionsByProduct(clientId: number, productType: string): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(eq(transactions.clientId, clientId))
      .where(eq(transactions.productType, productType))
      .orderBy(transactions.transactionDate);
  }

  async getTransactionSummary(
    clientId: number, 
    groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year', 
    startDate?: Date, 
    endDate?: Date
  ): Promise<any[]> {
    // This would typically use SQL GROUP BY with date functions
    // For now, we'll fetch all transactions and process them in memory
    const transactions = await this.getTransactions(clientId, startDate, endDate);
    
    // Group transactions by the specified period
    const groupedTransactions = new Map();
    
    for (const transaction of transactions) {
      const date = new Date(transaction.transactionDate);
      let period: string;
      
      switch (groupBy) {
        case 'day':
          period = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'week':
          // Get the week number
          const weekNum = Math.ceil((date.getDate() + (date.getDay() + 1)) / 7);
          period = `${date.getFullYear()}-W${weekNum}`;
          break;
        case 'month':
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          period = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'year':
          period = `${date.getFullYear()}`;
          break;
        default:
          period = date.toISOString().split('T')[0];
      }
      
      if (!groupedTransactions.has(period)) {
        groupedTransactions.set(period, {
          period,
          transactionCount: 0,
          totalAmount: 0,
          totalFees: 0,
          totalTaxes: 0,
          netAmount: 0,
          buyCount: 0,
          sellCount: 0,
          otherCount: 0,
          transactions: []
        });
      }
      
      const summary = groupedTransactions.get(period);
      summary.transactionCount += 1;
      summary.totalAmount += transaction.amount;
      summary.totalFees += transaction.fees || 0;
      summary.totalTaxes += transaction.taxes || 0;
      summary.netAmount += transaction.totalAmount;
      
      if (transaction.transactionType === 'buy') {
        summary.buyCount += 1;
      } else if (transaction.transactionType === 'sell') {
        summary.sellCount += 1;
      } else {
        summary.otherCount += 1;
      }
      
      summary.transactions.push(transaction);
    }
    
    // Convert Map to Array and sort by period
    return Array.from(groupedTransactions.values()).sort((a, b) => a.period.localeCompare(b.period));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transactionUpdate: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transactionUpdate)
      .where(eq(transactions.id, id))
      .returning();
    
    return updatedTransaction || undefined;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return result.rowCount > 0;
  }
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

  async getTasks(assignedTo?: number, completed?: boolean, clientId?: number): Promise<any[]> {
    // Build the SQL query with proper filtering
    let regularTasksSQL = `
      SELECT 
        t.id, t.title, t.description, t.due_date as "dueDate", t.completed,
        t.client_id as "clientId", t.prospect_id as "prospectId", t.assigned_to as "assignedTo",
        'medium' as priority, 'task' as source, NULL as "communicationId", 'task' as "actionType",
        COALESCE(c.full_name, p.full_name) as "clientName"
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN prospects p ON t.prospect_id = p.id
      WHERE 1=1
    `;
    
    let actionItemsSQL = `
      SELECT 
        cai.id, cai.title, cai.description, cai.due_date as "dueDate",
        CASE WHEN cai.completed_at IS NOT NULL THEN true ELSE false END as completed,
        comm.client_id as "clientId", NULL as "prospectId", cai.assigned_to as "assignedTo",
        cai.priority, 'action_item' as source, cai.communication_id as "communicationId", 
        cai.action_type as "actionType", cl.full_name as "clientName"
      FROM communication_action_items cai
      JOIN communications comm ON cai.communication_id = comm.id
      LEFT JOIN clients cl ON comm.client_id = cl.id
      WHERE cai.action_type = 'task' AND cai.status = 'pending'
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (assignedTo !== undefined) {
      regularTasksSQL += ` AND t.assigned_to = $${paramIndex}`;
      actionItemsSQL += ` AND cai.assigned_to = $${paramIndex}`;
      params.push(assignedTo);
      paramIndex++;
    }
    
    if (completed !== undefined) {
      regularTasksSQL += ` AND t.completed = $${paramIndex}`;
      if (completed) {
        actionItemsSQL += ` AND cai.completed_at IS NOT NULL`;
      } else {
        actionItemsSQL += ` AND cai.completed_at IS NULL`;
      }
      params.push(completed);
      paramIndex++;
    }
    
    if (clientId !== undefined) {
      regularTasksSQL += ` AND t.client_id = $${paramIndex}`;
      actionItemsSQL += ` AND comm.client_id = $${paramIndex}`;
      params.push(clientId);
      paramIndex++;
    }
    
    // Execute both queries
    const { rows: regularTasks } = await db.$client.query(regularTasksSQL, params);
    const { rows: actionItems } = await db.$client.query(actionItemsSQL, params);
    
    // Combine and sort by due date
    const allTasks = [...regularTasks, ...actionItems].sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
      const dateB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
      return dateA.getTime() - dateB.getTime();
    });
    
    return allTasks;
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    try {
      const result = await db
        .select({
          id: appointments.id,
          title: appointments.title,
          description: appointments.description,
          startTime: appointments.startTime,
          endTime: appointments.endTime,
          location: appointments.location,
          clientId: appointments.clientId,
          prospectId: appointments.prospectId,
          assignedTo: appointments.assignedTo,
          priority: appointments.priority,
          type: appointments.type,
          createdAt: appointments.createdAt,
          clientName: clients.fullName
        })
        .from(appointments)
        .leftJoin(clients, eq(appointments.clientId, clients.id))
        .where(
          and(
            gte(appointments.startTime, today),
            lte(appointments.startTime, endOfDay),
            assignedTo ? eq(appointments.assignedTo, assignedTo) : undefined
          )
        )
        .orderBy(appointments.startTime);
      
      return result;
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
      return [];
    }
  }

  // Portfolio Alert methods
  async getPortfolioAlert(id: number): Promise<PortfolioAlert | undefined> {
    const [alert] = await db.select().from(portfolioAlerts).where(eq(portfolioAlerts.id, id));
    return alert || undefined;
  }

  async getPortfolioAlerts(read?: boolean): Promise<any[]> {
    let query = db.select({
      id: portfolioAlerts.id,
      title: portfolioAlerts.title,
      description: portfolioAlerts.description,
      clientId: portfolioAlerts.clientId,
      severity: portfolioAlerts.severity,
      read: portfolioAlerts.read,
      actionRequired: portfolioAlerts.actionRequired,
      createdAt: portfolioAlerts.createdAt,
      priority: portfolioAlerts.priority,
      clientName: clients.fullName
    })
    .from(portfolioAlerts)
    .leftJoin(clients, eq(portfolioAlerts.clientId, clients.id));
    
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
    try {
      // Get current total AUM for this RM from all assigned clients
      const userClients = await db
        .select({ 
          aumValue: clients.aumValue,
          createdAt: clients.createdAt 
        })
        .from(clients)
        .where(eq(clients.assignedTo, userId));
      
      if (userClients.length === 0) {
        return [];
      }
      
      // Calculate total current AUM
      const currentTotalAum = userClients.reduce((sum, client) => sum + (client.aumValue || 0), 0);
      
      // Create 12-month trend with realistic growth pattern
      const trends: AumTrend[] = [];
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      // Generate trends only for months that have passed (up to current month)
      for (let month = 1; month <= currentMonth; month++) {
        // Calculate AUM progression over the months that have passed
        const yearStartAum = currentTotalAum * 0.7; // Assume 30% growth this year
        const currentMonthAum = yearStartAum + (currentTotalAum - yearStartAum) * (month / currentMonth);
        
        // Previous year AUM for the same month with realistic variation
        const baselineGrowth = 0.85; // Previous year base was 15% lower
        const monthlyVariation = 0.02 * Math.sin((month - 1) * Math.PI / 6); // Seasonal variation
        const previousYearAum = yearStartAum * (baselineGrowth + monthlyVariation);
        
        // Calculate growth percentage
        const growthPercentage = previousYearAum > 0 
          ? ((currentMonthAum - previousYearAum) / previousYearAum) * 100 
          : 0;
        
        trends.push({
          id: month,
          userId: userId,
          month: month,
          year: currentYear,
          totalAum: Math.round(currentMonthAum),
          previousYearAum: Math.round(previousYearAum),
          growthPercentage: Math.round(growthPercentage * 100) / 100, // Round to 2 decimal places
          createdAt: new Date()
        });
      }
      
      return trends;
      
    } catch (error) {
      console.error('Error calculating AUM trends:', error);
      return [];
    }
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

  // Communication methods
  async getCommunication(id: number): Promise<Communication | undefined> {
    const [communication] = await db.select().from(communications).where(eq(communications.id, id));
    return communication || undefined;
  }

  async getClientCommunications(clientId: number): Promise<Communication[]> {
    return db.select()
      .from(communications)
      .where(eq(communications.clientId, clientId))
      .orderBy(desc(communications.startTime));
  }

  async getRecentCommunications(userId: number, limit: number = 10): Promise<Communication[]> {
    return db.select()
      .from(communications)
      .where(eq(communications.initiatedBy, userId))
      .orderBy(desc(communications.startTime))
      .limit(limit);
  }

  async createCommunication(communication: InsertCommunication): Promise<Communication> {
    const [result] = await db.insert(communications).values(communication).returning();
    return result;
  }

  async updateCommunication(id: number, updates: Partial<InsertCommunication>): Promise<Communication | undefined> {
    const [result] = await db
      .update(communications)
      .set(updates)
      .where(eq(communications.id, id))
      .returning();
    return result;
  }

  async deleteCommunication(id: number): Promise<boolean> {
    await db.delete(communications).where(eq(communications.id, id));
    return true;
  }

  // Communication action items methods
  async getCommunicationActionItems(communicationId: number): Promise<CommunicationActionItem[]> {
    return db.select()
      .from(communicationActionItems)
      .where(eq(communicationActionItems.communicationId, communicationId))
      .orderBy(communicationActionItems.dueDate);
  }

  async createCommunicationActionItem(actionItem: InsertCommunicationActionItem): Promise<CommunicationActionItem> {
    const [result] = await db.insert(communicationActionItems).values(actionItem).returning();
    return result;
  }

  async updateCommunicationActionItem(id: number, updates: Partial<InsertCommunicationActionItem>): Promise<CommunicationActionItem | undefined> {
    const [result] = await db
      .update(communicationActionItems)
      .set(updates)
      .where(eq(communicationActionItems.id, id))
      .returning();
    return result;
  }

  async getPendingActionItemsByClient(clientId: number): Promise<(CommunicationActionItem & { communication: Communication })[]> {
    return db.select({
      ...communicationActionItems,
      communication: communications
    })
    .from(communicationActionItems)
    .innerJoin(communications, eq(communicationActionItems.communicationId, communications.id))
    .where(eq(communications.clientId, clientId))
    .where(eq(communicationActionItems.status, 'pending'))
    .orderBy(communicationActionItems.dueDate);
  }

  async getPendingActionItemsByRM(userId: number): Promise<(CommunicationActionItem & { communication: Communication })[]> {
    return db.select({
      ...communicationActionItems,
      communication: communications
    })
    .from(communicationActionItems)
    .innerJoin(communications, eq(communicationActionItems.communicationId, communications.id))
    .where(eq(communicationActionItems.assignedTo, userId))
    .where(eq(communicationActionItems.status, 'pending'))
    .orderBy(communicationActionItems.dueDate);
  }

  // Communication attachment methods
  async getCommunicationAttachments(communicationId: number): Promise<CommunicationAttachment[]> {
    return db.select()
      .from(communicationAttachments)
      .where(eq(communicationAttachments.communicationId, communicationId))
      .orderBy(communicationAttachments.createdAt);
  }

  async createCommunicationAttachment(attachment: InsertCommunicationAttachment): Promise<CommunicationAttachment> {
    const [result] = await db.insert(communicationAttachments).values(attachment).returning();
    return result;
  }

  // Client communication preferences methods
  async getClientCommunicationPreferences(clientId: number): Promise<ClientCommunicationPreference | undefined> {
    const [preferences] = await db
      .select()
      .from(clientCommunicationPreferences)
      .where(eq(clientCommunicationPreferences.clientId, clientId));
    return preferences || undefined;
  }

  async setClientCommunicationPreferences(preferences: InsertClientCommunicationPreference): Promise<ClientCommunicationPreference> {
    // Upsert operation - insert or update if exists
    const [result] = await db
      .insert(clientCommunicationPreferences)
      .values(preferences)
      .onConflictDoUpdate({
        target: clientCommunicationPreferences.clientId,
        set: { 
          ...preferences,
          lastUpdated: new Date()
        }
      })
      .returning();
    return result;
  }

  // Communication templates methods
  async getCommunicationTemplates(userId: number): Promise<CommunicationTemplate[]> {
    // Get templates created by this user or global templates
    return db.select()
      .from(communicationTemplates)
      .where(
        or(
          eq(communicationTemplates.createdBy, userId),
          eq(communicationTemplates.isGlobal, true)
        )
      )
      .where(eq(communicationTemplates.isActive, true))
      .orderBy(communicationTemplates.name);
  }

  async getCommunicationTemplatesByCategory(category: string, userId: number): Promise<CommunicationTemplate[]> {
    return db.select()
      .from(communicationTemplates)
      .where(eq(communicationTemplates.category, category))
      .where(
        or(
          eq(communicationTemplates.createdBy, userId),
          eq(communicationTemplates.isGlobal, true)
        )
      )
      .where(eq(communicationTemplates.isActive, true))
      .orderBy(communicationTemplates.name);
  }

  async createCommunicationTemplate(template: InsertCommunicationTemplate): Promise<CommunicationTemplate> {
    const [result] = await db.insert(communicationTemplates).values(template).returning();
    return result;
  }

  // Communication analytics methods
  async generateCommunicationAnalytics(
    userId: number | null = null,
    clientId: number | null = null,
    period: string = 'monthly',
    startDate: Date = new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: Date = new Date()
  ): Promise<CommunicationAnalytic> {
    // Build the query to get communications for the specified filters
    let query = db.select().from(communications);
    
    if (userId) {
      query = query.where(eq(communications.initiatedBy, userId));
    }
    
    if (clientId) {
      query = query.where(eq(communications.clientId, clientId));
    }
    
    query = query.where(gte(communications.startTime, startDate));
    query = query.where(lte(communications.startTime, endDate));
    
    const results = await query;
    
    // Process the results to calculate analytics
    const totalCommunications = results.length;
    
    // Group by type
    const communicationsByType = results.reduce((acc, comm) => {
      const type = comm.communicationType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    // Group by direction
    const communicationsByDirection = results.reduce((acc, comm) => {
      const direction = comm.direction;
      acc[direction] = (acc[direction] || 0) + 1;
      return acc;
    }, {});
    
    // Group by channel
    const communicationsByChannel = results.reduce((acc, comm) => {
      const channel = comm.channel;
      if (channel) {
        acc[channel] = (acc[channel] || 0) + 1;
      }
      return acc;
    }, {});
    
    // Calculate sentiment distribution
    const sentimentAnalysis = results.reduce((acc, comm) => {
      const sentiment = comm.sentiment;
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});
    
    // Convert sentiment counts to percentages
    Object.keys(sentimentAnalysis).forEach(key => {
      sentimentAnalysis[key] = (sentimentAnalysis[key] / totalCommunications) * 100;
    });
    
    // Extract tags to find most discussed topics
    const allTags = results.flatMap(comm => comm.tags || []);
    const topicCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
    
    // Sort topics by count and take top 5
    const mostDiscussedTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    
    // Calculate average duration for communications with duration
    const durationsAvailable = results.filter(comm => comm.duration !== null && comm.duration !== undefined);
    const averageDuration = durationsAvailable.length > 0
      ? durationsAvailable.reduce((sum, comm) => sum + comm.duration, 0) / durationsAvailable.length
      : null;
    
    // Create the analytics record
    const analyticsData: InsertCommunicationAnalytic = {
      userId,
      clientId,
      period,
      startDate,
      endDate,
      totalCommunications,
      communicationsByType,
      communicationsByDirection,
      communicationsByChannel,
      sentimentAnalysis,
      mostDiscussedTopics,
      averageDuration,
      // These would need additional queries to calculate properly
      averageResponseTime: null,
      communicationEffectiveness: null,
      followupCompletion: null
    };
    
    // Save and return the analytics
    const [analytics] = await db.insert(communicationAnalytics).values(analyticsData).returning();
    return analytics;
  }

  async getCommunicationAnalytics(
    userId: number | null = null,
    clientId: number | null = null,
    period: string = 'monthly',
    limit: number = 12
  ): Promise<CommunicationAnalytic[]> {
    let query = db.select().from(communicationAnalytics);
    
    if (userId) {
      query = query.where(eq(communicationAnalytics.userId, userId));
    }
    
    if (clientId) {
      query = query.where(eq(communicationAnalytics.clientId, clientId));
    }
    
    query = query.where(eq(communicationAnalytics.period, period));
    query = query.orderBy(desc(communicationAnalytics.endDate));
    query = query.limit(limit);
    
    return query;
  }
}

export const storage = new DatabaseStorage();
