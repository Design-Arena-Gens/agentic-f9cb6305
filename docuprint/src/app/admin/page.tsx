import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { AdminDashboardClient } from "@/components/admin-dashboard-client";
import { getAdminSession } from "@/lib/session";
import { store } from "@/lib/store";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  const communityIds = store.getAdminCommunities(session.adminId);
  const signups = store.listSignupsByAdmin(session.adminId);
  const notifications = store.listNotifications(session.adminId);
  const printJobs = communityIds.flatMap((communityId) =>
    store.listPrintJobsByCommunity(communityId),
  );

  const directory = store.getCommunities();
  const communityMeta = communityIds
    .map((communityId) => {
      for (const state of directory) {
        for (const city of state.cities) {
          const community = city.communities.find(
            (candidate) => candidate.id === communityId,
          );
          if (community) {
            return {
              id: community.id,
              name: community.name,
              blocks: community.blocks,
              stateName: state.name,
              cityName: city.name,
            };
          }
        }
      }
      return null;
    })
    .filter(
      (community): community is NonNullable<typeof community> =>
        Boolean(community),
    );

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Logo />
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Admin Console
            </p>
            <p className="text-xs text-slate-400">
              Communities: {communityMeta.map((c) => c.name).join(", ")}
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminDashboardClient
          adminId={session.adminId}
          communities={communityMeta}
          signups={signups}
          notifications={notifications}
          printJobs={printJobs}
        />
      </main>
    </div>
  );
}
