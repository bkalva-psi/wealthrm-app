import { db } from "../server/db";
import * as schema from "../shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import ws from "ws";

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

const runPush = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("Pushing schema to database...");
  
  try {
    // Run drizzle-kit push command using exec
    const { exec } = require('child_process');
    
    exec('npx drizzle-kit push:pg', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log("Schema pushed successfully!");
    });
  } catch (error) {
    console.error("Schema push failed:", error);
  }
};

runPush();