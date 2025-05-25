-- Create communications table
CREATE TABLE IF NOT EXISTS communications (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  initiated_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  communication_type TEXT NOT NULL,
  channel TEXT,
  direction TEXT NOT NULL,
  subject TEXT NOT NULL,
  summary TEXT,
  notes TEXT,
  sentiment TEXT,
  tags TEXT[],
  follow_up_required BOOLEAN DEFAULT FALSE,
  next_steps TEXT
);

-- Create communication action items table
CREATE TABLE IF NOT EXISTS communication_action_items (
  id SERIAL PRIMARY KEY,
  communication_id INTEGER NOT NULL REFERENCES communications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create communication attachments table
CREATE TABLE IF NOT EXISTS communication_attachments (
  id SERIAL PRIMARY KEY,
  communication_id INTEGER NOT NULL REFERENCES communications(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_url TEXT,
  description TEXT,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create client communication preferences table
CREATE TABLE IF NOT EXISTS client_communication_preferences (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  preferred_channels TEXT[],
  preferred_frequency TEXT,
  preferred_days TEXT[],
  preferred_time_slots TEXT[],
  preferred_language TEXT,
  opt_in_marketing BOOLEAN DEFAULT TRUE,
  do_not_contact BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(client_id)
);

-- Create communication templates table
CREATE TABLE IF NOT EXISTS communication_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT[],
  is_global BOOLEAN DEFAULT FALSE,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create communication analytics table
CREATE TABLE IF NOT EXISTS communication_analytics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_communications INTEGER NOT NULL,
  communications_by_type JSONB,
  communications_by_direction JSONB,
  communications_by_channel JSONB,
  sentiment_analysis JSONB,
  most_discussed_topics JSONB,
  average_duration INTEGER,
  average_response_time INTEGER,
  communication_effectiveness JSONB,
  followup_completion JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster querying
CREATE INDEX IF NOT EXISTS idx_communications_client_id ON communications(client_id);
CREATE INDEX IF NOT EXISTS idx_communications_initiated_by ON communications(initiated_by);
CREATE INDEX IF NOT EXISTS idx_communications_start_time ON communications(start_time);
CREATE INDEX IF NOT EXISTS idx_action_items_communication_id ON communication_action_items(communication_id);
CREATE INDEX IF NOT EXISTS idx_action_items_assigned_to ON communication_action_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON communication_action_items(status);
CREATE INDEX IF NOT EXISTS idx_attachments_communication_id ON communication_attachments(communication_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON communication_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON communication_templates(created_by);