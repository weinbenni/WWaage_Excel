# Weinhäupl Waagenbau
## Brand Style Guide for App Design

**Based on Website Analysis & Divi Theme Export**

---

## 1. Brand Overview

### Company Profile
**Weinhäupl Waagenbau** is an Austrian industrial weighing systems manufacturer based in Helpfau-Uttendorf, operating since 1991. The company specializes in vehicle scales, industrial weighing systems, software solutions, and calibration services.

### Brand Personality
- **Professional & Technical**: Industrial precision and engineering excellence
- **Reliable & Trustworthy**: 30+ years of experience, 1500+ scales built
- **Austrian Quality**: Emphasis on local production and craftsmanship
- **Modern & Forward-thinking**: Digital solutions, mobile apps, 24/7 service
- **Approachable**: Family-owned business with personal customer service

### Target Audience
- Industrial companies (quarries, construction, logistics)
- Agriculture businesses
- Manufacturing facilities
- Commercial enterprises requiring precision weighing

---

## 2. Color Palette (from Divi Theme Export)

### Official Brand Colors

| Position | Color | Hex Code | RGB | Primary Usage |
|----------|-------|----------|-----|---------------|
| 1 | **Pure Black** | `#000000` | 0, 0, 0 | Text, strong contrast elements |
| 2 | **Pure White** | `#FFFFFF` | 255, 255, 255 | Backgrounds, light text on dark |
| 3 | **Weinhäupl Red** | `#F71635` | 247, 22, 53 | Primary accent, CTAs, highlights |
| 4 | **Deep Navy** | `#021827` | 2, 24, 39 | Headers, footer, primary backgrounds |
| 5 | **Neutral Gray** | `#666666` | 102, 102, 102 | Secondary text, icons |
| 6 | **Dark Red** | `#D10026` | 209, 0, 38 | Hover states, emphasis |
| 7 | **Corporate Blue** | `#0C71C3` | 12, 113, 195 | Links, secondary accent |
| 8 | **Accent Purple** | `#8300E9` | 131, 0, 233 | Special highlights (sparingly) |

### Color Roles & Application

```
┌─────────────────────────────────────────────────────────────────┐
│  PRIMARY ACTIONS                                                 │
│  ─────────────────                                              │
│  Background: #F71635 (Weinhäupl Red)                            │
│  Hover:      #D10026 (Dark Red)                                 │
│  Text:       #FFFFFF                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  DARK SECTIONS (Header Bar, Footer)                             │
│  ─────────────────────────────────────                          │
│  Background: #021827 (Deep Navy)                                │
│  Text:       #FFFFFF                                            │
│  Links:      #F71635 (Red) or #0C71C3 (Blue)                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CONTENT AREAS                                                   │
│  ─────────────                                                  │
│  Background: #FFFFFF                                            │
│  Primary Text:   #000000                                        │
│  Secondary Text: #666666                                        │
│  Links:          #0C71C3                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Extended Palette (Derived)

| Color | Hex Code | Derivation | Usage |
|-------|----------|------------|-------|
| Light Navy | `#0A3A5C` | Lightened #021827 | Card backgrounds on dark |
| Red Hover | `#D10026` | From palette | Button hover states |
| Red Light | `#FEE2E5` | 10% #F71635 | Error backgrounds, alerts |
| Blue Light | `#E8F4FC` | 10% #0C71C3 | Info backgrounds |
| Gray Light | `#F5F5F5` | Lightened #666666 | Section alternates |
| Gray Border | `#DDDDDD` | Between white/gray | Dividers, borders |

### Semantic Colors

| Purpose | Color | Hex Code |
|---------|-------|----------|
| Success | Green | `#27AE60` |
| Warning | Amber | `#F39C12` |
| Error | Red | `#D10026` (from palette) |
| Info | Blue | `#0C71C3` (from palette) |

### Dark Mode Adaptation

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `#FFFFFF` | `#021827` |
| Surface | `#F5F5F5` | `#0A3A5C` |
| Primary Text | `#000000` | `#FFFFFF` |
| Secondary Text | `#666666` | `#AAAAAA` |
| Primary Accent | `#F71635` | `#F71635` (unchanged) |
| Secondary Accent | `#0C71C3` | `#3498DB` (brightened) |

---

## 3. Typography

### Font Families (from Theme)

**Primary Font (Body & UI)**
```
Font Family: 'Duru Sans', Helvetica, Arial, Lucida, sans-serif
Use: Body text, UI elements, general content
Weights: 400 (Regular), 700 (Bold)
```

**Display Font (Headers)**
```
Font Family: System sans-serif stack or Montserrat
Fallback: Helvetica, Arial, sans-serif
Use: Headlines, navigation, buttons, emphasis
Weights: 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
```

### Type Scale

| Element | Size (Mobile) | Size (Desktop) | Weight | Line Height |
|---------|---------------|----------------|--------|-------------|
| H1 - Hero | 28px | 48px | 800 | 1.1 |
| H2 - Section | 24px | 36px | 700 | 1.2 |
| H3 - Subsection | 20px | 28px | 700 | 1.3 |
| H4 - Card Title | 18px | 22px | 600 | 1.3 |
| Body Large | 16px | 18px | 400 | 1.6 |
| Body Regular | 14px | 16px | 400 | 1.6 |
| Body Small | 12px | 14px | 400 | 1.5 |
| Caption | 11px | 12px | 400 | 1.4 |
| Button | 14px | 16px | 600 | 1.0 |

### Typography Rules

1. **Headlines**: Often uppercase for main section headers
2. **Body Text**: Sentence case, left-aligned
3. **Maximum line length**: 65-75 characters for optimal readability
4. **Letter spacing**: +0.5px to +1px for uppercase text
5. **Paragraph spacing**: 1.5em between paragraphs

---

## 4. Spacing System

### Base Unit
```
Base: 8px
```

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 4px | Tight spacing, inline elements |
| `space-sm` | 8px | Component internal padding |
| `space-md` | 16px | Standard component spacing |
| `space-lg` | 24px | Section spacing |
| `space-xl` | 32px | Major section breaks |
| `space-2xl` | 48px | Page section separation |
| `space-3xl` | 64px | Hero sections, major divisions |

### Container Widths

| Breakpoint | Max Width | Side Padding |
|------------|-----------|--------------|
| Mobile | 100% | 16px |
| Tablet | 720px | 24px |
| Desktop | 1140px | 32px |
| Large Desktop | 1320px | 40px |

---

## 5. Component Specifications

### Buttons

**Primary Button (Red)**
```css
/* Default State */
background: #F71635;
color: #FFFFFF;
border: none;
border-radius: 4px;
padding: 12px 24px;
font-family: 'Duru Sans', Helvetica, Arial, sans-serif;
font-weight: 600;
font-size: 16px;
text-transform: uppercase;
letter-spacing: 0.5px;
transition: all 0.3s ease;

/* Hover State */
background: #D10026;
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(247, 22, 53, 0.3);

/* Active State */
background: #B00020;
transform: translateY(0);
```

**Secondary Button (Outlined)**
```css
/* Default State */
background: transparent;
color: #021827;
border: 2px solid #021827;
border-radius: 4px;
padding: 10px 22px;

/* Hover State */
background: #021827;
color: #FFFFFF;
```

**Ghost Button (on dark backgrounds)**
```css
/* Default State */
background: transparent;
color: #FFFFFF;
border: 2px solid #FFFFFF;
border-radius: 4px;

/* Hover State */
background: #FFFFFF;
color: #021827;
```

**Link Button (Blue)**
```css
color: #0C71C3;
text-decoration: none;

/* Hover State */
color: #095A9D;
text-decoration: underline;
```

### Cards

```css
background: #FFFFFF;
border-radius: 8px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
padding: 24px;

/* Hover State */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
transform: translateY(-4px);
transition: all 0.3s ease;
```

### Form Elements

**Input Fields**
```css
/* Default State */
background: #FFFFFF;
border: 1px solid #DDDDDD;
border-radius: 4px;
padding: 12px 16px;
font-family: 'Duru Sans', Helvetica, Arial, sans-serif;
font-size: 16px;
color: #000000;

/* Focus State */
border-color: #F71635;
box-shadow: 0 0 0 3px rgba(247, 22, 53, 0.15);
outline: none;

/* Error State */
border-color: #D10026;
background: #FEE2E5;
```

**Labels**
```css
font-family: 'Duru Sans', Helvetica, Arial, sans-serif;
font-weight: 600;
font-size: 14px;
color: #000000;
margin-bottom: 8px;
```

### Navigation

**Header**
```css
background: #FFFFFF;
height: 80px; /* desktop */
height: 64px; /* mobile */
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
position: sticky;
top: 0;
z-index: 1000;
```

**Top Bar (Announcement)**
```css
background: #021827;
height: 40px;
font-family: 'Duru Sans', Helvetica, Arial, sans-serif;
font-size: 13px;
color: #FFFFFF;
```

**Nav Links**
```css
font-family: 'Duru Sans', Helvetica, Arial, sans-serif;
font-weight: 600;
font-size: 14px;
color: #021827;
text-transform: uppercase;
letter-spacing: 0.5px;

/* Hover/Active */
color: #F71635;
border-bottom: 2px solid #F71635;
```

**Footer**
```css
background: #021827;
color: #FFFFFF;
padding: 64px 0 32px;

/* Footer Links */
color: #FFFFFF;
opacity: 0.8;

/* Footer Links Hover */
color: #F71635;
opacity: 1;
```

---

## 6. Iconography

### Icon Style
- **Type**: Line icons (outlined)
- **Stroke Width**: 1.5-2px
- **Corner Style**: Rounded
- **Recommended Library**: Lucide Icons, Feather Icons, or custom SVG

### Icon Sizes

| Context | Size |
|---------|------|
| Inline (with text) | 16px |
| Button | 20px |
| List item | 24px |
| Feature highlight | 32px |
| Hero/Large display | 48-64px |

### Icon Colors
- Default: `#666666` (Neutral Gray)
- Active/Hover: `#F71635` (Weinhäupl Red)
- On dark backgrounds: `#FFFFFF`
- Links/Actions: `#0C71C3` (Corporate Blue)

---

## 7. Imagery Guidelines

### Photography Style
- **Industrial aesthetic**: Clean, professional shots of scales and machinery
- **Real-world context**: Products in use at actual job sites
- **Austrian landscape**: Subtle incorporation of local environment
- **People**: Professional technicians at work, customer interactions

### Image Treatment
```css
/* Hero overlay */
background: linear-gradient(
  135deg, 
  rgba(2, 24, 39, 0.85), 
  rgba(2, 24, 39, 0.6)
);

/* Image corners */
border-radius: 8px; /* cards */
border-radius: 0;   /* full-width */

/* Aspect Ratios */
/* Hero: 16:9 or 21:9 */
/* Cards: 4:3 or 3:2 */
/* Thumbnails: 1:1 */
```

### Illustrations
- Flat, geometric style
- Limited color palette (brand colors only)
- Technical diagrams with clean lines
- Isometric views for product features

---

## 8. Layout Patterns

### Grid System
```
Columns: 12
Gutter: 24px (desktop), 16px (mobile)
Margin: 5% (max 120px per side)
```

### Section Structure

**Hero Section**
```
- Full viewport height or min 600px
- Centered content
- Strong headline + subhead + CTA
- Background image with #021827 overlay
```

**Content Sections**
```
- Alternating backgrounds (#FFFFFF / #F5F5F5)
- Consistent vertical rhythm (64-80px padding)
- Clear visual hierarchy
```

**Footer**
```
- Background: #021827
- White/light text
- Column-based layout
- Contact information prominent
```

### Responsive Breakpoints

| Name | Min Width | Columns |
|------|-----------|---------|
| Mobile | 0px | 4 |
| Tablet | 768px | 8 |
| Desktop | 1024px | 12 |
| Large | 1280px | 12 |

---

## 9. Motion & Animation

### Transition Defaults
```css
/* Standard transition */
transition: all 0.3s ease;

/* Quick micro-interactions */
transition: all 0.15s ease;

/* Emphasis animations */
transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
```

### Animation Principles
1. **Subtle and purposeful**: Animations should guide attention, not distract
2. **Fast response**: UI feedback within 100ms
3. **Natural easing**: Use ease-out for entering, ease-in for exiting
4. **Consistent direction**: Elements enter from bottom/right, exit to top/left

### Key Animations

**Page Load**
```css
/* Elements fade in with slight upward movement */
animation: fadeInUp 400ms ease-out;
animation-delay: calc(var(--index) * 100ms); /* Stagger */

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Hover Effects**
```css
/* Cards */
transform: scale(1.02);
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

/* Buttons */
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(247, 22, 53, 0.3);
```

---

## 10. App-Specific Guidelines

### Mobile App Considerations

**Bottom Navigation**
```css
height: calc(64px + env(safe-area-inset-bottom));
background: #FFFFFF;
box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);

/* Active Icon */
color: #F71635;

/* Inactive Icon */
color: #666666;
```

**Status Bar**
```
Style: Light content
Background: #021827
```

**Touch Targets**
```
Minimum Size: 44x44px
Recommended: 48x48px
Spacing between targets: 8px minimum
```

**Loading States**
```css
/* Spinner */
color: #F71635;

/* Skeleton screens */
background: linear-gradient(
  90deg,
  #F5F5F5 25%,
  #EEEEEE 50%,
  #F5F5F5 75%
);
animation: shimmer 1.5s infinite;
```

### Accessibility

- **Contrast ratios**: Minimum 4.5:1 for text, 3:1 for large text
- **Focus states**: Visible focus rings using #F71635
- **Touch targets**: Minimum 44x44px
- **Font sizes**: Minimum 14px, support system scaling
- **Color independence**: Never rely on color alone for information

---

## 11. Design Philosophy Summary

### Core Principles

1. **INDUSTRIAL PRECISION**
   Clean lines, structured layouts, and technical accuracy reflect the precision of weighing equipment.

2. **BOLD CONTRAST**
   The red accent against deep navy creates strong visual impact and brand recognition.

3. **AUSTRIAN RELIABILITY**
   Quality materials (visual metaphor through solid colors), trustworthy presentation, no-nonsense approach.

4. **ACCESSIBLE PROFESSIONALISM**
   Technical but approachable; sophisticated but not intimidating.

### Do's
- ✓ Use red accent sparingly for maximum impact
- ✓ Maintain the deep navy (#021827) for headers and footers
- ✓ Keep generous whitespace in content areas
- ✓ Use Duru Sans or similar clean sans-serif fonts
- ✓ Prioritize content hierarchy
- ✓ Design for mobile-first

### Don'ts
- ✗ Overuse the red accent color
- ✗ Mix too many accent colors (pick red OR blue for actions)
- ✗ Use low-contrast text
- ✗ Crowd interface with too many elements
- ✗ Ignore touch target sizes on mobile
- ✗ Use the purple (#8300E9) except for very special cases

---

## 12. Design Tokens (JSON)

```json
{
  "colors": {
    "brand": {
      "black": "#000000",
      "white": "#FFFFFF",
      "red": "#F71635",
      "redDark": "#D10026",
      "navy": "#021827",
      "gray": "#666666",
      "blue": "#0C71C3",
      "purple": "#8300E9"
    },
    "semantic": {
      "primary": "#F71635",
      "primaryHover": "#D10026",
      "secondary": "#021827",
      "background": "#FFFFFF",
      "surface": "#F5F5F5",
      "textPrimary": "#000000",
      "textSecondary": "#666666",
      "border": "#DDDDDD",
      "link": "#0C71C3",
      "success": "#27AE60",
      "warning": "#F39C12",
      "error": "#D10026",
      "info": "#0C71C3"
    },
    "darkMode": {
      "background": "#021827",
      "surface": "#0A3A5C",
      "textPrimary": "#FFFFFF",
      "textSecondary": "#AAAAAA"
    }
  },
  "typography": {
    "fontFamily": {
      "primary": "'Duru Sans', Helvetica, Arial, Lucida, sans-serif",
      "display": "system-ui, -apple-system, sans-serif"
    },
    "fontSize": {
      "xs": "12px",
      "sm": "14px",
      "base": "16px",
      "lg": "18px",
      "xl": "22px",
      "2xl": "28px",
      "3xl": "36px",
      "4xl": "48px"
    },
    "fontWeight": {
      "regular": 400,
      "semibold": 600,
      "bold": 700,
      "extrabold": 800
    },
    "lineHeight": {
      "tight": 1.1,
      "snug": 1.3,
      "normal": 1.5,
      "relaxed": 1.6
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px"
  },
  "borderRadius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px rgba(0, 0, 0, 0.05)",
    "md": "0 2px 8px rgba(0, 0, 0, 0.08)",
    "lg": "0 8px 24px rgba(0, 0, 0, 0.12)",
    "button": "0 4px 12px rgba(247, 22, 53, 0.3)"
  },
  "transitions": {
    "fast": "all 0.15s ease",
    "normal": "all 0.3s ease",
    "slow": "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
  }
}
```

---

## 13. Asset Checklist for App Development

### Required Assets
- [ ] Logo (SVG, PNG @1x, @2x, @3x)
- [ ] Logo Negative/White version
- [ ] App Icon (all required sizes for iOS/Android)
- [ ] Splash Screen
- [ ] Icon set (navigation, actions, status)
- [ ] Empty state illustrations
- [ ] Error state illustrations
- [ ] Product photography
- [ ] Background patterns/textures

### Logo Specifications
```
Primary Logo URL: weinhaeupl-waagen.at/wp-content/uploads/2022/03/Weinhäupl-LOGO.png
Negative Logo: weinhaeupl-waagen.at/wp-content/uploads/2022/03/Weinhäupl-LOGO-NEGATIV.png

Clear Space: Minimum 1x logo height on all sides
Minimum Size: 120px width for digital
```

---

*Style Guide Version 1.1*
*Source: www.weinhaeupl-waagen.at + Divi Theme Options Export*
*Created: January 2026*
