import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEHS Wardha — Batch '93 Reunion",
  description:
    "Official reunion website for the 1993 batch of New English High School, Wardha. Reconnect with classmates, RSVP, and relive the memories.",
  keywords: ["NEHS Wardha", "New English High School", "Batch 1993", "Reunion", "Wardha"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceCodePro.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
