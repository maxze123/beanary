# Technical Approach

**Document:** 01-technical-approach.md  
**Purpose:** Define how we build, not what we build

---

## Context

This project is developed by a solo technical founder with limited programming experience, augmented by AI coding assistants. Multiple AI agents may work on different features simultaneously.

This creates specific requirements:

1. Code must be readable and well-documented (humans and AI need to understand it)
2. Strong test coverage to catch integration issues
3. Clear boundaries between features to minimize merge conflicts
4. Automated pipelines to validate changes before merge
5. Consistent patterns so any agent can work on any part of the codebase

---

## Development Philosophy

### 1. Test-Driven Development (TDD)

We use TDD not because it's fashionable, but because it solves real problems for our setup:

- **Specification as code:** Tests define what a feature should do before implementation
- **Safe parallel work:** If tests pass, the feature works—regardless of who/what wrote it
- **Refactoring confidence:** We can improve code without fear of breaking things
- **AI alignment:** Giving an AI agent a failing test is clearer than prose descriptions

**TDD Workflow:**

```
1. Write a failing test that describes the desired behavior
2. Write the minimum code to make the test pass
3. Refactor while keeping tests green
4. Commit
```

**Test Types (in order of priority):**

| Type | What it tests | When to write |
|------|---------------|---------------|
| Unit tests | Individual functions, calculations | Every function with logic |
| Integration tests | Components working together | Every feature flow |
| E2E tests | Full user journeys | Critical paths only (MVP) |

**Coverage Target:** 80% for business logic, best-effort for UI components

### 2. Continuous Integration / Continuous Deployment (CI/CD)

Every commit triggers automated checks. Nothing merges to main without passing.

**Pipeline Stages:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Commit    │ ──▶ │    Lint     │ ──▶ │    Test     │ ──▶ │   Build     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                   │                   │
                           ▼                   ▼                   ▼
                      Code style          All tests            Compiles
                      enforced            pass                 successfully
```

**On success:** PR can be merged  
**On failure:** Block merge, fix issues first

**Tools:**
- GitHub Actions for CI pipeline
- Automated linting (ESLint + Prettier)
- Automated test runs
- Build verification

### 3. Branch Strategy

```
main
  │
  ├── feature/bean-library
  │
  ├── feature/shot-logging
  │
  ├── feature/guidance-engine
  │
  └── feature/ui-shell
```

**Rules:**

- `main` is always deployable
- Each feature gets its own branch
- Features branch from and merge back to `main`
- No direct commits to `main`
- PRs require passing CI before merge
- Squash merge to keep history clean

### 4. Code Style & Conventions

Enforced automatically, not by willpower.

**Naming:**
- Components: PascalCase (`BeanLibrary.tsx`)
- Functions: camelCase (`calculateRatio()`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_SHOTS_PER_SESSION`)
- Files: kebab-case for non-components (`date-utils.ts`)

**File Structure:**
- One component per file
- Co-locate tests with source (`BeanCard.tsx` + `BeanCard.test.tsx`)
- Shared utilities in `/src/utils/`
- Types in `/src/types/`

**Comments:**
- Explain *why*, not *what*
- Every exported function needs a JSDoc comment
- Complex logic gets inline explanation

---

## Multi-Agent Workflow

When multiple AI assistants work simultaneously, coordination is critical.

### Feature Isolation

Each agent works on one feature branch. Features are designed with minimal overlap:

| Feature | Owns | Does NOT touch |
|---------|------|----------------|
| Bean Library | Bean CRUD, storage, list view | Shot logging, guidance |
| Shot Logging | Shot entry, shot list | Bean management, guidance |
| Guidance Engine | Suggestion logic, rules | UI components, storage |
| UI Shell | Navigation, layout, shared components | Business logic |

### Shared Dependencies

Some code is shared across features. This requires extra care:

**Shared types** (`/src/types/`)
- Define types FIRST, before feature work begins
- Changes to shared types require full test suite run
- Avoid changing shared types mid-sprint if possible

**Shared utilities** (`/src/utils/`)
- Pure functions only (no side effects)
- 100% test coverage required
- Document inputs/outputs clearly

**Shared components** (`/src/components/shared/`)
- Generic, reusable UI elements
- No business logic inside
- Prop-driven behavior

### Agent Handoff Protocol

When handing work to an AI coding assistant:

1. **Point to the spec:** Reference the specific feature doc
2. **Point to the types:** Show the relevant type definitions
3. **Provide the test file:** Either existing tests to make pass, or ask for tests first
4. **Define boundaries:** Explicitly state what files they should/shouldn't modify
5. **Request atomic commits:** One logical change per commit

### Merge Conflict Prevention

- Types and interfaces defined upfront and frozen during sprint
- Each feature owns specific files (see feature docs)
- Shared code changes require coordination
- Daily sync on shared dependency changes

### Code Review Checklist (for human review of AI-generated code)

- [ ] Tests exist and are meaningful (not just coverage theater)
- [ ] No hardcoded values that should be constants
- [ ] Error states handled
- [ ] Types are correct (no `any` escapes)
- [ ] No console.logs left in
- [ ] Consistent with existing patterns
- [ ] Comments explain non-obvious decisions

---

## Quality Gates

Code cannot merge without passing:

1. **Lint:** Zero errors, zero warnings
2. **Type check:** No TypeScript errors
3. **Unit tests:** 100% pass
4. **Integration tests:** 100% pass
5. **Build:** Successful production build

---

## Documentation Requirements

Every feature needs:

1. **Feature spec** (what it does)
2. **Type definitions** (data shapes)
3. **Test file** (expected behaviors)
4. **README section** (how to work on it)

This documentation serves both human developers and AI assistants.

---

## Summary

Our technical approach optimizes for:

- **Clarity:** Anyone (human or AI) can understand the codebase
- **Safety:** Tests and CI catch errors before they reach main
- **Parallelism:** Multiple agents can work without stepping on each other
- **Simplicity:** Patterns are consistent and predictable

The overhead of this process pays off in reduced debugging and integration headaches.
