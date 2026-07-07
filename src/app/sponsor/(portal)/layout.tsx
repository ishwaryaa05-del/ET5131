import { requireSponsor } from "@/lib/sponsorSession";
import { SponsorNav } from "@/components/SponsorNav";

export default async function SponsorPortalLayout({ children }: { children: React.ReactNode }) {
  const sponsor = await requireSponsor();

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <SponsorNav companyName={sponsor.companyName} />
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
