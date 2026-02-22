import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Upload, Loader2, CheckCircle2, Sparkles, BookOpen,
    Search, ChevronRight, X, RotateCcw
} from "lucide-react";
import SignupWallModal from "@/components/SignupWallModal";

// ─── localStorage helpers ────────────────────────────────────────────────────
const KEYS = {
    summarized: "velocity_guest_summarized",
    quizzed: "velocity_guest_quizzed",
    searched: "velocity_guest_searched",
};
const hasUsed = (key: keyof typeof KEYS) => !!localStorage.getItem(KEYS[key]);
const markUsed = (key: keyof typeof KEYS) => localStorage.setItem(KEYS[key], "1");

// ─── Types ───────────────────────────────────────────────────────────────────
interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

interface SearchResult {
    title: string;
    snippet: string;
    link: string;
}

type WallTrigger = "summary" | "quiz" | "search" | "generic";

export default function GuestUploadZone() {
    // Upload state
    const [isDragging, setIsDragging] = useState(false);
    const [pastedText, setPastedText] = useState("");
    const [title, setTitle] = useState("");
    const [imageData, setImageData] = useState("");
    const [fileType, setFileType] = useState<"pdf" | "ppt" | "image" | "text" | "">("");

    // Result state
    const [summary, setSummary] = useState("");
    const [keyPoints, setKeyPoints] = useState<string[]>([]);
    const [extractedText, setExtractedText] = useState("");

    // Quiz state
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [quizChecked, setQuizChecked] = useState(false);

    // Search state
    const [searchQ, setSearchQ] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    // Loading states
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);

    // Signup wall
    const [wallOpen, setWallOpen] = useState(false);
    const [wallTrigger, setWallTrigger] = useState<WallTrigger>("generic");

    const showWall = (trigger: WallTrigger) => { setWallTrigger(trigger); setWallOpen(true); };

    // ─── File reading helpers ─────────────────────────────────────────────────
    const handleFileRead = (file: File) => {
        const reader = new FileReader();
        if (file.type === "application/pdf") {
            reader.onload = (e) => {
                setImageData(e.target?.result as string);
                setPastedText(`[PDF Ready] ${file.name}`);
                setTitle(file.name.replace(/\.[^/.]+$/, ""));
                setFileType("pdf");
            };
            reader.readAsDataURL(file);
        } else if (/\.(pptx?)$/i.test(file.name)) {
            reader.onload = (e) => {
                setImageData(e.target?.result as string);
                setPastedText(`[PPT Ready] ${file.name}`);
                setTitle(file.name.replace(/\.[^/.]+$/, ""));
                setFileType("ppt");
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith("image/")) {
            reader.onload = (e) => {
                setImageData(e.target?.result as string);
                setPastedText(`[Image Ready] ${file.name}`);
                setTitle(file.name.replace(/\.[^/.]+$/, ""));
                setFileType("image");
            };
            reader.readAsDataURL(file);
        } else {
            reader.onload = (e) => {
                setPastedText(e.target?.result as string);
                setTitle(file.name.replace(/\.[^/.]+$/, ""));
                setFileType("text");
            };
            reader.readAsText(file);
        }
    };

    // ─── Submit: summarize ───────────────────────────────────────────────────
    const handleSummarize = async () => {
        if (hasUsed("summarized")) { showWall("summary"); return; }

        const payload = fileType === "text" || !imageData
            ? { imageData: btoa(pastedText), title: title || "My Notes", isPDF: false }
            : { imageData, title, isPDF: fileType === "pdf" };

        setLoadingSummary(true);
        try {
            const res = await fetch("/api/guest/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.status === 429 || data.limitReached) { showWall("summary"); return; }
            if (!res.ok) throw new Error(data.error || "Failed");
            setSummary(data.summary);
            setKeyPoints(data.keyPoints || []);
            setExtractedText(data.extractedText || "");
            markUsed("summarized");
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoadingSummary(false);
        }
    };

    // ─── Submit: quiz ────────────────────────────────────────────────────────
    const handleQuiz = async () => {
        if (hasUsed("quizzed")) { showWall("quiz"); return; }
        setLoadingQuiz(true);
        try {
            const res = await fetch("/api/guest/quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: extractedText || summary }),
            });
            const data = await res.json();
            if (res.status === 429 || data.limitReached) { showWall("quiz"); return; }
            if (!res.ok) throw new Error(data.error || "Failed");
            setQuestions(data.questions);
            markUsed("quizzed");
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoadingQuiz(false);
        }
    };

    // ─── Submit: search ───────────────────────────────────────────────────────
    const handleSearch = async () => {
        if (hasUsed("searched")) { showWall("search"); return; }
        if (!searchQ.trim()) return;
        setLoadingSearch(true);
        try {
            const res = await fetch("/api/guest/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: searchQ }),
            });
            const data = await res.json();
            if (res.status === 429 || data.limitReached) { showWall("search"); return; }
            if (!res.ok) throw new Error(data.error || "Failed");
            setSearchResults(data.results || []);
            markUsed("searched");
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoadingSearch(false);
        }
    };

    const hasSummary = !!summary;
    const hasQuiz = questions.length > 0;

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            <SignupWallModal open={wallOpen} onClose={() => setWallOpen(false)} trigger={wallTrigger} />

            {/* ── Step 1: Upload ─────────────────────────────────────────────── */}
            {!hasSummary ? (
                <Card className="relative overflow-hidden border-2 border-dashed border-primary/30">
                    {loadingSummary && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                            <div className="flex flex-col items-center space-y-4 p-6 bg-card border rounded-xl shadow-lg">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <div className="text-center">
                                    <p className="font-semibold">Generating your summary…</p>
                                    <p className="text-sm text-muted-foreground">AI is reading your document</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <CardContent className="p-6">
                        <Tabs defaultValue="upload">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="upload">📄 Upload File</TabsTrigger>
                                <TabsTrigger value="text">✏️ Paste Text</TabsTrigger>
                            </TabsList>

                            {/* Upload tab */}
                            <TabsContent value="upload" className="space-y-4">
                                <div
                                    className={`border-2 border-dashed rounded-xl p-10 text-center space-y-4 cursor-pointer transition-all ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileRead(e.dataTransfer.files[0]); }}
                                    onClick={() => document.getElementById("guest-file-upload")?.click()}
                                >
                                    <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Upload className="h-7 w-7 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold">Drop your file here</p>
                                        <p className="text-sm text-muted-foreground mt-1">PDF, PPT, images, or text files</p>
                                    </div>
                                    <input id="guest-file-upload" type="file" className="hidden"
                                        accept=".txt,.pdf,.ppt,.pptx,image/*"
                                        onChange={(e) => { if (e.target.files?.[0]) handleFileRead(e.target.files[0]); }}
                                    />
                                    <Button size="lg" className="gap-2 pointer-events-none">
                                        <Upload className="h-4 w-4" /> Browse files
                                    </Button>
                                </div>
                                {imageData && (
                                    <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {fileType === "pdf" && "📄"}{fileType === "ppt" && "📊"}{fileType === "image" && "🖼️"} {title}
                                        </span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setImageData(""); setPastedText(""); setTitle(""); setFileType(""); }}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                <Button className="w-full h-11" disabled={!imageData} onClick={handleSummarize}>
                                    <Sparkles className="h-4 w-4 mr-2" /> Generate AI Summary
                                </Button>
                            </TabsContent>

                            {/* Text tab */}
                            <TabsContent value="text" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input placeholder="e.g. Chapter 5 – Cell Biology" value={title} onChange={(e) => setTitle(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Your notes</Label>
                                    <Textarea
                                        placeholder="Paste your lecture notes, textbook excerpts, or any text here…"
                                        className="min-h-[180px] resize-none"
                                        value={pastedText}
                                        onChange={(e) => { setPastedText(e.target.value); setFileType("text"); }}
                                    />
                                </div>
                                <Button className="w-full h-11" disabled={!pastedText.trim() || !title.trim()} onClick={handleSummarize}>
                                    <Sparkles className="h-4 w-4 mr-2" /> Generate AI Summary
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            ) : (
                // ── Step 2: Summary result + Quiz + Search ──────────────────────
                <div className="space-y-6">
                    {/* Summary card */}
                    <Card className="border-primary/20">
                        <CardContent className="p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <h3 className="font-semibold text-lg">AI Summary</h3>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    <Sparkles className="h-3 w-3 mr-1" /> Free demo
                                </Badge>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-sm">{summary}</p>
                            {keyPoints.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Points</p>
                                    <ul className="space-y-2">
                                        {keyPoints.map((kp, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                <span>{kp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quiz section */}
                    <Card className={hasQuiz ? "border-violet-300/40" : "border-dashed border-violet-300/40"}>
                        <CardContent className="p-6">
                            {!hasQuiz ? (
                                <div className="text-center space-y-4">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                        <BookOpen className="h-6 w-6 text-violet-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Ready to test yourself?</h3>
                                        <p className="text-sm text-muted-foreground mt-1">Generate a 5-question quiz from your summary</p>
                                    </div>
                                    <Button variant="outline" className="gap-2 border-violet-300 text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/20"
                                        onClick={handleQuiz} disabled={loadingQuiz}>
                                        {loadingQuiz ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
                                        {loadingQuiz ? "Generating quiz…" : "Generate Quiz (free)"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-violet-600" /> Quiz
                                        </h3>
                                        {quizChecked && (
                                            <span className="text-sm text-green-600 font-medium">
                                                Score: {Object.entries(answers).filter(([i, a]) => questions[Number(i)].correctAnswer === a).length}/{questions.length}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-5">
                                        {questions.map((q, qi) => (
                                            <div key={qi} className="space-y-2">
                                                <p className="text-sm font-medium">{qi + 1}. {q.question}</p>
                                                <div className="grid grid-cols-1 gap-1.5">
                                                    {q.options.map((opt, oi) => {
                                                        const isSelected = answers[qi] === oi;
                                                        const isCorrect = quizChecked && oi === q.correctAnswer;
                                                        const isWrong = quizChecked && isSelected && oi !== q.correctAnswer;
                                                        return (
                                                            <button
                                                                key={oi}
                                                                disabled={quizChecked}
                                                                onClick={() => !quizChecked && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                                                                className={`text-left text-sm px-4 py-2.5 rounded-lg border transition-all ${isCorrect ? "bg-green-50 border-green-400 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                                    : isWrong ? "bg-red-50 border-red-400 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                                                        : isSelected ? "bg-primary/10 border-primary text-primary"
                                                                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                                                                    }`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {quizChecked && q.explanation && (
                                                    <p className="text-xs text-muted-foreground pl-1 pt-1">💡 {q.explanation}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {!quizChecked ? (
                                        <Button className="w-full" onClick={() => setQuizChecked(true)}
                                            disabled={Object.keys(answers).length < questions.length}>
                                            Check Answers
                                        </Button>
                                    ) : (
                                        <Button variant="outline" className="w-full gap-2" onClick={() => { setAnswers({}); setQuizChecked(false); showWall("quiz"); }}>
                                            <RotateCcw className="h-4 w-4" /> Try again (sign up to unlock)
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Search section */}
                    <Card className="border-dashed border-blue-300/40">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Search className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">AI Research Search</h3>
                                    <p className="text-xs text-muted-foreground">Ask anything related to your topic</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g. What is the difference between mitosis and meiosis?"
                                    value={searchQ}
                                    onChange={(e) => setSearchQ(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="flex-1"
                                />
                                <Button onClick={handleSearch} disabled={loadingSearch || !searchQ.trim()} className="shrink-0 gap-1.5">
                                    {loadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    {loadingSearch ? "Searching…" : "Search"}
                                </Button>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    {searchResults.map((r, i) => (
                                        <div key={i} className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                                            <h5 className="font-semibold text-sm text-primary">{r.title}</h5>
                                            <p className="text-xs text-muted-foreground leading-relaxed">{r.snippet}</p>
                                        </div>
                                    ))}
                                    <div className="pt-2 text-center">
                                        <p className="text-xs text-muted-foreground mb-2">Want unlimited searches?</p>
                                        <Button variant="outline" size="sm" onClick={() => showWall("search")}>
                                            Sign up — it's free
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
