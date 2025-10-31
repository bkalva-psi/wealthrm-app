-- Add gender column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gender TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' AND column_name = 'gender';
