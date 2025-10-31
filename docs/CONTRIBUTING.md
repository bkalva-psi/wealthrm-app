# Contributing to WealthForce RM Dashboard

## 🎯 Goal
Build Financial Planning features (Risk Profiling, Goal Planning, Proposals) while working in parallel without conflicts.

---

## 📋 Features to Build

### Feature List (Assigned to Team Members)
1. **Risk Profiling Questionnaire** - [Assign to Person]
2. **Financial Plan Creation** - [Assign to Person]
3. **Goal Calculators** - [Assign to Person]
4. **Product Selection** - [Assign to Person]
5. **Proposal Generation** - [Assign to Person]

---

## 🚀 Getting Started

### Prerequisites
- Git installed
- Node.js 18+ installed
- PostgreSQL database access
- Cursor IDE (recommended) or VS Code

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/your-username/WealthForce-RM-Dashboard.git
cd WealthForce-RM-Dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database connection

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

---

## 🌿 Git Workflow

### Branch Strategy
- `main` - Production code (protected, don't push here)
- `develop` - Development integration branch
- `feature/feature-name` - Individual feature work

### Daily Workflow

#### Morning (Starting Work)
```bash
# Update your local code
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/your-feature-name

# Start coding!
```

#### During Work
```bash
# Commit frequently
git add .
git commit -m "descriptive message about what you added"

# Push your branch
git push origin feature/your-feature-name
```

#### End of Day (Optional Integration)
```bash
# Merge to develop if your feature is stable
git checkout develop
git pull origin develop
git merge feature/your-feature-name
git push origin develop
```

---

## 📁 Folder Structure for Parallel Development

```
WealthForce-RM-Dashboard/
├── shared/
│   └── schema.ts                    # ALL team members will modify this
├── server/
│   ├── routes/
│   │   ├── index.ts                 # Main route handler
│   │   ├── risk-profiling.ts        # Person 1
│   │   ├── financial-plans.ts        # Person 1
│   │   └── proposals.ts             # Person 1 & 4
│   ├── services/
│   │   ├── risk-profiling/          # Person 1
│   │   ├── calculator/              # Person 1
│   │   └── proposal-generation/      # Person 4
│   └── index.ts
├── client/
│   └── src/
│       ├── components/
│       │   ├── financial-planning/
│       │   │   ├── RiskQuestionnaire/    # Person 2
│       │   │   ├── GoalCalculator/        # Person 2
│       │   │   ├── ProductSelection/      # Person 3
│       │   │   └── ProposalPreview/       # Person 3 & 4
│       └── pages/
│           ├── risk-profiling.tsx    # Person 2
│           ├── plan-creation.tsx     # Person 2
│           ├── product-selection.tsx # Person 3
│           └── proposal-viewer.tsx    # Person 3
└── documents/
    └── (documentation files)
```

---

## 👥 Team Member Assignments

### 👤 Person 1: Backend & Database
**Your Files:**
- `shared/schema.ts` (NEW tables - coordinate!)
- `server/routes/risk-profiling.ts` (NEW)
- `server/routes/financial-plans.ts` (NEW)
- `server/services/risk-profiling/` (NEW folder)
- `server/services/calculator/` (NEW folder)

**Your Work:**
1. Week 1: Create database schema (coordinate with team!)
2. Week 2: Build APIs for risk profiling
3. Week 3-4: Build financial data APIs
4. Week 5-6: Build goal calculators

**Important:** 
- ⚠️ You modify `shared/schema.ts` - communicate with team!
- ⚠️ Run migrations: `npm run db:push` (affects everyone)
- Tell team when schema is ready

---

### 👤 Person 2: Planning UI Components
**Your Files:**
- `client/src/components/financial-planning/RiskQuestionnaire/` (NEW)
- `client/src/components/financial-planning/FinancialDataCapture/` (NEW)
- `client/src/components/financial-planning/Goals/` (NEW)
- `client/src/components/financial-planning/ModelPortfolio/` (NEW)
- `client/src/pages/plan-creation.tsx` (NEW)
- `client/src/pages/risk-profiling.tsx` (NEW)

**Your Work:**
1. Week 1-2: Build risk profiling UI
2. Week 3-4: Build financial data capture forms
3. Week 5-6: Build goal calculators UI
4. Week 7-8: Build model portfolio selector

**Important:**
- ✅ Use your own new files - no conflicts!
- 🤝 Wait for Person 1's APIs (use mock data first)
- 🧪 Test with real data after Person 1 completes APIs

---

### 👤 Person 3: Products & Proposals UI
**Your Files:**
- `client/src/components/financial-planning/ProductSelection/` (NEW)
- `client/src/components/financial-planning/Proposal/` (NEW)
- `client/src/pages/product-selection.tsx` (NEW)
- `client/src/pages/proposal-viewer.tsx` (NEW)

**Your Work:**
1. Week 1-2: Build product catalog UI
2. Week 3-4: Build product selection interface
3. Week 5-6: Build plan summary screen
4. Week 7-8: Build proposal preview and history

**Important:**
- ✅ Use your own new files - no conflicts!
- 🤝 Works with Person 2's workflow
- 📦 Connect to Person 1's product APIs

---

### 👤 Person 4: PDF Generation & Workflows
**Your Files:**
- `server/services/proposal-generation/` (NEW folder)
- `server/services/approvals/` (NEW folder)
- `client/src/pages/approvals.tsx` (NEW)
- `documents/templates/` (NEW folder for PDF templates)

**Your Work:**
1. Week 1-2: Set up PDF generation engine
2. Week 3-4: Build HTML templates for proposals
3. Week 5-6: Build PDF conversion system
4. Week 7-8: Build approval workflows
5. Week 9-10: Build supervisor dashboard

**Important:**
- ✅ Mostly your own files
- 🤝 Needs Person 1's proposal APIs
- 🤝 Needs Person 3's proposal preview UI

---

## ⚠️ Conflict Prevention Rules

### Rule 1: Database Schema (CRITICAL)
**Who:** Person 1
**What:** Only Person 1 touches `shared/schema.ts` initially
**How:**
- Add ALL tables you need upfront
- Get review from team
- Run migration once
- Tell team when ready

**For Others:** Don't touch schema.ts until Person 1 is done!

### Rule 2: New Files Only
**Principle:** Each person creates NEW files, not edits existing ones
**Why:** Prevents merge conflicts
**How:**
- Create your own folders
- Use your own route files
- Register routes in `server/routes/index.ts` after coordinating

### Rule 3: Communication Protocol
**Daily Standup:**
```
Morning: "Working on X feature today"
Evening: "X feature done, Y still in progress"
Blocker: "Need Z from Person 1 before I can continue"
```

**When to Communicate:**
- ✅ Starting new feature
- ✅ About to modify shared file
- ✅ Stuck or blocked
- ✅ Feature complete and tested
- ✅ Need help

### Rule 4: Merge Strategy
**Never:** `git push -f` (force push)
**Never:** Work directly on `main` or `develop`
**Always:** Pull before push
**Always:** Commit small, frequent changes

---

## 📝 Naming Conventions

### Branch Names
```
feature/risk-profiling-questionnaire
feature/goal-calculators
feature/product-selection-ui
feature/pdf-proposal-generation
```

### Commit Messages
```
# Good examples:
Add risk profiling questionnaire component
Implement retirement goal calculator
Add product selection interface with risk validation
Create PDF proposal generation engine

# Bad examples:
fixed stuff
update
changes
```

### File Names
- Use kebab-case: `risk-questionnaire.tsx`
- Use PascalCase for components: `RiskQuestionnaire.tsx`
- Use camelCase for utilities: `calculateNetWorth.ts`

---

## ✅ Pull Request Process

### Creating a PR
1. Push your feature branch
2. Go to GitHub → Create Pull Request
3. Title: `Add [Feature Name]`
4. Description: What you built and why
5. Tag team members for review
6. Merge after 1 approval

### Reviewing PRs
- Check if it works
- Check for conflicts
- Suggest improvements
- Approve when ready

---

## 🧪 Testing Guidelines

### Before Merging to Develop
- [ ] Your code runs locally without errors
- [ ] No console errors in browser
- [ ] Database migrations work
- [ ] Your feature is complete and works end-to-end
- [ ] No conflicts with other team members' work

### Testing Checklist
```bash
# Run these before every commit
npm run check          # TypeScript check
npm run dev            # Make sure it starts
# Test your feature manually
# No console errors
```

---

## 🚨 Common Issues & Solutions

### Issue: Merge Conflicts
**Solution:**
```bash
git checkout develop
git pull origin develop
git checkout feature/your-branch
git merge develop
# Resolve conflicts
git push origin feature/your-branch
```

### Issue: Schema Changes
**Solution:**
- Wait for Person 1 to push schema changes
- Pull latest: `git pull origin develop`
- Run: `npm run db:push`

### Issue: Package Dependencies
**Solution:**
- Communicate before adding new npm packages
- Add to `package.json`
- Run `npm install`
- Commit `package-lock.json`

---

## 📞 Communication Channels

### Where to Communicate
- **Slack/Discord Channel:** [Add link]
- **Daily Standup:** [Time] via [Platform]
- **Code Issues:** GitHub Issues
- **Questions:** Ask in group chat immediately

### What to Communicate
- Starting new feature
- Blocked or stuck
- Schema changes
- Breaking changes
- Feature complete

---

## 📚 Important Files You'll Touch

### Backend Files
```
shared/schema.ts              ← Person 1 ONLY (coordinate!)
server/routes/index.ts        ← Everyone adds their routes here
server/routes/risk-profiling.ts ← Person 1
server/routes/financial-plans.ts ← Person 1
server/services/calculator/   ← Person 1
server/services/proposal-generation/ ← Person 4
```

### Frontend Files
```
client/src/App.tsx            ← Add routes here
client/src/components/financial-planning/ ← Everyone creates their folders
client/src/pages/             ← Everyone creates their pages
```

### Coordination Points
```
server/routes/index.ts        ← Everyone touches this!
client/src/App.tsx           ← Everyone touches this!
shared/schema.ts             ← Person 1 mainly, others ask permission
```

---

## 🎯 Quick Start Checklist

For Each Team Member:
- [ ] Fork/clone repository
- [ ] Run `npm install`
- [ ] Set up `.env` file
- [ ] Run `npm run db:push`
- [ ] Start server: `npm run dev`
- [ ] Create your first feature branch
- [ ] Start coding your assigned feature
- [ ] Commit and push daily
- [ ] Create PR when feature is complete

---

## 🏆 Success Metrics

### Week 1-2
- ✅ Database schema complete (Person 1)
- ✅ Risk profiling UI skeleton (Person 2)
- ✅ Product catalog UI skeleton (Person 3)
- ✅ PDF setup working (Person 4)

### Week 3-4
- ✅ All APIs working (Person 1)
- ✅ Financial data capture working (Person 2)
- ✅ Product selection working (Person 3)
- ✅ Template generation working (Person 4)

### Week 5-6
- ✅ Goal calculators working (Person 1)
- ✅ Goal planning UI working (Person 2)
- ✅ Proposal preview working (Person 3)
- ✅ PDF generation working (Person 4)

### Week 7-8
- ✅ Complete integration
- ✅ All features working together
- ✅ Testing and bug fixes
- ✅ Documentation complete

---

## 🎉 Final Tips

1. **Commit Often** - Better to have 50 small commits than 1 huge one
2. **Pull Daily** - Keep your code updated with others' work
3. **Communicate Always** - Over-communicate rather than under-communicate
4. **Test Locally** - Make sure it works before pushing
5. **Ask for Help** - Don't struggle alone
6. **Celebrate Wins** - Share when you complete something!

**Good luck team! Let's build something amazing! 🚀**

