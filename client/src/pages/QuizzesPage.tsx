import Navbar from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Quiz, QuizAttempt } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ArrowRight, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface QuizWithCount extends Quiz {
  questionCount?: number;
  attempts?: QuizAttempt[];
}

export default function QuizzesPage() {
  const { t } = useLanguage();
  const { data: quizzes, isLoading } = useQuery<QuizWithCount[]>({
    queryKey: ["/api/quizzes"],
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t("quizzes.title")}</h1>
            <p className="text-muted-foreground">{t("quizzes.subtitle")}</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : quizzes && quizzes.length > 0 ? (
            <div className="space-y-6">
              {quizzes.map((quiz) => {
                const attempts = quiz.attempts || [];
                const lastAttempt = attempts[0];
                const bestScore = attempts.length > 0
                  ? Math.max(...attempts.map(a => a.percentage))
                  : 0;

                return (
                  <Card key={quiz.id} className="hover-elevate">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{quiz.questionCount || 0} {t("quizzes.question_count")}</p>
                      </div>
                      <BookOpen className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {attempts.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">{t("quizzes.best_score")}</p>
                              <p className="font-semibold">{bestScore}%</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">{t("quizzes.attempts")}</p>
                              <p className="font-semibold">{attempts.length}</p>
                            </div>
                          </div>
                          {lastAttempt && (
                            <p className="text-xs text-muted-foreground">
                              {t("quizzes.last_attempt")}: {new Date(lastAttempt.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{t("quizzes.no_attempts")}</p>
                      )}
                    </CardContent>
                    <div className="px-6 pb-6">
                      <Link href={`/quiz/${quiz.id}`}>
                        <Button variant="default" size="sm" className="w-full gap-2" data-testid={`button-take-quiz-${quiz.id}`}>
                          {attempts.length > 0 ? t("quizzes.retake") : t("quizzes.take")}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("quizzes.no_quizzes")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
