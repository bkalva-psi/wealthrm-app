import { db } from '../server/db';
import { appointments } from '../shared/schema';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';

// Get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Get random date between start and end
function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Get random future date within next N days
function getRandomFutureDate(maxDays: number = 30): Date {
  const now = new Date();
  const future = new Date();
  future.setDate(now.getDate() + maxDays);
  return getRandomDate(now, future);
}

// Get random time with 30 minute intervals (9:00, 9:30, 10:00, etc.)
function getRandomBusinessTime(): Date {
  const date = new Date();
  date.setHours(9 + Math.floor(Math.random() * 8)); // 9 AM to 5 PM
  date.setMinutes(Math.random() < 0.5 ? 0 : 30);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

// Generate a random appointment time (future date with business hours)
function generateAppointmentTime(): { startTime: Date, endTime: Date } {
  const startTime = getRandomFutureDate(14); // Next 14 days
  
  // Set business hours (9 AM to 5 PM)
  startTime.setHours(9 + Math.floor(Math.random() * 8));
  startTime.setMinutes(Math.random() < 0.5 ? 0 : 30);
  startTime.setSeconds(0);
  startTime.setMilliseconds(0);
  
  // Generate end time (30 min to 2 hours after start time)
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 30 * (1 + Math.floor(Math.random() * 4)));
  
  return { startTime, endTime };
}

// Generate today's appointment for testing the agenda view
function generateTodayAppointment(clientId: number, rmId: number): any {
  const now = new Date();
  const startTime = new Date(now);
  
  // Set business hours for today
  startTime.setHours(9 + Math.floor(Math.random() * 8));
  startTime.setMinutes(Math.random() < 0.5 ? 0 : 30);
  startTime.setSeconds(0);
  startTime.setMilliseconds(0);
  
  // If current time is past the random time, adjust to ensure future appointments
  if (startTime < now) {
    // Move to later today
    startTime.setHours(now.getHours() + 1 + Math.floor(Math.random() * (17 - now.getHours())));
  }
  
  // Generate end time (30 min to 1.5 hours after start time)
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 30 * (1 + Math.floor(Math.random() * 3)));
  
  const appointmentTypes = ['meeting', 'call', 'review', 'onboarding', 'followup'];
  const priorities = ['high', 'medium', 'low'];
  const locations = ['Ujjivan Branch Office', 'Virtual Meeting', 'Client Office', 'Phone', 'Video Call'];
  
  return {
    title: faker.company.catchPhrase(),
    description: faker.lorem.sentence(),
    startTime,
    endTime,
    location: getRandomItem(locations),
    clientId,
    prospectId: null,
    assignedTo: rmId,
    priority: getRandomItem(priorities),
    type: getRandomItem(appointmentTypes),
    createdAt: new Date()
  };
}

async function populateAppointments() {
  console.log('Adding sample appointment data...');
  
  try {
    // Get existing client IDs
    const clientIds = await db.execute(
      sql`SELECT id FROM clients LIMIT 30`
    );
    
    // Create appointment data
    const appointmentData = [];
    
    // Generate 10 appointments for today (testing agenda view)
    for (let i = 0; i < 10; i++) {
      const clientId = clientIds.rows[Math.floor(Math.random() * clientIds.rows.length)]?.id || 1;
      appointmentData.push(generateTodayAppointment(clientId, 1)); // RM ID 1
    }
    
    // Generate 30 more appointments for future dates
    for (let i = 0; i < 30; i++) {
      const { startTime, endTime } = generateAppointmentTime();
      const clientId = clientIds.rows[Math.floor(Math.random() * clientIds.rows.length)]?.id || 1;
      
      const appointmentTypes = ['meeting', 'call', 'review', 'onboarding', 'followup'];
      const priorities = ['high', 'medium', 'low'];
      const locations = ['Ujjivan Branch Office', 'Virtual Meeting', 'Client Office', 'Phone', 'Video Call'];
      
      appointmentData.push({
        title: faker.company.catchPhrase(),
        description: faker.lorem.sentence(),
        startTime,
        endTime,
        location: getRandomItem(locations),
        clientId,
        prospectId: null,
        assignedTo: 1, // RM ID
        priority: getRandomItem(priorities),
        type: getRandomItem(appointmentTypes),
        createdAt: new Date()
      });
    }
    
    // Insert appointment data
    const result = await db.insert(appointments).values(appointmentData);
    console.log(`Added ${result.rowCount} appointments successfully.`);
    
  } catch (error) {
    console.error('Error populating appointment data:', error);
  }
}

// Run the population script
populateAppointments()
  .then(() => {
    console.log('Appointment data population complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to populate appointment data:', error);
    process.exit(1);
  });