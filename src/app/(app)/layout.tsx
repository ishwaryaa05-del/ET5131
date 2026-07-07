import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <AppNav
        name={user.name}
        market={user.profile?.market ?? null}
        hasProfile={Boolean(user.profile)}
        isAdmin={user.isAdmin}
      />
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
