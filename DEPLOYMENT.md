# Deployment Guide

This application is built with Next.js 14, standard Tailwind CSS, and Supabase. It is ready for deployment on Vercel.

## Environment Variables

Configure the following environment variables in your Vercel project settings:

### Essential (Required)

| Variable                        | Description                                                 |
| ------------------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase Project URL (e.g., `https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anonymous API Key                             |

### AI Features (Optional but Recommended)

| Variable         | Description                                        |
| ---------------- | -------------------------------------------------- |
| `GEMINI_API_KEY` | Google Gemini API Key for the AI Tutor             |
| `OPENAI_API_KEY` | (Fallback) OpenAI API Key if you prefer GPT models |

_Note: The app will run without AI keys, but the 'Ask AI' feature will show an error message._

## Supabase Configuration

Ensure your Supabase project has the following:

1. **Authentication**: Email/Password enabled.
2. **Database**: The schema must be applied (tables: `subjects`, `topics`, `flashcards`, `exam_results`, `mistakes_log`, `documents`).
3. **Storage**: A public bucket named `study-documents` for RAG uploads.
4. **Vector Support**: Enable `pgvector` extension for AI search.

## Build Verification

The build command used is standard:

```bash
npm run build
```

The output directory is `.next`.

## Post-Deployment Checks

1. [ ] Log in with your admin account.
2. [ ] Visit `/resources` and try uploading a PDF.
3. [ ] Visit `/resources/cards` and create a test flashcard.
4. [ ] Run a quick 10-question exam to verify result saving.
