export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 font-serif font-semibold tracking-tight ${className}`}>
      CareerBridge
      <span className="text-[0.55em] font-sans font-semibold uppercase tracking-[0.15em] text-muted">
        ASEAN
      </span>
    </span>
  );
}
