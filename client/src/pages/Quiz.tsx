import Navbar from "@/components/Navbar";
import QuizCard from "@/components/QuizCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Quiz() {
  const mockQuestion = {
    question: "What is the primary function of a neural network?",
    options: [
      "To store data in a structured format",
      "To process information and learn patterns from data",
      "To compile code into machine language",
      "To manage database transactions",
    ],
    correctAnswer: 1,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Neural Networks Quiz</h1>
            <p className="text-muted-foreground">Test your knowledge on neural networks</p>
          </div>
        </div>

        <QuizCard
          question={mockQuestion.question}
          options={mockQuestion.options}
          correctAnswer={mockQuestion.correctAnswer}
          questionNumber={5}
          totalQuestions={20}
        />
      </main>
    </div>
  );
}
