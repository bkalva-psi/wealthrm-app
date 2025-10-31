# Row-Level Security (RLS) Policies Documentation

## Overview

Comprehensive RLS policies have been implemented for all 30 tables in the WealthRM App database. These policies implement role-based access control to ensure data security and proper data isolation between users.

## Migration Status

✅ **Migration Applied:** `create_rls_policies_for_all_tables`

All tables now have RLS enabled with appropriate policies defined.

---

## Current Authentication Context

### Important Note
The application currently uses **Express session-based authentication** with **Supabase Service Role Key** in the backend. This means:

- ✅ **RLS policies are defined and active** in the database
- ⚠️ **Service role key bypasses RLS** (by design in Supabase)
- 🔄 **Policies will activate** when:
  - Frontend uses Supabase client directly (with anon key)
  - You migrate to Supabase Auth
  - You use authenticated Supabase requests (not service role)

### Helper Functions Created

The migration created these helper functions to support RLS:

1. **`get_current_user_id()`**
   - Returns the current user ID from JWT claims or app settings
   - Supports both Supabase Auth and custom session auth
   - Returns NULL for service role (allows bypass)

2. **`get_current_user_role()`**
   - Returns current user role: 'relationship_manager', 'supervisor', or 'admin'

3. **`is_admin()`**
   - Returns true if current user is admin

4. **`is_supervisor()`**
   - Returns true if current user is supervisor or admin

5. **`get_team_user_ids()`**
   - Returns array of user IDs that current supervisor/admin can access
   - Currently: supervisors see all relationship_managers
   - TODO: Implement actual supervisor-team relationships

---

## Access Control Model

### Relationship Managers (RMs)
**Can:**
- ✅ SELECT/INSERT/UPDATE their own clients (`assigned_to = their_user_id`)
- ✅ SELECT/INSERT/UPDATE their own prospects
- ✅ SELECT/INSERT/UPDATE their own tasks and appointments
- ✅ SELECT transactions for their clients
- ✅ SELECT/INSERT communications they initiated or for their clients
- ✅ SELECT their own performance metrics, targets, actuals
- ✅ SELECT active talking points and announcements
- ✅ SELECT products (read-only)
- ✅ SELECT their own client drafts

**Cannot:**
- ❌ See other RMs' clients or data
- ❌ Modify products, talking points, announcements
- ❌ Delete clients or transactions
- ❌ Access supervisor/admin functions

### Supervisors
**Can:**
- ✅ Everything RMs can do
- ✅ SELECT all team members' clients (all relationship_managers)
- ✅ SELECT all team members' prospects, tasks, appointments
- ✅ SELECT team performance metrics and analytics
- ✅ SELECT team communications

**Cannot:**
- ❌ Modify data (still need to go through RMs or be admin)
- ❌ Access other supervisors' data
- ❌ Modify products, talking points, announcements

### Admins
**Can:**
- ✅ **Full access** to all tables
- ✅ SELECT/INSERT/UPDATE/DELETE all records
- ✅ Modify products, talking points, announcements
- ✅ Manage users table
- ✅ Override any RLS restrictions

---

## Policy Details by Table

### 1. **clients**
- **SELECT:** Own clients OR admin OR supervisor sees team clients
- **INSERT:** Can create clients assigned to themselves (or admin)
- **UPDATE:** Can update own clients OR admin
- **DELETE:** Admin only

### 2. **prospects**
- **SELECT:** Own prospects OR admin OR supervisor sees team prospects
- **INSERT:** Can create prospects assigned to themselves
- **UPDATE:** Can update own prospects OR admin
- **DELETE:** Admin only

### 3. **tasks**
- **SELECT:** Assigned tasks OR admin OR supervisor sees team tasks
- **INSERT:** Can create tasks assigned to themselves
- **UPDATE:** Can update assigned tasks OR admin
- **DELETE:** Can delete assigned tasks OR admin

### 4. **appointments**
- Same pattern as tasks

### 5. **portfolio_alerts**
- **SELECT:** Alerts for clients assigned to them OR admin/supervisor
- **INSERT/UPDATE:** For their own clients OR admin

### 6. **transactions**
- **SELECT:** Transactions for clients assigned to them OR admin/supervisor
- **INSERT:** For their own clients OR admin
- **UPDATE/DELETE:** Admin only (to maintain audit trail)

### 7. **communications**
- **SELECT:** Communications they initiated OR for their clients OR admin/supervisor
- **INSERT:** Can create communications (must be initiated_by them)
- **UPDATE:** Can update own communications OR admin

### 8. **communication_action_items**
- **SELECT:** Items assigned to them OR related to their communications
- **INSERT/UPDATE:** Can create/update items assigned to themselves

### 9. **communication_attachments**
- **SELECT:** Attachments they uploaded OR for their communications
- **INSERT:** Can upload attachments (must be uploaded_by them)

### 10. **client_communication_preferences**
- **SELECT:** Preferences for their clients
- **INSERT/UPDATE:** For their own clients OR admin

### 11. **communication_templates**
- **SELECT:** Global templates OR templates they created
- **INSERT/UPDATE/DELETE:** Can manage own templates OR admin

### 12. **communication_analytics**
- **SELECT:** Analytics for themselves OR admin/supervisor sees team analytics

### 13. **products**
- **SELECT:** All authenticated users (read-only)
- **INSERT/UPDATE/DELETE:** Admin only

### 14. **performance_metrics**
- **SELECT:** Own metrics OR admin/supervisor sees team metrics
- **INSERT:** Can create own metrics
- **UPDATE:** Admin only

### 15. **aum_trends**
- **SELECT:** Own trends OR admin/supervisor
- **Modify:** Admin only

### 16. **sales_pipeline**
- **SELECT:** Own pipeline OR admin/supervisor
- **Modify:** Admin only

### 17. **performance_targets**
- **SELECT:** Own targets OR admin/supervisor
- **Modify:** Admin only

### 18. **performance_actuals**
- **SELECT:** Own actuals OR admin/supervisor
- **Modify:** Admin only

### 19. **performance_peer_rankings**
- **SELECT:** Own rankings OR admin/supervisor
- **Modify:** Admin only

### 20. **performance_incentives**
- **SELECT:** Own incentives OR admin/supervisor
- **Modify:** Admin only

### 21. **rm_business_metrics**
- **SELECT:** Own metrics OR admin/supervisor
- **Modify:** Admin only

### 22. **client_portfolio_breakdowns**
- **SELECT:** Breakdowns for clients they manage OR admin/supervisor
- **Modify:** Admin only

### 23. **product_revenue**
- **SELECT:** Own revenue OR admin/supervisor
- **Modify:** Admin only

### 24. **customer_segment_analysis**
- **SELECT:** Own segments OR admin/supervisor
- **Modify:** Admin only

### 25. **pipeline_analysis**
- **SELECT:** Own analysis OR admin/supervisor
- **Modify:** Admin only

### 26. **client_complaints**
- **SELECT:** Complaints assigned to them OR for their clients OR admin/supervisor
- **INSERT:** Can create complaints assigned to themselves
- **UPDATE:** Can update assigned complaints OR admin

### 27. **talking_points**
- **SELECT:** All authenticated users (active points)
- **Modify:** Admin only

### 28. **announcements**
- **SELECT:** All authenticated users (active announcements)
- **Modify:** Admin only

### 29. **users**
- **SELECT:** Own user record OR admin/supervisor sees team
- **Modify:** Admin only

### 30. **client_drafts**
- **SELECT/INSERT/UPDATE/DELETE:** Own drafts OR admin

---

## Testing RLS Policies

### Current Behavior
Since you're using **service role key** in backend:
- ✅ Backend operations bypass RLS (work as before)
- ✅ Policies are defined and ready
- ✅ Will activate when using authenticated requests

### Testing with Authenticated Requests

To test RLS policies, you can:

1. **Use Supabase client with anon key** (frontend):
   ```typescript
   // This would be restricted by RLS
   const { data, error } = await supabase
     .from('clients')
     .select('*');
   ```

2. **Set user context** (for testing):
   ```sql
   -- Set user context for testing
   SET app.current_user_id = 1;
   SET app.current_user_role = 'relationship_manager';
   
   -- Now test queries
   SELECT * FROM clients; -- Should only see assigned clients
   ```

3. **Check policy execution**:
   ```sql
   -- See which policies apply
   EXPLAIN SELECT * FROM clients;
   ```

---

## Future Migration to Supabase Auth

When migrating to Supabase Auth:

1. **Replace helper functions:**
   - Change `get_current_user_id()` to use `auth.uid()`
   - Change `get_current_user_role()` to read from `auth.users` table

2. **Update policies:**
   - Policies will automatically work with `auth.uid()`
   - No policy changes needed (they're designed to be compatible)

3. **Add user metadata:**
   - Store user role in `auth.users.raw_user_meta_data.role`
   - Or create a mapping table: `auth_user_roles(user_id, role)`

---

## Security Considerations

### ✅ What's Protected
- Direct database access (when not using service role)
- Frontend Supabase client calls (when using anon key)
- Future API integrations using anon key

### ⚠️ Current Limitations
- Service role key bypasses all RLS (by design)
- Backend API routes using service role are not restricted by RLS
- Need application-level security in backend code

### 🔒 Recommended Next Steps

1. **Backend Security:**
   - Verify `req.session.userId` matches data being accessed
   - Add checks in API routes: `client.assigned_to === req.session.userId`
   - This provides defense in depth

2. **Frontend Security:**
   - If using Supabase client directly, use anon key (RLS will apply)
   - Always verify user permissions in UI

3. **Audit Logging:**
   - Consider adding audit logs for sensitive operations
   - Track who accessed/modified what data

---

## Policy Maintenance

### Adding New Tables
When adding new tables, create RLS policies following this pattern:

```sql
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rm_select_own_data"
ON new_table FOR SELECT
USING (
  user_id = get_current_user_id()
  OR is_admin()
  OR (is_supervisor() AND user_id = ANY(get_team_user_ids()))
);
```

### Modifying Policies
To modify existing policies:

```sql
-- Drop old policy
DROP POLICY "policy_name" ON table_name;

-- Create new policy
CREATE POLICY "new_policy_name"
ON table_name FOR SELECT
USING (new_condition);
```

---

## Troubleshooting

### Issue: "Policy violation" errors
- **Cause:** Using anon key without proper user context
- **Solution:** Ensure user is authenticated and context is set

### Issue: Policies not working
- **Cause:** Using service role key (bypasses RLS)
- **Solution:** Use anon key for frontend or authenticated requests

### Issue: Can't see any data
- **Cause:** Helper functions returning NULL
- **Solution:** Set user context: `SET app.current_user_id = <user_id>`

---

## Summary

✅ **All 30 tables have RLS enabled**
✅ **Policies implement role-based access control**
✅ **Ready for Supabase Auth migration**
✅ **Currently bypassed by service role (expected behavior)**

The RLS policies provide a security foundation that will activate when:
- Frontend uses Supabase client with anon key
- You migrate to Supabase Auth
- You want to restrict direct database access

For now, continue using service role key in backend with application-level security checks.

