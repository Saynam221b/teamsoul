import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import AppLoader from "@/components/layout/AppLoader";
import RouteBusyObserver from "@/components/layout/RouteBusyObserver";
import QueryProvider from "@/components/providers/QueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
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
  icons: {
    icon: "/logo.png?v=1",
    shortcut: "/logo.png?v=1",
    apple: "/logo.png?v=1",
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
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#050912" />
      </head>
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <RouteBusyObserver />
        <AppLoader />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
