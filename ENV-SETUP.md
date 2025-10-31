# Environment Setup for Team Members

## Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd WealthRMappPrimesoft
```

## Step 2: Install Dependencies
```bash
npm install
```

## Step 3: Set Up Environment Variables

Create a `.env` file in the root directory with your database URL.

### Option A: Use Shared Neon Database (Recommended)
Ask your team leader for the DATABASE_URL connection string.

Create `.env` file with:
```bash
DATABASE_URL=postgresql://username:password@hostname:5432/database?sslmode=require
NODE_ENV=development
```

### Option B: Use Your Own Neon Database
1. Go to https://console.neon.tech
2. Create a new project
3. Get connection string from "Connect" button
4. Add it to `.env` file

## Step 4: Push Database Schema
```bash
npm run db:push
```

This creates all tables in your database.

## Step 5: Run the Application
```bash
npm run dev
```

## Important Notes:

1. **NEVER commit .env files** - They contain sensitive credentials
2. **Always pull latest changes** before starting work:
   ```bash
   git pull origin main
   ```
3. **Never push directly to main branch** - Use feature branches
4. **Communicate with team** when adding database tables to avoid conflicts

## Team Git Workflow:

### Daily Start:
```bash
git pull origin main    # Get latest changes
npm run dev             # Start development
```

### End of Day:
```bash
git add .
git commit -m "Description of changes"
git push origin main    # Share your work
```

---

**Need Help?** Ask your team leader for the shared database connection string.

