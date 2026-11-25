---
name: Clinical Clarity
colors:
  surface: '#e6fff5'
  surface-dim: '#c6e0d6'
  surface-bright: '#e6fff5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#dff9f0'
  surface-container: '#d9f4ea'
  surface-container-high: '#d4eee4'
  surface-container-highest: '#cee8df'
  on-surface: '#081f1a'
  on-surface-variant: '#3f4945'
  inverse-surface: '#1e352e'
  inverse-on-surface: '#dcf7ed'
  outline: '#6f7975'
  outline-variant: '#bec9c4'
  surface-tint: '#0c6b59'
  primary: '#004c3e'
  on-primary: '#ffffff'
  primary-container: '#006654'
  on-primary-container: '#90e1ca'
  inverse-primary: '#85d6bf'
  secondary: '#006b59'
  on-secondary: '#ffffff'
  secondary-container: '#98f4db'
  on-secondary-container: '#00725f'
  tertiary: '#3c4543'
  on-tertiary: '#ffffff'
  tertiary-container: '#535c5a'
  on-tertiary-container: '#cbd4d1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a1f2db'
  primary-fixed-dim: '#85d6bf'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#005142'
  secondary-fixed: '#98f4db'
  secondary-fixed-dim: '#7cd7bf'
  on-secondary-fixed: '#002019'
  on-secondary-fixed-variant: '#005143'
  tertiary-fixed: '#dbe4e2'
  tertiary-fixed-dim: '#bfc8c6'
  on-tertiary-fixed: '#151d1c'
  on-tertiary-fixed-variant: '#404947'
  background: '#e6fff5'
  on-background: '#081f1a'
  surface-variant: '#cee8df'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: 4rem
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Manrope
    fontSize: 2.5rem
    fontWeight: '700'
    lineHeight: 3rem
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Manrope
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Manrope
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Manrope
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  body-xl:
    fontFamily: DM Sans
    fontSize: 1.25rem
    fontWeight: '400'
    lineHeight: 1.875rem
    letterSpacing: 0em
  body-lg:
    fontFamily: DM Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
    letterSpacing: 0em
  body-md:
    fontFamily: DM Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.6rem
    letterSpacing: 0.01em
  body-sm:
    fontFamily: DM Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: DM Sans
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: DM Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.04em
  metric-display:
    fontFamily: Manrope
    fontSize: 3rem
    fontWeight: '800'
    lineHeight: 3.25rem
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3.5rem
---

## Brand & Style

This design system establishes an evidence-based, clinical-grade digital sanctuary. Rejecting high-stimulus neon athletics, hyperbolic gym aesthetics, and aggressive gamification, the visual tone leans into restrained medical rigor, tranquil scientific clarity, and warm accessibility.

The core identity communicates:
- **Quiet Authority:** Rooted in peer-reviewed precision, biostatistics, and metabolic science.
- **Cognitive Ease:** Interfaces are designed to soothe health-related anxieties, avoiding alarming danger reds or noisy metrics.
- **Tactile Modernism:** Crisp micro-details, generous respiratory whitespace, balanced soft corner radiuses, and delicate botanical-tinted borders.

The aesthetic philosophy draws on contemporary Scandinavian health-tech: understated typography, tonal layering rather than aggressive shadow play, and an intentional hierarchy that guides users gracefully through complex physiological formulas, body composition indexes, and clinical educational essays.

## Colors

The palette is anchored by deep botanical teals and restorative sage undertones, creating a grounded sense of well-being and clinical trust.

### Palette Architecture
- **Primary (`#006654` / Deep Spruce Teal):** The primary brand anchor. Used for primary CTAs, active states, key interactive indicators, and primary visual markers.
- **Secondary (`#107c68` / Calm Mineral Green):** Provides nuanced contrast for supporting badges, secondary visual anchors, accent borders, and graphical highlights.
- **Tertiary (`#eaf3f0` / Soft Sage):** The foundation for contextual cards, active indicator pills, subtle callout backgrounds, and table cell highlights.
- **Neutral Surface & Background (`#fbfdfc` / Warm Dew):** Replaces harsh pure white with an organic, gentle off-white canvas that reduces retinal strain during long reading sessions.
- **Neutral Foreground (`#132a24` / Deep Charcoal Green):** Replaces stark black with a high-contrast deep vegetal charcoal that delivers optimal legibility with natural warmth.
- **Subtle Surface Border (`#d5e5df` / Sage Mist):** A refined structural divider delivering low-contrast container boundaries without visual clutter.

### Dark Mode Semantic Mapping
When switching to dark mode:
- **Canvas Base:** Shift to `#091613` (Ultra Deep Abyssal Green).
- **Surface Elevation 1 (Cards & Modules):** Shift to `#0f241f` with a 1px border of `#1a3b33`.
- **Primary Action:** Scales to `#17937c` for enhanced luminance against dark grounds.
- **Text Primary:** Inverts to `#eaf5f1`, with secondary copy adopting `#9ab3ab`.

## Typography

The typography unites analytical rigor with warm editorial flow.

- **Headlines (Manrope):** Geometric, balanced, and structural. Manrope provides architectural grounding for tool titles, clinical headers, and quantified numerical results. Tight negative letter spacing at display scales reinforces authority.
- **Body & Controls (DM Sans):** Low-contrast, exceptionally legible, and highly accommodating for lengthy medical annotations, evidence citations, and calculator input controls.
- **Metric Displays:** Numbers produced by formulas (e.g., TDEE, VO2 Max, Body Fat %) use `metric-display` in Manrope with tabular figures enabled (`font-variant-numeric: tabular-nums`) to ensure dynamic calculations do not induce layout twitching.

## Layout & Spacing

The layout is built around deliberate pacing and rhythmic reading intervals.

### Grid & Composition
- **Desktop (1024px+):** 12-column responsive grid with a maximum content container of `1280px`. Gutter width is `1.5rem` (24px) with expansive outer canvas padding (`margin: 3rem`).
- **Calculator Workspaces:** Standard dual-column asymmetry: 5 columns dedicated to structured input arrays and biometric sliders, and 7 columns dedicated to real-time calculation output, visual dials, and reference percentiles.
- **Editorial Layouts:** Strict 8-column centralized column (max-width `740px`) centered inside the 12-column shell to maintain an optimal 65–75 character measure for cognitive reading retention.
- **Mobile (< 768px):** 4-column fluid system. Gutter condenses to `1rem` and outer margin shifts to `1.25rem`. Calculator outputs dock fixed at the bottom viewport or collapse sequentially below inputs.

## Elevation & Depth

This design system avoids high-contrast drop shadows and artificial skeuomorphism in favor of **tonal layering with soft atmospheric tinting**.

### Layering Hierarchy
1. **Canvas Surface (Level 0):** Neutral `#fbfdfc`.
2. **Structural Panels (Level 1):** Solid white (`#ffffff`) bordered with `1px solid #d5e5df`. Soft atmospheric drop: `0px 4px 20px -2px rgba(19, 42, 36, 0.04)`.
3. **Interactive Overlays & Flyouts (Level 2):** `#ffffff` with `0px 12px 32px -4px rgba(19, 42, 36, 0.08)` and subtle border `rgba(0, 102, 84, 0.12)`.
4. **Recessed Wells (Level -1):** Used for calculation inputs, slider tracks, and secondary data readouts. Solid `#f2f7f5` or `#eaf3f0` with an inset perimeter line (`inset 0 1px 2px rgba(19, 42, 36, 0.04)`). No drop shadows.

## Shapes

The design system embraces an approachable, ergonomic geometry that softens complex medical metrics:
- **Base Components (Inputs, Buttons, Chips):** `rounded-xl` (12px / 0.75rem) to ensure a comfortable touch target and intuitive tactile invitation.
- **Card Containers & Formula Modules:** `rounded-2xl` (16px to 24px) providing gentle, welcoming containment without becoming cartoonish or juvenile.
- **Segmented Controls & Metric Badges:** Pill-shaped (`rounded-full`) to delineate categorical choices, health statuses, and unit toggles (e.g., `Metric` vs. `Imperial`).

## Components

### Buttons
- **Primary:** Deep Teal (`#006654`) background, pure white text, font weight 600. `0.75rem` vertical, `1.5rem` horizontal padding. Rounded `rounded-xl`. Subtle transition on hover to `#0f4c42` with an ambient glow (`box-shadow: 0 4px 14px rgba(0, 102, 84, 0.2)`).
- **Secondary / Ghost:** Transparent base, `1.5px` border in `#107c68`, text `#006654`. Hover shifts background to `#eaf3f0`.
- **Tertiary Utility:** No border, background transparent, text `#006654`, underlines or highlights on hover with a sage wash.

### Input Fields & Sliders
- **Text/Numeric Inputs:** Background `#ffffff`, border `1.5px solid #d5e5df`, text `#132a24`. On focus, border transitions to `#006654` accompanied by a soft halo: `box-shadow: 0 0 0 3px rgba(0, 102, 84, 0.12)`. Height standard is `48px` to facilitate error-free mobile tapping.
- **Range Sliders:** Unfilled track in `#eaf3f0` (`6px` height, rounded full), filled progression track in `#006654`. Thumb is a clean `24px` white circle with `2px solid #006654` and a slight lift shadow.

### Chips & Unit Selectors
- **Toggles (e.g., kg / lb, cm / in):** Housed inside a recessed `#f2f7f5` container (`4px` internal padding). The active option is an elevated white pill with `font-weight: 600`, text `#006654`, and crisp micro-shadow (`0 2px 4px rgba(0,0,0,0.05)`). Inactive labels are `#132a24` at 65% opacity.

### Cards & Result Modules
- **Result Cards:** Differentiated by a sage gradient edge or a delicate `#eaf3f0` fill. Key outputs prominently display the metric value in `metric-display`, flanked by an explanatory label and a colored reference range indicator (e.g., Normal, Elevated, Optimal) rendered in contextual muted tones rather than saturated traffic-light primaries.
- **Educational Article Cards:** Crisp `#ffffff` cards featuring a 16:9 imagery cap, generous `1.5rem` internal body padding, a primary tag in `#eaf3f0` / `#006654`, and reading-time metadata in `body-sm`.

### Checkboxes & Radios
- Size `20px` by `20px`. Border `1.5px solid #d5e5df`. When checked, smooth scale-in transition to background `#006654` with a crisp white check icon or center dot. Focus ring mirrors the input halo.