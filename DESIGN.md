---
name: ShellPanel
colors:
  primary: "#1856FF"
  secondary: "#3A344E"
  info: "#1856FF"
  success: "#07CA6B"
  warning: "#E89558"
  danger: "#EA2143"
  surface: "#FFFFFF"
  text: "#141414"
  neutral: "#FFFFFF"
shell:
  surface: "#F8FAFF"
  border: "#D7DEFF"
panel:
  surface: "hsla(0, 0%, 100%, 0.96)"
  surface-muted: "hsla(0, 0%, 98.5%, 0.5)"
  surface-strong: "hsla(0, 0%, 98.5%, 0.65)"
  border: "hsla(223.9, 60%, 88%, 0.2)"
  border-strong: "hsla(223.9, 70%, 82%, 0.3)"
  shadow: "none"
  backdrop-soft: "blur(14px) saturate(1.18) brightness(1.05) contrast(1.02)"
  backdrop-strong: "blur(22px) saturate(1.22) brightness(1.03) contrast(1.04)"
  backdrop-overlay: "blur(14px) saturate(1.15) brightness(0.98)"
  overlay: "hsla(223.9, 40%, 12%, 0.45)"
   disabled-opacity: "0.5"
skeleton:
  base: "var(--muted)"
  shimmer: "hsla(var(--muted-foreground) / 0.1)"
  animation-duration: 1.5s
themes:
  light:
    background: "#FFFFFF"
    foreground: "#141414"
    card: "#FFFFFF"
    card-foreground: "#141414"
    popover: "#FFFFFF"
    popover-foreground: "#141414"
    primary: "#1856FF"
    primary-foreground: "#FFFFFF"
    self-block: "#0F49D6"
    self-block-foreground: "#FFFFFF"
    secondary: "#3A344E"
    secondary-foreground: "#FFFFFF"
    muted: "#EEF1FF"
    muted-foreground: "#3A344E"
    accent: "#E6EBFF"
    accent-foreground: "#141414"
    border: "#D7DEFF"
    input: "#D7DEFF"
    ring: "#1856FF"
    success: "#07CA6B"
    success-foreground: "#FFFFFF"
    warning: "#E89558"
    warning-foreground: "#141414"
    danger: "#EA2143"
    danger-foreground: "#FFFFFF"
    info: "#1856FF"
    info-foreground: "#FFFFFF"
    right-sidebar-width: "40rem"
  dark:
    background: "#0E1016"
    foreground: "#F5F7FF"
    card: "#121521"
    card-foreground: "#F5F7FF"
    popover: "#121521"
    popover-foreground: "#F5F7FF"
    primary: "#1856FF"
    primary-foreground: "#FFFFFF"
    self-block: "#0B43C2"
    self-block-foreground: "#FFFFFF"
    secondary: "#3A344E"
    secondary-foreground: "#FFFFFF"
    muted: "#1B2132"
    muted-foreground: "#B6BED3"
    accent: "#20263A"
    accent-foreground: "#F5F7FF"
    border: "#2B3247"
    input: "#2B3247"
    ring: "#3F6DFF"
    success: "#07CA6B"
    success-foreground: "#071D14"
    warning: "#E89558"
    warning-foreground: "#2B1A10"
    danger: "#EA2143"
    danger-foreground: "#FFFFFF"
    info: "#3F6DFF"
    info-foreground: "#FFFFFF"
gradients:
  light:
    app: "radial-gradient(900px circle at 15% -10%, hsl(223.9 100% 54.7% / 0.55), transparent 60%), radial-gradient(900px circle at 90% 0%, hsl(253.8 20% 25.5% / 0.35), transparent 55%), linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(229.4 100% 91%) 55%, hsl(228 100% 88%) 100%)"
  dark:
    app: "radial-gradient(900px circle at 15% -10%, hsl(223.9 100% 54.7% / 0.55), transparent 60%), radial-gradient(900px circle at 90% 0%, hsl(253.8 20% 25.5% / 0.45), transparent 55%), linear-gradient(135deg, hsl(225 22.2% 6%) 0%, hsl(228 29.4% 9%) 55%, hsl(224.3 29.9% 13%) 100%)"
particles:
  light:
    app: "radial-gradient(circle, hsla(223.9, 100%, 54.7%, 0.28) 1px, transparent 1.6px)"
  dark:
    app: "radial-gradient(circle, hsla(223.9, 100%, 54.7%, 0.32) 1px, transparent 1.6px)"
typography:
  h1:
    fontFamily: "Plus Jakarta Sans"
    fontSize: 3rem
  body-md:
    fontFamily: "Plus Jakarta Sans"
    fontSize: 1rem
  label-caps:
    fontFamily: "JetBrains Mono"
    fontSize: 0.75rem
  sourceScale: "mobile-first compact scale"
  weights: "100, 200, 300, 400, 500, 600, 700, 800, 900"
rounded:
  sm: 4px
  md: 8px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  "2xl": 40px
  sourceScale: "comfortable density mode"
---

## Overview

Balanced shell and panel system with opaque app chrome and selectively frosted content surfaces.

## Style Foundations

- **Visual style:** clean, high-contrast, bold, enterprise, layered shell-panel surfaces
- **Typography scale:** mobile-first compact scale
- **Typography fonts:** primary=Plus Jakarta Sans, display=Plus Jakarta Sans, mono=JetBrains Mono
- **Typography weights:** 100, 200, 300, 400, 500, 600, 700, 800, 900
- **Color palette:** primary, neutral, success, warning, danger, info, shell/panel surfaces
- **Spacing scale:** comfortable density mode

## Colors

- **Primary (#1856FF):** Token from style foundations.
- **Self block:** Slightly darker primary-derived token used for owned messages and files.
- **Secondary (#3A344E):** Token from style foundations.
- **Success (#07CA6B):** Token from style foundations.
- **Warning (#E89558):** Token from style foundations.
- **Danger (#EA2143):** Token from style foundations.
- **Surface (#FFFFFF):** Token from style foundations.
- **Text (#141414):** Token from style foundations.
- **Neutral (#FFFFFF):** Derived from the surface token for official format compatibility.

## Theme Tokens

Light and dark theme values are defined under `themes.light` and `themes.dark` in the front matter. Use these tokens for `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `border`, `input`, `ring`, and semantic states (`success`, `warning`, `danger`, `info`) across the UI.

## Shell Tokens

Shell tokens live under `shell` in the front matter. Use them for persistent chrome such as sidebars and headers. Shell surfaces should stay opaque and should not use blur.

## Panel Tokens

Panel tokens live under `panel` in the front matter. Use `surface` for opaque content cards, `surface-muted` for frosted controls like inputs and context menus, and `surface-strong` for dialogs and drawers. Panels do not use shadows; keep elevation flat and rely on surface contrast, border, and blur only.

## Blur

Blur is centralized through `panel.backdrop-soft`, `panel.backdrop-strong`, and `panel.backdrop-overlay`. These profiles control more than radius: they also define saturation, brightness, and contrast. Use the shared panel utility classes instead of adding ad-hoc backdrop-filter values in components.

## Gradients

App background gradients are defined under `gradients.light.app` and `gradients.dark.app` in the front matter. Use these tokens for the global background only; do not create ad-hoc gradients without adding tokens here first.