# GitHub Repository Setup Guide

## Step-by-Step: Setting Up Your Team Repository

### Step 1: Create GitHub Repository (Team Lead or Person 1)

1. Go to GitHub.com and sign in
2. Click "New repository"
3. Repository name: `WealthForce-RM-Dashboard`
4. Description: "Financial Planning & Need Analysis Platform for Wealth Advisors"
5. Make it **Public** (or Private if you have GitHub Team)
6. **Don't** initialize with README
7. Click "Create repository"

### Step 2: Connect Your Local Project to GitHub

```bash
# Navigate to your local project
cd E:\WealthRMappPrimesoft\WealthRMappPrimesoft

# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Existing WealthForce CRM with baseline features"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/WealthForce-RM-Dashboard.git

# Push to GitHub
git checkout -b main
git push -u origin main

# Create and switch to develop branch
git checkout -b develop
git push -u origin develop
```

### Step 3: Protect Main Branch (IMPORTANT)

1. Go to GitHub → Your Repository → Settings
2. Click "Branches"
3. Add rule for `main`:
   - ✅ Require pull request before merging
   - ✅ Require approvals: 1
   - ✅ Dismiss stale pull request approvals
   - ✅ Do not allow bypassing the above settings

### Step 4: Create Branch Protection for Develop

1. Add rule for `develop`:
   - ✅ Require pull request before merging
   - ⚠️ Allow force pushes (for rapid iteration)

### Step 5: Team Members Join

Each team member should:

```bash
# Fork the repository (on GitHub, click "Fork")
# OR clone directly if you have access
git clone https://github.com/YOUR_USERNAME/WealthForce-RM-Dashboard.git
cd WealthForce-RM-Dashboard

# Create develop branch
git checkout -b develop

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with database credentials

# Run database migrations
npm run db:push

# Start development
npm run dev
```

---

## Daily Workflow for All Team Members

### Every Morning
```bash
# Get latest code
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/your-assigned-feature

# Start working!
```

### During Development
```bash
# Commit frequently
git add .
git commit -m "Add risk profiling API endpoint"

# Push your branch
git push origin feature/your-assigned-feature
```

### End of Day
```bash
# Create Pull Request on GitHub
# OR merge if stable
git checkout develop
git merge feature/your-assigned-feature
git push origin develop
```

---

## GitHub Repository Structure

### Recommended Default Files (Already Created)

```
WealthForce-RM-Dashboard/
├── README.md              ✅ Exists - Update with team info
├── CONTRIBUTING.md        ✅ Created - Contribution guidelines
├── LICENSE                (Optional - add MIT license)
├── .gitignore            ✅ Exists - Should be there
├── package.json          ✅ Exists
├── .env.example          (Create this if not exists)
└── .github/
    └── ISSUE_TEMPLATE/   (Optional - for issue tracking)
```

### Create .env.example (If Not Exists)

```bash
# Copy your existing .env and remove sensitive data
cp .env .env.example

# Edit .env.example and remove actual passwords
# Keep structure:
DATABASE_URL=your-database-url-here
NODE_ENV=development
PORT=5000
```

---

## Feature Development Workflow

### 1. Start New Feature
```bash
# Update from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/risk-profiling-questionnaire

# Work on your feature
# ... code, code, code ...

# Commit changes
git add .
git commit -m "Add risk profiling questionnaire component"
git push origin feature/risk-profiling-questionnaire
```

### 2. Create Pull Request
- Go to GitHub → Your Repository
- Click "Pull Requests" → "New Pull Request"
- Select: `develop` ← `feature/risk-profiling-questionnaire`
- Title: `Add Risk Profiling Questionnaire`
- Description: Explain what you built
- Request review from team members
- Click "Create Pull Request"

### 3. Merge After Review
- One team member reviews
- Give approval
- Merge PR
- Delete feature branch

---

## Preventing Conflicts

### File Ownership Strategy

**Person 1 (Backend):**
- Owns: `shared/schema.ts` (coordinate changes!)
- Owns: `server/routes/risk-profiling.ts` (NEW)
- Owns: `server/services/calculator/` (NEW)

**Person 2 (Planning UI):**
- Owns: `client/src/components/financial-planning/RiskQuestionnaire/` (NEW)
- Owns: `client/src/pages/plan-creation.tsx` (NEW)
- No conflicts!

**Person 3 (Products UI):**
- Owns: `client/src/components/financial-planning/ProductSelection/` (NEW)
- Owns: `client/src/pages/product-selection.tsx` (NEW)
- No conflicts!

**Person 4 (PDF & Workflows):**
- Owns: `server/services/proposal-generation/` (NEW)
- Owns: `client/src/pages/approvals.tsx` (NEW)
- No conflicts!

**Everyone Touches:**
- `server/routes/index.ts` - Add routes here (coordinate!)
- `client/src/App.tsx` - Add routes here (coordinate!)
- `shared/schema.ts` - Person 1 coordinates, others ask permission

---

## Communication Plan

### Create GitHub Discussions
1. Go to Repository → "Discussions" tab
2. Create categories:
   - ❓ Questions
   - 💡 Ideas
   - 🐛 Bug Reports
   - ✅ Completed Features

### Use GitHub Issues
- Create issue for each feature
- Assign to team member
- Track progress
- Close when complete

### Use Pull Request Comments
- Review code there
- Suggest changes
- Ask questions
- Give feedback

---

## Success Checklist

### Repository Setup ✅
- [ ] Repository created on GitHub
- [ ] Branches protected (main/develop)
- [ ] Everyone has access
- [ ] .env.example created
- [ ] CONTRIBUTING.md added
- [ ] README.md updated with team info

### First Week ✅
- [ ] Everyone cloned repository
- [ ] Everyone created first feature branch
- [ ] Database schema designed
- [ ] First API created
- [ ] First UI component created
- [ ] Communication channels established

### First PR ✅
- [ ] Someone creates first PR
- [ ] Team reviews it
- [ ] Merged to develop
- [ ] Everyone updates their code
- [ ] No conflicts!
- [ ] Feature works!

---

## Quick Commands Reference

### Daily Commands
```bash
# Start of day
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# During work
git add .
git commit -m "message"
git push origin feature/my-feature

# End of day
git push origin feature/my-feature  # Create PR
```

### When Conflicts Happen
```bash
git checkout develop
git pull origin develop
git checkout feature/my-feature
git merge develop
# Resolve conflicts
git push origin feature/my-feature
```

### Update Database
```bash
# After Person 1 changes schema
git checkout develop
git pull origin develop
npm run db:push  # Update database
```

---

## Team Coordination Rules

### Golden Rules
1. ✅ **Never** push to main directly
2. ✅ **Always** pull before push
3. ✅ **Frequently** commit and push
4. ✅ **Daily** communicate with team
5. ✅ **Ask** if you need to modify shared files

### Emergency Protocol
If something breaks:
1. Don't panic!
2. Tell team immediately
3. Create GitHub issue
4. Roll back to develop: `git reset --hard origin/develop`
5. Team helps fix together

---

## Next Steps for Team

1. **Team Lead:** Create GitHub repository
2. **Everyone:** Clone repository
3. **Person 1:** Set up database schema first (Week 1)
4. **Others:** Start with frontend mockups
5. **Daily:** Check in, pull code, push progress
6. **Weekly:** Demo completed features

**Ready to start? Let's go! 🚀**

