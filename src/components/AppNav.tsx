"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MARKET_LABELS, type MarketValue } from "@/lib/constants";
import { Logo } from "@/components/Logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jd", label: "Job Descriptions" },
  { href: "/resume", label: "Resume" },
  { href: "/riasec", label: "RIASEC Fit" },
  { href: "/skills", label: "Skill Gaps" },
  { href: "/tasks", label: "Sponsor Tasks" },
];

export function AppNav({
  name,
  market,
  hasProfile,
  isAdmin,
}: {
  name: string;
  market: MarketValue | null;
  hasProfile: boolean;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = isAdmin ? [...NAV_ITEMS, { href: "/admin", label: "Admin" }] : NAV_ITEMS;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <aside className="glass flex w-full flex-col gap-6 px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:justify-between lg:px-5 lg:pt-6 lg:pb-12">
      <div>
        <Link href="/dashboard">
          <Logo className="text-lg text-brand" />
        </Link>
        <nav className="mt-6 flex flex-row flex-wrap gap-1 lg:mt-8 lg:flex-col lg:gap-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={hasProfile ? item.href : "/onboarding"}
                className={`border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-brand text-brand-dark"
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
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft font-serif text-sm font-semibold text-brand-dark">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            {market && <p className="text-xs text-muted">{MARKET_LABELS[market]}</p>}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3 text-sm lg:ml-0 lg:gap-0 lg:border-t lg:border-border lg:pt-3">
          <Link href="/about" className="text-muted hover:text-brand lg:flex-1">
            About us
          </Link>
          <span className="text-border lg:hidden">·</span>
          <button onClick={logout} className="font-medium text-muted hover:text-brand">
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
