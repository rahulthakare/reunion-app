# ARCHITECTURE.md — Reunion App

High-level architecture of the Reunion App — a full-stack web application built with
Next.js (frontend) and Firebase (backend).

---

## 1. Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                           │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              Next.js App (React, TypeScript)                │   │
│   │                                                             │   │
│   │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │   │
│   │   │    Pages /   │   │  Components  │   │    Hooks &   │  │   │
│   │   │   Layouts    │   │  (UI + Feat) │   │    State     │  │   │
│   │   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘  │   │
│   │          └──────────────────┴──────────────────┘           │   │
│   │                          │                                  │   │
│   │                 ┌────────▼────────┐                        │   │
│   │                 │   lib/firebase  │  (Firebase Client SDK) │   │
│   │                 └────────┬────────┘                        │   │
│   └──────────────────────────┼──────────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼──────────────────────────────────────┐
│                        Next.js Server                               │
│                   (Node.js / Edge Runtime)                          │
│                                                                     │
│   ┌─────────────────────┐       ┌───────────────────────────────┐  │
│   │   Server Components │       │       API Routes              │  │
│   │   (RSC / SSR / SSG) │       │     (src/app/api/*)           │  │
│   └─────────────────────┘       └──────────────┬────────────────┘  │
│                                                 │                   │
│                                  ┌──────────────▼────────────────┐ │
│                                  │  Firebase Admin SDK           │ │
│                                  │  (server-side only)           │ │
│                                  └──────────────┬────────────────┘ │
└─────────────────────────────────────────────────┼───────────────────┘
                                                  │ Firebase APIs
┌─────────────────────────────────────────────────▼───────────────────┐
│                         Firebase (Backend)                          │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │Firebase Auth │  │  Firestore   │  │   Storage    │             │
│  │(Auth tokens, │  │  (NoSQL DB)  │  │ (Photos,     │             │
│  │ sessions)    │  │              │  │  files)      │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐                               │
│  │   Hosting    │  │   Security   │                               │
│  │  (optional)  │  │    Rules     │                               │
│  └──────────────┘  └──────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layer Breakdown

### 2.1 Frontend — Next.js App Router

| Concept             | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| **Server Components** | Default for all pages/layouts. Rendered on the server; no JS sent to client. |
| **Client Components** | Used only where interactivity, hooks, or browser APIs are needed (`"use client"`). |
| **Route Groups**    | `(auth)` for login/register flows; `(main)` for authenticated app pages.   |
| **Layouts**         | Shared UI (nav, sidebar, footer) defined in `layout.tsx` at each route level. |
| **Loading / Error** | `loading.tsx` and `error.tsx` provide per-route loading and error states.  |

### 2.2 API Layer — Next.js API Routes

- Located at `src/app/api/`.
- Run on the **Node.js server** (or Edge runtime where appropriate).
- Used for operations that must stay server-side: Firebase Admin SDK calls,
  secret-dependent logic, webhook receivers.
- Client components call these routes via `fetch()`.

### 2.3 Backend — Firebase

| Service            | Purpose                                                                 |
|--------------------|-------------------------------------------------------------------------|
| **Firebase Auth**  | User authentication (email/password, Google OAuth, magic link).        |
| **Firestore**      | Primary NoSQL database. Stores events, RSVPs, user profiles, comments. |
| **Firebase Storage** | Stores user-uploaded files: photos, profile pictures, attachments.  |
| **Security Rules** | Firestore and Storage rules enforce data access control server-side.   |
| **Firebase Hosting** | Optional static hosting for the Next.js export or alongside Vercel.  |

---

## 3. Data Flow

### Authentication Flow
```
User → Login Page → Firebase Auth (client SDK)
     → Auth token stored in cookie/session
     → Server Components read token via Firebase Admin SDK
     → Protected routes validate token server-side
```

### Data Read Flow (Server Component)
```
Page (Server Component)
  → Firebase Admin SDK (server-side)
  → Firestore query
  → Data rendered as HTML on server
  → Sent to browser (no client JS needed)
```

### Data Write Flow (Client Component)
```
User Action (form submit, button click)
  → Client Component
  → fetch() → Next.js API Route
  → Firebase Admin SDK (server-side validation)
  → Firestore write
  → Response → UI update
```

### Real-time Updates (Optional)
```
Client Component
  → Firebase Client SDK (onSnapshot listener)
  → Firestore real-time stream
  → UI re-renders on data change
```

---

## 4. Directory Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Unauthenticated routes
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/                 # Authenticated routes
│   │   ├── dashboard/page.tsx
│   │   ├── events/
│   │   │   ├── page.tsx        # Events list
│   │   │   └── [id]/page.tsx   # Single event detail
│   │   └── profile/page.tsx
│   ├── api/                    # Server-side API routes
│   │   ├── events/route.ts
│   │   └── rsvp/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── error.tsx
│   ├── loading.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/                     # Generic, reusable primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   └── features/               # Domain-specific components
│       ├── EventCard.tsx
│       ├── RSVPForm.tsx
│       └── PhotoGallery.tsx
├── lib/
│   ├── firebase/
│   │   ├── client.ts           # Firebase client SDK init
│   │   └── admin.ts            # Firebase Admin SDK init (server only)
│   └── utils/
│       └── helpers.ts
├── hooks/
│   ├── useAuth.ts
│   └── useFirestore.ts
├── types/
│   ├── event.ts
│   ├── user.ts
│   └── rsvp.ts
└── constants/
    └── index.ts
```

---

## 5. Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Router** | App Router (not Pages Router) | Server Components, better layouts, streaming |
| **Backend** | Firebase | Auth + DB + Storage in one; real-time capability; no server to manage |
| **Database** | Firestore | Schema-flexible for evolving event/RSVP data; real-time subscriptions |
| **Auth** | Firebase Auth | Built-in providers (Google, email); integrates with Firestore rules |
| **Rendering** | Server Components by default | Better performance, SEO, smaller JS bundle |
| **API Routes** | Next.js API routes | Keeps server-only secrets (Firebase Admin) off the client |
| **TypeScript** | Strict mode | Catches errors early; required for maintainability |

---

## 6. Security Model

- **Firebase Security Rules** are the primary data access guard — never rely solely on client-side checks.
- **Firebase Admin SDK** is used server-side only (in API routes) for privileged operations.
- **Auth tokens** are verified server-side via Firebase Admin before any sensitive operation.
- **Environment variables**: client-safe vars use `NEXT_PUBLIC_` prefix; secrets are server-only and never exposed to the browser.
- **Input validation** is performed both client-side (UX) and server-side (API routes).

---

## 7. Scalability Considerations

- Firestore scales horizontally; no tuning needed for moderate traffic.
- Next.js can be deployed to Vercel (serverless) or a Node.js host with minimal config.
- Firebase Storage handles large file uploads without burdening the app server.
- For high-scale needs: consider adding a CDN in front of assets and using Firestore indexes for complex queries.

---

## 8. Backend Alternative Considered

| Option | Pros | Cons | Why Not Chosen |
|--------|------|------|----------------|
| **Supabase** | PostgreSQL, open-source, SQL queries | More setup, self-managed or paid | Firebase better for real-time & rapid prototyping |
| **PocketBase** | Single binary, self-hosted | Requires a server to host | Firebase managed = less ops overhead |
| **Custom Node/Express** | Full control | Significant dev effort | Overkill for this app size |
