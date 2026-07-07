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

const RETRYABLE_ERRORS = new Set(["canceled", "interrupted"]);
const MAX_ATTEMPTS = 4;

/**
 * Speaks text aloud via the browser's built-in TTS. Returns false immediately
 * if the API isn't available at all; `onError` fires with the real reason if
 * every attempt fails (e.g. no voice/TTS engine installed on the OS, which is
 * common on Linux without espeak-ng or similar installed).
 *
 * Chrome/WebKit's speechSynthesis is notoriously flaky: even a correctly
 * sequenced speak() call can report a spurious "canceled"/"interrupted" error
 * with no audio ever produced, seemingly at random. Since there is no known
 * way to prevent this outright, transient errors are retried a few times
 * with backoff before surfacing anything to the user.
 */
export function speak(
  text: string,
  opts?: { lang?: string; onStart?: () => void; onEnd?: () => void; onError?: (reason: string) => void }
): boolean {
  if (!isSpeechSynthesisSupported()) return false;

  const synth = window.speechSynthesis;

  function attempt(attemptNumber: number) {
    function queue() {
      waitForVoices().then(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = opts?.lang ?? "en-US";
          utterance.rate = 1;
          utterance.pitch = 1;

          const voices = synth.getVoices();
          if (voices.length === 0) {
            opts?.onError?.("no-voices-installed");
            opts?.onEnd?.();
            return;
          }
          const match =
            voices.find((v) => v.lang === utterance.lang) ?? voices.find((v) => v.lang.startsWith("en"));
          if (match) {
            try {
              utterance.voice = match;
            } catch {
              // Fall back to the browser's default voice for this language.
            }
          }

          if (opts?.onStart) utterance.onstart = opts.onStart;
          if (opts?.onEnd) utterance.onend = opts.onEnd;
          utterance.onerror = (event) => {
            const reason = event.error ?? "unknown-error";
            if (RETRYABLE_ERRORS.has(reason) && attemptNumber < MAX_ATTEMPTS) {
              setTimeout(() => attempt(attemptNumber + 1), 150 * attemptNumber);
              return;
            }
            opts?.onError?.(reason);
            opts?.onEnd?.();
          };
          synth.speak(utterance);
        } catch {
          opts?.onError?.("unknown-error");
          opts?.onEnd?.();
        }
      });
    }

    // Calling speak() right after cancel() is a known Chrome/WebKit race: the
    // new utterance can report itself as "canceled" before ever playing. Only
    // cancel (and give it a moment to settle) when something is in progress.
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setTimeout(queue, 50);
    } else {
      queue();
    }
  }

  attempt(1);
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

const RECOGNITION_ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Microphone access was blocked. Allow microphone access for this site in your browser's settings and try again.",
  "service-not-allowed": "Microphone access was blocked. Allow microphone access for this site in your browser's settings and try again.",
  "no-speech": "No speech was detected. Check that the right microphone is selected and try speaking again.",
  "audio-capture": "No microphone was found. Check that a microphone is connected and selected in your system settings.",
  network: "A network error interrupted speech recognition. Check your connection and try again.",
  aborted: "Recording was stopped before anything was captured.",
  "language-not-supported": "This language isn't supported for speech recognition in your browser.",
};

export function describeRecognitionError(reason: string): string {
  return (
    RECOGNITION_ERROR_MESSAGES[reason] ??
    `Couldn't capture your voice (${reason}). Check your microphone permissions and try again.`
  );
}

/** For diagnostics: how many TTS voices the browser/OS currently exposes. */
export function getVoiceCount(): number {
  if (!isSpeechSynthesisSupported()) return 0;
  return window.speechSynthesis.getVoices().length;
}
