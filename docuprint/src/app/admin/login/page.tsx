"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Invalid credentials");
      }
      router.push("/admin");
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-md items-center justify-between px-4 py-6">
        <Logo variant="inverted" />
        <Link
          href="/"
          className="text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
        >
          Back to overview
        </Link>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-6 rounded-3xl bg-white/5 px-6 py-8 backdrop-blur">
        <section className="space-y-3">
          <h1 className="text-2xl font-semibold">Community Admin Console</h1>
          <p className="text-sm text-slate-200">
            Review resident access requests, approve print jobs, and maintain an
            auditable trail of DocuPrint activity.
          </p>
        </section>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Admin email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20"
              placeholder="admin@community.com"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20"
              placeholder="••••••••"
            />
          </label>
          {error && (
            <div className="rounded-xl border border-rose-400/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-white/40 disabled:text-slate-500"
          >
            {loading ? "Signing in..." : "Access Admin Console"}
          </button>
        </form>
      </main>
    </div>
  );
}

