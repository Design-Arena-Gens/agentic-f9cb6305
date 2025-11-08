"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

export default function ResidentLoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mobile.length !== 10) {
      setErrorMessage("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to generate OTP");
      }
      setStep("otp");
      setInfoMessage(
        `One-time passcode sent to your registered mobile. Demo OTP: ${payload.data.code}`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Request failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.length !== 6) {
      setErrorMessage("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, code: otp }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Invalid OTP");
      }
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Verification failed",
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
          <h1 className="text-2xl font-semibold">
            Secure OTP access for residents
          </h1>
          <p className="text-sm text-slate-200">
            Approved residents sign in with a one-time passcode delivered to
            their verified mobile number. Passwords are intentionally disabled.
          </p>
        </section>

        {step === "mobile" && (
          <form className="space-y-4" onSubmit={handleRequestOtp}>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">
                Registered mobile number
              </span>
              <input
                value={mobile}
                onChange={(event) =>
                  setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))
                }
                required
                inputMode="numeric"
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20"
                placeholder="9876543210"
              />
            </label>
            <button
              type="submit"
              disabled={mobile.length !== 10 || loading}
              className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-white/40 disabled:text-slate-500"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form className="space-y-4" onSubmit={handleVerifyOtp}>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">
                Enter 6-digit OTP
              </span>
              <input
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                inputMode="numeric"
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20"
                placeholder="••••••"
              />
            </label>
            <button
              type="submit"
              disabled={otp.length !== 6 || loading}
              className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-white/40 disabled:text-slate-500"
            >
              {loading ? "Verifying..." : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("mobile");
                setOtp("");
              }}
              className="w-full text-xs text-slate-300 underline-offset-4 hover:text-white hover:underline"
            >
              Edit mobile number
            </button>
          </form>
        )}

        {infoMessage && (
          <div className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {infoMessage}
          </div>
        )}
        {errorMessage && (
          <div className="rounded-xl border border-rose-400/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {errorMessage}
          </div>
        )}
      </main>
    </div>
  );
}

