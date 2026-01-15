# Master Plumbing Study App

A personal study website for Master Plumbing exam preparation built with **Next.js 14** and **Supabase**.

## Features

- 📚 **Interactive Flashcards** - Recall, multiple-choice, calculation, and scenario cards
- 🔄 **Spaced Repetition** - Cards marked "needs review" appear more frequently
- 📊 **Progress Tracking** - Track mastery across 4 major subjects
- 📱 **Mobile Friendly** - Study anywhere, anytime
- ⌨️ **Keyboard Navigation** - Space to flip, 1/2 for Got it/Review

## Subjects Covered

1. **Plumbing Code** - Code interpretation, venting, drainage, traps
2. **Plumbing Arithmetic** - Pipe sizing, slopes, fixture units
3. **Sanitation & Design** - System layout, backflow prevention
4. **Practical Problems** - Troubleshooting scenarios

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (optional - works with localStorage fallback)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start studying!

### Supabase Setup (Optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in order:
   - `supabase/schema.sql` - Creates tables
   - `supabase/seed.sql` - Adds sample flashcards
3. Copy your project URL and anon key to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home - Study Command Center
│   ├── study/[subject]/      # Subject flashcard pages
│   ├── tips/                 # Study tips & exam strategy
│   └── resources/            # Reference library
├── components/
│   ├── Flashcard.tsx         # Main flashcard component
│   ├── ProgressRing.tsx      # Circular progress indicator
│   └── SubjectCard.tsx       # Subject overview cards
└── lib/
    ├── supabase.ts           # Supabase client
    ├── data-service.ts       # Data layer
    └── spaced-repetition.ts  # Review scheduling
```

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

Private - Personal use only
