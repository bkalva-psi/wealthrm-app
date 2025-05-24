import { db } from "../server/db";
import { clients } from "../shared/schema";
import { faker } from "@faker-js/faker";

async function addMoreClients() {
  console.log("Adding 20 more clients to the database...");

  const tiers = ["platinum", "gold", "silver"];
  const riskProfiles = ["conservative", "moderate", "aggressive"];

  // Generate clients with different alert counts
  const newClients = Array.from({ length: 20 }, (_, i) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const initials = `${firstName[0]}${lastName[0]}`;
    
    // Create more variation in alert counts (0-5 alerts)
    // Ensure some clients have alerts and some don't
    const alertCount = i % 5 === 0 ? 0 : Math.floor(Math.random() * 5) + 1;
    
    // AUM values with more variation
    const aumValue = Math.floor(Math.random() * 9000000) + 1000000;
    
    // Format AUM with Indian currency notation
    const aumFormatted = `₹${(aumValue / 100000).toFixed(2)} L`;
    
    // Create performance metrics between -10% and +15%
    const yearlyPerformance = (Math.random() * 25) - 10;
    
    // Generate recent transaction dates (within past 30 days)
    const lastTransactionDate = new Date();
    lastTransactionDate.setDate(lastTransactionDate.getDate() - Math.floor(Math.random() * 30));
    
    // Generate last contact dates (within past 60 days)
    const lastContactDate = new Date();
    lastContactDate.setDate(lastContactDate.getDate() - Math.floor(Math.random() * 60));
    
    return {
      fullName, // Use camelCase for property names
      initials,
      tier: tiers[Math.floor(Math.random() * tiers.length)],
      aum: aumFormatted,
      aumValue, // Use camelCase for property names
      email: faker.internet.email({ firstName, lastName }),
      phone: `+91 ${faker.string.numeric(5)} ${faker.string.numeric(5)}`,
      lastContactDate, // Use camelCase for property names
      lastTransactionDate, // Use camelCase for property names
      riskProfile: riskProfiles[Math.floor(Math.random() * riskProfiles.length)], // Use camelCase for property names
      yearlyPerformance, // Use camelCase for property names
      alertCount, // Use camelCase for property names
      assignedTo: 1 // Assign to test user, use camelCase for property names
    };
  });

  try {
    // Insert clients in batch
    const insertedClients = await db.insert(clients).values(newClients).returning();
    console.log(`Successfully added ${insertedClients.length} new clients`);
    
    // Display alert counts for verification
    insertedClients.forEach(client => {
      console.log(`${client.fullName}: ${client.alertCount} alerts`);
    });
    
    console.log("Clients added successfully!");
  } catch (error) {
    console.error("Error adding clients:", error);
  }
}

// Execute the function
addMoreClients()
  .then(() => {
    console.log("Script completed");
    process.exit(0);
  })
  .catch(error => {
    console.error("Script failed:", error);
    process.exit(1);
  });