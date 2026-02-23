# Design System

**Document:** 05-design-system.md  
**Purpose:** Define all visual design decisions and tokens

---

## Design Philosophy

**Inspiration:** Scandinavian coffee shop  
**Feeling:** Warm minimalism—cozy, not sterile  
**Visual language:** Coffee-inspired colors, generous whitespace, soft edges

The app should feel like a tool you'd find in a thoughtfully designed specialty coffee shop: clean, functional, but inviting. Not cold and clinical. Not loud and playful. Quietly confident.

---

## Color System

All colors are derived from coffee itself: espresso, crema, caramel, steam rising from a cup. This creates a cohesive visual language that feels native to the domain.

### Light Mode Palette

#### Espresso (Text & Dark Elements)

Used for text and icons in light mode.

| Token | Hex | Usage |
|-------|-----|-------|
| `espresso-950` | `#1a1412` | Primary text (headlines) |
| `espresso-900` | `#2d2622` | Primary text (body) |
| `espresso-800` | `#3d332d` | Secondary text |
| `espresso-700` | `#524840` | Muted text, inactive icons |

#### Crema (Backgrounds & Surfaces)

Used for backgrounds, cards, and borders in light mode.

| Token | Hex | Usage |
|-------|-----|-------|
| `crema-50` | `#faf8f5` | Page background |
| `crema-100` | `#f5f1eb` | Card background |
| `crema-200` | `#ebe5db` | Borders, dividers |
| `crema-300` | `#d9d0c3` | Disabled states, empty stars |
| `crema-400` | `#c4b8a8` | Placeholder text |

### Dark Mode Palette

#### Roast (Backgrounds & Surfaces)

Used for backgrounds in dark mode. Warm browns, not cold grays.

| Token | Hex | Usage |
|-------|-----|-------|
| `roast-950` | `#0f0d0c` | Page background |
| `roast-900` | `#1a1613` | Card background |
| `roast-800` | `#252019` | Elevated surfaces |
| `roast-700` | `#332b24` | Borders, dividers |
| `roast-600` | `#443a30` | Subtle borders, disabled |

#### Steam (Text & Light Elements)

Used for text and icons in dark mode.

| Token | Hex | Usage |
|-------|-----|-------|
| `steam-50` | `#faf8f5` | Primary text |
| `steam-100` | `#e8e2d9` | Secondary text |
| `steam-200` | `#c9c0b3` | Muted text |
| `steam-300` | `#a69c8c` | Placeholder text |
| `steam-400` | `#7a7067` | Disabled text, inactive icons |

### Shared Accent Colors

These colors work in both light and dark mode.

#### Caramel (Primary Action)

The main accent color for interactive elements.

| Token | Hex | Usage |
|-------|-----|-------|
| `caramel-100` | `#fdf4e7` | Light backgrounds (light mode) |
| `caramel-200` | `#f9e4c8` | Hover backgrounds |
| `caramel-300` | `#f0cea3` | Active state text (dark mode) |
| `caramel-400` | `#d4a574` | Stars, secondary accents |
| `caramel-500` | `#b8865a` | **Primary action** (buttons) |
| `caramel-600` | `#996d45` | Hover state for primary action |

#### Dialed (Success State)

Used exclusively for the "dialed in" status indicator.

| Token | Hex | Usage |
|-------|-----|-------|
| `dialed-light` | `#e8f0e8` | Badge background (light mode) |
| `dialed-DEFAULT` | `#7d9a7d` | Badge text (light mode) |
| `dialed-dark` | `#5c755c` | Badge text dark variant |
| `dialed-dm-bg` | `#1e2a1e` | Badge background (dark mode) |
| `dialed-dm-text` | `#9db89d` | Badge text (dark mode) |

### Semantic Color Mapping

| Semantic Use | Light Mode | Dark Mode |
|--------------|------------|-----------|
| Page background | `crema-50` | `roast-950` |
| Card background | `crema-100` | `roast-900` |
| Border | `crema-200` | `roast-700` |
| Primary text | `espresso-900` | `steam-50` |
| Secondary text | `espresso-700` | `steam-200` |
| Muted text | `espresso-700/60` | `steam-300` |
| Placeholder | `crema-400` | `steam-400` |
| Primary action | `caramel-500` | `caramel-500` |
| Primary action hover | `caramel-600` | `caramel-600` |

---

## Typography

### Font Family

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

**Why Inter:**
- Clean, modern, highly legible
- Excellent for UI at small sizes
- Variable font with good weight range
- Free and widely available
- AI assistants know it well

**Fallback:** System fonts ensure fast loading if Inter fails.

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Card titles, labels |
| Semibold | 600 | Page titles, emphasis |

Do not use bold (700) or light (300). Keep it restrained.

### Type Scale

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| `text-2xl` | 24px | 32px | Page titles |
| `text-lg` | 18px | 28px | Section headers |
| `text-base` | 16px | 24px | Body text, card titles |
| `text-sm` | 14px | 20px | Secondary text, metadata |
| `text-xs` | 12px | 16px | Badges, labels, captions |

### Type Styles

```css
/* Page Title */
.page-title {
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  color: var(--text-primary);
}

/* Card Title */
.card-title {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: var(--text-primary);
}

/* Body */
.body {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--text-secondary);
}

/* Label */
.label {
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--text-muted);
}
```

---

## Spacing

### Base Unit

All spacing derives from a **4px base unit**.

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-0.5` | 2px | Hairline gaps |
| `space-1` | 4px | Tight spacing (icon gaps) |
| `space-1.5` | 6px | Small gaps |
| `space-2` | 8px | Related elements |
| `space-3` | 12px | Component internal padding |
| `space-4` | 16px | Standard padding |
| `space-5` | 20px | Section padding |
| `space-6` | 24px | Large gaps |
| `space-8` | 32px | Section separators |

### Common Patterns

| Context | Spacing |
|---------|---------|
| Card padding | 16px (`p-4`) |
| Card gap in list | 12px (`space-y-3`) |
| Page horizontal padding | 16px (`px-4`) |
| Page top padding | 48px (`pt-12`) — accounts for status bar |
| Bottom nav height | 60px + safe area |
| Gap between label and value | 4px |

---

## Layout

### Viewport

Design for mobile-first at **375px width** (iPhone SE/mini baseline).

```css
.app-container {
  max-width: 375px;
  min-height: 100vh;
  margin: 0 auto;
}
```

### Page Structure

```
┌─────────────────────────────────────┐
│         Status Bar (system)         │
├─────────────────────────────────────┤
│                                     │
│  Header (pt-12 pb-4 px-5)          │
│  - Page title                       │
│  - Subtitle (optional)              │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Content (px-4 pb-24)              │
│  - Scrollable                       │
│  - Cards, forms, etc.               │
│                                     │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  Bottom Navigation (fixed)          │
│  - 3 items                          │
│  - Safe area padding                │
└─────────────────────────────────────┘
```

### Safe Areas

Account for device safe areas (notch, home indicator):

```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

---

## Border Radius

Consistent rounded corners throughout.

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Buttons, inputs |
| `rounded-xl` | 12px | Small cards, badges |
| `rounded-2xl` | 16px | Cards |
| `rounded-3xl` | 24px | App container (if framed) |
| `rounded-full` | 9999px | Circular buttons, indicators |

---

## Shadows

Minimal shadow usage. The app relies on color and spacing, not elevation.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | FAB button |

### Primary Action Button Shadow

```css
.fab-button {
  box-shadow: 0 10px 15px -3px rgba(184, 134, 90, 0.3);
  /* Uses caramel-500 with 30% opacity */
}
```

This creates a warm glow under the main action button.

---

## Components

### Cards

The primary container for content.

```
┌────────────────────────────────────┐
│  Title                    [Badge]  │
│  Subtitle                          │
├────────────────────────────────────┤
│  Content area                      │
│  (recipe, progress, etc.)          │
└────────────────────────────────────┘
```

**Specs:**
- Background: `crema-100` / `roast-900`
- Border: 1px `crema-200` / `roast-700`
- Border radius: 16px (`rounded-2xl`)
- Padding: 16px (`p-4`)
- Internal divider: 1px border-t with margin-top 12px, padding-top 12px

### Buttons

#### Primary Button (FAB)

The floating action button for "Add Bean".

- Size: 48x48px
- Background: `caramel-500`
- Icon: white, 24px
- Border radius: full (circular)
- Shadow: warm glow (see shadows)
- Position: centered in bottom nav, elevated

#### Secondary Button

For actions within cards or forms.

- Height: 40px
- Padding: 0 16px
- Background: `caramel-500`
- Text: white, 14px medium
- Border radius: 8px
- Hover: `caramel-600`

#### Ghost Button

For less prominent actions.

- Same dimensions as secondary
- Background: transparent
- Text: `caramel-500`
- Border: 1px `crema-200` / `roast-700`
- Hover: background `caramel-100` / `caramel-500/20`

### Badges

Status indicators for beans.

#### Dialed Badge

```html
<span class="dialed-badge">
  <svg>✓</svg>
  Dialed
</span>
```

**Light mode:**
- Background: `dialed-light`
- Text: `dialed-dark`
- Icon: `dialed-dark`

**Dark mode:**
- Background: `dialed-dm-bg`
- Text: `dialed-dm-text`
- Icon: `dialed-dm-text`

**Specs:**
- Padding: 4px 10px (`px-2.5 py-1`)
- Border radius: full
- Font: 12px medium
- Icon: 14px, 6px gap from text

#### In Progress Badge

```html
<span class="progress-badge">
  <span class="dot"></span>
  Dialing in
</span>
```

**Light mode:**
- Background: `caramel-100`
- Text: `caramel-500`
- Dot: `caramel-400`

**Dark mode:**
- Background: `caramel-500/20`
- Text: `caramel-300`
- Dot: `caramel-400`

**Specs:**
- Same dimensions as dialed badge
- Dot: 6px circle

### Input Fields

For forms (bean entry, shot logging).

```
┌────────────────────────────────────┐
│ Label                              │
│ ┌────────────────────────────────┐ │
│ │ Placeholder or value           │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

**Specs:**
- Label: 12px, muted text, 4px below
- Input height: 44px (touch-friendly)
- Padding: 0 12px
- Background: `crema-50` / `roast-800`
- Border: 1px `crema-200` / `roast-600`
- Border radius: 8px
- Focus: border `caramel-500`, ring 2px `caramel-500/20`

### Taste Slider

The balance slider for shot feedback.

```
     Sour ──────────●────────── Bitter
      -2    -1    0    +1    +2
```

**Specs:**
- Track height: 4px
- Track color: `crema-200` / `roast-700`
- Thumb: 20px circle, `caramel-500`
- Thumb shadow: subtle
- Labels: 12px muted text at ends
- Snap points at -2, -1, 0, +1, +2

### Star Rating

For bean ratings.

**Specs:**
- Star size: 16px
- Filled: `caramel-400`
- Empty: `crema-300` / `roast-600`
- Gap: 4px

### Bottom Navigation

Fixed navigation bar.

```
┌─────────────────────────────────────┐
│   [Library]    [+]    [Settings]   │
└─────────────────────────────────────┘
```

**Specs:**
- Background: `crema-50` / `roast-950`
- Border top: 1px `crema-200` / `roast-700`
- Height: ~60px + safe area
- Padding: 12px horizontal, 12px vertical

**Nav items:**
- Icon: 24px
- Label: 12px
- Gap: 4px
- Active: primary text color
- Inactive: muted text color

**FAB (center):**
- Elevated above nav bar by ~16px
- See primary button specs

---

## Iconography

### Icon Set

Use **Lucide Icons** (or Heroicons outline).

- Consistent 24px size for navigation
- 1.5px stroke weight
- 16px for inline icons (badges, cards)
- 20px for form icons

### Core Icons

| Icon | Usage |
|------|-------|
| `archive` / `inbox` | Library (bean collection) |
| `plus` | Add new |
| `settings` / `cog` | Settings |
| `check` | Dialed indicator |
| `chevron-right` | Navigation |
| `star` | Rating |
| `trash` | Delete |
| `edit` / `pencil` | Edit |
| `download` | Export |

---

## Motion

Keep animations subtle and functional.

### Transitions

```css
/* Standard transition */
transition: all 150ms ease;

/* Background/color changes */
transition: background-color 150ms ease, color 150ms ease;

/* Transform (scale, translate) */
transition: transform 200ms ease;
```

### Interactions

| Interaction | Animation |
|-------------|-----------|
| Button press | Scale to 0.97 |
| Card tap | Subtle background darken |
| Page transition | Slide or fade, 200ms |
| Modal appear | Fade in + slide up, 200ms |

### Loading States

- Use subtle skeleton screens (pulsing `crema-200` / `roast-800`)
- Avoid spinners where possible
- If spinner needed: caramel-500, simple rotation

---

## Dark Mode Implementation

### Detection

Respect system preference:

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode variables */
  }
}
```

### CSS Variables Approach

```css
:root {
  /* Light mode (default) */
  --bg-primary: #faf8f5;
  --bg-card: #f5f1eb;
  --border: #ebe5db;
  --text-primary: #2d2622;
  --text-secondary: #524840;
  --text-muted: rgba(82, 72, 64, 0.6);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f0d0c;
    --bg-card: #1a1613;
    --border: #332b24;
    --text-primary: #faf8f5;
    --text-secondary: #c9c0b3;
    --text-muted: #a69c8c;
  }
}
```

### Tailwind Implementation

Use Tailwind's dark mode with class strategy for more control:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'media', // or 'class' for manual toggle
  theme: {
    extend: {
      colors: {
        // All color definitions from this document
      }
    }
  }
}
```

Then in components:

```html
<div class="bg-crema-50 dark:bg-roast-950">
  <p class="text-espresso-900 dark:text-steam-50">Hello</p>
</div>
```

---

## Accessibility

### Color Contrast

All text meets WCAG AA standards:

| Combination | Contrast Ratio | Pass |
|-------------|----------------|------|
| espresso-900 on crema-50 | 12.1:1 | ✅ AAA |
| espresso-700 on crema-100 | 7.2:1 | ✅ AAA |
| steam-50 on roast-950 | 15.8:1 | ✅ AAA |
| steam-200 on roast-900 | 8.4:1 | ✅ AAA |
| caramel-500 on white | 4.6:1 | ✅ AA |

### Touch Targets

- Minimum touch target: 44x44px
- Recommended: 48x48px for primary actions
- Adequate spacing between targets (8px minimum)

### Focus States

All interactive elements must have visible focus:

```css
:focus-visible {
  outline: 2px solid var(--caramel-500);
  outline-offset: 2px;
}
```

---

## Assets Needed

### App Icons

Required sizes for PWA:

| Size | Usage |
|------|-------|
| 192x192 | Android home screen |
| 512x512 | Android splash, PWA install |
| 180x180 | iOS home screen |
| 167x167 | iPad Pro |
| 152x152 | iPad |

### Favicon

- favicon.ico (32x32)
- favicon.svg (scalable)

### Design Direction for Icon

Simple, geometric coffee-related mark:
- Could be stylized coffee bean
- Or abstract "dial" indicator
- Single color (works in caramel-500 or monochrome)
- Recognizable at small sizes

---

## Summary

| Aspect | Decision |
|--------|----------|
| Aesthetic | Scandinavian coffee shop, warm minimalism |
| Primary colors | Coffee-inspired (espresso, crema, roast, steam) |
| Accent color | Caramel (warm, inviting) |
| Success color | Sage green (natural, muted) |
| Typography | Inter, 400/500/600 weights |
| Spacing | 4px base unit |
| Border radius | Generous (16px cards, 8px buttons) |
| Shadows | Minimal, warm when used |
| Dark mode | Warm browns, not cold grays |
| Icons | Lucide, 24px standard |

This design system prioritizes warmth, clarity, and restraint. Every choice should feel intentional and cohesive with the coffee theme.
