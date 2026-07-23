"use client";

import { useEffect, useState } from "react";

import { AiPageHeader } from "@/components/ai/ai-shared";
import { CareerIntelNav } from "@/components/ai/career/career-nav";
import { AuthAlert } from "@/components/auth/auth-alert";
import { EmptyState } from "@/components/common/empty-state";
import { Spinner } from "@/components/common/spinner";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { INTERVIEW_PROMPTS } from "@/constants/career-intelligence";
import { toUserSafeMessage } from "@/lib/errors";
import { studentService } from "@/services/student.service";
import { useCareerIntelStore } from "@/store/career-intel-store";
import type { InterviewMode } from "@/types/career-intelligence";

const MODES: Array<{ id: InterviewMode; label: string; detail: string }> = [
  {
    id: "technical",
    label: "Technical",
    detail: "Concepts, systems, and role depth",
  },
  {
    id: "hr",
    label: "HR / Behavioral",
    detail: "STAR stories and communication",
  },
  {
    id: "coding",
    label: "Coding",
    detail: "Problem prompts and reasoning",
  },
];

export function CareerInterviewPage() {
  const { token } = useAuth();
  const hydrate = useCareerIntelStore((s) => s.hydrate);
  const hydrated = useCareerIntelStore((s) => s.hydrated);
  const interviews = useCareerIntelStore((s) => s.interviews);
  const addInterviewSession = useCareerIntelStore((s) => s.addInterviewSession);
  const interviewReadiness = useCareerIntelStore((s) => s.interviewReadiness);

  const [mode, setMode] = useState<InterviewMode>("technical");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  const startQuestion = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setFeedback("");
    setAnswer("");
    try {
      const data = await studentService.ai.agent(
        INTERVIEW_PROMPTS[mode],
        "career",
        token,
      );
      setQuestion(data.reply || "Describe a challenging project you led.");
    } catch (err) {
      setError(toUserSafeMessage(err));
      setQuestion("Describe a challenging project you led recently.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!token || !answer.trim() || !question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.ai.agent(
        `Interview mode: ${mode}. Question: ${question}\nCandidate answer: ${answer}\nProvide concise AI feedback and a score out of 100.`,
        "career",
        token,
      );
      const reply = data.reply || "Good structure. Add more measurable outcomes.";
      const scoreMatch = reply.match(
        /(\d{1,3})\s*\/\s*100|score[:\s]*(\d{1,3})/i,
      );
      const score = Math.min(
        100,
        Number(scoreMatch?.[1] || scoreMatch?.[2] || 70),
      );
      setFeedback(reply);
      addInterviewSession({
        mode,
        question,
        answer: answer.trim(),
        feedback: reply,
        score: Number.isFinite(score) ? score : 70,
      });
    } catch (err) {
      setError(toUserSafeMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading interview studio" />
      </div>
    );
  }

  return (
    <div className="container-app page-stack flex flex-1 flex-col py-8 md:py-10">
      <AiPageHeader
        title="Interview experience"
        description="Mock technical, HR, and coding interviews with AI feedback and history."
      />
      <CareerIntelNav />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Interview readiness</CardDescription>
            <CardTitle className="text-2xl">{interviewReadiness}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Sessions completed</CardDescription>
            <CardTitle className="text-2xl">{interviews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active mode</CardDescription>
            <CardTitle className="text-lg capitalize">{mode}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={
              mode === item.id
                ? "border-border bg-muted/50 ring-ring rounded-2xl border p-4 text-left ring-2"
                : "border-border hover:bg-muted/30 rounded-2xl border p-4 text-left"
            }
            aria-pressed={mode === item.id}
          >
            <p className="font-medium">{item.label}</p>
            <p className="text-muted-foreground mt-1 text-xs">{item.detail}</p>
          </button>
        ))}
      </div>

      {error ? (
        <AuthAlert variant="error" title="Interview notice" description={error} />
      ) : null}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Mock interview dashboard</CardTitle>
            <CardDescription>
              Generate a question, answer, then receive AI feedback.
            </CardDescription>
          </div>
          <Button
            type="button"
            onClick={() => void startQuestion()}
            disabled={loading}
          >
            {loading && !question ? "Generating…" : "New question"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && !question ? (
            <div className="flex justify-center py-8">
              <Spinner label="Preparing question" />
            </div>
          ) : null}
          {question ? (
            <div className="border-border rounded-xl border px-4 py-3 text-sm">
              <p className="text-muted-foreground mb-1 text-xs uppercase">
                Question
              </p>
              <p className="whitespace-pre-wrap">{question}</p>
            </div>
          ) : (
            <EmptyState
              title="Start a practice round"
              description="Choose a mode and generate your first interview question."
            />
          )}
          <Textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Type your answer…"
            className="min-h-28"
            aria-label="Interview answer"
            disabled={!question || loading}
          />
          <Button
            type="button"
            disabled={!question || !answer.trim() || loading}
            onClick={() => void submitAnswer()}
          >
            {loading && question ? "Evaluating…" : "Get AI feedback"}
          </Button>
          {feedback ? (
            <div className="border-border bg-muted/30 rounded-xl border px-4 py-3 text-sm whitespace-pre-wrap">
              {feedback}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Interview history
        </h2>
        {interviews.length === 0 ? (
          <EmptyState
            title="No sessions yet"
            description="Completed mock interviews will appear here."
          />
        ) : (
          <div className="space-y-2">
            {interviews.map((session) => (
              <Card key={session.id}>
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
                  <div>
                    <CardTitle className="text-base capitalize">
                      {session.mode} interview
                    </CardTitle>
                    <CardDescription>
                      {new Date(session.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge>{session.score}/100</Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="font-medium">{session.question}</p>
                  <p className="text-muted-foreground line-clamp-3">
                    {session.feedback}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
