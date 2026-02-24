# Agent Task: M7 - Polish & PWA

**Milestone:** M7  
**Agent:** Claude Code  
**Estimated time:** 45-60 minutes  
**Depends on:** M6 (Guidance Engine) complete

---

## Context

You are finalizing "Beanary", an espresso dial-in companion app, for beta release. This milestone adds PWA functionality (installable, offline-capable), a settings page, and final polish.

Read the following documentation files before starting:
- `/docs/05-design-system.md` — Visual design specs
- `/docs/02-tech-stack.md` — PWA configuration

---

## Objective

Make the app installable, add settings page, and polish remaining UI issues.

**Success criteria:**
- App installable on iOS and Android
- Works offline (data persists in IndexedDB)
- Settings page with export and clear data options
- All icons display correctly
- Lighthouse PWA score ≥ 90
- No console errors

---

## Pre-existing Assets

App icons have already been exported to `/public/icons/`. Verify these files exist:
- `icon-512.png`
- `icon-192.png`
- `apple-touch-icon.png` (180x180)
- Or similar naming convention

If file names differ, adjust the manifest and HTML accordingly.

---

## Files to Create/Modify

```
public/
├── favicon.ico (or favicon.png)
└── icons/ (already exists with icons)

src/
├── pages/Settings.tsx (update)
└── components/shot/ShotComparison.tsx (update - add delta symbol)

index.html (update - meta tags)
vite.config.ts (update - PWA config)
```

---

## Step-by-Step Instructions

### 1. Update PWA Configuration

Update `vite.config.ts` to configure the PWA plugin with correct icon paths:

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
        name: 'Beanary',
        short_name: 'Beanary',
        description: 'Your espresso dial-in companion',
        theme_color: '#faf8f5',
        background_color: '#faf8f5',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
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
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
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

### 2. Update index.html

Update `index.html` with proper meta tags for PWA and iOS:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    
    <!-- App Info -->
    <title>Beanary</title>
    <meta name="description" content="Your espresso dial-in companion" />
    
    <!-- Theme Colors -->
    <meta name="theme-color" content="#faf8f5" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#0f0d0c" media="(prefers-color-scheme: dark)" />
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/icons/icon-192.png" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    
    <!-- iOS PWA Meta Tags -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Beanary" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    
    <!-- Prevent phone number detection -->
    <meta name="format-detection" content="telephone=no" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 3. Add Delta Symbol to Shot Comparison

Update `src/components/shot/ShotComparison.tsx` to add delta symbols to the comparison labels:

Find the comparison section and update the labels:

```tsx
{/* Comparison with previous */}
{previousShot && (
  <Card className="bg-crema-50 dark:bg-roast-800">
    <span className="text-xs text-espresso-700/60 dark:text-steam-300 block mb-2">
      vs Shot #{previousShot.shotNumber}
    </span>
    <div className="grid grid-cols-3 gap-2 text-center text-sm">
      <div>
        <span className="text-espresso-700/60 dark:text-steam-400">Δ Yield</span>
        <p className="font-medium text-espresso-900 dark:text-steam-50">
          {formatDelta(currentShot.yieldGrams, previousShot.yieldGrams, 'g')}
        </p>
      </div>
      <div>
        <span className="text-espresso-700/60 dark:text-steam-400">Δ Time</span>
        <p className="font-medium text-espresso-900 dark:text-steam-50">
          {formatDelta(currentShot.timeSeconds, previousShot.timeSeconds, 's')}
        </p>
      </div>
      <div>
        <span className="text-espresso-700/60 dark:text-steam-400">Previous</span>
        <p className={`font-medium ${getBalanceColor(previousShot.taste.balance)}`}>
          {getBalanceLabel(previousShot.taste.balance)}
        </p>
      </div>
    </div>
  </Card>
)}
```

### 4. Create Full Settings Page

Update `src/pages/Settings.tsx`:

```tsx
import { useState } from 'react';
import { Button, Card, ConfirmModal } from '../components/shared';
import { exportData, downloadExport } from '../utils/export';
import { resetDatabase } from '../db';
import { useBeanStore } from '../stores/beanStore';
import { useShotStore } from '../stores/shotStore';

export function Settings() {
  const [isExporting, setIsExporting] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { loadBeans } = useBeanStore();
  const { clearShots } = useShotStore();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      downloadExport(data);
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await resetDatabase();
      clearShots();
      await loadBeans();
    } catch (e) {
      console.error('Clear data failed:', e);
    } finally {
      setIsClearing(false);
      setShowClearModal(false);
    }
  };

  return (
    <div>
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
          Manage your data
        </p>
      </header>

      <main className="px-4 pb-4 space-y-4">
        {/* Data Management */}
        <Card>
          <h2 className="font-medium text-espresso-900 dark:text-steam-50 mb-3">
            Your Data
          </h2>
          <p className="text-sm text-espresso-700/70 dark:text-steam-300 mb-4">
            All your data is stored locally on this device. Export regularly to keep a backup.
          </p>
          <div className="space-y-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export Data (JSON)'}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              onClick={() => setShowClearModal(true)}
            >
              Clear All Data
            </Button>
          </div>
        </Card>

        {/* About */}
        <Card>
          <h2 className="font-medium text-espresso-900 dark:text-steam-50 mb-3">
            About Beanary
          </h2>
          <div className="space-y-2 text-sm text-espresso-700/70 dark:text-steam-300">
            <p>
              Beanary helps you dial in your espresso by tracking shots and remembering what worked.
            </p>
            <p>
              Version 0.1.0 (Phase 0 Beta)
            </p>
          </div>
        </Card>

        {/* How It Works */}
        <Card>
          <h2 className="font-medium text-espresso-900 dark:text-steam-50 mb-3">
            How It Works
          </h2>
          <ol className="space-y-2 text-sm text-espresso-700/70 dark:text-steam-300 list-decimal list-inside">
            <li>Add a new coffee bean to your library</li>
            <li>Log shots as you dial in, noting taste</li>
            <li>Follow the guidance to adjust your grind</li>
            <li>When it tastes great, mark it as "Dialed"</li>
            <li>Next time you buy this bean, your recipe is saved</li>
          </ol>
        </Card>

        {/* Tips */}
        <Card>
          <h2 className="font-medium text-espresso-900 dark:text-steam-50 mb-3">
            Quick Tips
          </h2>
          <ul className="space-y-2 text-sm text-espresso-700/70 dark:text-steam-300">
            <li className="flex gap-2">
              <span className="text-amber-500">●</span>
              <span><strong>Sour?</strong> Under-extracted. Try grinding finer.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-500">●</span>
              <span><strong>Bitter?</strong> Over-extracted. Try grinding coarser.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-dialed dark:text-dialed-dm-text">●</span>
              <span><strong>Balanced?</strong> You're dialed in!</span>
            </li>
          </ul>
        </Card>

        {/* Install Hint */}
        <Card className="bg-caramel-100 dark:bg-caramel-500/20 border-caramel-200 dark:border-caramel-500/30">
          <h2 className="font-medium text-caramel-700 dark:text-caramel-300 mb-2">
            Install the App
          </h2>
          <p className="text-sm text-caramel-600 dark:text-caramel-400">
            For the best experience, add Beanary to your home screen. On iOS, tap the share button and "Add to Home Screen". On Android, tap the menu and "Install app".
          </p>
        </Card>
      </main>

      {/* Clear Data Confirmation */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearData}
        title="Clear All Data?"
        message="This will permanently delete all your beans and shots. This action cannot be undone. Consider exporting your data first."
        confirmLabel={isClearing ? 'Clearing...' : 'Clear Everything'}
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
```

### 5. Create Favicon

If `/public/favicon.ico` doesn't exist, create one from the icon:

Option A: Copy and rename (if you have a 32x32 PNG):
```bash
cp public/icons/icon-32.png public/favicon.ico
```

Option B: Use the 192px icon as fallback (browsers will scale it):
The `index.html` already references `/icons/icon-192.png` as a fallback.

### 6. Update ShotComparison Test

Update the test for the delta symbol change in `src/components/shot/ShotComparison.test.tsx`:

```tsx
it('shows delta symbols in comparison labels', () => {
  const current = createMockShot({ shotNumber: 2, yieldGrams: 40 });
  const previous = createMockShot({ shotNumber: 1, yieldGrams: 36 });
  
  render(<ShotComparison currentShot={current} previousShot={previous} />);
  
  expect(screen.getByText('Δ Yield')).toBeInTheDocument();
  expect(screen.getByText('Δ Time')).toBeInTheDocument();
});
```

### 7. Add Settings Page Test

Create `src/pages/Settings.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Settings } from './Settings';
import { resetDatabase } from '../db';

// Mock the database reset
vi.mock('../db', async () => {
  const actual = await vi.importActual('../db');
  return {
    ...actual,
    resetDatabase: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock the stores
vi.mock('../stores/beanStore', () => ({
  useBeanStore: () => ({
    loadBeans: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('../stores/shotStore', () => ({
  useShotStore: () => ({
    clearShots: vi.fn(),
  }),
}));

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders settings page', () => {
    render(<Settings />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Your Data')).toBeInTheDocument();
    expect(screen.getByText('About Beanary')).toBeInTheDocument();
  });

  it('has export button', () => {
    render(<Settings />);
    expect(screen.getByText('Export Data (JSON)')).toBeInTheDocument();
  });

  it('has clear data button', () => {
    render(<Settings />);
    expect(screen.getByText('Clear All Data')).toBeInTheDocument();
  });

  it('shows confirmation modal when clearing data', () => {
    render(<Settings />);
    
    fireEvent.click(screen.getByText('Clear All Data'));
    
    expect(screen.getByText('Clear All Data?')).toBeInTheDocument();
    expect(screen.getByText(/permanently delete/)).toBeInTheDocument();
  });

  it('shows install instructions', () => {
    render(<Settings />);
    expect(screen.getByText('Install the App')).toBeInTheDocument();
  });
});
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] `npm run test:run` — all tests pass
- [ ] `npm run lint` — no errors
- [ ] `npm run build` — builds successfully

Manual testing:
- [ ] `npm run dev` — app starts
- [ ] Icons appear in browser tab
- [ ] Settings page shows all sections
- [ ] Export button downloads JSON file
- [ ] Clear data shows confirmation, then clears
- [ ] Shot comparison shows "Δ Yield" and "Δ Time" labels
- [ ] Build and serve production: `npm run build && npm run preview`

PWA testing:
- [ ] Open in Chrome DevTools → Application → Manifest shows correct info
- [ ] Service Worker registers successfully
- [ ] Can install app via browser prompt (desktop)
- [ ] iOS: Can add to home screen via Share → Add to Home Screen
- [ ] Android: Can install via browser menu
- [ ] App icon appears correctly on home screen
- [ ] App works offline (after first load)

Lighthouse audit:
- [ ] Run Lighthouse (DevTools → Lighthouse → PWA)
- [ ] PWA score ≥ 90
- [ ] Fix any critical issues

---

## Notes for Agent

- Check the actual icon file names in `/public/icons/` and adjust manifest accordingly
- The PWA won't work on `localhost` for iOS testing—use network IP or deploy
- Dark mode theme color uses roast-950 (#0f0d0c)
- Keep Settings page content helpful but concise
- The version "0.1.0 (Phase 0 Beta)" is intentional
- Commit message: `feat(pwa): add PWA support and settings page`

---

## Post-Completion: Deployment

After M7 is verified locally, deploy to GitHub Pages:

1. Update `vite.config.ts` with base path (if deploying to subdirectory):
   ```typescript
   export default defineConfig({
     base: '/beanary/', // or '/' if using custom domain
     // ...
   })
   ```

2. Add deployment workflow `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: dist

     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - uses: actions/deploy-pages@v4
           id: deployment
   ```

3. Enable GitHub Pages in repo settings (Settings → Pages → Source: GitHub Actions)

4. Push and verify deployment at `https://[username].github.io/beanary/`
