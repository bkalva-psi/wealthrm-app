import { db } from "../server/db";
import { 
  clients, 
  prospects, 
  tasks, 
  appointments, 
  portfolioAlerts,
  performanceMetrics,
  aumTrends,
  salesPipeline
} from "../shared/schema";

async function seedData() {
  console.log("🌱 Seeding data for test user...");
  
  try {
    // Get the test user id (which should be 1)
    const userId = 1;
    
    // Add sample clients
    console.log("Adding clients...");
    await db.insert(clients).values([
      {
        fullName: "Rahul Sharma",
        initials: "RS",
        tier: "platinum",
        aum: "₹75,00,000",
        aumValue: 7500000,
        email: "rahul.sharma@example.com",
        phone: "+91 98765 43210",
        lastContactDate: new Date("2025-05-10"),
        riskProfile: "moderate",
        assignedTo: userId
      },
      {
        fullName: "Priya Patel",
        initials: "PP",
        tier: "gold",
        aum: "₹45,00,000",
        aumValue: 4500000,
        email: "priya.patel@example.com",
        phone: "+91 87654 32109",
        lastContactDate: new Date("2025-05-15"),
        riskProfile: "conservative",
        assignedTo: userId
      },
      {
        fullName: "Vikram Malhotra",
        initials: "VM",
        tier: "platinum",
        aum: "₹90,00,000",
        aumValue: 9000000,
        email: "vikram.malhotra@example.com",
        phone: "+91 76543 21098",
        lastContactDate: new Date("2025-05-05"),
        riskProfile: "aggressive",
        assignedTo: userId
      },
      {
        fullName: "Ananya Singh",
        initials: "AS",
        tier: "silver",
        aum: "₹25,00,000",
        aumValue: 2500000,
        email: "ananya.singh@example.com",
        phone: "+91 65432 10987",
        lastContactDate: new Date("2025-04-28"),
        riskProfile: "moderate",
        assignedTo: userId
      },
      {
        fullName: "Rajesh Kumar",
        initials: "RK",
        tier: "gold",
        aum: "₹55,00,000",
        aumValue: 5500000,
        email: "rajesh.kumar@example.com",
        phone: "+91 54321 09876",
        lastContactDate: new Date("2025-05-18"),
        riskProfile: "conservative",
        assignedTo: userId
      }
    ]);
    
    // Add sample prospects
    console.log("Adding prospects...");
    await db.insert(prospects).values([
      {
        fullName: "Anjali Desai",
        initials: "AD",
        potentialAum: "₹30,00,000",
        potentialAumValue: 3000000,
        email: "anjali.desai@example.com",
        phone: "+91 43210 98765",
        stage: "discovery",
        probability: 30,
        source: "referral",
        lastContactDate: new Date("2025-05-17"),
        notes: "Initial meeting went well. Interested in mutual funds.",
        assignedTo: userId
      },
      {
        fullName: "Deepak Verma",
        initials: "DV",
        potentialAum: "₹60,00,000",
        potentialAumValue: 6000000,
        email: "deepak.verma@example.com",
        phone: "+91 32109 87654",
        stage: "proposal",
        probability: 60,
        source: "website",
        lastContactDate: new Date("2025-05-14"),
        notes: "Presented portfolio options. Following up next week.",
        assignedTo: userId
      },
      {
        fullName: "Meera Iyer",
        initials: "MI",
        potentialAum: "₹40,00,000",
        potentialAumValue: 4000000,
        email: "meera.iyer@example.com",
        phone: "+91 21098 76543",
        stage: "negotiation",
        probability: 80,
        source: "event",
        lastContactDate: new Date("2025-05-19"),
        notes: "Close to finalizing. Need to discuss fee structure.",
        assignedTo: userId
      }
    ]);
    
    // Add sample tasks
    console.log("Adding tasks...");
    await db.insert(tasks).values([
      {
        title: "Call Rahul Sharma about portfolio rebalancing",
        description: "Discuss recent market changes and suggest adjustments",
        dueDate: new Date("2025-05-26"),
        completed: false,
        assignedTo: userId,
        clientId: 1
      },
      {
        title: "Send investment proposal to Deepak Verma",
        description: "Include conservative and moderate risk options",
        dueDate: new Date("2025-05-27"),
        completed: false,
        assignedTo: userId,
        prospectId: 2
      },
      {
        title: "Prepare for quarterly review with Priya Patel",
        description: "Gather performance data and prepare presentation",
        dueDate: new Date("2025-05-28"),
        completed: false,
        assignedTo: userId,
        clientId: 2
      },
      {
        title: "Follow up with Meera Iyer on contract signing",
        description: "Address remaining questions about fees",
        dueDate: new Date("2025-05-25"),
        completed: false,
        assignedTo: userId,
        prospectId: 3
      }
    ]);
    
    // Add sample appointments
    console.log("Adding appointments...");
    await db.insert(appointments).values([
      {
        type: "meeting",
        title: "Portfolio Review with Vikram Malhotra",
        description: "Quarterly performance review",
        startTime: new Date("2025-05-25T10:00:00"),
        endTime: new Date("2025-05-25T11:00:00"),
        location: "Virtual Meeting",
        priority: "high",
        assignedTo: userId,
        clientId: 3
      },
      {
        type: "call",
        title: "Initial Consultation with Anjali Desai",
        description: "Understand investment goals and risk appetite",
        startTime: new Date("2025-05-24T14:00:00"),
        endTime: new Date("2025-05-24T14:30:00"),
        location: "Phone",
        priority: "medium",
        assignedTo: userId,
        prospectId: 1
      },
      {
        type: "meeting",
        title: "Contract Signing with Meera Iyer",
        description: "Finalize investment terms and sign agreement",
        startTime: new Date("2025-05-26T15:00:00"),
        endTime: new Date("2025-05-26T16:00:00"),
        location: "Ujjivan Branch Office",
        priority: "high",
        assignedTo: userId,
        prospectId: 3
      }
    ]);
    
    // Add sample portfolio alerts
    console.log("Adding portfolio alerts...");
    await db.insert(portfolioAlerts).values([
      {
        title: "Market Volatility Alert",
        description: "Recent market fluctuations may impact Rahul Sharma's aggressive fund positions",
        severity: "medium",
        clientId: 1,
        read: false,
        actionRequired: true
      },
      {
        title: "Investment Opportunity",
        description: "New fixed income product available that matches Priya Patel's risk profile",
        severity: "low",
        clientId: 2,
        read: false,
        actionRequired: false
      },
      {
        title: "Portfolio Rebalance Needed",
        description: "Vikram Malhotra's equity allocation has exceeded target threshold by 7%",
        severity: "high",
        clientId: 3,
        read: false,
        actionRequired: true
      }
    ]);
    
    // Add performance metrics
    console.log("Adding performance metrics...");
    await db.insert(performanceMetrics).values([
      {
        userId,
        metricType: "new_clients",
        currentValue: 3,
        targetValue: 5,
        percentageChange: 20,
        month: 5,
        year: 2025
      },
      {
        userId,
        metricType: "aum_growth",
        currentValue: 22500000,
        targetValue: 25000000,
        percentageChange: 15,
        month: 5,
        year: 2025
      },
      {
        userId,
        metricType: "conversion_rate",
        currentValue: 65,
        targetValue: 70,
        percentageChange: 8,
        month: 5,
        year: 2025
      },
      {
        userId,
        metricType: "client_retention",
        currentValue: 95,
        targetValue: 98,
        percentageChange: 2,
        month: 5,
        year: 2025
      }
    ]);
    
    // Add AUM trends
    console.log("Adding AUM trends...");
    const currentDate = new Date();
    const months = 6;
    
    // Starting value for AUM trends
    const baseValue = 18000000;
    
    for (let i = 0; i < months; i++) {
      const month = new Date(currentDate);
      month.setMonth(month.getMonth() - i);
      
      const currentValue = baseValue + (i * 1000000);
      const previousValue = i > 0 ? baseValue + ((i-1) * 1000000) : baseValue - 500000;
      
      await db.insert(aumTrends).values({
        userId,
        month: month.getMonth() + 1,
        year: month.getFullYear(),
        currentValue,
        previousValue
      });
    }
    
    // Add sales pipeline data
    console.log("Adding sales pipeline data...");
    await db.insert(salesPipeline).values([
      {
        userId,
        stage: "discovery",
        value: 4000000,
        count: 2
      },
      {
        userId,
        stage: "proposal",
        value: 6000000,
        count: 1
      },
      {
        userId,
        stage: "negotiation",
        value: 4000000,
        count: 1
      },
      {
        userId,
        stage: "closed",
        value: 3000000,
        count: 1
      }
    ]);
    
    console.log("✅ Seed data created successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    process.exit(0);
  }
}

seedData();