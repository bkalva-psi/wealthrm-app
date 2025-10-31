# Team Git Workflow Guide

This document outlines the Git workflow for the WealthRM App project, ensuring code quality through Pull Request reviews.

## Repository Setup

**Repository URL:** `https://github.com/bkalva-psi/wealthrm-app.git`

**Owner:** bkalva-psi

## Branch Protection Rules (To be set by Owner)

The owner needs to configure the following branch protection rules on GitHub:

1. Go to: **Settings → Branches → Add branch protection rule**
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1 reviewer minimum - the owner)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings
   - ✅ Include administrators (even the owner must follow the process)

## Workflow for Team Members

### 1. Initial Setup (One-time)

```bash
# Clone the repository
git clone https://github.com/bkalva-psi/wealthrm-app.git
cd wealthrm-app

# Install dependencies
npm install

# Create your .env file (copy from .env.example if provided, or ask owner)
# NEVER commit .env files!

# Verify you're on main branch
git checkout main
```

### 2. Daily Workflow

#### Step 1: Get Latest Changes
```bash
# Always start by pulling latest changes from main
git checkout main
git pull origin main
```

#### Step 2: Create a Feature Branch
```bash
# Create and switch to a new branch for your feature/fix
# Use descriptive branch names
git checkout -b feature/your-feature-name
# OR
git checkout -b fix/bug-description
# OR
git checkout -b refactor/component-name

# Examples:
# git checkout -b feature/client-dashboard-improvements
# git checkout -b fix/login-authentication-issue
# git checkout -b refactor/financial-profile-form
```

#### Step 3: Make Your Changes
- Write your code
- Test your changes locally
- Follow the project's coding standards
- Update documentation if needed

#### Step 4: Stage and Commit Changes
```bash
# Check what files you've changed
git status

# Stage specific files (recommended)
git add path/to/file1.ts
git add path/to/file2.tsx

# OR stage all changes (use carefully)
git add .

# Commit with a clear message
git commit -m "feat: add client filtering functionality"
# OR
git commit -m "fix: resolve calculation error in financial profile"
# OR
git commit -m "refactor: improve code organization in dashboard"

# Commit message format:
# - feat: new feature
# - fix: bug fix
# - refactor: code restructuring
# - docs: documentation changes
# - style: formatting, missing semicolons, etc.
# - test: adding tests
# - chore: maintenance tasks
```

#### Step 5: Push Your Branch
```bash
# Push your branch to GitHub
git push origin feature/your-feature-name

# First time pushing a new branch? Use:
git push -u origin feature/your-feature-name
```

#### Step 6: Create a Pull Request (PR)
1. Go to GitHub repository: `https://github.com/bkalva-psi/wealthrm-app`
2. You'll see a banner suggesting to create a PR for your new branch
3. Click **"Compare & pull request"**
4. Fill in:
   - **Title:** Clear description (e.g., "Add client filtering functionality")
   - **Description:**
     - What changes you made
     - Why you made them
     - How to test
     - Screenshots if UI changes
5. Select reviewers (the owner)
6. Click **"Create pull request"**

#### Step 7: Address Review Comments
- Owner will review your PR
- If changes are requested:
  ```bash
  # Make the requested changes
  git add .
  git commit -m "fix: address review comments"
  git push origin feature/your-feature-name
  ```
- The PR will automatically update with your new commits

#### Step 8: After PR is Merged
```bash
# Switch back to main
git checkout main

# Pull the latest changes (including your merged PR)
git pull origin main

# Delete your local feature branch (optional cleanup)
git branch -d feature/your-feature-name

# Delete remote branch (if GitHub didn't auto-delete)
git push origin --delete feature/your-feature-name
```

## Workflow for Owner/Reviewer

### Reviewing Pull Requests

1. Go to the **Pull Requests** tab on GitHub
2. Click on the PR you want to review
3. Review the code changes in the **Files changed** tab
4. Add comments:
   - **General comments:** Click on a line number, add comment
   - **Approve:** Click **Review changes → Approve**
   - **Request changes:** Click **Review changes → Request changes** (add comments explaining what needs to change)
   - **Comment:** Just add feedback without approval/rejection

### Merging Pull Requests

**Option 1: Merge Commit (Recommended)**
- Preserves full history
- Click **"Merge pull request"**
- Select **"Create a merge commit"**
- Confirm merge

**Option 2: Squash and Merge**
- Combines all commits into one
- Useful for feature branches with many commits
- Select **"Squash and merge"**

**Option 3: Rebase and Merge**
- Linear history
- Select **"Rebase and merge"**

## Important Rules

### ✅ DO:
- Always pull latest `main` before creating a new branch
- Use descriptive branch names
- Write clear commit messages
- Keep PRs focused on one feature/fix
- Test your changes before creating PR
- Respond to review comments promptly
- Keep your branch up-to-date with main if PR is open for long:
  ```bash
  git checkout feature/your-feature-name
  git merge main  # or git rebase main
  git push origin feature/your-feature-name
  ```

### ❌ DON'T:
- Commit directly to `main` branch
- Push `.env` files or secrets
- Force push to `main` (it's protected anyway)
- Create PRs with incomplete/broken code
- Merge your own PRs (let the owner review)
- Push sensitive data (API keys, passwords, tokens)

## Handling Merge Conflicts

If your branch is behind `main` and has conflicts:

```bash
# Update your branch with latest main
git checkout feature/your-feature-name
git fetch origin
git merge origin/main

# If conflicts occur:
# 1. Git will show which files have conflicts
# 2. Open those files and look for conflict markers:
#    <<<<<<< HEAD
#    your changes
#    =======
#    changes from main
#    >>>>>>> origin/main
# 3. Resolve conflicts manually
# 4. Stage resolved files:
git add path/to/resolved/file
# 5. Complete the merge:
git commit -m "merge: resolve conflicts with main"
# 6. Push:
git push origin feature/your-feature-name
```

## Quick Reference Commands

```bash
# Check status
git status

# See branch list
git branch -a

# Switch branches
git checkout branch-name

# See commit history
git log --oneline

# Discard uncommitted changes (CAREFUL!)
git restore path/to/file
git restore .  # all files

# See differences
git diff
git diff path/to/file

# Rename a branch locally
git branch -m old-name new-name

# Rename a branch remotely
git push origin :old-name new-name
git push origin -u new-name
```

## Need Help?

- Check GitHub documentation: https://docs.github.com/en/get-started
- Ask the team in your communication channel
- Review existing PRs as examples

---

**Remember:** Code reviews make the codebase better. Don't take feedback personally - it's about improving the product! 🚀

