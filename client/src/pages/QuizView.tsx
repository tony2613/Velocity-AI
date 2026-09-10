import { useParams, Link } from "wouter";
import Footer from "@/components/Footer";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import type { Quiz, Question, QuizAttempt } from "@shared/schema";

export default function QuizView() {
  const { id } = useParams<{ id: string }>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const { data, isLoading } = useQuery<{ quiz: Quiz; questions: Question[]; attempts?: QuizAttempt[] }>({
    queryKey: [`/api/quizzes/${id}`],
    enabled: !!id,
  });

  const saveAttemptMutation = useMutation({
    mutationFn: async (scoreValue: number) => {
      if (!data) return;
      const response = await fetch(`/api/quizzes/${id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: scoreValue, totalQuestions: data.questions.length })
      });
      if (!response.ok) throw new Error("Failed to save attempt");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quizzes/${id}`] });
    }
  });

  const handleSubmit = () => {
    if (!data) return;
    const selected = parseInt(selectedAnswer);
    const correct = selected === data.questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setSubmitted(true);
    if (correct) setScore(score + 1);
  };

  const handleNext = () => {
    if (!data) return;
    if (currentQuestion < data.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setSubmitted(false);
      setIsCorrect(null);
    } else {
      setShowSummary(true);
      saveAttemptMutation.mutate(score);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/6" />
            </div>
          </div>

          {/* Quiz Card Skeleton */}
          <Card className="w-full">
            <CardHeader className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-border/60">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </AppLayout>
    );
  }

  if (!data || !data.questions || data.questions.length === 0) {
    return (
      <AppLayout>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Quiz not found</h2>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </AppLayout>
    );
  }

  const question = data.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / data.questions.length) * 100;
  const isLastQuestion = currentQuestion === data.questions.length - 1;

  if (!question || !question.options || !Array.isArray(question.options)) {
    return (
      <AppLayout>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Quiz question is malformed or missing options</h2>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </AppLayout>
    );
  }

  if (showSummary) {
    const percentage = Math.round((score / data.questions.length) * 100);
    const attempts = data.attempts || [];
    const previousAttempts = attempts.slice(0, -1); // Exclude the one just saved

    return (
      <AppLayout>
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <Card className="text-center mb-8 rounded-3xl border border-border/80 bg-card shadow-xl p-4 sm:p-8">
            <CardHeader>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Quiz Complete!</h2>
            </CardHeader>
            <CardContent className="space-y-6 py-8">
              <div className="space-y-2">
                <div className="text-6xl sm:text-7xl font-black text-primary">
                  {percentage}%
                </div>
                <p className="text-lg sm:text-xl text-muted-foreground font-medium">
                  You got {score} out of {data.questions.length} correct
                </p>
              </div>
              <div className="flex gap-4 justify-center flex-wrap pt-4">
                <Link href="/dashboard">
                  <Button variant="outline" className="rounded-xl px-5">Back to Dashboard</Button>
                </Link>
                <Button onClick={() => window.location.reload()} className="rounded-xl px-5">
                  Retake Quiz
                </Button>
                <Link href="/planner">
                  <Button variant="outline" className="rounded-xl px-5">Exam Planner</Button>
                </Link>
                <Link href="/quizzes">
                  <Button variant="outline" className="rounded-xl px-5">View All Quizzes</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {previousAttempts.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Quiz History</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {previousAttempts.map((attempt, idx) => {
                    const attemptDate = new Date(attempt.createdAt);
                    const isToday = new Date().toDateString() === attemptDate.toDateString();
                    const timeStr = isToday
                      ? attemptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : attemptDate.toLocaleDateString();

                    return (
                      <div key={attempt.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">Attempt {previousAttempts.length - idx}</p>
                          <p className="text-sm text-muted-foreground">{timeStr}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">{attempt.percentage}%</p>
                          <p className="text-sm text-muted-foreground">{attempt.score}/{attempt.totalQuestions}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
        <Footer />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back" className="h-9 w-9 rounded-xl hover:bg-muted/60">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{data.quiz.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Test your knowledge & track subject mastery</p>
          </div>
        </div>

        <Card className="w-full rounded-2xl border border-border/80 bg-card shadow-lg p-1 sm:p-2">
          <CardHeader className="space-y-2 pb-2 pt-3 px-4 sm:px-6">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-muted-foreground">
                <span className="text-foreground">Question {currentQuestion + 1} of {data.questions.length}</span>
                <span className="text-primary">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2 rounded-full" data-testid="progress-quiz" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-1 px-4 sm:px-6">
            <h3 className="text-lg sm:text-xl font-bold leading-snug text-foreground">{question.question}</h3>
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={submitted} className="space-y-2 pt-1">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer select-none ${submitted
                    ? index === question.correctAnswer
                      ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
                      : selectedAnswer === index.toString()
                        ? "border-red-500 bg-red-500/10 shadow-sm"
                        : "border-border/60 opacity-60"
                    : selectedAnswer === index.toString()
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30"
                      : "border-border/60 bg-muted/10 hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  data-testid={`option-${index}`}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} className="h-4 w-4" />
                  <Label htmlFor={`option-${index}`} className="flex-1 text-sm sm:text-base font-medium cursor-pointer leading-snug">
                    {option}
                  </Label>
                  {submitted && index === question.correctAnswer && (
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                  {submitted && selectedAnswer === index.toString() && index !== question.correctAnswer && (
                    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  )}
                </div>
              ))}
            </RadioGroup>
            {submitted && question.explanation && (
              <div className="p-3 rounded-xl bg-muted/50 border border-border/40 text-xs sm:text-sm">
                <p>
                  <span className="font-semibold text-primary">Explanation: </span>
                  {question.explanation}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between gap-4 p-3 sm:p-4 px-4 sm:px-6 border-t border-border/40 mt-2">
            {!submitted ? (
              <Button
                className="ml-auto px-5 py-2 rounded-xl font-semibold shadow-sm h-9 text-sm"
                disabled={!selectedAnswer}
                onClick={handleSubmit}
                data-testid="button-submit"
              >
                Submit Answer
              </Button>
            ) : (
              <div className="flex items-center justify-between w-full gap-4">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="font-semibold text-emerald-500 text-sm">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-semibold text-red-500 text-sm">Incorrect</span>
                    </>
                  )}
                </div>
                <Button onClick={handleNext} className="px-5 py-2 rounded-xl font-semibold shadow-sm h-9 text-sm" data-testid="button-next">
                  {isLastQuestion ? "Finish Quiz" : "Next Question"}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </AppLayout>
  );
}
