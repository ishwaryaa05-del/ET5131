import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="card w-full max-w-md p-8">
        <Link href="/">
          <Logo className="text-lg text-brand" />
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Log in to keep preparing.</p>
        <div className="mt-6">
          <AuthForm mode="login" />
        </div>
        <p className="mt-6 text-sm text-muted">
          New here?{" "}
          <Link href="/signup" className="font-medium text-brand">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
