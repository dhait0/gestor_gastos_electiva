"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Home, List, Plus, Target, MoreHorizontal, LayoutDashboard, CreditCard, TrendingUp, Settings, LogOut, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";
import { ToastProvider } from "@/components/ui/toast";

const mobileNav = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/transacciones", label: "Movimientos", icon: List },
  { href: null, label: "Crear", icon: Plus, isAction: true },
  { href: "/cuentas", label: "Cuentas", icon: CreditCard },
  { href: "/obligaciones", label: "Obligaciones", icon: TrendingUp },
];

const desktopNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transacciones", label: "Movimientos", icon: List },
  { href: "/cuentas", label: "Cuentas", icon: CreditCard },
  { href: "/obligaciones", label: "Obligaciones", icon: TrendingUp },
  { href: "/categorias", label: "Categorías", icon: List },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border"
      aria-label="Navegación principal"
    >
      <div className="grid grid-cols-5">
        {mobileNav.map((item) => (
          <button
            key={item.label}
            onClick={() => item.href && (window.location.href = item.href)}
            disabled={item.isAction}
            className={cn(
              "flex flex-col items-center gap-1 py-3 px-2",
              "text-xs font-medium transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
                            item.isAction && "text-primary"
            )}
            aria-current={pathname === item.href ? "page" : undefined}
            aria-disabled={item.isAction}
          >
            <item.icon className={cn("w-5 h-5", item.isAction && "text-primary")} />
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function DesktopSidebar({ pathname }: { pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <LayoutDashboard className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <nav className="flex flex-col h-full" aria-label="Navegación principal">
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-bold text-foreground font-heading">Lukiva</h1>
            </div>
            <ul className="flex-1 space-y-1 p-4" role="list">
              {desktopNav.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5",
                      "rounded-xl text-sm font-medium transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                MVP académico — Fases 7-17 en progreso
              </p>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

function UserMenu() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <User className="w-4 h-4" />
        <span>Usuario</span>
      </div>
      <form action={handleLogout}>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={isPending}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}

function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          <DesktopSidebar pathname={pathname} />
          <h1 className="text-lg font-bold text-foreground font-heading hidden sm:block">
            Lukiva
          </h1>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
        <MobileNav pathname={pathname} />
      </div>
    </ToastProvider>
  );
}