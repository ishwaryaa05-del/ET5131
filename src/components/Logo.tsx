export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 font-serif font-semibold tracking-tight ${className}`}>
      CareerGPS4u
    </span>
  );
}
