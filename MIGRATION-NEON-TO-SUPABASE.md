# 🚀 Migration Guide: Neon to Supabase

This guide covers migrating your Wealth Management System database from Neon PostgreSQL to Supabase.

---

## 📋 **Migration Steps Overview**

### **Phase 1: Preparation & Export**
1. Export schema from Neon
2. Export data from Neon
3. Export sequences/auto-increment values
4. Create Supabase project

### **Phase 2: Import to Supabase**
5. Import schema to Supabase
6. Import data to Supabase
7. Reset sequences
8. Verify data integrity

### **Phase 3: Code Updates**
9. Update connection strings
10. Update database client libraries
11. Test all functionality
12. Update environment variables

---

## 🔴 **Major Problems & Challenges**

### **1. Connection Method Differences**

**Problem:**
- **Neon**: Uses `@neondatabase/serverless` with WebSocket connections
- **Supabase**: Uses standard PostgreSQL connection via `järverless` OR standard `pg` library with connection pooling

**Solution:**
```typescript
// Current (Neon):
import { Pool } from '@neondatabase/serverless';
import ws from "ws";
neonConfig.webSocketConstructor = ws;

// Change to (Supabase):
import { Pool } from 'pg';
// OR use Supabase's connection pooling with port 6543
```

### **2. Connection String Format**

**Problem:**
Different connection string formats and SSL requirements.

**Neon Format:**
```
postgresql://user:pass@host/db?sslmode=require
```

**Supabase Format:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Solution:**
Update `.env` file:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### **3. Row-Level Security (RLS) Policies**

**Problem:**
Supabase **enables RLS by default** on all tables. Your existing queries may fail due to RLS policies blocking access.

**Solution:**
Either:
- **Disable RLS** (not recommended for production):
  ```sql
  ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
  ```
- **Create RLS policies** (recommended):
  ```sql
  -- Allow public read/write (temporary for migration)
  CREATE POLICY "Allow all" ON table_name FOR ALL USING (true);
  ```

### **4. Extension Differences**

**Problem:**
Some PostgreSQL extensions available in Neon may not be available in Supabase (or need enabling).

**Common Extensions Needed:**
- `uuid-ossp` (usually available)
- `pgcrypto` (usually available)

**Solution:**
Enable in Supabase Dashboard → Database → Extensions

### **5. Sequence/Serial Issues**

**Problem:**
After importing data, sequence values may be out of sync, causing primary key conflicts on new inserts.

**Example:**
- Table has rows with IDs: 1, 2, 3, ..., 100
- Sequence still at 1
- Next insert tries ID 2 → **CONFLICT!**

**Solution:**
After data import, reset sequences:
```sql
SELECT setval('table_name_id_seq', (SELECT MAX(id) FROM table_name));
```

### **6. Case Sensitivity**

**Problem:**
PostgreSQL identifier case sensitivity differences between Neon and Supabase.

**Solution:**
Use lowercase table/column names consistently, or quote identifiers.

### **7. JSONB vs JSON Operations**

**Problem:**
If you use JSONB-specific operators, ensure Supabase supports them (it usually does).

### **8. Connection Pooling**

**Problem:**
- Neon: Serverless connection pooling built-in
- Supabase: Uses PgBouncer for connection pooling on different ports

**Supabase Connection Options:**
1. **Direct Connection** (port 5432) - For migrations, admin tasks
2. **Pooled Connection** (port 6543) - For application connections

**Solution:**
```env
# For direct connection (migrations)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# For pooled connection (app)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
```

### **9. Database Client Library Changes**

**Problem:**
Your code uses `@neondatabase/serverless`. Need to switch to standard `pg` library.

**Files to Update:**
- `server/db.ts` - Main database connection file
- Any direct database queries

**Solution:**
```bash
npm uninstall @neondatabase/serverless
npm install pg @types/pg
```

Update `server/db.ts`:
```typescript
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Supabase requires SSL
  }
});

export const db = drizzle(pool, { schema });
```

### **10. WebSocket vs TCP Connection**

**Problem:**
Neon uses WebSocket for serverless. Supabase uses standard TCP connections.

**Impact:**
- Remove all Neon-specific WebSocket configuration
- Standard PostgreSQL connection works

---

## 📝 **Step-by-Step Migration Process**

### **Step 1: Export from Neon**

```bash
# Run export script
npx tsx scripts/export-neon-to-supabase.ts
```

This creates:
- `neon-export-schema.sql` - All CREATE TABLE statements
- `neon-export-data.json` - All table data as JSON
- `neon-export-sequences.json` - Sequence current values

### **Step 2: Create Supabase Project**

1. Go to https://supabase.com
2. Create new project
3. Wait for database to be provisioned
4. Note your connection string from: Settings → Database → Connection string

### **Step 3: Import Schema**

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `neon-export-schema.sql`
3. Paste and run
4. Verify all tables created

**OR use psql:**
```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" < neon-export-schema.sql
```

### **Step 4: Import Data**

**Option A: Using Supabase Dashboard (Small datasets)**
- Use Table Editor → Import CSV/JSON

**Option B: Using Script (Recommended)**
Create import script that reads `neon-export-data.json` and inserts data.

### **Step 5: Reset Sequences**

Run this for each table with serial/sequence:
```sql
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('clients_id_seq', (SELECT MAX(id) FROM clients));
-- ... repeat for all tables
```

### **Step 6: Update Code**

1. **Update dependencies:**
   ```bash
   npm uninstall @neondatabase/serverless
   npm install pg @types/pg
   ```

2. **Update `server/db.ts`:**
   ```typescript
   import { Pool } from 'pg';
   import { drizzle } from 'drizzle-orm/node-postgres';
   import * as schema from "@shared/schema";

   if (!process.env.DATABASE_URL) {
     throw new Error("DATABASE_URL must be set");
   }

   export const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: process.env.NODE_ENV === 'production' ? {
       rejectUnauthorized: false
     } : false,
     max: 10,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 10000,
   });

   export const db = drizzle(pool, { schema });
   ```

3. **Update `.env`:**
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

4. **Remove Neon-specific code:**
   - Remove `neonConfig.webSocketConstructor`
   - Remove `ws` import
   - Remove `neonConfig.poolQueryViaFetch`

### **Step 7: Handle RLS Policies**

**Temporary (for testing):**
```sql
-- Disable RLS on all tables (NOT for production!)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;
```

**Production (recommended):**
Create proper RLS policies for each table based on your access patterns.

### **Step 8: Test Everything**

1. Test database connection
2. Test CRUD operations
3. Test all API endpoints
4. Verify data integrity
5. Check foreign key relationships

---

## ⚠️ **Potential Breaking Changes**

### **1. Drizzle ORM Compatibility**

**Problem:**
`drizzle-orm/neon-serverless` won't work with Supabase.

**Solution:**
Use `drizzle-orm/node-postgres` instead:
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
```

### **2. Connection Pool Behavior**

**Problem:**
Different connection pooling behavior may cause timeouts or connection limits.

**Solution:**
Adjust pool settings:
```typescript
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
```

### **3. Transaction Isolation**

**Problem:**
Different default isolation levels (usually not an issue).

**Solution:**
Explicitly set if needed:
```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

---

## 🔧 **Quick Migration Script**

Create this script to automate data import:

```typescript
// scripts/import-to-supabase.ts
import { Pool } from 'pg';
import fs from 'fs';

const supabasePool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const data = JSON.parse(fs.readFileSync('neon-export-data.json', 'utf8'));

async function importData() {
  for (const [table, rows] of Object.entries(data)) {
    if (rows.length === 0) continue;
    
    const columns = Object.keys(rows[0]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const columnNames = columns.join(', ');
    
    for (const row of rows) {
      const values = columns.map(col => row[col]);
      await supabasePool.query(
        `INSERT INTO ${table} (${columnNames}) VALUES (${placeholders})`,
        values
      );
    }
    
    console.log(`✅ Imported ${rows.length} rows to ${table}`);
  }
  
  await supabasePool.end();
}

importData();
```

---

## ✅ **Post-Migration Checklist**

- [ ] All tables imported
- [ ] All data imported
- [ ] Sequences reset correctly
- [ ] Foreign keys working
- [ ] RLS policies configured (or disabled for testing)
- [ ] Connection string updated in `.env`
- [ ] Code updated to use `pg` instead of `@neondatabase/serverless`
- [ ] `server/db.ts` updated
- [ ] All API endpoints tested
- [ ] Authentication working
- [ ] No connection errors in logs
- [ ] Performance acceptable

---

## 🆘 **Troubleshooting Alert**

### **Common Errors:**

1. **"SSL required"**
   - Solution: Add `ssl: { rejectUnauthorized: false }` to Pool config

2. **"Row-level security policy violation"**
   - Solution: Disable RLS temporarily or create policies

3. **"Connection timeout"**
   - Solution: Use pooled connection (port 6543) for production

4. **"Sequence out of sync"**
   - Solution: Run sequence reset queries

5. **"Type mismatch"**
   - Solution: Check data types match between Neon and Supabase

---

## 📊 **Migration Comparison**

| Feature | Neon | Supabase |
|---------|------|----------|
| Connection | WebSocket (serverless) | TCP (standard) |
| Library | `@neondatabase/serverless` | `pg` or `@supabase/supabase-js` |
| Pooling | Built-in | PgBouncer (port 6543) |
| RLS | Optional | Enabled by default |
| Extensions | Standard PostgreSQL | Standard + some extras |
| Connection String | Custom format | Standard PostgreSQL |
| Max Connections | Plan-dependent | Plan-dependent |

---

## 🎯 **Recommendation**

**For your use case:**
1. ✅ Export using the provided script
2. ✅ Test migration in a Supabase test project first
3. ✅ Update code incrementally (one file at a time)
4. ✅ Test thoroughly before switching production
5. ✅ Keep Neon as backup until migration verified

**Estimated Time:** 4-8 hours depending on data size and testing

---

**Need help with a specific step? Let me know!** 🚀
