# NEHS Wardha — Batch '93 Reunion App

Official reunion website for the **1993 batch of New English High School, Wardha**.

Built with [Next.js](https://nextjs.org) and TypeScript, backed by Firebase.

## Getting Started

Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
reunion-app/
├── public/             # Static assets
├── src/
│   └── app/            # Next.js App Router
│       ├── layout.tsx  # Root layout
│       ├── page.tsx    # Home page
│       ├── globals.css # Global styles
│       ├── error.tsx   # Error boundary
│       ├── loading.tsx # Loading UI
│       └── not-found.tsx # 404 page
├── next.config.ts      # Next.js configuration
├── tsconfig.json       # TypeScript configuration
├── .eslintrc.json      # ESLint configuration
└── package.json        # Dependencies and scripts
```

## Available Scripts

| Command            | Description                        |
|--------------------|------------------------------------|
| `npm run dev`      | Start the development server       |
| `npm run build`    | Build the app for production       |
| `npm run start`    | Start the production server        |
| `npm run lint`     | Run ESLint                         |
| `npm run type-check` | Run TypeScript type checking     |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript with Next.js](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
