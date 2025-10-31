# SQL Editor Queries for Neon Console

Copy and paste these queries into the Neon SQL Editor (console.neon.tech)

## 1. List All Tables
```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

## 2. View Your Clients
```sql
SELECT 
    id,
    full_name,
    email,
    phone,
    tier,
    aum,
    risk_profile,
    created_at
FROM clients
LIMIT 20;
```

## 3. View All Users
```sql
SELECT 
    id,
    username,
    full_name,
    role,
    email
FROM users;
```

## 4. Count Records in Major Tables
```sql
SELECT 
    'clients' as table_name, COUNT(*) as row_count FROM clients
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments;
```

## 5. View Recent Transactions
```sql
SELECT 
    id,
    client_id,
    transaction_type,
    amount,
    status,
    transaction_date
FROM transactions
ORDER BY transaction_date DESC
LIMIT 20;
```

## 6. View Communications
```sql
SELECT 
    id,
    client_id,
    communication_type,
    subject,
    sent_date,
    status
FROM communications
ORDER BY sent_date DESC
LIMIT 20;
```

## 7. See All Columns in a Table
```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;
```

## 8. Check Database Size
```sql
SELECT 
    pg_size_pretty(pg_database_size('neondb')) as database_size;
```

## 9. View All Tables with Row Counts
```sql
SELECT 
    t.tablename,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' AND table_name = t.tablename) as has_table
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY t.tablename;
```

## 10. Get Table Statistics
```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

