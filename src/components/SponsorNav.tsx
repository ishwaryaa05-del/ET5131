"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

const NAV_ITEMS = [
  { href: "/sponsor/dashboard", label: "Dashboard" },
  { href: "/sponsor/tasks", label: "Tasks" },
];

export function SponsorNav({ companyName }: { companyName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/sponsor/auth/logout", { method: "POST" });
    router.push("/sponsor/login");
    router.refresh();
  }

  return (
    <aside className="glass flex w-full flex-col gap-6 px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:justify-between lg:px-5 lg:pt-6 lg:pb-12">
      <div>
        <Link href="/sponsor/dashboard">
          <Logo className="text-lg text-accent" />
        </Link>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">Sponsor portal</p>
        <nav className="mt-6 flex flex-row flex-wrap gap-1 lg:mt-8 lg:flex-col lg:gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:border-border hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4 lg:flex-col lg:items-stretch lg:gap-3">
        <p className="truncate text-sm font-medium">{companyName}</p>
        <button
          onClick={logout}
          className="ml-auto text-sm font-medium text-muted hover:text-brand lg:ml-0 lg:border-t lg:border-border lg:pt-3 lg:text-left"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
