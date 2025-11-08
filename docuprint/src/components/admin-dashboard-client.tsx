"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AdminNotification,
  PrintJob,
  ResidentSignupRequest,
} from "@/lib/store";
import { formatDateTime } from "@/lib/utils";

interface CommunitySummary {
  id: string;
  name: string;
  stateName: string;
  cityName: string;
  blocks: {
    id: string;
    name: string;
    flats: string[];
  }[];
}

interface Props {
  adminId: string;
  communities: CommunitySummary[];
  signups: ResidentSignupRequest[];
  notifications: AdminNotification[];
  printJobs: PrintJob[];
}

type SignupKey = "pending_approval" | "approved" | "rejected";

const statusLabels: Record<SignupKey, string> = {
  pending_approval: "Pending Approval",
  approved: "Approved Residents",
  rejected: "Rejected Requests",
};

export function AdminDashboardClient({
  communities,
  signups,
  notifications,
  printJobs,
}: Props) {
  const router = useRouter();
  const [signupData, setSignupData] =
    useState<ResidentSignupRequest[]>(signups);
  const [notificationData, setNotificationData] =
    useState<AdminNotification[]>(notifications);
  const [printJobData, setPrintJobData] = useState<PrintJob[]>(printJobs);
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [consoleMessage, setConsoleMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const groupedSignups = useMemo(() => {
    return signupData.reduce<Record<SignupKey, ResidentSignupRequest[]>>(
      (accumulator, signup) => {
        accumulator[signup.status].push(signup);
        return accumulator;
      },
      { pending_approval: [], approved: [], rejected: [] },
    );
  }, [signupData]);

  const handleSignupAction = async (
    signupId: string,
    action: "approve" | "reject",
  ) => {
    setBusyItem(signupId);
    setErrorMessage(null);
    setConsoleMessage(null);
    try {
      const notes =
        typeof window !== "undefined"
          ? window.prompt(
              `Add verification notes for this ${action} action (optional)`,
            ) ?? undefined
          : undefined;
      const response = await fetch(
        `/api/admin/signups/${signupId}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        },
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? `Unable to ${action} signup`);
      }
      setSignupData((prev) =>
        prev.map((signup) =>
          signup.id === signupId ? payload.data.signup ?? payload.data : signup,
        ),
      );
      setConsoleMessage(
        `Signup ${action === "approve" ? "approved" : "rejected"} successfully.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Action failed",
      );
    } finally {
      setBusyItem(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
  };

  const handleNotificationRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (response.ok) {
        setNotificationData((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification,
          ),
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update notification",
      );
    }
  };

  const handlePrintJobStatus = async (jobId: string, status: string) => {
    setBusyItem(jobId);
    setErrorMessage(null);
    setConsoleMessage(null);
    try {
      const response = await fetch(`/api/admin/print-jobs/${jobId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update job status");
      }
      setPrintJobData((prev) =>
        prev.map((job) => (job.id === jobId ? payload.data : job)),
      );
      setConsoleMessage(`Print job status updated to ${status}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update job status",
      );
    } finally {
      setBusyItem(null);
    }
  };

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            Community assignments
          </h2>
          <button
            onClick={handleLogout}
            className="w-fit rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
          >
            Logout
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((community) => (
            <article
              key={community.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {community.stateName} · {community.cityName}
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                {community.name}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Blocks covered: {community.blocks.map((block) => block.name).join(", ")}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">
            Verification queue
          </h2>
          <p className="text-sm text-slate-500">
            Review new resident requests. Verification must be completed before
            OTP access is granted.
          </p>
        </div>

        <div className="mt-6 space-y-8">
          {(Object.keys(groupedSignups) as SignupKey[]).map((key) => (
            <div key={key} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {statusLabels[key]} ({groupedSignups[key].length})
                </h3>
              </div>
              {groupedSignups[key].length === 0 && (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  No records in this lane.
                </p>
              )}
              <div className="grid gap-4">
                {groupedSignups[key].map((signup) => (
                  <article
                    key={signup.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-base font-semibold text-slate-900">
                          {signup.fullName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Mobile: {signup.mobile}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">
                        Requested {formatDateTime(signup.createdAt)}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Location: {signup.blockId} · Flat {signup.flatNumber}
                    </p>
                    {signup.adminNotes && (
                      <p className="mt-2 text-xs text-slate-500">
                        Admin notes: {signup.adminNotes}
                      </p>
                    )}
                    {key === "pending_approval" && (
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                        <button
                          onClick={() => handleSignupAction(signup.id, "approve")}
                          disabled={busyItem === signup.id}
                          className="rounded-full bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                        >
                          {busyItem === signup.id ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleSignupAction(signup.id, "reject")}
                          disabled={busyItem === signup.id}
                          className="rounded-full bg-rose-600 px-4 py-2 text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
                        >
                          {busyItem === signup.id ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">
            Print job oversight
          </h2>
          <p className="text-sm text-slate-500">
            Update status as jobs move through the print queue.
          </p>
        </div>
        <div className="mt-6 grid gap-4">
          {printJobData.length === 0 && (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              No active jobs yet.
            </p>
          )}
          {printJobData.map((job) => (
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
                <select
                  value={job.status}
                  onChange={(event) =>
                    handlePrintJobStatus(job.id, event.target.value)
                  }
                  disabled={busyItem === job.id}
                  className="w-full max-w-[180px] rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 outline-none transition focus:border-slate-400"
                >
                  <option value="queued">Queued</option>
                  <option value="printing">Printing</option>
                  <option value="ready">Ready for pickup</option>
                  <option value="collected">Collected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {job.copies} copies · {job.pages} pages · {job.colorMode} ·{" "}
                {job.paperSize}
              </p>
              {job.notes && (
                <p className="mt-2 text-xs text-slate-500">Notes: {job.notes}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">
            Notification center
          </h2>
          <p className="text-sm text-slate-500">
            System generated alerts for new signups and job updates.
          </p>
        </div>
        <div className="mt-6 space-y-4">
          {notificationData.length === 0 && (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              Inbox is clear.
            </p>
          )}
          {notificationData.map((notification) => (
            <article
              key={notification.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {notification.message}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => handleNotificationRead(notification.id)}
                  className="w-fit rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
                >
                  Mark as read
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      {(consoleMessage || errorMessage) && (
        <div
          className={`rounded-2xl border px-4 py-4 text-sm ${
            errorMessage
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {errorMessage ?? consoleMessage}
        </div>
      )}
    </div>
  );
}
