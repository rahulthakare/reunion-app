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

## 2. Mobile-First Design Principles ⭐

> **The Reunion App is a mobile-first application.** Most batchmates will visit on their
> phones (WhatsApp/text-message links, on the go). Desktop is a secondary, "nice-to-have"
> experience. Every UI/UX decision must prioritize mobile.

### 2.1 Hard rules — apply to every component, page, and feature

1. **Design for the smallest screen first** (target: 360px wide — typical Android phone).
   Build the mobile layout, then enhance for tablet and desktop using `sm:`, `md:`, `lg:` Tailwind breakpoints.
2. **Touch targets ≥ 44 × 44 px** for any tappable element (buttons, links, icons). This is
   the WCAG and Apple HIG recommendation.
3. **No `hidden md:flex` patterns that hide critical navigation on mobile.** Always provide
   a hamburger menu / bottom sheet / collapsible alternative.
4. **Responsive typography**: base `text-sm` to `text-base` on mobile, scale up to `text-lg`
   only on `md:` and above. Avoid fixed pixel font sizes.
5. **One-thumb reachable**: place primary actions in the bottom 2/3 of the screen where
   thumbs naturally rest. Avoid top-right primary CTAs.
6. **Forms must work with mobile keyboards**:
   - Use semantic input types (`type="email"`, `type="tel"`, `type="number"`, `inputMode="numeric"`)
   - Set `autoComplete` attributes correctly so password managers work
   - Use `placeholder` text that survives autofill
7. **Tables → Cards on mobile.** Wide tables are a UX disaster on mobile. Use a card
   layout for `< md` and a table for `md:` and above when displaying lists.
8. **Modals & overlays**: full-screen on mobile, dialog on desktop. Use `inset-0` on mobile,
   centered card on `md:`.
9. **Avoid horizontal scrolling** (except inside intentional carousels). If content overflows,
   wrap or collapse.
10. **Test on a real device or device emulator** — not just by resizing the browser.

### 2.2 Tailwind breakpoint strategy

| Breakpoint | Width | Devices | Approach |
|------------|-------|---------|----------|
| **default** | < 640px | Phones (portrait) | Primary target — design here first |
| **sm:** | ≥ 640px | Large phones / small tablets | Minor refinements |
| **md:** | ≥ 768px | Tablets, small laptops | Switch to multi-column layouts, show full nav |
| **lg:** | ≥ 1024px | Desktops | Add side panels, max widths |
| **xl:** | ≥ 1280px | Large desktops | Generous whitespace |

**Mobile-first Tailwind pattern** (always start unprefixed, then add larger breakpoint overrides):
```tsx
// ✅ Good — mobile-first
<div className="flex flex-col gap-3 md:flex-row md:gap-6">

// ❌ Avoid — desktop-first
<div className="flex flex-row gap-6 sm:flex-col sm:gap-3">
```

### 2.3 Performance budget for mobile

- **Initial JS bundle:** target < 200 KB gzipped
- **Largest Contentful Paint (LCP):** < 2.5s on 4G mobile
- **First Input Delay (FID):** < 100ms
- **Cumulative Layout Shift (CLS):** < 0.1
- **Use Server Components** by default — they ship zero JS to the client
- **Lazy-load images** with Next.js `<Image>` and proper `sizes` prop
- **Avoid client-side fetches in waterfalls** — prefer Server Components calling Firestore directly

### 2.4 Mobile-specific accessibility

- All forms must work without hover (no hover-only tooltips or actions)
- Sufficient color contrast (WCAG AA: 4.5:1 for body text, 3:1 for large text)
- Focus rings visible on all interactive elements
- Avoid relying on color alone to convey meaning
- `<meta name="viewport" content="width=device-width, initial-scale=1">` (Next.js handles by default)

### 2.5 Components to avoid on mobile

- **Hover-triggered menus** — use tap/click instead
- **Sticky headers > 80px tall** — eats too much screen real estate
- **Multi-column form layouts** — stack vertically on mobile
- **Right-click context menus** — never available on mobile
- **Drag-and-drop** as the only interaction — provide an alternative (button)

### 2.6 Recommended UI patterns

| Use case | Mobile pattern | Desktop pattern |
|----------|---------------|-----------------|
| Primary nav | Hamburger menu + slide-down panel | Horizontal nav bar |
| Long lists | Card grid (1 column) with infinite scroll/pagination | Table with sortable columns |
| Forms | Single-column, full-width inputs | Multi-column where appropriate |
| Modals | Full-screen sheet, slide up from bottom | Centered dialog |
| Action buttons | Floating Action Button (FAB) bottom-right | Top-right or inline |
| Confirmation | Bottom sheet with confirm/cancel | Modal or inline confirmation |
| Image galleries | Swipeable carousel + tap to expand | Grid with hover effect |

---

## 3. Layer Breakdown

### 3.1 Frontend — Next.js App Router

| Concept             | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| **Server Components** | Default for all pages/layouts. Rendered on the server; no JS sent to client. |
| **Client Components** | Used only where interactivity, hooks, or browser APIs are needed (`"use client"`). |
| **Route Groups**    | `(auth)` for login/register flows; `(main)` for authenticated app pages.   |
| **Layouts**         | Shared UI (nav, sidebar, footer) defined in `layout.tsx` at each route level. |
| **Loading / Error** | `loading.tsx` and `error.tsx` provide per-route loading and error states.  |

### 3.2 API Layer — Next.js API Routes

- Located at `src/app/api/`.
- Run on the **Node.js server** (or Edge runtime where appropriate).
- Used for operations that must stay server-side: Firebase Admin SDK calls,
  secret-dependent logic, webhook receivers.
- Client components call these routes via `fetch()`.

### 3.3 Backend — Firebase

| Service            | Purpose                                                                 |
|--------------------|-------------------------------------------------------------------------|
| **Firebase Auth**  | User authentication (email/password, Google OAuth, magic link).        |
| **Firestore**      | Primary NoSQL database. Stores events, RSVPs, user profiles, comments. |
| **Firebase Storage** | Stores user-uploaded files: photos, profile pictures, attachments.  |
| **Security Rules** | Firestore and Storage rules enforce data access control server-side.   |
| **Firebase Hosting** | Optional static hosting for the Next.js export or alongside Vercel.  |

---

## 4. Data Flow

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

## 5. Directory Structure

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

## 6. Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Design Approach** ⭐ | **Mobile-first** | Most batchmates use phones; mobile UX is primary, desktop is bonus |
| **Router** | App Router (not Pages Router) | Server Components, better layouts, streaming |
| **Backend** | Firebase | Auth + DB + Storage in one; real-time capability; no server to manage |
| **Database** | Firestore | Schema-flexible for evolving event/RSVP data; real-time subscriptions |
| **Auth** | Firebase Auth | Built-in providers (Google, email); integrates with Firestore rules |
| **Auth model** | Whitelist by email in `contacts` | Privacy: only known batchmates can access directory; admin pre-approves rest |
| **Rendering** | Server Components by default | Better performance, SEO, smaller JS bundle on mobile |
| **API Routes** | Next.js API routes | Keeps server-only secrets (Firebase Admin) off the client |
| **TypeScript** | Strict mode | Catches errors early; required for maintainability |
| **Styling** | Tailwind CSS | Mobile-first by default; utility classes match responsive design |
| **Hosting** | Vercel | Native Next.js support; auto-deploy from GitHub |

---

## 7. Security Model

- **Firebase Security Rules** are the primary data access guard — never rely solely on client-side checks.
- **Firebase Admin SDK** is used server-side only (in API routes) for privileged operations.
- **Auth tokens** are verified server-side via Firebase Admin before any sensitive operation.
- **Environment variables**: client-safe vars use `NEXT_PUBLIC_` prefix; secrets are server-only and never exposed to the browser.
- **Input validation** is performed both client-side (UX) and server-side (API routes).

---

## 8. Scalability Considerations

- Firestore scales horizontally; no tuning needed for moderate traffic.
- Next.js can be deployed to Vercel (serverless) or a Node.js host with minimal config.
- Firebase Storage handles large file uploads without burdening the app server.
- For high-scale needs: consider adding a CDN in front of assets and using Firestore indexes for complex queries.

---

## 9. Backend Alternative Considered

| Option | Pros | Cons | Why Not Chosen |
|--------|------|------|----------------|
| **Supabase** | PostgreSQL, open-source, SQL queries | More setup, self-managed or paid | Firebase better for real-time & rapid prototyping |
| **PocketBase** | Single binary, self-hosted | Requires a server to host | Firebase managed = less ops overhead |
| **Custom Node/Express** | Full control | Significant dev effort | Overkill for this app size |
