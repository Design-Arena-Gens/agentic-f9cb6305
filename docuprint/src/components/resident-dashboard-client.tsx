"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PrintJob, ResidentProfile } from "@/lib/store";
import { formatDateTime, formatFileSize } from "@/lib/utils";

interface Props {
  resident: ResidentProfile;
  jobs: PrintJob[];
  location: {
    state: string;
    city: string;
    community: string;
    block: string;
  };
}

const initialJobForm = {
  title: "",
  pages: "",
  copies: "1",
  colorMode: "mono",
  paperSize: "A4",
  notes: "",
};

export function ResidentDashboardClient({ resident, jobs: initialJobs, location }: Props) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [jobForm, setJobForm] = useState(initialJobForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleJobChange = (name: string, value: string) => {
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitJob = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Attach the document to be printed");
      return;
    }
    const pages = Number(jobForm.pages);
    const copies = Number(jobForm.copies);
    if (!pages || pages <= 0) {
      setError("Enter a valid page count");
      return;
    }
    if (!copies || copies <= 0) {
      setError("Enter a valid number of copies");
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    setError(null);
    try {
      const payload = {
        title: jobForm.title.trim(),
        pages,
        copies,
        colorMode: jobForm.colorMode,
        paperSize: jobForm.paperSize,
        notes: jobForm.notes.trim() || undefined,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
      };
      const response = await fetch("/api/print-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create print job");
      }
      setJobs((prev) => [data.data, ...prev]);
      setJobForm(initialJobForm);
      setSelectedFile(null);
      (event.target as HTMLFormElement).reset();
      setFeedback(
        "Print job queued successfully. You will be notified when it is ready for pickup.",
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit job",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/verify-otp", { method: "DELETE" });
    router.push("/");
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-slate-500">Resident</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {resident.fullName}
          </h1>
          <p className="text-sm text-slate-500">
            {location.block} · Flat {resident.flatNumber}
          </p>
          <p className="text-sm text-slate-500">
            {location.community}, {location.city}, {location.state}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 inline-flex rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
        >
          Logout
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-slate-900">
            Submit a print job
          </h2>
          <p className="text-sm text-slate-500">
            Upload document metadata and specify print preferences. File content
            remains local until processed by the print room operator.
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmitJob}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              Job title
              <input
                required
                value={jobForm.title}
                onChange={(event) =>
                  handleJobChange("title", event.target.value)
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="e.g. Lease Agreement Print"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              Number of pages
              <input
                required
                value={jobForm.pages}
                onChange={(event) =>
                  handleJobChange("pages", event.target.value)
                }
                inputMode="numeric"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="12"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              Copies
              <input
                required
                value={jobForm.copies}
                onChange={(event) =>
                  handleJobChange("copies", event.target.value)
                }
                inputMode="numeric"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="1"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              Color mode
              <select
                value={jobForm.colorMode}
                onChange={(event) =>
                  handleJobChange("colorMode", event.target.value)
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="mono">Black & White</option>
                <option value="color">Full Color</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              Paper size
              <select
                value={jobForm.paperSize}
                onChange={(event) =>
                  handleJobChange("paperSize", event.target.value)
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="Letter">Letter</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Additional notes
            <textarea
              value={jobForm.notes}
              onChange={(event) =>
                handleJobChange("notes", event.target.value)
              }
              rows={3}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Optional: stapling, pickup preference, etc."
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Document upload
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                if (file && file.size > 20 * 1024 * 1024) {
                  setError("Max file size is 20 MB");
                  setSelectedFile(null);
                  return;
                }
                setSelectedFile(file);
              }}
              className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 transition hover:border-slate-400"
            />
            {selectedFile && (
              <p className="text-xs text-slate-500">
                Selected: {selectedFile.name} · {formatFileSize(selectedFile.size)}
              </p>
            )}
          </label>

          {feedback && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {feedback}
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Queueing..." : "Queue print job"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-slate-900">
            Print job history
          </h2>
          <p className="text-sm text-slate-500">
            Track queue status and pickup readiness. Completed jobs remain in
            history for 30 days.
          </p>
        </div>
        <div className="mt-6 space-y-4">
          {jobs.length === 0 && (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              No print jobs yet. Submit your first request above.
            </p>
          )}
          {jobs.map((job) => (
            <article
              key={job.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Submitted {formatDateTime(job.createdAt)}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-slate-900/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900">
                  {job.status}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {job.copies} copy / {job.pages} pages · {job.colorMode === "color" ? "Color" : "Black & White"} · {job.paperSize}
              </p>
              <p className="text-xs text-slate-500">
                {job.fileName} · {formatFileSize(job.fileSize)}
              </p>
              {job.notes && (
                <p className="mt-2 text-xs text-slate-500">
                  Notes: {job.notes}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

