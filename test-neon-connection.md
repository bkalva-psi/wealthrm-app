# Test Queries for Neon SQL Editor

## Step 3: Run this query in SQL Editor
Copy and paste this query:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Expected Result:
If you see 30 tables listed (like clients, users, transactions, etc.), you're in the correct database! ✅

If you see 0 results or an error, the database is empty. Continue below.

