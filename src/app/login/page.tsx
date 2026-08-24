import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  const hasGoogle = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );

  return (
    <main className="min-h-screen bg-zinc-50 px-4">
      <Suspense fallback={null}>
        <LoginForm hasGoogle={hasGoogle} />
      </Suspense>
    </main>
  );
}
