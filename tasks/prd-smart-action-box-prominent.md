# PRD: SmartActionBox — Prominent Redesign

## 1. Introduction / Overview

The SmartActionBox ("What would you like to do?") in the FilterSidebar is the primary CTA for AI-powered actions (Find a Buyer, Post a Want-Listing). Currently it feels like a secondary element — it has extra padding that makes it narrower than filter sections, centered text, and a subtle background. This PRD defines changes to make it visually prominent with an accent-colored treatment, left-aligned text, flush width with other filter sections, full-width stacked action cards, and a polished animated glowing border effect using the `frontend-design` UI skill for high design quality.

## 2. Goals

- Make the SmartActionBox the most visually prominent element in the FilterSidebar
- Align its width flush with filter section bodies (no extra inset padding)
- Left-align all text for consistency with other sidebar elements
- Redesign dropdown cards as full-width stacked rows with left-aligned icon + text
- Implement a polished, animated glowing/moving border on the prompt box using the `frontend-design` skill for production-grade quality
- The glow effect must feel premium — smooth rotation, subtle blur, eye-catching without being garish

## 3. User Stories

### US-001: Prominent Prompt Button with Animated Glowing Border

**Description:** As a user browsing the FilterSidebar, I want the "What would you like to do?" prompt to stand out visually with an animated glowing border so that I notice it immediately as the primary action.

**Acceptance Criteria:**
- [ ] Prompt button has an accent-colored background (`rgba(37, 99, 235, 0.06)`) and accent border (`1px solid var(--color-accent)`)
- [ ] Text is left-aligned (not `space-between` centered)
- [ ] Chevron icon remains on the right side
- [ ] Font weight is `600` (semibold) to feel more impactful
- [ ] Animated glowing border wraps the prompt button using the `frontend-design` skill
- [ ] Glow uses a rotating conic gradient (accent blue `#2563EB` ↔ success green `#059669`) via CSS `@property --glow-angle`
- [ ] `::before` pseudo-element renders the rotating gradient border (2px inset, smooth 4s rotation)
- [ ] `::after` pseudo-element renders a blurred shadow underneath (4px inset, `blur(12px)`, `opacity: 0.4`) for a soft glow halo
- [ ] Animation runs continuously (`infinite linear`) and feels smooth, not jerky
- [ ] Fallback: browsers without `@property` support get a static gradient border (no animation, still looks good)
- [ ] Glow does NOT overflow into adjacent filter sections — contained within the SmartActionBox area
- [ ] **Verify in browser:** Border visibly rotates with a soft glow, drawing the eye without being distracting

### US-002: Flush Width with Filter Sections

**Description:** As a user, I want the SmartActionBox to be the same width as filter section content so the sidebar looks cohesive.

**Acceptance Criteria:**
- [ ] `.smart-action-box` padding matches filter section body padding (0 horizontal, uses parent's `var(--space-4)` side padding)
- [ ] The prompt button stretches to the same width as filter inputs (e.g., Make dropdown, zip code input)
- [ ] The dropdown also stretches to match
- [ ] **Verify in browser:** SmartActionBox left/right edges align with filter section content edges

### US-003: Full-Width Stacked Action Cards

**Description:** As a user, I want the action cards to be full-width rows with left-aligned icon and label so they are easy to scan and tap.

**Acceptance Criteria:**
- [ ] Cards display as stacked rows (one per line), not side-by-side grid
- [ ] Each card has: icon on the left, label text to the right of icon, both vertically centered
- [ ] Cards are full-width within the dropdown
- [ ] Hover state: accent border + light accent background (`rgba(37, 99, 235, 0.04)`)
- [ ] Card text is left-aligned
- [ ] **Verify in browser:** Cards are easy to read and clearly clickable

## 4. Functional Requirements

- **FR-1:** The `.smart-action-box` container must use `padding: 0 var(--space-4)` with top/bottom margin of `var(--space-3)` to sit flush with filter sections.
- **FR-2:** The `.smart-action-prompt` button must have `background: rgba(37, 99, 235, 0.06)`, `border: 1px solid var(--color-accent)`, `text-align: left`, `font-weight: 600`.
- **FR-3:** The `.smart-action-cards` container must use `display: flex; flex-direction: column; gap: var(--space-2)` instead of a 2-column grid.
- **FR-4:** Each `.smart-action-card` must use `flex-direction: row` with `align-items: center`, `gap: var(--space-3)`, `text-align: left`, and `justify-content: flex-start`.
- **FR-5:** The GlowingShadow wrapper must remain around the prompt button. Use the `frontend-design` skill to ensure the animated border is production-grade.
- **FR-6:** The dropdown must remain flush with the prompt button (no border-radius gap).
- **FR-7:** The `GlowingShadow.css` must use `@property --glow-angle` for smooth CSS-only animation of a rotating conic gradient. The `::before` layer is the visible border, the `::after` layer is the blurred glow shadow.
- **FR-8:** The prompt button's own background must be opaque enough (`var(--color-bg)`) to mask the gradient underneath, so the gradient only shows as a thin animated border.
- **FR-9:** On hover, the glow opacity should subtly increase (e.g., `::after` opacity from `0.4` → `0.6`) for an interactive feel.

## 5. Non-Goals (Out of Scope)

- No changes to the active mode header (when chat is open)
- No changes to the SidebarChat component
- No changes to mobile FilterSidebar layout
- No new functionality — this is purely visual/layout

## 6. Design Considerations

### Files to Modify

| File | Changes |
|------|---------|
| `frontend/src/components/SmartActionBox.css` | Padding, background, alignment, card layout |
| `frontend/src/components/SmartActionBox.jsx` | Card `flex-direction: row` via class (CSS-only change, no JSX changes needed) |
| `frontend/src/components/GlowingShadow.css` | Refine animated glow — adjust colors, timing, blur, hover state per `frontend-design` skill |
| `frontend/src/components/GlowingShadow.jsx` | No changes expected (wrapper component is already clean) |

### Visual Spec

```
┌─── FilterSidebar ─────────────────┐
│  Filters                Clear All  │
├────────────────────────────────────┤
│  ╔══ GlowingShadow ═════════════╗ │
│  ║ What would you like to do?  ▼║ │
│  ╚══════════════════════════════╝ │
│  ┌──────────────────────────────┐ │
│  │ 🔍  Find a Buyer             │ │
│  ├──────────────────────────────┤ │
│  │ ＋  Post a Want-Listing       │ │
│  └──────────────────────────────┘ │
├────────────────────────────────────┤
│  Make / Model                    ▼ │
│  ...                               │
```

## 7. Technical Considerations

- CSS-only changes — no new components or state
- The GlowingShadow `::before` / `::after` pseudo-elements use `inset: -2px` so the accent border on the prompt won't conflict (glow sits outside)
- Ensure the dropdown `border-top: none` still connects cleanly when open
- **`@property` browser support:** Chrome 85+, Edge 85+, Safari 15.4+, Firefox 128+. The fallback (`@supports not`) must produce a static gradient that still looks polished.
- **Performance:** CSS `@property` animations are GPU-accelerated and do not cause layout reflow. The `filter: blur()` on `::after` is the most expensive part — keep blur radius ≤ 12px.
- **Use `frontend-design` skill** during implementation to ensure the glow effect meets production-grade design standards — avoid generic/cheap-looking AI aesthetics.

## 8. Success Metrics

- SmartActionBox is the first thing users notice in the sidebar
- Layout feels cohesive — no width misalignment between SmartActionBox and filter sections
- Action cards are clearly scannable as two distinct options

## 9. Open Questions

- None — scope is clear and contained.
