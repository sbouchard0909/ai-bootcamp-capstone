# UI Guidelines

## Overview
This document outlines the design principles and guidelines for the AI Bootcamp Capstone project. The application aims to provide a modern, clean user experience with support for both light and dark modes using a neutral color palette.

## Design Principles

### 1. Simplicity
- Minimize visual clutter
- Use whitespace effectively to create breathing room
- Focus on essential elements and remove unnecessary decoration

### 2. Modern Aesthetics
- Clean lines and minimal borders
- Smooth transitions and subtle animations
- Contemporary typography and spacing

### 3. Accessibility
- Ensure sufficient color contrast for readability
- Support keyboard navigation
- Use semantic HTML and ARIA labels where appropriate
- Maintain consistent interaction patterns

### 4. Responsiveness
- Mobile-first design approach
- Flexible layouts that adapt to different screen sizes
- Touch-friendly interactive elements (minimum 44x44px)

## Color Palette

### Light Mode
- **Background**: #FFFFFF (White)
- **Surface**: #F5F5F5 (Light Gray)
- **Primary Text**: #1A1A1A (Dark Gray/Near Black)
- **Secondary Text**: #666666 (Medium Gray)
- **Border**: #E0E0E0 (Light Border)
- **Accent Primary**: #2563EB (Blue)
- **Accent Secondary**: #7C3AED (Purple)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)

### Dark Mode
- **Background**: #0F172A (Dark Navy)
- **Surface**: #1E293B (Slightly Lighter Navy)
- **Primary Text**: #F1F5F9 (Off White)
- **Secondary Text**: #94A3B8 (Light Gray)
- **Border**: #334155 (Dark Border)
- **Accent Primary**: #3B82F6 (Lighter Blue)
- **Accent Secondary**: #A78BFA (Lighter Purple)
- **Success**: #34D399 (Light Green)
- **Warning**: #FBBF24 (Light Amber)
- **Error**: #F87171 (Light Red)

## Typography

### Font Family
- **Primary Font**: System stack (e.g., -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)
- Use system fonts for better performance and familiarity

### Font Sizes and Weights
- **Headings (H1)**: 32px, Weight 700 (Bold)
- **Headings (H2)**: 28px, Weight 700 (Bold)
- **Headings (H3)**: 24px, Weight 600 (Semibold)
- **Body Text**: 16px, Weight 400 (Regular)
- **Small Text**: 14px, Weight 400 (Regular)
- **Caption**: 12px, Weight 400 (Regular)

### Line Height
- **Headings**: 1.2
- **Body Text**: 1.6
- **Small Text**: 1.5

## Spacing

Use an 8px base unit for consistent spacing throughout the application.

- **Extra Small (xs)**: 4px (0.5 × base)
- **Small (sm)**: 8px (1 × base)
- **Medium (md)**: 16px (2 × base)
- **Large (lg)**: 24px (3 × base)
- **Extra Large (xl)**: 32px (4 × base)
- **2X Large (2xl)**: 48px (6 × base)

## Components

### Buttons
- **Padding**: 12px 24px (vertical × horizontal)
- **Border Radius**: 6px
- **Font Size**: 14px, Weight 600
- **Min Height**: 44px (for touch targets)
- **Transition**: All properties 200ms ease

**Button States:**
- **Primary**: Solid accent color background with white/off-white text
- **Secondary**: Light background with primary text color
- **Tertiary**: No background with primary text color and underline on hover
- **Disabled**: Reduced opacity (50%) with cursor not-allowed

### Input Fields
- **Padding**: 10px 12px
- **Border**: 1px solid border color
- **Border Radius**: 6px
- **Font Size**: 16px
- **Focus State**: 2px solid accent primary color border
- **Placeholder Color**: Secondary text color (slightly lighter)

### Cards
- **Padding**: 16px to 24px
- **Border Radius**: 8px
- **Shadow (Light Mode)**: 0 1px 3px rgba(0, 0, 0, 0.1)
- **Shadow (Dark Mode)**: 0 1px 3px rgba(0, 0, 0, 0.3)
- **Border**: Optional 1px border using border color

### Navigation
- **Height**: 56px
- **Padding**: 12px 16px
- **Active Indicator**: Accent primary color (underline or background)
- **Transition**: 200ms ease

### Modals/Dialogs
- **Overlay**: Transparent dark background (rgba(0, 0, 0, 0.5) light mode, rgba(0, 0, 0, 0.7) dark mode)
- **Max Width**: 520px
- **Border Radius**: 8px
- **Padding**: 24px
- **Shadow**: 0 25px 50px -12px rgba(0, 0, 0, 0.25)

## Interactions

### Transitions
- **Default Duration**: 200ms
- **Easing Function**: cubic-bezier(0.4, 0, 0.2, 1)
- Apply to: color, background-color, border-color, opacity, transform

### Hover States
- Apply a subtle opacity change (10% darker)
- Or a subtle background color change
- Maintain 200ms transition

### Focus States
- Clear visual focus indicator (outline or border)
- Use accent primary color
- Minimum 2px border/outline
- Works for keyboard navigation

## Theme Switching

### Implementation
- Store user preference in localStorage
- Detect system preference using `prefers-color-scheme` media query
- Default to system preference, allow manual override
- Apply theme class to root element (e.g., `data-theme="dark"`)

### Considerations
- Ensure smooth transition between themes
- Preserve user preference across sessions
- Test contrast ratios in both light and dark modes

## Icons

- **Size**: Use 24px as base size
- **Stroke Width**: 2px
- **Style**: Line-based (not filled) for modern appearance
- **Color**: Inherit from text color or use semantic colors
- **Recommended Library**: Lucide Icons or Feather Icons

## Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Design mobile-first and progressively enhance for larger screens.

## Visual Hierarchy

1. **Primary Action**: Most prominent, use accent primary color
2. **Secondary Action**: Less prominent, use secondary button style
3. **Tertiary Action**: Minimal visual weight, use tertiary button style
4. **Disabled State**: Reduced visibility and interaction feedback

## Best Practices

1. **Consistency**: Maintain consistent spacing, typography, and component styling throughout the app
2. **Feedback**: Provide visual feedback for all user interactions
3. **Performance**: Use CSS and SVG for animations, avoid heavy image assets
4. **Testing**: Test designs in both light and dark modes
5. **Accessibility**: Ensure WCAG AA compliance for color contrast ratios
6. **User Preference**: Respect user's light/dark mode preference
