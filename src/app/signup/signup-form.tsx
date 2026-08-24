"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "./actions";

export default function SignupForm({ hasGoogle }: { hasGoogle: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await registerUser({ name, email, password });
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    const login = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (login?.error) {
      setError("Cuenta creada, pero no pudimos iniciar sesión automáticamente.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto mt-20 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="mb-1 text-2xl font-semibold text-zinc-900">Crear cuenta</h1>
      <p className="mb-6 text-sm text-zinc-500">Únete a FinWise.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Correo
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            placeholder="tu@correo.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60"
        >
          {loading ? "Creando..." : "Registrarme"}
        </button>
      </form>

      {hasGoogle && (
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="mt-4 w-full rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Continuar con Google
        </button>
      )}

      <p className="mt-6 text-center text-sm text-zinc-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
