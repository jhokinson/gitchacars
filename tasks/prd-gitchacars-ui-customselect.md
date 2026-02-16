# PRD: GitchaCars UI — CustomSelect Component + FilterSidebar Redesign

## 1. Introduction/Overview

The FilterSidebar uses native OS `<select>` dropdowns that look inconsistent across browsers, can't be styled, and lack search functionality for long option lists (like the Make dropdown with 50+ entries). This work tree creates a reusable `CustomSelect` component using 21st.dev MCP for design inspiration, then migrates all 6 FilterSidebar selects to use it, and polishes the sidebar's visual hierarchy.

**Parallel with**: Work Tree C (Visual Polish) — no dependencies.

## 2. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Consistent select styling | All 6 FilterSidebar dropdowns use CustomSelect |
| Search on long lists | Make and Model dropdowns filter as user types |
| Keyboard accessible | Arrow keys, Enter, Escape all functional |
| Visual hierarchy | Sidebar has shadows, section badges, per-section clear |
| Zero regressions | Existing filter behavior unchanged |

## 3. Files

**Create:**
- `frontend/src/components/CustomSelect.jsx`
- `frontend/src/components/CustomSelect.css`
- `frontend/e2e/ux-ui-customselect.spec.js`

**Modify:**
- `frontend/src/components/FilterSidebar.jsx`
- `frontend/src/components/FilterSidebar.css`

## 4. User Stories

---

### US-A1: Build CustomSelect Component

**Priority**: P0
**Tool**: Use `mcp__magic__21st_magic_component_builder` to generate initial design, then adapt to project CSS variables.

**Props Interface:**
```jsx
CustomSelect({
  options,        // [{value, label, group?}]
  value,          // string — currently selected value
  onChange,       // (value: string) => void
  placeholder,    // string — shown when no value selected
  searchable,     // boolean (default: false) — shows filter input when true
  disabled,       // boolean (default: false)
  className,      // string — additional CSS class
})
```

**Acceptance Criteria:**
- [ ] Trigger button displays selected option label (or placeholder + chevron when empty)
- [ ] Clicking trigger opens dropdown panel
- [ ] Dropdown: absolutely positioned, `z-index: 200`, max-height 280px, overflow-y scroll
- [ ] When `searchable={true}`: text input at top of dropdown filters options as user types (case-insensitive substring match)
- [ ] When `searchable={false}`: no text input shown
- [ ] Keyboard: Arrow Up/Down moves highlight, Enter selects highlighted option, Escape closes dropdown
- [ ] Click outside dropdown closes it (useRef + mousedown listener, same pattern as `SearchableSelect.jsx` lines 16-25)
- [ ] Open animation: opacity 0→1 + translateY(-4px→0) over 150ms
- [ ] Selected option shows checkmark icon (CSS `::after` pseudo-element)
- [ ] Hovered option shows `var(--color-accent-light)` background
- [ ] All styling uses CSS variables from `variables.css` exclusively (`--shadow-md`, `--color-accent`, `--radius-md`, etc.)
- [ ] Mobile: minimum 44px touch target height on all interactive elements
- [ ] No new npm dependencies added
- [ ] Component exported from `CustomSelect.jsx`

---

### US-A2: Replace All 6 FilterSidebar Selects

**Priority**: P0
**File**: `FilterSidebar.jsx`

| Current native `<select>` | Line | Replace with | `searchable` | Notes |
|---|---|---|---|---|
| Make | ~154 | `CustomSelect` | Yes | Options from `getAllMakes()`, large list |
| Radius | ~185 | `CustomSelect` | No | 6 options: Nationwide, 25, 50, 100, 250, 500 |
| Year Min | ~238 | `CustomSelect` | No | ~30 year options |
| Year Max | ~246 | `CustomSelect` | No | ~30 year options |
| Max Mileage | ~287 | `CustomSelect` | No | 6 options |
| Model (if present) | dynamic | `CustomSelect` | Yes | Conditional on make selection |

**Acceptance Criteria:**
- [ ] All 6 native `<select>` elements in FilterSidebar replaced with `<CustomSelect>`
- [ ] Make dropdown: `searchable={true}`, shows all makes, filters on type
- [ ] Model dropdown (when visible): `searchable={true}`, shows models for selected make
- [ ] Year Min/Max, Mileage, Radius: `searchable={false}`, standard dropdown behavior
- [ ] All `onChange` handlers still call `handleFilterChange` with correct filter key and value
- [ ] Filter state updates correctly and listing feed reflects changes
- [ ] No `.filter-select` native select elements remain in FilterSidebar

---

### US-A3: Redesign FilterSidebar Visuals

**Priority**: P1
**Tool**: Use `mcp__magic__21st_magic_component_refiner` on FilterSidebar for design direction.
**Files**: `FilterSidebar.jsx`, `FilterSidebar.css`

**Acceptance Criteria:**
- [ ] Sidebar container has default shadow: `var(--shadow-md)` (currently no shadow)
- [ ] Section headers show left accent border (`3px solid var(--color-accent)`) when that section has active filters
- [ ] Active filter count badge appears next to section title (e.g., "Vehicle (2)") — small pill with `var(--color-accent-light)` background
- [ ] Each section gets its own "Clear" text button (right-aligned in section header) — only visible when section has active filters
- [ ] Global "Clear All" button still works and clears everything
- [ ] Expand/collapse animation uses `max-height` transition (200ms ease) instead of instant show/hide
- [ ] Section dividers: `1px solid var(--color-border-light)` between sections
- [ ] Border-radius on sidebar container: `var(--radius-lg)`

---

### US-A4: E2E Tests — CustomSelect + FilterSidebar

**Priority**: P0
**File**: `frontend/e2e/ux-ui-customselect.spec.js`

**Test Cases:**
- [ ] **CustomSelect open/close**: Click trigger opens dropdown, click trigger again closes, click outside closes, Escape key closes
- [ ] **Searchable mode**: Type in search input filters visible options, clearing search shows all options
- [ ] **Keyboard navigation**: Arrow Down moves highlight down, Arrow Up moves highlight up, Enter selects highlighted option
- [ ] **Selection**: Clicking an option selects it, trigger shows selected label, dropdown closes
- [ ] **FilterSidebar Make dropdown**: Opens, shows makes list, search filters makes, selecting a make updates filter state
- [ ] **FilterSidebar Model dropdown**: Appears after make is selected, shows models for that make
- [ ] **FilterSidebar Year/Mileage/Radius**: Each dropdown opens, options are correct, selection works
- [ ] **Filter changes update feed**: Selecting a make filters the listing cards shown
- [ ] **Clear section**: Per-section clear button resets that section's filters
- [ ] **Clear All**: Resets all filters to defaults

## 5. Technical Notes

- **Click-outside pattern** (reuse from `SearchableSelect.jsx`):
  ```js
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  ```

- **CSS variables available** (`variables.css`):
  - Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
  - Accents: `--color-accent`, `--color-accent-hover`, `--color-accent-light`, `--color-accent-medium`
  - Borders: `--color-border`, `--color-border-light`
  - Radii: `--radius-sm`, `--radius-md`, `--radius-lg`

- **Z-index**: Use `200` for dropdown to sit above sidebar content but below modal overlays

## 6. Execution Order

1. US-A1 (build CustomSelect) — foundational
2. US-A2 (replace FilterSidebar selects) — depends on A1
3. US-A3 (sidebar visual redesign) — can overlap with A2
4. US-A4 (E2E tests) — after A1-A3 complete

## 7. Verification

```bash
cd ~/gitchacars/frontend && npm run build                           # Must pass clean
cd ~/gitchacars/frontend && npx playwright test e2e/ux-ui-customselect.spec.js  # All pass
cd ~/gitchacars/frontend && npx playwright test e2e/filter-navbar-v2.spec.js    # No regressions
```
