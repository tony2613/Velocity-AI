import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, MoreVertical, Loader2, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface NoteCardProps {
  title: string;
  subject: string;
  preview: string;
  date: string;
  id: string;
  audioData?: string;
}

export default function NoteCard({ title, subject, preview, date, id, audioData }: NoteCardProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const deleteNoteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note deleted",
        description: "Your note has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateQuizMutation = useMutation({
    mutationFn: async () => {
      setIsGeneratingQuiz(true);
      const response = await fetch(`/api/notes/${id}/quiz`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to generate quiz");
      return response.json();
    },
    onSuccess: (data: { quiz: { id: string } }) => {
      setIsGeneratingQuiz(false);
      toast({
        title: "Quiz ready!",
        description: "Your quiz has been generated. Click 'Take Quiz' to start.",
      });
      setLocation(`/quiz/${data.quiz.id}`);
    },
    onError: (error: Error) => {
      setIsGeneratingQuiz(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="hover-elevate" data-testid={`card-note-${id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="space-y-1 flex-1">
          <Badge variant="secondary" className="mb-2" data-testid={`badge-subject-${id}`}>
            {subject}
          </Badge>
          <h3 className="font-semibold text-lg leading-tight">{title}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-menu-${id}`}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/summary/${id}`}>
                <a className="w-full">View Summary</a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => generateQuizMutation.mutate()}>
              Generate Quiz
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => deleteNoteMutation.mutate()}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        {audioData && (
          <audio src={audioData} controls className="w-full rounded-md" data-testid={`audio-player-${id}`} />
        )}
        <p className="text-sm text-muted-foreground line-clamp-3">{preview}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t">
        <span className="text-xs text-muted-foreground">{date}</span>
        <div className="flex gap-2">
          <Link href={`/summary/${id}`}>
            <Button size="sm" variant="outline" data-testid={`button-view-${id}`}>
              <FileText className="h-3 w-3 mr-1" />
              Summary
            </Button>
          </Link>
          <Button 
            size="sm" 
            onClick={() => generateQuizMutation.mutate()}
            disabled={isGeneratingQuiz}
            data-testid={`button-quiz-${id}`}
          >
            {isGeneratingQuiz ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            Quiz
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
