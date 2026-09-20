import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Il Calcetto di Maria - Tornei di Calcio Balilla",
  description: "L'app ufficiale per la gestione dei tornei, statistiche e classifiche di Calcio Balilla (biliardino).",
  keywords: ["calcio balilla", "biliardino", "tornei", "calcetto", "maria", "statistiche biliardino", "foosball", "app biliardino"],
  openGraph: {
    title: "Il Calcetto di Maria - Tornei",
    description: "Gestione tornei, statistiche e classifiche di Calcio Balilla.",
    type: "website",
    locale: "it_IT",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="bg-slate-900 text-slate-50 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
