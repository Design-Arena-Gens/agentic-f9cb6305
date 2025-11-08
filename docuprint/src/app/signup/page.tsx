"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

interface StateOption {
  id: string;
  name: string;
  cities: {
    id: string;
    name: string;
    communities: {
      id: string;
      name: string;
      blocks: {
        id: string;
        name: string;
        flats: string[];
      }[];
    }[];
  }[];
}

interface FormState {
  fullName: string;
  mobile: string;
  stateId: string;
  cityId: string;
  communityId: string;
  blockId: string;
  flatNumber: string;
}

const initialFormState: FormState = {
  fullName: "",
  mobile: "",
  stateId: "",
  cityId: "",
  communityId: "",
  blockId: "",
  flatNumber: "",
};

export default function SignupPage() {
  const [states, setStates] = useState<StateOption[]>([]);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/communities")
      .then((res) => res.json())
      .then((data) => setStates(data.data))
      .catch(() =>
        setServerError(
          "Unable to load community directory. Please try again shortly.",
        ),
      );
  }, []);

  const cities = useMemo(() => {
    const state = states.find((item) => item.id === form.stateId);
    return state?.cities ?? [];
  }, [states, form.stateId]);

  const communities = useMemo(() => {
    const city = cities.find((item) => item.id === form.cityId);
    return city?.communities ?? [];
  }, [cities, form.cityId]);

  const blocks = useMemo(() => {
    const community = communities.find(
      (item) => item.id === form.communityId,
    );
    return community?.blocks ?? [];
  }, [communities, form.communityId]);

  const flats = useMemo(() => {
    const block = blocks.find((item) => item.id === form.blockId);
    return block?.flats ?? [];
  }, [blocks, form.blockId]);

  const disabled =
    !form.fullName ||
    !form.mobile ||
    !form.stateId ||
    !form.cityId ||
    !form.communityId ||
    !form.blockId ||
    !form.flatNumber ||
    form.mobile.length !== 10;

  const handleChange = (
    name: keyof FormState,
    value: string,
    cascadeReset: (keyof FormState)[] = [],
  ) => {
    setForm((prev) => {
      const updated: FormState = { ...prev, [name]: value };
      for (const key of cascadeReset) {
        updated[key] = "";
      }
      return updated;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setServerMessage(null);
    setServerError(null);
    try {
      const response = await fetch("/api/resident-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to submit request");
      }
      setServerMessage(
        "Signup request received. Your community admin will verify your details soon.",
      );
      setForm(initialFormState);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6">
        <Logo variant="inverted" />
        <Link
          href="/"
          className="text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
        >
          Back to overview
        </Link>
      </header>
      <main className="mx-auto flex max-w-3xl flex-col gap-8 rounded-3xl bg-white/5 p-6 sm:p-10 backdrop-blur">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Request DocuPrint access for your flat
          </h1>
          <p className="text-sm text-slate-200 sm:text-base">
            Residents cannot self-activate. Submit your information below. A
            community admin will validate your identity and enable OTP login
            once approved.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">
                Full Name
              </span>
              <input
                required
                value={form.fullName}
                onChange={(event) =>
                  handleChange("fullName", event.target.value)
                }
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20"
                placeholder="Enter your full legal name"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">
                10-digit Mobile Number
              </span>
              <input
                required
                value={form.mobile}
                onChange={(event) =>
                  handleChange(
                    "mobile",
                    event.target.value.replace(/\D/g, "").slice(0, 10),
                  )
                }
                pattern="\d{10}"
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20"
                placeholder="9876543210"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">
                Community
              </span>
              <select
                required
                value={form.communityId}
                onChange={(event) =>
                  handleChange("communityId", event.target.value, [
                    "blockId",
                    "flatNumber",
                  ])
                }
                disabled={!form.cityId}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:text-slate-500"
              >
                <option value="">Select Community</option>
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">Block</span>
              <select
                required
                value={form.blockId}
                onChange={(event) =>
                  handleChange("blockId", event.target.value, ["flatNumber"])
                }
                disabled={!form.communityId}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:text-slate-500"
              >
                <option value="">Select Block</option>
                {blocks.map((block) => (
                  <option key={block.id} value={block.id}>
                    {block.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">
                Flat Number
              </span>
              <select
                required
                value={form.flatNumber}
                onChange={(event) =>
                  handleChange("flatNumber", event.target.value)
                }
                disabled={!form.blockId}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:text-slate-500"
              >
                <option value="">Select Flat</option>
                {flats.map((flat) => (
                  <option key={flat} value={flat}>
                    {flat}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col justify-end text-xs text-slate-400">
              <p>
                Your request is routed to the designated Community Admin for
                manual verification. You will receive an OTP login only after
                approval.
              </p>
            </div>
          </div>

          {serverMessage && (
            <div className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {serverMessage}
            </div>
          )}

          {serverError && (
            <div className="rounded-xl border border-rose-400/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={disabled || isSubmitting}
            className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-white/40 disabled:text-slate-500"
          >
            {isSubmitting ? "Submitting..." : "Submit for Admin Approval"}
          </button>
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
          <p className="font-semibold uppercase tracking-wide text-slate-200">
            Verification Checklist for Admins
          </p>
          <ul className="mt-3 space-y-2 text-slate-300">
            <li>• Cross-check government ID against resident database.</li>
            <li>• Confirm tenancy / ownership with society office records.</li>
            <li>• Validate block & flat mapping before approving DocuPrint.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
