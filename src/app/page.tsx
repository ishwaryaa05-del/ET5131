import Link from "next/link";

const FEATURES = [
  {
    title: "Market-calibrated interview questions",
    body: "5-8 questions from your actual JD, each paired with what a strong answer looks like in Singapore, Malaysia, or Myanmar.",
  },
  {
    title: "Dual-Tongue CQ Simulator",
    body: "Practice in English, your native language, or mixed. Get coached on the exact rephrasing that lands the same trait in corporate English.",
  },
  {
    title: "Market-calibrated resume tailoring",
    body: "Format and content suggestions calibrated to local norms — not a template built for a Western audience.",
  },
  {
    title: "RIASEC fit, culturally interpreted",
    body: "A validated Holland Code assessment layered with what your code means in your target workplace.",
  },
  {
    title: "Skill-gap → course matching",
    body: "Exact missing skills routed to courses on Coursera, edX, LinkedIn Learning, SkillsFuture, or HRDF.",
  },
  {
    title: "Free for students",
    body: "Funded by sponsor companies through small, capped learning-exchange touchpoints — never a student subscription.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">CareerBridge</span>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary">
            Get started
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24">
        <section className="flex flex-col items-start gap-6 py-16 sm:py-24">
          <span className="badge">Built for Singapore · Malaysia · Myanmar</span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Interview-ready for the market you&apos;re actually walking into.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted">
            Paste a job description. Get interview questions, dual-language coaching, resume
            tailoring, and a skill-gap roadmap — all calibrated to how employers in your target
            market actually hire, not a one-size-fits-all template.
          </p>
          <div className="flex gap-3">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">
              Start preparing — it&apos;s free
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card flex flex-col gap-2 p-6">
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="text-sm leading-6 text-muted">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        CareerBridge is funded by sponsor companies, not student subscriptions.
      </footer>
    </div>
  );
}
