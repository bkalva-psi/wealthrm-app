# Quick Database Query Reference

Use these in Neon Dashboard SQL Editor or any database client:

## View All Tables
```sql
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

## See Recent Activity (Last 100 rows)
```sql
-- For specific table (replace with your table name)
SELECT * FROM clients ORDER BY id DESC LIMIT 100;
SELECT * FROM tasks ORDER BY id DESC LIMIT 100;
SELECT * FROM appointments ORDER BY id DESC LIMIT 100;
SELECT * FROM transactions ORDER BY id DESC LIMIT 100;
```

## Count Records Per Table
```sql
SELECT 
    'clients' as table_name, COUNT(*) as row_count FROM clients
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'prospects', COUNT(*) FROM prospects
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'portfolio_alerts', COUNT(*) FROM portfolio_alerts
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions;
```

## See Schema Definition for Specific Table
```sql
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;
```

## View Data Changes (if you add timestamps to tables later)
```sql
-- If you add created_at to tables
SELECT * FROM clients 
ORDER BY created_at DESC 
LIMIT 20;
```

## Check If Table Exists
```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'risk_questionnaires'
);
```

## See All Column Names in a Table
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'clients';
```

## Monitor Real-Time Data
```sql
-- Run this multiple times to see changes
SELECT NOW() as current_time, COUNT(*) as total_clients FROM clients;
```

