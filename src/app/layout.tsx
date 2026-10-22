import type { Metadata } from "next";
import "./globals.css";
import { Geist, Manrope } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lukiva",
  description: "Inteligencia y gestión financiera personal. ¿Cuánto dinero puedes gastar realmente sin comprometer tus obligaciones, reservas y objetivos?",
  applicationName: "Lukiva",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lukiva",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icons/icon-96x96.png",
    apple: "/icons/apple-touch-icon.png",
    other: [
      { rel: "manifest", url: "/manifest.json" },
      { rel: "mask-icon", url: "/icons/icon-512x512-maskable.png", color: "#2563EB" },
    ],
  },
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563EB" },
    { media: "(prefers-color-scheme: dark)", color: "#3B82F6" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={cn(geist.variable, manrope.variable)}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#2563EB" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#3B82F6" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Lukiva" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={cn(geist.variable, manrope.variable)}>
        {children}
      </body>
    </html>
  );
}