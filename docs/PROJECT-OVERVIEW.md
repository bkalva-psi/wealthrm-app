# WealthRM App - Project Overview

## Repository Information

**GitHub Repository:** https://github.com/bkalva-psi/wealthrm-app.git  
**Organization:** bkalva-psi

## Project Status

✅ **Production Ready** - Clean codebase with organized documentation

## Recent Updates

### Project Cleanup (Latest)
- ✅ Removed unnecessary files (cookies, old migration docs, test files)
- ✅ Organized all documentation into `docs/` folder
- ✅ Updated README with current technology stack
- ✅ Enhanced .gitignore to exclude development assets
- ✅ Project structure optimized for stakeholder review

### Database Migration
- ✅ Successfully migrated from Neon to Supabase
- ✅ Implemented Row-Level Security (RLS) policies for all 30 tables
- ✅ Complete database schema documented in DBML format

### Features Implemented
- ✅ Client profile management with draft system
- ✅ Financial profiling with comprehensive data tracking
- ✅ Profile completion tracking
- ✅ Financial summary charts (Asset Allocation, Cashflow, Net Worth)
- ✅ Role-based access control (RM, Supervisor, Admin)

## Project Structure

```
wealthrm-app/
├── client/              # React frontend application
├── server/              # Express.js backend API
├── shared/              # Shared schemas and types
├── scripts/             # Database utilities and seeding
├── docs/                # Project documentation
│   ├── database-schema.dbml
│   ├── RLS-POLICIES.md
│   ├── TEAM-WORKFLOW.md
│   ├── TEAM-SETUP.md
│   ├── PR-TEMPLATE.md
│   └── CONTRIBUTING.md
├── documents/           # Business requirement documents
├── README.md            # Main project documentation
└── package.json         # Project dependencies
```

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Express.js, TypeScript
- **Database:** Supabase (PostgreSQL)
- **ORM:** Drizzle ORM
- **SDK:** Supabase JS SDK
- **Charts:** Recharts
- **State Management:** TanStack Query v5

## Documentation

All project documentation is available in the `docs/` folder:

1. **database-schema.dbml** - Complete database schema visualization
2. **RLS-POLICIES.md** - Row-Level Security policies documentation
3. **TEAM-WORKFLOW.md** - Git workflow for team collaboration
4. **TEAM-SETUP.md** - Team setup and onboarding guide
5. **PR-TEMPLATE.md** - Pull request template
6. **CONTRIBUTING.md** - Contribution guidelines

## Security

- ✅ Row-Level Security (RLS) enabled on all tables
- ✅ Role-based access control implemented
- ✅ Service role key used securely in backend
- ✅ Environment variables properly configured
- ✅ Sensitive data excluded from repository

## Next Steps for Stakeholders

1. Review the README.md for project overview
2. Check docs/database-schema.dbml for database structure
3. Review docs/RLS-POLICIES.md for security implementation
4. Examine code structure in client/ and server/ directories
5. Refer to documents/ folder for business requirements

## Contact & Support

For questions or issues, refer to:
- README.md for setup instructions
- docs/TEAM-WORKFLOW.md for development workflow
- docs/CONTRIBUTING.md for contribution guidelines

---

**Last Updated:** January 2025  
**Repository:** https://github.com/bkalva-psi/wealthrm-app

