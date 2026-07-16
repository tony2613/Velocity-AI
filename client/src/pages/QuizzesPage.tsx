import AppLayout from "@/components/AppLayout";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Quiz, QuizAttempt } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ArrowRight, TrendingUp, Calendar } from "lucide-react";
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
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t("quizzes.title")}</h1>
            <p className="text-muted-foreground">{t("quizzes.subtitle")}</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48 flex flex-col justify-between p-6 border border-border/80 bg-card">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/40">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-28 rounded-xl" />
                  </div>
                </Card>
              ))}
            </div>
          ) : quizzes && quizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => {
                const attempts = quiz.attempts || [];
                const lastAttempt = attempts[0];
                const bestScore = attempts.length > 0
                  ? Math.max(...attempts.map(a => a.percentage))
                  : 0;

                return (
                  <Card key={quiz.id} className="hover-elevate flex flex-col h-full justify-between">
                    <div>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg leading-tight line-clamp-2">{quiz.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-2">
                            <span>{quiz.questionCount || 0} {t("quizzes.question_count")}</span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
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
                    </div>
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
      <Footer />
    </AppLayout>
  );
}
