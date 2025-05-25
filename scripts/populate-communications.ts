import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { faker } from "@faker-js/faker";

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

// Create a PostgreSQL pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Set a seed for reproducible fake data
faker.seed(42);

// Communication types
const communicationTypes = [
  "portfolio_review",
  "market_update",
  "investment_advice",
  "onboarding",
  "periodic_update",
  "complaint_handling",
  "tax_planning",
  "wealth_planning",
  "educational",
  "feedback"
];

// Communication channels
const channels = ["email", "phone", "in_person", "video_call", "messaging"];

// Communication directions
const directions = ["inbound", "outbound"];

// Communication sentiments
const sentiments = ["positive", "neutral", "negative", "mixed"];

// Communication topics/tags
const tags = [
  "portfolio_performance",
  "market_conditions",
  "investment_strategy",
  "risk_profile",
  "financial_goals",
  "tax_planning",
  "retirement_planning",
  "estate_planning",
  "education_funding",
  "insurance",
  "service_issues",
  "account_changes",
  "fee_discussion",
  "documentation",
  "onboarding",
  "referral",
  "life_events"
];

// Action item priorities
const priorities = ["high", "medium", "low"];

// Action item statuses
const statuses = ["pending", "in_progress", "completed", "cancelled"];

// Attachment types
const attachmentTypes = [
  "portfolio_statement",
  "investment_proposal",
  "market_report",
  "tax_document",
  "client_form",
  "disclosure",
  "educational_material"
];

// Days of the week
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Time slots
const timeSlots = ["morning", "afternoon", "evening"];

// Template categories
const templateCategories = [
  "welcome",
  "market_update",
  "portfolio_review",
  "birthday_greeting",
  "anniversary_greeting",
  "holiday_greeting",
  "investment_opportunity",
  "tax_planning",
  "educational",
  "service_update"
];

// Get random element from array
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Get random subset of array elements
const getRandomSubset = <T>(array: T[], min: number = 1, max: number = 3): T[] => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get random date in the past (up to maxDays ago)
const getRandomPastDate = (maxDays: number = 365): Date => {
  const daysAgo = Math.floor(Math.random() * maxDays);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

// Get random future date (up to maxDays in the future)
const getRandomFutureDate = (maxDays: number = 30): Date => {
  const daysAhead = Math.floor(Math.random() * maxDays) + 1;
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
};

// Get random time duration in minutes (for calls/meetings)
const getRandomDuration = (min: number = 5, max: number = 120): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function main() {
  try {
    // Get all clients from the database
    const allClients = await db.select().from(clients);
    
    if (allClients.length === 0) {
      console.error("No clients found in the database. Please run the client population script first.");
      process.exit(1);
    }
    
    console.log(`Found ${allClients.length} clients in the database.`);
    
    // Create communication templates
    const templateData = [];
    for (let i = 0; i < 15; i++) {
      const category = getRandomElement(templateCategories);
      
      let subject = "";
      let content = "";
      
      switch (category) {
        case "welcome":
          subject = "Welcome to Ujjival Small Finance Bank";
          content = "Dear {{clientName}},\n\nWelcome to Ujjival Small Finance Bank's wealth management services. We are delighted to have you as our valued client.\n\nAs your dedicated Relationship Manager, I look forward to helping you achieve your financial goals. Please feel free to reach out at any time.\n\nBest regards,\n{{rmName}}";
          break;
        case "market_update":
          subject = "Monthly Market Update - {{month}} {{year}}";
          content = "Dear {{clientName}},\n\nHere is your monthly market update for {{month}} {{year}}.\n\nKey highlights:\n- {{highlight1}}\n- {{highlight2}}\n- {{highlight3}}\n\nPlease let me know if you would like to discuss how these market developments might affect your portfolio.\n\nBest regards,\n{{rmName}}";
          break;
        case "portfolio_review":
          subject = "Your Portfolio Review - {{quarter}} {{year}}";
          content = "Dear {{clientName}},\n\nI would like to schedule a portfolio review meeting to discuss your investment performance and strategy.\n\nYour portfolio has {{performanceDescription}} during the past quarter, and I have some recommendations I'd like to share with you.\n\nPlease let me know your availability for a meeting.\n\nBest regards,\n{{rmName}}";
          break;
        case "birthday_greeting":
          subject = "Happy Birthday!";
          content = "Dear {{clientName}},\n\nOn behalf of Ujjival Small Finance Bank, I would like to wish you a very happy birthday! May the coming year bring you happiness, good health, and prosperity.\n\nBest wishes,\n{{rmName}}";
          break;
        case "anniversary_greeting":
          subject = "Happy Anniversary as our Valued Client";
          content = "Dear {{clientName}},\n\nCongratulations on completing another year with Ujjival Small Finance Bank. We value your trust and loyalty, and we look forward to continuing our relationship for many more years.\n\nBest regards,\n{{rmName}}";
          break;
        default:
          subject = `${category.replace('_', ' ').toUpperCase()} - ${faker.lorem.words(3)}`;
          content = faker.lorem.paragraphs(3);
      }
      
      templateData.push({
        name: `${category.replace('_', ' ')} template ${i + 1}`,
        category,
        subject,
        content,
        variables: ["clientName", "rmName", "month", "year", "quarter", "performanceDescription", "highlight1", "highlight2", "highlight3"],
        isGlobal: Math.random() > 0.7, // 30% chance of being global
        createdBy: 1, // Assume user ID 1 is creating all templates
        isActive: true
      });
    }
    
    console.log(`Inserting ${templateData.length} communication templates...`);
    await db.insert(communicationTemplates).values(templateData);
    
    // Generate client communication preferences
    const preferenceData = [];
    for (const client of allClients) {
      preferenceData.push({
        clientId: client.id,
        preferredChannels: getRandomSubset(channels, 1, 3),
        preferredFrequency: getRandomElement(["weekly", "bi-weekly", "monthly", "quarterly"]),
        preferredDays: getRandomSubset(daysOfWeek, 1, 3),
        preferredTimeSlots: getRandomSubset(timeSlots, 1, 2),
        preferredLanguage: getRandomElement(["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam"]),
        optInMarketing: Math.random() > 0.3, // 70% chance of opting in
        doNotContact: Math.random() < 0.05, // 5% chance of do not contact
        lastUpdated: getRandomPastDate(90)
      });
    }
    
    console.log(`Inserting ${preferenceData.length} client communication preferences...`);
    await db.insert(clientCommunicationPreferences).values(preferenceData);
    
    // Generate communications (more for older clients, fewer for newer ones)
    const communicationData = [];
    const actionItemData = [];
    const attachmentData = [];
    
    for (const client of allClients) {
      // Generate between 5-20 communications per client
      const communicationCount = Math.floor(Math.random() * 16) + 5;
      
      for (let i = 0; i < communicationCount; i++) {
        // Generate a communication record
        const startTime = getRandomPastDate(365);
        const communicationType = getRandomElement(communicationTypes);
        const channel = getRandomElement(channels);
        const direction = getRandomElement(directions);
        const sentiment = getRandomElement(sentiments);
        const duration = channel === "email" ? null : getRandomDuration();
        
        // More structured subject and summary based on communication type
        let subject = "";
        let summary = "";
        
        switch (communicationType) {
          case "portfolio_review":
            subject = `Portfolio Review - ${new Date(startTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
            summary = `Reviewed portfolio performance for ${client.fullName}. Discussed market conditions, recent performance, and potential adjustments to investment strategy.`;
            break;
          case "market_update":
            subject = `Market Update - ${new Date(startTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
            summary = `Provided market updates to ${client.fullName} covering recent market developments, economic indicators, and potential impacts on their investment strategy.`;
            break;
          case "investment_advice":
            subject = "Investment Opportunity Discussion";
            summary = `Discussed potential investment opportunities with ${client.fullName} based on their risk profile and financial goals.`;
            break;
          case "onboarding":
            subject = "Welcome and Onboarding Process";
            summary = `Completed onboarding process for ${client.fullName}. Reviewed financial goals, risk tolerance, and initial investment strategy.`;
            break;
          case "complaint_handling":
            subject = "Resolution of Service Issue";
            summary = `Addressed concerns from ${client.fullName} regarding ${faker.lorem.words(3)}. Provided resolution steps and follow-up plan.`;
            break;
          default:
            subject = `${communicationType.replace('_', ' ')} - ${faker.lorem.words(3)}`;
            summary = faker.lorem.paragraph();
        }
        
        const communicationId = i + 1 + (client.id * 100); // Generate unique IDs
        
        communicationData.push({
          id: communicationId,
          clientId: client.id,
          initiatedBy: 1, // Assume user ID 1 is the RM
          startTime,
          endTime: duration ? new Date(startTime.getTime() + duration * 60000) : null,
          duration,
          communicationType,
          channel,
          direction,
          subject,
          summary,
          notes: faker.lorem.paragraphs(2),
          sentiment,
          tags: getRandomSubset(tags, 0, 4),
          followUpRequired: Math.random() > 0.7, // 30% chance of requiring follow-up
          nextSteps: Math.random() > 0.7 ? faker.lorem.sentences(2) : null
        });
        
        // Generate action items for some communications (30% chance)
        if (Math.random() > 0.7) {
          const actionItemCount = Math.floor(Math.random() * 3) + 1; // 1-3 action items
          
          for (let j = 0; j < actionItemCount; j++) {
            actionItemData.push({
              communicationId,
              title: `${faker.lorem.words(3)} for ${client.fullName}`,
              description: faker.lorem.sentences(2),
              assignedTo: 1, // Assume user ID 1 is the RM
              dueDate: getRandomFutureDate(30),
              priority: getRandomElement(priorities),
              status: getRandomElement(statuses),
              completedAt: Math.random() > 0.5 ? getRandomPastDate(10) : null
            });
          }
        }
        
        // Generate attachments for some communications (20% chance)
        if (Math.random() > 0.8) {
          const attachmentCount = Math.floor(Math.random() * 2) + 1; // 1-2 attachments
          
          for (let j = 0; j < attachmentCount; j++) {
            attachmentData.push({
              communicationId,
              fileName: `${getRandomElement(attachmentTypes)}_${faker.lorem.slug(2)}.pdf`,
              fileType: "application/pdf",
              fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB-5MB
              fileUrl: `https://example.com/attachments/${faker.lorem.slug(4)}.pdf`,
              description: faker.lorem.sentence(),
              uploadedBy: 1,
              createdAt: startTime
            });
          }
        }
      }
    }
    
    console.log(`Inserting ${communicationData.length} communications...`);
    await db.insert(communications).values(communicationData);
    
    console.log(`Inserting ${actionItemData.length} action items...`);
    await db.insert(communicationActionItems).values(actionItemData);
    
    console.log(`Inserting ${attachmentData.length} attachments...`);
    await db.insert(communicationAttachments).values(attachmentData);
    
    console.log("Sample communication data inserted successfully!");
    
  } catch (error) {
    console.error("Error inserting sample data:", error);
  } finally {
    await db.end();
  }
}

main();