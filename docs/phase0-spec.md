# Espresso Dial-In App – Phase 0 Spec

**Document Version:** 1.0  
**Date:** February 2026  
**Status:** Ready for build

---

## What We're Building

A personal espresso library app that helps users dial in new bags of coffee and remember what worked.

**Positioning (for Phase 0 testers):**
> "A guided dial-in flow for new beans—and a library to remember what worked."

---

## Core Hypothesis

People will use structured guidance to dial in a bag, save the result, and come back to reference it when they buy the same coffee again.

We are testing whether this is a recurring behavior, not just a novelty.

---

## Product Structure

### Bean Library (Primary Object)

Each bean entry contains:

| Field | Required | Notes |
|-------|----------|-------|
| Bean name | Yes | |
| Roaster | Yes | |
| Roast date | No | |
| Personal rating | No | Simple scale (e.g., 1–5 or "buy again?") |
| Dialed recipe | No | Saved when user marks as dialed |
| Notes | No | Free text |

The library persists. Users can browse, search, and return to any bean they've logged.

### Shot Log (Nested Under Each Bean)

Each shot contains:

| Field | Required |
|-------|----------|
| Dose (g) | Yes |
| Yield (g) | Yes |
| Time (s) | Yes |
| Grind setting | No |
| Taste feedback | Yes |

After each shot, the app provides:

- Comparison to previous shot
- Guidance suggestion (rule-based: sour/fast → finer, bitter/slow → coarser)

### "Mark as Dialed"

When the user is happy with a shot:

- That shot's parameters become the saved recipe for the bean
- The dial-in session is complete
- The bean remains in the library with recipe attached

### Returning to a Previously Dialed Bean

When opening a bean that has a saved recipe:

1. Show the saved recipe prominently ("Last time: 18g → 36g in 28s")
2. Offer two actions:
   - **Re-dial** – Start a fresh dial-in session
   - **Log a shot** – Add a shot without resetting the recipe

This reinforces the library mental model: you're looking something up, not starting over.

---

## Two Valid User Patterns

| Pattern | Behavior | Supported |
|---------|----------|-----------|
| Dial and done | Log 3–5 shots, mark as dialed, return months later | Yes |
| Track everything | Continue logging shots throughout the bag | Yes |

We accommodate both without forcing either.

---

## Technical Approach (Phase 0)

- **Local storage only** – No accounts, no backend
- **Export option** – Users can email/export their library as backup
- **No sync** – If they switch devices, data doesn't follow (acceptable for 4-week test)

---

## What's Explicitly Out of Scope

| Feature | Reason |
|---------|--------|
| Barcode scanning | Requires API integration, uncertain value |
| Community recipes/ratings | Requires accounts, moderation |
| Roaster-provided starting points | Requires roaster partnerships |
| OCR (scale photo capture) | Unvalidated need, high complexity |
| Accounts and cloud sync | Not needed for validation |
| Paid tier | Nothing to monetize yet |

---

## Success Criteria

**Test parameters:**
- 20–30 users
- 4 weeks
- Recruited from Reddit / Discord espresso communities

### Metrics We Track

| Metric | Definition |
|--------|------------|
| Weekly Active Dialers (primary) | Logged ≥1 shot in last 7 days |
| Shots per active user per week | Volume indicator |
| Bags per user per 30 days | Recurrence indicator |
| % completing ≥3 shots per bag | Engagement depth |
| Median time to log a shot | Friction indicator |
| Qualitative: "Did this feel mentally tiring?" | Cognitive load check |

### Decision Bands

| Signal | Indicators |
|--------|------------|
| **Strong** | ≥50% use for 2+ bags, ≥70% complete 3+ shots/bag, median log time <30s |
| **Weak** | High first-bag usage, <30% return for second bag |
| **Red flag** | Most stop after 1–2 shots, friction complaints |

---

## Open Questions for Testing

1. Do users ask for barcode scanning unprompted?
2. Do users want to see what others did with the same bean?
3. Is the single taste slider sufficient, or do they want more granularity?
4. Do users export/backup their library, or not care about persistence?

---

## Timeline

| Milestone | Target |
|-----------|--------|
| Spec finalized | Now |
| Build complete | +3 weeks |
| Beta launch | Mid-March 2026 |
| Test complete | Mid-April 2026 |
| Go/no-go decision | End of April 2026 |

---

## What Comes After (If Phase 0 Succeeds)

These features are parked for later phases, pending validation:

### Phase 1 – Foundation
- Accounts and cloud sync
- Dial-in session mode (grouped view of shots within a bag)
- Expanded guidance engine

### Phase 2 – Roaster Layer
- Roaster profiles with suggested starting points
- Barcode scanning with our own user-built database
- Roaster distribution partnerships

### Phase 3 – Community
- Shared recipes per bean (barcode-indexed)
- Community ratings
- "See what others did with this bean"

### Phase 4 – Advanced
- OCR capture from scale photos
- Grinder calibration tools
- Smart scale integrations

### Potential Monetization (Not Before Phase 1)
- Pro tier: unlimited beans, advanced features
- Price range: $2.99–4.99/month or $29/year
- Roaster partnerships as distribution, not primary revenue

---

## Summary

Phase 0 is deliberately minimal. We're testing one thing:

**Will people use this across multiple bags?**

If yes, we have a product. If no, we've learned that before building infrastructure.

The bean library model supports both casual and obsessive users without forcing either pattern. We save complexity for later and focus on the core loop.

---

*Document agreed by both founders. Ready for build.*
