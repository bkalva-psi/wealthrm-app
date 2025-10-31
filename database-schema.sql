-- ==============================================================================
-- WEALTH MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA
-- Database: Neon PostgreSQL (ep-white-frost)
-- Generated from shared/schema.ts
-- ==============================================================================

-- ==============================================================================
-- 1. USERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'relationship_manager',
    avatar_url TEXT,
    job_title TEXT,
    email TEXT,
    phone TEXT
);

-- ==============================================================================
-- 2. CLIENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    -- Basic Personal Information
    full_name TEXT NOT NULL,
    initials TEXT,
    email TEXT,
    phone TEXT,
    date_of_birth TIMESTAMP,
    marital_status TEXT,
    anniversary_date TIMESTAMP,
    
    -- Address Information
    home_address TEXT,
    home_city TEXT,
    home_state TEXT,
    home_pincode TEXT,
    work_address TEXT,
    work_city TEXT,
    work_state TEXT,
    work_pincode TEXT,
    
    -- Professional Information
    profession TEXT,
    sector_of_employment TEXT,
    designation TEXT,
    company_name TEXT,
    annual_income TEXT,
    work_experience INTEGER,
    
    -- KYC & Compliance Information
    kyc_date TIMESTAMP,
    kyc_status TEXT,
    identity_proof_type TEXT,
    identity_proof_number TEXT,
    address_proof_type TEXT,
    pan_number TEXT,
    tax_residency_status TEXT,
    fatca_status TEXT,
    risk_assessment_score INTEGER,
    
    -- Family Information
    spouse_name TEXT,
    dependents_count INTEGER,
    children_details TEXT,
    nominee_details TEXT,
    family_financial_goals TEXT,
    
    -- Investment Profile
    tier TEXT NOT NULL DEFAULT 'silver',
    aum TEXT NOT NULL,
    aum_value REAL NOT NULL,
    risk_profile TEXT DEFAULT 'moderate',
    investment_horizon TEXT,
    
    -- Portfolio Information
    total_invested_amount INTEGER,
    current_value INTEGER,
    unrealized_gains INTEGER,
    unrealized_gains_percent DOUBLE PRECISION,
    one_year_return DOUBLE PRECISION,
    three_year_return DOUBLE PRECISION,
    five_year_return DOUBLE PRECISION,
    portfolio_start_date DATE,
    last_valuation_date DATE,
    risk_score INTEGER,
    esg_score INTEGER,
    volatility DOUBLE PRECISION,
    sharpe_ratio DOUBLE PRECISION,
    asset_allocation JSONB,
    sector_exposure JSONB,
    geographic_exposure JSONB,
    investment_objectives TEXT,
    preferred_products TEXT,
    source_of_wealth TEXT,
    
    -- Communication & Relationship
    last_contact_date TIMESTAMP,
    preferred_contact_method TEXT,
    preferred_contact_time TEXT,
    communication_frequency TEXT,
    client_since TIMESTAMP,
    client_acquisition_source TEXT,
    
    -- Transaction Information
    last_transaction_date TIMESTAMP,
    total_transaction_count INTEGER,
    average_transaction_value REAL,
    recurring_investments TEXT,
    
    -- Additional Wealth Management Fields
    tax_planning_preferences TEXT,
    insurance_coverage TEXT,
    retirement_goals TEXT,
    major_life_events TEXT,
    financial_interests TEXT,
    net_worth TEXT,
    liquidity_requirements TEXT,
    foreign_investments TEXT,
    
    -- System Fields
    alert_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    assigned_to INTEGER REFERENCES users(id)
);

-- ==============================================================================
-- 3. PROSPECTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS prospects (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    initials TEXT,
    potential_aum TEXT,
    potential_aum_value REAL,
    email TEXT,
    phone TEXT,
    stage TEXT NOT NULL DEFAULT 'new',
    last_contact_date TIMESTAMP,
    probability_score INTEGER DEFAULT 50,
    products_of_interest TEXT[],
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    assigned_to INTEGER REFERENCES users(id)
);

-- ==============================================================================
-- 4. TASKS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium',
    client_id INTEGER REFERENCES clients(id),
    prospect_id INTEGER REFERENCES prospects(id),
    assigned_to INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 5. APPOINTMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location TEXT,
    client_id INTEGER REFERENCES clients(id),
    prospect_id INTEGER REFERENCES prospects(id),
    assigned_to INTEGER REFERENCES users(id),
    priority TEXT DEFAULT 'medium',
    type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 6. PORTFOLIO ALERTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS portfolio_alerts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    client_id INTEGER REFERENCES clients(id),
    severity TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 7. PERFORMANCE METRICS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    metric_type TEXT NOT NULL,
    current_value REAL NOT NULL,
    target_value REAL NOT NULL,
    percentage_change REAL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 8. AUM TRENDS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS aum_trends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_aum REAL NOT NULL,
    previous_year_aum REAL NOT NULL,
    growth_percentage REAL NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 9. SALES PIPELINE TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS sales_pipeline (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    stage TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    value REAL NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 10. TRANSACTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    settlement_date TIMESTAMP,
    transaction_type TEXT NOT NULL,
    product_type TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_category TEXT,
    quantity REAL,
    price REAL,
    amount REAL NOT NULL,
    fees REAL DEFAULT 0,
    taxes REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    currency_code TEXT DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'completed',
    reference TEXT,
    description TEXT,
    portfolio_impact REAL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 11. CLIENT PORTFOLIO BREAKDOWNS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS client_portfolio_breakdowns (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    dimension TEXT NOT NULL,
    category TEXT NOT NULL,
    aum_amount REAL NOT NULL,
    invested_amount REAL NOT NULL,
    current_value REAL NOT NULL,
    unrealized_gains REAL NOT NULL,
    as_of_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 12. RM BUSINESS METRICS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS rm_business_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    total_aum REAL NOT NULL,
    total_clients INTEGER NOT NULL,
    revenue_month_to_date REAL NOT NULL,
    pipeline_value REAL NOT NULL,
    platinum_clients INTEGER NOT NULL DEFAULT 0,
    gold_clients INTEGER NOT NULL DEFAULT 0,
    silver_clients INTEGER NOT NULL DEFAULT 0,
    equity_aum REAL NOT NULL DEFAULT 0,
    debt_aum REAL NOT NULL DEFAULT 0,
    mutual_fund_aum REAL NOT NULL DEFAULT 0,
    others_aum REAL NOT NULL DEFAULT 0,
    conservative_clients INTEGER NOT NULL DEFAULT 0,
    moderate_clients INTEGER NOT NULL DEFAULT 0,
    aggressive_clients INTEGER NOT NULL DEFAULT 0,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    as_of_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 13. PRODUCT REVENUE TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS product_revenue (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    product_type TEXT NOT NULL,
    product_category TEXT,
    product_name TEXT,
    gross_revenue REAL NOT NULL,
    net_revenue REAL NOT NULL,
    commission_rate REAL,
    trail_commission REAL NOT NULL DEFAULT 0,
    upfront_commission REAL NOT NULL DEFAULT 0,
    transaction_count INTEGER NOT NULL DEFAULT 0,
    client_count INTEGER NOT NULL DEFAULT 0,
    total_volume REAL NOT NULL DEFAULT 0,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 14. CUSTOMER SEGMENT ANALYSIS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS customer_segment_analysis (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    segment_type TEXT NOT NULL,
    segment_value TEXT NOT NULL,
    client_count INTEGER NOT NULL,
    total_aum REAL NOT NULL,
    average_aum REAL NOT NULL,
    revenue_contribution REAL NOT NULL,
    average_transaction_size REAL,
    transaction_frequency REAL,
    retention_rate REAL,
    new_clients_this_month INTEGER NOT NULL DEFAULT 0,
    aum_growth_rate REAL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    as_of_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 15. PIPELINE ANALYSIS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS pipeline_analysis (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    stage TEXT NOT NULL,
    prospect_count INTEGER NOT NULL,
    total_value REAL NOT NULL,
    average_value REAL NOT NULL,
    average_probability REAL,
    average_stage_time INTEGER,
    conversion_rate REAL,
    lead_source TEXT,
    source_prospect_count INTEGER,
    source_conversion_rate REAL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    as_of_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 16. CLIENT COMPLAINTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS client_complaints (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) NOT NULL,
    assigned_to INTEGER REFERENCES users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    severity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL,
    resolution_details TEXT,
    resolution_date TIMESTAMP,
    resolution_by INTEGER REFERENCES users(id),
    is_regulatory BOOLEAN NOT NULL DEFAULT FALSE,
    regulatory_ref_number TEXT,
    reported_date TIMESTAMP NOT NULL DEFAULT NOW(),
    acknowledgment_date TIMESTAMP,
    target_resolution_date TIMESTAMP,
    reported_via TEXT,
    escalation_level INTEGER NOT NULL DEFAULT 1,
    resolution_rating INTEGER,
    customer_feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 17. COMMUNICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS communications (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) NOT NULL,
    initiated_by INTEGER REFERENCES users(id) NOT NULL,
    communication_type TEXT NOT NULL,
    direction TEXT NOT NULL,
    subject TEXT NOT NULL,
    summary TEXT NOT NULL,
    details TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INTEGER,
    channel TEXT,
    sentiment TEXT DEFAULT 'neutral',
    followup_required BOOLEAN DEFAULT FALSE,
    followup_date TIMESTAMP,
    has_attachments BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    status TEXT DEFAULT 'completed',
    location TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 18. COMMUNICATION ACTION ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS communication_action_items (
    id SERIAL PRIMARY KEY,
    communication_id INTEGER REFERENCES communications(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to INTEGER REFERENCES users(id),
    due_date TIMESTAMP,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    completed_at TIMESTAMP,
    action_type TEXT DEFAULT 'task',
    deal_value REAL,
    expected_close_date TIMESTAMP
);

-- ==============================================================================
-- 19. COMMUNICATION ATTACHMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS communication_attachments (
    id SERIAL PRIMARY KEY,
    communication_id INTEGER REFERENCES communications(id) NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by INTEGER REFERENCES users(id) NOT NULL,
    description TEXT,
    is_client_visible BOOLEAN DEFAULT TRUE,
    viewed_by_client BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 20. CLIENT COMMUNICATION PREFERENCES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS client_communication_preferences (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) UNIQUE NOT NULL,
    preferred_channels TEXT[],
    preferred_frequency TEXT DEFAULT 'monthly',
    preferred_days TEXT[],
    preferred_time_slots TEXT[],
    do_not_contact_times TEXT,
    preferred_language TEXT DEFAULT 'English',
    communication_style TEXT,
    topics_of_interest TEXT[],
    opt_out_categories TEXT[],
    special_instructions TEXT,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 21. COMMUNICATION TEMPLATES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS communication_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    variables TEXT[],
    created_by INTEGER REFERENCES users(id) NOT NULL,
    is_global BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 22. PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    product_code TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT,
    description TEXT NOT NULL,
    key_features TEXT[],
    target_audience TEXT,
    min_investment INTEGER NOT NULL,
    max_investment INTEGER,
    investment_multiples INTEGER DEFAULT 1000,
    risk_level TEXT NOT NULL,
    expected_returns TEXT,
    lock_in_period INTEGER,
    tenure TEXT,
    exit_load TEXT,
    management_fee REAL,
    regulatory_approvals TEXT[],
    tax_implications TEXT,
    factsheet_url TEXT,
    kims_url TEXT,
    application_form_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_open_for_subscription BOOLEAN DEFAULT TRUE,
    launch_date TIMESTAMP,
    maturity_date TIMESTAMP,
    total_subscriptions DOUBLE PRECISION DEFAULT 0,
    total_investors INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 23. COMMUNICATION ANALYTICS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS communication_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    client_id INTEGER REFERENCES clients(id),
    period TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    total_communications INTEGER NOT NULL,
    communications_by_type JSONB NOT NULL,
    communications_by_direction JSONB NOT NULL,
    average_response_time INTEGER,
    average_duration INTEGER,
    communications_by_channel JSONB,
    sentiment_analysis JSONB,
    most_discussed_topics JSONB,
    communication_effectiveness REAL,
    followup_completion REAL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 24. TALKING POINTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS talking_points (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    detailed_content TEXT NOT NULL,
    source TEXT,
    relevance_score INTEGER DEFAULT 5,
    valid_until TIMESTAMP,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- ==============================================================================
-- 25. ANNOUNCEMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    target_audience TEXT DEFAULT 'all_rms',
    valid_from TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP,
    author TEXT NOT NULL,
    action_required BOOLEAN DEFAULT FALSE,
    action_deadline TIMESTAMP,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- ==============================================================================
-- 26. PERFORMANCE TARGETS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS performance_targets (
    id SERIAL PRIMARY KEY,
    rm_id INTEGER REFERENCES users(id) NOT NULL,
    period TEXT NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER,
    month INTEGER,
    new_clients_target INTEGER DEFAULT 0,
    net_new_money_target DOUBLE PRECISION DEFAULT 0,
    client_meetings_target INTEGER DEFAULT 0,
    prospect_pipeline_target DOUBLE PRECISION DEFAULT 0,
    revenue_target DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 27. PERFORMANCE ACTUALS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS performance_actuals (
    id SERIAL PRIMARY KEY,
    rm_id INTEGER REFERENCES users(id) NOT NULL,
    period TEXT NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER,
    month INTEGER,
    new_clients_actual INTEGER DEFAULT 0,
    net_new_money_actual DOUBLE PRECISION DEFAULT 0,
    client_meetings_actual INTEGER DEFAULT 0,
    prospect_pipeline_actual DOUBLE PRECISION DEFAULT 0,
    revenue_actual DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 28. PERFORMANCE PEER RANKINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS performance_peer_rankings (
    id SERIAL PRIMARY KEY,
    rm_id INTEGER REFERENCES users(id) NOT NULL,
    period TEXT NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER,
    month INTEGER,
    new_clients_rank INTEGER,
    net_new_money_rank INTEGER,
    client_meetings_rank INTEGER,
    prospect_pipeline_rank INTEGER,
    revenue_rank INTEGER,
    overall_rank INTEGER,
    new_clients_percentile INTEGER,
    net_new_money_percentile INTEGER,
    client_meetings_percentile INTEGER,
    prospect_pipeline_percentile INTEGER,
    revenue_percentile INTEGER,
    overall_percentile INTEGER,
    total_rms INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- 29. PERFORMANCE INCENTIVES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS performance_incentives (
    id SERIAL PRIMARY KEY,
    rm_id INTEGER REFERENCES users(id) NOT NULL,
    period TEXT NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER,
    month INTEGER,
    earned_amount DOUBLE PRECISION DEFAULT 0,
    projected_amount DOUBLE PRECISION DEFAULT 0,
    possible_amount DOUBLE PRECISION DEFAULT 0,
    target_achievement_percent DOUBLE PRECISION DEFAULT 0,
    base_incentive DOUBLE PRECISION DEFAULT 0,
    performance_bonus DOUBLE PRECISION DEFAULT 0,
    team_bonus DOUBLE PRECISION DEFAULT 0,
    special_incentives DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================================================
-- END OF SCHEMA
-- ==============================================================================
