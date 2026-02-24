# Agent Task: M8 - Import, Shot Management & Polish

**Milestone:** M8  
**Agent:** Claude Code  
**Estimated time:** 60-90 minutes  
**Depends on:** M7 (Polish & PWA) complete

---

## Context

You are adding import functionality, shot management, and final polish to "Beanary", an espresso dial-in companion app. Users have requested the ability to restore backups, edit/delete shots, and customize the theme.

---

## Objective

Add import functionality, shot detail/edit/delete, theme selection, and UI polish.

**Success criteria:**
- Can import a previously exported JSON file
- Import shows confirmation with data preview before overwriting
- Can tap a shot to view details
- Can edit a shot from the detail view
- Can delete a shot (button and swipe gesture)
- Empty state on bean detail when no shots
- Theme selector (light/dark/system) in settings
- iOS status bar blends with app background
- All tests pass

---

## Files to Create/Modify

```
src/pages/
├── ShotDetail.tsx (new)
├── ShotDetail.test.tsx (new)
├── Settings.tsx (update)
└── BeanDetail.tsx (update)

src/components/shot/
├── ShotCard.tsx (new)
├── ShotCard.test.tsx (new)
├── ShotForm.tsx (update - support edit mode)
└── index.ts (update)

src/components/bean/
└── ShotList.tsx (update - add navigation + swipe delete)

src/stores/
├── shotStore.ts (update - add updateShot)
├── themeStore.ts (new)
└── index.ts (update)

src/utils/
├── import.ts (new)
└── import.test.ts (new)

src/App.tsx (update - add route + theme provider)
index.html (update - iOS status bar)
```

---

## Step-by-Step Instructions

### 1. Fix iOS Status Bar

Update `index.html`, change the status bar style:

```html
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

Then update `src/index.css` to add safe area padding at the top:

```css
/* Update the existing body styles or add */
#root {
  padding-top: env(safe-area-inset-top);
}
```

Also update `src/components/layout/AppLayout.tsx` to account for this if needed—headers should not add extra padding since the root now handles it.

### 2. Create Theme Store

Create `src/stores/themeStore.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'beanary-theme',
    }
  )
);

/**
 * Apply theme to document based on mode.
 * Call this in App.tsx on mount and when mode changes.
 */
export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement;
  
  if (mode === 'system') {
    // Remove manual override, let CSS media query handle it
    root.classList.remove('light', 'dark');
  } else {
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
  }
}
```

### 3. Update Tailwind Config for Manual Theme

Update `tailwind.config.js` to support class-based dark mode:

```javascript
module.exports = {
  darkMode: ['class', '[class~="dark"]', 'media'],
  // ... rest of config
}
```

Wait—this might be complex. Simpler approach: use `class` mode and handle the system preference in JavaScript.

Update `tailwind.config.js`:

```javascript
darkMode: 'class',
```

Then update `applyTheme` in `themeStore.ts`:

```typescript
export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  
  if (mode === 'system') {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(prefersDark ? 'dark' : 'light');
  } else {
    root.classList.add(mode);
  }
}

/**
 * Listen for system theme changes (only matters when mode is 'system').
 */
export function setupThemeListener(mode: ThemeMode): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = () => {
    if (mode === 'system') {
      applyTheme('system');
    }
  };
  
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}
```

### 4. Update App.tsx to Apply Theme

Update `src/App.tsx` to apply theme on mount:

```tsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { Library, BeanDetail, NewBean, LogShot, Settings, ShotDetail } from './pages';
import { useThemeStore, applyTheme, setupThemeListener } from './stores/themeStore';

function App() {
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    applyTheme(mode);
    const cleanup = setupThemeListener(mode);
    return cleanup;
  }, [mode]);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Library />} />
          <Route path="/bean/new" element={<NewBean />} />
          <Route path="/bean/:id" element={<BeanDetail />} />
          <Route path="/bean/:id/shot" element={<LogShot />} />
          <Route path="/bean/:beanId/shot/:shotId" element={<ShotDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 5. Create Import Utility

Create `src/utils/import.ts`:

```typescript
import type { DataExport, Bean, Shot } from '../types';
import { EXPORT_VERSION, validateImport } from './export';
import { db } from '../db/database';

export interface ImportPreview {
  isValid: boolean;
  error?: string;
  beanCount: number;
  shotCount: number;
  exportDate?: string;
}

/**
 * Preview an import file without applying it.
 */
export function previewImport(data: unknown): ImportPreview {
  if (!validateImport(data)) {
    return {
      isValid: false,
      error: 'Invalid file format. Please select a Beanary export file.',
      beanCount: 0,
      shotCount: 0,
    };
  }

  const exportData = data as DataExport;

  if (exportData.version !== EXPORT_VERSION) {
    return {
      isValid: false,
      error: `Incompatible version. Expected v${EXPORT_VERSION}, got v${exportData.version}.`,
      beanCount: 0,
      shotCount: 0,
    };
  }

  return {
    isValid: true,
    beanCount: exportData.beans.length,
    shotCount: exportData.shots.length,
    exportDate: exportData.exportedAt,
  };
}

/**
 * Import data, replacing all existing data.
 */
export async function importData(data: DataExport): Promise<void> {
  // Clear existing data
  await db.transaction('rw', db.beans, db.shots, async () => {
    await db.beans.clear();
    await db.shots.clear();
    
    // Import new data
    if (data.beans.length > 0) {
      await db.beans.bulkAdd(data.beans);
    }
    if (data.shots.length > 0) {
      await db.shots.bulkAdd(data.shots);
    }
  });
}

/**
 * Read a File as JSON.
 */
export function readFileAsJSON(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        resolve(data);
      } catch (e) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
```

Create `src/utils/import.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { previewImport } from './import';
import { EXPORT_VERSION } from './export';

describe('previewImport', () => {
  it('returns valid preview for correct data', () => {
    const data = {
      version: EXPORT_VERSION,
      exportedAt: '2026-02-24T10:00:00Z',
      beans: [{ id: '1', name: 'Test' }],
      shots: [{ id: '1' }, { id: '2' }],
    };

    const preview = previewImport(data);

    expect(preview.isValid).toBe(true);
    expect(preview.beanCount).toBe(1);
    expect(preview.shotCount).toBe(2);
    expect(preview.exportDate).toBe('2026-02-24T10:00:00Z');
  });

  it('returns error for invalid format', () => {
    const preview = previewImport({ foo: 'bar' });

    expect(preview.isValid).toBe(false);
    expect(preview.error).toContain('Invalid');
  });

  it('returns error for wrong version', () => {
    const data = {
      version: 999,
      exportedAt: '2026-02-24T10:00:00Z',
      beans: [],
      shots: [],
    };

    const preview = previewImport(data);

    expect(preview.isValid).toBe(false);
    expect(preview.error).toContain('version');
  });

  it('handles null input', () => {
    const preview = previewImport(null);
    expect(preview.isValid).toBe(false);
  });
});
```

### 6. Update Settings Page with Import and Theme

Update `src/pages/Settings.tsx`:

```tsx
import { useState, useRef } from 'react';
import { Button, Card, ConfirmModal } from '../components/shared';
import { exportData, downloadExport } from '../utils/export';
import { previewImport, importData, readFileAsJSON, type ImportPreview } from '../utils/import';
import { resetDatabase } from '../db';
import { useBeanStore } from '../stores/beanStore';
import { useShotStore } from '../stores/shotStore';
import { useThemeStore } from '../stores/themeStore';
import type { DataExport } from '../types';

export function Settings() {
  const [isExporting, setIsExporting] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  // Import state
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importFile, setImportFile] = useState<DataExport | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { loadBeans } = useBeanStore();
  const { clearShots } = useShotStore();
  const { mode, setMode } = useThemeStore();

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await readFileAsJSON(file);
      const preview = previewImport(data);
      setImportPreview(preview);
      
      if (preview.isValid) {
        setImportFile(data as DataExport);
        setShowImportModal(true);
      }
    } catch (err) {
      setImportPreview({
        isValid: false,
        error: 'Failed to read file',
        beanCount: 0,
        shotCount: 0,
      });
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    try {
      await importData(importFile);
      clearShots();
      await loadBeans();
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview(null);
    } catch (e) {
      console.error('Import failed:', e);
    } finally {
      setIsImporting(false);
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
          Manage your data and preferences
        </p>
      </header>

      <main className="px-4 pb-4 space-y-4">
        {/* Theme Selection */}
        <Card>
          <h2 className="font-medium text-espresso-900 dark:text-steam-50 mb-3">
            Appearance
          </h2>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setMode(option)}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                  ${mode === option
                    ? 'bg-caramel-500 text-white'
                    : 'bg-crema-100 dark:bg-roast-800 text-espresso-700 dark:text-steam-200'
                  }
                `}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </Card>

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
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              Import Data
            </Button>

            {/* Import error display */}
            {importPreview && !importPreview.isValid && (
              <p className="text-sm text-red-500 mt-2">{importPreview.error}</p>
            )}

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
              Version 0.2.0 (Phase 0 Beta)
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

      {/* Import Confirmation Modal */}
      <ConfirmModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportFile(null);
        }}
        onConfirm={handleImport}
        title="Import Data?"
        message={`This will replace all your current data with:\n\n• ${importPreview?.beanCount || 0} beans\n• ${importPreview?.shotCount || 0} shots\n\nExported on: ${importPreview?.exportDate ? new Date(importPreview.exportDate).toLocaleDateString() : 'Unknown'}\n\nThis action cannot be undone.`}
        confirmLabel={isImporting ? 'Importing...' : 'Replace All Data'}
        cancelLabel="Cancel"
        variant="danger"
      />

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

### 7. Update Shot Store with Edit Function

Update `src/stores/shotStore.ts` to add `editShot`:

```typescript
import { create } from 'zustand';
import type { Shot } from '../types';
import type { CreateShotInput } from '../types';
import {
  getShotsForBean,
  getLatestShotForBean,
  createShot,
  updateShot,
  deleteShot,
} from '../db';

interface ShotState {
  shots: Shot[];
  latestShot: Shot | null;
  currentShot: Shot | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadShots: (beanId: string) => Promise<void>;
  loadLatestShot: (beanId: string) => Promise<void>;
  loadShot: (shotId: string) => Promise<void>;
  addShot: (input: CreateShotInput) => Promise<Shot>;
  editShot: (id: string, updates: Partial<Omit<Shot, 'id' | 'beanId' | 'createdAt' | 'shotNumber'>>) => Promise<Shot>;
  removeShot: (id: string, beanId: string) => Promise<void>;
  clearShots: () => void;
  clearError: () => void;
}

export const useShotStore = create<ShotState>((set, get) => ({
  shots: [],
  latestShot: null,
  currentShot: null,
  isLoading: false,
  error: null,

  loadShots: async (beanId: string) => {
    set({ isLoading: true, error: null });
    try {
      const shots = await getShotsForBean(beanId);
      const latestShot = shots.length > 0 ? shots[shots.length - 1] : null;
      set({ shots, latestShot, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to load shots', isLoading: false });
    }
  },

  loadLatestShot: async (beanId: string) => {
    try {
      const shot = await getLatestShotForBean(beanId);
      set({ latestShot: shot || null });
    } catch (e) {
      // Silent fail - not critical
    }
  },

  loadShot: async (shotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { shots } = get();
      const shot = shots.find(s => s.id === shotId) || null;
      set({ currentShot: shot, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to load shot', isLoading: false });
    }
  },

  addShot: async (input: CreateShotInput) => {
    set({ isLoading: true, error: null });
    try {
      const shot = await createShot(input);
      const shots = await getShotsForBean(input.beanId);
      set({ shots, latestShot: shot, isLoading: false });
      return shot;
    } catch (e) {
      set({ error: 'Failed to log shot', isLoading: false });
      throw e;
    }
  },

  editShot: async (id: string, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateShot(id, updates);
      const { shots } = get();
      const newShots = shots.map(s => s.id === id ? updated : s);
      set({ 
        shots: newShots, 
        currentShot: get().currentShot?.id === id ? updated : get().currentShot,
        isLoading: false 
      });
      return updated;
    } catch (e) {
      set({ error: 'Failed to update shot', isLoading: false });
      throw e;
    }
  },

  removeShot: async (id: string, beanId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteShot(id);
      const shots = await getShotsForBean(beanId);
      const latestShot = shots.length > 0 ? shots[shots.length - 1] : null;
      set({ 
        shots, 
        latestShot, 
        currentShot: get().currentShot?.id === id ? null : get().currentShot,
        isLoading: false 
      });
    } catch (e) {
      set({ error: 'Failed to delete shot', isLoading: false });
      throw e;
    }
  },

  clearShots: () => set({ shots: [], latestShot: null, currentShot: null }),

  clearError: () => set({ error: null }),
}));
```

### 8. Create ShotDetail Page

Create `src/pages/ShotDetail.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShotStore } from '../stores/shotStore';
import { useBeanStore } from '../stores/beanStore';
import { Button, Card, ConfirmModal } from '../components/shared';
import { ShotForm } from '../components/shot';
import { formatRatio, getBalanceLabel, getBalanceColor } from '../utils/calculations';
import type { BalanceValue } from '../types';

export function ShotDetail() {
  const { beanId, shotId } = useParams<{ beanId: string; shotId: string }>();
  const navigate = useNavigate();
  
  const { currentBean, loadBean } = useBeanStore();
  const { shots, loadShots, editShot, removeShot, isLoading } = useShotStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (beanId) {
      loadBean(beanId);
      loadShots(beanId);
    }
  }, [beanId, loadBean, loadShots]);

  const shot = shots.find(s => s.id === shotId);

  if (!shot || !currentBean) {
    return (
      <div className="px-5 pt-12 pb-4">
        <p className="text-espresso-700 dark:text-steam-200">
          {isLoading ? 'Loading...' : 'Shot not found'}
        </p>
      </div>
    );
  }

  const handleEdit = async (values: {
    doseGrams: number;
    yieldGrams: number;
    timeSeconds: number;
    grindSetting?: string;
    taste: { balance: BalanceValue };
    notes?: string;
  }) => {
    await editShot(shot.id, {
      doseGrams: values.doseGrams,
      yieldGrams: values.yieldGrams,
      timeSeconds: values.timeSeconds,
      grindSetting: values.grindSetting,
      taste: values.taste,
      notes: values.notes,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await removeShot(shot.id, currentBean.id);
    navigate(`/bean/${currentBean.id}`);
  };

  return (
    <div>
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <button
          onClick={() => navigate(`/bean/${currentBean.id}`)}
          className="flex items-center gap-1 text-sm text-espresso-700/70 dark:text-steam-300 mb-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {currentBean.name}
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Shot #{shot.shotNumber}</h1>
          {!isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-espresso-700/50 dark:text-steam-400 hover:text-espresso-900 dark:hover:text-steam-50"
                aria-label="Edit shot"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-red-500/70 hover:text-red-500"
                aria-label="Delete shot"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="px-4 pb-4">
        {isEditing ? (
          <div className="space-y-4">
            <ShotForm
              beanId={currentBean.id}
              previousShot={shot}
              onSubmit={handleEdit}
              onCancel={() => setIsEditing(false)}
              submitLabel="Save Changes"
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Shot Details Card */}
            <Card>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-espresso-700/60 dark:text-steam-300">Dose</span>
                  <p className="text-lg font-semibold text-espresso-900 dark:text-steam-50">
                    {shot.doseGrams}g
                  </p>
                </div>
                <div>
                  <span className="text-xs text-espresso-700/60 dark:text-steam-300">Yield</span>
                  <p className="text-lg font-semibold text-espresso-900 dark:text-steam-50">
                    {shot.yieldGrams}g
                  </p>
                </div>
                <div>
                  <span className="text-xs text-espresso-700/60 dark:text-steam-300">Time</span>
                  <p className="text-lg font-semibold text-espresso-900 dark:text-steam-50">
                    {shot.timeSeconds}s
                  </p>
                </div>
                <div>
                  <span className="text-xs text-espresso-700/60 dark:text-steam-300">Ratio</span>
                  <p className="text-lg font-semibold text-espresso-900 dark:text-steam-50">
                    {formatRatio(shot.ratio)}
                  </p>
                </div>
                {shot.grindSetting && (
                  <div className="col-span-2">
                    <span className="text-xs text-espresso-700/60 dark:text-steam-300">Grind</span>
                    <p className="text-lg font-semibold text-espresso-900 dark:text-steam-50">
                      {shot.grindSetting}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Taste */}
            <Card>
              <span className="text-xs text-espresso-700/60 dark:text-steam-300">Taste</span>
              <p className={`text-lg font-semibold ${getBalanceColor(shot.taste.balance)}`}>
                {getBalanceLabel(shot.taste.balance)}
              </p>
            </Card>

            {/* Notes */}
            {shot.notes && (
              <Card>
                <span className="text-xs text-espresso-700/60 dark:text-steam-300">Notes</span>
                <p className="text-espresso-900 dark:text-steam-50 mt-1">
                  {shot.notes}
                </p>
              </Card>
            )}

            {/* Dialed indicator */}
            {shot.isDialedShot && (
              <Card className="bg-dialed-light dark:bg-dialed-dm-bg border-dialed/30 dark:border-dialed-dm-text/30">
                <div className="flex items-center gap-2 text-dialed-dark dark:text-dialed-dm-text">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">This is your dialed recipe</span>
                </div>
              </Card>
            )}

            {/* Timestamp */}
            <p className="text-xs text-espresso-700/50 dark:text-steam-400 text-center">
              Logged {new Date(shot.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </main>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Shot?"
        message={`Delete Shot #${shot.shotNumber}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
```

### 9. Update ShotList with Navigation and Swipe Delete

Update `src/components/bean/ShotList.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Shot } from '../../types';
import { Card, ConfirmModal } from '../shared';
import { getBalanceLabel, getBalanceColor } from '../../utils/calculations';

interface ShotListProps {
  shots: Shot[];
  beanId: string;
  onDeleteShot?: (shotId: string) => void;
}

export function ShotList({ shots, beanId, onDeleteShot }: ShotListProps) {
  const navigate = useNavigate();
  const [swipedShotId, setSwipedShotId] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shotToDelete, setShotToDelete] = useState<Shot | null>(null);

  if (shots.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-espresso-700/50 dark:text-steam-400 text-sm">
          No shots logged yet
        </p>
        <p className="text-espresso-700/40 dark:text-steam-500 text-xs mt-1">
          Tap the button above to log your first shot
        </p>
      </div>
    );
  }

  const handleTouchStart = (e: React.TouchEvent, shotId: string) => {
    setTouchStart(e.touches[0].clientX);
    // Reset other swiped items
    if (swipedShotId !== shotId) {
      setSwipedShotId(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent, shotId: string) => {
    if (touchStart === null) return;
    
    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;
    
    // Swipe left threshold
    if (diff > 50) {
      setSwipedShotId(shotId);
    } else if (diff < -50) {
      setSwipedShotId(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  const handleDeleteClick = (shot: Shot, e: React.MouseEvent) => {
    e.stopPropagation();
    setShotToDelete(shot);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (shotToDelete && onDeleteShot) {
      onDeleteShot(shotToDelete.id);
    }
    setShowDeleteModal(false);
    setShotToDelete(null);
    setSwipedShotId(null);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-espresso-700 dark:text-steam-200">
        Shot History
      </h3>
      {shots.map((shot) => (
        <div
          key={shot.id}
          className="relative overflow-hidden rounded-2xl"
          onTouchStart={(e) => handleTouchStart(e, shot.id)}
          onTouchMove={(e) => handleTouchMove(e, shot.id)}
          onTouchEnd={handleTouchEnd}
        >
          {/* Delete button (revealed on swipe) */}
          <div
            className={`
              absolute right-0 top-0 bottom-0 w-20 bg-red-500 
              flex items-center justify-center
              transition-opacity duration-200
              ${swipedShotId === shot.id ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <button
              onClick={(e) => handleDeleteClick(shot, e)}
              className="text-white p-2"
              aria-label="Delete shot"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Shot card */}
          <Card
            padding="sm"
            className={`
              cursor-pointer active:scale-[0.99] transition-all duration-200
              ${shot.isDialedShot ? 'ring-2 ring-dialed dark:ring-dialed-dm-text' : ''}
              ${swipedShotId === shot.id ? '-translate-x-20' : 'translate-x-0'}
            `}
            onClick={() => navigate(`/bean/${beanId}/shot/${shot.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-espresso-700/50 dark:text-steam-400 w-6">
                  #{shot.shotNumber}
                </span>
                <div className="text-sm">
                  <span className="text-espresso-900 dark:text-steam-50">
                    {shot.doseGrams}g → {shot.yieldGrams}g
                  </span>
                  <span className="text-espresso-700/50 dark:text-steam-400 mx-2">
                    in {shot.timeSeconds}s
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium ${getBalanceColor(shot.taste.balance)}`}>
                  {getBalanceLabel(shot.taste.balance)}
                </span>
                {shot.isDialedShot && (
                  <div className="text-xs text-dialed dark:text-dialed-dm-text mt-0.5">
                    ★ Dialed
                  </div>
                )}
              </div>
            </div>
            {shot.notes && (
              <p className="text-xs text-espresso-700/60 dark:text-steam-300 mt-1 ml-9 truncate">
                {shot.notes}
              </p>
            )}
          </Card>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setShotToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Shot?"
        message={`Delete Shot #${shotToDelete?.shotNumber}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
```

### 10. Update BeanDetail to Pass Delete Handler

Update `src/pages/BeanDetail.tsx` to pass the delete handler to ShotList:

Find the `<ShotList>` component and update it:

```tsx
<ShotList 
  shots={shots} 
  beanId={currentBean.id}
  onDeleteShot={async (shotId) => {
    await useShotStore.getState().removeShot(shotId, currentBean.id);
    // Reload shots
    const updatedShots = await getShotsForBean(currentBean.id);
    setShots(updatedShots);
  }}
/>
```

You'll need to import `useShotStore` at the top if not already imported.

### 11. Update Pages Index

Update `src/pages/index.ts`:

```typescript
export { Library } from './Library';
export { BeanDetail } from './BeanDetail';
export { NewBean } from './NewBean';
export { LogShot } from './LogShot';
export { Settings } from './Settings';
export { ShotDetail } from './ShotDetail';
```

### 12. Update Stores Index

Update `src/stores/index.ts`:

```typescript
export { useBeanStore } from './beanStore';
export { useShotStore } from './shotStore';
export { useThemeStore, applyTheme, setupThemeListener } from './themeStore';
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] `npm run test:run` — all tests pass
- [ ] `npm run lint` — no errors
- [ ] `npm run build` — builds successfully

Manual testing:
- [ ] Export data, then import same file — data restored
- [ ] Import shows confirmation with bean/shot count
- [ ] Invalid import file shows error message
- [ ] Tap shot in list → opens shot detail page
- [ ] Edit shot → changes persist
- [ ] Delete shot (via button) → removes shot
- [ ] Swipe left on shot → reveals delete button
- [ ] Empty shot list shows helpful message
- [ ] Theme selector works (light/dark/system)
- [ ] Theme persists after reload
- [ ] iOS status bar blends with app (test on device/simulator)

---

## Notes for Agent

- The swipe-to-delete uses touch events; test on mobile or with DevTools touch simulation
- Theme changes should be instant, no page reload needed
- Import validation should be strict—don't corrupt user data
- ShotForm needs to work for both create (in LogShot) and edit (in ShotDetail)—make sure `previousShot` prop pre-fills correctly for edit mode
- Version bumped to 0.2.0 in Settings
- Commit message: `feat: add import, shot management, and theme selector`
