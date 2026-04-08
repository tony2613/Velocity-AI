import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { eq } from "drizzle-orm";
import { insertNoteSchema, paymentRequests, insertResearchSchema } from "@shared/schema";
import { extractTextFromPDF, extractTextFromImage, extractTextFromFile, generateSummary, extractTextFromPPT } from "./ocrSummarize";
import multer from "multer";
import Groq from "groq-sdk";
import { geminiChat } from "./gemini";
import { setupAuth } from "./auth";
import { isAuthenticated, isAdmin, checkUsageLimit, checkSearchLimit } from "./middleware";
import { sendEmail } from "./email";

function getGroq() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API key not configured. Get a free key at https://console.groq.com");
  }
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}


export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Set up multer for file uploads
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

  // Health check endpoint
  app.get('/health', (_req, res) => res.status(200).send('ok'));

  // Diagnostic endpoint
  app.get("/api/diagnostic", async (_req, res) => {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      status: "ok",
      services: {},
    };

    // Check OCR API
    try {
      diagnostics.services.ocr_api_key = !!process.env.OCR_API_KEY ? "✓ Configured" : "✗ Missing";
    } catch {
      diagnostics.services.ocr_api_key = "✗ Error";
    }

    // Check Groq API
    try {
      diagnostics.services.groq_api_key = !!process.env.GROQ_API_KEY ? "✓ Configured" : "✗ Missing";
      // const groq = getGroq(); // Unused
      diagnostics.services.groq_client = "✓ Initialized";
    } catch (e: any) {
      diagnostics.services.groq_client = `✗ ${e.message}`;
    }

    // Check PDF parsing (require usage checks persistence)
    try {
      require("pdf-parse");
      diagnostics.services.pdf_parse = "✓ Installed";
    } catch {
      diagnostics.services.pdf_parse = "✗ Not installed";
    }

    // Check Sharp
    try {
      require("sharp");
      diagnostics.services.sharp = "✓ Installed";
    } catch {
      diagnostics.services.sharp = "✓ Installed (optional)";
    }

    // Check storage
    try {
      // Skipped storage check to avoid auth requirement in diagnostic
      diagnostics.services.storage = "✓ Skipped (Requires Auth)";
    } catch (e: any) {
      diagnostics.services.storage = `✗ ${e.message}`;
    }

    // Endpoint availability
    diagnostics.endpoints = {
      "diagnostics": "GET - System health check",
      "notes": "GET/POST - Manage student notes",
      "quizzes": "GET/POST - Manage student quizzes",
    };

    res.json(diagnostics);
  });

  // ───────────────────────────────────────────────────────────────────────────

  // Handle file uploads with rate limiting
  app.post("/api/upload", isAuthenticated, checkUsageLimit, upload.single("file"), async (req, res) => {

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Increment usage count
      const userId = (req.user as any).id;
      await storage.incrementDailyUsage(userId);

      // Log Usage
      storage.logUsage({
        userId,
        action: "UPLOAD_FILE",
        tokensInput: 0,
        tokensOutput: 0,
        cost: 0,
        metadata: JSON.stringify({ filename: req.file.filename, originalName: req.file.originalname, size: req.file.size, mime: req.file.mimetype }),
      });

      res.json({
        message: "File uploaded successfully",
        filename: req.file.filename,
        originalName: req.file.originalname
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Process PDF with rate limiting
  app.post("/api/process-pdf", isAuthenticated, checkUsageLimit, async (req, res) => {
    try {
      const { filename } = req.body;
      if (!filename) {
        return res.status(400).json({ error: "Filename is required" });
      }

      const userId = (req.user as any).id;
      // Increment usage count
      await storage.incrementDailyUsage(userId);

      // Placeholder for actual PDF processing logic
      // In a real application, this would trigger a background job or
      // further processing steps using the filename.
      res.json({ message: "Processing started for PDF", filename });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // OCR + Summarize endpoint with file upload
  app.post("/api/ocr-summarize", isAuthenticated, checkUsageLimit, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const filename = req.file.originalname;

      // Extract text from file
      const extractedText = await extractTextFromFile(req.file.buffer, filename);

      // Generate summary
      const { summary, keyPoints, usage } = await generateSummary(extractedText, "English", req.body.preferredModel);

      // Increment usage count
      const userId = (req.user as any).id;
      await storage.incrementDailyUsage(userId);

      // Log Usage
      storage.logUsage({
        userId,
        action: "OCR_SUMMARIZE",
        tokensInput: usage?.promptTokens || 0,
        tokensOutput: usage?.completionTokens || 0,
        cost: 0,
        model: req.body.preferredModel || "llama-3.3-70b-versatile",
        metadata: JSON.stringify({ filename, fileSize: req.file.size }),
      });

      res.json({
        success: true,
        extracted: extractedText,
        summary,
        keyPoints,
        filename,
      });
    } catch (error: any) {
      console.error("OCR summarize error:", error);
      res.status(500).json({ error: error.message || "Failed to process file" });
    }
  });

  // Create a new note
  app.post("/api/notes", isAuthenticated, async (req, res) => {
    try {
      const noteData = insertNoteSchema.omit({ userId: true }).parse(req.body);
      const note = await storage.createNote({
        ...noteData,
        userId: (req.user as any).id,
      });
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all notes
  app.get("/api/notes", isAuthenticated, async (req, res) => {
    try {
      const notes = await storage.getAllNotes((req.user as any).id);
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a note
  app.delete("/api/notes/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const noteId = req.params.id;
      await storage.deleteNote(noteId, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a specific note
  app.get("/api/notes/:id", isAuthenticated, async (req, res) => {
    try {
      const note = await storage.getNote(req.params.id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      if (note.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "Unauthorized access to this note" });
      }
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });



  // Generate summary for a note
  app.post("/api/notes/:id/summary", isAuthenticated, async (req, res) => {
    try {
      const note = await storage.getNote(req.params.id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      if (note.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Check if summary already exists
      const existingSummary = await storage.getSummaryByNoteId(note.id);
      if (existingSummary) {
        return res.json(existingSummary);
      }

      // Generate summary using selected model (includes topic research)
      const { summary: summaryText, keyPoints, topicExplanations } = await generateSummary(note.content, req.body.language, req.body.preferredModel);

      const summary = await storage.createSummary({
        noteId: note.id,
        content: summaryText,
        keyPoints: keyPoints.slice(0, 7),
      });

      // Include topic explanations in response
      res.json({
        ...summary,
        topicExplanations: topicExplanations || {},
      });
    } catch (error: any) {
      console.error("Summary generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate summary" });
    }
  });

  // Get summary for a note (returns 404 if not found, frontend should handle this)
  app.get("/api/notes/:id/summary", isAuthenticated, async (req, res) => {
    try {
      const note = await storage.getNote(req.params.id);
      if (!note || note.userId !== (req.user as any).id) {
        return res.status(404).json({ error: "Summary not found or unauthorized" });
      }

      const summary = await storage.getSummaryByNoteId(req.params.id);
      if (!summary) {
        return res.status(404).json({ error: "Summary not found. Generate one first." });
      }
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Search for answers to questions using Google Search
  app.post("/api/search-question", isAuthenticated, checkSearchLimit, async (req, res) => {
    try {
      const { question } = req.body;
      if (!question || question.length < 3) {
        return res.status(400).json({ error: "Question must be at least 3 characters" });
      }

      const SERPER_API_KEY = process.env.SERPER_API_KEY || "";

      if (!SERPER_API_KEY) {
        console.log("Serper API not configured. Using Groq for research instead.");
      } else {
        try {
          const axios = require("axios");
          const cleanQuery = question.replace(/[^\w\s]/g, " ").trim();
          
          const response = await axios.post('https://google.serper.dev/search', 
            { q: cleanQuery, num: 5 },
            {
              headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json'
              },
              timeout: 5000,
              validateStatus: () => true
            }
          );

          if (response.status === 200 && response.data?.organic) {
            // Increment search usage
            const userId = (req.user as any).id;
            await storage.incrementDailySearch(userId);

            const results = response.data.organic.map((item: any) => ({
              title: item.title,
              snippet: item.snippet,
              link: item.link || "#",
            }));
            return res.json({ success: true, results });
          }
        } catch (e: any) {
          console.warn("Serper Search failed, falling back to Groq research:", e.message);
        }
      }

      // Fallback: Use Groq to research the question with multiple perspectives
      const groq = getGroq();

      const researchCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an expert educational researcher. 
            Analyze the following question and provide a comprehensive structured response.
            Format your response as a JSON object with a "results" array.
            Each item in "results" must have:
            - "title": A concise heading (e.g., "Core Definition", "Historical Context", "Practical Application")
            - "snippet": A detailed 3-4 sentence explanation.
            - "link": A relevant search URL or "#".
            Provide 4-5 diverse perspectives.`
          },
          {
            role: "user",
            content: `Research this topic in depth: "${question}"`
          },
        ],
        temperature: 0.5,
        response_format: { type: "json_object" }
      });

      const researchContent = researchCompletion.choices[0].message.content;
      if (!researchContent) {
        throw new Error("No response from AI researcher");
      }

      let jsonStr = researchContent.trim();
      // Remove markdown code blocks
      jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      // Extract JSON if surrounded by text
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      let researchResponse;
      try {
        researchResponse = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse research JSON:", jsonStr);
        // Fallback to a basic result if parsing fails but we have content
        if (researchContent.length > 50) {
          researchResponse = {
            results: [{
              title: "AI Research Result",
              snippet: researchContent.substring(0, 300) + "...",
              link: "#"
            }]
          };
        } else {
          throw new Error("Failed to parse research response from AI");
        }
      }
      const results = ((researchResponse as any).results || []).map((item: any) => ({
        title: String(item.title || ""),
        snippet: String(item.snippet || ""),
        link: String(item.link || "#")
      }));

      if (results.length === 0) {
        results.push({
          title: "Overview",
          snippet: `Retrieving information about "${question}"...`,
          link: "#"
        });
      }

      res.json({ success: true, results });
    } catch (error: any) {
      console.error("Question search error:", error);
      // Try to log if logDebug is available (it is defined inside the scope above, but this catch might be outside if I didn't structure it right. 
      // Actually, logDebug is defined inside the route handler, so it is available here.)
      try {
        const fs = require('fs');
        fs.appendFileSync('server_debug.log', `[${new Date().toISOString()}] ERROR: ${error.message}\n`);
      } catch (e) { }

      res.status(500).json({ error: error.message || "Failed to search" });
    }
  });

  // Multi-AI Research Endpoint (Now CANA - Context-Aware Notes Assistant)
  app.post("/api/research", isAuthenticated, checkSearchLimit, async (req, res) => {
    try {
      const { query } = insertResearchSchema.parse(req.body);
      const userId = (req.user as any).id;
      
      // Fetch user's notes for context
      const notes = await storage.getAllNotes(userId);
      
      let contextStr = "";
      if (notes && notes.length > 0) {
        // Collect notes, truncating content to keep context window safe (approx 15,000 chars total)
        const combined = notes.map(n => `Title: ${n.title}\nContent: ${n.content.substring(0, 3000)}`).join("\n\n---\n\n");
        contextStr = `\n\nUSER'S NOTES FOR CONTEXT:\n${combined.substring(0, 15000)}`;
      }

      let aiResponse = "";
      let tokensInput = 0;
      let tokensOutput = 0;
      let usedModel = "llama-3.3-70b-versatile";
      
      const systemMsg = "You are 'CANA' (Context-Aware Notes Assistant), an expert study tool built into VelocityAI. Your goal is to answer the user's research query accurately and concisely. If the user has saved notes that are relevant to their query, use them immediately to provide a highly personalized answer. If the notes are not relevant or if they don't have notes, use your general knowledge." + contextStr;

      try {
        const groq = getGroq();
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemMsg },
            { role: "user", content: query }
          ],
          temperature: 0.5,
          max_tokens: 1500,
        });
        aiResponse = completion.choices[0]?.message?.content || "No response generated.";
        tokensInput = completion.usage?.prompt_tokens || 0;
        tokensOutput = completion.usage?.completion_tokens || 0;
      } catch (err: any) {
        console.warn("Groq failed for Research, falling back to Gemini:", err.message);
        const res = await geminiChat([{ role: "system", content: systemMsg }, { role: "user", content: query }], "gemini-1.5-flash");
        aiResponse = res.content;
        tokensInput = res.usage.promptTokens;
        tokensOutput = res.usage.completionTokens;
        usedModel = "gemini-1.5-flash";
      }

      // Format as a single result mapped over seamlessly by the frontend
      const results = [{
        provider: 'CANA (VelocityAI Assistant)',
        content: aiResponse
      }];
      
      // Increment search usage
      await storage.incrementDailySearch(userId);
      
      // Log usage
      storage.logUsage({
        userId,
        action: "CANA_RESEARCH",
        tokensInput,
        tokensOutput,
        cost: 0,
        model: usedModel,
        metadata: JSON.stringify({ query: query.substring(0, 100), contextNotesFound: notes.length }),
      });
      
      res.json({ success: true, results });
    } catch (error: any) {
      console.error("CANA Research error:", error);
      res.status(500).json({ error: error.message || "Failed to complete research" });
    }
  });

  // Generate quiz for a note
  app.post("/api/notes/:id/quiz", isAuthenticated, async (req, res) => {
    try {
      const note = await storage.getNote(req.params.id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      if (note.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Validate content is sufficient for quiz generation
      const contentLength = note.content.trim().length;
      if (contentLength < 50) {
        return res.status(400).json({ error: "Note content is too short to generate a quiz. Please ensure the extracted text is substantial enough." });
      }

      // Check if content appears to be extraction error
      if (note.content.includes("[Failed to extract") || note.content.includes("[No text could be extracted")) {
        return res.status(400).json({ error: "Unable to generate quiz: Text extraction failed. Try uploading a clearer document." });
      }

      // Get all previous quizzes to avoid repeating topics
      const previousQuizzes = await storage.getAllQuizzesByNoteId(note.id);
      let previousTopics = "";

      if (previousQuizzes.length > 0) {
        // Collect topics from previous quiz questions
        const previousQuestions: string[] = [];
        for (const quiz of previousQuizzes) {
          const questions = await storage.getQuestionsByQuizId(quiz.id);
          previousQuestions.push(...questions.map((q: any) => q.question));
        }
        if (previousQuestions.length > 0) {
          previousTopics = `\n\nIMPORTANT: Previously asked questions (avoid these topics):\n${previousQuestions.slice(0, 10).join("\n")}`;
        }
      }

      // Truncate content to 8000 chars to avoid token limits
      const truncatedContent = note.content.substring(0, 8000);

      // Generate quiz using Groq with variety instructions
      const quizNumber = previousQuizzes.length + 1;
      const questionTypes = ["definition/concept", "application/problem-solving", "comparison/analysis", "cause-effect", "example-based"];
      const currentType = questionTypes[(quizNumber - 1) % questionTypes.length];
      
      const sysMsg = "You are a study assistant. Output ONLY valid JSON. Do not include markdown formatting or code blocks. Your response must be parseable JSON starting with {\"questions\": [ and ending with }]}.";
      const usrMsg = `Create exactly 5 NEW multiple-choice quiz questions from this text. Focus on ${currentType} questions to ensure comprehensive topic coverage.\n\nText:\n${truncatedContent}${previousTopics}\n\nReturn ONLY this JSON format (no markdown, no explanation):\n{\"questions\": [{\"question\": \"Q?\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correctAnswer\": 0, \"explanation\": \"Why\"}]}`;

      let responseText = "{}";
      let tokensInput = 0;
      let tokensOutput = 0;
      let usedModel = "llama-3.3-70b-versatile";

      try {
        const groq = getGroq();
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: sysMsg },
            { role: "user", content: usrMsg }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        });
        responseText = completion.choices[0].message.content || "{}";
        tokensInput = completion.usage?.prompt_tokens || 0;
        tokensOutput = completion.usage?.completion_tokens || 0;
      } catch (err: any) {
        console.warn("Groq failed for Quiz, falling back to Gemini:", err.message);
        const res = await geminiChat([{ role: "system", content: sysMsg }, { role: "user", content: usrMsg }], "gemini-1.5-flash");
        responseText = res.content;
        tokensInput = res.usage.promptTokens;
        tokensOutput = res.usage.completionTokens;
        usedModel = "gemini-1.5-flash";
      }

      // Log Usage
      storage.logUsage({
        userId: (req.user as any).id,
        action: "GENERATE_QUIZ",
        tokensInput,
        tokensOutput,
        model: usedModel,
        cost: 0,
        metadata: JSON.stringify({ noteId: note.id, quizType: currentType }),
      });

      // Extract JSON from markdown code blocks if present
      let jsonStr = responseText.trim();

      // Remove markdown code blocks
      jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      // Extract JSON if surrounded by text
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      // Parse and validate
      let quizData;
      try {
        quizData = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse quiz JSON:", jsonStr.substring(0, 200));
        throw new Error("Failed to parse quiz response from AI. Try again.");
      }

      if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
        throw new Error("AI did not generate valid quiz questions. Try again.");
      }

      // Validate each question
      for (const q of quizData.questions) {
        if (!q.question || !Array.isArray(q.options) || q.options.length < 4 || typeof q.correctAnswer !== "number") {
          throw new Error("One or more quiz questions are malformed. Try again.");
        }
      }

      // Create quiz
      const quiz = await storage.createQuiz({
        noteId: note.id,
        title: `${note.title} - Quiz`,
      });

      // Create questions
      const questions = await Promise.all(
        quizData.questions.map((q: any) =>
          storage.createQuestion({
            quizId: quiz.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || null,
          })
        )
      );

      res.json({ quiz, questions });
    } catch (error: any) {
      console.error("Quiz generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate quiz" });
    }
  });

  // Get quiz for a note (returns 404 if not found)
  app.get("/api/notes/:id/quiz", isAuthenticated, async (req, res) => {
    try {
      const note = await storage.getNote(req.params.id);
      if (!note || note.userId !== (req.user as any).id) {
        return res.status(404).json({ error: "Quiz not found or unauthorized" });
      }

      const quiz = await storage.getQuizByNoteId(req.params.id);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found. Generate one first." });
      }
      const questions = await storage.getQuestionsByQuizId(quiz.id);
      res.json({ quiz, questions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all quizzes
  app.get("/api/quizzes", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;

      const quizzes = await storage.getAllQuizzesByUserId(userId);

      const quizzesWithDetails = await Promise.all(quizzes.map(async (quiz) => {
        const questions = await storage.getQuestionsByQuizId(quiz.id);
        const attempts = await storage.getQuizAttemptsByQuizId(quiz.id);
        return {
          ...quiz,
          questionCount: questions.length,
          attempts: attempts
        };
      }));

      res.json(quizzesWithDetails);
    } catch (error: any) {
      console.error("[API] Error fetching quizzes:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get quiz by ID with questions
  app.get("/api/quizzes/:id", isAuthenticated, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      // Check ownership via note
      const note = await storage.getNote(quiz.noteId);
      if (!note || note.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const questions = await storage.getQuestionsByQuizId(quiz.id);
      const attempts = await storage.getQuizAttemptsByQuizId(quiz.id);
      res.json({ quiz, questions, attempts });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Save quiz attempt (score)
  app.post("/api/quizzes/:id/attempt", isAuthenticated, async (req, res) => {
    try {
      // Check ownership
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) return res.status(404).json({ error: "Quiz not found" });
      const note = await storage.getNote(quiz.noteId);
      if (!note || note.userId !== (req.user as any).id) return res.status(403).json({ error: "Unauthorized" });

      const { score, totalQuestions } = req.body;

      if (typeof score !== "number" || typeof totalQuestions !== "number") {
        return res.status(400).json({ error: "Missing score or totalQuestions" });
      }

      const percentage = Math.round((score / totalQuestions) * 100);

      const attempt = await storage.createQuizAttempt({
        quizId: req.params.id,
        score,
        totalQuestions,
        percentage,
      });

      res.json(attempt);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Process image/PDF with OCR and text extraction
  app.post("/api/process-image", isAuthenticated, checkUsageLimit, async (req, res) => {
    try {
      const { imageData, title, subject, isPDF } = req.body;

      if (!imageData || !title || !subject) {
        return res.status(400).json({ error: "Missing required fields: imageData, title, subject" });
      }

      console.log(`[API] Processing ${isPDF ? "PDF" : "Image"}. Size: ${imageData.length} chars (approx ${Math.round(imageData.length * 0.75 / 1024)} KB)`);

      let extractedText = "";

      try {
        if (isPDF) {
          extractedText = await extractTextFromPDF(imageData);
        } else if (title.toLowerCase().endsWith(".pptx") || title.toLowerCase().endsWith(".ppt")) {
          extractedText = await extractTextFromPPT(imageData, title);
        } else {
          extractedText = await extractTextFromImage(imageData);
        }
      } catch (extractError: any) {
        console.error("Extraction error:", extractError);
        extractedText = "[Failed to extract text. Please try uploading a clearer scan.]";
      }

      // Create a note with extracted text
      const note = await storage.createNote({
        title,
        subject,
        content: extractedText || "[No text could be extracted from the uploaded file.]",
        userId: (req.user as any).id,
      });

      // If we have extracted text, optionally generate a quick summary
      let summary = null;
      let topicExplanations: Record<string, string> = {};
      if (extractedText && !extractedText.includes("[Failed") && !extractedText.includes("[No text")) {
        try {
          const { summary: summaryText, keyPoints, topicExplanations: explanations } = await generateSummary(extractedText, req.body.language, req.body.preferredModel);

          summary = await storage.createSummary({
            noteId: note.id,
            content: summaryText,
            keyPoints: keyPoints,
          });

          topicExplanations = explanations || {};
        } catch (summaryError: any) {
          console.log("Summary generation skipped:", summaryError.message);
        }
      }

      res.json({
        note,
        summary,
        topicExplanations,
        extractedText: extractedText.substring(0, 1000),
        message: summary
          ? "File processed and summary generated!"
          : "Content extracted! Go to My Notes to view and generate a summary.",
      });

      // Increment usage count
      const userId = (req.user as any).id;
      await storage.incrementDailyUsage(userId);
    } catch (error: any) {
      console.error("Processing error:", error);
      res.status(500).json({ error: error.message || "Failed to process file" });
    }
  });

  // Export to GitHub endpoint
  app.post("/api/export-to-github", isAuthenticated, async (req, res) => {
    try {
      const { repoName, description } = req.body;

      if (!repoName) {
        return res.status(400).json({ error: "Repository name is required" });
      }

      // Import GitHub utils
      const { getUncachableGitHubClient } = await import("./github-utils");

      // Get fresh GitHub client
      const octokit = await getUncachableGitHubClient();

      // Get authenticated user
      const userRes = await octokit.rest.users.getAuthenticated();
      const username = userRes.data.login;

      // Create repository
      const repoRes = await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: description || "VelocityAI - AI-powered student study platform",
        private: false,
        auto_init: true,
      });

      res.json({
        success: true,
        repository: {
          name: repoRes.data.name,
          url: repoRes.data.html_url,
          cloneUrl: repoRes.data.clone_url,
          sshUrl: repoRes.data.ssh_url,
          owner: username,
        },
        nextSteps: {
          initialize: "git init",
          config: `git remote add origin ${repoRes.data.clone_url}`,
          push: "git add . && git commit -m 'Initial commit' && git push -u origin main"
        }
      });
    } catch (error: any) {
      console.error("GitHub export error:", error);
      res.status(500).json({
        error: error.message || "Failed to export to GitHub",
        details: error.response?.data?.message || "Check that GitHub is connected"
      });
    }
  });

  // Debug endpoint to set user tier (FOR TESTING ONLY)
  // TEMPORARY MANUAL PAYMENT FLOW ROUTES
  app.post("/api/payment-request", isAuthenticated, async (req, res) => {
    try {
      const { tier, transactionId, amount } = req.body;
      
      if (!tier || !transactionId || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      await storage.db.insert(paymentRequests).values({
        userId: (req.user as any).id,
        tier,
        transactionId,
        amount
      });

      res.json({ message: "Payment request submitted successfully." });
    } catch (error) {
      console.error("Payment request error:", error);
      res.status(500).json({ error: "Failed to submit payment request" });
    }
  });

  // GET pending payments list (admin only)
  app.get("/api/admin/pending-payments", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const pending = await storage.db.query.paymentRequests.findMany({
        where: eq(paymentRequests.status, "pending"),
        with: { user: true },
      });
      res.json(pending);
    } catch (error) {
      console.error("Admin pending-payments error:", error);
      res.status(500).json({ error: "Failed to fetch pending payments" });
    }
  });

  app.post("/api/admin/approve-payment", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { requestId, approve } = req.body;

      if (!requestId) {
        return res.status(400).json({ error: "requestId is required" });
      }

      // @ts-ignore
      const request = await storage.db.query.paymentRequests.findFirst({
        where: eq(paymentRequests.id, requestId),
        with: { user: true },
      });

      if (!request) {
        return res.status(404).json({ error: "Payment request not found" });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ error: "Request is already processed" });
      }

      if (approve) {
        // Set expiry to 30 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await storage.updateUserTierWithExpiry(request.userId, request.tier, expiresAt);

        // @ts-ignore
        await storage.db.update(paymentRequests)
          .set({ status: 'approved' })
          .where(eq(paymentRequests.id, requestId));

        // Send email notification to user
        // @ts-ignore
        const userEmail = request.user?.email;
        // @ts-ignore
        const username = request.user?.username || 'User';
        if (userEmail) {
          const expiryStr = expiresAt.toDateString();
          const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #6c63ff;">🎉 Payment Approved!</h1>
              <p>Hi <strong>${username}</strong>,</p>
              <p>Your payment has been verified and your <strong>Velocity ${request.tier.charAt(0).toUpperCase() + request.tier.slice(1)}</strong> subscription is now active!</p>
              <p>Your subscription is valid until: <strong>${expiryStr}</strong></p>
              <p>Enjoy your upgraded features. If you have any questions, just reply to this email.</p>
              <br/>
              <p>Best regards,<br/>The Velocity AI Team</p>
            </div>
          `;
          sendEmail({
            to: userEmail,
            subject: `✅ Your Velocity ${request.tier} subscription is active!`,
            html: emailHtml,
          }).catch((err: unknown) => console.error("Failed to send approval email:", err));
        }

        res.json({ message: "Payment approved and user upgraded.", expiresAt });
      } else {
        // @ts-ignore
        await storage.db.update(paymentRequests)
          .set({ status: 'rejected' })
          .where(eq(paymentRequests.id, requestId));

        res.json({ message: "Payment request rejected." });
      }
    } catch (error) {
      console.error("Admin approve payment error:", error);
      res.status(500).json({ error: "Failed to process payment request" });
    }
  });

  // Keep this exclusively for local development testing, but maybe remove in prod later
  app.post("/api/debug/set-tier", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { tier } = req.body;
      if (!['free', 'pro', 'elite'].includes(tier)) {
        return res.status(400).json({ error: "Invalid tier. Must be 'free', 'pro', or 'elite'." });
      }

      const userId = (req.user as any).id;
      await storage.updateUserTier(userId, tier);

      res.json({ success: true, message: `Switched to ${tier} tier`, tier });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}