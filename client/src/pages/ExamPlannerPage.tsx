import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarDays,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  RefreshCw,
  BrainCircuit,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
  GraduationCap
} from "lucide-react";
import { Link } from "wouter";

export default function ExamPlannerPage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<"calendar" | "weakness">("calendar");

  // Modal State for adding exam
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState("");
  const [newExamDate, setNewExamDate] = useState("");
  const [newExamSubjects, setNewExamSubjects] = useState("");
  const [newExamMinutes, setNewExamMinutes] = useState(120);

  // Modal State for adding a new Topic to the daily plan
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicSubject, setNewTopicSubject] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicMinutes, setNewTopicMinutes] = useState(45);
  const [newTopicPriority, setNewTopicPriority] = useState<"high" | "medium" | "low">("medium");
  const [newTopicNotes, setNewTopicNotes] = useState("");

  // Queries
  const { data: exams = [] } = useQuery<any[]>({
    queryKey: ["/api/exams"],
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/study-tasks"],
  });

  const { data: weaknessData } = useQuery<{
    masteries: any[];
    stats: {
      totalTopics: number;
      weakCount: number;
      moderateCount: number;
      masteredCount: number;
      avgScore: number;
    };
  }>({
    queryKey: ["/api/weakness-tracking"],
  });

  // Active Exam
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const activeExam = useMemo(() => {
    if (selectedExamId) {
      return exams.find((e) => e.id === selectedExamId) || exams[0] || null;
    }
    return exams[0] || null;
  }, [exams, selectedExamId]);

  // Task completion mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const res = await apiRequest("PATCH", `/api/study-tasks/${id}`, { isCompleted });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-tasks"] });
      toast({
        title: "Progress Updated",
        description: "Task completion status synced.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Create Exam Mutation
  const createExamMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest("POST", "/api/exams", payload);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/study-tasks"] });
      setShowAddExamModal(false);
      setNewExamTitle("");
      setNewExamDate("");
      setNewExamSubjects("");
      setSelectedExamId(data.exam.id);
      toast({
        title: "Exam & Study Plan Created!",
        description: "AI generated your initial study roadmap.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error Creating Exam",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Delete Exam Mutation
  const deleteExamMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/study-tasks"] });
      setSelectedExamId(null);
      toast({
        title: "Exam Deleted",
        description: "Exam schedule removed.",
      });
    },
  });

  // Adaptive Replanner Mutation
  const rebalanceMutation = useMutation({
    mutationFn: async (examId: string) => {
      const res = await apiRequest("POST", `/api/study-plan/${examId}/rebalance`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-tasks"] });
      toast({
        title: "Plan Adapted & Rebalanced!",
        description: data.aiSummary || "Upcoming study tasks redistributed.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Adaptation Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Create Custom Topic / Task Mutation
  const createTopicMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest("POST", "/api/study-tasks", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-tasks"] });
      setShowAddTopicModal(false);
      setNewTopicName("");
      setNewTopicNotes("");
      toast({
        title: "Topic Added to Study Plan!",
        description: "New study milestone integrated into your adaptive schedule.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to Add Topic",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Calendar calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString("default", { month: "long" });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const days = [];
    // Previous month padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, dateStr: null });
    }
    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const formattedMonth = String(month + 1).padStart(2, "0");
      const formattedDay = String(d).padStart(2, "0");
      const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
      days.push({ day: d, dateStr });
    }
    return days;
  }, [year, month, firstDayOfMonth, daysInMonth]);

  // Tasks mapped by date
  const tasksByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const t of tasks) {
      if (!map[t.targetDate]) map[t.targetDate] = [];
      map[t.targetDate].push(t);
    }
    return map;
  }, [tasks]);

  // Selected date tasks
  const selectedDateTasks = useMemo(() => {
    return tasksByDate[selectedDate] || [];
  }, [tasksByDate, selectedDate]);

  // Exam Countdown calculation
  const daysUntilExam = useMemo(() => {
    if (!activeExam) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(activeExam.examDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [activeExam]);

  // Missed tasks detection
  const missedTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return tasks.filter((t) => !t.isCompleted && t.targetDate < todayStr);
  }, [tasks]);

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleAddExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle || !newExamDate || !newExamSubjects) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const subjectsArray = newExamSubjects
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    createExamMutation.mutate({
      title: newExamTitle,
      examDate: newExamDate,
      subjects: subjectsArray,
      dailyTargetMinutes: Number(newExamMinutes) || 120,
      color: "#6366f1",
    });
  };

  return (
    <AppLayout>
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Hero / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Adaptive Intelligence
                </span>
                <span className="text-xs text-muted-foreground">Self-Adjusting Engine</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
                Exam Calendar & Adaptive Planner
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Dynamic study roadmaps that adapt instantly to missed days and weak subject areas.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3">
              {activeExam && (
                <Button
                  onClick={() => rebalanceMutation.mutate(activeExam.id)}
                  disabled={rebalanceMutation.isPending}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10 gap-2 shadow-sm font-medium"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${rebalanceMutation.isPending ? "animate-spin" : ""}`}
                  />
                  Adaptive Rebalance
                </Button>
              )}
              <Button
                onClick={() => setShowAddExamModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-md font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Target Exam
              </Button>
            </div>
          </div>

          {/* Missed Days Alert Banner (If Any) */}
          {missedTasks.length > 0 && activeExam && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-sm animate-in fade-in-50">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-amber-500/20 text-amber-500 rounded-xl shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    {missedTasks.length} Missed Study Task{missedTasks.length > 1 ? "s" : ""} Detected
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Don't worry! VelocityAI's adaptive engine can redistribute these topics smoothly across your remaining days without burnout.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => rebalanceMutation.mutate(activeExam.id)}
                disabled={rebalanceMutation.isPending}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium shrink-0 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Adjust Plan Now
              </Button>
            </div>
          )}

          {/* Exam Selector / Banner */}
          {exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exams.map((exam) => {
                const isSelected = activeExam?.id === exam.id;
                const examDateObj = new Date(exam.examDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                examDateObj.setHours(0, 0, 0, 0);
                const daysLeft = Math.ceil(
                  (examDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={exam.id}
                    onClick={() => setSelectedExamId(exam.id)}
                    className={`relative rounded-2xl p-4.5 border transition-all cursor-pointer select-none group ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-lg ring-1 ring-primary/20"
                        : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
                            {exam.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(exam.examDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete exam "${exam.title}" and its study plan?`)) {
                            deleteExamMutation.mutate(exam.id);
                          }
                        }}
                        className="text-muted-foreground/40 hover:text-destructive p-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{exam.dailyTargetMinutes} mins / day</span>
                      </div>
                      <div
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          daysLeft <= 3
                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                            : daysLeft <= 14
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        }`}
                      >
                        {daysLeft > 0
                          ? `${daysLeft} Days Left`
                          : daysLeft === 0
                          ? "Today!"
                          : "Completed"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/40 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <CalendarDays className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-foreground">No Upcoming Exams Set</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1 mb-4">
                Add your exam date and target subjects. VelocityAI will instantly create a customized, balanced daily study schedule.
              </p>
              <Button
                onClick={() => setShowAddExamModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Your First Exam
              </Button>
            </div>
          )}

          {/* Navigation View Tabs */}
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === "calendar"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Exam Calendar & Tasks
            </button>
            <button
              onClick={() => setActiveTab("weakness")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === "weakness"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              Weakness Tracking & Diagnostic
            </button>
          </div>

          {/* TAB 1: CALENDAR VIEW (Left Month Grid, Right Daily Task Focus) */}
          {activeTab === "calendar" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Month Calendar (7 Cols) */}
              <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card p-5 md:p-6 shadow-sm space-y-4">
                {/* Calendar Month Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg md:text-xl font-bold text-foreground">
                      {monthName} {year}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrevMonth}
                      className="p-2 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentMonthDate(new Date())}
                      className="px-2.5 py-1.5 rounded-lg border border-border/60 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground py-2 border-b border-border/40">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((item, idx) => {
                    if (!item.day || !item.dateStr) {
                      return (
                        <div
                          key={`empty-${idx}`}
                          className="h-20 md:h-24 rounded-2xl bg-muted/10 border border-transparent"
                        />
                      );
                    }

                    const isToday =
                      item.dateStr === new Date().toISOString().split("T")[0];
                    const isSelected = item.dateStr === selectedDate;
                    const dateTasks = tasksByDate[item.dateStr] || [];
                    const hasTasks = dateTasks.length > 0;
                    const allCompleted =
                      hasTasks && dateTasks.every((t) => t.isCompleted);
                    const hasExamToday = exams.some(
                      (e) =>
                        new Date(e.examDate).toISOString().split("T")[0] ===
                        item.dateStr
                    );

                    return (
                      <div
                        key={item.dateStr}
                        onClick={() => setSelectedDate(item.dateStr!)}
                        className={`h-20 md:h-24 rounded-2xl p-2 md:p-2.5 border transition-all cursor-pointer flex flex-col justify-between select-none relative group ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                            : isToday
                            ? "border-primary/50 bg-primary/5"
                            : "border-border/50 bg-card/60 hover:bg-muted/40 hover:border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs md:text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                              isToday
                                ? "bg-primary text-primary-foreground"
                                : isSelected
                                ? "text-primary"
                                : "text-foreground"
                            }`}
                          >
                            {item.day}
                          </span>

                          {hasExamToday && (
                            <span
                              title="Exam Day!"
                              className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-500 text-white uppercase tracking-wider"
                            >
                              Exam
                            </span>
                          )}
                        </div>

                        {/* Task indicators */}
                        {hasTasks && (
                          <div className="space-y-1 mt-1">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium truncate">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  allCompleted
                                    ? "bg-emerald-500"
                                    : "bg-indigo-500"
                                }`}
                              />
                              <span className="truncate hidden md:inline">
                                {dateTasks[0]?.subject}
                              </span>
                              <span className="md:hidden">
                                {dateTasks.length}t
                              </span>
                            </div>

                            {dateTasks.length > 1 && (
                              <span className="hidden md:block text-[9px] text-muted-foreground/70">
                                +{dateTasks.length - 1} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Daily Focus & Task List (5 Cols - Rich Interactive UI) */}
              <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card p-5 md:p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        Daily Study Schedule
                      </span>
                      <h3 className="text-lg font-bold text-foreground">
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                          undefined,
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {selectedDateTasks.filter((t) => t.isCompleted).length} /{" "}
                        {selectedDateTasks.length} Done
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const initialSubject = activeExam?.subjects?.[0] || "General";
                          setNewTopicSubject(initialSubject);
                          setShowAddTopicModal(true);
                        }}
                        className="h-8 w-8 rounded-xl bg-primary/15 hover:bg-primary text-primary hover:text-primary-foreground transition-all shadow-sm flex items-center justify-center cursor-pointer relative z-10 active:scale-95"
                        title="Add Topic to Plan"
                      >
                        <Plus className="w-4 h-4 pointer-events-none" />
                      </button>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                    {selectedDateTasks.length > 0 ? (
                      selectedDateTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() =>
                            toggleTaskMutation.mutate({
                              id: task.id,
                              isCompleted: !task.isCompleted,
                            })
                          }
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 group select-none ${
                            task.isCompleted
                              ? "border-emerald-500/30 bg-emerald-500/5 text-muted-foreground line-through"
                              : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-primary/40 text-foreground"
                          }`}
                        >
                          <div className="mt-0.5 text-primary shrink-0">
                            {task.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                  task.priority === "high"
                                    ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                    : "bg-primary/10 text-primary border border-primary/20"
                                }`}
                              >
                                {task.subject}
                              </span>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.durationMinutes} mins
                              </span>
                            </div>

                            <h4
                              className={`text-sm font-semibold mt-1.5 ${
                                task.isCompleted ? "text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {task.topic}
                            </h4>

                            {task.notes && (
                              <p className="text-xs text-muted-foreground/80 mt-1">
                                {task.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No specific tasks scheduled for this day.</p>
                        <p className="text-xs mt-1 opacity-70">
                          Select another day or rebalance your study plan.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Study Plan Overview Snippet */}
                {activeExam && (
                  <div className="pt-4 border-t border-border/40 mt-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Study Strategy
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {daysUntilExam !== null ? `${daysUntilExam} Days Left` : ""}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                      Subjects are distributed proportionally with higher weight on identified weakness areas. Missed sessions are automatically adjusted.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: WEAKNESS TRACKING & DIAGNOSTIC */}
          {activeTab === "weakness" && (
            <div className="space-y-6">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Total Analyzed Topics
                    </p>
                    <h3 className="text-2xl font-black mt-1 text-foreground">
                      {weaknessData?.stats?.totalTopics || 0}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>

                <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-red-500 uppercase">
                      Critical Weaknesses
                    </p>
                    <h3 className="text-2xl font-black mt-1 text-red-600">
                      {weaknessData?.stats?.weakCount || 0}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-amber-500 uppercase">
                      Needs Revision
                    </p>
                    <h3 className="text-2xl font-black mt-1 text-amber-600">
                      {weaknessData?.stats?.moderateCount || 0}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-emerald-500 uppercase">
                      Mastered Topics
                    </p>
                    <h3 className="text-2xl font-black mt-1 text-emerald-600">
                      {weaknessData?.stats?.masteredCount || 0}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Mastery Breakdown List */}
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Subject & Topic Mastery Breakdown
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mastery is computed continuously from your quiz results and flashcard performance.
                    </p>
                  </div>
                  <Link href="/quizzes">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                      Take a Practice Quiz <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>

                {weaknessData?.masteries && weaknessData.masteries.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {weaknessData.masteries.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-border/60 bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                              {item.subject}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                item.status === "weak"
                                  ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                  : item.status === "moderate"
                                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm text-foreground">
                            {item.topic}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Tested {item.totalAttempts} time{item.totalAttempts > 1 ? "s" : ""} • Last active {new Date(item.lastTestedAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Progress Bar & Score */}
                        <div className="flex items-center gap-4 w-full md:w-64">
                          <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                item.scorePct < 60
                                  ? "bg-red-500"
                                  : item.scorePct < 85
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${item.scorePct}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold w-12 text-right">
                            {item.scorePct}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-muted-foreground">
                    <BrainCircuit className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <h4 className="font-bold text-foreground">No Diagnostic Data Yet</h4>
                    <p className="text-xs max-w-sm mx-auto mt-1 mb-4">
                      Complete quizzes or generate study guides from your notes. VelocityAI will automatically analyze your performance and identify topics that need work.
                    </p>
                    <Link href="/notes">
                      <Button size="sm" className="gap-2">
                        View Study Guides <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

      {/* Add Exam Modal */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Add Target Exam
              </h3>
              <button
                onClick={() => setShowAddExamModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExamSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Exam Title / Course Name
                </label>
                <Input
                  placeholder="e.g. Physics Midterm, SAT Prep, Final Exams"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Target Exam Date
                </label>
                <Input
                  type="date"
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Subjects to Cover (comma-separated)
                </label>
                <Input
                  placeholder="e.g. Mechanics, Thermodynamics, Electromagnetism"
                  value={newExamSubjects}
                  onChange={(e) => setNewExamSubjects(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Daily Target Study Time (Minutes)
                </label>
                <Input
                  type="number"
                  min={30}
                  max={600}
                  step={15}
                  value={newExamMinutes}
                  onChange={(e) => setNewExamMinutes(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddExamModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createExamMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-1.5"
                >
                  {createExamMutation.isPending ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    "Generate AI Schedule"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Topic Modal */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Add Topic to Study Plan
              </h3>
              <button
                onClick={() => setShowAddTopicModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTopicSubject || !newTopicName) {
                  toast({
                    title: "Missing Fields",
                    description: "Subject and Topic name are required.",
                    variant: "destructive"
                  });
                  return;
                }
                createTopicMutation.mutate({
                  subject: newTopicSubject,
                  topic: newTopicName,
                  targetDate: selectedDate,
                  durationMinutes: Number(newTopicMinutes) || 45,
                  priority: newTopicPriority,
                  notes: newTopicNotes
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Subject Name
                </label>
                <Input
                  placeholder="e.g. Physics, Mathematics, History"
                  value={newTopicSubject}
                  onChange={(e) => setNewTopicSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Topic / Chapter Title
                </label>
                <Input
                  placeholder="e.g. Laws of Motion & Friction"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                    Duration (Minutes)
                  </label>
                  <Input
                    type="number"
                    min={15}
                    max={240}
                    step={15}
                    value={newTopicMinutes}
                    onChange={(e) => setNewTopicMinutes(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                    Priority
                  </label>
                  <select
                    value={newTopicPriority}
                    onChange={(e) => setNewTopicPriority(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Study Notes / Actionable Checklist (Optional)
                </label>
                <Input
                  placeholder="e.g. Solve 10 problem sets, review formula sheet"
                  value={newTopicNotes}
                  onChange={(e) => setNewTopicNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddTopicModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTopicMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-1.5"
                >
                  {createTopicMutation.isPending ? "Adding..." : "Add to Plan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
