"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MARKET_LABELS, type MarketValue } from "@/lib/constants";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jd", label: "Job Descriptions" },
  { href: "/resume", label: "Resume" },
  { href: "/riasec", label: "RIASEC Fit" },
  { href: "/skills", label: "Skill Gaps" },
];

export function AppNav({
  name,
  market,
  hasProfile,
}: {
  name: string;
  market: MarketValue | null;
  hasProfile: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex w-full flex-col justify-between border-b border-border bg-card px-4 py-4 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <div>
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-brand">
          CareerBridge
        </Link>
        <nav className="mt-6 flex flex-row flex-wrap gap-1 lg:mt-8 lg:flex-col">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={hasProfile ? item.href : "/onboarding"}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-soft text-brand-dark"
                    : "text-muted hover:bg-brand-soft hover:text-brand-dark"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4 lg:mt-0 lg:flex-col lg:items-start">
        <div>
          <p className="text-sm font-medium">{name}</p>
          {market && <p className="text-xs text-muted">{MARKET_LABELS[market]}</p>}
        </div>
        <button onClick={logout} className="text-sm font-medium text-muted hover:text-brand">
          Log out
        </button>
      </div>
    </aside>
  );
}
