import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { ResidentDashboardClient } from "@/components/resident-dashboard-client";
import { getResidentSession } from "@/lib/session";
import { store } from "@/lib/store";

export default async function DashboardPage() {
  const session = await getResidentSession();
  if (!session) {
    redirect("/login");
  }
  const resident = store.findResidentByMobile(session.mobile);
  if (!resident) {
    redirect("/login");
  }

  const state = store.findState(resident.stateId);
  const city = store.findCity(resident.cityId);
  const community = store.findCommunity(resident.communityId);
  const block =
    community?.blocks.find((item) => item.id === resident.blockId) ?? null;

  const jobs = store.listPrintJobsForResident(resident.id);
  const location = {
    state: state?.name ?? "—",
    city: city?.name ?? "—",
    community: community?.name ?? "—",
    block: block?.name ?? "—",
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Logo />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Resident Console
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <ResidentDashboardClient
          resident={resident}
          jobs={jobs}
          location={location}
        />
      </main>
    </div>
  );
}
