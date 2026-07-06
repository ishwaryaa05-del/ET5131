import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export default async function AboutPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-serif text-lg font-semibold tracking-tight">
          CareerBridge
        </Link>
        <nav className="text-sm">
          <Link href={user ? "/dashboard" : "/"} className="text-muted hover:text-brand">
            {user ? "Back to dashboard" : "Back home"}
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-24">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">About us</p>
        <h1 className="mt-3 max-w-xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          Real job-readiness support for ASEAN&apos;s students, not another resume checklist.
        </h1>

        <div className="mt-10 flex flex-col gap-8 text-base leading-7 text-foreground">
          <p>
            CareerBridge helps university students and fresh graduates across Singapore, Malaysia,
            and Myanmar prepare for interviews the way employers in <em>their</em> market actually
            hire — not a one-size-fits-all template built for a Western audience.
          </p>

          <section>
            <h2 className="font-serif text-xl font-semibold">Why Dual-Tongue exists</h2>
            <p className="mt-3 text-muted">
              Many strong candidates — especially from Yangon, rural Malaysia, or Tamil-speaking
              communities — lose their edge in interviews not because they lack substance, but
              because translating a sharp thought into precise corporate English under pressure
              causes them to freeze or flatten their answers. Our Dual-Tongue CQ Interview
              Simulator lets students practice in a mix of their native language and English. It
              doesn&apos;t just translate — it flags where an idiom or trait native to their
              language doesn&apos;t land the same way in English, and coaches the exact
              rephrasing that would. Over repeated sessions, students build real fluency and
              confidence instead of memorized scripts.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold">Closing the skills gap too</h2>
            <p className="mt-3 text-muted">
              When a resume doesn&apos;t match a target job description, we identify exactly which
              skills are missing and point students to relevant courses on Coursera, edX, LinkedIn
              Learning, or local platforms like SkillsFuture and HRDF — filtered to that specific
              gap instead of a generic catalog search.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold">Who pays for it</h2>
            <p className="mt-3 text-muted">
              CareerBridge is free for students, always. Instead of a subscription, the platform is
              funded by sponsor companies in exchange for small, defined touchpoints with our
              talent pool — a short reflection post on what a student learned, structured feedback
              on a company&apos;s internal tool, or a scoped mini-project like a market scan. Every
              task is capped in hours and framed as a learning exchange, not employment.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold">Where this goes next</h2>
            <p className="mt-3 text-muted">
              As sponsorship funding builds, we&apos;re moving from linking out to third-party
              courses toward developing and hosting our own courses for university students — still
              funded by partners, never paid for by students. From there, we plan to build local
              centres where students can access devices, structured practice space, and in-person
              support, extending CareerBridge beyond students who already have reliable internet
              and personal laptops. Eventually, the same course infrastructure extends to secondary
              school students in underserved markets, helping close broader literacy and
              education-access gaps across the region.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <Link href="/signup" className="btn-primary px-6 py-3 text-base">
            Start preparing — it&apos;s free
          </Link>
        </div>
      </main>
    </div>
  );
}
