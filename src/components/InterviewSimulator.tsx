"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LANGUAGE_VALUES, LANGUAGE_LABELS, type LanguageValue, type MarketValue } from "@/lib/constants";
import { pickInterviewer } from "@/lib/interviewer";
import {
  speak,
  cancelSpeech,
  isSpeechSynthesisSupported,
  describeSpeechError,
  describeRecognitionError,
} from "@/lib/speech";
import { InterviewerAvatar, type AvatarState } from "@/components/InterviewerAvatar";

type DualTongueNote = { original: string; issue: string; suggestedEnglish: string };
type Feedback = {
  contentScore: number;
  deliveryScore: number;
  culturalFitScore: number;
  summary: string;
  dualTongueNotes: DualTongueNote[];
};
type Turn = {
  questionIndex: number;
  questionText: string;
  answerText: string;
  answerLanguage: LanguageValue;
  feedback: Feedback;
};
type Question = { question: string; strongAnswerNote: string };

// Minimal shape for the (non-standard, vendor-prefixed) Web Speech API.
type SpeechRecognitionResultLike = ArrayLike<{ transcript: string }> & { isFinal: boolean };
type SpeechRecognitionEventLike = { resultIndex: number; results: ArrayLike<SpeechRecognitionResultLike> };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const impl = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return (impl as new () => SpeechRecognitionLike) ?? null;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span>{value.toFixed(1)} / 10</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-brand-soft">
        <div className="h-2 rounded-full bg-brand" style={{ width: `${(value / 10) * 100}%` }} />
      </div>
    </div>
  );
}

export function InterviewSimulator({
  sessionId,
  jdId,
  questions,
  initialTurns,
  defaultLanguage,
  market,
}: {
  sessionId: string;
  jdId: string;
  questions: Question[];
  initialTurns: Turn[];
  defaultLanguage: LanguageValue;
  market: MarketValue;
}) {
  const [turns, setTurns] = useState<Turn[]>(initialTurns);
  const [answerText, setAnswerText] = useState("");
  const [language, setLanguage] = useState<LanguageValue>(defaultLanguage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speechInputSupported, setSpeechInputSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const interviewer = useMemo(() => pickInterviewer(market, sessionId), [market, sessionId]);

  // Browser feature detection must happen after mount — checking `window` during
  // render would make the server-rendered HTML disagree with the client and
  // trigger a hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoiceSupported(isSpeechSynthesisSupported());
    setSpeechInputSupported(getSpeechRecognition() !== null);
    return () => cancelSpeech();
  }, []);

  const currentIndex = turns.length;
  const done = currentIndex >= questions.length;
  const currentQuestion = !done ? questions[currentIndex] : null;

  const avatarState: AvatarState = loading
    ? "thinking"
    : recording
      ? "listening"
      : speaking
        ? "speaking"
        : "idle";

  // Speech synthesis only reliably plays when it's the direct result of a
  // click — browsers like Safari silently drop it if triggered from an effect
  // or after an awaited fetch, so every playback here is button-initiated.
  function playAloud(text: string) {
    setVoiceError(null);
    speak(text, {
      lang: "en-US",
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: (reason) => setVoiceError(describeSpeechError(reason)),
    });
  }

  function toggleRecording() {
    const Recognition = getSpeechRecognition();
    if (!Recognition) return;

    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    setMicError(null);
    cancelSpeech();
    setSpeaking(false);
    const recognition = new Recognition();
    recognition.lang = "en-US"; // browser voice locales for other languages vary; default to en-US
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) transcript += event.results[i][0].transcript + " ";
      }
      if (transcript.trim()) {
        setAnswerText((prev) => (prev ? prev + " " : "") + transcript.trim());
      }
    };
    recognition.onerror = (event) => {
      setMicError(describeRecognitionError(event.error));
      setRecording(false);
    };
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  async function submitAnswer() {
    if (!currentQuestion || answerText.trim().length === 0) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/interview/session/${sessionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionIndex: currentIndex,
        answerText,
        answerLanguage: language,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Couldn't get feedback. Please try again.");
      return;
    }

    setTurns((prev) => [
      ...prev,
      {
        questionIndex: currentIndex,
        questionText: currentQuestion.question,
        answerText,
        answerLanguage: language,
        feedback: data.turn.feedback,
      },
    ]);
    setAnswerText("");
  }

  if (done) {
    const avg = (key: keyof Feedback) =>
      turns.length === 0
        ? 0
        : turns.reduce((acc, t) => acc + (t.feedback[key] as number), 0) / turns.length;

    return (
      <div className="flex flex-col gap-6">
        <div className="card p-6">
          <InterviewerAvatar name={interviewer.name} title={interviewer.title} state="idle" />
          <h2 className="mt-4 text-lg font-semibold">Session complete 🎉</h2>
          <p className="mt-1 text-sm text-muted">
            You answered all {turns.length} questions. Here&apos;s how it went.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ScoreBar label="Content" value={avg("contentScore") as number} />
            <ScoreBar label="Delivery" value={avg("deliveryScore") as number} />
            <ScoreBar label="Cultural fit" value={avg("culturalFitScore") as number} />
          </div>
          <Link href={`/jd/${jdId}/interview`} className="btn-secondary mt-5 inline-flex">
            Back to interview practice
          </Link>
        </div>

        {turns.map((t, i) => (
          <TurnReview key={i} turn={t} interviewerName={interviewer.name} voiceSupported={voiceSupported} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <InterviewerAvatar name={interviewer.name} title={interviewer.title} state={avatarState} />

      {turns.map((t, i) => (
        <TurnReview key={i} turn={t} interviewerName={interviewer.name} voiceSupported={voiceSupported} />
      ))}

      <div className="card p-6">
        <p className="text-sm font-medium text-muted">
          Question {currentIndex + 1} of {questions.length}
        </p>
        <div className="mt-2 flex items-start gap-3">
          <InterviewerAvatar name={interviewer.name} state={avatarState} size="sm" />
          <div className="rounded-2xl rounded-tl-none border border-white/50 bg-white/25 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <p className="text-base font-semibold">{currentQuestion?.question}</p>
          </div>
        </div>
        {voiceSupported && (
          <button
            type="button"
            onClick={() => currentQuestion && playAloud(currentQuestion.question)}
            disabled={speaking}
            className="btn-secondary mt-3"
          >
            {speaking ? `🔊 ${interviewer.name.split(" ")[0]} is speaking…` : `🔊 Hear ${interviewer.name.split(" ")[0]} ask this`}
          </button>
        )}
        {voiceError && <p className="mt-2 text-xs text-red-700 dark:text-red-300">{voiceError}</p>}

        <div className="mt-5 flex items-center gap-3">
          <select
            className="input w-auto"
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageValue)}
          >
            {LANGUAGE_VALUES.map((l) => (
              <option key={l} value={l}>
                Answering in: {LANGUAGE_LABELS[l]}
              </option>
            ))}
          </select>
          {speechInputSupported && (
            <button
              type="button"
              onClick={toggleRecording}
              className={recording ? "btn-primary" : "btn-secondary"}
            >
              {recording ? "● Stop recording" : "🎤 Speak your answer"}
            </button>
          )}
        </div>
        {micError && <p className="mt-2 text-xs text-red-700 dark:text-red-300">{micError}</p>}

        <textarea
          className="input mt-3 min-h-[140px]"
          placeholder="Type or speak your answer, in whichever language(s) feel natural…"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
        />

        {error && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>}

        <button
          onClick={submitAnswer}
          className="btn-primary mt-3"
          disabled={loading || answerText.trim().length === 0}
        >
          {loading ? "Coaching in progress…" : "Submit answer & get feedback"}
        </button>
      </div>
    </div>
  );
}

function TurnReview({
  turn,
  interviewerName,
  voiceSupported,
}: {
  turn: Turn;
  interviewerName: string;
  voiceSupported: boolean;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  return (
    <div className="card p-6">
      <p className="text-sm font-medium text-muted">
        {interviewerName} asked: {turn.questionText}
      </p>
      <p className="mt-2 flex items-center gap-2 text-xs text-muted">
        <span className="badge">{LANGUAGE_LABELS[turn.answerLanguage]}</span>
        your answer:
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{turn.answerText}</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ScoreBar label="Content" value={turn.feedback.contentScore} />
        <ScoreBar label="Delivery" value={turn.feedback.deliveryScore} />
        <ScoreBar label="Cultural fit" value={turn.feedback.culturalFitScore} />
      </div>

      <div className="mt-4 flex items-start gap-3">
        <InterviewerAvatar name={interviewerName} state={speaking ? "speaking" : "idle"} size="sm" />
        <p className="flex-1 text-sm leading-6">{turn.feedback.summary}</p>
      </div>
      {voiceSupported && (
        <>
          <button
            type="button"
            onClick={() => {
              setVoiceError(null);
              speak(turn.feedback.summary, {
                lang: "en-US",
                onStart: () => setSpeaking(true),
                onEnd: () => setSpeaking(false),
                onError: (reason) => setVoiceError(describeSpeechError(reason)),
              });
            }}
            disabled={speaking}
            className="mt-2 text-xs font-medium text-brand hover:underline disabled:opacity-50"
          >
            {speaking ? "🔊 Speaking…" : "🔊 Hear feedback"}
          </button>
          {voiceError && <p className="mt-1 text-xs text-red-700 dark:text-red-300">{voiceError}</p>}
        </>
      )}

      {turn.feedback.dualTongueNotes.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark">
            Dual-Tongue coaching
          </p>
          {turn.feedback.dualTongueNotes.map((note, i) => (
            <div key={i} className="rounded-sm bg-brand-soft p-3 text-sm">
              <p>
                <span className="font-medium">You said:</span> &quot;{note.original}&quot;
              </p>
              <p className="mt-1 text-muted">{note.issue}</p>
              <p className="mt-1">
                <span className="font-medium">Say instead:</span> &quot;{note.suggestedEnglish}&quot;
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
