import { db } from "../server/db";
import { clients } from "../shared/schema";
import { eq } from "drizzle-orm";

// Enhanced Indian sample data
const sampleData = {
  // Common Indian sectors of employment
  sectors: [
    "Information Technology", "Banking & Finance", "Healthcare", "Education", 
    "Manufacturing", "Retail", "Government", "Pharmaceuticals", "Automotive",
    "Telecommunications", "Real Estate", "Media & Entertainment", "Agriculture", 
    "FMCG", "Hospitality", "Consulting", "Energy & Power", "Insurance", "E-commerce"
  ],
  
  // Common Indian professions
  professions: {
    "Information Technology": ["Software Engineer", "Data Scientist", "IT Manager", "System Administrator", "DevOps Engineer"],
    "Banking & Finance": ["Bank Manager", "Financial Analyst", "Investment Banker", "Wealth Manager", "Portfolio Manager"],
    "Healthcare": ["Doctor", "Surgeon", "Physician", "Dentist", "Pharmacist"],
    "Education": ["Professor", "Teacher", "Principal", "Lecturer", "Education Consultant"],
    "Manufacturing": ["Production Manager", "Quality Control Manager", "Plant Manager", "Manufacturing Engineer"],
    "Retail": ["Store Manager", "Retail Manager", "Merchandiser", "Buyer", "Category Manager"],
    "Government": ["Civil Servant", "Government Officer", "Public Administrator", "IAS Officer", "IPS Officer"],
    "Pharmaceuticals": ["Pharmacist", "Medical Representative", "Clinical Researcher", "R&D Scientist"],
    "Automotive": ["Automobile Engineer", "Production Manager", "Quality Engineer", "Service Manager"],
    "Telecommunications": ["Telecom Engineer", "Network Specialist", "Operations Manager", "Product Manager"],
    "Real Estate": ["Real Estate Developer", "Property Manager", "Real Estate Agent", "Construction Manager"],
    "Media & Entertainment": ["Journalist", "Content Creator", "Media Planner", "Producer", "Director"],
    "Agriculture": ["Farmer", "Agricultural Scientist", "Horticulturist", "Agronomist"],
    "FMCG": ["Brand Manager", "Sales Manager", "Marketing Manager", "Product Developer"],
    "Hospitality": ["Hotel Manager", "Chef", "Restaurant Owner", "Hospitality Consultant"],
    "Consulting": ["Management Consultant", "Business Analyst", "Strategy Consultant", "IT Consultant"],
    "Energy & Power": ["Power Engineer", "Energy Analyst", "Project Manager", "Operations Head"],
    "Insurance": ["Insurance Agent", "Underwriter", "Risk Analyst", "Insurance Broker"],
    "E-commerce": ["E-commerce Manager", "Digital Marketer", "Product Manager", "Category Manager"]
  },
  
  // Common Indian company names by sector
  companies: {
    "Information Technology": ["Tata Consultancy Services", "Infosys", "Wipro", "HCL Technologies", "Tech Mahindra", "Cognizant India", "Mindtree"],
    "Banking & Finance": ["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Yes Bank", "Punjab National Bank"],
    "Healthcare": ["Apollo Hospitals", "Fortis Healthcare", "Manipal Hospitals", "Max Healthcare", "Narayana Health", "Medanta"],
    "Education": ["Delhi University", "IIT Mumbai", "IIM Ahmedabad", "BITS Pilani", "Amity University", "Symbiosis", "XLRI"],
    "Manufacturing": ["Tata Motors", "Maruti Suzuki", "Mahindra & Mahindra", "Larsen & Toubro", "Godrej & Boyce", "Bajaj Auto"],
    "Retail": ["Reliance Retail", "DMart", "Future Group", "Aditya Birla Retail", "Shoppers Stop", "Lifestyle"],
    "Government": ["Ministry of Finance", "Indian Railways", "ONGC", "NITI Aayog", "ISRO", "Bharat Electronics"],
    "Pharmaceuticals": ["Sun Pharmaceutical", "Dr. Reddy's Laboratories", "Cipla", "Lupin", "Biocon", "Zydus Cadila"],
    "Automotive": ["Tata Motors", "Mahindra & Mahindra", "Maruti Suzuki", "Hero MotoCorp", "Bajaj Auto", "TVS Motor"],
    "Telecommunications": ["Reliance Jio", "Bharti Airtel", "Vodafone Idea", "BSNL", "MTNL", "Tata Communications"],
    "Real Estate": ["DLF", "Godrej Properties", "Prestige Estates", "Sobha Developers", "Brigade Group", "Oberoi Realty"],
    "Media & Entertainment": ["Zee Entertainment", "Star India", "Sony Pictures Networks", "Times Group", "Network18", "Viacom18"],
    "Agriculture": ["ITC Agri Business", "Godrej Agrovet", "Rallis India", "UPL Limited", "Coromandel International"],
    "FMCG": ["Hindustan Unilever", "ITC Limited", "Nestle India", "Dabur", "Marico", "Godrej Consumer Products"],
    "Hospitality": ["Taj Hotels", "Oberoi Hotels", "ITC Hotels", "Leela Palaces", "Marriott India", "Hyatt India"],
    "Consulting": ["McKinsey & Company", "Boston Consulting Group", "Deloitte India", "EY India", "KPMG India", "PwC India"],
    "Energy & Power": ["NTPC Limited", "Adani Power", "Reliance Power", "Tata Power", "BHEL", "Indian Oil Corporation"],
    "Insurance": ["LIC of India", "HDFC Life", "ICICI Prudential", "SBI Life Insurance", "Max Life Insurance", "Bajaj Allianz"],
    "E-commerce": ["Flipkart", "Amazon India", "Myntra", "Snapdeal", "BigBasket", "Nykaa", "Swiggy", "Zomato"]
  },
  
  // Indian cities by state
  cities: {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belgaum", "Gulbarga", "Davanagere"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Ghaziabad", "Meerut", "Noida"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar", "Jamnagar"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Nellore", "Kurnool"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Rohtak", "Hisar", "Karnal"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Jaisalmer"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar"],
    "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia"]
  },
  
  // Indian states
  states: [
    "Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "Uttar Pradesh", "Gujarat", 
    "West Bengal", "Telangana", "Andhra Pradesh", "Kerala", "Punjab", "Haryana", 
    "Rajasthan", "Madhya Pradesh", "Bihar", "Odisha", "Assam", "Jharkhand", "Chhattisgarh"
  ],
  
  // Popular bank relationships
  bankRelationships: [
    "Relationship Manager Referral", "Branch Walk-in", "Corporate Salary Account", 
    "Digital Campaign", "Existing Customer Upgrade", "Wealth Seminar", "Family Referral", 
    "Direct Marketing", "Partnership Program"
  ],
  
  // Investment horizons
  investmentHorizons: [
    "Short-term (0-3 years)", "Medium-term (3-7 years)", "Long-term (7+ years)"
  ],
  
  // Risk profiles
  riskProfiles: [
    "Conservative", "Moderate", "Aggressive"
  ],
  
  // Income ranges (₹ in lakhs or crores per annum)
  incomeRanges: [
    "₹5-10 Lakhs", "₹10-15 Lakhs", "₹15-25 Lakhs", "₹25-50 Lakhs", 
    "₹50 Lakhs-1 Crore", "₹1-2 Crores", "₹2-5 Crores", "₹5+ Crores"
  ],
  
  // Net worth ranges
  netWorthRanges: [
    "₹50 Lakhs - 1 Crore", "₹1 - 5 Crores", "₹5 - 10 Crores", 
    "₹10 - 50 Crores", "₹50 - 100 Crores", "₹100+ Crores"
  ],
  
  // Investment objectives
  investmentObjectives: [
    "Retirement Planning", "Children's Education", "Wealth Creation", 
    "Tax Saving", "Regular Income", "Capital Preservation", 
    "House Purchase", "Business Expansion", "Foreign Education", 
    "Marriage Expenses", "Vacation Home"
  ],
  
  // Preferred investment products
  preferredProducts: [
    "Equity Mutual Funds", "Debt Mutual Funds", "Fixed Deposits", 
    "Government Bonds", "Corporate Bonds", "Equity Shares", 
    "Real Estate", "Gold", "PPF", "NPS", "ULIP", 
    "Tax-Saving ELSS", "Balanced Funds"
  ],
  
  // Sources of wealth
  wealthSources: [
    "Salary", "Business Income", "Inheritance", "Investments", 
    "Property Sale", "Professional Practice", "Family Business", 
    "Agricultural Income"
  ],
  
  // KYC statuses
  kycStatuses: ["Verified", "Pending", "Expired"],
  
  // Identity proof types
  identityProofTypes: ["Aadhaar Card", "PAN Card", "Passport", "Driving License", "Voter ID"],
  
  // Address proof types
  addressProofTypes: ["Aadhaar Card", "Passport", "Utility Bill", "Rent Agreement", "Bank Statement"],
  
  // Tax residency statuses
  taxResidencyStatuses: ["Resident Indian", "Non-Resident Indian (NRI)", "Resident but Not Ordinarily Resident (RNOR)"],
  
  // FATCA statuses
  fatcaStatuses: ["Compliant", "Pending", "Not Applicable"],
  
  // Marital statuses
  maritalStatuses: ["Single", "Married", "Divorced", "Widowed"],
  
  // Contact methods
  contactMethods: ["Email", "Phone", "WhatsApp", "In-person", "Video Call"],
  
  // Contact times
  contactTimes: ["Morning (9-12)", "Afternoon (12-4)", "Evening (4-7)", "Weekend Only"],
  
  // Communication frequencies
  communicationFrequencies: ["Weekly", "Bi-weekly", "Monthly", "Quarterly", "Half-yearly"],
  
  // Tax planning preferences
  taxPlanningPreferences: [
    "ELSS Funds", "PPF & NPS", "Tax-Free Bonds", "Section 80C Maximization", 
    "Insurance Premium", "Home Loan Interest", "Balanced Approach"
  ],
  
  // Insurance coverage types
  insuranceTypes: [
    "Term Life Insurance", "Health Insurance", "Critical Illness Cover", 
    "Personal Accident Cover", "Home Insurance", "Motor Insurance"
  ],
  
  // Retirement goals
  retirementGoals: [
    "Early Retirement (before 50)", "Regular Retirement (58-60)", "Extended Career (65+)",
    "Passive Income Generation", "Travel Plans", "Second Career", "Family Business Management"
  ],
  
  // Financial interests
  financialInterests: [
    "Stock Market", "Real Estate", "International Investments", "Startup Funding",
    "Mutual Funds", "Gold & Precious Metals", "Fixed Income", "Alternative Investments"
  ],
  
  // Liquidity requirements
  liquidityRequirements: [
    "Low (0-20%)", "Medium (20-40%)", "High (40%+)", "Emergency Fund Only"
  ],
  
  // Foreign investment options
  foreignInvestments: ["Yes", "No", "Planning"],
  
  // Common client tiers
  clientTiers: ["silver", "gold", "platinum"]
};

// Helper functions for generating data
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
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

// Format functions
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
  const houseTypes = ['Flat', 'Apartment', 'House', 'Villa'];
  const houseNumber = getRandomNumber(1, 999);
  const houseType = getRandomItem(houseTypes);
  const streetNames = ['Main Road', 'Cross', 'Street', 'Avenue', 'Circle', 'Layout', 'Nagar', 'Colony', 'Extension'];
  const streetNumber = getRandomNumber(1, 20);
  const streetName = getRandomItem(streetNames);
  
  return `${houseType} ${houseNumber}, ${getRandomNumber(1, 5)}${getRandomItem(['st', 'nd', 'rd', 'th'])} ${streetName}, ${streetNumber}${getRandomItem(['st', 'nd', 'rd', 'th'])} Block`;
}

function generateChildrenDetails(count: number): string {
  if (count === 0) return "";
  
  const children = [];
  const indianNames = [
    "Aarav", "Aditi", "Arjun", "Ananya", "Advait", "Avni",
    "Dhruv", "Diya", "Ishaan", "Isha", "Kabir", "Kavya",
    "Vihaan", "Vanya", "Reyansh", "Riya", "Vivaan", "Saanvi"
  ];

  for (let i = 0; i < count; i++) {
    const gender = getRandomBoolean() ? 'Male' : 'Female';
    const name = gender === 'Male' 
      ? indianNames[Math.floor(Math.random() * 9) * 2] 
      : indianNames[Math.floor(Math.random() * 9) * 2 + 1];
    const age = getRandomNumber(1, 25);
    children.push({ name, gender, age });
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
      name: "Child",
      relation: "Son/Daughter",
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
  const coverageTypes = getRandomItems(sampleData.insuranceTypes, getRandomNumber(1, 4));
  const coverage = coverageTypes.map(type => {
    let coverAmount;
    if (type === 'Term Life Insurance') {
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
  const hasRecurring = getRandomBoolean(0.85); // 85% chance of having recurring investments
  
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

function generateSpouseName(clientName: string, isMarried: boolean): string | null {
  if (!isMarried) return null;
  
  const indianSpouseNames = [
    "Aanya", "Disha", "Neha", "Priya", "Riya", "Sarika", "Tanvi", "Vidya",
    "Akshay", "Karan", "Nikhil", "Rahul", "Rohit", "Sanjay", "Vikram", "Yash"
  ];
  
  // Simple logic to avoid same first name as client
  let spouseName;
  do {
    spouseName = getRandomItem(indianSpouseNames);
  } while (clientName.includes(spouseName));
  
  return `${spouseName} ${clientName.split(' ')[1]}`; // Same last name
}

async function populateAllClients() {
  console.log("Populating all clients with comprehensive data...");
  
  try {
    // Get all clients
    const allClients = await db.select().from(clients);
    
    // Process each client
    for (const client of allClients) {
      // Get the client's name
      const clientName = client.fullName;
      console.log(`Processing client: ${clientName} (ID: ${client.id})`);
      
      // Determine client tier and set appropriate AUM range
      const clientTier = client.tier || getRandomItem(sampleData.clientTiers);
      let aumRange: [number, number];
      
      switch (clientTier) {
        case 'platinum':
          aumRange = [5000000, 30000000]; // 50L to 3Cr
          break;
        case 'gold':
          aumRange = [2000000, 5000000]; // 20L to 50L
          break;
        default: // silver
          aumRange = [500000, 2000000]; // 5L to 20L
          break;
      }
      
      // Generate random state and city
      const homeState = getRandomItem(sampleData.states);
      const homeCity = homeState in sampleData.cities 
        ? getRandomItem(sampleData.cities[homeState]) 
        : getRandomItem(sampleData.cities["Maharashtra"]);
      
      const workState = getRandomBoolean(0.7) ? homeState : getRandomItem(sampleData.states);
      const workCity = workState === homeState && getRandomBoolean(0.7)
        ? homeCity
        : (workState in sampleData.cities
            ? getRandomItem(sampleData.cities[workState])
            : getRandomItem(sampleData.cities["Maharashtra"]));
      
      // Marital status
      const maritalStatus = getRandomItem(sampleData.maritalStatuses);
      const isMarried = maritalStatus === "Married";
      
      // Children
      const dependentsCount = isMarried 
        ? getRandomNumber(0, 3) 
        : getRandomNumber(0, 1);
      
      // Generate sector, profession and company
      const sector = getRandomItem(sampleData.sectors);
      const profession = sector in sampleData.professions 
        ? getRandomItem(sampleData.professions[sector]) 
        : getRandomItem(sampleData.professions["Banking & Finance"]);
      
      const companyName = sector in sampleData.companies 
        ? getRandomItem(sampleData.companies[sector])
        : getRandomItem(sampleData.companies["Banking & Finance"]);
      
      // Generate financial details
      const aumValue = getRandomNumber(aumRange[0], aumRange[1]);
      const formattedAum = aumValue >= 10000000
        ? `₹${(aumValue / 10000000).toFixed(2)} Cr`
        : `₹${(aumValue / 100000).toFixed(2)} L`;
      
      const investmentObjectivesList = getRandomItems(
        sampleData.investmentObjectives, 
        getRandomNumber(1, 3)
      );
      
      const preferredProductsList = getRandomItems(
        sampleData.preferredProducts, 
        getRandomNumber(2, 4)
      );
      
      const financialInterestsList = getRandomItems(
        sampleData.financialInterests, 
        getRandomNumber(1, 4)
      );
      
      // KYC details
      const kycStatus = getRandomItem(sampleData.kycStatuses);
      const identityProofType = getRandomItem(sampleData.identityProofTypes);
      const addressProofType = getRandomItem(sampleData.addressProofTypes);
      
      // Generate appropriate dates
      const now = new Date();
      
      // Date of birth (25-65 years old)
      const dateOfBirth = getRandomDate(
        new Date(now.getFullYear() - 65, 0, 1),
        new Date(now.getFullYear() - 25, 0, 1)
      );
      
      // KYC date (within last 3 years)
      const kycDate = getRandomDate(
        new Date(now.getFullYear() - 3, 0, 1),
        new Date()
      );
      
      // Anniversary date (if married)
      const anniversaryDate = isMarried 
        ? getRandomDate(
            new Date(now.getFullYear() - 30, 0, 1),
            new Date(now.getFullYear() - 1, 0, 1)
          )
        : null;
      
      // Client since date (1-10 years ago)
      const clientSince = getRandomDate(
        new Date(now.getFullYear() - 10, 0, 1),
        new Date(now.getFullYear() - 1, 0, 1)
      );
      
      // Last contact date (within last 60 days)
      const lastContactDate = getRandomDate(
        new Date(now.setDate(now.getDate() - 60)),
        new Date()
      );
      
      // Last transaction date (within last 30 days)
      const lastTransactionDate = getRandomDate(
        new Date(now.setDate(now.getDate() - 30)),
        new Date()
      );
      
      // Spouse name (if married)
      const spouseName = generateSpouseName(clientName, isMarried);
      
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
          annualIncome: getRandomItem(sampleData.incomeRanges),
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
          taxResidencyStatus: getRandomItem(sampleData.taxResidencyStatuses),
          fatcaStatus: getRandomItem(sampleData.fatcaStatuses),
          riskAssessmentScore: getRandomNumber(1, 10),
          
          // Family Information
          spouseName,
          dependentsCount,
          childrenDetails: generateChildrenDetails(dependentsCount),
          nomineeDetails: generateNomineeDetails(spouseName, dependentsCount > 0),
          familyFinancialGoals: getRandomItems(sampleData.investmentObjectives, 2).join(", "),
          
          // Investment Profile
          aum: formattedAum,
          aumValue,
          riskProfile: getRandomItem(sampleData.riskProfiles),
          investmentHorizon: getRandomItem(sampleData.investmentHorizons),
          yearlyPerformance: getRandomNumber(-15, 25),
          investmentObjectives: investmentObjectivesList.join(", "),
          preferredProducts: preferredProductsList.join(", "),
          sourceOfWealth: getRandomItem(sampleData.wealthSources),
          
          // Communication & Relationship
          lastContactDate,
          preferredContactMethod: getRandomItem(sampleData.contactMethods),
          preferredContactTime: getRandomItem(sampleData.contactTimes),
          communicationFrequency: getRandomItem(sampleData.communicationFrequencies),
          clientSince,
          clientAcquisitionSource: getRandomItem(sampleData.bankRelationships),
          
          // Transaction Information
          lastTransactionDate,
          totalTransactionCount: getRandomNumber(1, 50),
          averageTransactionValue: getRandomNumber(10000, 1000000),
          recurringInvestments: generateRecurringInvestments(),
          
          // Additional Wealth Management Fields
          taxPlanningPreferences: getRandomItem(sampleData.taxPlanningPreferences),
          insuranceCoverage: generateInsuranceCoverage(),
          retirementGoals: getRandomItem(sampleData.retirementGoals),
          majorLifeEvents: generateMajorLifeEvents(),
          financialInterests: financialInterestsList.join(", "),
          netWorth: getRandomItem(sampleData.netWorthRanges),
          liquidityRequirements: getRandomItem(sampleData.liquidityRequirements),
          foreignInvestments: getRandomItem(sampleData.foreignInvestments)
        })
        .where(eq(clients.id, client.id));
      
      console.log(`✓ Updated client ${client.id}: ${clientName} with comprehensive data`);
    }
    
    console.log("All clients updated successfully with comprehensive information!");
  } catch (error) {
    console.error("Error populating client details:", error);
    throw error;
  }
}

// Execute the function
populateAllClients()
  .then(() => {
    console.log("Client population completed successfully");
    process.exit(0);
  })
  .catch(error => {
    console.error("Client population failed:", error);
    process.exit(1);
  });