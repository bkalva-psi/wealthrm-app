import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { users, prospects } from "../shared/schema";

async function addMoreProspects() {
  try {
    console.log("🌱 Adding more prospect data...");
    
    // Get the test user (if exists)
    const existingUsers = await db.select().from(users).where(eq(users.username, "test"));
    let userId = existingUsers.length > 0 ? existingUsers[0].id : 0;
    
    // Create test user if not exists
    if (userId === 0) {
      console.log("Creating test user...");
      const [user] = await db.insert(users).values({
        username: "test",
        password: "password123",
        fullName: "Test User",
        role: "relationship_manager",
        avatarUrl: "https://ui-avatars.com/api/?name=Test+User&background=0D8ABC&color=fff",
        jobTitle: "Relationship Manager",
        email: "test@ujjivan.com",
        phone: "+91 98765 43210"
      }).returning();
      
      userId = user.id;
    }
    
    // Add more prospects with different stages
    console.log("Adding more prospects...");
    await db.insert(prospects).values([
      // New Leads
      {
        fullName: "Sanjay Gupta",
        initials: "SG",
        potentialAum: "₹38,00,000",
        potentialAumValue: 3800000,
        email: "sanjay.gupta@example.com",
        phone: "+91 97865 12345",
        stage: "new",
        probability: 15,
        source: "referral",
        lastContactDate: new Date("2025-05-12"),
        notes: "Referred by Rahul Sharma. Initial phone call scheduled.",
        assignedTo: userId
      },
      {
        fullName: "Prachi Deshmukh",
        initials: "PD",
        potentialAum: "₹42,00,000",
        potentialAumValue: 4200000,
        email: "prachi.deshmukh@example.com",
        phone: "+91 87654 23456",
        stage: "new",
        probability: 20,
        source: "website",
        lastContactDate: new Date("2025-05-14"),
        notes: "Requested information on tax-saving investment options.",
        assignedTo: userId
      },
      {
        fullName: "Kiran Reddy",
        initials: "KR",
        potentialAum: "₹25,00,000",
        potentialAumValue: 2500000,
        email: "kiran.reddy@example.com",
        phone: "+91 76543 34567",
        stage: "new",
        probability: 10,
        source: "advertisement",
        lastContactDate: new Date("2025-05-16"),
        notes: "Responded to newspaper advertisement. Very preliminary interest.",
        assignedTo: userId
      },
      {
        fullName: "Aditi Sharma",
        initials: "AS",
        potentialAum: "₹55,00,000",
        potentialAumValue: 5500000,
        email: "aditi.sharma@example.com",
        phone: "+91 65432 45678",
        stage: "new",
        probability: 25,
        source: "event",
        lastContactDate: new Date("2025-05-15"),
        notes: "Met at investment seminar. Interested in mutual funds.",
        assignedTo: userId
      },
      {
        fullName: "Nikhil Joshi",
        initials: "NJ",
        potentialAum: "₹18,00,000",
        potentialAumValue: 1800000,
        email: "nikhil.joshi@example.com",
        phone: "+91 54321 56789",
        stage: "new",
        probability: 20,
        source: "social",
        lastContactDate: new Date("2025-05-13"),
        notes: "Connected through LinkedIn. Looking for retirement planning options.",
        assignedTo: userId
      },
      
      // Qualified Leads
      {
        fullName: "Tanvi Malhotra",
        initials: "TM",
        potentialAum: "₹65,00,000",
        potentialAumValue: 6500000,
        email: "tanvi.malhotra@example.com",
        phone: "+91 43210 67890",
        stage: "qualified",
        probability: 40,
        source: "referral",
        lastContactDate: new Date("2025-05-10"),
        notes: "Has significant assets but dissatisfied with current advisor. Ready for detailed discussion.",
        assignedTo: userId
      },
      {
        fullName: "Raj Kapoor",
        initials: "RK",
        potentialAum: "₹48,00,000",
        potentialAumValue: 4800000,
        email: "raj.kapoor@example.com",
        phone: "+91 32109 78901",
        stage: "qualified",
        probability: 35,
        source: "website",
        lastContactDate: new Date("2025-05-11"),
        notes: "Second meeting completed. Looking for tax-efficient growth options.",
        assignedTo: userId
      },
      {
        fullName: "Aisha Khan",
        initials: "AK",
        potentialAum: "₹72,00,000",
        potentialAumValue: 7200000,
        email: "aisha.khan@example.com",
        phone: "+91 21098 89012",
        stage: "qualified",
        probability: 45,
        source: "event",
        lastContactDate: new Date("2025-05-09"),
        notes: "Detailed needs assessment completed. Has clear investment goals.",
        assignedTo: userId
      },
      {
        fullName: "Vivek Singhania",
        initials: "VS",
        potentialAum: "₹36,00,000",
        potentialAumValue: 3600000,
        email: "vivek.singhania@example.com",
        phone: "+91 10987 90123",
        stage: "qualified",
        probability: 30,
        source: "referral",
        lastContactDate: new Date("2025-05-12"),
        notes: "Financial situation analyzed. Ready for portfolio recommendations.",
        assignedTo: userId
      },
      
      // Proposal Stage
      {
        fullName: "Meera Bajaj",
        initials: "MB",
        potentialAum: "₹85,00,000",
        potentialAumValue: 8500000,
        email: "meera.bajaj@example.com",
        phone: "+91 09876 01234",
        stage: "proposal",
        probability: 60,
        source: "referral",
        lastContactDate: new Date("2025-05-08"),
        notes: "Proposal presented. Client reviewing the documents. Follow-up scheduled.",
        assignedTo: userId
      },
      {
        fullName: "Arjun Mehta",
        initials: "AM",
        potentialAum: "₹52,00,000",
        potentialAumValue: 5200000,
        email: "arjun.mehta@example.com",
        phone: "+91 98765 12345",
        stage: "proposal",
        probability: 65,
        source: "website",
        lastContactDate: new Date("2025-05-07"),
        notes: "Custom portfolio proposal sent. Client asked for some clarifications.",
        assignedTo: userId
      },
      {
        fullName: "Shreya Patel",
        initials: "SP",
        potentialAum: "₹93,00,000",
        potentialAumValue: 9300000,
        email: "shreya.patel@example.com",
        phone: "+91 87654 23456",
        stage: "proposal",
        probability: 70,
        source: "event",
        lastContactDate: new Date("2025-05-06"),
        notes: "Comprehensive proposal presented in person. Very positive response.",
        assignedTo: userId
      },
      
      // Negotiation Stage
      {
        fullName: "Kunal Agarwal",
        initials: "KA",
        potentialAum: "₹1,20,00,000",
        potentialAumValue: 12000000,
        email: "kunal.agarwal@example.com",
        phone: "+91 76543 34567",
        stage: "negotiation",
        probability: 80,
        source: "referral",
        lastContactDate: new Date("2025-05-05"),
        notes: "Discussing fee structure. Client wants slight modifications to portfolio allocation.",
        assignedTo: userId
      },
      {
        fullName: "Nandini Reddy",
        initials: "NR",
        potentialAum: "₹68,00,000",
        potentialAumValue: 6800000,
        email: "nandini.reddy@example.com",
        phone: "+91 65432 45678",
        stage: "negotiation",
        probability: 85,
        source: "website",
        lastContactDate: new Date("2025-05-04"),
        notes: "Final meeting scheduled to sign documents. Client requested minor changes.",
        assignedTo: userId
      },
      
      // Won Stage
      {
        fullName: "Vikram Bhatia",
        initials: "VB",
        potentialAum: "₹78,00,000",
        potentialAumValue: 7800000,
        email: "vikram.bhatia@example.com",
        phone: "+91 54321 56789",
        stage: "won",
        probability: 100,
        source: "referral",
        lastContactDate: new Date("2025-05-03"),
        notes: "All documents signed. Initial investment completed. Onboarding process started.",
        assignedTo: userId
      },
      {
        fullName: "Ritu Sharma",
        initials: "RS",
        potentialAum: "₹45,00,000",
        potentialAumValue: 4500000,
        email: "ritu.sharma@example.com",
        phone: "+91 43210 67890",
        stage: "won",
        probability: 100,
        source: "event",
        lastContactDate: new Date("2025-05-02"),
        notes: "Client fully onboarded. Portfolio established. Schedule quarterly review.",
        assignedTo: userId
      },
      
      // Lost Stage
      {
        fullName: "Mohan Desai",
        initials: "MD",
        potentialAum: "₹32,00,000",
        potentialAumValue: 3200000,
        email: "mohan.desai@example.com",
        phone: "+91 32109 78901",
        stage: "lost",
        probability: 0,
        source: "advertisement",
        lastContactDate: new Date("2025-05-01"),
        notes: "Decided to go with competitor. Cited lower fees as primary reason.",
        assignedTo: userId
      },
      {
        fullName: "Leela Krishnan",
        initials: "LK",
        potentialAum: "₹58,00,000",
        potentialAumValue: 5800000,
        email: "leela.krishnan@example.com",
        phone: "+91 21098 89012",
        stage: "lost",
        probability: 0,
        source: "website",
        lastContactDate: new Date("2025-04-30"),
        notes: "Put investment plans on hold due to personal financial situation. Follow up in 6 months.",
        assignedTo: userId
      }
    ]);
    
    console.log("✅ Additional prospects data added successfully!");

  } catch (error) {
    console.error("❌ Error adding sample data:", error);
  } finally {
    process.exit(0);
  }
}

addMoreProspects();