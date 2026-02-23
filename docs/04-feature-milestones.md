# Feature Milestones

**Document:** 04-feature-milestones.md  
**Purpose:** Define build order and dependencies between features

---

## Overview

Phase 0 consists of 7 feature milestones. They must be built in a specific order due to dependencies.

This document defines:
- What each milestone delivers
- What it depends on
- What it enables
- Acceptance criteria

---

## Dependency Graph

```
                    ┌─────────────────┐
                    │   M0: Project   │
                    │     Setup       │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
     │ M1: Shared  │ │ M2: Data    │ │ M3: UI      │
     │   Types     │ │   Layer     │ │   Shell     │
     └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
            │               │               │
            └───────────────┼───────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  M4: Bean       │
                   │  Library        │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  M5: Shot       │
                   │  Logging        │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  M6: Guidance   │
                   │  Engine         │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  M7: Polish &   │
                   │  PWA            │
                   └─────────────────┘
```

---

## M0: Project Setup

**Goal:** Establish the development environment and CI pipeline.

### Deliverables

- [ ] Vite + React + TypeScript project initialized
- [ ] Tailwind CSS configured
- [ ] ESLint + Prettier configured with rules
- [ ] Vitest configured with React Testing Library
- [ ] GitHub repository created
- [ ] GitHub Actions CI pipeline (lint → typecheck → test → build)
- [ ] Basic README with setup instructions
- [ ] `.gitignore` properly configured
- [ ] Project structure created (empty folders per 02-tech-stack.md)

### Acceptance Criteria

1. `npm run dev` starts development server
2. `npm run build` produces production build
3. `npm run test` runs test suite
4. `npm run lint` checks code style
5. Pushing to GitHub triggers CI pipeline
6. Empty test file passes

### Dependencies

None (this is the root)

### Enables

All other milestones

### Estimated Effort

Small (1-2 hours for experienced dev, half day with AI assistance)

---

## M1: Shared Types

**Goal:** Define all TypeScript types and interfaces used across the application.

### Deliverables

- [ ] `/src/types/bean.ts` – Bean and DialedRecipe interfaces
- [ ] `/src/types/shot.ts` – Shot and TasteFeedback interfaces
- [ ] `/src/types/guidance.ts` – GuidanceSuggestion and GuidanceInput interfaces
- [ ] `/src/types/forms.ts` – Form input types
- [ ] `/src/types/export.ts` – DataExport interface
- [ ] `/src/types/index.ts` – Barrel export
- [ ] `/src/utils/id.ts` – UUID generation utility
- [ ] Unit tests for any utility functions

### Acceptance Criteria

1. All types from 03-data-models.md are implemented
2. Types compile without errors
3. No use of `any` type
4. Barrel export works (`import { Bean, Shot } from '@/types'`)
5. ID generation produces valid UUIDs

### Dependencies

- M0: Project Setup

### Enables

- M2: Data Layer
- M4: Bean Library
- M5: Shot Logging
- M6: Guidance Engine

### Estimated Effort

Small (mostly typing, little logic)

### Files Owned

```
/src/types/*
/src/utils/id.ts
```

---

## M2: Data Layer

**Goal:** Implement local database with CRUD operations.

### Deliverables

- [ ] Dexie database setup (`/src/db/database.ts`)
- [ ] Bean repository with CRUD operations (`/src/db/beanRepository.ts`)
- [ ] Shot repository with CRUD operations (`/src/db/shotRepository.ts`)
- [ ] Data export utility (`/src/utils/export.ts`)
- [ ] Sample data for development (`/src/db/sampleData.ts`)
- [ ] Comprehensive unit tests for all repository methods
- [ ] Integration tests for cross-entity operations

### Acceptance Criteria

1. Can create, read, update, delete beans
2. Can create, read, update, delete shots
3. Fetching shots by beanId returns correct shots
4. Marking a shot as "dialed" updates the parent bean's dialedRecipe
5. Export produces valid JSON matching DataExport type
6. All operations handle errors gracefully
7. 90%+ test coverage on repository functions

### Dependencies

- M0: Project Setup
- M1: Shared Types

### Enables

- M4: Bean Library
- M5: Shot Logging

### Estimated Effort

Medium (database setup, multiple CRUD operations, testing)

### Files Owned

```
/src/db/*
/src/utils/export.ts
```

### Key Functions to Implement

```typescript
// beanRepository.ts
getAllBeans(): Promise<Bean[]>
getBeanById(id: string): Promise<Bean | undefined>
createBean(input: CreateBeanInput): Promise<Bean>
updateBean(input: UpdateBeanInput): Promise<Bean>
deleteBean(id: string): Promise<void>
markBeanAsDialed(beanId: string, shotId: string): Promise<Bean>

// shotRepository.ts
getShotsForBean(beanId: string): Promise<Shot[]>
getShotById(id: string): Promise<Shot | undefined>
createShot(input: CreateShotInput): Promise<Shot>
updateShot(id: string, updates: Partial<Shot>): Promise<Shot>
deleteShot(id: string): Promise<void>
markShotAsDialed(shotId: string): Promise<Shot>
```

---

## M3: UI Shell

**Goal:** Create the app skeleton with navigation and shared components.

### Deliverables

- [ ] App layout component with header
- [ ] Bottom navigation bar (Library, Add Bean, Settings)
- [ ] React Router setup with routes
- [ ] Page placeholder components
- [ ] Shared UI components:
  - [ ] Button (primary, secondary variants)
  - [ ] Input (text, number variants)
  - [ ] Card (for bean cards)
  - [ ] Slider (for taste feedback)
  - [ ] Modal (for confirmations)
  - [ ] Empty state component
- [ ] Basic responsive layout (mobile-first)
- [ ] Loading and error state components
- [ ] Component unit tests

### Acceptance Criteria

1. Navigation between pages works
2. Layout renders correctly on mobile viewport (375px)
3. All shared components render without errors
4. Components accept and apply Tailwind classes
5. Slider component returns correct values (-2 to +2)
6. Visual consistency across components

### Dependencies

- M0: Project Setup

### Enables

- M4: Bean Library
- M5: Shot Logging

### Estimated Effort

Medium (multiple components, styling, routing)

### Files Owned

```
/src/components/shared/*
/src/pages/* (placeholders only)
/src/App.tsx
```

### Route Structure

| Path | Page | Description |
|------|------|-------------|
| `/` | Library | Bean library (home) |
| `/bean/new` | NewBean | Add new bean form |
| `/bean/:id` | BeanDetail | Bean detail + shot log |
| `/bean/:id/shot` | LogShot | Log new shot form |
| `/settings` | Settings | Export, about |

---

## M4: Bean Library

**Goal:** Implement the bean library feature end-to-end.

### Deliverables

- [ ] Bean library page (list of all beans)
- [ ] Bean card component showing:
  - [ ] Name and roaster
  - [ ] Dialed status indicator
  - [ ] Rating (if set)
  - [ ] Recipe summary (if dialed)
- [ ] Add new bean form
- [ ] Bean detail page showing:
  - [ ] Bean info
  - [ ] Dialed recipe (prominent if exists)
  - [ ] "Start from last recipe" / "Dial fresh" options
  - [ ] Shot log (list view)
- [ ] Edit bean functionality
- [ ] Delete bean (with confirmation)
- [ ] Empty state when no beans
- [ ] Zustand store for bean state
- [ ] Integration tests for user flows

### Acceptance Criteria

1. Can add a new bean and see it in library
2. Can tap a bean to see detail page
3. Dialed beans show recipe prominently
4. Can edit bean name, roaster, notes, rating
5. Can delete bean (confirmation required)
6. Deleting a bean deletes associated shots
7. Empty library shows helpful empty state
8. Library sorts by most recently updated

### Dependencies

- M1: Shared Types
- M2: Data Layer
- M3: UI Shell

### Enables

- M5: Shot Logging

### Estimated Effort

Large (multiple pages, CRUD UI, state management)

### Files Owned

```
/src/components/bean/*
/src/pages/Library.tsx
/src/pages/NewBean.tsx
/src/pages/BeanDetail.tsx
/src/stores/beanStore.ts
```

---

## M5: Shot Logging

**Goal:** Implement shot logging and dial-in flow.

### Deliverables

- [ ] Log shot page with form:
  - [ ] Dose input (grams)
  - [ ] Yield input (grams)
  - [ ] Time input (seconds)
  - [ ] Grind setting input (optional)
  - [ ] Taste slider (-2 to +2)
  - [ ] Notes input (optional)
  - [ ] Auto-calculated ratio display
- [ ] Shot comparison view (current vs previous)
- [ ] Shot list component in bean detail
- [ ] "Mark as Dialed" action
- [ ] Confirmation when marking as dialed
- [ ] Shot number auto-increments
- [ ] Zustand store for shot state
- [ ] Pre-fill from previous shot option
- [ ] Integration tests for dial-in flow

### Acceptance Criteria

1. Can log a new shot for a bean
2. Ratio calculates correctly and displays
3. After logging, user sees comparison with previous shot
4. Can mark any shot as "dialed"
5. Marking as dialed updates bean's dialedRecipe
6. Shot list shows all shots in order
7. Shot numbers increment correctly
8. Form validates inputs (dose > 0, etc.)
9. Previous shot values available as reference

### Dependencies

- M1: Shared Types
- M2: Data Layer
- M3: UI Shell
- M4: Bean Library

### Enables

- M6: Guidance Engine

### Estimated Effort

Large (form logic, comparison views, state updates)

### Files Owned

```
/src/components/shot/*
/src/pages/LogShot.tsx
/src/stores/shotStore.ts
/src/utils/calculations.ts
```

### Key Calculations

```typescript
// calculations.ts
function calculateRatio(doseGrams: number, yieldGrams: number): number {
  return Math.round((yieldGrams / doseGrams) * 100) / 100;
}

function formatTime(seconds: number): string {
  // Returns "0:28" format
}

function formatRatio(ratio: number): string {
  // Returns "1:2.2" format
}
```

---

## M6: Guidance Engine

**Goal:** Implement rule-based suggestions after each shot.

### Deliverables

- [ ] Guidance engine core logic (`/src/utils/guidance.ts`)
- [ ] Guidance display component
- [ ] Integration into shot logging flow
- [ ] Rules implemented:
  - [ ] Sour + fast → Grind finer
  - [ ] Sour + normal time → Grind slightly finer or increase yield
  - [ ] Bitter + slow → Grind coarser
  - [ ] Bitter + normal time → Grind slightly coarser or decrease yield
  - [ ] Balanced → Encourage to lock it in
- [ ] Transparent reasoning display ("Based on: sour taste, 22s extraction")
- [ ] Unit tests for all rule paths
- [ ] Edge case handling (first shot, no previous data)

### Acceptance Criteria

1. After logging a shot, guidance appears
2. Guidance matches the rule set
3. Reasoning is visible to user
4. Guidance shows confidence level
5. First shot gives appropriate starter guidance
6. All rule branches have test coverage
7. Guidance never crashes on edge cases

### Dependencies

- M1: Shared Types
- M5: Shot Logging

### Enables

- M7: Polish & PWA

### Estimated Effort

Medium (logic implementation, UI component)

### Files Owned

```
/src/utils/guidance.ts
/src/components/guidance/*
```

### Rule Engine Pseudocode

```typescript
function generateGuidance(input: GuidanceInput): GuidanceSuggestion {
  const { currentShot, previousShot } = input;
  const { balance } = currentShot.taste;
  const time = currentShot.timeSeconds;
  
  // Define time thresholds
  const FAST = 22;
  const SLOW = 35;
  
  // Sour (under-extracted)
  if (balance < 0) {
    if (time < FAST) {
      return {
        action: 'grind-finer',
        message: 'Try grinding finer',
        confidence: 'high',
        reasoning: `Shot was sour and ran fast (${time}s). Finer grind will slow extraction and reduce sourness.`
      };
    }
    // ... more rules
  }
  
  // Bitter (over-extracted)
  if (balance > 0) {
    // ... rules
  }
  
  // Balanced
  if (balance === 0) {
    return {
      action: 'none',
      message: 'This looks dialed in!',
      confidence: 'high',
      reasoning: 'Taste is balanced. Consider marking this as your dialed recipe.'
    };
  }
}
```

---

## M7: Polish & PWA

**Goal:** Finalize the app for beta testing.

### Deliverables

- [ ] PWA manifest configured
- [ ] Service worker for offline support
- [ ] App icons (all required sizes)
- [ ] Splash screen configuration
- [ ] iOS-specific meta tags
- [ ] Settings page:
  - [ ] Export data button
  - [ ] About/version info
  - [ ] Clear all data (with confirmation)
- [ ] Final UI polish pass
- [ ] Performance optimization
- [ ] Lighthouse audit (target: 90+ all categories)
- [ ] Bug fixes from integration testing
- [ ] README updated with deployment instructions

### Acceptance Criteria

1. App installable on iOS via "Add to Home Screen"
2. App works fully offline after first load
3. Icons display correctly on home screen
4. Export produces downloadable JSON file
5. Lighthouse Performance > 90
6. Lighthouse PWA > 90
7. No console errors in production build
8. All previous acceptance criteria still pass

### Dependencies

- All previous milestones

### Enables

- Beta deployment

### Estimated Effort

Medium (configuration, testing, polish)

### Files Owned

```
/public/manifest.json
/public/icons/*
/src/pages/Settings.tsx
/vite.config.ts (PWA plugin config)
```

---

## Milestone Summary Table

| Milestone | Name | Effort | Dependencies | Can Parallelize? |
|-----------|------|--------|--------------|------------------|
| M0 | Project Setup | Small | None | No (must be first) |
| M1 | Shared Types | Small | M0 | Yes (with M3) |
| M2 | Data Layer | Medium | M0, M1 | Yes (with M3) |
| M3 | UI Shell | Medium | M0 | Yes (with M1, M2) |
| M4 | Bean Library | Large | M1, M2, M3 | No |
| M5 | Shot Logging | Large | M4 | No |
| M6 | Guidance Engine | Medium | M1, M5 | No |
| M7 | Polish & PWA | Medium | All | No |

---

## Parallelization Opportunities

After M0 is complete:

**Parallel Track A:** M1 (Types) → M2 (Data Layer)  
**Parallel Track B:** M3 (UI Shell)

These can be worked on simultaneously by different AI agents because:
- M1/M2 owns `/src/types/`, `/src/db/`, `/src/utils/`
- M3 owns `/src/components/shared/`, `/src/App.tsx`

No file overlap = safe parallelization.

After M1, M2, M3 converge, the remaining milestones are sequential.
