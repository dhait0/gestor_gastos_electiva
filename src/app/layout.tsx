import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { auth } from "@/auth";
import SignOutButton from "@/components/sign-out-button";
import ThemeToggle from "@/components/theme-toggle";
import Link from "next/link";
import Script from "next/script";
import ClientSessionProvider from "@/components/client-session-provider";
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
  title: "FinWise",
  description: "Entiende tu dinero. Anticipa tus decisiones.",
};

const themeScript = `/theme-init.js`;

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/transactions", label: "Transacciones", icon: "💸" },
  { href: "/accounts", label: "Cuentas", icon: "🏦" },
  { href: "/categories", label: "Categorías", icon: "🏷️" },
];

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const session = await auth();
  const showNav = !!session?.user;

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-script" src={themeScript} strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col">
        <ClientSessionProvider>
          {showNav && (
            <header className="border-b border-border bg-card">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <div className="flex items-center gap-6">
                  <Link href="/dashboard" className="font-semibold text-foreground">
                    FinWise
                  </Link>
                  <nav className="hidden items-center gap-4 sm:flex">
                    {NAV_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <SignOutButton />
                </div>
              </div>
            </header>
          )}
          <main className="flex-1">{children}</main>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
