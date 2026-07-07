import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { Logo } from "@/components/Logo";

export default async function AboutPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="glass sticky top-0 z-10 border-x-0 border-t-0">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Logo className="text-lg" />
          </Link>
          <nav className="text-sm">
            <Link href={user ? "/dashboard" : "/"} className="text-muted hover:text-brand">
              {user ? "Back to dashboard" : "Back home"}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-24">
        <div className="pt-14">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">About us</p>
          <h1 className="mt-3 max-w-xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            Built by students who were job hunting too.
          </h1>
        </div>

        <section className="card mt-8 p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark">
            Our story
          </p>
          <p className="mt-3 text-base leading-7">
            CareerBridge ASEAN started with a small group of university students who were applying to
            jobs ourselves — and finding it a lot harder than we expected. The more we compared
            notes, the more one pattern stood out: the international students in our own group,
            some of the sharpest people we knew, kept losing offers not because their thinking was
            weak, but because something got lost the moment they had to say it in English, under
            pressure, in a format built around Western interview norms. It wasn&apos;t a substance
            problem. It was a translation and a market-fit problem — and nothing we tried actually
            addressed it. So a few of us decided to build the tool we wished we&apos;d had.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="card p-7">
            <p className="font-serif text-lg font-semibold">Our mission</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Make sure no capable student gets filtered out of a job they&apos;re qualified for
              because of a language barrier or a market mismatch — never because of a lack of
              substance.
            </p>
          </div>
          <div className="card p-7">
            <p className="font-serif text-lg font-semibold">Our vision</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              A region where every student — whatever their first language, internet access, or
              university — walks into an interview as prepared as anyone else, backed by
              employers and schools who invest in that preparation directly.
            </p>
          </div>
        </section>

        <div className="mt-10 flex flex-col gap-8 text-base leading-7 text-foreground">
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
              CareerBridge ASEAN is free for students, always. Instead of a subscription, the platform is
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
              support, extending CareerBridge ASEAN beyond students who already have reliable internet
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
