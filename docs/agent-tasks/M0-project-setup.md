# Agent Task: M0 - Project Setup

**Milestone:** M0  
**Agent:** Claude Code  
**Estimated time:** 30-60 minutes  

---

## Context

You are setting up a new React PWA project for an espresso dial-in companion app. This is a Phase 0 MVP—keep everything minimal and standard. Do not add extra features or dependencies beyond what's specified.

Read the following documentation files before starting:
- `/docs/02-tech-stack.md` — Stack decisions and project structure
- `/docs/05-design-system.md` — Design tokens (colors, typography)

---

## Objective

Initialize a complete, working development environment with:
- Vite + React 18 + TypeScript 5
- Tailwind CSS with custom theme
- ESLint + Prettier
- Vitest + React Testing Library
- GitHub Actions CI pipeline
- Correct folder structure

**Success criteria:** After completion, all these commands must work:
```bash
npm run dev      # Starts dev server
npm run build    # Produces production build
npm run test     # Runs test suite
npm run lint     # Checks code style
```

---

## Step-by-Step Instructions

### 1. Initialize Vite Project

```bash
npm create vite@latest . -- --template react-ts
npm install
```

Note: We're initializing in the current directory (`.`) since the repo already exists.

### 2. Install Dependencies

**Production dependencies:**
```bash
npm install react-router-dom zustand dexie dexie-react-hooks
```

**Development dependencies:**
```bash
npm install -D tailwindcss postcss autoprefixer
npm install -D eslint prettier eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D vite-plugin-pwa
```

### 3. Configure Tailwind CSS

Initialize Tailwind:
```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // Light mode - Espresso (text)
        'espresso': {
          950: '#1a1412',
          900: '#2d2622',
          800: '#3d332d',
          700: '#524840',
        },
        // Light mode - Crema (backgrounds)
        'crema': {
          50: '#faf8f5',
          100: '#f5f1eb',
          200: '#ebe5db',
          300: '#d9d0c3',
          400: '#c4b8a8',
        },
        // Dark mode - Roast (backgrounds)
        'roast': {
          950: '#0f0d0c',
          900: '#1a1613',
          800: '#252019',
          700: '#332b24',
          600: '#443a30',
        },
        // Dark mode - Steam (text)
        'steam': {
          50: '#faf8f5',
          100: '#e8e2d9',
          200: '#c9c0b3',
          300: '#a69c8c',
          400: '#7a7067',
        },
        // Accent - Caramel
        'caramel': {
          100: '#fdf4e7',
          200: '#f9e4c8',
          300: '#f0cea3',
          400: '#d4a574',
          500: '#b8865a',
          600: '#996d45',
        },
        // Success - Dialed
        'dialed': {
          light: '#e8f0e8',
          DEFAULT: '#7d9a7d',
          dark: '#5c755c',
          'dm-bg': '#1e2a1e',
          'dm-text': '#9db89d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 4. Configure ESLint

Create `.eslintrc.cjs`:
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: '18.2' },
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/prop-types': 'off',
  },
}
```

### 5. Configure Prettier

Create `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Create `.prettierignore`:
```
dist
node_modules
```

### 6. Configure Vitest

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Espresso Dial-In',
        short_name: 'Dial-In',
        description: 'A guided dial-in flow for espresso',
        theme_color: '#faf8f5',
        background_color: '#faf8f5',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
});
```

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

Update `tsconfig.json` to include Vitest types:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"],

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 7. Update package.json Scripts

Ensure these scripts exist in `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\""
  }
}
```

### 8. Create Folder Structure

Create these directories:
```
src/
├── components/
│   ├── shared/
│   ├── bean/
│   ├── shot/
│   └── guidance/
├── stores/
├── db/
├── utils/
├── types/
├── pages/
└── test/

public/
└── icons/
```

Create placeholder files so Git tracks empty directories:

`src/components/shared/.gitkeep` (empty file)
`src/components/bean/.gitkeep`
`src/components/shot/.gitkeep`
`src/components/guidance/.gitkeep`
`src/stores/.gitkeep`
`src/db/.gitkeep`
`src/utils/.gitkeep`
`src/types/.gitkeep`
`src/pages/.gitkeep`
`public/icons/.gitkeep`

### 9. Create Placeholder App

Update `src/App.tsx`:
```tsx
function App() {
  return (
    <div className="min-h-screen bg-crema-50 dark:bg-roast-950 text-espresso-900 dark:text-steam-50">
      <div className="max-w-[375px] mx-auto p-4">
        <h1 className="text-2xl font-semibold">Espresso Dial-In</h1>
        <p className="text-sm text-espresso-700 dark:text-steam-200 mt-1">
          Your coffee companion
        </p>
      </div>
    </div>
  );
}

export default App;
```

### 10. Create First Test

Create `src/App.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByText('Espresso Dial-In')).toBeInTheDocument();
  });
});
```

### 11. Create GitHub Actions CI

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm run test:run

      - name: Build
        run: npm run build
```

### 12. Update .gitignore

Ensure `.gitignore` includes:
```
# Dependencies
node_modules

# Build
dist
dist-ssr

# IDE
.vscode/*
!.vscode/extensions.json
.idea

# Logs
*.log
npm-debug.log*

# Local env files
.env
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db

# Test coverage
coverage
```

### 13. Update README

Replace `README.md`:
```markdown
# Espresso Dial-In

A guided espresso dial-in companion app. Track your beans, log your shots, and remember what worked.

## Development

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
npm install
```

### Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run test     # Run tests (watch mode)
npm run test:run # Run tests (single run)
npm run lint     # Lint code
npm run format   # Format code
```

### Project Structure

```
src/
├── components/   # React components
├── pages/        # Page components
├── stores/       # Zustand stores
├── db/           # Dexie database
├── utils/        # Utility functions
├── types/        # TypeScript types
└── test/         # Test setup
```

## Documentation

See `/docs` for project documentation:
- Technical approach
- Tech stack decisions
- Data models
- Feature milestones
- Design system
- Task list
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] `npm run dev` starts server at localhost:5173
- [ ] App displays "Espresso Dial-In" with correct styling
- [ ] Light mode shows cream background, dark text
- [ ] Dark mode (system preference) shows dark background, light text
- [ ] `npm run build` completes without errors
- [ ] `npm run test` passes the App test
- [ ] `npm run lint` passes with no errors
- [ ] Folder structure matches spec
- [ ] Pushing to GitHub triggers CI workflow

---

## Notes for Agent

- Do not add dependencies beyond what's listed
- Do not create components or features beyond what's specified
- Keep the App.tsx minimal—just enough to verify styling works
- If you encounter errors, fix them before moving on
- Commit frequently with clear messages:
  - `chore: initialize vite project`
  - `chore: configure tailwind with custom theme`
  - `chore: add eslint and prettier config`
  - `chore: configure vitest`
  - `chore: create folder structure`
  - `chore: add github actions ci`
