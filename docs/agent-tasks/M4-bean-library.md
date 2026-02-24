# Agent Task: M4 - Bean Library

**Milestone:** M4  
**Agent:** Claude Code  
**Estimated time:** 90-120 minutes  
**Depends on:** M1 (Types), M2 (Data Layer), M3 (UI Shell) complete

---

## Context

You are building the bean library feature for "Beanary", an espresso dial-in companion app. This is the core feature—users manage their coffee bean collection here.

Read the following documentation files before starting:
- `/docs/03-data-models.md` — Bean type definition
- `/docs/05-design-system.md` — Visual design specs
- `/docs/04-feature-milestones.md` — M4 acceptance criteria

Reference the mockup for visual guidance:
- `/design/bean-library-light-dark.html` (if available)

---

## Objective

Build the complete bean library feature end-to-end:
- List all beans
- Add new beans
- View bean detail with shot history
- Edit beans
- Delete beans
- Show dialed recipe prominently
- Handle empty states

**Success criteria:**
- Can add a new bean and see it in library
- Can tap a bean to see detail page
- Dialed beans show recipe prominently
- Can edit bean name, roaster, notes, rating
- Can delete bean (with confirmation)
- Empty library shows helpful empty state
- Library sorts by most recently updated
- All tests pass

---

## Files to Create/Modify

```
src/components/bean/
├── BeanCard.tsx
├── BeanCard.test.tsx
├── BeanForm.tsx
├── BeanForm.test.tsx
├── BeanRecipe.tsx
├── ShotList.tsx
└── index.ts

src/pages/
├── Library.tsx (update)
├── BeanDetail.tsx (update)
├── NewBean.tsx (update)

src/stores/
├── beanStore.ts
└── beanStore.test.ts
```

---

## Step-by-Step Instructions

### 1. Create Bean Store (Zustand)

Create `src/stores/beanStore.ts`:

```typescript
import { create } from 'zustand';
import type { Bean } from '../types';
import {
  getAllBeans,
  getBeanById,
  createBean,
  updateBean,
  deleteBean,
  markBeanAsDialed,
  clearDialedStatus,
} from '../db';
import type { CreateBeanInput, UpdateBeanInput } from '../types';

interface BeanState {
  beans: Bean[];
  currentBean: Bean | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadBeans: () => Promise<void>;
  loadBean: (id: string) => Promise<void>;
  addBean: (input: CreateBeanInput) => Promise<Bean>;
  editBean: (input: UpdateBeanInput) => Promise<void>;
  removeBean: (id: string) => Promise<void>;
  dialBean: (beanId: string, shotId: string) => Promise<void>;
  undialBean: (beanId: string) => Promise<void>;
  clearError: () => void;
}

export const useBeanStore = create<BeanState>((set, get) => ({
  beans: [],
  currentBean: null,
  isLoading: false,
  error: null,

  loadBeans: async () => {
    set({ isLoading: true, error: null });
    try {
      const beans = await getAllBeans();
      set({ beans, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to load beans', isLoading: false });
    }
  },

  loadBean: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const bean = await getBeanById(id);
      set({ currentBean: bean || null, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to load bean', isLoading: false });
    }
  },

  addBean: async (input: CreateBeanInput) => {
    set({ isLoading: true, error: null });
    try {
      const bean = await createBean(input);
      const beans = await getAllBeans();
      set({ beans, isLoading: false });
      return bean;
    } catch (e) {
      set({ error: 'Failed to add bean', isLoading: false });
      throw e;
    }
  },

  editBean: async (input: UpdateBeanInput) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateBean(input);
      const beans = await getAllBeans();
      set({
        beans,
        currentBean: get().currentBean?.id === input.id ? updated : get().currentBean,
        isLoading: false,
      });
    } catch (e) {
      set({ error: 'Failed to update bean', isLoading: false });
      throw e;
    }
  },

  removeBean: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteBean(id);
      const beans = await getAllBeans();
      set({
        beans,
        currentBean: get().currentBean?.id === id ? null : get().currentBean,
        isLoading: false,
      });
    } catch (e) {
      set({ error: 'Failed to delete bean', isLoading: false });
      throw e;
    }
  },

  dialBean: async (beanId: string, shotId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await markBeanAsDialed(beanId, shotId);
      const beans = await getAllBeans();
      set({
        beans,
        currentBean: get().currentBean?.id === beanId ? updated : get().currentBean,
        isLoading: false,
      });
    } catch (e) {
      set({ error: 'Failed to mark as dialed', isLoading: false });
      throw e;
    }
  },

  undialBean: async (beanId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await clearDialedStatus(beanId);
      const beans = await getAllBeans();
      set({
        beans,
        currentBean: get().currentBean?.id === beanId ? updated : get().currentBean,
        isLoading: false,
      });
    } catch (e) {
      set({ error: 'Failed to clear dialed status', isLoading: false });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));
```

Create `src/stores/beanStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useBeanStore } from './beanStore';
import { resetDatabase } from '../db';

describe('beanStore', () => {
  beforeEach(async () => {
    await resetDatabase();
    useBeanStore.setState({
      beans: [],
      currentBean: null,
      isLoading: false,
      error: null,
    });
  });

  it('starts with empty state', () => {
    const state = useBeanStore.getState();
    expect(state.beans).toEqual([]);
    expect(state.currentBean).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('loads empty beans list', async () => {
    await useBeanStore.getState().loadBeans();
    const state = useBeanStore.getState();
    expect(state.beans).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('adds a bean', async () => {
    const bean = await useBeanStore.getState().addBean({
      name: 'Test Bean',
      roaster: 'Test Roaster',
    });

    expect(bean.name).toBe('Test Bean');
    
    const state = useBeanStore.getState();
    expect(state.beans).toHaveLength(1);
    expect(state.beans[0].name).toBe('Test Bean');
  });

  it('loads a specific bean', async () => {
    const bean = await useBeanStore.getState().addBean({
      name: 'Test Bean',
      roaster: 'Test Roaster',
    });

    await useBeanStore.getState().loadBean(bean.id);
    
    const state = useBeanStore.getState();
    expect(state.currentBean).not.toBeNull();
    expect(state.currentBean?.id).toBe(bean.id);
  });

  it('edits a bean', async () => {
    const bean = await useBeanStore.getState().addBean({
      name: 'Original',
      roaster: 'Roaster',
    });

    await useBeanStore.getState().editBean({
      id: bean.id,
      name: 'Updated',
    });

    const state = useBeanStore.getState();
    expect(state.beans[0].name).toBe('Updated');
  });

  it('removes a bean', async () => {
    const bean = await useBeanStore.getState().addBean({
      name: 'Test',
      roaster: 'Roaster',
    });

    await useBeanStore.getState().removeBean(bean.id);

    const state = useBeanStore.getState();
    expect(state.beans).toHaveLength(0);
  });

  it('clears error', () => {
    useBeanStore.setState({ error: 'Some error' });
    useBeanStore.getState().clearError();
    expect(useBeanStore.getState().error).toBeNull();
  });
});
```

### 2. Create BeanCard Component

Create `src/components/bean/BeanCard.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';
import type { Bean } from '../../types';
import { Card, CardDivider, DialedBadge, ProgressBadge, StarRating } from '../shared';

interface BeanCardProps {
  bean: Bean;
  shotCount?: number;
}

export function BeanCard({ bean, shotCount = 0 }: BeanCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/bean/${bean.id}`);
  };

  return (
    <Card
      className="cursor-pointer active:scale-[0.99] transition-transform"
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h2 className="font-medium text-espresso-900 dark:text-steam-50 truncate">
            {bean.name}
          </h2>
          <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-0.5 truncate">
            {bean.roaster}
          </p>
        </div>
        <div className="ml-2 flex-shrink-0">
          {bean.isDialedIn ? (
            <DialedBadge />
          ) : shotCount > 0 ? (
            <ProgressBadge />
          ) : null}
        </div>
      </div>

      {/* Recipe (if dialed) */}
      {bean.dialedRecipe && (
        <CardDivider>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-espresso-700/60 dark:text-steam-300">Dose</span>
              <p className="font-medium text-espresso-900 dark:text-steam-50">
                {bean.dialedRecipe.doseGrams}g
              </p>
            </div>
            <div className="text-espresso-700/30 dark:text-steam-400">→</div>
            <div>
              <span className="text-espresso-700/60 dark:text-steam-300">Yield</span>
              <p className="font-medium text-espresso-900 dark:text-steam-50">
                {bean.dialedRecipe.yieldGrams}g
              </p>
            </div>
            <div className="text-espresso-700/30 dark:text-steam-400">in</div>
            <div>
              <span className="text-espresso-700/60 dark:text-steam-300">Time</span>
              <p className="font-medium text-espresso-900 dark:text-steam-50">
                {bean.dialedRecipe.timeSeconds}s
              </p>
            </div>
            <div className="ml-auto">
              <span className="text-espresso-700/60 dark:text-steam-300">Ratio</span>
              <p className="font-medium text-espresso-900 dark:text-steam-50">
                1:{bean.dialedRecipe.ratio.toFixed(1)}
              </p>
            </div>
          </div>
        </CardDivider>
      )}

      {/* Progress hint (if not dialed but has shots) */}
      {!bean.isDialedIn && shotCount > 0 && (
        <CardDivider>
          <p className="text-sm text-espresso-700/60 dark:text-steam-300">
            {shotCount} shot{shotCount !== 1 ? 's' : ''} logged
          </p>
        </CardDivider>
      )}

      {/* Empty hint (if no shots) */}
      {!bean.isDialedIn && shotCount === 0 && (
        <CardDivider>
          <p className="text-sm text-espresso-700/60 dark:text-steam-300">
            No shots yet · Tap to start dialing
          </p>
        </CardDivider>
      )}

      {/* Rating (if set) */}
      {bean.rating && (
        <div className="mt-3">
          <StarRating value={bean.rating} readonly size="sm" />
        </div>
      )}
    </Card>
  );
}
```

Create `src/components/bean/BeanCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BeanCard } from './BeanCard';
import type { Bean } from '../../types';

const baseMockBean: Bean = {
  id: '123',
  name: 'Ethiopia Yirgacheffe',
  roaster: 'Square Mile',
  roastDate: null,
  rating: null,
  notes: '',
  dialedRecipe: null,
  isDialedIn: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('BeanCard', () => {
  it('renders bean name and roaster', () => {
    renderWithRouter(<BeanCard bean={baseMockBean} />);
    expect(screen.getByText('Ethiopia Yirgacheffe')).toBeInTheDocument();
    expect(screen.getByText('Square Mile')).toBeInTheDocument();
  });

  it('shows empty state when no shots', () => {
    renderWithRouter(<BeanCard bean={baseMockBean} shotCount={0} />);
    expect(screen.getByText(/No shots yet/)).toBeInTheDocument();
  });

  it('shows progress badge when has shots but not dialed', () => {
    renderWithRouter(<BeanCard bean={baseMockBean} shotCount={3} />);
    expect(screen.getByText('Dialing in')).toBeInTheDocument();
    expect(screen.getByText(/3 shots logged/)).toBeInTheDocument();
  });

  it('shows dialed badge and recipe when dialed', () => {
    const dialedBean: Bean = {
      ...baseMockBean,
      isDialedIn: true,
      dialedRecipe: {
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        grindSetting: '2.5',
        ratio: 2,
        sourceShotId: 'shot-1',
        savedAt: '2026-01-01',
      },
    };
    
    renderWithRouter(<BeanCard bean={dialedBean} />);
    expect(screen.getByText('Dialed')).toBeInTheDocument();
    expect(screen.getByText('18g')).toBeInTheDocument();
    expect(screen.getByText('36g')).toBeInTheDocument();
    expect(screen.getByText('28s')).toBeInTheDocument();
  });

  it('shows rating when set', () => {
    const ratedBean: Bean = { ...baseMockBean, rating: 4 };
    renderWithRouter(<BeanCard bean={ratedBean} />);
    // StarRating renders 5 buttons
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });
});
```

### 3. Create BeanForm Component

Create `src/components/bean/BeanForm.tsx`:

```tsx
import { useState } from 'react';
import { Button, Input } from '../shared';
import type { CreateBeanInput } from '../../types';

interface BeanFormProps {
  initialValues?: Partial<CreateBeanInput>;
  onSubmit: (values: CreateBeanInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function BeanForm({
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  isLoading = false,
}: BeanFormProps) {
  const [name, setName] = useState(initialValues.name || '');
  const [roaster, setRoaster] = useState(initialValues.roaster || '');
  const [roastDate, setRoastDate] = useState(initialValues.roastDate || '');
  const [notes, setNotes] = useState(initialValues.notes || '');

  const [errors, setErrors] = useState<{ name?: string; roaster?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string; roaster?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Bean name is required';
    }
    if (!roaster.trim()) {
      newErrors.roaster = 'Roaster is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      roaster: roaster.trim(),
      roastDate: roastDate || null,
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Bean Name"
        placeholder="e.g., Ethiopia Yirgacheffe"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        disabled={isLoading}
      />

      <Input
        label="Roaster"
        placeholder="e.g., Square Mile"
        value={roaster}
        onChange={(e) => setRoaster(e.target.value)}
        error={errors.roaster}
        disabled={isLoading}
      />

      <Input
        label="Roast Date (optional)"
        type="date"
        value={roastDate}
        onChange={(e) => setRoastDate(e.target.value)}
        disabled={isLoading}
      />

      <div>
        <label className="block text-xs text-espresso-700/60 dark:text-steam-300 mb-1">
          Notes (optional)
        </label>
        <textarea
          className="
            w-full px-3 py-2 rounded-lg
            bg-crema-50 dark:bg-roast-800
            border border-crema-200 dark:border-roast-600
            text-espresso-900 dark:text-steam-50
            placeholder:text-crema-400 dark:placeholder:text-steam-400
            focus:outline-none focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
          "
          rows={3}
          placeholder="Tasting notes, origin info, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
```

Create `src/components/bean/BeanForm.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BeanForm } from './BeanForm';

describe('BeanForm', () => {
  it('renders all fields', () => {
    render(<BeanForm onSubmit={() => {}} />);
    expect(screen.getByLabelText('Bean Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Roaster')).toBeInTheDocument();
    expect(screen.getByLabelText('Roast Date (optional)')).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', () => {
    render(<BeanForm onSubmit={() => {}} />);
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText('Bean name is required')).toBeInTheDocument();
    expect(screen.getByText('Roaster is required')).toBeInTheDocument();
  });

  it('calls onSubmit with form values', () => {
    const handleSubmit = vi.fn();
    render(<BeanForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText('Bean Name'), {
      target: { value: 'Test Bean' },
    });
    fireEvent.change(screen.getByLabelText('Roaster'), {
      target: { value: 'Test Roaster' },
    });
    fireEvent.click(screen.getByText('Save'));

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Test Bean',
      roaster: 'Test Roaster',
      roastDate: null,
      notes: '',
    });
  });

  it('populates initial values', () => {
    render(
      <BeanForm
        onSubmit={() => {}}
        initialValues={{ name: 'Existing', roaster: 'Roaster' }}
      />
    );
    expect(screen.getByLabelText('Bean Name')).toHaveValue('Existing');
    expect(screen.getByLabelText('Roaster')).toHaveValue('Roaster');
  });

  it('calls onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn();
    render(<BeanForm onSubmit={() => {}} onCancel={handleCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleCancel).toHaveBeenCalled();
  });
});
```

### 4. Create BeanRecipe Component

Create `src/components/bean/BeanRecipe.tsx`:

```tsx
import type { DialedRecipe } from '../../types';
import { Card } from '../shared';

interface BeanRecipeProps {
  recipe: DialedRecipe;
  grindSetting?: string;
}

export function BeanRecipe({ recipe, grindSetting }: BeanRecipeProps) {
  return (
    <Card className="bg-dialed-light dark:bg-dialed-dm-bg border-dialed dark:border-dialed-dm-text/30">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-5 h-5 text-dialed-dark dark:text-dialed-dm-text"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="font-medium text-dialed-dark dark:text-dialed-dm-text">
          Dialed Recipe
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-dialed-dark/60 dark:text-dialed-dm-text/60">
            Dose
          </span>
          <p className="text-lg font-semibold text-dialed-dark dark:text-dialed-dm-text">
            {recipe.doseGrams}g
          </p>
        </div>
        <div>
          <span className="text-xs text-dialed-dark/60 dark:text-dialed-dm-text/60">
            Yield
          </span>
          <p className="text-lg font-semibold text-dialed-dark dark:text-dialed-dm-text">
            {recipe.yieldGrams}g
          </p>
        </div>
        <div>
          <span className="text-xs text-dialed-dark/60 dark:text-dialed-dm-text/60">
            Time
          </span>
          <p className="text-lg font-semibold text-dialed-dark dark:text-dialed-dm-text">
            {recipe.timeSeconds}s
          </p>
        </div>
        <div>
          <span className="text-xs text-dialed-dark/60 dark:text-dialed-dm-text/60">
            Ratio
          </span>
          <p className="text-lg font-semibold text-dialed-dark dark:text-dialed-dm-text">
            1:{recipe.ratio.toFixed(1)}
          </p>
        </div>
        {grindSetting && (
          <div className="col-span-2">
            <span className="text-xs text-dialed-dark/60 dark:text-dialed-dm-text/60">
              Grind Setting
            </span>
            <p className="text-lg font-semibold text-dialed-dark dark:text-dialed-dm-text">
              {grindSetting}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
```

### 5. Create ShotList Component

Create `src/components/bean/ShotList.tsx`:

```tsx
import type { Shot } from '../../types';
import { Card } from '../shared';

interface ShotListProps {
  shots: Shot[];
  onShotClick?: (shot: Shot) => void;
}

const balanceLabels: Record<number, string> = {
  [-2]: 'Very Sour',
  [-1]: 'Sour',
  [0]: 'Balanced',
  [1]: 'Bitter',
  [2]: 'Very Bitter',
};

export function ShotList({ shots, onShotClick }: ShotListProps) {
  if (shots.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-espresso-700 dark:text-steam-200">
        Shot History
      </h3>
      {shots.map((shot) => (
        <Card
          key={shot.id}
          padding="sm"
          className={`
            ${onShotClick ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''}
            ${shot.isDialedShot ? 'ring-2 ring-dialed dark:ring-dialed-dm-text' : ''}
          `}
          onClick={() => onShotClick?.(shot)}
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
              <span
                className={`text-xs font-medium ${
                  shot.taste.balance === 0
                    ? 'text-dialed dark:text-dialed-dm-text'
                    : shot.taste.balance < 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}
              >
                {balanceLabels[shot.taste.balance]}
              </span>
              {shot.isDialedShot && (
                <div className="text-xs text-dialed dark:text-dialed-dm-text mt-0.5">
                  ★ Dialed
                </div>
              )}
            </div>
          </div>
          {shot.notes && (
            <p className="text-xs text-espresso-700/60 dark:text-steam-300 mt-1 ml-9">
              {shot.notes}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
```

### 6. Create Bean Components Barrel Export

Create `src/components/bean/index.ts`:

```typescript
export { BeanCard } from './BeanCard';
export { BeanForm } from './BeanForm';
export { BeanRecipe } from './BeanRecipe';
export { ShotList } from './ShotList';
```

### 7. Update Library Page

Update `src/pages/Library.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useBeanStore } from '../stores/beanStore';
import { BeanCard } from '../components/bean';
import { EmptyState, Button } from '../components/shared';
import { useNavigate } from 'react-router-dom';
import { countShotsForBean } from '../db';

export function Library() {
  const navigate = useNavigate();
  const { beans, isLoading, loadBeans } = useBeanStore();
  const [shotCounts, setShotCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadBeans();
  }, [loadBeans]);

  // Load shot counts for all beans
  useEffect(() => {
    const loadCounts = async () => {
      const counts: Record<string, number> = {};
      for (const bean of beans) {
        counts[bean.id] = await countShotsForBean(bean.id);
      }
      setShotCounts(counts);
    };
    if (beans.length > 0) {
      loadCounts();
    }
  }, [beans]);

  if (isLoading && beans.length === 0) {
    return (
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-semibold">Your Beans</h1>
        <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-semibold">Your Beans</h1>
        {beans.length > 0 && (
          <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
            {beans.length} coffee{beans.length !== 1 ? 's' : ''} in your library
          </p>
        )}
      </header>

      {/* Bean List */}
      <main className="px-4 pb-4">
        {beans.length === 0 ? (
          <EmptyState
            icon={
              <svg
                className="w-16 h-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            }
            title="No beans yet"
            description="Add your first coffee to start tracking your dial-in journey."
            action={
              <Button onClick={() => navigate('/bean/new')}>
                Add Your First Bean
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {beans.map((bean) => (
              <BeanCard
                key={bean.id}
                bean={bean}
                shotCount={shotCounts[bean.id] || 0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

### 8. Update NewBean Page

Update `src/pages/NewBean.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';
import { useBeanStore } from '../stores/beanStore';
import { BeanForm } from '../components/bean';

export function NewBean() {
  const navigate = useNavigate();
  const { addBean, isLoading } = useBeanStore();

  const handleSubmit = async (values: Parameters<typeof addBean>[0]) => {
    try {
      const bean = await addBean(values);
      navigate(`/bean/${bean.id}`);
    } catch (e) {
      // Error is handled in store
    }
  };

  return (
    <div>
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-semibold">Add Bean</h1>
        <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
          Add a new coffee to your library
        </p>
      </header>

      <main className="px-4 pb-4">
        <BeanForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="Add Bean"
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
```

### 9. Update BeanDetail Page

Update `src/pages/BeanDetail.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBeanStore } from '../stores/beanStore';
import { getShotsForBean } from '../db';
import { BeanRecipe, BeanForm, ShotList } from '../components/bean';
import {
  Button,
  Card,
  StarRating,
  ConfirmModal,
} from '../components/shared';
import type { Shot } from '../types';

export function BeanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentBean, loadBean, editBean, removeBean, isLoading } = useBeanStore();

  const [shots, setShots] = useState<Shot[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadBean(id);
      getShotsForBean(id).then(setShots);
    }
  }, [id, loadBean]);

  if (!currentBean) {
    return (
      <div className="px-5 pt-12 pb-4">
        <p className="text-espresso-700 dark:text-steam-200">
          {isLoading ? 'Loading...' : 'Bean not found'}
        </p>
      </div>
    );
  }

  const handleRatingChange = async (rating: number) => {
    await editBean({ id: currentBean.id, rating });
  };

  const handleDelete = async () => {
    await removeBean(currentBean.id);
    navigate('/');
  };

  const handleEditSubmit = async (values: { name: string; roaster: string; roastDate?: string | null; notes?: string }) => {
    await editBean({ id: currentBean.id, ...values });
    setIsEditing(false);
  };

  return (
    <div>
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold truncate">{currentBean.name}</h1>
            <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-0.5">
              {currentBean.roaster}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="ml-2 p-2 text-espresso-700/50 dark:text-steam-400 hover:text-espresso-900 dark:hover:text-steam-50"
            aria-label={isEditing ? 'Cancel editing' : 'Edit bean'}
          >
            {isEditing ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            )}
          </button>
        </div>

        {/* Rating */}
        {!isEditing && (
          <div className="mt-3">
            <StarRating
              value={currentBean.rating}
              onChange={handleRatingChange}
            />
          </div>
        )}
      </header>

      <main className="px-4 pb-4 space-y-4">
        {isEditing ? (
          <>
            <BeanForm
              initialValues={{
                name: currentBean.name,
                roaster: currentBean.roaster,
                roastDate: currentBean.roastDate || undefined,
                notes: currentBean.notes,
              }}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditing(false)}
              submitLabel="Save Changes"
              isLoading={isLoading}
            />
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(true)}
              className="w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              Delete Bean
            </Button>
          </>
        ) : (
          <>
            {/* Dialed Recipe */}
            {currentBean.dialedRecipe && (
              <BeanRecipe
                recipe={currentBean.dialedRecipe}
                grindSetting={currentBean.dialedRecipe.grindSetting}
              />
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {currentBean.isDialedIn ? (
                <>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => navigate(`/bean/${currentBean.id}/shot`)}
                  >
                    Log a Shot
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => navigate(`/bean/${currentBean.id}/shot?redial=true`)}
                  >
                    Re-dial
                  </Button>
                </>
              ) : (
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/bean/${currentBean.id}/shot`)}
                >
                  {shots.length > 0 ? 'Continue Dialing' : 'Start Dialing'}
                </Button>
              )}
            </div>

            {/* Notes */}
            {currentBean.notes && (
              <Card>
                <h3 className="text-sm font-medium text-espresso-700 dark:text-steam-200 mb-1">
                  Notes
                </h3>
                <p className="text-sm text-espresso-700/70 dark:text-steam-300">
                  {currentBean.notes}
                </p>
              </Card>
            )}

            {/* Shot History */}
            <ShotList shots={shots} />
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Bean?"
        message={`Are you sure you want to delete "${currentBean.name}"? This will also delete all ${shots.length} shot${shots.length !== 1 ? 's' : ''} logged for this bean. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
```

### 10. Create Stores Barrel Export

Create `src/stores/index.ts`:

```typescript
export { useBeanStore } from './beanStore';
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] `npm run test:run` — all tests pass
- [ ] `npm run lint` — no errors
- [ ] `npm run dev` — app starts

Manual testing:
- [ ] Empty library shows "No beans yet" with add button
- [ ] Can add a new bean via the form
- [ ] New bean appears in library
- [ ] Can tap bean to see detail page
- [ ] Can edit bean (name, roaster, notes)
- [ ] Can change rating by tapping stars
- [ ] Can delete bean (shows confirmation modal)
- [ ] Deleting bean returns to library
- [ ] Library sorts by most recently updated

---

## Notes for Agent

- The BeanDetail page is complex—take it step by step
- Shot logging functionality comes in M5; for now, shots display but can't be added via UI
- The `navigate(`/bean/${id}/shot`)` links will work once M5 is complete
- Use the existing shared components—don't recreate them
- Follow the design system colors exactly
- Commit message: `feat(bean): add bean library feature`
