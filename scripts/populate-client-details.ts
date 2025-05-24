import { db } from "../server/db";
import { clients } from "../shared/schema";
import { eq } from "drizzle-orm";

// Indian states
const indianStates = [
  "Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "Uttar Pradesh", 
  "Gujarat", "West Bengal", "Telangana", "Haryana", "Punjab",
  "Rajasthan", "Madhya Pradesh", "Kerala", "Andhra Pradesh", "Bihar"
];

// Indian cities
const indianCities: Record<string, string[]> = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belgaum"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Ghaziabad"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Rohtak"],
  "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"]
};

// Profession sectors
const sectors = [
  "Information Technology", "Banking & Finance", "Healthcare", "Education", 
  "Manufacturing", "Retail", "Government", "Hospitality", "Real Estate",
  "Telecommunications", "Pharmaceuticals", "Automotive", "Energy", "Agriculture"
];

// Common Indian professions
const professions = [
  "Software Engineer", "Doctor", "Chartered Accountant", "Teacher", "Civil Servant",
  "Business Owner", "Financial Analyst", "Banker", "Lawyer", "Architect",
  "Consultant", "Professor", "Engineer", "Pharmacist", "Sales Manager"
];

// Company names - Indian focused
const companyNames = [
  "Tata Consultancy Services", "Infosys", "Reliance Industries", "HDFC Bank", "Wipro",
  "State Bank of India", "ICICI Bank", "Larsen & Toubro", "Bharti Airtel", "HCL Technologies",
  "Mahindra & Mahindra", "Axis Bank", "ITC Limited", "Bajaj Auto", "Tech Mahindra",
  "Kotak Mahindra Bank", "Adani Group", "Sun Pharmaceutical", "Hindustan Unilever", "Maruti Suzuki"
];

// Income ranges - Formatted for INR
const incomeRanges = [
  "₹5-10 Lakhs", "₹10-15 Lakhs", "₹15-25 Lakhs", "₹25-50 Lakhs", "₹50 Lakhs-1 Crore",
  "₹1-2 Crores", "₹2-5 Crores", "₹5+ Crores"
];

// Investment horizons
const investmentHorizons = [
  "Short-term (0-3 years)", "Medium-term (3-7 years)", "Long-term (7+ years)"
];

// Investment objectives
const investmentObjectives = [
  "Retirement Planning", "Children's Education", "Wealth Creation", "Tax Saving",
  "Regular Income", "Capital Preservation", "House Purchase", "Business Expansion"
];

// Preferred investment products
const investmentProducts = [
  "Mutual Funds", "Fixed Deposits", "Equity", "Real Estate", "Government Bonds",
  "Gold", "Insurance Products", "Corporate Bonds", "PPF", "NPS"
];

// Source of wealth
const wealthSources = [
  "Employment Income", "Business Income", "Inheritance", "Investments", 
  "Property Sale", "Salary & Business", "Family Wealth", "Professional Practice"
];

// KYC status options
const kycStatuses = ["Verified", "Pending", "Expired"];

// Identity proof types - Indian context
const identityProofTypes = ["Aadhaar Card", "PAN Card", "Passport", "Driving License", "Voter ID"];

// Address proof types - Indian context
const addressProofTypes = ["Aadhaar Card", "Passport", "Utility Bill", "Rent Agreement", "Bank Statement"];

// Tax residency statuses
const taxResidencyStatuses = ["Resident Indian", "Non-Resident Indian (NRI)", "Resident but Not Ordinarily Resident (RNOR)"];

// FATCA statuses
const fatcaStatuses = ["Compliant", "Pending", "Not Applicable"];

// Preferred contact methods
const contactMethods = ["Email", "Phone", "WhatsApp", "In-person", "Video Call"];

// Preferred contact times
const contactTimes = ["Morning (9-12)", "Afternoon (12-4)", "Evening (4-7)", "Weekend Only"];

// Communication frequencies
const communicationFrequencies = ["Weekly", "Bi-weekly", "Monthly", "Quarterly", "Half-yearly"];

// Client acquisition sources
const acquisitionSources = [
  "Referral", "Direct Marketing", "Branch Walk-in", "Corporate Relationship", 
  "Digital Campaign", "Wealth Seminar", "Bank Account Upgrade", "Partnership Program"
];

// Tax planning preferences
const taxPlanningPreferences = [
  "Aggressive Tax Planning", "Balanced Approach", "Conservative Approach", 
  "ELSS Investments", "Insurance-based Planning", "Real Estate Focused"
];

// Insurance coverage options
const insuranceCoverageTypes = [
  "Life Insurance", "Health Insurance", "Term Insurance", "Home Insurance", 
  "Vehicle Insurance", "Travel Insurance", "Critical Illness Cover"
];

// Retirement goals
const retirementGoals = [
  "Early Retirement (before 50)", "Regular Retirement (58-60)", "Extended Career (65+)",
  "Passive Income Focus", "Travel Plans", "Second Career", "Family Business"
];

// Financial interests
const financialInterests = [
  "Stock Market", "Real Estate", "International Investments", "Startup Funding",
  "Cryptocurrency", "Gold & Precious Metals", "Art & Collectibles", "Fixed Income"
];

// Net worth ranges
const netWorthRanges = [
  "₹50 Lakhs - 1 Crore", "₹1 - 5 Crores", "₹5 - 10 Crores", 
  "₹10 - 50 Crores", "₹50 - 100 Crores", "₹100+ Crores"
];

// Liquidity requirement options
const liquidityRequirements = [
  "Low (0-20%)", "Medium (20-40%)", "High (40%+)", "Emergency Fund Only"
];

// Helper functions for generating random data
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomBoolean(probability = 0.5): boolean {
  return Math.random() < probability;
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePANNumber(): string {
  // Format: AAAAA0000A
  const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const pan = 
    alphabets.charAt(Math.floor(Math.random() * alphabets.length)) +
    alphabets.charAt(Math.floor(Math.random() * alphabets.length)) +
    alphabets.charAt(Math.floor(Math.random() * alphabets.length)) +
    'P' + // P for person
    alphabets.charAt(Math.floor(Math.random() * alphabets.length)) +
    Math.floor(Math.random() * 10).toString() +
    Math.floor(Math.random() * 10).toString() +
    Math.floor(Math.random() * 10).toString() +
    Math.floor(Math.random() * 10).toString() +
    alphabets.charAt(Math.floor(Math.random() * alphabets.length));
  
  return pan;
}

function generateAadhaarNumber(): string {
  // 12-digit Aadhaar number
  let aadhaar = '';
  for (let i = 0; i < 12; i++) {
    aadhaar += Math.floor(Math.random() * 10).toString();
  }
  
  // Format as XXXX XXXX XXXX
  return `${aadhaar.substring(0, 4)} ${aadhaar.substring(4, 8)} ${aadhaar.substring(8, 12)}`;
}

function generateAddress(): string {
  const houseNumbers = ['Flat', 'Apartment', 'House', 'Villa'];
  const houseNumber = getRandomNumber(1, 999);
  const houseType = getRandomItem(houseNumbers);
  const streetNames = ['Main Road', 'Cross', 'Street', 'Avenue', 'Circle', 'Layout', 'Nagar', 'Colony', 'Extension'];
  const streetNumber = getRandomNumber(1, 20);
  const streetName = getRandomItem(streetNames);
  
  return `${houseType} ${houseNumber}, ${getRandomNumber(1, 5)}${getRandomItem(['st', 'nd', 'rd', 'th'])} ${streetName}, ${streetNumber}${getRandomItem(['st', 'nd', 'rd', 'th'])} Block`;
}

function generateChildrenDetails(count: number): string {
  if (count === 0) return "";
  
  const children = [];
  for (let i = 0; i < count; i++) {
    const gender = getRandomBoolean() ? 'Male' : 'Female';
    const age = getRandomNumber(1, 25);
    children.push({ name: `Child ${i+1}`, gender, age });
  }
  
  return JSON.stringify(children);
}

function generateNomineeDetails(spouseName: string | null, hasChildren: boolean): string {
  if (spouseName) {
    return JSON.stringify({
      name: spouseName,
      relation: "Spouse",
      sharePercentage: 100
    });
  } else if (hasChildren) {
    return JSON.stringify({
      name: "Child 1",
      relation: "Child",
      sharePercentage: 100
    });
  } else {
    return JSON.stringify({
      name: "Parent",
      relation: getRandomBoolean() ? "Father" : "Mother",
      sharePercentage: 100
    });
  }
}

function generateInsuranceCoverage(): string {
  const coverageTypes = getRandomItems(insuranceCoverageTypes, getRandomNumber(1, 4));
  const coverage = coverageTypes.map(type => {
    let coverAmount;
    if (type === 'Life Insurance' || type === 'Term Insurance') {
      coverAmount = `₹${getRandomNumber(50, 500)} Lakhs`;
    } else if (type === 'Health Insurance') {
      coverAmount = `₹${getRandomNumber(3, 50)} Lakhs`;
    } else {
      coverAmount = `₹${getRandomNumber(1, 30)} Lakhs`;
    }
    
    return { type, coverAmount };
  });
  
  return JSON.stringify(coverage);
}

function generateMajorLifeEvents(): string {
  const possibleEvents = [
    "Marriage", "Children's Education", "Home Purchase", "Business Expansion",
    "Retirement Planning", "Foreign Education", "Vehicle Purchase", "Foreign Travel"
  ];
  
  const events = getRandomItems(possibleEvents, getRandomNumber(1, 4)).map(event => {
    const yearsFromNow = getRandomNumber(1, 15);
    return { event, timeframe: `${yearsFromNow} years` };
  });
  
  return JSON.stringify(events);
}

function generateRecurringInvestments(): string {
  const hasRecurring = getRandomBoolean(0.7); // 70% chance of having recurring investments
  
  if (!hasRecurring) return "";
  
  const recurringTypes = ["SIP", "RD", "Insurance Premium", "PPF Contribution"];
  const recurring = getRandomItems(recurringTypes, getRandomNumber(1, 3)).map(type => {
    return {
      type,
      amount: `₹${getRandomNumber(1, 50)},000`,
      frequency: getRandomItem(["Monthly", "Quarterly", "Yearly"])
    };
  });
  
  return JSON.stringify(recurring);
}

async function populateClientDetails() {
  console.log("Populating clients with detailed information...");
  
  try {
    // Get all clients
    const allClients = await db.select().from(clients);
    
    // Process each client
    for (const client of allClients) {
      // Generate random state and city
      const homeState = getRandomItem(indianStates);
      const homeCity = getRandomItem(indianCities[homeState]);
      const workState = getRandomBoolean(0.7) ? homeState : getRandomItem(indianStates);
      const workCity = workState === homeState && getRandomBoolean(0.7) 
        ? homeCity 
        : getRandomItem(indianCities[workState]);
      
      // Marital status
      const maritalStatus = getRandomItem(["Single", "Married", "Divorced", "Widowed"]);
      const hasSpouse = maritalStatus === "Married";
      
      // Children
      const dependentsCount = hasSpouse 
        ? getRandomNumber(0, 3) 
        : getRandomNumber(0, 1);
      
      // Generate profession details
      const sector = getRandomItem(sectors);
      const profession = getRandomItem(professions);
      const companyName = getRandomItem(companyNames);
      
      // Generate financial details
      const investmentObjectivesList = getRandomItems(investmentObjectives, getRandomNumber(1, 3));
      const preferredProductsList = getRandomItems(investmentProducts, getRandomNumber(1, 4));
      const financialInterestsList = getRandomItems(financialInterests, getRandomNumber(1, 4));
      
      // KYC details
      const kycStatus = getRandomItem(kycStatuses);
      const identityProofType = getRandomItem(identityProofTypes);
      const addressProofType = getRandomItem(addressProofTypes);
      
      // Dates
      const now = new Date();
      const dateOfBirth = getRandomDate(
        new Date(now.getFullYear() - 65, 0, 1),
        new Date(now.getFullYear() - 25, 0, 1)
      );
      
      const kycDate = getRandomDate(
        new Date(now.getFullYear() - 3, 0, 1),
        new Date()
      );
      
      const anniversaryDate = hasSpouse 
        ? getRandomDate(
            new Date(now.getFullYear() - 30, 0, 1),
            new Date(now.getFullYear() - 1, 0, 1)
          )
        : null;
      
      const clientSince = getRandomDate(
        new Date(now.getFullYear() - 10, 0, 1),
        new Date(now.getFullYear() - 1, 0, 1)
      );
      
      // Update client with all the detailed information
      await db.update(clients)
        .set({
          // Personal Information
          dateOfBirth,
          maritalStatus,
          anniversaryDate,
          
          // Address Information
          homeAddress: generateAddress(),
          homeCity,
          homeState,
          homePincode: `${getRandomNumber(100000, 999999)}`,
          workAddress: generateAddress(),
          workCity,
          workState,
          workPincode: `${getRandomNumber(100000, 999999)}`,
          
          // Professional Information
          profession,
          sectorOfEmployment: sector,
          designation: profession,
          companyName,
          annualIncome: getRandomItem(incomeRanges),
          workExperience: getRandomNumber(2, 30),
          
          // KYC & Compliance Information
          kycDate,
          kycStatus,
          identityProofType,
          identityProofNumber: identityProofType === "Aadhaar Card" 
            ? generateAadhaarNumber() 
            : identityProofType === "PAN Card"
              ? generatePANNumber()
              : `ID${getRandomNumber(10000, 99999)}`,
          addressProofType,
          panNumber: generatePANNumber(),
          taxResidencyStatus: getRandomItem(taxResidencyStatuses),
          fatcaStatus: getRandomItem(fatcaStatuses),
          riskAssessmentScore: getRandomNumber(1, 10),
          
          // Family Information
          spouseName: hasSpouse ? `Spouse of ${client.fullName.split(' ')[0]}` : null,
          dependentsCount,
          childrenDetails: generateChildrenDetails(dependentsCount),
          nomineeDetails: generateNomineeDetails(
            hasSpouse ? `Spouse of ${client.fullName.split(' ')[0]}` : null, 
            dependentsCount > 0
          ),
          familyFinancialGoals: getRandomItems(investmentObjectives, 2).join(", "),
          
          // Investment Profile
          investmentHorizon: getRandomItem(investmentHorizons),
          investmentObjectives: investmentObjectivesList.join(", "),
          preferredProducts: preferredProductsList.join(", "),
          sourceOfWealth: getRandomItem(wealthSources),
          
          // Communication & Relationship
          preferredContactMethod: getRandomItem(contactMethods),
          preferredContactTime: getRandomItem(contactTimes),
          communicationFrequency: getRandomItem(communicationFrequencies),
          clientSince,
          clientAcquisitionSource: getRandomItem(acquisitionSources),
          
          // Transaction Information
          totalTransactionCount: getRandomNumber(1, 50),
          averageTransactionValue: getRandomNumber(10000, 1000000),
          recurringInvestments: generateRecurringInvestments(),
          
          // Additional Wealth Management Fields
          taxPlanningPreferences: getRandomItem(taxPlanningPreferences),
          insuranceCoverage: generateInsuranceCoverage(),
          retirementGoals: getRandomItem(retirementGoals),
          majorLifeEvents: generateMajorLifeEvents(),
          financialInterests: financialInterestsList.join(", "),
          netWorth: getRandomItem(netWorthRanges),
          liquidityRequirements: getRandomItem(liquidityRequirements),
          foreignInvestments: getRandomBoolean(0.3) ? "Yes" : "No"
        })
        .where(eq(clients.id, client.id));
      
      console.log(`Updated client ${client.id}: ${client.fullName} with detailed information`);
    }
    
    console.log("All clients updated successfully with detailed information!");
  } catch (error) {
    console.error("Error populating client details:", error);
    throw error;
  }
}

// Execute the function
populateClientDetails()
  .then(() => {
    console.log("Client details population completed successfully");
    process.exit(0);
  })
  .catch(error => {
    console.error("Client details population failed:", error);
    process.exit(1);
  });