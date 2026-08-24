import SignupForm from "./signup-form";

export default function SignupPage() {
  const hasGoogle = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );

  return (
    <main className="min-h-screen bg-zinc-50 px-4">
      <SignupForm hasGoogle={hasGoogle} />
    </main>
  );
}
