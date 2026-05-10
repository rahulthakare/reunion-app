import type { Metadata } from "next";
import { Inter, Fraunces, Source_Code_Pro } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Playful display serif used for hero/section headings
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Smrutigandh — NEHS Wardha Batch '93 Reunion",
    template: "%s · Smrutigandh",
  },
  description:
    "Smrutigandh — the fragrance of memories. Official reunion website for the 1993 batch of New English High School, Wardha. Reconnect with classmates, RSVP, and relive the memories.",
  keywords: [
    "NEHS Wardha",
    "New English High School",
    "Batch 1993",
    "Reunion",
    "Wardha",
    "Smrutigandh",
    "स्मृतिगंध",
  ],
  // Next.js auto-detects /app/icon.svg and /app/apple-icon.svg, but we
  // also declare them explicitly to make the link tags robust.
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
  themeColor: "#f97316",
  openGraph: {
    type: "website",
    title: "Smrutigandh — NEHS Wardha Batch '93 Reunion",
    description:
      "The fragrance of memories — still in bloom 🌸. Join us for the NEHS Wardha Batch '93 reunion.",
    siteName: "Smrutigandh",
  },
  twitter: {
    card: "summary",
    title: "Smrutigandh — NEHS Wardha Batch '93 Reunion",
    description: "The fragrance of memories — still in bloom 🌸",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${fraunces.variable} ${sourceCodePro.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
