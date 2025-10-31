# New Repository Setup Guide for bkalva-psi

This guide will help you create a new repository under your GitHub account and push the code there.

## Step 1: Create New Repository on GitHub

1. **Go to GitHub:** https://github.com/new
2. **Repository details:**
   - **Owner:** Select `bkalva-psi` (your account)
   - **Repository name:** Choose a name (e.g., `wealthrm-app`, `wealth-rm-app-primesoft`)
   - **Description:** "Wealth Management Relationship Manager Application"
   - **Visibility:** 
     - Choose **Private** (recommended for business applications)
     - OR **Public** (if you want it public)
   - **DO NOT** initialize with:
     - ❌ README
     - ❌ .gitignore
     - ❌ license
   
   (We already have all these files)

3. Click **"Create repository"**

4. **Copy the repository URL** that GitHub shows (will be something like):
   ```
   https://github.com/bkalva-psi/wealthrm-app.git
   ```

## Step 2: Update Git Remote to Your New Repository

Once you have your new repository URL, run these commands:

```bash
# Remove the old remote
git remote remove origin

# Add your new repository as origin
git remote add origin https://github.com/bkalva-psi/wealthrm-app.git

# Verify the remote is set correctly
git remote -v
```

**You should see:**
```
origin  https://github.com/bkalva-psi/YOUR-REPO-NAME.git (fetch)
origin  https://github.com/bkalva-psi/YOUR-REPO-NAME.git (push)
```

## Step 3: Commit and Push All Current Changes

Before pushing, let's commit all your current work:

```bash
# Check what files need to be committed
git status

# Stage all changes (including new files)
git add .

# Commit with a descriptive message
git commit -m "Initial commit: WealthRM App with Supabase integration and financial profiling"

# Push to your new repository
# Note: Since this is a new repo, use -u to set upstream
git push -u origin main
```

If you get an error about the branch name, try:
```bash
# Check your current branch name
git branch

# If it's 'master' instead of 'main', rename it:
git branch -M main

# Then push
git push -u origin main
```

## Step 4: Verify Push Was Successful

1. Go to your new repository on GitHub
2. You should see all your files there
3. Check that the commit history is intact

## Step 5: Update Documentation Files

After setting up the new repository, update these files with the new repository URL:
- `TEAM-GIT-WORKFLOW.md` - Update the repository URL
- `REPOSITORY-SETUP-CHECKLIST.md` - Update the repository URL

## Step 6: Set Up Branch Protection Rules

1. Go to your repository: `https://github.com/bkalva-psi/YOUR-REPO-NAME`
2. Navigate to: **Settings** → **Branches**
3. Click **Add branch protection rule**
4. **Branch name pattern:** `main`
5. Enable:
   - ✅ **Require a pull request before merging**
     - ☑️ Require approvals: **1**
     - ☑️ Dismiss stale pull request approvals when new commits are pushed
   - ✅ **Require conversation resolution before merging**
   - ✅ **Do not allow bypassing the above settings**
     - ☑️ **Include administrators** (this ensures even you must use PRs)
6. Click **Create**

## Step 7: Add Team Members as Collaborators

1. Go to: **Settings** → **Collaborators** (or **Manage access**)
2. Click **Add people**
3. Enter GitHub usernames or emails of your team members
4. Permission level: **Write** (allows creating branches and PRs, but not merging to main)
5. Team members will receive email invitations

## Step 8: Add PR Template (Optional but Recommended)

1. Go to your repository on GitHub
2. Click **Add file** → **Create new file**
3. Path: `.github/pull_request_template.md`
4. Copy contents from `PR-TEMPLATE.md` (already in your repo)
5. Commit the file

## Troubleshooting

### If you get "repository not found" error:
- Make sure you've created the repository on GitHub first
- Check that the repository URL is correct
- Verify you're logged into GitHub with the correct account (bkalva-psi)

### If you get authentication errors:
```bash
# You may need to authenticate. Options:

# Option 1: Use GitHub CLI (if installed)
gh auth login

# Option 2: Use Personal Access Token
# GitHub will prompt for username and password
# Use a Personal Access Token as password (not your actual password)
# Generate token: GitHub → Settings → Developer settings → Personal access tokens
```

### If you want to keep both remotes:
```bash
# Keep old remote as 'upstream'
git remote rename origin upstream

# Add new remote as 'origin'
git remote add origin https://github.com/bkalva-psi/YOUR-REPO-NAME.git

# Push to your new repository
git push -u origin main
```

---

**Your new repository will be ready for team collaboration once you complete these steps!** 🚀

