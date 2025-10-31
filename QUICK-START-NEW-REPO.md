# Quick Start: Create New Repository

## 🚀 Fast Track (After creating repo on GitHub)

Replace `YOUR-REPO-NAME` with your actual repository name:

```bash
# 1. Remove old remote
git remote remove origin

# 2. Add your new repository
git remote add origin https://github.com/bkalva-psi/YOUR-REPO-NAME.git

# 3. Verify
git remote -v

# 4. Commit current changes
git add .
git commit -m "Initial commit: WealthRM App with Supabase integration"

# 5. Push to new repository
git push -u origin main
```

## 📋 Next Steps (After Push)

1. **Set branch protection:** Settings → Branches → Protect `main` branch
2. **Add collaborators:** Settings → Collaborators → Add team members
3. **Share documentation:** Send `TEAM-GIT-WORKFLOW.md` to your team

---

**Need detailed instructions?** See `NEW-REPOSITORY-SETUP.md`

