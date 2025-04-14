# shadcn/ui Components Documentation

This portfolio uses [shadcn/ui](https://ui.shadcn.com/) components, which are built on Radix UI and styled with Tailwind CSS. This document provides information on the implemented components and how to use them.

## Core Components

### Button

The Button component is used for all interactive elements that trigger an action.

```tsx
import { Button } from "@/components/ui/button"

// Default button
<Button>Click me</Button>

// Variants
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">+</Button>
```

### Card

The Card component is used to display content in a contained, styled box.

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
```

### Theme Toggle

The theme toggle component allows users to switch between light and dark modes.

```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle"

<ThemeToggle />
```

## Theme Configuration

The theme is configured using CSS variables and Tailwind CSS. The theme can be customized by modifying the CSS variables in `globals.css`.

### Color Scheme

The portfolio uses a neutral color scheme with primary, secondary, muted, and accent colors. These colors are defined in the `globals.css` file:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
}
```

### Dark Mode

Dark mode is implemented using the `next-themes` package and the `.dark` class. The dark mode colors are defined in the `globals.css` file:

```css
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}
```

## Adding New Components

To add new shadcn/ui components to this project:

1. Visit the [shadcn/ui website](https://ui.shadcn.com/docs/components) to find the component you want to add
2. Create a new file in the `src/components/ui` directory
3. Copy the component code from the shadcn/ui documentation
4. Install any required dependencies
5. Import and use the component in your application

## Typography

The portfolio uses the Geist font family for both sans-serif and monospace text:

- Geist Sans: Used for general text
- Geist Mono: Used for code and monospaced content

## Responsive Design

All components are designed to be responsive and work well on mobile, tablet, and desktop devices. Tailwind's responsive utility classes are used for this purpose:

- `sm:` - Small screens (640px and up)
- `md:` - Medium screens (768px and up)
- `lg:` - Large screens (1024px and up)
- `xl:` - Extra large screens (1280px and up)
- `2xl:` - 2x Extra large screens (1536px and up)

## Utility Functions

The `cn` utility function is used to merge Tailwind classes:

```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-class", condition && "conditional-class")}>
  Content
</div>
```

## Theming Configuration

The theming configuration is defined in the `components.json` file:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
``` 