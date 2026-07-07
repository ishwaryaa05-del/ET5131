import Link from "next/link";
import { SponsorAuthForm } from "@/components/SponsorAuthForm";
import { Logo } from "@/components/Logo";

export default function SponsorLoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="card w-full max-w-md p-8">
        <Link href="/">
          <Logo className="text-lg text-accent" />
        </Link>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">Sponsor portal</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Log in to review submissions and post tasks.</p>
        <div className="mt-6">
          <SponsorAuthForm mode="login" />
        </div>
        <p className="mt-6 text-sm text-muted">
          New sponsor?{" "}
          <Link href="/sponsor/signup" className="font-medium text-accent">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-sm text-muted">
          Looking for the student app?{" "}
          <Link href="/login" className="font-medium text-brand">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
