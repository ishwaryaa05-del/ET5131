import { JdIntakeForm } from "@/components/JdIntakeForm";

export default function NewJdPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Add a job description</h1>
      <p className="mt-1 text-sm text-muted">
        We&apos;ll auto-detect the role title, industry, and level — you can adjust them after.
      </p>
      <div className="card mt-6 p-6">
        <JdIntakeForm />
      </div>
    </div>
  );
}
