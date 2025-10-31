# Financial Planning Module - Implementation Plan

Based on BRD requirements and existing project analysis.

## Table of Contents
1. [Database Schema Changes](#database-schema-changes)
2. [Backend API Development](#backend-api-development)
3. [Frontend Development](#frontend-development)
4. [Priority Implementation Roadmap](#priority-implementation-roadmap)
5. [Technical Specifications](#technical-specifications)

---

## Database Schema Changes

### 1. Risk Profiling System

#### New Tables

```sql
-- Risk Questionnaire Master
CREATE TABLE risk_questionnaires (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  jurisdiction TEXT NOT NULL, -- 'india', 'malaysia', 'singapore', 'thailand', 'gcc'
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Risk Questions with Answers and Scoring
CREATE TABLE risk_questions (
  id SERIAL PRIMARY KEY,
  questionnaire_id INTEGER REFERENCES risk_questionnaires(id),
  question_text TEXT NOT NULL,
  question_category TEXT, -- 'experience', 'tolerance', 'horizon', 'knowledge'
  question_order INTEGER NOT NULL,
  answer_type TEXT NOT NULL, -- 'single', 'multiple'
  answers_json JSONB NOT NULL, -- [{"text": "0-1 years", "score": 1}, {"text": "2-5 years", "score": 3}]
  ceiling_flag BOOLEAN DEFAULT false, -- Questions that can cap maximum risk
  created_at TIMESTAMP DEFAULT NOW()
);

-- Client Risk Profiles
CREATE TABLE risk_profiles (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) NOT NULL,
  questionnaire_id INTEGER REFERENCES risk_questionnaires(id),
  profile_category TEXT NOT NULL, -- 'conservative', 'moderate', 'aggressive'
  total_score INTEGER NOT NULL,
  risk_description TEXT,
  profile_expiry_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  assessed_by INTEGER REFERENCES users(id),
  assessed_at TIMESTAMP DEFAULT NOW(),
  override_applied BOOLEAN DEFAULT false,
  override_reason TEXT,
  override_approved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Risk Questionnaire Responses
CREATE TABLE risk_questionnaire_responses (
  id SERIAL PRIMARY KEY,
  risk_profile_id INTEGER REFERENCES risk_profiles(id) NOT NULL,
  question_id INTEGER REFERENCES risk_questions(id) NOT NULL,
  selected_answer JSONB NOT NULL, -- Store the answer chosen
  score INTEGER,
  answered_at TIMESTAMP DEFAULT NOW()
);
```

#### Schema File Location
**File:** `shared/schema.ts` (to be added)

---

### 2. Financial Plans System

#### New Tables

```sql
-- Financial Plans Master
CREATE TABLE financial_plans (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) NOT NULL,
  advisor_id INTEGER REFERENCES users(id) NOT NULL,
  
  -- Plan Type & Purpose
  plan_purpose TEXT NOT NULL, -- 'investment', 'insurance', 'execution_only'
  plan_type TEXT NOT NULL, -- 'retirement', 'education', 'protection', 'wealth', 'marriage'
  objective TEXT, -- Custom objective description
  
  -- Risk & Portfolio
  risk_profile_id INTEGER REFERENCES risk_profiles(id),
  model_portfolio_id INTEGER, -- Will reference model_portfolios table
  
  -- Status & Workflow
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'in_progress', 'pending_approval', 'approved', 'finalized', 'superseded', 'canceled'
  version INTEGER DEFAULT 1,
  
  -- Financial Data (JSONB for flexibility)
  current_financials JSONB, -- Net worth, assets, liabilities
  goals JSONB, -- Multiple goals with calculations
  plan_components JSONB, -- Structured plan details
  recommended_products JSONB, -- Product selections
  
  -- Approvals
  requires_approval BOOLEAN DEFAULT false,
  supervisor_approval BOOLEAN DEFAULT false,
  supervisor_id INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  
  -- System
  created_by INTEGER REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Model Portfolios
CREATE TABLE model_portfolios (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL, -- 'Conservative', 'Balanced', 'Moderate Growth', 'Aggressive'
  risk_level TEXT NOT NULL, -- 'conservative', 'moderate', 'aggressive'
  asset_allocation JSONB NOT NULL, -- {"equity": 40, "fixed_income": 50, "cash": 10}
  expected_return DECIMAL(5,2), -- Annual expected return percentage
  volatility DECIMAL(5,2), -- Portfolio volatility measure
  description TEXT,
  jurisdiction TEXT, -- 'all', 'india', 'malaysia', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Plan Product Selections
CREATE TABLE plan_products (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES financial_plans(id) NOT NULL,
  product_id INTEGER REFERENCES products(id) NOT NULL,
  category TEXT NOT NULL, -- 'equity_fund', 'fixed_income', 'insurance_life', etc.
  recommended_amount DECIMAL(15,2),
  allocation_percentage DECIMAL(5,2),
  risk_level TEXT,
  priority TEXT, -- 'high', 'medium', 'low'
  rationale TEXT,
  requires_approval BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Financial Goals (Multi-goal support)
CREATE TABLE financial_goals (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES financial_plans(id) NOT NULL,
  goal_type TEXT NOT NULL, -- 'retirement', 'education', 'marriage', 'purchase', 'insurance'
  goal_name TEXT, -- User-defined name
  target_amount DECIMAL(15,2),
  time_horizon INTEGER, -- Years to goal
  inflation_rate DECIMAL(5,2) DEFAULT 5.0,
  expected_return DECIMAL(5,2),
  existing_savings DECIMAL(15,2) DEFAULT 0,
  required_lump_sum DECIMAL(15,2), -- Calculated
  required_monthly_contribution DECIMAL(15,2), -- Calculated
  linked_to_dependent_id INTEGER, -- Link to dependents table if education/marriage goal
  calculation_details JSONB, -- Store calculation assumptions and breakdown
  created_at TIMESTAMP DEFAULT NOW()
);

-- Client Assets (Detailed Asset Tracking)
CREATE TABLE client_assets (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) NOT NULL,
  asset_type TEXT NOT NULL, -- 'cash', 'deposit', 'stocks', 'mutual_fund', 'property', 'others'
  description TEXT,
  ownership_type TEXT, -- 'individual', 'joint', 'spouse'
  current_value DECIMAL(15,2) NOT NULL,
  held_with_bank BOOLEAN DEFAULT false,
  liquid_amount DECIMAL(15,2), -- Amount that can be liquidated
  location TEXT, -- 'on-shore', 'off-shore'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Client Liabilities
CREATE TABLE client_liabilities (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) NOT NULL,
  liability_type TEXT NOT NULL, -- 'home_loan', 'credit_card', 'personal_loan', 'margin'
  description TEXT,
  outstanding_amount DECIMAL(15,2) NOT NULL,
  monthly_payment DECIMAL(15,2),
  interest_rate DECIMAL(5,2),
  term INTEGER, -- In months
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Client Income Sources
CREATE TABLE client_income (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) NOT NULL,
  income_type TEXT NOT NULL, -- 'salary', 'business', 'rental', 'dividend', 'others'
  amount DECIMAL(15,2) NOT NULL,
  frequency TEXT NOT NULL, -- 'monthly', 'annual'
  source TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Client Expenses
CREATE TABLE client_expenses (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) NOT NULL,
  expense_category TEXT NOT NULL, -- 'housing', 'utilities', 'education', 'lifestyle', 'others'
  amount DECIMAL(15,2) NOT NULL,
  expense_type TEXT, -- 'fixed', 'discretionary'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Dependents
CREATE TABLE dependents (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL, -- 'spouse', 'son', 'daughter', 'parent', 'others'
  date_of_birth TIMESTAMP,
  age INTEGER,
  dependency_period TEXT, -- 'until 22', 'lifelong', etc.
  insurance_beneficiary BOOLEAN DEFAULT false,
  education_cost_estimate DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Plan Budget (Asset Tagging)
CREATE TABLE plan_budget (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES financial_plans(id) NOT NULL,
  available_surplus DECIMAL(15,2), -- From cash flow analysis
  total_required DECIMAL(15,2), -- Total investment required
  tagged_assets JSONB, -- Array of asset IDs and amounts
  total_allocated DECIMAL(15,2),
  shortfall DECIMAL(15,2),
  external_funding_planned DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Advisor Licenses
CREATE TABLE advisor_licenses (
  id SERIAL PRIMARY KEY,
  advisor_id INTEGER REFERENCES users(id) NOT NULL,
  product_categories TEXT[], -- ['mutual_funds', 'insurance', 'equity']
  licensed_products INTEGER[], -- Specific product IDs
  license_number TEXT UNIQUE NOT NULL,
  issuer TEXT,
  expiry_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Client Permissions (Enhanced Access Control)
CREATE TABLE client_permissions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) NOT NULL,
  advisor_id INTEGER REFERENCES users(id) NOT NULL,
  access_type TEXT NOT NULL, -- 'primary', 'substitute', 'team_access'
  granted_by INTEGER REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Approval Workflows
CREATE TABLE approval_workflows (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES financial_plans(id) NOT NULL,
  request_type TEXT NOT NULL, -- 'risk_override', 'high_value_product', 'profile_change'
  requested_by INTEGER REFERENCES users(id) NOT NULL,
  approved_by INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reason TEXT,
  comments TEXT,
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP
);

-- Proposals
CREATE TABLE proposals (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES financial_plans(id) NOT NULL,
  proposal_type TEXT NOT NULL, -- 'investment', 'insurance', 'execution_only'
  version INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'final'
  generated_by INTEGER REFERENCES users(id) NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  client_acknowledged BOOLEAN DEFAULT false,
  client_acknowledged_at TIMESTAMP,
  document_path TEXT, -- Path to stored PDF
  created_at TIMESTAMP DEFAULT NOW()
);

-- Proposal Sections (for dynamic content)
CREATE TABLE proposal_sections (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER REFERENCES proposals(id) NOT NULL,
  section_type TEXT NOT NULL, -- 'cover', 'personal_profile', 'risk_summary', 'financial_summary', 'goals', 'allocation', 'products', 'disclaimers'
  section_data JSONB NOT NULL,
  order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Update Existing Tables

```sql
-- Add fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS product_licenses TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS license_level TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS can_approve BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS supervisor_id INTEGER REFERENCES users(id);

-- Enhance clients table with additional KYC fields
ALTER TABLE clients ADD COLUMN IF NOT EXISTS pep_status BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_residency_country TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS hnw_flag BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS accredited_investor_flag BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gender TEXT;

-- Enhance products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS risk_rating TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS asset_class TEXT; -- 'equity', 'debt', 'hybrid', 'cash'
ALTER TABLE products ADD COLUMN IF NOT EXISTS jurisdiction TEXT[]; -- Countries where product is available
ALTER TABLE products ADD COLUMN IF NOT EXISTS regulatory_info JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS expected_return TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS volatility DECIMAL(5,2);
```

---

## Backend API Development

### New API Endpoints Required

#### 1. Risk Profiling APIs

```typescript
// GET /api/risk-questionnaires
// Get available questionnaires by jurisdiction
GET /api/risk-questionnaires?jurisdiction=india

// GET /api/risk-questionnaires/:id/questions
// Get questions for a questionnaire
GET /api/risk-questionnaires/1/questions

// POST /api/risk-profiles
// Create/submit risk profile
POST /api/risk-profiles
Body: {
  clientId: number,
  questionnaireId: number,
  responses: Array<{questionId, selectedAnswer, score}>
}

// GET /api/clients/:clientId/risk-profile
// Get client's active risk profile
GET /api/clients/123/risk-profile

// GET /api/clients/:clientId/risk-profiles/history
// Get risk profile history
GET /api/clients/123/risk-profiles/history

// PUT /api/risk-profiles/:id/override
// Override risk profile (requires approval)
PUT /api/risk-profiles/45/override
Body: {
  newProfile: string,
  reason: string
}
```

#### 2. Financial Plan APIs

```typescript
// POST /api/plans
// Create new financial plan
POST /api/plans
Body: {
  clientId: number,
  planPurpose: 'investment' | 'insurance' | 'execution_only',
  planType: 'retirement' | 'education' | 'protection' | 'wealth' | 'marriage',
  objective: string,
  riskProfileId: number
}

// GET /api/plans
// List plans for advisor
GET /api/plans?status=draft&clientId=123

// GET /api/plans/:id
// Get plan details
GET /api/plans/789

// PUT /api/plans/:id
// Update plan
PUT /api/plans/789
Body: {
  status: 'in_progress',
  // other fields
}

// DELETE /api/plans/:id
// Cancel draft plan
DELETE /api/plans/789

// POST /api/plans/:id/financial-data
// Update financial position
POST /api/plans/789/financial-data
Body: {
  assets: Array<asset>,
  liabilities: Array<liability>,
  income: Array<income>,
  expenses: Array<expense>
}

// POST /api/plans/:id/goals
// Add/update goals
POST /api/plans/789/goals
Body: {
  goalType: 'retirement',
  targetAmount: 50000000,
  timeHorizon: 20,
  // other fields
}

// GET /api/plans/:id/goals
// Get calculated goals
GET /api/plans/789/goals

// POST /api/plans/:id/model-portfolio
// Select model portfolio
POST /api/plans/789/model-portfolio
Body: {
  modelPortfolioId: number,
  overrideAcknowledgment: boolean
}

// POST /api/plans/:id/products
// Add product selections
POST /api/plans/789/products
Body: {
  products: Array<{productId, allocationAmount, rationale}>
}

// POST /api/plans/:id/budget
// Update budgeting/tagging
POST /api/plans/789/budget
Body: {
  taggedAssets: Array<{assetId, amount}>,
  externalFunding: number
}

// POST /api/plans/:id/confirm
// Confirm plan (generate final proposal)
POST /api/plans/789/confirm
Body: {
  clientAcknowledgment: boolean,
  declarations: Array<declaration>
}
```

#### 3. Model Portfolio APIs

```typescript
// GET /api/model-portfolios
// Get available model portfolios
GET /api/model-portfolios?riskLevel=moderate

// GET /api/model-portfolios/:id
// Get model portfolio details
GET /api/model-portfolios/5

// GET /api/model-portfolios/:id/allocation
// Get asset allocation chart data
GET /api/model-portfolios/5/allocation
```

#### 4. Proposal APIs

```typescript
// POST /api/proposals/draft
// Generate draft proposal
POST /api/proposals/draft
Body: {
  planId: number
}

// POST /api/proposals/final
// Generate final proposal
POST /api/proposals/final
Body: {
  planId: number,
  clientAcknowledgment: boolean
}

// GET /api/proposals/:id
// Get proposal by ID
GET /api/proposals/456

// GET /api/proposals/:id/download
// Download proposal PDF
GET /api/proposals/456/download

// GET /api/clients/:clientId/proposals
// Get all proposals for a client
GET /api/clients/123/proposals

// GET /api/plans/:planId/proposals/history
// Get proposal version history
GET /api/plans/789/proposals/history
```

#### 5. Client Financial Data APIs

```typescript
// POST /api/clients/:clientId/assets
// Add client asset
POST /api/clients/123/assets

// GET /api/clients/:clientId/assets
// Get client assets
GET /api/clients/123/assets

// POST /api/clients/:clientId/liabilities
// Add client liability
POST /api/clients/123/liabilities

// GET /api/clients/:clientId/net-worth
// Calculate net worth
GET /api/clients/123/net-worth

// POST /api/clients/:clientId/income
// Add income source
POST /api/clients/123/income

// POST /api/clients/:clientId/expenses
// Add expense
POST /api/clients/123/expenses

// GET /api/clients/:clientId/cash-flow
// Calculate cash flow surplus/deficit
GET /api/clients/123/cash-flow

// POST /api/clients/:clientId/dependents
// Add dependent
POST /api/clients/123/dependents
```

#### 6. Approval Workflow APIs

```typescript
// POST /api/approvals/request
// Request approval
POST /api/approvals/request
Body: {
  planId: number,
  requestType: 'risk_override' | 'high_value_product',
  reason: string
}

// GET /api/approvals/pending
// Get pending approvals for supervisor
GET /api/approvals/pending

// POST /api/approvals/:id/approve
// Approve request
POST /api/approvals/789/approve
Body: {
  comments: string
}

// POST /api/approvals/:id/reject
// Reject request
POST /api/approvals/789/reject
Body: {
  comments: string
}
```

#### 7. Product Selection APIs

```typescript
// GET /api/products/by-risk
// Get products suitable for risk level
GET /api/products/by-risk?riskLevel=moderate

// GET /api/products/by-asset-class
// Get products by asset class
GET /api/products/by-asset-class?assetClass=equity

// POST /api/products/:id/validate
// Validate product against client profile
POST /api/products/456/validate
Body: {
  clientId: number,
  riskProfile: string
}
```

---

## Frontend Development

### New Components Required

#### 1. Financial Planning Module

```
client/src/
├── components/
│   └── financial-planning/
│       ├── PlanCreationWizard/
│       │   ├── Step1-PlanPurpose.tsx
│       │   ├── Step2-RiskProfiling.tsx
│       │   ├── Step3-FinancialPosition.tsx
│       │   ├── Step4-Goals.tsx
│       │   ├── Step5-ModelPortfolio.tsx
│       │   ├── Step6-ProductSelection.tsx
│       │   └── Step7-Budget.tsx
│       │
│       ├── RiskQuestionnaire/
│       │   ├── QuestionCard.tsx
│       │   ├── AnswerOptions.tsx
│       │   └── ProfileResult.tsx
│       │
│       ├── FinancialDataCapture/
│       │   ├── AssetsList.tsx
│       │   ├── LiabilitiesList.tsx
│       │   ├── IncomeSources.tsx
│       │   ├── ExpensesList.tsx
│       │   └── NetWorthCalculator.tsx
│       │
│       ├── Goals/
│       │   ├── GoalCalculator.tsx
│       │   ├── GoalList.tsx
│       │   └── GoalVisualization.tsx
│       │
│       ├── ModelPortfolio/
│       │   ├── PortfolioSelector.tsx
│       │   ├── AllocationChart.tsx
│       │   └── OverrideAcknowledgment.tsx
│       │
│       ├── ProductSelection/
│       │   ├── ProductCatalog.tsx
│       │   ├── AllocationMatrix.tsx
│       │   └── RiskValidation.tsx
│       │
│       └── Proposal/
│           ├── ProposalPreview.tsx
│           ├── ProposalConfirmation.tsx
│           └── ProposalHistory.tsx
│
└── pages/
    ├── risk-profiling.tsx
    ├── plan-creation.tsx
    ├── plan-detail.tsx
    ├── plan-list.tsx
    └── proposal-viewer.tsx
```

#### 2. Key Features per Component

**Risk Profiling:**
- Dynamic questionnaire rendering
- Progress indicator
- Answer validation
- Score calculation display
- Profile result visualization

**Financial Data Capture:**
- Add/edit/delete assets
- Add/edit/delete liabilities
- Income/expense categories
- Real-time net worth calculation
- Currency formatting

**Goal Planning:**
- Multiple goal support
- Calculator forms per goal type
- Visualization of goal timelines
- Required savings display
- Assumption adjustment controls

**Model Portfolio:**
- Visual portfolio selector
- Donut/pie chart for allocation
- Expected return display
- Override workflow UI

**Product Selection:**
- Filterable product list
- Search functionality
- Risk compatibility check
- Allocation percentage input
- Real-time allocation tracking
- Rationale capture

**Proposal:**
- Multi-section preview
- Draft generation UI
- Final confirmation workflow
- Client acknowledgment forms
- Historical proposals view
- PDF download

---

## Priority Implementation Roadmap

### Sprint 1 (Weeks 1-2): Foundation
**Goal:** Set up database schema and basic APIs

1. **Database Schema**
   - Create all new tables (risk profiling, plans, etc.)
   - Add fields to existing tables
   - Run migrations
   - Seed reference data (model portfolios, questionnaires)

2. **Risk Profiling Module**
   - Risk questionnaire APIs
   - Risk profile calculation logic
   - API endpoints for CRUD operations

3. **Basic Financial Plan Entity**
   - Financial plans table and APIs
   - Plan status workflow
   - Version control

**Deliverable:** Risk profiling system working end-to-end

---

### Sprint 2 (Weeks 3-4): Data Capture
**Goal:** Enable capturing client financial data

1. **Client Financial Data APIs**
   - Assets/Liabilities CRUD
   - Income/Expense CRUD
   - Net worth calculation
   - Cash flow calculation

2. **Dependents Management**
   - Dependents table and APIs
   - Age calculation logic
   - Relationship tracking

3. **Frontend Components**
   - Risk questionnaire UI
   - Financial data capture forms
   - Dependents management UI

**Deliverable:** Complete data capture for financial planning

---

### Sprint 3 (Weeks 5-6): Goal Planning & Portfolios
**Goal:** Implement goal calculators and model portfolios

1. **Goal Planning Logic**
   - Financial calculator engine
   - Retirement calculator
   - Education calculator
   - Insurance needs calculator
   - Annuity calculations

2. **Model Portfolio System**
   - Model portfolio APIs
   - Risk-to-model mapping
   - Override workflow logic

3. **Frontend Components**
   - Goal calculator UIs
   - Goal visualization
   - Model portfolio selector
   - Allocation charts

**Deliverable:** Working goal planning with model portfolios

---

### Sprint 4 (Weeks 7-8): Product Selection & Budgeting
**Goal:** Enable product selection and budget allocation

1. **Product Selection Logic**
   - Product risk validation
   - Allocation tracking
   - Approval requirements
   - Rationale capture

2. **Budgeting System**
   - Asset tagging logic
   - Shortfall calculation
   - Double-counting prevention

3. **Frontend Components**
   - Product selection interface
   - Budget allocation UI
   - Asset tagging interface
   - Allocation matrix visualization

**Deliverable:** Complete planning workflow except proposal

---

### Sprint 5 (Weeks 9-10): Proposal Generation
**Goal:** Generate and manage proposals

1. **Proposal Generation Engine**
   - PDF template system
   - Multi-section document generation
   - Draft vs Final logic
   - Document storage

2. **Proposal APIs**
   - Generate draft/final
   - Version control
   - Historical access
   - Download functionality

3. **Frontend Components**
   - Proposal preview
   - Confirmation workflow
   - Client acknowledgment UI
   - Proposal history view

**Deliverable:** Complete proposal generation system

---

### Sprint 6 (Weeks 11-12): Entitlements & Compliance
**Goal:** Add user entitlements and regulatory compliance

1. **User Entitlements**
   - Advisor licenses system
   - Product authority enforcement
   - Client permissions
   - Access control

2. **Approval Workflows**
   - Approval request system
   - Supervisor UI
   - Approval/rejection logic
   - Notification system

3. **Regulatory Compliance**
   - Multi-jurisdiction framework
   - Disclaimer management
   - Compliance checkpoints
   - Audit logging

**Deliverable:** Complete entitlements and compliance framework

---

### Sprint 7 (Weeks 13-14): Integration & Polish
**Goal:** Integrations and final polish

1. **Core Banking Integration** (if available)
   - Asset data sync
   - Liability data sync
   - Account balance retrieval

2. **Product Catalog Integration** (if available)
   - Real-time product data
   - Pricing/NAV feeds
   - Availability checks

3. **UI/UX Polish**
   - Complete wizard flow
   - Navigation improvements
   - Error handling
   - Loading states
   - Validation feedback

**Deliverable:** Production-ready financial planning module

---

## Technical Specifications

### Technology Stack
- **Backend:** Express.js, TypeScript, Drizzle ORM, PostgreSQL
- **Frontend:** React, TypeScript, TanStack Query, Tailwind CSS, shadcn/ui
- **PDF Generation:** Puppeteer (already installed)
- **Charts:** Recharts (already installed)

### Key Libraries to Add

```json
{
  "dependencies": {
    "date-fns": "^3.6.0", // For date calculations (already installed)
    "chart.js": "^4.4.0", // For additional charts
    "pdf-lib": "^1.17.1", // For PDF manipulation
    "html2canvas": "^1.4.1", // For charts to images
    "jspdf": "^2.5.1" // Alternative PDF generation
  }
}
```

### Business Logic Files Structure

```
server/
├── services/
│   ├── risk-profiling/
│   │   ├── questionnaire.service.ts
│   │   ├── scoring.engine.ts
│   │   └── profile.manager.ts
│   │
│   ├── financial-planning/
│   │   ├── plan.service.ts
│   │   ├── calculator/
│   │   │   ├── retirement.calculator.ts
│   │   │   ├── education.calculator.ts
│   │   │   └── insurance-needs.calculator.ts
│   │   └── portfolio.model.manager.ts
│   │
│   ├── product-selection/
│   │   ├── product.validator.ts
│   │   └── allocation.manager.ts
│   │
│   ├── proposal-generation/
│   │   ├── proposal.generator.ts
│   │   ├── templates/
│   │   │   ├── investment.template.ts
│   │   │   ├── insurance.template.ts
│   │   │   └── execution-only.template.ts
│   │   └── pdf.engine.ts
│   │
│   └── approvals/
│       ├── workflow.manager.ts
│       └── notification.service.ts
│
└── routes/
    ├── risk-profiling.routes.ts
    ├── financial-plans.routes.ts
    ├── model-portfolios.routes.ts
    ├── proposals.routes.ts
    └── approvals.routes.ts
```

### Environment Variables to Add

```env
# Financial Planning Configuration
RISK_PROFILE_VALIDITY_MONTHS=12
DEFAULT_INFLATION_RATE=5.0
DEFAULT_RETURN_ASSUMPTIONS={"conservative": 7, "moderate": 10, "aggressive": 12}

# Proposal Configuration
PROPOSAL_STORAGE_PATH=./documents/proposals
COMPANY_LOGO_PATH=./assets/logo.png
COMPANY_BRAND_COLOR=#1E40AF

# Jurisdiction-specific settings
DEFAULT_JURISDICTION=india
CURRENCY_SYMBOL=₹
```

---

## Success Criteria

### Phase 1 Completion
- ✅ Risk profiling questionnaire working
- ✅ Financial data capture functional
- ✅ Goal calculators operational
- ✅ Model portfolio selection working

### Phase 2 Completion
- ✅ Product selection with validation
- ✅ Proposal generation (draft and final)
- ✅ Document download working
- ✅ Version control operational

### Phase 3 Completion
- ✅ Approval workflows functional
- ✅ User entitlements enforced
- ✅ Multi-jurisdiction compliance framework
- ✅ All BRD requirements met

---

## Next Steps

1. **Review and Approve:** Review this implementation plan
2. **Database Setup:** Create migration files for all new tables
3. **Backend Development:** Start with Sprint 1 implementation
4. **Frontend Development:** Build UI components parallel to backend
5. **Testing:** Unit tests for business logic, integration tests for APIs
6. **Deployment:** Deploy to staging for testing

**Estimated Timeline:** 12-14 weeks for full implementation

**Resource Requirements:** 
- 1 Backend Developer (full-time)
- 1 Frontend Developer (full-time)  
- 1 QA Engineer (part-time)
- 1 Business Analyst (part-time for BRD compliance)

