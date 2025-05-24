import { db } from "../server/db";
import { clients } from "../shared/schema";
import { eq } from "drizzle-orm";

// List of Indian names for our database update
const indianNames = [
  "Aditya Sharma",
  "Priya Patel",
  "Rahul Singh",
  "Ananya Gupta",
  "Vikram Malhotra",
  "Neha Reddy",
  "Arjun Kumar",
  "Kavita Joshi",
  "Rohan Mehta",
  "Divya Agarwal",
  "Sanjay Verma",
  "Meera Chopra",
  "Rajesh Yadav",
  "Nisha Bajaj",
  "Kunal Khanna",
  "Pooja Desai",
  "Amit Chauhan",
  "Sonia Kapoor",
  "Deepak Iyer",
  "Aarti Saxena",
  "Vijay Thakur",
  "Ritu Sharma",
  "Nikhil Pandey",
  "Shikha Bhatia",
  "Suresh Nair",
  "Anjali Mishra",
  "Karan Singhania",
  "Swati Tiwari",
  "Gaurav Menon",
  "Shruti Chawla"
];

// Generate Indian-style email addresses
function generateEmail(name: string): string {
  const [firstName, lastName] = name.split(' ');
  const domains = ["gmail.com", "yahoo.co.in", "rediffmail.com", "hotmail.com", "outlook.com"];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomDomain}`;
}

// Generate Indian phone numbers
function generatePhoneNumber(): string {
  // Indian mobile numbers typically start with 6, 7, 8, or 9
  const prefixes = ["6", "7", "8", "9"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  // Generate the rest of the 9 digits
  let number = prefix;
  for (let i = 0; i < 9; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }
  
  // Format as +91 XXXXX XXXXX
  return `+91 ${number.substring(0, 5)} ${number.substring(5)}`;
}

async function updateClientNames() {
  console.log("Updating client names to Indian names...");
  
  try {
    // Get all clients
    const allClients = await db.select().from(clients);
    
    // Update each client with an Indian name, email, and phone number
    for (let i = 0; i < allClients.length; i++) {
      const client = allClients[i];
      
      // Pick a name (use modulo to repeat names if we have more clients than names)
      const newName = indianNames[i % indianNames.length];
      const newEmail = generateEmail(newName);
      const newPhone = generatePhoneNumber();
      
      // Generate initials from the new name
      const initials = newName.split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
      
      // Update the client in the database
      await db.update(clients)
        .set({ 
          fullName: newName,
          email: newEmail,
          phone: newPhone,
          initials: initials
        })
        .where(eq(clients.id, client.id));
      
      console.log(`Updated client ${client.id}: ${newName}`);
    }
    
    console.log("All clients updated successfully!");
  } catch (error) {
    console.error("Error updating client names:", error);
  }
}

// Execute the function
updateClientNames()
  .then(() => {
    console.log("Script completed");
    process.exit(0);
  })
  .catch(error => {
    console.error("Script failed:", error);
    process.exit(1);
  });