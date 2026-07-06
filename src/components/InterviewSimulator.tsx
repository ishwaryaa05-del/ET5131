"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { LANGUAGE_VALUES, LANGUAGE_LABELS, type LanguageValue } from "@/lib/constants";

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
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
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
}: {
  sessionId: string;
  jdId: string;
  questions: Question[];
  initialTurns: Turn[];
  defaultLanguage: LanguageValue;
}) {
  const [turns, setTurns] = useState<Turn[]>(initialTurns);
  const [answerText, setAnswerText] = useState("");
  const [language, setLanguage] = useState<LanguageValue>(defaultLanguage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const currentIndex = turns.length;
  const done = currentIndex >= questions.length;
  const currentQuestion = !done ? questions[currentIndex] : null;
  const speechSupported = getSpeechRecognition() !== null;

  function toggleRecording() {
    const Recognition = getSpeechRecognition();
    if (!Recognition) return;

    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = language === "ENGLISH" ? "en-US" : "en-US"; // browser voice locales vary; default to en-US
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setAnswerText((prev) => (prev ? prev + " " : "") + transcript.trim());
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
          <h2 className="text-lg font-semibold">Session complete 🎉</h2>
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
          <TurnReview key={i} turn={t} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {turns.map((t, i) => (
        <TurnReview key={i} turn={t} />
      ))}

      <div className="card p-6">
        <p className="text-sm font-medium text-muted">
          Question {currentIndex + 1} of {questions.length}
        </p>
        <p className="mt-1 text-lg font-semibold">{currentQuestion?.question}</p>

        <div className="mt-4 flex items-center gap-3">
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
          {speechSupported && (
            <button
              type="button"
              onClick={toggleRecording}
              className={recording ? "btn-primary" : "btn-secondary"}
            >
              {recording ? "● Stop recording" : "🎤 Speak"}
            </button>
          )}
        </div>

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

function TurnReview({ turn }: { turn: Turn }) {
  return (
    <div className="card p-6">
      <p className="text-sm font-medium text-muted">
        Q: {turn.questionText} <span className="badge ml-2">{LANGUAGE_LABELS[turn.answerLanguage]}</span>
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{turn.answerText}</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ScoreBar label="Content" value={turn.feedback.contentScore} />
        <ScoreBar label="Delivery" value={turn.feedback.deliveryScore} />
        <ScoreBar label="Cultural fit" value={turn.feedback.culturalFitScore} />
      </div>

      <p className="mt-4 text-sm leading-6">{turn.feedback.summary}</p>

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
