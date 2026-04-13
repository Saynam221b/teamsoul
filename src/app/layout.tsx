import type { Metadata } from "next";
import { Inter, Teko } from "next/font/google";
import "./globals.css";
import AppLoader from "@/components/layout/AppLoader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Team SOUL | Bharat Ki Sarvashreshth Team",
  description:
    "Team SOUL's official legacy experience featuring championships, iconic rosters, defining eras, and the achievements that shaped Indian BGMI.",
  keywords: [
    "Team SOUL",
    "S8UL Esports",
    "BGMI",
    "PUBG Mobile",
    "esports history",
    "Indian esports",
    "MortaL",
    "Goblin",
    "NakuL",
    "BGIS 2026",
  ],
  openGraph: {
    title: "Team SOUL",
    description:
      "Bharat Ki Sarvashreshth Team, Team SOUL. Explore the championships, roster legacy, and defining achievements.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${teko.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <head>
        <meta name="theme-color" content="#020305" />
      </head>
      <body className="min-h-full flex flex-col bg-[#020305] text-foreground">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AppLoader />
        {children}
      </body>
    </html>
  );
}
