import { db } from "../server/db";
import { products } from "../shared/schema";
import { eq } from "drizzle-orm";

const productData = [
  // Mutual Funds
  {
    name: "Ujjivan Large Cap Equity Fund",
    productCode: "ULEF001",
    category: "mutual_funds",
    subCategory: "large_cap",
    description: "A diversified equity fund that invests primarily in large-cap companies with strong growth potential and stable business models.",
    keyFeatures: [
      "Invests in top 100 companies by market cap",
      "Professional fund management",
      "Diversified across sectors",
      "Long-term wealth creation focus",
      "Tax benefits under Section 80C (ELSS variant)"
    ],
    targetAudience: "Retail and HNI investors seeking long-term capital appreciation",
    minInvestment: 500000, // 5 lakhs
    maxInvestment: null,
    investmentMultiples: 1000,
    riskLevel: "Moderate",
    expectedReturns: "12-15% p.a.",
    lockInPeriod: null,
    tenure: "Open ended",
    exitLoad: "1% if redeemed within 1 year",
    managementFee: 2.25,
    regulatoryApprovals: ["SEBI", "AMFI"],
    taxImplications: "LTCG above ₹1 lakh taxed at 10%, STCG taxed at 15%",
    factsheetUrl: "/documents/ujjivan-large-cap-equity-fund-factsheet.pdf",
    kimsUrl: "/documents/ujjivan-large-cap-equity-fund-kims.pdf",
    applicationFormUrl: "/documents/mutual-fund-application-form.pdf",
    isActive: true,
    isOpenForSubscription: true,
    launchDate: new Date('2022-01-15'),
    totalSubscriptions: 150000000, // 15 crores
    totalInvestors: 2500
  },
  {
    name: "Ujjivan Debt Fund - Regular Growth",
    productCode: "UDF001",
    category: "mutual_funds",
    subCategory: "debt",
    description: "A debt fund that invests in high-quality corporate bonds, government securities, and money market instruments.",
    keyFeatures: [
      "Invests in AAA/AA+ rated instruments",
      "Regular income generation",
      "Lower volatility compared to equity",
      "Professional credit research",
      "Suitable for conservative investors"
    ],
    targetAudience: "Conservative investors seeking regular income with capital protection",
    minInvestment: 100000, // 1 lakh
    maxInvestment: null,
    investmentMultiples: 1000,
    riskLevel: "Low",
    expectedReturns: "7-9% p.a.",
    lockInPeriod: null,
    tenure: "Open ended",
    exitLoad: "0.5% if redeemed within 6 months",
    managementFee: 1.5,
    regulatoryApprovals: ["SEBI", "AMFI"],
    taxImplications: "Gains taxed as per income tax slab if held for less than 3 years",
    factsheetUrl: "/documents/ujjivan-debt-fund-factsheet.pdf",
    kimsUrl: "/documents/ujjivan-debt-fund-kims.pdf",
    applicationFormUrl: "/documents/mutual-fund-application-form.pdf",
    isActive: true,
    isOpenForSubscription: true,
    launchDate: new Date('2021-08-10'),
    totalSubscriptions: 80000000, // 8 crores
    totalInvestors: 1200
  },
  {
    name: "Ujjivan ELSS Tax Saver Fund",
    productCode: "UETS001",
    category: "mutual_funds",
    subCategory: "elss",
    description: "An Equity Linked Savings Scheme (ELSS) offering tax benefits under Section 80C with potential for long-term capital appreciation.",
    keyFeatures: [
      "Tax deduction up to ₹1.5 lakh under Section 80C",
      "3-year lock-in period",
      "Diversified equity portfolio",
      "Professional fund management",
      "Lowest lock-in among tax-saving instruments"
    ],
    targetAudience: "Taxpayers seeking tax benefits with equity exposure",
    minInvestment: 50000, // 50K
    maxInvestment: 150000, // 1.5 lakhs (80C limit)
    investmentMultiples: 500,
    riskLevel: "Moderate",
    expectedReturns: "10-14% p.a.",
    lockInPeriod: 36, // 3 years
    tenure: "Open ended with 3-year lock-in",
    exitLoad: "Not applicable due to lock-in",
    managementFee: 2.0,
    regulatoryApprovals: ["SEBI", "AMFI"],
    taxImplications: "Tax deduction under 80C, LTCG above ₹1 lakh taxed at 10%",
    factsheetUrl: "/documents/ujjivan-elss-tax-saver-factsheet.pdf",
    kimsUrl: "/documents/ujjivan-elss-tax-saver-kims.pdf",
    applicationFormUrl: "/documents/mutual-fund-application-form.pdf",
    isActive: true,
    isOpenForSubscription: true,
    launchDate: new Date('2022-03-01'),
    totalSubscriptions: 45000000, // 4.5 crores
    totalInvestors: 1800
  },

  // Bonds
  {
    name: "Ujjivan Infrastructure Bond Series 1",
    productCode: "UIB001",
    category: "bonds",
    subCategory: "infrastructure",
    description: "Tax-free infrastructure bonds issued for funding infrastructure projects with attractive yields and tax benefits.",
    keyFeatures: [
      "Tax-free interest income",
      "15-year maturity period",
      "Semi-annual interest payments",
      "Listed on stock exchanges",
      "Infrastructure development focus"
    ],
    targetAudience: "HNI investors in high tax brackets seeking tax-free income",
    minInvestment: 1000000, // 10 lakhs
    maxInvestment: 10000000, // 1 crore (per individual per FY)
    investmentMultiples: 10000,
    riskLevel: "Low",
    expectedReturns: "8.5% p.a. (tax-free)",
    lockInPeriod: null,
    tenure: "15 years",
    exitLoad: "Not applicable - tradeable on exchanges",
    managementFee: null,
    regulatoryApprovals: ["SEBI", "RBI"],
    taxImplications: "Interest income completely tax-free",
    factsheetUrl: "/documents/ujjivan-infrastructure-bond-factsheet.pdf",
    kimsUrl: "/documents/ujjivan-infrastructure-bond-kims.pdf",
    applicationFormUrl: "/documents/bond-application-form.pdf",
    isActive: true,
    isOpenForSubscription: true,
    launchDate: new Date('2023-01-15'),
    maturityDate: new Date('2038-01-15'),
    totalSubscriptions: 500000000, // 50 crores
    totalInvestors: 450
  },
  {
    name: "Ujjivan Corporate Bond - AAA Series",
    productCode: "UCB001",
    category: "bonds",
    subCategory: "corporate",
    description: "High-grade corporate bonds from AAA-rated companies offering stable returns with quarterly interest payments.",
    keyFeatures: [
      "AAA credit rating",
      "Quarterly interest payments",
      "5-year maturity",
      "Listed and tradeable",
      "Fixed coupon rate"
    ],
    targetAudience: "Conservative investors seeking higher yields than bank FDs",
    minInvestment: 100000, // 1 lakh
    maxInvestment: null,
    investmentMultiples: 10000,
    riskLevel: "Low",
    expectedReturns: "9.25% p.a.",
    lockInPeriod: null,
    tenure: "5 years",
    exitLoad: "Not applicable - tradeable on exchanges",
    managementFee: null,
    regulatoryApprovals: ["SEBI"],
    taxImplications: "Interest taxable as per income tax slab, LTCG at 20% with indexation",
    factsheetUrl: "/documents/ujjivan-corporate-bond-factsheet.pdf",
    kimsUrl: "/documents/ujjivan-corporate-bond-kims.pdf",
    applicationFormUrl: "/documents/bond-application-form.pdf",
    isActive: true,
    isOpenForSubscription: true,
    launchDate: new Date('2023-06-01'),
    maturityDate: new Date('2028-06-01'),
    totalSubscriptions: 250000000, // 25 crores
    totalInvestors: 850
  },

  // Equity/Direct Stocks
  {
    name: "Ujjivan Portfolio Management Service - Growth",
    productCode: "UPMS001",
    category: "equity",
    subCategory: "pms",
    description: "Discretionary Portfolio Management Service focusing on high-growth mid and large-cap stocks with active portfolio management.",
    keyFeatures: [
      "Minimum ₹50 lakh investment",
      "Dedicated relationship manager",
      "Customized portfolio strategy",
      "Quarterly portfolio reviews",
      "Direct equity ownership"
    ],
    targetAudience: "HNI clients seeking personalized portfolio management",
    minInvestment: 5000000, // 50 lakhs
    maxInvestment: null,
    investmentMultiples: 100000,
    riskLevel: "High",
    expectedReturns: "15-20% p.a.",
    lockInPeriod: 12, // 1 year recommended
    tenure: "Open ended",
    exitLoad: "2% if withdrawn within 1 year",
    managementFee: 2.5,
    regulatoryApprovals: ["SEBI"],
    taxImplications: "STCG at 15%, LTCG above ₹1 lakh at 10%",
    factsheetUrl: "/documents/ujjivan-pms-growth-factsheet.pdf",
    kimsUrl: "/documents/ujjivan-pms-growth-kims.pdf",
    applicationFormUrl: "/documents/pms-application-form.pdf",
    isActive: true,
    isOpenForSubscription: true,
    launchDate: new Date('2022-09-01'),
    totalSubscriptions: 2000000000, // 200 crores
    totalInvestors: 320
  },
  {
    name: "Ujjivan Equity Advisory - Premium",
    productCode: "UEA001",
    category: "equity",
    subCategory: "advisory",
    description: "Non-discretionary equity advisory service providing research-based stock recommendations and portfolio guidance.",
    keyFeatures: [
      "Research-driven stock picks",
      "Weekly market updates",
      "Risk management guidance",
      "Educational webinars",
      "24/7 advisory support"
    ],
    targetAudience: "Self-directed investors seeking professional guidance",
    minInvestment: 1000000, // 10 lakhs
    maxInvestment: null,
    investmentMultiples: 50000,
    riskLevel: "High",
    expectedReturns: "12-18% p.a.",
    lockInPeriod: null,
    tenure: "Annual subscription",
    exitLoad: "Not applicable",
    managementFee: 1.5,
    regulatoryApprovals: ["SEBI"],
    taxImplications: "As per direct equity taxation rules",
    factsheetUrl: "/documents/ujjivan-equity-advisory-factsheet.pdf",
    kimsUrl: "/documents/ujjivan-equity-advisory-kims.pdf",
    applicationFormUrl: "/documents/advisory-application-form.pdf",
    isActive: true,
    isOpenForSubscription: true,
    launchDate: new Date('2023-02-15'),
    totalSubscriptions: 120000000, // 12 crores
    totalInvestors: 450
  },

  // Margin Lending
  {
    name: "Ujjivan Securities Margin Funding",
    productCode: "USMF001",
    category: "margin_lending",
    subCategory: "securities_backed",
    description: "Margin funding facility against approved securities for leveraged trading and investment opportunities.",
    keyFeatures: [
      "Up to 80% funding against approved securities",
      "Competitive interest rates",
      "Flexible repayment options",
      "Online margin calculator",
      "Instant margin availability"
    ],
    targetAudience: "Active traders and investors with substantial portfolios",
    minInvestment: 500000, // 5 lakhs (collateral value)
    maxInvestment: 50000000, // 5 crores
    investmentMultiples: 50000,
    riskLevel: "High",
    expectedReturns: "Variable based on market performance",
    lockInPeriod: null,
    tenure: "Ongoing facility",
    exitLoad: "Processing fee of 0.5%",
    managementFee: null, // Interest-based
    regulatoryApprovals: ["SEBI", "RBI"],
    taxImplications: "Interest paid is tax deductible against capital gains",
    factsheetUrl: "/documents/ujjivan-margin-funding-factsheet.pdf",
    kimsUrl: "/documents/ujjivan-margin-funding-kims.pdf",
    applicationFormUrl: "/documents/margin-funding-application-form.pdf",
    isActive: true,
    isOpenForSubscription: true,
    launchDate: new Date('2022-11-01'),
    totalSubscriptions: 800000000, // 80 crores
    totalInvestors: 950
  },

  // Deposits
  {
    name: "Ujjivan Wealth Fixed Deposit - Premium",
    productCode: "UWFD001",
    category: "deposits",
    subCategory: "fixed_deposit",
    description: "Premium fixed deposit offering higher interest rates for wealth management clients with flexible tenure options.",
    keyFeatures: [
      "Higher interest rates for larger deposits",
      "Flexible tenure from 1-5 years",
      "Quarterly/Monthly interest payout options",
      "Premature withdrawal facility",
      "Senior citizen additional benefits"
    ],
    targetAudience: "Conservative investors seeking guaranteed returns",
    minInvestment: 2500000, // 25 lakhs
    maxInvestment: null,
    investmentMultiples: 100000,
    riskLevel: "Very Low",
    expectedReturns: "7.5-8.5% p.a.",
    lockInPeriod: null,
    tenure: "1-5 years",
    exitLoad: "1% penalty for premature withdrawal",
    managementFee: null,
    regulatoryApprovals: ["RBI"],
    taxImplications: "Interest taxable as per income tax slab, TDS applicable",
    factsheetUrl: "/documents/ujjivan-wealth-fd-factsheet.pdf",
    kimsUrl: "/documents/ujjivan-wealth-fd-kims.pdf",
    applicationFormUrl: "/documents/fd-application-form.pdf",
    isActive: true,
    isOpenForSubscription: true,
    launchDate: new Date('2021-05-01'),
    totalSubscriptions: 1200000000, // 120 crores
    totalInvestors: 2800
  },
  {
    name: "Ujjivan Wealth Recurring Deposit Plus",
    productCode: "UWRD001",
    category: "deposits",
    subCategory: "recurring_deposit",
    description: "Enhanced recurring deposit scheme with step-up options and competitive interest rates for systematic savings.",
    keyFeatures: [
      "Step-up facility available",
      "Tenure from 1-10 years",
      "Auto-debit facility",
      "Loan against RD facility",
      "Higher rates for longer tenure"
    ],
    targetAudience: "Salaried individuals seeking disciplined savings",
    minInvestment: 25000, // 25K per month
    maxInvestment: 500000, // 5 lakhs per month
    investmentMultiples: 5000,
    riskLevel: "Very Low",
    expectedReturns: "7.25-8% p.a.",
    lockInPeriod: null,
    tenure: "1-10 years",
    exitLoad: "1% penalty for premature closure",
    managementFee: null,
    regulatoryApprovals: ["RBI"],
    taxImplications: "Interest taxable as per income tax slab, TDS applicable",
    factsheetUrl: "/documents/ujjivan-wealth-rd-factsheet.pdf",
    kimsUrl: "/documents/ujjivan-wealth-rd-kims.pdf",
    applicationFormUrl: "/documents/rd-application-form.pdf",
    isActive: true,
    isOpenForSubscription: true,
    launchDate: new Date('2022-07-01'),
    totalSubscriptions: 350000000, // 35 crores
    totalInvestors: 4200
  }
];

async function populateProducts() {
  try {
    console.log("Starting to populate products...");

    // Clear existing products
    await db.delete(products);
    console.log("Cleared existing products");

    // Insert new products
    for (const product of productData) {
      await db.insert(products).values({
        ...product,
        createdBy: 1 // Assuming admin user ID is 1
      });
      console.log(`Inserted product: ${product.name}`);
    }

    console.log(`Successfully populated ${productData.length} products!`);

    // Display summary
    const allProducts = await db.select().from(products);
    console.log("\nProducts Summary:");
    console.log("================");
    
    const categories = allProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(categories).forEach(([category, count]) => {
      console.log(`${category.replace('_', ' ').toUpperCase()}: ${count} products`);
    });

    console.log(`\nTotal Products: ${allProducts.length}`);
    console.log(`Total Investment Value: ₹${(allProducts.reduce((sum, p) => sum + (p.totalSubscriptions || 0), 0) / 10000000).toFixed(0)} Cr`);
    console.log(`Total Investors: ${allProducts.reduce((sum, p) => sum + (p.totalInvestors || 0), 0).toLocaleString()}`);

  } catch (error) {
    console.error("Error populating products:", error);
    throw error;
  }
}

// Run the script
populateProducts()
  .then(() => {
    console.log("Products population completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to populate products:", error);
    process.exit(1);
  });