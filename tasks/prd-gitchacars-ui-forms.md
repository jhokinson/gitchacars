# PRD: GitchaCars UI — Form Pages Fix + Select Migration

## 1. Introduction/Overview

The CreateListingPage hides critical form fields (title, description, budget, location) behind collapsed accordion sections, forcing users to discover and click them open. Additionally, all form pages still use native `<select>` dropdowns and the old `SearchableSelect` component instead of the new unified `CustomSelect`. This work tree fixes the form UX and migrates all remaining selects project-wide.

**Blocked by**: Work Tree A (needs `CustomSelect` component to exist first).

## 2. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| All form fields visible | CreateListingPage shows all 4 sections expanded on load |
| Unified select component | Zero native `<select>` or `SearchableSelect` imports remain in form pages |
| Clean codebase | `SearchableSelect.jsx` and `SearchableSelect.css` deleted with no dangling imports |
| Zero regressions | Form submissions still send correct values to API |

## 3. Files

**Modify:**
- `frontend/src/pages/CreateListingPage.jsx`
- `frontend/src/pages/AddVehiclePage.jsx`
- `frontend/src/pages/EditVehiclePage.jsx`
- `frontend/src/pages/WantListingDetailPage.jsx`

**Delete:**
- `frontend/src/components/SearchableSelect.jsx`
- `frontend/src/components/SearchableSelect.css`

**Create:**
- `frontend/e2e/ux-ui-forms.spec.js`

## 4. User Stories

---

### US-B1: Fix CreateListingPage — Open All Sections By Default

**Priority**: P0
**File**: `CreateListingPage.jsx`

**Problem**: `openSections` state at line ~92 defaults to `{ vehicle: true, specs: false, budget: false, details: false }`. The section completion guards (`s1Complete`, `s2Complete`, `s3Complete` at lines ~105-107) prevent users from even opening later sections until earlier ones are filled. This means budget, location, title, and description fields are invisible on page load.

**Fix:**
1. Change `openSections` default to `{ vehicle: true, specs: true, budget: true, details: true }`
2. Remove the `s1Complete &&`, `s2Complete &&`, `s3Complete &&` guard conditions that prevent opening sections
3. Keep accordion headers clickable so users can optionally collapse sections
4. Keep the section completion indicators (checkmarks) as visual feedback — just don't use them as gatekeepers

**Acceptance Criteria:**
- [ ] All 4 accordion sections (Vehicle, Specs, Budget, Details) are expanded on page load
- [ ] User can click any section header to collapse/expand it
- [ ] No section is locked behind completion of a prior section
- [ ] Section completion checkmarks still appear when section data is filled
- [ ] Form submission still validates all required fields before sending

---

### US-B2: Replace Selects in CreateListingPage

**Priority**: P0
**File**: `CreateListingPage.jsx`

| Element | Current | Line | Replace with |
|---|---|---|---|
| Make | `SearchableSelect` | ~250 | `CustomSelect searchable` |
| Model | `SearchableSelect` | ~263 | `CustomSelect searchable` |
| Transmission | native `<select>` | ~305 | `CustomSelect` |
| Drivetrain | native `<select>` | ~313 | `CustomSelect` |
| Condition | native `<select>` | ~323 | `CustomSelect` |

**Acceptance Criteria:**
- [ ] All 5 select elements replaced with `<CustomSelect>`
- [ ] Make: `searchable={true}`, options from `getAllMakes()` + "Other"
- [ ] Model: `searchable={true}`, options from `getModelsByMake()` + "Other", disabled when no make selected
- [ ] "Other" make/model behavior preserved: selecting "Other" shows text input for custom entry
- [ ] Transmission options: Any, Automatic, Manual
- [ ] Drivetrain options: Any, FWD, RWD, AWD, 4WD
- [ ] Condition options: Any, New, Used
- [ ] `onChange` handlers update form state correctly
- [ ] Import of `SearchableSelect` removed from this file

---

### US-B3: Replace Selects in AddVehiclePage + EditVehiclePage

**Priority**: P1
**Files**: `AddVehiclePage.jsx`, `EditVehiclePage.jsx`

**AddVehiclePage selects (line ~93+):**
- Make → `CustomSelect searchable`
- Model → `CustomSelect searchable` (conditional on make)
- Transmission → `CustomSelect` (Automatic, Manual)
- Drivetrain → `CustomSelect` (FWD, RWD, AWD, 4WD)

**EditVehiclePage**: Shares the same VehicleForm pattern. Apply identical changes.

**Acceptance Criteria:**
- [ ] All native `<select>` elements in AddVehiclePage replaced with `<CustomSelect>`
- [ ] Make and Model are `searchable={true}`
- [ ] EditVehiclePage has same CustomSelect replacements
- [ ] Form pre-fills correctly when editing existing vehicle
- [ ] Submission sends correct values to API

---

### US-B4: Replace Select in WantListingDetailPage

**Priority**: P1
**File**: `WantListingDetailPage.jsx`

**Acceptance Criteria:**
- [ ] Vehicle selector dropdown (used when introducing a vehicle to a want listing) replaced with `<CustomSelect>`
- [ ] If user has >5 vehicles, use `searchable={true}`; otherwise `searchable={false}`
- [ ] Selected vehicle displays correctly in the introduction form
- [ ] Introduction submission still works correctly

---

### US-B5: Remove Old SearchableSelect Component

**Priority**: P0
**Files to delete**: `SearchableSelect.jsx`, `SearchableSelect.css`

**Acceptance Criteria:**
- [ ] `SearchableSelect.jsx` deleted
- [ ] `SearchableSelect.css` deleted
- [ ] `grep -r "SearchableSelect" frontend/src/` returns zero results (no dangling imports)
- [ ] `npm run build` passes clean with no missing module errors

---

### US-B6: E2E Tests — Form Pages

**Priority**: P0
**File**: `frontend/e2e/ux-ui-forms.spec.js`

**Test Cases:**
- [ ] **CreateListingPage sections visible**: All 4 accordion sections are expanded on page load without clicking
- [ ] **CreateListingPage Make/Model**: CustomSelect opens, searchable, selecting make populates model dropdown
- [ ] **CreateListingPage Transmission/Drivetrain/Condition**: CustomSelect dropdowns open and options are correct
- [ ] **CreateListingPage "Other" make**: Selecting "Other" shows custom text input
- [ ] **CreateListingPage form submission**: Fill all fields, submit, verify success (or API response)
- [ ] **AddVehiclePage selects**: All 4 CustomSelect dropdowns functional
- [ ] **EditVehiclePage pre-fill**: Existing vehicle data populates CustomSelect values correctly
- [ ] **WantListingDetailPage vehicle selector**: CustomSelect shows user's vehicles, selection works
- [ ] **No SearchableSelect remnants**: Page source contains no `searchable-select` CSS classes

## 5. Technical Notes

- **"Other" make/model pattern** (CreateListingPage): When user selects "Other" from make dropdown, a text `<input>` appears for custom make entry. The `effectiveMake` computed value prioritizes `form.customMake` over `form.make` when make === "Other". Same pattern for model. This logic must be preserved exactly.

- **Form state shape** (CreateListingPage):
  ```js
  { make, model, customMake, customModel, yearMin, yearMax,
    budgetMin, budgetMax, zipCode, radius, transmission,
    drivetrain, condition, title, description, features }
  ```

- **Section completion indicators**: Keep the `s1Complete`, `s2Complete`, `s3Complete` computed values — they're used for visual checkmarks. Just remove their use as guards for `openSections`.

## 6. Execution Order

1. US-B1 (fix accordion defaults) — quick, independent
2. US-B2 (CreateListingPage selects) — depends on Work Tree A
3. US-B3 (Add/Edit vehicle page selects) — depends on Work Tree A
4. US-B4 (WantListingDetailPage select) — depends on Work Tree A
5. US-B5 (delete SearchableSelect) — after all migrations done
6. US-B6 (E2E tests) — after B1-B5 complete

## 7. Verification

```bash
cd ~/gitchacars/frontend && npm run build                      # Must pass clean
cd ~/gitchacars/frontend && npx playwright test e2e/ux-ui-forms.spec.js  # All pass
cd ~/gitchacars/frontend && npx playwright test e2e/smart-form.spec.js   # No regressions
grep -r "SearchableSelect" ~/gitchacars/frontend/src/          # Zero results
```
