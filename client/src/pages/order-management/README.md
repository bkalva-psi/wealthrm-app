# Order Management Module - Phase 1

## Overview
This module implements the RM Office UI for order capture, review, and submission as per BRD v1.0.

## Structure

```
order-management/
├── __tests__/              # Test files
├── components/             # Reusable components
│   ├── product-list.tsx
│   ├── product-cart.tsx
│   ├── transaction-mode.tsx
│   ├── nominee-form.tsx
│   ├── full-switch-redemption-panel.tsx
│   └── overlays/          # Overlay modals
│       ├── scheme-info-overlay.tsx
│       ├── order-info-overlay.tsx
│       ├── documents-overlay.tsx
│       └── deviations-overlay.tsx
├── hooks/                 # Custom hooks
│   ├── use-order-cart.ts
│   └── use-order-form.ts
├── types/                 # TypeScript types
│   └── order.types.ts
├── utils/                 # Utility functions
│   └── order-validations.ts
└── index.tsx              # Main page component
```

## Phase 1 Features

### Parallel Tasks (Can be done simultaneously)
1. ✅ UI Skeletons & Layouts
2. ✅ Product list & cart layout
3. ✅ Overlay modals (Scheme Info, Order Info, Docs, Deviations)
4. ✅ Transaction mode & nominee form
5. ✅ Read-only Full Switch/Redemption panel
6. ✅ Mock API integration

### Sequential Tasks (Dependent on previous)
1. Product Cart interactions (add/remove products, cart summary update)
2. Transaction mode & nominee info binding (user selection → state)
3. Overlay triggers (click product → show scheme info/order info/etc.)

## Testing

Run tests with:
```bash
npm test order-management
```

Test coverage target: 95%+

## Development Guidelines

1. **Test-Driven Development**: Write tests first, then implement
2. **Component Isolation**: Each component should be independently testable
3. **Type Safety**: Use TypeScript strictly
4. **Design System**: Use existing Shadcn UI components and design tokens
5. **Accessibility**: Ensure WCAG AA compliance
6. **Responsive**: Mobile-first approach

## API Integration

Mock APIs are located in:
- `/api/order-management/products` - Product list
- `/api/order-management/branches` - Branch codes
- `/api/order-management/schemes/:id` - Scheme details
- `/api/order-management/documents/:id` - Document list

## Status

- [x] Test cases created
- [ ] Test infrastructure setup
- [ ] Component implementations
- [ ] Mock API setup
- [ ] Integration tests
- [ ] E2E tests

