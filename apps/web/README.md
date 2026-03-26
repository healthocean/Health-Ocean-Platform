# Health Ocean Web App 🌊

The patient-facing web application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- ✨ Beautiful, responsive landing page
- 🔍 Test search with location filtering
- 📱 Mobile-first design
- ♿ Accessibility-focused
- 🎨 Ocean-themed design system
- ⚡ Fast page loads with Next.js App Router

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)

## Project Structure

```
apps/web/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/
│   ├── layout/              # Layout components
│   │   ├── Header.tsx       # Navigation header
│   │   └── Footer.tsx       # Site footer
│   ├── home/                # Landing page sections
│   │   ├── Hero.tsx         # Hero with search
│   │   ├── Features.tsx     # Feature cards
│   │   ├── HowItWorks.tsx   # Process steps
│   │   └── PopularTests.tsx # Test grid
│   └── ui/                  # Reusable UI components
├── lib/                     # Utilities and helpers
├── public/                  # Static assets
└── styles/                  # Additional styles
```

## Design System

### Colors

```typescript
// Primary - Ocean Blue
primary: {
  500: '#0066CC',  // Main brand color
  // ... other shades
}

// Secondary - Teal
secondary: {
  500: '#00B4B4',  // Accent color
  // ... other shades
}

// Accent - Coral
accent: {
  500: '#FF6B6B',  // Alerts and urgency
  // ... other shades
}
```

### Typography

- **Headings**: Inter Bold
- **Body**: Inter Regular
- **Code**: JetBrains Mono

### Component Classes

```css
/* Buttons */
.btn                 /* Base button */
.btn-primary         /* Primary action */
.btn-secondary       /* Secondary action */
.btn-outline         /* Outlined button */

/* Cards */
.card                /* Base card */

/* Inputs */
.input               /* Form input */
```

## Components

### Layout Components

#### Header
```tsx
import Header from '@/components/layout/Header';

<Header />
```

Features:
- Responsive navigation
- Mobile menu
- Cart icon
- Login/Signup buttons

#### Footer
```tsx
import Footer from '@/components/layout/Footer';

<Footer />
```

Features:
- Company info
- Quick links
- Social media links
- Contact information

### Home Page Sections

#### Hero
```tsx
import Hero from '@/components/home/Hero';

<Hero />
```

Features:
- Search bar for tests
- Location input
- Popular searches
- Trust indicators

#### Features
```tsx
import Features from '@/components/home/Features';

<Features />
```

Showcases:
- Home sample collection
- Digital reports
- NABL certification
- Quick turnaround

#### PopularTests
```tsx
import PopularTests from '@/components/home/PopularTests';

<PopularTests />
```

Displays:
- Test cards with icons
- Pricing with discounts
- Book now buttons
- Grid layout

#### HowItWorks
```tsx
import HowItWorks from '@/components/home/HowItWorks';

<HowItWorks />
```

Shows:
- 4-step process
- Visual flow
- Step numbers
- CTA button

## Development

### Start Development Server

```bash
cd apps/web
pnpm dev
```

Visit http://localhost:3000

### Build for Production

```bash
pnpm build
pnpm start
```

### Linting and Formatting

```bash
# Lint
pnpm lint

# Format
pnpm format

# Type check
pnpm type-check
```

## Adding New Pages

1. Create a new directory in `app/`:
```bash
mkdir app/tests
```

2. Add a `page.tsx`:
```tsx
// app/tests/page.tsx
export default function TestsPage() {
  return (
    <div>
      <h1>All Tests</h1>
    </div>
  );
}
```

3. Add metadata:
```tsx
export const metadata = {
  title: 'All Tests - Health Ocean',
  description: 'Browse 500+ lab tests',
};
```

## Creating Components

### Example: Button Component

```tsx
// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  onClick?: () => void;
}

export default function Button({ 
  children, 
  variant = 'primary',
  onClick 
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Usage:

```tsx
import Button from '@/components/ui/Button';

<Button variant="primary">Book Now</Button>
```

## Styling Guidelines

### Use Tailwind Utilities

```tsx
// ✅ Good
<div className="flex items-center gap-4 p-6 rounded-lg">

// ❌ Avoid inline styles
<div style={{ display: 'flex', padding: '24px' }}>
```

### Responsive Design

```tsx
// Mobile first approach
<div className="
  text-sm          // Mobile
  md:text-base     // Tablet
  lg:text-lg       // Desktop
">
```

### Custom Classes

Define in `globals.css`:

```css
@layer components {
  .custom-card {
    @apply bg-white rounded-xl shadow-lg p-6;
  }
}
```

## Performance Tips

1. **Use Next.js Image**:
```tsx
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt="Logo" 
  width={100} 
  height={100}
/>
```

2. **Dynamic Imports**:
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'));
```

3. **Optimize Fonts**:
Already configured in `layout.tsx` with `next/font/google`

## Accessibility

- Use semantic HTML
- Add ARIA labels
- Ensure keyboard navigation
- Maintain color contrast
- Test with screen readers

Example:
```tsx
<button 
  aria-label="Search tests"
  className="btn btn-primary"
>
  <Search aria-hidden="true" />
  Search
</button>
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key_here
```

Usage:
```tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build
docker build -t health-ocean-web .

# Run
docker run -p 3000:3000 health-ocean-web
```

## Troubleshooting

### Styles Not Applying

1. Check Tailwind config includes your files
2. Restart dev server
3. Clear `.next` cache:
```bash
rm -rf .next
pnpm dev
```

### TypeScript Errors

```bash
# Check types
pnpm type-check

# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

Built with ❤️ using Next.js 14