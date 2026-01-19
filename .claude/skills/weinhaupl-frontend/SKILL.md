---
name: weinhaupl-frontend
description: Create production-grade frontend interfaces following the Weinhäupl Waagenbau brand identity. Use this skill when building web components, pages, dashboards, React components, or HTML/CSS layouts for Weinhäupl or when the user mentions Weinhäupl styling. Implements the industrial Austrian precision aesthetic with the signature deep navy (#021827) and Weinhäupl Red (#F71635) color scheme.
---

# Weinhäupl Frontend Design Skill

Create distinctive, production-grade frontend interfaces following the Weinhäupl Waagenbau brand identity—an Austrian industrial weighing systems manufacturer emphasizing precision, reliability, and professional quality.

## Brand Aesthetic

**Core identity**: Industrial precision meets Austrian reliability. Bold contrast between deep navy and vibrant red creates strong visual impact. Clean, structured layouts reflect the precision of weighing equipment.

**Tone**: Professional & Technical, Reliable & Trustworthy, Modern & Forward-thinking, Approachable

## Color System

### Primary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Weinhäupl Red | `#F71635` | Primary CTAs, highlights, active states |
| Deep Navy | `#021827` | Headers, footers, dark sections |
| Pure Black | `#000000` | Primary text |
| Pure White | `#FFFFFF` | Backgrounds, text on dark |
| Neutral Gray | `#666666` | Secondary text, icons |

### Extended Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Dark Red (hover) | `#D10026` | Button hover states |
| Corporate Blue | `#0C71C3` | Links, secondary accent |
| Light Navy | `#0A3A5C` | Cards on dark backgrounds |
| Light Gray | `#F5F5F5` | Alternating sections |
| Border Gray | `#DDDDDD` | Dividers, borders |
| Red Light | `#FEE2E5` | Error backgrounds |
| Blue Light | `#E8F4FC` | Info backgrounds |

### Semantic Colors
- Success: `#27AE60`
- Warning: `#F39C12`
- Error: `#D10026`
- Info: `#0C71C3`

### Dark Mode
| Element | Light | Dark |
|---------|-------|------|
| Background | `#FFFFFF` | `#021827` |
| Surface | `#F5F5F5` | `#0A3A5C` |
| Primary Text | `#000000` | `#FFFFFF` |
| Secondary Text | `#666666` | `#AAAAAA` |

## Typography

**Primary Font**: `'Duru Sans', Helvetica, Arial, Lucida, sans-serif`

### Type Scale
| Element | Mobile | Desktop | Weight | Line Height |
|---------|--------|---------|--------|-------------|
| H1 Hero | 28px | 48px | 800 | 1.1 |
| H2 Section | 24px | 36px | 700 | 1.2 |
| H3 Subsection | 20px | 28px | 700 | 1.3 |
| H4 Card Title | 18px | 22px | 600 | 1.3 |
| Body Large | 16px | 18px | 400 | 1.6 |
| Body Regular | 14px | 16px | 400 | 1.6 |
| Button | 14px | 16px | 600 | 1.0 |

**Rules**: Headlines often uppercase. Letter spacing +0.5px to +1px for uppercase. Max line length 65-75 characters.

## Spacing System (8px base)
- `xs`: 4px — Tight spacing
- `sm`: 8px — Internal padding
- `md`: 16px — Standard spacing
- `lg`: 24px — Section spacing
- `xl`: 32px — Major breaks
- `2xl`: 48px — Page sections
- `3xl`: 64px — Hero sections

## Component Specifications

### Buttons

**Primary (Red)**
```css
.btn-primary {
  background: #F71635;
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}
.btn-primary:hover {
  background: #D10026;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(247, 22, 53, 0.3);
}
```

**Secondary (Outlined)**
```css
.btn-secondary {
  background: transparent;
  color: #021827;
  border: 2px solid #021827;
  border-radius: 4px;
  padding: 10px 22px;
}
.btn-secondary:hover {
  background: #021827;
  color: #FFFFFF;
}
```

**Ghost (on dark)**
```css
.btn-ghost {
  background: transparent;
  color: #FFFFFF;
  border: 2px solid #FFFFFF;
}
.btn-ghost:hover {
  background: #FFFFFF;
  color: #021827;
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: all 0.3s ease;
}
.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}
```

### Form Inputs
```css
.input {
  background: #FFFFFF;
  border: 1px solid #DDDDDD;
  border-radius: 4px;
  padding: 12px 16px;
  font-size: 16px;
}
.input:focus {
  border-color: #F71635;
  box-shadow: 0 0 0 3px rgba(247, 22, 53, 0.15);
  outline: none;
}
.input-error {
  border-color: #D10026;
  background: #FEE2E5;
}
```

### Navigation
- Header height: 80px desktop, 64px mobile
- Top bar (announcement): background `#021827`, height 40px
- Nav links: uppercase, font-weight 600, letter-spacing 0.5px
- Active/hover: color `#F71635`, border-bottom 2px solid

## Layout Patterns

### Grid: 12 columns, 24px gutter (16px mobile)

### Sections
- **Hero**: Full viewport or min 600px, centered content, background image with `#021827` overlay
- **Content**: Alternating `#FFFFFF` / `#F5F5F5`, 64-80px vertical padding
- **Footer**: Background `#021827`, white text, column layout

### Breakpoints
| Name | Min Width | Columns |
|------|-----------|---------|
| Mobile | 0px | 4 |
| Tablet | 768px | 8 |
| Desktop | 1024px | 12 |
| Large | 1280px | 12 |

## Animation

### Transitions
- Standard: `all 0.3s ease`
- Quick: `all 0.15s ease`
- Emphasis: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1)`

### Page Load Animation
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-in {
  animation: fadeInUp 400ms ease-out;
  animation-delay: calc(var(--index) * 100ms);
}
```

### Hover Effects
- Cards: `transform: scale(1.02)` + elevated shadow
- Buttons: `transform: translateY(-2px)` + red glow shadow

## Mobile App Specifics
- Bottom nav height: `calc(64px + env(safe-area-inset-bottom))`
- Touch targets: minimum 44x44px, recommended 48x48px
- Status bar: light content on `#021827` background
- Loading spinner: `#F71635`

## Accessibility
- Contrast: minimum 4.5:1 text, 3:1 large text
- Focus states: visible rings using `#F71635`
- Minimum font: 14px, support system scaling
- Never rely on color alone for information

## Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --color-red: #F71635;
  --color-red-dark: #D10026;
  --color-navy: #021827;
  --color-navy-light: #0A3A5C;
  --color-blue: #0C71C3;
  --color-gray: #666666;
  --color-gray-light: #F5F5F5;
  --color-border: #DDDDDD;
  --color-success: #27AE60;
  --color-warning: #F39C12;
  
  /* Typography */
  --font-primary: 'Duru Sans', Helvetica, Arial, Lucida, sans-serif;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  
  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-button: 0 4px 12px rgba(247, 22, 53, 0.3);
}
```

## Do's and Don'ts

### Do
- Use red accent sparingly for maximum impact
- Maintain deep navy for headers and footers
- Keep generous whitespace
- Use Duru Sans or similar clean sans-serif
- Design mobile-first
- Prioritize content hierarchy

### Don't
- Overuse the red accent
- Mix red AND blue for actions (pick one)
- Use low-contrast text
- Crowd interface with too many elements
- Ignore touch target sizes
- Use purple (`#8300E9`) except for very special cases
