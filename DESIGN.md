# DESIGN.md -- Parvez Draw

## 1. Objective

Parvez Draw should feel like opening a premium desktop application built in 2026 -- calm, fast, and unmistakably its own product. Every pixel should communicate that this is a professional creative tool with a distinct Bangladeshi-inspired identity, not a reskinned open-source project. The 90% state (canvas + toolbars) should be so clean that the interface disappears, leaving only the drawing.

## 2. Product Context

- **What the product does:** An offline-first whiteboard for sketching, diagramming, and visual thinking -- like FigJam without the cloud dependency.
- **Who it's for:** Designers, engineers, product managers, and students who want a fast, beautiful whiteboard that works without internet.
- **Adjacent brands (feel like these):** Figma (precision, property panels), Linear (calm density, keyboard-first), Arc Browser (glass effects, premium feel).
- **Distant brand (do not feel like this):** Microsoft Whiteboard -- cluttered, corporate, no visual identity.
- **Cultural register:** Professional-creative. Technical enough for engineers, beautiful enough for designers. Never playful to the point of frivolity.

## 3. Visual Foundations

### 3a. Color

**Light Mode:**
```
--pd-green-50:  #f0faf5
--pd-green-100: #d1f2e1
--pd-green-200: #a3e4c3
--pd-green-300: #6dd4a0
--pd-green-400: #3bc47e
--pd-green-500: #006a4e   (primary -- Bangladesh Green)
--pd-green-600: #005a42
--pd-green-700: #004a36
--pd-green-800: #003a2a
--pd-green-900: #002a1e

--pd-red-50:    #fff1f3
--pd-red-100:   #ffe0e4
--pd-red-200:   #ffc6cd
--pd-red-300:   #ff9daa
--pd-red-400:   #ff6478
--pd-red-500:   #f42a41   (accent -- Bangladesh Red)
--pd-red-600:   #d41e36
--pd-red-700:   #b0162c
--pd-red-800:   #8c1224
--pd-red-900:   #6b0e1c

--pd-gray-50:   #fafbfc
--pd-gray-100:  #f4f6f8
--pd-gray-200:  #e8ecf0
--pd-gray-300:  #d1d8e0
--pd-gray-400:  #a0adc0
--pd-gray-500:  #6b7a90
--pd-gray-600:  #4a5568
--pd-gray-700:  #364152
--pd-gray-800:  #252d3a
--pd-gray-900:  #161b24
```

**Dark Mode:**
```
--pd-dark-bg:       #0d1117
--pd-dark-surface:  #161b22
--pd-dark-raised:   #1c2333
--pd-dark-overlay:  #242d3d
--pd-dark-border:   #2d3748
--pd-dark-text:     #e6edf3
--pd-dark-muted:    #8b949e
```

**Usage rules:**
- Green (#006A4E) is the primary identity -- used on active states, selected tools, primary buttons, logo, and focus rings. Never as a background fill for large areas.
- Red (#F42A41) is the danger/accent -- destructive actions, error states, and one strategic highlight per screen maximum.
- Gray scale carries 80% of the interface. The grays do the work; green and red provide identity.
- Glass effects use `backdrop-filter: blur(20px)` with 70-85% opacity backgrounds, not solid fills.

### 3b. Typography

- **Display face:** Inter (variable weight, -0.02em tracking for headings)
- **Body face:** Inter (400/500/600 weights)
- **Mono face:** JetBrains Mono (for coordinates, zoom, technical readouts)
- **Fallback stack:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`
- **Type scale:** 11 / 12 / 13 / 14 / 16 / 18 / 20 / 24 / 32 / 40 px
- **Weight discipline:**
  - 400: body text, descriptions, secondary labels
  - 500: UI labels, menu items, property values
  - 600: section headers, button text, active states
  - 700: page titles, logo text (sparingly)

### 3c. Spacing & Rhythm

- **Base unit:** 4px
- **Spacing scale:** 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 px
- **Panel padding:** 16px (sidebars), 12px (toolbar), 8px (compact items)
- **Component gap:** 4-8px within groups, 12-16px between groups
- **Border radius:** 6px (buttons, inputs), 10px (cards, panels), 14px (dialogs, modals), 18px (large containers)

### 3d. Component seeds

- **Buttons:** 3 variants -- primary (filled green), secondary (ghost with border), danger (filled red). All 36px height, 6px radius, 12px horizontal padding. Icon-only buttons are 32x32px.
- **Panels:** Glass-effect background (`rgba(255,255,255,0.85)` light / `rgba(22,27,34,0.85)` dark) with `backdrop-filter: blur(20px)`. 1px border using `--pd-gray-200` light / `--pd-dark-border` dark. No hard shadows -- only soft `0 4px 24px rgba(0,0,0,0.08)`.
- **Iconography:** Lucide icons, 1.5px stroke weight, 20x20px default size. Consistent stroke style throughout.
- **Inputs:** 36px height, 6px radius, 1px border, focus ring uses green with 2px offset.
- **Context menus:** Glass background, 6px radius items, green highlight on hover, 200ms transition.

## 4. Accessibility

- **Text contrast:** body 4.5:1 min against background, large text/UI 3:1 min
- **Motion:** Respect `prefers-reduced-motion` -- disable spring animations, reduce transitions to simple fades
- **Focus indicators:** 2px solid green outline with 2px offset, visible on all interactive elements
- **Keyboard navigation:** Full tab order through all panels, arrow keys in toolbars, escape to close menus
- **Screen reader:** ARIA labels on all icon buttons, role attributes on panels, live regions for status updates
- **High contrast:** Support Windows high contrast mode with forced-colors media query

## 5. Voice & Tone

- **Register:** Professional-technical. Clear, direct, no fluff.
- **Sentence rhythm:** Short. Labels are 1-3 words. Descriptions are one sentence max.
- **Words this brand uses:** "Canvas," "element," "artboard," "export"
- **Words this brand refuses:** "seamlessly," "elevate," "journey," "unlock," "delight," "powerful"
- **Address:** "You" (direct, second person)

## 6. Implementation Practices

- **Token format:** CSS custom properties on `:root` and `.pd-theme--dark`
- **Component library:** Bespoke components built on Radix UI primitives where interaction complexity warrants it (menus, dialogs, tooltips)
- **Animation:** Framer Motion for panel transitions, CSS transitions for hover states. Spring physics: `type: "spring", stiffness: 300, damping: 30`
- **Grid system:** CSS Grid for layout, Flexbox for component internals
- **Image treatment:** No stock photography. SVG icons and geometric decorations only.
- **Motion rules:** 150ms for hover states, 200ms for menu transitions, 300ms for panel slides, spring for selection animations

## 7. Anti-Patterns

- **No Excalidraw UI leaking through.** Every button, menu, panel, and tooltip must be replaced. Even if the Excalidraw version "works fine," it breaks the identity.
- **No Christmas colors.** Green is primary identity, red is danger accent. They never appear together as decorative elements.
- **No generic card grids.** The properties panel uses inline controls (sliders, color swatches, dropdowns), not cards.
- **No emoji in the UI.** Icons only. Emoji signal "consumer app," not "professional tool."
- **No hard box shadows.** Shadows are soft, diffused, and low-opacity. Think macOS, not Material Design 1.0.
- **No pure white backgrounds on panels.** Always use glass effect or slightly tinted surfaces.

## 8. Decision-Making

1. **Identity over convention.** When a standard UI pattern conflicts with the Bangladesh-inspired identity, choose identity. The green accent on an active tool is more important than matching Figma's gray.
2. **Clarity over density.** When there's a choice between packing more controls into a space vs. leaving breathing room, leave room. Linear-level density is the ceiling.
3. **Canvas dominance.** Any UI element that competes with the canvas for attention should be reduced, moved, or made translucent. The canvas is the product.
4. **Performance perception.** Animations should make the UI feel faster, not slower. If an animation adds latency to a common action, cut it.
5. **Dark mode is first-class.** Every component is designed in both modes simultaneously, not dark-mode-as-afterthought.

## 9. Workflow

1. Read this DESIGN.md and understand the visual system before touching any code.
2. Start with the design token layer (CSS variables, font imports, base styles).
3. Build atomic components (buttons, inputs, icons) before assembling panels.
4. Implement one complete panel (e.g., top bar) end-to-end before starting the next.
5. Test every component in both light and dark mode before moving on.
6. Add Framer Motion animations after the component is functionally complete.
7. Run accessibility checks (keyboard nav, contrast, screen reader) on each completed section.
8. Verify the canvas remains fully functional at each integration point.
