"use client";

import { useRouter } from "next/navigation";

export function RetakeButton() {
  const router = useRouter();
  return (
    <button className="btn-secondary" onClick={() => router.push("/riasec?retake=1")}>
      Retake assessment
    </button>
  );
}
