import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

import { siteConfig } from "@/lib/site-config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${siteConfig.coach.displayName} — Private Jiu-Jitsu Lessons`,
  description:
    "Private Brazilian Jiu-Jitsu lessons with Coach Lily — IBJJF European Champion, No-Gi World Champion and No-Gi Pan American Champion, training and competing for Gracie Barra. Book a 60-minute session.",
  openGraph: {
    title: `${siteConfig.coach.displayName} — Private Jiu-Jitsu Lessons`,
    description:
      "Three-time IBJJF champion. Private 60-minute lessons for competitors, beginners and hobbyists.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="cinematic-grade min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
