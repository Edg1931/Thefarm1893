"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const configured = supabaseConfigured();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(params.get("next") || "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Check your email and password.");
      setStatus("idle");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[color:var(--color-ink)] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo light /></div>
        <div className="rounded-2xl bg-parchment p-8 shadow-2xl">
          <div className="flex items-center gap-2 text-brass"><Lock size={18} /><span className="text-xs font-semibold uppercase tracking-widest">Venue OS</span></div>
          <h1 className="mt-2 font-display text-3xl text-ink">Staff sign in</h1>

          {configured ? (
            <form onSubmit={submit} className="mt-6 space-y-3">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@thefarm1893.com"
                className="w-full rounded-xl border border-ink/15 bg-bone px-4 py-3 text-ink outline-none focus:border-sage" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                className="w-full rounded-xl border border-ink/15 bg-bone px-4 py-3 text-ink outline-none focus:border-sage" />
              {error && <p className="text-sm text-terracotta">{error}</p>}
              <button type="submit" disabled={status === "loading"} className="btn btn-primary w-full disabled:opacity-60">
                {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} Sign In
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-xl border border-brass/30 bg-brass/8 p-4 text-sm text-ink-soft">
              <p className="font-medium text-ink">Login isn&apos;t connected yet.</p>
              <p className="mt-1">Add your Supabase keys in Vercel to enable staff sign-in. Until then the dashboard is open in demo mode.</p>
              <Link href="/dashboard" className="btn btn-primary mt-4 w-full !py-2.5 !text-xs">Open Dashboard (demo)</Link>
            </div>
          )}
        </div>
        <Link href="/" className="mt-6 flex items-center justify-center gap-2 text-sm text-parchment/50 hover:text-parchment"><ArrowLeft size={14} /> Back to website</Link>
      </div>
    </div>
  );
}
