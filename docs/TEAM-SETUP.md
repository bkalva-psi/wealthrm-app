# Team Setup Guide - Wealth Management System

## 🎯 Overview
This is a team project for building a Wealth Management System for ABC Bank.

## 📋 Team Members
- [Person 1 - Name] - Risk Profiling Feature
- [Person 2 - Name] - Financial Data Feature  
- [Person 3 - Name] - Goal Planning Feature
- [Person 4 - Name] - Product Selection & Proposals Feature

## 🚀 Initial Setup (One-Time)

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd WealthRMappPrimesoft
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Database Connection

#### Option A: Use Shared Database (Recommended)
1. Ask your team leader for the shared DATABASE_URL
2. Create a `.env` file in the root directory:
```bash
# .env file
DATABASE_URL=postgresql://username:password@hostname:5432/database?sslmode=require
NODE_ENV=development
```

#### Option B: Use Your Own Neon Database
1. Go to https://console.neon.tech
2. Sign up / Login
3. Create a new project
4. Click "Connect" button
5. Copy the connection string
6. Create `.env` file and paste it

### 4. Create Database Tables
```bash
npm run db:push
```

This creates all necessary tables in the database.

### 5. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:5000

---

## 👥 Daily Workflow

### Morning (Before Starting Work)
```bash
# Get latest code from GitHub
git pull origin main

# Start development
npm run dev
```

### While Working
- Make changes to your assigned feature
- Test locally in browser
- Commit your progress regularly

### Before Pushing Code
```bash
# 1. Check what you changed
git status

# 2. Add your changes
git add .

# 3. Commit with descriptive message
git commit -m "Added risk profiling questionnaire UI"

# 4. Push to GitHub
git push origin main
```

---

## 🎨 Feature Assignment

### Person 1: Risk Profiling
**Files to Create/Edit:**
- `shared/schema.ts` - Add `risk_profiles`, `risk_responses` tables
- `server/routes/risk-profiling.ts` - API endpoints
- `client/src/pages/risk-profiling.tsx` - Main page
- `client/src/components/risk-questionnaire/` - Components

### Person 2: Financial Data
**Files to Create/Edit:**
- `shared/schema.ts` - Add `financial_data`, `assets`, `liabilities` tables
- `server/routes/financial-data.ts` - API endpoints
- `client/src/pages/financial-data.tsx` - Main page
- `client/src/components/financial-forms/` - Components

### Person 3: Goal Planning
**Files to Create/Edit:**
- `shared/schema.ts` - Add `client_goals`, `goal_progress` tables
- `server/routes/goals.ts` - API endpoints
- `client/src/pages/goals.tsx` - Main page
- `client/src/components/goals/` - Components

### Person 4: Product Selection & Proposals
**Files to Create/Edit:**
- `shared/schema.ts` - Add `product_selections`, `proposals` tables
- `server/routes/products-proposals.ts` - API endpoints
- `client/src/pages/product-selection.tsx` - Main page
- `client/src/components/product-selection/` - Components

---

## ⚠️ Important Rules

### 1. Database Schema Changes
- Only ONE person should add tables to `shared/schema.ts` at a time
- Communicate with team before pushing schema changes
- Run `npm run db:push` after schema changes

### 2. Git Workflow
- ✅ Always pull before pushing
- ✅ Write clear commit messages
- ✅ Never commit `.env` files
- ✅ Don't push on Friday night (hard to fix issues)

### 3. Testing
- Test your changes locally before pushing
- Check if app still runs: `npm run dev`
- Verify your feature works in browser

---

## 🆘 Troubleshooting

### Problem: "DATABASE_URL not found"
**Solution:**
```bash
# Check if .env file exists
ls -la | grep .env

# If not, create one with your database URL
echo "DATABASE_URL=your-connection-string" > .env
echo "NODE_ENV=development" >> .env
```

### Problem: "Cannot push to GitHub"
**Solution:**
```bash
# Pull latest changes first
git pull origin main

# Resolve any conflicts
# Then push again
git push origin main
```

### Problem: "Database schema conflicts"
**Solution:**
```bash
# Check what your teammate added
git pull origin main

# Review shared/schema.ts changes
# Then add your tables
npm run db:push
```

---

## 📞 Need Help?

1. Check `CONTRIBUTING.md` for coding standards
2. Ask on team chat/email
3. Review `documents/BRDtext.txt` for requirements
4. Check `documents/TEAM-WORK-ALLOCATION.md` for work split

---

## 🎉 Success!

Once setup is complete, you should see:
- ✅ App running on http://localhost:5000
- ✅ Login page with PrimeSoft logo
- ✅ Can login and see dashboard
- ✅ Database tables created successfully

**Happy Coding! 🚀**

