import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, KeyRound, LogOut, Mail, Palette, UserRound } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOutEverywhereAction } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { EmailForm } from "@/components/settings/EmailForm";
import { PasswordForm } from "@/components/settings/PasswordForm";

function Section({ id, icon: Icon, title, description, children }: { id: string; icon: typeof UserRound; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card id={id} aria-labelledby={`${id}-title`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle id={`${id}-title`} className="text-lg">
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default async function AjustesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, currency_code, timezone, safety_reserve")
    .eq("id", user.id)
    .single();

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" aria-label="Volver al dashboard" className="rounded-lg p-2 transition-colors hover:bg-muted">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Ajustes</h1>
            <p className="text-sm text-muted-foreground">Administra tu perfil, tu correo y tu contraseña</p>
          </div>
        </div>

        <Section id="perfil" icon={UserRound} title="Perfil y preferencias" description="Tu nombre, moneda, zona horaria y reserva de seguridad">
          <ProfileForm
            profile={{
              // Quien omitió el onboarding no tiene nombre en el perfil: se usa el que escribió al registrarse.
              displayName: profile?.display_name || String(user.user_metadata?.display_name ?? ""),
              currencyCode: profile?.currency_code ?? "COP",
              timezone: profile?.timezone ?? "America/Bogota",
              safetyReserve: Number(profile?.safety_reserve ?? 0),
            }}
          />
        </Section>

        <Section id="apariencia" icon={Palette} title="Apariencia" description="Elige el modo y el color de Lukiva">
          <ThemeSettings />
        </Section>

        <Section id="correo" icon={Mail} title="Correo electrónico" description="El correo con el que inicias sesión">
          <EmailForm currentEmail={user.email ?? ""} />
        </Section>

        <Section id="contrasena" icon={KeyRound} title="Contraseña" description="Cámbiala cuando quieras; te pedimos la actual por seguridad">
          <PasswordForm />
        </Section>

        <Section id="sesiones" icon={LogOut} title="Sesiones" description="Si usaste Lukiva en un equipo ajeno o crees que alguien más entró">
          <form action={signOutEverywhereAction}>
            <Button type="submit" variant="outline">
              Cerrar sesión en todos los dispositivos
            </Button>
          </form>
        </Section>
      </div>
    </main>
  );
}
