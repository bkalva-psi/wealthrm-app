import { db } from '../server/db';
import { appointments } from '../shared/schema';
import { eq } from 'drizzle-orm';

const wealthManagementMeetingTypes = [
  // Portfolio Management
  "Quarterly Portfolio Review",
  "Investment Strategy Discussion",
  "Portfolio Rebalancing Session",
  "Asset Allocation Review",
  "Risk Assessment Meeting",
  "Performance Review & Analysis",
  
  // Financial Planning
  "Retirement Planning Consultation",
  "Estate Planning Discussion",
  "Tax Planning Strategy Session",
  "Insurance Coverage Review",
  "Financial Goal Setting Meeting",
  "Wealth Transfer Planning",
  
  // Investment Activities
  "Market Outlook Briefing",
  "New Investment Opportunities",
  "Sector Analysis Discussion",
  "Fund Selection Review",
  "Alternative Investment Consultation",
  "ESG Investment Strategy",
  
  // Client Relationship
  "Annual Client Review",
  "Relationship Manager Introduction",
  "Investment Committee Update",
  "Family Wealth Discussion",
  "Next Generation Planning",
  "Philanthropic Planning Session",
  
  // Operational
  "Account Opening Formalities",
  "KYC Documentation Review",
  "Compliance Update Meeting",
  "Statement Review Session",
  "Digital Banking Setup",
  "Service Enhancement Discussion"
];

const wealthManagementDescriptions = [
  "Comprehensive review of portfolio performance and investment strategy alignment",
  "Discussion on market trends and their impact on client investments",
  "Analysis of asset allocation and rebalancing recommendations",
  "Review of risk tolerance and investment objectives",
  "Evaluation of retirement planning progress and adjustments",
  "Estate planning strategies and wealth transfer options",
  "Tax-efficient investment strategies and planning",
  "Insurance needs assessment and coverage optimization",
  "Setting and reviewing long-term financial goals",
  "Market outlook presentation and investment opportunities",
  "Alternative investment options and suitability assessment",
  "ESG investment strategies and sustainable investing",
  "Annual relationship review and service feedback",
  "Introduction to new wealth management services",
  "Family wealth planning and multi-generational strategies",
  "Philanthropic giving strategies and charitable planning",
  "Account setup and documentation completion",
  "Regulatory updates and compliance requirements",
  "Digital platform training and feature walkthrough",
  "Service enhancement opportunities and feedback"
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function updateAppointmentTitles() {
  try {
    console.log('Starting appointment titles update...');
    
    // Get all appointments
    const allAppointments = await db.select().from(appointments);
    
    console.log(`Found ${allAppointments.length} appointments to update`);
    
    // Update each appointment with wealth management related content
    for (const appointment of allAppointments) {
      const newTitle = getRandomItem(wealthManagementMeetingTypes);
      const newDescription = getRandomItem(wealthManagementDescriptions);
      
      await db
        .update(appointments)
        .set({
          title: newTitle,
          description: newDescription
        })
        .where(eq(appointments.id, appointment.id));
      
      console.log(`Updated appointment ${appointment.id}: ${newTitle}`);
    }
    
    console.log('✅ Successfully updated all appointment titles and descriptions!');
    
  } catch (error) {
    console.error('❌ Error updating appointment titles:', error);
  }
}

updateAppointmentTitles();