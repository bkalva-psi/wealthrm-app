import { config } from "dotenv";
import { resolve } from "path";

// Load .env file from root directory
config({ path: resolve(process.cwd(), ".env") });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error("⚠️  DATABASE_URL not found in environment variables");
  console.error("Current working directory:", process.cwd());
  console.error("Looking for .env at:", resolve(process.cwd(), ".env"));
}
