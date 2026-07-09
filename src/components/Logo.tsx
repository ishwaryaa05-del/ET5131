import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-serif font-semibold tracking-tight ${className}`}>
      <Image
        src="/logo-mark.png"
        alt=""
        width={64}
        height={64}
        className="h-[1.3em] w-[1.3em] shrink-0"
      />
      CareerGPS4u
    </span>
  );
}
