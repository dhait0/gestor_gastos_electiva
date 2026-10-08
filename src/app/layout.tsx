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
  title: "FinWise",
  description: "Inteligencia y gestión financiera personal",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={cn(geist.variable, manrope.variable)}
      suppressHydrationWarning
    >
      <body className={cn(geist.variable, manrope.variable)}>
        {children}
      </body>
    </html>
  );
}