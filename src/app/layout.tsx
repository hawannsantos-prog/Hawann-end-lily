import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import { coach } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${coach.name} — ${coach.tagline}`,
  description:
    "Private Brazilian Jiu-Jitsu lessons with black belt competitor Lily Costa. Beginners to competitors. Book a one-on-one session in London.",
  keywords: [
    "Brazilian Jiu-Jitsu",
    "BJJ private lessons",
    "jiu jitsu coach",
    "London BJJ",
    "one-on-one grappling",
  ],
  openGraph: {
    title: `${coach.name} — ${coach.tagline}`,
    description:
      "Private Brazilian Jiu-Jitsu lessons with black belt competitor Lily Costa.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#141416",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} bg-background`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
