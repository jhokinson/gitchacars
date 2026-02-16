# PRD: GitchaCars UI — Visual Polish (Shadows, Buttons, Depth)

## 1. Introduction/Overview

The homepage feed cards look polished with shadows and depth, but every other page — dashboards, detail pages, forms, messages, chat — uses flat, shadowless cards and rows that feel lifeless. Button hover states are inconsistent: some lift, some change color, some do nothing. This work tree adds consistent default shadows to all cards/rows, elevates key containers, and unifies button interactions across the app.

**Parallel with**: Work Tree A (CustomSelect) — no dependencies.

## 2. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Visual depth everywhere | All card/row elements have default shadows |
| Consistent hover feedback | Every button has lift + shadow on hover |
| Polished forms | Focus-within state on form cards |
| Dashboard hierarchy | Section headers, dividers, empty states styled |
| Zero regressions | Existing layouts unchanged, no overflow/clipping |

## 3. Files

**Modify:**
- `frontend/src/styles/components.css` — button hover states
- `frontend/src/pages/pages.css` — dashboard rows, detail cards, form cards, dashboard sections
- `frontend/src/components/IntroCard.css` — default shadow
- `frontend/src/components/VehicleCard.css` — default shadow
- `frontend/src/pages/ChatPage.css` (or create if needed) — chat container

**Create:**
- `frontend/e2e/ux-ui-polish.spec.js`

## 4. User Stories

---

### US-C1: Add Default Shadows to Cards and Rows

**Priority**: P0
**Files**: `pages.css`, `IntroCard.css`, `VehicleCard.css`

Currently these elements only get shadows on hover — they look flat at rest.

| Selector | File | Current | Add default | Hover upgrade |
|---|---|---|---|---|
| `.dash-listing-row` | `pages.css` | hover: `--shadow-sm` | `box-shadow: var(--shadow-sm)` | `box-shadow: var(--shadow-md)` |
| `.intro-card` | `IntroCard.css` | hover: `--shadow-sm` | `box-shadow: var(--shadow-sm)` | `box-shadow: var(--shadow-md)` |
| `.vehicle-card` | `VehicleCard.css` | hover: `--shadow-md` | `box-shadow: var(--shadow-sm)` | keep `--shadow-md` |
| `.conversation-row` | `pages.css` | none | `box-shadow: var(--shadow-sm)` | `box-shadow: var(--shadow-md)` |

**Acceptance Criteria:**
- [ ] `.dash-listing-row` has `var(--shadow-sm)` at rest, `var(--shadow-md)` on hover
- [ ] `.intro-card` has `var(--shadow-sm)` at rest, `var(--shadow-md)` on hover
- [ ] `.vehicle-card` has `var(--shadow-sm)` at rest (hover already `--shadow-md`)
- [ ] `.conversation-row` (MessagesPage) has `var(--shadow-sm)` at rest, `var(--shadow-md)` on hover
- [ ] Transitions smooth: `transition: box-shadow 0.2s ease, transform 0.2s ease`
- [ ] No layout shifts from added shadows (shadows don't affect layout)

---

### US-C2: Elevate Detail Page + Form Page Cards

**Priority**: P1
**File**: `pages.css`

**Acceptance Criteria:**
- [ ] `.detail-page .card` (or equivalent detail page card selector): default `box-shadow: var(--shadow-md)`, hover `box-shadow: var(--shadow-lg)` + `transform: translateY(-2px)`
- [ ] `.form-page .card` and `.form-page-redesign .card`: default `box-shadow: var(--shadow-md)`
- [ ] Form cards on `:focus-within`: `box-shadow: var(--shadow-lg)` + `border-color: var(--color-accent)` (subtle accent border when user is editing inside)
- [ ] Transitions: `transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease`

---

### US-C3: Chat Page Container

**Priority**: P1
**File**: `ChatPage.css` (create if it doesn't exist; or add to `pages.css` if chat styles are there)

**Acceptance Criteria:**
- [ ] Chat page main content wrapped in a card-like container with:
  - `border: 1px solid var(--color-border-light)`
  - `border-radius: var(--radius-lg)`
  - `box-shadow: var(--shadow-md)`
  - `padding: var(--space-lg)` (or existing padding preserved)
- [ ] Chat messages area still scrolls correctly within container
- [ ] No layout breakage on mobile

---

### US-C4: Polish Button Hover States

**Priority**: P0
**File**: `components.css`

**Current state**: Button base styles are in `components.css` lines 5-130. Hover states are inconsistent — some have color changes, few have lift effects.

**Acceptance Criteria:**
- [ ] All `.btn:hover`: add `transform: translateY(-1px)` lift effect
- [ ] All `.btn:active`: add `transform: translateY(0)` (press-down return)
- [ ] `.btn` base: add `transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease, border-color 0.15s ease`
- [ ] `.btn-secondary:hover`: border-color changes to `var(--color-text-muted)` for subtle emphasis
- [ ] `.btn-danger:hover`: add `box-shadow: 0 2px 8px rgba(220, 38, 38, 0.25)` (red glow)
- [ ] `.btn-primary:hover` and `.navbar-cta:hover`: consistent accent shadow `0 2px 8px rgba(37, 99, 235, 0.3)`
- [ ] No buttons lose their existing color transitions
- [ ] Disabled buttons (`.btn:disabled`) do NOT get hover transform

---

### US-C5: Dashboard Section Polish

**Priority**: P2
**File**: `pages.css`

**Acceptance Criteria:**
- [ ] Dashboard section headers (`.dashboard-section-title` or equivalent): subtle gradient background from `var(--color-accent-light)` → `transparent` (left to right)
- [ ] Section dividers between dashboard sections: `border-top: 1px solid var(--color-border-light)` with `var(--space-lg)` padding-top
- [ ] Empty state containers (`.dashboard-empty` or equivalent): `border: 2px dashed var(--color-border-light)` + `box-shadow: inset 0 2px 4px rgba(0,0,0,0.04)` for subtle inset depth
- [ ] No changes to dashboard layout or spacing structure

---

### US-C6: E2E Tests — Visual Polish

**Priority**: P0
**File**: `frontend/e2e/ux-ui-polish.spec.js`

**Test Cases:**
- [ ] **Dashboard row shadows**: `.dash-listing-row` has non-`none` box-shadow computed style
- [ ] **IntroCard shadow**: `.intro-card` has non-`none` box-shadow at rest
- [ ] **VehicleCard shadow**: `.vehicle-card` has non-`none` box-shadow at rest
- [ ] **Detail page card elevation**: Detail page card has box-shadow
- [ ] **Chat page container**: Chat page has bordered, rounded container
- [ ] **Button hover transform**: Primary button on hover has `translateY(-1px)` transform (use Playwright `evaluate` to check computed style after hover)
- [ ] **Form focus-within**: Click inside a form card input, verify card border-color changes
- [ ] **Dashboard section styling**: Section headers have background, empty states have dashed border
- [ ] **No layout overflow**: No horizontal scrollbar on any tested page

## 5. Technical Notes

- **Shadow variables** (from `variables.css`):
  ```css
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  ```

- **Button base selector**: `.btn` in `components.css`. Variants: `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-ghost`. CTA: `.navbar-cta`.

- **Existing transitions**: Check that new transitions don't override existing ones — use comma-separated transition lists to combine.

- **Accordion sections** in `pages.css` (lines ~992-1003) already have `.accordion-section.open { box-shadow: var(--shadow-sm) }` — this is fine, leave it.

## 6. Execution Order

1. US-C1 (default shadows on cards/rows) — independent, visual-only
2. US-C4 (button hover states) — independent, CSS-only
3. US-C2 (detail + form page cards) — independent, CSS-only
4. US-C3 (chat page container) — may need JSX change if no wrapper exists
5. US-C5 (dashboard sections) — CSS-only, lowest priority
6. US-C6 (E2E tests) — after C1-C5 complete

## 7. Verification

```bash
cd ~/gitchacars/frontend && npm run build                        # Must pass clean
cd ~/gitchacars/frontend && npx playwright test e2e/ux-ui-polish.spec.js  # All pass
cd ~/gitchacars/frontend && npx playwright test e2e/visual.spec.js        # No regressions
cd ~/gitchacars/frontend && npx playwright test e2e/ui-polish.spec.js     # No regressions
```
