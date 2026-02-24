# Agent Task: M9 - Analytics, Telemetry & Enhanced Guidance

**Milestone:** M9  
**Agent:** Claude Code  
**Estimated time:** 60-90 minutes  
**Depends on:** M8 complete

---

## Context

You are adding analytics, anonymous telemetry, equipment profiles, and enhanced origin-aware guidance to "Beanary". This will help understand how users interact with the app and collect data to improve the guidance engine over time.

---

## Objective

1. Integrate PostHog for usage analytics
2. Add equipment profile (grinder + machine) to settings
3. Add bean metadata fields (origin, process, roast level)
4. Implement opt-in anonymous telemetry to Supabase
5. Enhance guidance engine with origin/roast-aware suggestions

**Success criteria:**
- PostHog tracks key events (app opens, shots logged, beans dialed)
- Equipment profile saved in settings
- Bean form includes optional origin/process/roast fields
- Telemetry toggle in settings with info modal explaining what's collected
- When enabled, dial-in data sent to Supabase on "mark as dialed"
- Guidance provides origin-aware first-shot suggestions
- All tests pass

---

## Service Credentials

**PostHog:**
```
API Key: phc_cqw6xKlZHzN4NVXRyc570OA8xVwTtOt652jtJsRvVZW
Host: https://eu.i.posthog.com
```

**Supabase:**
```
URL: https://oytbmabeoxslybpgrbkf.supabase.co
Publishable Key: sb_publishable_VdxWHdvUrAfRAxl-x6k6tQ_W7zHF0YE
```

---

## Files to Create/Modify

```
src/
├── lib/
│   ├── analytics.ts (new)
│   ├── telemetry.ts (new)
│   └── index.ts (new)
├── types/
│   ├── bean.ts (update - add metadata fields)
│   ├── settings.ts (new)
│   └── index.ts (update)
├── stores/
│   ├── settingsStore.ts (new)
│   └── index.ts (update)
├── components/
│   ├── shared/
│   │   ├── Select.tsx (new)
│   │   ├── InfoModal.tsx (new)
│   │   └── index.ts (update)
│   └── bean/
│       ├── BeanForm.tsx (update)
│       └── BeanForm.test.tsx (update)
├── pages/
│   ├── Settings.tsx (update)
│   └── BeanDetail.tsx (update - send telemetry on dial)
├── utils/
│   └── guidance.ts (update - origin-aware)
├── App.tsx (update - init analytics)
└── main.tsx (update - init analytics)
```

---

## Step-by-Step Instructions

### 1. Install Dependencies

```bash
npm install posthog-js
```

### 2. Create Analytics Module

Create `src/lib/analytics.ts`:

```typescript
import posthog from 'posthog-js';

const POSTHOG_KEY = 'phc_cqw6xKlZHzN4NVXRyc570OA8xVwTtOt652jtJsRvVZW';
const POSTHOG_HOST = 'https://eu.i.posthog.com';

let initialized = false;

/**
 * Initialize PostHog analytics.
 * Call once on app startup.
 */
export function initAnalytics(): void {
  if (initialized || typeof window === 'undefined') return;
  
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: false, // We'll track events manually
    capture_pageview: true,
    persistence: 'localStorage',
    disable_session_recording: true,
  });
  
  initialized = true;
}

/**
 * Track a custom event.
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (!initialized) return;
  posthog.capture(eventName, properties);
}

/**
 * Track when a bean is added.
 */
export function trackBeanAdded(bean: {
  hasOrigin: boolean;
  hasProcess: boolean;
  hasRoastLevel: boolean;
}): void {
  trackEvent('bean_added', bean);
}

/**
 * Track when a shot is logged.
 */
export function trackShotLogged(shot: {
  shotNumber: number;
  balance: number;
  ratio: number;
}): void {
  trackEvent('shot_logged', shot);
}

/**
 * Track when a bean is marked as dialed.
 */
export function trackBeanDialed(data: {
  shotsToDialIn: number;
  hasOrigin: boolean;
  hasRoastLevel: boolean;
}): void {
  trackEvent('bean_dialed', data);
}

/**
 * Track when telemetry is enabled/disabled.
 */
export function trackTelemetryToggle(enabled: boolean): void {
  trackEvent('telemetry_toggled', { enabled });
}

/**
 * Track page views manually if needed.
 */
export function trackPageView(pageName: string): void {
  trackEvent('$pageview', { page: pageName });
}
```

### 3. Create Telemetry Module

Create `src/lib/telemetry.ts`:

```typescript
const SUPABASE_URL = 'https://oytbmabeoxslybpgrbkf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VdxWHdvUrAfRAxl-x6k6tQ_W7zHF0YE';

export interface TelemetryData {
  grinder?: string;
  machine?: string;
  origin?: string;
  process?: string;
  roast_level?: string;
  shots_to_dial_in?: number;
  final_ratio?: number;
  final_time?: number;
  final_dose?: number;
  final_yield?: number;
}

/**
 * Send anonymous telemetry data to Supabase.
 * Only call this if user has opted in.
 */
export async function sendTelemetry(data: TelemetryData): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/telemetry`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(data),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Telemetry send failed:', error);
    return false;
  }
}

/**
 * The data points we collect (for displaying to users).
 */
export const TELEMETRY_DATA_POINTS = [
  'Grinder model',
  'Espresso machine model',
  'Bean origin (e.g., Ethiopia, Brazil)',
  'Bean process (e.g., washed, natural)',
  'Roast level (light, medium, dark)',
  'Number of shots to dial in',
  'Final recipe (dose, yield, time, ratio)',
];

/**
 * What we explicitly DON'T collect.
 */
export const TELEMETRY_NOT_COLLECTED = [
  'Your name or email',
  'Bean names or roaster names',
  'Personal notes',
  'Any identifying information',
  'Your location',
];
```

### 4. Create Lib Barrel Export

Create `src/lib/index.ts`:

```typescript
export { initAnalytics, trackEvent, trackBeanAdded, trackShotLogged, trackBeanDialed, trackTelemetryToggle } from './analytics';
export { sendTelemetry, TELEMETRY_DATA_POINTS, TELEMETRY_NOT_COLLECTED, type TelemetryData } from './telemetry';
```

### 5. Create Settings Types

Create `src/types/settings.ts`:

```typescript
/**
 * User's equipment profile.
 */
export interface EquipmentProfile {
  grinder: string;
  machine: string;
}

/**
 * App settings stored locally.
 */
export interface AppSettings {
  equipment: EquipmentProfile;
  telemetryEnabled: boolean;
}

/**
 * Common grinder options for suggestions.
 */
export const COMMON_GRINDERS = [
  'Eureka Mignon (Specialita/Silenzio/etc)',
  'Baratza Sette 270',
  'Baratza Encore',
  'Niche Zero',
  '1Zpresso JX Pro',
  '1Zpresso K-Max',
  'Comandante C40',
  'Breville Smart Grinder Pro',
  'DF64 / Turin',
  'Timemore Chestnut',
  'Other',
];

/**
 * Common machine options for suggestions.
 */
export const COMMON_MACHINES = [
  'Breville Barista Express',
  'Breville Barista Pro',
  'Breville Bambino',
  'Gaggia Classic Pro',
  'Rancilio Silvia',
  'Lelit Anna',
  'Lelit MaraX',
  'Profitec Pro 300',
  'Decent DE1',
  'La Marzocco Linea Mini',
  'Flair (manual)',
  'Robot (manual)',
  'Other',
];
```

### 6. Update Bean Types

Update `src/types/bean.ts` to add metadata fields:

Add these new fields to the `Bean` interface after `notes`:

```typescript
/** Country/region of origin (optional) */
origin: string | null;

/** Processing method (optional) */
process: BeanProcess | null;

/** Roast level (optional) */
roastLevel: RoastLevel | null;
```

Add these type definitions before the `Bean` interface:

```typescript
/**
 * Bean processing methods.
 */
export type BeanProcess = 'washed' | 'natural' | 'honey' | 'anaerobic' | 'other';

/**
 * Roast levels.
 */
export type RoastLevel = 'light' | 'medium' | 'medium-dark' | 'dark';

/**
 * Common coffee origins for suggestions.
 */
export const COMMON_ORIGINS = [
  'Ethiopia',
  'Kenya',
  'Colombia',
  'Brazil',
  'Guatemala',
  'Costa Rica',
  'Panama',
  'Peru',
  'Rwanda',
  'Burundi',
  'Indonesia',
  'Vietnam',
  'Yemen',
  'Blend',
  'Other',
];
```

### 7. Update Types Index

Update `src/types/index.ts` to export new types:

```typescript
// Add to existing exports
export type { BeanProcess, RoastLevel } from './bean';
export { COMMON_ORIGINS } from './bean';

export type { EquipmentProfile, AppSettings } from './settings';
export { COMMON_GRINDERS, COMMON_MACHINES } from './settings';
```

### 8. Update Form Types

Update `src/types/forms.ts` to include new bean fields:

Add to `CreateBeanInput`:

```typescript
origin?: string | null;
process?: BeanProcess | null;
roastLevel?: RoastLevel | null;
```

### 9. Create Settings Store

Create `src/stores/settingsStore.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EquipmentProfile } from '../types';

interface SettingsState {
  equipment: EquipmentProfile;
  telemetryEnabled: boolean;
  
  setEquipment: (equipment: Partial<EquipmentProfile>) => void;
  setTelemetryEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      equipment: {
        grinder: '',
        machine: '',
      },
      telemetryEnabled: false,
      
      setEquipment: (equipment) => {
        set({
          equipment: {
            ...get().equipment,
            ...equipment,
          },
        });
      },
      
      setTelemetryEnabled: (enabled) => {
        set({ telemetryEnabled: enabled });
      },
    }),
    {
      name: 'beanary-settings',
    }
  )
);
```

### 10. Update Stores Index

Update `src/stores/index.ts`:

```typescript
export { useBeanStore } from './beanStore';
export { useShotStore } from './shotStore';
export { useThemeStore, applyTheme, setupThemeListener } from './themeStore';
export { useSettingsStore } from './settingsStore';
```

### 11. Create Select Component

Create `src/components/shared/Select.tsx`:

```tsx
import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs text-espresso-700/60 dark:text-steam-300 mb-1"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full h-11 px-3 rounded-lg
            bg-crema-50 dark:bg-roast-800
            border border-crema-200 dark:border-roast-600
            text-espresso-900 dark:text-steam-50
            focus:outline-none focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" className="text-crema-400">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';
```

### 12. Create InfoModal Component

Create `src/components/shared/InfoModal.tsx`:

```tsx
import { Modal } from './Modal';
import { Button } from './Button';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function InfoModal({ isOpen, onClose, title, children }: InfoModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={
        <Button onClick={onClose}>Got it</Button>
      }
    >
      {children}
    </Modal>
  );
}
```

### 13. Update Shared Components Index

Update `src/components/shared/index.ts`:

```typescript
// Add to existing exports
export { Select } from './Select';
export { InfoModal } from './InfoModal';
```

### 14. Update BeanForm Component

Update `src/components/bean/BeanForm.tsx` to include origin, process, and roast level fields:

Add imports:
```typescript
import { Select } from '../shared';
import { COMMON_ORIGINS, type BeanProcess, type RoastLevel } from '../../types';
```

Add state for new fields (after existing state):
```typescript
const [origin, setOrigin] = useState(initialValues.origin || '');
const [process, setProcess] = useState<BeanProcess | ''>(initialValues.process || '');
const [roastLevel, setRoastLevel] = useState<RoastLevel | ''>(initialValues.roastLevel || '');
```

Add these fields to the form JSX (after roast date, before notes):

```tsx
{/* Origin */}
<Select
  label="Origin (optional)"
  placeholder="Select origin..."
  value={origin}
  onChange={(e) => setOrigin(e.target.value)}
  disabled={isLoading}
  options={COMMON_ORIGINS.map((o) => ({ value: o, label: o }))}
/>

{/* Process */}
<Select
  label="Process (optional)"
  placeholder="Select process..."
  value={process}
  onChange={(e) => setProcess(e.target.value as BeanProcess | '')}
  disabled={isLoading}
  options={[
    { value: 'washed', label: 'Washed' },
    { value: 'natural', label: 'Natural' },
    { value: 'honey', label: 'Honey' },
    { value: 'anaerobic', label: 'Anaerobic' },
    { value: 'other', label: 'Other' },
  ]}
/>

{/* Roast Level */}
<Select
  label="Roast Level (optional)"
  placeholder="Select roast level..."
  value={roastLevel}
  onChange={(e) => setRoastLevel(e.target.value as RoastLevel | '')}
  disabled={isLoading}
  options={[
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'medium-dark', label: 'Medium-Dark' },
    { value: 'dark', label: 'Dark' },
  ]}
/>
```

Update the `handleSubmit` to include new fields:

```typescript
onSubmit({
  name: name.trim(),
  roaster: roaster.trim(),
  roastDate: roastDate || null,
  notes: notes.trim(),
  origin: origin || null,
  process: process || null,
  roastLevel: roastLevel || null,
});
```

### 15. Update Bean Repository

Update `src/db/beanRepository.ts` to handle new fields.

In `createBean`:
```typescript
const bean: Bean = {
  id: generateId(),
  name: input.name,
  roaster: input.roaster,
  roastDate: input.roastDate ?? null,
  rating: null,
  notes: input.notes ?? '',
  origin: input.origin ?? null,
  process: input.process ?? null,
  roastLevel: input.roastLevel ?? null,
  dialedRecipe: null,
  isDialedIn: false,
  createdAt: now,
  updatedAt: now,
};
```

In `updateBean`, add handling for new fields if they're in the input.

### 16. Update Settings Page

Update `src/pages/Settings.tsx` to add equipment profile and telemetry toggle:

Add imports:
```typescript
import { useSettingsStore } from '../stores/settingsStore';
import { 
  trackTelemetryToggle, 
  TELEMETRY_DATA_POINTS, 
  TELEMETRY_NOT_COLLECTED 
} from '../lib';
import { Select, InfoModal } from '../components/shared';
import { COMMON_GRINDERS, COMMON_MACHINES } from '../types';
```

Add state and store access:
```typescript
const { equipment, telemetryEnabled, setEquipment, setTelemetryEnabled } = useSettingsStore();
const [showTelemetryInfo, setShowTelemetryInfo] = useState(false);
```

Add Equipment Profile card (after Appearance card):

```tsx
{/* Equipment Profile */}
<Card>
  <h2 className="font-medium text-espresso-900 dark:text-steam-50 mb-3">
    My Equipment
  </h2>
  <p className="text-sm text-espresso-700/70 dark:text-steam-300 mb-4">
    Help us provide better recommendations by telling us what you use.
  </p>
  <div className="space-y-3">
    <Select
      label="Grinder"
      placeholder="Select your grinder..."
      value={equipment.grinder}
      onChange={(e) => setEquipment({ grinder: e.target.value })}
      options={COMMON_GRINDERS.map((g) => ({ value: g, label: g }))}
    />
    <Select
      label="Machine"
      placeholder="Select your machine..."
      value={equipment.machine}
      onChange={(e) => setEquipment({ machine: e.target.value })}
      options={COMMON_MACHINES.map((m) => ({ value: m, label: m }))}
    />
  </div>
</Card>
```

Add Telemetry toggle card (after Equipment Profile):

```tsx
{/* Anonymous Telemetry */}
<Card>
  <div className="flex items-start justify-between mb-3">
    <h2 className="font-medium text-espresso-900 dark:text-steam-50">
      Help Improve Beanary
    </h2>
    <button
      onClick={() => setShowTelemetryInfo(true)}
      className="p-1 text-espresso-700/50 dark:text-steam-400 hover:text-caramel-500"
      aria-label="Learn more about telemetry"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  </div>
  <p className="text-sm text-espresso-700/70 dark:text-steam-300 mb-4">
    Share anonymous dial-in data to help us build better recommendations for everyone.
  </p>
  <label className="flex items-center gap-3 cursor-pointer">
    <div className="relative">
      <input
        type="checkbox"
        checked={telemetryEnabled}
        onChange={(e) => {
          setTelemetryEnabled(e.target.checked);
          trackTelemetryToggle(e.target.checked);
        }}
        className="sr-only"
      />
      <div className={`
        w-10 h-6 rounded-full transition-colors
        ${telemetryEnabled ? 'bg-caramel-500' : 'bg-crema-300 dark:bg-roast-600'}
      `}>
        <div className={`
          absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform
          ${telemetryEnabled ? 'translate-x-4' : 'translate-x-0'}
        `} />
      </div>
    </div>
    <span className="text-sm text-espresso-900 dark:text-steam-50">
      Share anonymous data
    </span>
  </label>
</Card>
```

Add the InfoModal at the end (before closing div):

```tsx
{/* Telemetry Info Modal */}
<InfoModal
  isOpen={showTelemetryInfo}
  onClose={() => setShowTelemetryInfo(false)}
  title="About Anonymous Data Sharing"
>
  <div className="space-y-4">
    <div>
      <h3 className="font-medium text-espresso-900 dark:text-steam-50 mb-2">
        What we collect:
      </h3>
      <ul className="text-sm text-espresso-700/70 dark:text-steam-300 space-y-1">
        {TELEMETRY_DATA_POINTS.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <span className="text-dialed dark:text-dialed-dm-text">•</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
    <div>
      <h3 className="font-medium text-espresso-900 dark:text-steam-50 mb-2">
        What we never collect:
      </h3>
      <ul className="text-sm text-espresso-700/70 dark:text-steam-300 space-y-1">
        {TELEMETRY_NOT_COLLECTED.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <span className="text-red-500">✕</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
    <p className="text-sm text-espresso-700/70 dark:text-steam-300">
      This data helps us understand what equipment and beans are popular, and improve our dial-in recommendations for everyone.
    </p>
  </div>
</InfoModal>
```

### 17. Update BeanDetail to Send Telemetry

Update `src/pages/BeanDetail.tsx`:

Add imports:
```typescript
import { useSettingsStore } from '../stores/settingsStore';
import { sendTelemetry, trackBeanDialed } from '../lib';
```

In the component, get settings:
```typescript
const { equipment, telemetryEnabled } = useSettingsStore();
```

Update the `handleMarkAsDialed` (or wherever dialBean is called) to send telemetry:

```typescript
const handleMarkAsDialed = async (shotId: string) => {
  await dialBean(currentBean.id, shotId);
  
  // Track in analytics
  trackBeanDialed({
    shotsToDialIn: shots.length,
    hasOrigin: !!currentBean.origin,
    hasRoastLevel: !!currentBean.roastLevel,
  });
  
  // Send telemetry if enabled
  if (telemetryEnabled) {
    const dialedShot = shots.find(s => s.id === shotId);
    if (dialedShot) {
      sendTelemetry({
        grinder: equipment.grinder || undefined,
        machine: equipment.machine || undefined,
        origin: currentBean.origin || undefined,
        process: currentBean.process || undefined,
        roast_level: currentBean.roastLevel || undefined,
        shots_to_dial_in: shots.length,
        final_ratio: dialedShot.ratio,
        final_time: dialedShot.timeSeconds,
        final_dose: dialedShot.doseGrams,
        final_yield: dialedShot.yieldGrams,
      });
    }
  }
};
```

### 18. Update LogShot to Track Events

Update `src/pages/LogShot.tsx`:

Add import:
```typescript
import { trackShotLogged } from '../lib';
```

After successfully adding a shot, track it:
```typescript
const handleSubmit = async (input: CreateShotInput) => {
  try {
    const shot = await addShot(input);
    
    // Track event
    trackShotLogged({
      shotNumber: shot.shotNumber,
      balance: shot.taste.balance,
      ratio: shot.ratio,
    });
    
    setJustLoggedShot(shot);
    setPageState('result');
  } catch (e) {
    // Error handled in store
  }
};
```

### 19. Update NewBean to Track Events

Update `src/pages/NewBean.tsx`:

Add import:
```typescript
import { trackBeanAdded } from '../lib';
```

After successfully adding a bean, track it:
```typescript
const handleSubmit = async (values: Parameters<typeof addBean>[0]) => {
  try {
    const bean = await addBean(values);
    
    // Track event
    trackBeanAdded({
      hasOrigin: !!values.origin,
      hasProcess: !!values.process,
      hasRoastLevel: !!values.roastLevel,
    });
    
    navigate(`/bean/${bean.id}`);
  } catch (e) {
    // Error handled in store
  }
};
```

### 20. Initialize Analytics in App

Update `src/main.tsx`:

Add import and initialization:
```typescript
import { initAnalytics } from './lib';

// Initialize analytics before rendering
initAnalytics();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 21. Update Guidance Engine with Origin Awareness

Update `src/utils/guidance.ts`:

Update the `GuidanceInput` interface:
```typescript
export interface ExtendedGuidanceInput extends GuidanceInput {
  beanMetadata?: {
    origin?: string | null;
    process?: string | null;
    roastLevel?: string | null;
  };
}
```

Add origin-aware first shot guidance. Create a new function:

```typescript
/**
 * Get origin-specific starting tips.
 */
function getOriginTips(origin: string | null | undefined): string | null {
  if (!origin) return null;
  
  const tips: Record<string, string> = {
    'Brazil': 'Brazilian beans often flow faster and are forgiving. Consider starting slightly finer.',
    'Ethiopia': 'Ethiopian coffees can be dense, especially naturals. Start medium and adjust based on taste.',
    'Kenya': 'Kenyan beans are often dense and bright. May need a finer grind for full extraction.',
    'Colombia': 'Colombian coffees are generally balanced and forgiving. A good baseline bean.',
    'Guatemala': 'Guatemalan beans often have good body. Standard grind settings usually work well.',
    'Indonesia': 'Indonesian coffees (Sumatra, Java) often benefit from a coarser grind due to lower density.',
  };
  
  return tips[origin] || null;
}

/**
 * Get roast-level-specific tips.
 */
function getRoastTips(roastLevel: string | null | undefined): string | null {
  if (!roastLevel) return null;
  
  const tips: Record<string, string> = {
    'light': 'Light roasts are denser and need more extraction. Grind finer and consider longer ratios (1:2.2+).',
    'medium': 'Medium roasts are versatile. Start with a standard 1:2 ratio.',
    'medium-dark': 'Medium-dark roasts extract easier. Be careful not to over-extract.',
    'dark': 'Dark roasts are brittle and extract quickly. Grind coarser and pull shorter (1:1.5-2).',
  };
  
  return tips[roastLevel] || null;
}
```

Update `generateGuidance` to accept extended input and use these tips for first shots:

```typescript
export function generateGuidance(input: ExtendedGuidanceInput): GuidanceSuggestion {
  const { currentShot, previousShot, beanMetadata } = input;
  const { balance } = currentShot.taste;
  const time = currentShot.timeSeconds;

  // First shot - give guidance based on bean metadata if available
  if (!previousShot) {
    return getFirstShotGuidance(balance, time, beanMetadata);
  }
  
  // ... rest of existing logic
}
```

Update `getFirstShotGuidance` to include bean metadata:

```typescript
function getFirstShotGuidance(
  balance: number,
  time: number,
  metadata?: ExtendedGuidanceInput['beanMetadata']
): GuidanceSuggestion {
  // If balanced on first shot, great!
  if (balance === 0) {
    return {
      action: 'none',
      message: 'Great start!',
      confidence: 'medium',
      reasoning: 'First shot tastes balanced. Pull another to confirm before marking as dialed.',
    };
  }

  // Build reasoning with origin/roast tips
  const originTip = getOriginTips(metadata?.origin);
  const roastTip = getRoastTips(metadata?.roastLevel);
  
  // Sour first shot
  if (balance < 0) {
    let reasoning = `Shot tastes sour at ${time}s.`;
    
    if (time < TIME_FAST) {
      reasoning = `Shot ran fast (${time}s) and tastes sour. Finer grind will slow extraction and add sweetness.`;
    }
    
    if (originTip) reasoning += ` Note: ${originTip}`;
    if (roastTip) reasoning += ` ${roastTip}`;
    
    return {
      action: 'grind-finer',
      message: time < TIME_FAST ? 'Grind finer' : 'Try grinding finer',
      confidence: time < TIME_FAST ? 'high' : 'medium',
      reasoning,
    };
  }

  // Bitter first shot
  let reasoning = `Shot tastes bitter at ${time}s.`;
  
  if (time > TIME_SLOW) {
    reasoning = `Shot ran slow (${time}s) and tastes bitter. Coarser grind will speed up extraction.`;
  }
  
  if (originTip) reasoning += ` Note: ${originTip}`;
  if (roastTip) reasoning += ` ${roastTip}`;

  return {
    action: 'grind-coarser',
    message: time > TIME_SLOW ? 'Grind coarser' : 'Try grinding coarser',
    confidence: time > TIME_SLOW ? 'high' : 'medium',
    reasoning,
  };
}
```

### 22. Update ShotComparison to Pass Bean Metadata

Update `src/components/shot/ShotComparison.tsx`:

Update the props interface:
```typescript
interface ShotComparisonProps {
  currentShot: Shot;
  previousShot?: Shot | null;
  beanMetadata?: {
    origin?: string | null;
    process?: string | null;
    roastLevel?: string | null;
  };
  onMarkAsDialed?: () => void;
  isDialLoading?: boolean;
}
```

Update the guidance call:
```typescript
const guidance = generateGuidance({
  currentShot,
  previousShot: previousShot || null,
  beanMetadata,
});
```

### 23. Update LogShot to Pass Bean Metadata

In `src/pages/LogShot.tsx`, pass bean metadata to ShotComparison:

```tsx
<ShotComparison
  currentShot={justLoggedShot}
  previousShot={previousShot}
  beanMetadata={{
    origin: currentBean?.origin,
    process: currentBean?.process,
    roastLevel: currentBean?.roastLevel,
  }}
  onMarkAsDialed={handleMarkAsDialed}
  isDialLoading={isDialing}
/>
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] `npm run test:run` — all tests pass
- [ ] `npm run lint` — no errors
- [ ] `npm run build` — builds successfully

Manual testing:
- [ ] Add a bean with origin, process, roast level → fields save correctly
- [ ] Equipment profile in settings → grinder/machine save and persist
- [ ] Telemetry toggle → shows info modal when clicking (i) icon
- [ ] Enable telemetry → dial a bean → check Supabase table for new row
- [ ] First shot on Ethiopian light roast → guidance mentions origin/roast tips
- [ ] Open PostHog dashboard → see events appearing

---

## Notes for Agent

- The PostHog key and Supabase credentials are intentionally in the code (they're public keys)
- Telemetry is OFF by default—users must opt in
- Keep the info modal content clear and honest about what's collected
- Bean metadata fields are all optional—don't break existing functionality
- Analytics events should not block the UI—fire and forget
- Update version to 0.3.0 in Settings
- Commit message: `feat: add analytics, telemetry, equipment profiles, and enhanced guidance`
