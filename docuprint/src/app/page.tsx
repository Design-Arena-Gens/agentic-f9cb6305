import Link from "next/link";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Logo variant="inverted" />
        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link
            href="/login"
            className="rounded-full border border-white/30 px-4 py-2 transition hover:border-white hover:bg-white/10"
          >
            Resident Login
          </Link>
          <Link
            href="/admin/login"
            className="hidden rounded-full border border-white/30 px-4 py-2 transition hover:border-white hover:bg-white/10 sm:inline-flex"
          >
            Admin Portal
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-4 py-2 text-slate-900 transition hover:bg-slate-200"
          >
            Request Access
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-12 px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-6 text-center sm:text-left">
          <span className="mx-auto w-fit rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 sm:mx-0">
            Secure · Gated · Reliable
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            Managed document printing designed for gated residential communities
          </h1>
          <p className="text-pretty text-base text-slate-200 sm:text-lg">
            DocuPrint centralizes resident verification, print job approvals,
            and pickup logistics. Every account is manually verified by
            community administrators before mobile OTP access is granted.
          </p>
          <div className="flex flex-col gap-3 text-sm font-medium sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-white px-6 py-3 text-center text-slate-900 transition hover:bg-slate-200"
            >
              Start Resident Verification
            </Link>
            <Link
              href="/admin/login"
              className="rounded-full border border-white/30 px-6 py-3 text-center transition hover:border-white hover:bg-white/10"
            >
              Go to Admin Console
            </Link>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl bg-white/5 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Resident Onboarding
            </p>
            <h2 className="mt-4 text-lg font-semibold">
              Multi-layer verification workflow
            </h2>
            <p className="mt-2 text-sm text-slate-200">
              Cascading state → city → community selections ensure requests are
              routed to the correct community admins for manual approval. No
              resident account goes live without review.
            </p>
          </div>
          <div className="rounded-3xl bg-white/5 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Print Room Operations
            </p>
            <h2 className="mt-4 text-lg font-semibold">
              Queue visibility with secure OTP login
            </h2>
            <p className="mt-2 text-sm text-slate-200">
              Once approved, residents access DocuPrint through mobile OTP
              verification to submit jobs, monitor statuses, and coordinate
              pickup slots without exposing personal information.
            </p>
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl bg-white/5 p-6 backdrop-blur sm:grid-cols-3">
          {[
            {
              title: "Manual Verification",
              description:
                "Admins validate identity and residency before any access is activated.",
            },
            {
              title: "Audit Trails",
              description:
                "Track every signup decision, admin note, and print job event.",
            },
            {
              title: "Mobile-first UX",
              description:
                "Responsive flows optimized for residents managing jobs on the go.",
            },
          ].map((item) => (
            <article key={item.title} className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-sm text-slate-200">{item.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
