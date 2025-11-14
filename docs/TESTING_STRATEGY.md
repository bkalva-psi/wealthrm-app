# Comprehensive Testing Strategy

## Overview
This document outlines the testing strategy for the WealthRM application, organized by module with assigned test agents.

## Test Infrastructure

### Tools & Frameworks
- **Unit/Integration Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright (to be configured)
- **Test Runner**: `npm test` (Vitest)
- **Coverage**: `npm run test:coverage`

### Test Organization
Tests are organized by module with clear ownership:
- **Agent A**: Order Management Module
- **Agent B**: Client 360 Module (Clients, Portfolio, Interactions, etc.)
- **Agent C**: Auth & Navigation Module
- **Agent D**: Knowledge & Risk Profiling Module

## Module Test Ownership

### Agent A: Order Management Module
**Scope:**
- Product selection and cart management
- Order submission workflow
- Order book and viewing
- Full Switch/Redemption flows
- Document viewing
- Order authorization

**Test Files:**
- `client/src/pages/order-management/__tests__/`
- `server/services/__tests__/order-service.test.ts`
- `server/services/__tests__/validation-engine.test.ts`

### Agent B: Client 360 Module
**Scope:**
- Client list and search
- Client detail pages (Personal, Portfolio, Interactions, Transactions, Communications, Appointments, Tasks, Insights)
- Prospect management
- Client actions and workflows

**Test Files:**
- `client/src/pages/clients/__tests__/`
- `client/src/pages/client-*/__tests__/`
- `server/routes/__tests__/clients.test.ts`

### Agent C: Auth & Navigation Module
**Scope:**
- Authentication (login/logout)
- Route navigation (hash-based routing)
- Sidebar and mobile navigation
- Dashboard
- Settings and Profile

**Test Files:**
- `client/src/context/__tests__/auth-context.test.tsx`
- `client/src/App.test.tsx`
- `client/src/components/layout/__tests__/`

### Agent D: Knowledge & Risk Profiling Module
**Scope:**
- Knowledge Profiling assessment
- Risk Profiling assessment
- Score calculation
- Category determination

**Test Files:**
- `client/src/pages/knowledge-profiling/__tests__/`
- `client/src/pages/risk-profiling/__tests__/`
- `server/utils/__tests__/risk-category-calculator.test.ts`

## Test Types

### 1. Unit Tests
- Test individual components/functions in isolation
- Mock dependencies
- Fast execution
- Target: 80%+ coverage per module

### 2. Integration Tests
- Test component interactions
- Test API endpoints with database
- Test service layer integrations

### 3. E2E Tests
- Test complete user workflows
- Test cross-module interactions
- Browser automation

## Test Execution Strategy

### Running Tests by Module

```bash
# Run all tests
npm test

# Run Order Management tests (Agent A)
npm test -- order-management

# Run Client module tests (Agent B)
npm test -- clients

# Run Auth tests (Agent C)
npm test -- auth

# Run Profiling tests (Agent D)
npm test -- profiling

# Run with coverage
npm run test:coverage
```

### Parallel Test Execution
Each agent can run their module tests independently:
- Agent A: `npm test -- order-management --reporter=verbose`
- Agent B: `npm test -- clients --reporter=verbose`
- Agent C: `npm test -- auth --reporter=verbose`
- Agent D: `npm test -- profiling --reporter=verbose`

## Test Data Management

### Mock Data
- Use consistent mock data across tests
- Mock API responses for frontend tests
- Use test database for backend tests

### Test Fixtures
- Create reusable test fixtures
- Store in `__tests__/fixtures/` directories

## Coverage Goals

- **Overall Coverage**: 75%+
- **Critical Paths**: 90%+
- **Order Management**: 85%+ (high priority)
- **Client Module**: 80%+
- **Auth Module**: 90%+ (security critical)

## Continuous Integration

### Pre-commit Checks
- Type checking: `npm run check`
- Linting: (configure ESLint)
- Unit tests: `npm test -- --run`

### CI Pipeline
1. Install dependencies
2. Type check
3. Lint
4. Run unit tests
5. Run integration tests
6. Generate coverage report
7. Run E2E tests (on merge to main)

## Manual Testing Checklist

See `MANUAL_TEST_CHECKLIST.md` for comprehensive manual testing procedures.

## Bug Tracking

### Priority Levels
- **P0 (Critical)**: Blocks core functionality
- **P1 (High)**: Major feature broken
- **P2 (Medium)**: Minor feature issue
- **P3 (Low)**: UI/UX polish

### Bug Lifecycle
1. Test agent identifies bug
2. Create issue with module tag
3. Assign to appropriate developer
4. Fix and verify
5. Update test cases if needed

## Test Maintenance

### Regular Updates
- Update tests when features change
- Review and update test data quarterly
- Refactor tests for maintainability

### Test Review Process
- Code review includes test review
- Ensure tests are meaningful and not flaky
- Maintain test documentation

