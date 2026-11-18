"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  List,
  Plus,
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Settings,
  LogOut,
  User,
  PiggyBank,
  Target,
  Repeat,
  CalendarClock,
  Landmark,
  Bell,
  Shield,
  LineChart,
  Calculator,
  Tags,
  MoreHorizontal,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HelpButton } from "@/components/help/HelpButton";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { ToastProvider } from "@/components/ui/toast";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/transacciones", label: "Movimientos", icon: List },
      { href: "/cuentas", label: "Cuentas", icon: CreditCard },
      { href: "/categorias", label: "Categorías", icon: Tags },
    ],
  },
  {
    label: "Planificación",
    items: [
      { href: "/presupuestos", label: "Presupuestos", icon: PiggyBank },
      { href: "/metas", label: "Metas", icon: Target },
      { href: "/recurrentes", label: "Recurrentes", icon: Repeat },
      { href: "/suscripciones", label: "Suscripciones", icon: CalendarClock },
      { href: "/obligaciones", label: "Obligaciones", icon: TrendingUp },
      { href: "/deudas", label: "Deudas", icon: Landmark },
    ],
  },
  {
    label: "Inteligencia",
    items: [
      { href: "/alertas", label: "Alertas", icon: Bell },
      { href: "/analisis", label: "Análisis", icon: LineChart },
      { href: "/simulador", label: "Simulador", icon: Calculator },
    ],
  },
];

const ACCOUNT_ITEMS: NavItem[] = [{ href: "/ajustes", label: "Ajustes", icon: Settings }];
const ADMIN_ITEM: NavItem = { href: "/admin", label: "Administración", icon: Shield };

/** Activa la sección también en sus subrutas (p. ej. /metas/123 resalta Metas). */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ pathname, showAdmin, onNavigate }: { pathname: string; showAdmin: boolean; onNavigate?: () => void }) {
  const groups = [...NAV_GROUPS, { label: "Cuenta", items: [...ACCOUNT_ITEMS, ...(showAdmin ? [ADMIN_ITEM] : [])] }];

  return (
    <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto p-4 space-y-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{group.label}</p>
          <ul className="space-y-1" role="list">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-tour={`nav-${item.href.slice(1)}`}
                  onClick={onNavigate}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    isActive(pathname, item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Navegación persistente de escritorio (lg y más). */
function DesktopSidebar({ pathname, showAdmin }: { pathname: string; showAdmin: boolean }) {
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-border bg-card">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" className="text-xl font-bold text-foreground font-heading">
          Lukiva
        </Link>
      </div>
      <NavLinks pathname={pathname} showAdmin={showAdmin} />
      <p className="p-4 border-t border-border text-xs text-muted-foreground text-center">Tu dinero, a tu ritmo</p>
    </aside>
  );
}

/** Menú completo en móvil/tablet, en una hoja lateral. */
function MobileMenu({
  pathname,
  showAdmin,
  open,
  onOpenChange,
}: {
  pathname: string;
  showAdmin: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú de navegación">
          <Menu className="w-5 h-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <div className="p-4 border-b border-border">
          <SheetTitle className="text-xl font-bold text-foreground font-heading">Lukiva</SheetTitle>
        </div>
        <NavLinks pathname={pathname} showAdmin={showAdmin} onNavigate={() => onOpenChange(false)} />
        <p className="p-4 border-t border-border text-xs text-muted-foreground text-center">Tu dinero, a tu ritmo</p>
      </SheetContent>
    </Sheet>
  );
}

/** Barra inferior de acceso rápido (solo móvil/tablet): navega sin recargar y "Más" abre el menú completo. */
function MobileNav({ pathname, onOpenMenu }: { pathname: string; onOpenMenu: () => void }) {
  const item = (href: string, label: string, Icon: LucideIcon, tour: string) => (
    <Link
      key={href}
      href={href}
      data-tour={tour}
      aria-current={isActive(pathname, href) ? "page" : undefined}
      className={cn(
        "flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isActive(pathname, href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      {label}
    </Link>
  );

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border"
      aria-label="Accesos rápidos"
    >
      <div className="grid grid-cols-5">
        {item("/dashboard", "Inicio", Home, "mobile-inicio")}
        {item("/transacciones", "Movimientos", List, "mobile-movimientos")}
        <Link
          href="/transacciones/nuevo?type=expense"
          data-tour="mobile-crear"
          className="flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          Crear
        </Link>
        {item("/presupuestos", "Presupuestos", PiggyBank, "mobile-presupuestos")}
        <button
          type="button"
          data-tour="mobile-mas"
          onClick={onOpenMenu}
          className="flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
          Más
        </button>
      </div>
    </nav>
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

function AppHeader({ menu }: { menu: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          {menu}
          {/* La marca no es un h1: cada página tiene el suyo */}
          <p className="text-lg font-bold text-foreground font-heading lg:hidden">Lukiva</p>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}

export function AppLayoutClient({ children, showAdmin = false }: { children: React.ReactNode; showAdmin?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <DesktopSidebar pathname={pathname} showAdmin={showAdmin} />
        <div className="min-h-screen flex flex-col lg:pl-64">
          <AppHeader menu={<MobileMenu pathname={pathname} showAdmin={showAdmin} open={menuOpen} onOpenChange={setMenuOpen} />} />
          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
        </div>
        <MobileNav pathname={pathname} onOpenMenu={() => setMenuOpen(true)} />
        <HelpButton />
      </div>
    </ToastProvider>
  );
}
