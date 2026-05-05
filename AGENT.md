# AGENT.md — Reunion App

This file provides guidance for AI agents and developers working on this codebase.
Read this file before making any changes.

---

## What This App Is

**Reunion App** is the official web application for the **New English High School (NEHS), Wardha — Batch of 1993** reunion.

It allows batchmates to view event details, RSVP, share photos, and connect with old classmates.
The admin section (protected by Firebase Auth) allows reunion organizers to manage events, attendees, and content.

---

## ⭐ Mobile-First — Most Important Rule

**This app is mobile-first.** Most batchmates will visit on their phones. Every UI/UX
decision must prioritize mobile, then enhance for desktop.

### Quick rules to follow always:
- 📱 **Design for 360px wide first**, then add `sm:` `md:` `lg:` for larger screens
- 👆 **Touch targets ≥ 44 × 44 px** for all tappable elements
- 🍔 **Provide a hamburger menu** if nav links don't fit on mobile (never `hidden md:flex` without an alternative)
- 📊 **Tables → Cards on mobile**: use card grid for `< md`, table for `md:` and above
- 🪟 **Modals: full-screen on mobile**, centered dialog on desktop
- ✋ **No hover-only interactions** — must work with tap
- 📝 **Forms: single column on mobile**, multi-column only on `md:` and above
- 🎨 **Use Tailwind mobile-first**: `flex-col md:flex-row` (not `flex-row sm:flex-col`)

> See **`ARCHITECTURE.md` Section 2** for the full mobile-first design principles,
> Tailwind breakpoint strategy, performance budget, and recommended UI patterns.

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | Next.js 14+ (App Router), TypeScript |
| Styling      | Tailwind CSS                        |
| Backend      | Firebase (Auth, Firestore, Storage) |
| Hosting      | Firebase Hosting / Vercel           |
| Language     | TypeScript (strict mode)            |

---

## Project Structure

```
reunion-app/
├── docs/                    # Execution plans (one file per plan)
├── public/                  # Static assets (images, icons, fonts)
├── src/
│   ├── app/                 # Next.js App Router pages and layouts
│   │   ├── (auth)/          # Auth-related routes (login, register)
│   │   ├── (main)/          # Main app routes (dashboard, events, profile)
│   │   ├── api/             # Next.js API routes (server-side)
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home / landing page
│   │   ├── globals.css      # Global styles
│   │   ├── error.tsx        # Error boundary
│   │   ├── loading.tsx      # Loading UI
│   │   └── not-found.tsx    # 404 page
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Generic UI primitives (Button, Input, Modal)
│   │   └── features/        # Feature-specific components (EventCard, RSVPForm)
│   ├── lib/                 # Utilities and helpers
│   │   ├── firebase/        # Firebase client & admin SDK setup
│   │   └── utils/           # General utility functions
│   ├── hooks/               # Custom React hooks
│   ├── types/               # Shared TypeScript types and interfaces
│   └── constants/           # App-wide constants
├── AGENT.md                 # This file — agent/developer orientation
├── ARCHITECTURE.md          # High-level architecture overview
├── PLANS.md                 # Execution plan template and index
├── VERIFICATION.md          # Verification and testing procedures
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

---

## Key Conventions

- **TypeScript strict mode** is enabled. All code must be fully typed — no `any`.
- Use the **App Router** (not Pages Router). All routes live under `src/app/`.
- Use **Server Components** by default; add `"use client"` only when necessary (event handlers, hooks, browser APIs).
- All Firebase interactions are isolated in `src/lib/firebase/`.
- Components are split into `ui/` (generic, reusable) and `features/` (domain-specific).
- Environment variables are prefixed with `NEXT_PUBLIC_` for client-side, and unprefixed for server-side only.
- **Never commit secrets** — use `.env.local` for local secrets (it is gitignored).

---

## Environment Variables

| Variable                              | Side    | Description                     |
|---------------------------------------|---------|---------------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY`        | Client  | Firebase API key                |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`    | Client  | Firebase Auth domain            |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`     | Client  | Firebase project ID             |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client  | Firebase Storage bucket         |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID`         | Client  | Firebase app ID                 |
| `FIREBASE_ADMIN_PRIVATE_KEY`          | Server  | Firebase Admin SDK private key  |
| `FIREBASE_ADMIN_CLIENT_EMAIL`         | Server  | Firebase Admin SDK client email |

---

## Common Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

---

## Before Making Changes

1. Read the relevant execution plan in `docs/` before implementing a feature.
2. Check `ARCHITECTURE.md` to understand how components interact.
3. After changes, run the verification steps in `VERIFICATION.md`.
4. Update the relevant execution plan's **Progress** and **Surprises & Discoveries** sections.
5. Never modify `AGENT.md`, `ARCHITECTURE.md`, `PLANS.md`, or `VERIFICATION.md` unless explicitly asked.

---

## Do Not

- ❌ Use `hidden md:flex` to hide critical navigation on mobile without providing a hamburger fallback
- ❌ Use desktop-first Tailwind patterns like `flex-row sm:flex-col`
- ❌ Build features tested only at desktop width — always check at 360px first
- ❌ Use hover-only tooltips, menus, or actions (mobile has no hover)
- ❌ Make tap targets smaller than 44px
- ❌ Use multi-column form layouts that don't collapse on mobile

## Do Not (continued)

- Do not use the Pages Router (`pages/` directory).
- Do not use `any` type in TypeScript.
- Do not put Firebase secrets in client-side code or commit `.env.local`.
- Do not bypass ESLint or TypeScript errors with suppression comments without a documented reason.
- Do not create new top-level directories without updating this file and `ARCHITECTURE.md`.
