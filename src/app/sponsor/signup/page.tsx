import Link from "next/link";
import { SponsorAuthForm } from "@/components/SponsorAuthForm";
import { Logo } from "@/components/Logo";

export default function SponsorSignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="card w-full max-w-md p-8">
        <Link href="/">
          <Logo className="text-lg text-accent" />
        </Link>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">Sponsor portal</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Become a sponsor</h1>
        <p className="mt-1 text-sm text-muted">
          Fund free student access by posting small, scoped tasks.
        </p>
        <div className="mt-6">
          <SponsorAuthForm mode="signup" />
        </div>
        <p className="mt-6 text-sm text-muted">
          Already a sponsor?{" "}
          <Link href="/sponsor/login" className="font-medium text-accent">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
