import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Team SouL — Archive | 2018–2026 Esports History",
  description:
    "The definitive historical archive of Team SouL esports. 80+ tournaments, 30+ players, $718K in earnings. From the OG Era to the BGIS 2026 championship.",
  keywords: [
    "Team SouL",
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
    title: "Team SouL — Archive",
    description:
      "The definitive historical archive of Team SouL esports. 2018–2026.",
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
      className={`${inter.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
