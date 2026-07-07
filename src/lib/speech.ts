export function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Chrome loads voices asynchronously; speaking before any exist can fail silently. */
function waitForVoices(timeoutMs = 1000): Promise<void> {
  return new Promise((resolve) => {
    if (window.speechSynthesis.getVoices().length > 0) {
      resolve();
      return;
    }
    const timer = setTimeout(() => {
      window.speechSynthesis.onvoiceschanged = null;
      resolve();
    }, timeoutMs);
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timer);
      window.speechSynthesis.onvoiceschanged = null;
      resolve();
    };
  });
}

/**
 * Speaks text aloud via the browser's built-in TTS. Returns false immediately
 * if the API isn't available at all; `onError` fires with the real reason if
 * the browser accepts the utterance but fails to produce audio (e.g. no
 * voice/TTS engine installed on the OS, which is common on Linux without
 * espeak-ng or similar installed).
 */
export function speak(
  text: string,
  opts?: { lang?: string; onStart?: () => void; onEnd?: () => void; onError?: (reason: string) => void }
): boolean {
  if (!isSpeechSynthesisSupported()) return false;

  window.speechSynthesis.cancel();

  waitForVoices().then(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = opts?.lang ?? "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      opts?.onError?.("no-voices-installed");
      opts?.onEnd?.();
      return;
    }
    const match = voices.find((v) => v.lang === utterance.lang) ?? voices.find((v) => v.lang.startsWith("en"));
    if (match) utterance.voice = match;

    if (opts?.onStart) utterance.onstart = opts.onStart;
    if (opts?.onEnd) utterance.onend = opts.onEnd;
    utterance.onerror = (event) => {
      opts?.onError?.(event.error ?? "unknown-error");
      opts?.onEnd?.();
    };
    window.speechSynthesis.speak(utterance);
  });

  return true;
}

const ERROR_MESSAGES: Record<string, string> = {
  "no-voices-installed":
    "Your browser has no text-to-speech voice available. On Linux this usually means no speech engine (e.g. espeak-ng) is installed at the OS level; on Windows/Mac, check your system's speech/accessibility settings.",
  "not-allowed": "The browser blocked audio playback. Check your browser's site/sound permissions.",
  "audio-hardware": "No audio output device was found. Check your system volume and output device.",
  "language-unavailable": "No voice is installed for this language.",
  "voice-unavailable": "The selected voice isn't available.",
  "synthesis-failed": "Speech synthesis failed unexpectedly.",
  "synthesis-unavailable": "Speech synthesis isn't available right now.",
};

export function describeSpeechError(reason: string): string {
  return ERROR_MESSAGES[reason] ?? `Couldn't play audio (${reason}). Check your system volume and browser sound permissions.`;
}

export function cancelSpeech() {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}

/** For diagnostics: how many TTS voices the browser/OS currently exposes. */
export function getVoiceCount(): number {
  if (!isSpeechSynthesisSupported()) return 0;
  return window.speechSynthesis.getVoices().length;
}
