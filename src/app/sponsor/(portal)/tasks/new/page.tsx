import { SponsorTaskForm } from "@/components/SponsorTaskForm";

export default function NewSponsorTaskPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Post a task</h1>
      <p className="mt-1 text-sm text-muted">
        Pick a tier to fund free student access — the tier decides the hour cap and legal terms.
      </p>
      <div className="card mt-6 p-6">
        <SponsorTaskForm />
      </div>
    </div>
  );
}
