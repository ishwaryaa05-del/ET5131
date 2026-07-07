export function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Speaks text aloud via the browser's built-in TTS. Returns false if unsupported. */
export function speak(
  text: string,
  opts?: { lang?: string; onStart?: () => void; onEnd?: () => void }
): boolean {
  if (!isSpeechSynthesisSupported()) return false;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = opts?.lang ?? "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;
  if (opts?.onStart) utterance.onstart = opts.onStart;
  if (opts?.onEnd) utterance.onend = opts.onEnd;
  utterance.onerror = () => opts?.onEnd?.();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function cancelSpeech() {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}
