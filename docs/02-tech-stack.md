# Tech Stack

**Document:** 02-tech-stack.md  
**Purpose:** Define what technologies we use and why

---

## Constraints

Before choosing a stack, acknowledge our constraints:

1. **Solo founder with limited native development experience**
2. **Development happens on Mac, but no iOS Developer account (yet)**
3. **Need to ship to iOS users for Phase 0 testing**
4. **AI coding assistants work better with mainstream, well-documented tech**
5. **Local-first data storage (no backend for Phase 0)**
6. **Budget-conscious (avoid paid services until validated)**

---

## Decision: Progressive Web App (PWA)

We build a React-based Progressive Web App, not a native iOS/Android app.

### Why PWA Over Native?

| Factor | Native (Swift/Kotlin) | React Native | PWA |
|--------|----------------------|--------------|-----|
| iOS deployment without dev account | ❌ | ❌ | ✅ |
| Single codebase | ❌ | ✅ | ✅ |
| Web + mobile from same code | ❌ | ❌ | ✅ |
| AI assistant familiarity | Medium | High | Highest |
| Local storage capability | ✅ | ✅ | ✅ |
| App Store approval needed | ✅ | ✅ | ❌ |
| Install on home screen | ✅ | ✅ | ✅ |
| Offline support | ✅ | ✅ | ✅ |

**Key insight:** PWAs can be "installed" on iOS via Safari's "Add to Home Screen" without an App Store submission. For Phase 0 beta testing, this is sufficient.

### PWA Limitations We Accept (For Now)

- No push notifications on iOS (acceptable for Phase 0)
- Slight performance gap vs native (negligible for our use case)
- Some iOS Safari quirks (manageable)
- No App Store discoverability (we're recruiting testers directly anyway)

### Migration Path

If Phase 0 succeeds and we need native capabilities:
- Wrap PWA in Capacitor for App Store submission
- Or rebuild critical paths in React Native
- Decision deferred until we have validation

---

## Stack Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │    React    │  │ TypeScript  │  │   Tailwind CSS  │ │
│  │    18.x     │  │    5.x      │  │      3.x        │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Vite      │  │ React Router│  │   Zustand       │ │
│  │   (build)   │  │  (routing)  │  │   (state)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              IndexedDB (via Dexie.js)           │   │
│  │                  Local Storage                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Development                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Vitest    │  │   ESLint    │  │    Prettier     │ │
│  │  (testing)  │  │  (linting)  │  │  (formatting)   │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │   GitHub    │  │   GitHub    │                      │
│  │   Actions   │  │    Pages    │                      │
│  │    (CI)     │  │  (hosting)  │                      │
│  └─────────────┘  └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

---

## Stack Decisions & Rationale

### React 18

**Why:** Most popular frontend framework. AI assistants have extensive training data. Huge ecosystem. Well-documented patterns.

**Alternatives considered:**
- Vue: Good, but smaller ecosystem
- Svelte: Less AI training data
- Vanilla JS: Too much boilerplate

### TypeScript

**Why:** Type safety catches errors early. Self-documenting code. Better AI assistant output (types provide context).

**Strictness:** Enable `strict` mode from day one. No `any` types without explicit justification.

### Vite

**Why:** Fast build times. Modern defaults. Great developer experience. Simple configuration.

**Alternatives considered:**
- Create React App: Deprecated
- Next.js: Overkill for local-only app, adds server complexity
- Webpack: More configuration overhead

### Tailwind CSS

**Why:** Utility-first approach means less context-switching. AI assistants handle it well. No CSS file proliferation.

**Configuration:** Use default theme with minimal customization for Phase 0.

### Zustand (State Management)

**Why:** Minimal boilerplate. TypeScript-friendly. Simpler than Redux. Easy to understand for AI assistants.

**Pattern:** One store per domain (beans store, shots store, UI store).

### Dexie.js (IndexedDB Wrapper)

**Why:** IndexedDB allows storing significant data locally. Dexie provides a clean Promise-based API. Supports complex queries we'll need for the bean library.

**Why not localStorage?** 
- 5MB limit too restrictive
- No structured queries
- Not suitable for our data model

### React Router

**Why:** Standard routing solution for React SPAs. Well-documented. AI assistants know it well.

### Vitest (Testing)

**Why:** Fast. Compatible with Vite. Jest-compatible API (AI assistants know this well). Great TypeScript support.

**Pattern:** 
- Unit tests: `.test.ts` files co-located with source
- Integration tests: `/tests/integration/` directory
- Use React Testing Library for component tests

### ESLint + Prettier

**Why:** Automated code quality. Consistent formatting. Reduces code review friction.

**Config:** Use recommended rulesets, minimal customization.

### GitHub Actions (CI)

**Why:** Free for public repos. Integrated with GitHub. Sufficient for our needs.

**Pipeline:** Lint → Type Check → Test → Build

### GitHub Pages (Hosting)

**Why:** Free. Simple deployment. HTTPS included. Custom domain support.

**Alternative for later:** Vercel or Netlify if we need more features.

---

## PWA Configuration

### Required PWA Elements

1. **manifest.json**
   - App name, icons, theme colors
   - `display: standalone` for app-like experience
   
2. **Service Worker**
   - Offline caching strategy
   - Use Workbox (via vite-plugin-pwa) for simplicity

3. **Icons**
   - Multiple sizes for different devices
   - 192x192 and 512x512 minimum

4. **Meta Tags**
   - Apple-specific meta tags for iOS home screen

### Offline Strategy

**Cache-first for assets:** CSS, JS, images  
**Network-first for data:** (Not applicable—we're local-only)

Since all data is in IndexedDB, the app works fully offline once loaded.

---

## Project Structure

```
/
├── public/
│   ├── manifest.json
│   ├── icons/
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── shared/           # Reusable UI components
│   │   ├── bean/             # Bean-related components
│   │   ├── shot/             # Shot-related components
│   │   └── guidance/         # Guidance-related components
│   │
│   ├── stores/
│   │   ├── beanStore.ts      # Bean state management
│   │   ├── shotStore.ts      # Shot state management
│   │   └── uiStore.ts        # UI state (modals, navigation)
│   │
│   ├── db/
│   │   ├── database.ts       # Dexie database setup
│   │   ├── beanRepository.ts # Bean CRUD operations
│   │   └── shotRepository.ts # Shot CRUD operations
│   │
│   ├── utils/
│   │   ├── calculations.ts   # Ratio, extraction math
│   │   ├── guidance.ts       # Suggestion logic
│   │   └── export.ts         # Data export utilities
│   │
│   ├── types/
│   │   ├── bean.ts           # Bean type definitions
│   │   ├── shot.ts           # Shot type definitions
│   │   └── index.ts          # Barrel export
│   │
│   ├── pages/
│   │   ├── Library.tsx       # Bean library view
│   │   ├── BeanDetail.tsx    # Single bean + shot log
│   │   ├── LogShot.tsx       # Shot entry form
│   │   └── Settings.tsx      # App settings, export
│   │
│   ├── App.tsx               # Root component, routing
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles, Tailwind imports
│
├── tests/
│   └── integration/          # Integration test files
│
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions config
│
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## Dependency List (Phase 0)

### Production Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.x",
  "zustand": "^4.x",
  "dexie": "^3.x",
  "dexie-react-hooks": "^1.x"
}
```

### Development Dependencies

```json
{
  "typescript": "^5.x",
  "vite": "^5.x",
  "vite-plugin-pwa": "^0.17.x",
  "@vitejs/plugin-react": "^4.x",
  "vitest": "^1.x",
  "@testing-library/react": "^14.x",
  "@testing-library/jest-dom": "^6.x",
  "jsdom": "^24.x",
  "eslint": "^8.x",
  "prettier": "^3.x",
  "tailwindcss": "^3.x",
  "autoprefixer": "^10.x",
  "postcss": "^8.x"
}
```

### Total Dependencies

~15 production, ~15 dev. Deliberately minimal.

---

## Performance Budget

| Metric | Target |
|--------|--------|
| Initial bundle size (gzipped) | < 100KB |
| Time to interactive | < 2s on 3G |
| Lighthouse Performance score | > 90 |

These are achievable with our minimal stack.

---

## Security Considerations

**Phase 0 is local-only, so attack surface is minimal.**

Still implement:
- No eval() or dynamic code execution
- Sanitize any user input displayed in UI (XSS prevention)
- Content Security Policy headers

---

## Future Considerations (Post Phase 0)

If we need native features later:

**Option A: Capacitor**
- Wrap existing PWA
- Access native APIs
- Submit to App Store
- Minimal code changes

**Option B: React Native rebuild**
- More work but better native feel
- Consider if performance becomes an issue
- Can share business logic, rebuild UI

**Decision deferred** until Phase 0 validates the product.

---

## Summary

| Decision | Choice | Key Reason |
|----------|--------|------------|
| App type | PWA | No App Store needed for beta |
| Framework | React + TypeScript | AI assistant familiarity |
| Build | Vite | Speed and simplicity |
| Styling | Tailwind | Low friction |
| State | Zustand | Minimal boilerplate |
| Storage | IndexedDB (Dexie) | Structured local data |
| Testing | Vitest | Vite-native, fast |
| CI/CD | GitHub Actions | Free, integrated |
| Hosting | GitHub Pages | Free, simple |

This stack is boring on purpose. Boring means predictable, well-documented, and AI-assistant-friendly.
