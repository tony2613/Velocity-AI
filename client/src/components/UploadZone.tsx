import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Music, Mic, Square } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

export default function UploadZone() {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [imageData, setImageData] = useState<string>("");
  const [audioData, setAudioData] = useState<string>("");
  const [audioFileName, setAudioFileName] = useState<string>("");
  const [fileType, setFileType] = useState<"pdf" | "ppt" | "image" | "text" | "audio" | "">();

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string>("");
  const [submittedAudioUrl, setSubmittedAudioUrl] = useState<string>("");
  const [submittedAudioFileName, setSubmittedAudioFileName] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();

  const createNoteMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; subject: string; audioData?: string }) => {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setPastedText("");
      setTitle("");
      setSubject("");
      setImageData("");
      setAudioData("");
      setAudioFileName("");
      setRecordedAudioUrl("");
      setFileType("");
      toast({
        title: t("upload.success"),
        description: t("upload.success_desc"),
      });
    },
    onError: (error: Error) => {
      let message = error.message;
      if (message.includes("500") || message.includes("503") || message.includes("Failed to fetch")) {
        message = t("error.server_busy");
      }
      toast({
        title: t("error.upload_failed"),
        description: message,
        variant: "destructive",
      });
    },
  });

  const processImageMutation = useMutation({
    mutationFn: async (data: { imageData: string; title: string; subject: string; isPDF?: boolean; language?: string }) => {
      const response = await fetch("/api/process-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to process file");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setPastedText("");
      setTitle("");
      setSubject("");
      setImageData("");
      setAudioData("");
      setAudioFileName("");
      setRecordedAudioUrl("");
      setFileType("");
      toast({
        title: t("upload.file_processed"),
        description: t("upload.file_processed_desc"),
      });
    },
    onError: (error: Error) => {
      let message = error.message;
      if (message.includes("500") || message.includes("503") || message.includes("Failed to fetch")) {
        message = t("error.server_busy");
      }
      toast({
        title: t("error.processing_failed"),
        description: message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioData(reader.result as string);
          setAudioFileName("recorded-audio.wav");
          setPastedText("[Recorded Audio Ready for Processing]\nFile: recorded-audio.wav");
          setFileType("audio");
        };

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: t("error.generic"),
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearRecording = () => {
    setRecordedAudioUrl("");
    setAudioData("");
    setAudioFileName("");
    setPastedText("");
    setFileType("");
    setTitle("");
    setSubject("");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileRead(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileRead(files[0]);
    }
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleAudioRead(files[0]);
    }
  };

  const handleFileRead = (file: File) => {
    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setImageData(base64);
        setPastedText(`[PDF Ready for Processing]\nFile: ${file.name}`);
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
        setFileType("pdf");
      };
      reader.readAsDataURL(file);
    } else if (file.name.endsWith(".ppt") || file.name.endsWith(".pptx") || file.type === "application/vnd.ms-powerpoint" || file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setImageData(base64);
        setPastedText(`[PPT Ready for Processing]\nFile: ${file.name}`);
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
        setFileType("ppt");
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImageData(base64);
        setPastedText(`[Image Ready for Processing]\nFile: ${file.name}`);
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
        setFileType("image");
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPastedText(content);
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
        setFileType("text");
      };
      reader.readAsText(file);
    }
  };

  const handleAudioRead = (file: File) => {
    if (file.type.startsWith("audio/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setAudioData(base64);
        setAudioFileName(file.name);
        setPastedText(`[Audio Ready for Processing]\nFile: ${file.name}`);
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
        setFileType("audio");

        const url = URL.createObjectURL(file);
        setRecordedAudioUrl(url);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid audio file.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !pastedText.trim() || !subject.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    // Store audio URL before submission for playback after upload
    if (fileType === "audio" && (recordedAudioUrl || audioData)) {
      setSubmittedAudioUrl(recordedAudioUrl || audioData);
      setSubmittedAudioFileName(audioFileName);
    }

    if (fileType === "pdf" || fileType === "image") {
      processImageMutation.mutate({
        imageData,
        title: title.trim(),
        subject: subject.trim(),
        isPDF: fileType === "pdf", // Note: The backend checks for PPT extension via title/filename if isPDF is false
        language: localStorage.getItem("velocity_language") || "English",
      });
    } else if (fileType === "audio") {
      createNoteMutation.mutate({
        title: title.trim(),
        content: pastedText.trim(),
        subject: subject.trim(),
        audioData: recordedAudioUrl || audioData,
      });
    } else {
      createNoteMutation.mutate({
        title: title.trim(),
        content: pastedText.trim(),
        subject: subject.trim(),
      });
    }
  };

  const isProcessing = processImageMutation.isPending || createNoteMutation.isPending;

  return (
    <Card className="relative overflow-hidden">
      {isProcessing && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4 p-6 bg-card border border-border rounded-xl shadow-lg animate-in fade-in zoom-in duration-300">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="space-y-1 text-center">
              <h3 className="text-lg font-semibold">{t("upload.processing")}</h3>
              <p className="text-muted-foreground">{t("upload.processing_desc")}</p>
              <p className="text-xs text-muted-foreground pt-2">{t("upload.processing_wait")}</p>
            </div>
          </div>
        </div>
      )}
      <CardContent className="p-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" data-testid="tab-upload">{t("upload.tab_upload")}</TabsTrigger>
            <TabsTrigger value="text" data-testid="tab-text">{t("upload.tab_text")}</TabsTrigger>
            <TabsTrigger value="audio" data-testid="tab-audio">{t("upload.tab_audio")}</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 md:p-12 text-center space-y-4 hover-elevate transition-all active:scale-[0.99] touch-manipulation ${isDragging ? "border-primary bg-primary/5" : "border-border"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
              data-testid="dropzone-unified"
            >
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">{t("upload.drag_drop_1")} <span className="text-primary font-bold">{t("upload.drag_drop_2")}</span></p>
                <p className="text-sm text-muted-foreground">
                  {t("upload.supported_files")}
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                id="file-upload"
                accept=".txt,.pdf,.ppt,.pptx,.doc,.docx,image/*"
                onChange={handleFileSelect}
              />
              <Button asChild data-testid="button-browse-unified" disabled={isProcessing} className="w-full md:w-auto h-12 text-base">
                <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center w-full h-full" onClick={(e) => e.stopPropagation()}>
                  <Upload className="h-5 w-5 mr-2" />
                  {t("upload.browse")}
                </label>
              </Button>
            </div>

            {imageData && (
              <div className="space-y-4 pt-4 border-t">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium">
                    {fileType === "pdf" && "📄 PDF file ready for processing"}
                    {fileType === "ppt" && "📊 Presentation ready for processing"}
                    {fileType === "image" && "🖼️ Image ready for processing"}
                    {fileType === "text" && "📝 Text file loaded"}
                  </p>
                  {imageData && (
                    <img src={imageData} alt="Preview" className="max-h-64 mx-auto rounded-md" />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">{t("upload.title_label")}</Label>
                  <Input
                    id="title"
                    placeholder={t("upload.title_placeholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-title"
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t("upload.subject_label")}</Label>
                  <Input
                    id="subject"
                    placeholder={t("upload.subject_placeholder")}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    data-testid="input-subject"
                    disabled={isProcessing}
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={!subject.trim() || !title.trim() || isProcessing}
                  onClick={handleSubmit}
                  data-testid="button-upload-file"
                >
                  {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isProcessing ? t("upload.processing") : (fileType === "pdf" || fileType === "ppt" || fileType === "image" ? t("upload.extract_process") : t("upload.upload_notes"))}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title-paste">{t("upload.title_label")}</Label>
              <Input
                id="title-paste"
                placeholder={t("upload.title_placeholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-title-paste"
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject-paste">{t("upload.subject_label")}</Label>
              <Input
                id="subject-paste"
                placeholder={t("upload.subject_placeholder")}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                data-testid="input-subject-paste"
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">{t("upload.content_label")}</Label>
              <Textarea
                id="content"
                placeholder={t("upload.content_placeholder")}
                className="min-h-[200px] resize-none"
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  setFileType("text");
                }}
                data-testid="textarea-paste"
                disabled={isProcessing}
              />
            </div>
            <Button
              className="w-full"
              disabled={!pastedText.trim() || !title.trim() || !subject.trim() || isProcessing}
              onClick={handleSubmit}
              data-testid="button-process-text"
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isProcessing ? "Uploading keys..." : t("upload.upload_notes")}
            </Button>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            {!recordedAudioUrl && !audioData && (
              <div className="space-y-4">
                {/* Upload Section */}
                <div>
                  <h3 className="text-sm font-semibold mb-4">{t("upload.upload_audio")}</h3>
                  <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center space-y-4 hover-elevate ${isDragging ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    data-testid="dropzone-audio-upload"
                  >
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Music className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">{t("upload.drag_audio")}</p>
                      <p className="text-sm text-muted-foreground">
                        Supported: MP3, WAV, M4A, OGG
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      id="audio-upload"
                      accept="audio/*"
                      onChange={handleAudioSelect}
                    />
                    <Button asChild data-testid="button-browse-audio" disabled={isProcessing}>
                      <label htmlFor="audio-upload" className="cursor-pointer">
                        <Music className="h-4 w-4 mr-2" />
                        {t("upload.browse_audio")}
                      </label>
                    </Button>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-background text-muted-foreground">or</span>
                  </div>
                </div>

                {/* Record Section */}
                <div>
                  <h3 className="text-sm font-semibold mb-4">{t("upload.record_audio")}</h3>
                  <div className="border border-border rounded-lg p-8 text-center space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">{t("upload.record_desc")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("upload.record_click")}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={startRecording}
                      className="gap-2"
                      data-testid="button-start-recording"
                      disabled={isProcessing}
                    >
                      <Mic className="h-5 w-5" />
                      {t("upload.start_recording")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isRecording && (
              <div className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-4 w-4 bg-destructive rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-sm font-medium">{t("upload.recording_progress")}</p>
                  <Button
                    variant="destructive"
                    onClick={stopRecording}
                    className="gap-2"
                    data-testid="button-stop-recording"
                  >
                    <Square className="h-4 w-4" />
                    {t("upload.stop_recording")}
                  </Button>
                </div>
              </div>
            )}

            {(recordedAudioUrl || audioData || submittedAudioUrl) && (
              <div className="space-y-4 pt-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium">🎵 Audio {isProcessing ? "uploading..." : "ready for processing"}</p>
                  {(audioFileName || submittedAudioFileName) && <p className="text-xs text-muted-foreground">{audioFileName || submittedAudioFileName}</p>}
                  <audio src={recordedAudioUrl || audioData || submittedAudioUrl} controls className="w-full rounded-md" data-testid="audio-player" />
                </div>

                {!submittedAudioUrl && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="audio-title">{t("upload.title_label")}</Label>
                      <Input
                        id="audio-title"
                        placeholder="e.g., Lecture on Quantum Physics"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        data-testid="input-audio-title"
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audio-subject">{t("upload.subject_label")}</Label>
                      <Input
                        id="audio-subject"
                        placeholder="e.g., Physics"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        data-testid="input-audio-subject"
                        disabled={isProcessing}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="w-full"
                        disabled={!subject.trim() || !title.trim() || isProcessing}
                        onClick={handleSubmit}
                        data-testid="button-upload-audio"
                      >
                        {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {isProcessing ? t("upload.processing") : "Upload & Transcribe"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearRecording}
                        data-testid="button-clear-recording"
                        disabled={isProcessing}
                      >
                        Clear
                      </Button>
                    </div>
                  </>
                )}

                {submittedAudioUrl && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Your audio is being transcribed. You can continue listening above.</p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSubmittedAudioUrl("");
                        setSubmittedAudioFileName("");
                      }}
                      data-testid="button-close-playback"
                    >
                      Close Playback
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
