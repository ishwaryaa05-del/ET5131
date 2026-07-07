import Link from "next/link";
import { Logo } from "@/components/Logo";

const FEATURES = [
  {
    n: "01",
    title: "Market-calibrated interview questions",
    body: "5–8 questions pulled from your actual JD, each paired with what a strong answer looks like in Singapore, Malaysia, or Myanmar.",
  },
  {
    n: "02",
    title: "Dual-Tongue CQ Simulator",
    body: "Practice in English, your native language, or mixed. Get coached on the exact rephrasing that lands the same trait in corporate English.",
  },
  {
    n: "03",
    title: "Market-calibrated resume tailoring",
    body: "Format and content suggestions calibrated to local norms — not a template built for a Western audience.",
  },
  {
    n: "04",
    title: "RIASEC fit, culturally interpreted",
    body: "A validated Holland Code assessment layered with what your code means in your target workplace.",
  },
  {
    n: "05",
    title: "Skill-gap → course matching",
    body: "Exact missing skills routed to courses on Coursera, edX, LinkedIn Learning, SkillsFuture, or HRDF.",
  },
  {
    n: "06",
    title: "Free for students",
    body: "Funded by sponsor companies through small, capped learning-exchange touchpoints — never a student subscription.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="glass sticky top-0 z-10 border-x-0 border-t-0">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Logo className="text-lg" />
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/about" className="text-muted hover:text-brand">
              About us
            </Link>
            <Link href="/login" className="text-muted hover:text-brand">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-24">
        <section className="grid grid-cols-1 gap-10 border-b border-border py-14 sm:py-20 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-6">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
              Singapore · Malaysia · Myanmar
            </p>
            <h1 className="max-w-xl text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
              Interview-ready for the market you&apos;re actually walking into.
            </h1>
            <p className="max-w-md text-base leading-7 text-muted">
              Paste a job description. Get interview questions, dual-language coaching, resume
              tailoring, and a skill-gap roadmap — all calibrated to how employers in your target
              market actually hire, not a one-size-fits-all template.
            </p>
            <div>
              <Link href="/signup" className="btn-primary px-6 py-3 text-base">
                Start preparing — it&apos;s free
              </Link>
            </div>
          </div>

          <div className="card flex flex-col gap-5 p-8">
            <p className="font-serif text-lg leading-8">
              &ldquo;Strong candidates lose their edge not because they lack substance, but
              because translating a sharp thought into precise corporate English under pressure
              causes them to freeze.&rdquo;
            </p>
            <p className="text-sm text-muted">
              Dual-Tongue coaching closes that gap — read the{" "}
              <Link href="/about" className="text-brand hover:underline">
                full story behind CareerBridge ASEAN
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="divide-y divide-border">
          {FEATURES.map((f) => (
            <div key={f.n} className="grid grid-cols-1 gap-2 py-7 sm:grid-cols-[3rem_1fr_1.4fr] sm:gap-6">
              <span className="font-serif text-sm text-muted">{f.n}</span>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="text-sm leading-6 text-muted">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-3 text-sm text-muted sm:flex-row sm:items-center">
          <span>CareerBridge ASEAN is funded by sponsor companies, not student subscriptions.</span>
          <Link href="/about" className="text-brand hover:underline">
            About us
          </Link>
        </div>
      </footer>
    </div>
  );
}
