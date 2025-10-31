# Repository Setup Checklist

Follow these steps to complete the repository setup for team collaboration.

## ✅ Step 1: Review and Commit Current Changes

You have 225 commits ahead of origin/main. Let's commit current changes:

```bash
# 1. Review what will be committed
git status

# 2. Stage all changes (or stage specific files)
git add .

# 3. Commit with a descriptive message
git commit -m "feat: migrate to Supabase and add financial profiling features"

# 4. Push to GitHub
git push origin main
```

## ✅ Step 2: Set Up Branch Protection Rules on GitHub

1. Go to your repository: https://github.com/bkalva-psi/wealthrm-app
2. Navigate to: **Settings** → **Branches**
3. Under **Branch protection rules**, click **Add branch protection rule**
4. Configure:
   - **Branch name pattern:** `main`
   - **Protect matching branches:** ✅
   
   Enable these settings:
   - ✅ **Require a pull request before merging**
     - ☑️ Require approvals: **1** (or more)
     - ☑️ Dismiss stale pull request approvals when new commits are pushed
     - ☑️ Require review from Code Owners (if you set up CODEOWNERS)
   
   - ✅ **Require status checks to pass before merging** (optional, for CI/CD)
   
   - ✅ **Require conversation resolution before merging**
   
   - ✅ **Do not allow bypassing the above settings**
     - ☑️ **Include administrators** ← IMPORTANT: This ensures even you must use PRs

5. Click **Create** or **Save changes**

## ✅ Step 3: Add PR Template to Repository

1. On GitHub, go to: **Settings** → **General** → Scroll to **Pull request templates**
2. Click **Set up templates** → **Create**
3. Name the file: `pull_request_template.md`
4. Copy the contents from `PR-TEMPLATE.md` (created in your repo)
5. Commit to the repository

**OR** manually create the file:
- Go to your repo on GitHub
- Click **Add file** → **Create new file**
- Path: `.github/pull_request_template.md`
- Copy contents from `PR-TEMPLATE.md`
- Commit

## ✅ Step 4: Invite Team Members

1. Go to **Settings** → **Collaborators** (or **Manage access**)
2. Click **Add people**
3. Enter GitHub usernames or emails of team members
4. Select permission level: **Write** (allows them to push branches and create PRs, but not merge to main if protection is enabled)
5. Team members will receive email invitations

## ✅ Step 5: Share Documentation with Team

Share these files with your team:
- `TEAM-GIT-WORKFLOW.md` - Complete workflow guide
- `PR-TEMPLATE.md` - PR template (if not added to .github folder)
- `README.md` - Project overview
- `.env.example` (if you create one) - Template for environment variables

## ✅ Step 6: Create .env.example (Recommended)

Create a template file for environment variables:

```bash
# .env.example
# Copy this file to .env and fill in your actual values
# NEVER commit .env files!

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Node Environment
NODE_ENV=development

# Server Configuration
PORT=5000
```

## ✅ Step 7: Test the Workflow (Optional but Recommended)

1. Create a test branch:
   ```bash
   git checkout -b test/pr-workflow
   ```

2. Make a small change (e.g., update README.md)

3. Commit and push:
   ```bash
   git add README.md
   git commit -m "test: verify PR workflow"
   git push origin test/pr-workflow
   ```

4. Create a PR on GitHub and test the review/merge process

5. Delete the test branch after merging

## ✅ Step 8: Set Up Code Owners (Optional but Recommended)

Create `.github/CODEOWNERS` file to auto-assign reviewers:

```
# Default owners
* @vinaykumarvk

# Specific paths
/server/ @vinaykumarvk
/client/ @vinaykumarvk
/shared/ @vinaykumarvk
```

## Verification Checklist

- [ ] Branch protection rules enabled for `main`
- [ ] PR template added to repository
- [ ] Team members invited with appropriate permissions
- [ ] `.gitignore` includes `.env` files
- [ ] `.env.example` created (optional but recommended)
- [ ] `TEAM-GIT-WORKFLOW.md` shared with team
- [ ] Test PR workflow verified
- [ ] Current changes committed and pushed

## Quick Links

- **Repository:** https://github.com/bkalva-psi/wealthrm-app
- **Settings:** https://github.com/bkalva-psi/wealthrm-app/settings
- **Branches:** https://github.com/bkalva-psi/wealthrm-app/settings/branches
- **Collaborators:** https://github.com/bkalva-psi/wealthrm-app/settings/access

---

**Note:** Once branch protection is enabled, no one (including you) can push directly to `main`. All changes must go through Pull Requests! 🚀

