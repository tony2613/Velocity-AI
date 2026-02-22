import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizCardProps {
  question: string;
  options: string[];
  correctAnswer: number;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuizCard({
  question,
  options,
  correctAnswer,
  questionNumber,
  totalQuestions,
}: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = () => {
    const selected = parseInt(selectedAnswer);
    setIsCorrect(selected === correctAnswer);
    setSubmitted(true);
    console.log("Answer submitted:", { selectedAnswer, correctAnswer, isCorrect: selected === correctAnswer });
  };

  const handleNext = () => {
    setSelectedAnswer("");
    setSubmitted(false);
    setIsCorrect(null);
    console.log("Moving to next question");
  };

  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {questionNumber} of {totalQuestions}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} data-testid="progress-quiz" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <h3 className="text-xl font-semibold">{question}</h3>
        <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={submitted}>
          {options.map((option, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                submitted
                  ? index === correctAnswer
                    ? "border-green-500 bg-green-500/10"
                    : selectedAnswer === index.toString()
                    ? "border-red-500 bg-red-500/10"
                    : "border-border"
                  : "border-border hover-elevate"
              }`}
              data-testid={`option-${index}`}
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
              {submitted && index === correctAnswer && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {submitted && selectedAnswer === index.toString() && index !== correctAnswer && (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        {!submitted ? (
          <Button
            className="ml-auto"
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
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-600">Incorrect</span>
                </>
              )}
            </div>
            <Button onClick={handleNext} data-testid="button-next">
              Next Question
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
