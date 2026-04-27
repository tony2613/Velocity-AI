import Groq from "groq-sdk";
import axios from "axios";
import FormData from "form-data";
import sharp from "sharp";
import { geminiOCR, geminiChat } from "./gemini";
import { googleVisionOCR } from "./googleVision";

const OCR_API_KEY = process.env.OCR_API_KEY || "helloworld";
const OCR_TIMEOUT_MS = 300000;

console.log(`[OCR System] Gemini Key Detected: ${!!process.env.GEMINI_API_KEY}`);

async function tryExtractTextFromPdfParse(buf: Buffer): Promise<string> {
  try {
    // `pdf-parse` is CJS in many setups; dynamic import keeps it compatible here.
    const mod: any = await import("pdf-parse");
    const pdfParse = mod?.default ?? mod;
    if (typeof pdfParse !== "function") return "";
    const res = await pdfParse(buf);
    const text = (res?.text || "").trim();
    // If there is meaningful text, return it (avoids slow/size-limited OCR for non-scanned PDFs)
    return text.length >= 30 ? text : "";
  } catch {
    return "";
  }
}

// Serper.dev API for web research
const SERPER_API_KEY = process.env.SERPER_API_KEY || "";

function getGroq() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API key not configured. Get free key at https://console.groq.com");
  }
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

async function serperSearch(query: string): Promise<string[]> {
  try {
    if (!SERPER_API_KEY) {
      console.log("⚠️  Serper API not configured - research will use Groq-only mode");
      return [];
    }

    // Validate query - skip if it contains error messages or is too short
    if (!query || query.length < 3 || query.length > 200) {
      console.log(`Skipping search: query too short/long (${query.length} chars)`);
      return [];
    }

    // Clean the query
    const cleanQuery = query.replace(/[^\w\s]/g, " ").trim();

    console.log(`🔍 Searching via Serper for: "${cleanQuery}"`);
    
    const response = await axios.post('https://google.serper.dev/search', 
      { q: cleanQuery, num: 3 },
      {
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 5000,
        validateStatus: () => true
      }
    );

    if (response.status !== 200) {
      console.warn(`❌ Serper API error (${response.status}):`, response.data?.message || response.statusText);
      return [];
    }

    const results = response.data?.organic || [];
    if (results.length > 0) {
      console.log(`✅ Found ${results.length} Serper results`);
    }
    
    return results.map((item: any) => `${item.title}: ${item.snippet}`).slice(0, 3);
  } catch (error: any) {
    console.warn("❌ Serper search failed:", error.message);
    return [];
  }
}

async function callOcrSpaceBuffer(buf: Buffer, filename: string): Promise<string> {
  try {
    const form = new FormData();
    form.append("apikey", OCR_API_KEY);
    form.append("language", "eng");
    form.append("isOverlayRequired", "false");
    form.append("file", buf, { filename });

    const res = await axios.post("https://api.ocr.space/parse/image", form, {
      headers: form.getHeaders(),
      timeout: OCR_TIMEOUT_MS,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus: () => true,
    });

    if (res.status !== 200) {
      return `[OCR.space error: HTTP ${res.status}]`;
    }

    const data = res.data;
    if (data?.IsErroredOnProcessing) {
      const errorMsg = Array.isArray(data?.ErrorMessage) ? data.ErrorMessage.join("; ") : (data?.ErrorMessage || "Unknown OCR error");
      return `[OCR.space processing error: ${errorMsg}]`;
    }

    const parsed = data?.ParsedResults;
    const text = Array.isArray(parsed)
      ? parsed.map((p: any) => p?.ParsedText || "").join("\n\n").trim()
      : "";

    return text || "[No text detected]";
  } catch (error: any) {
    return `[OCR.space request failed: ${error.message}]`;
  }
}

async function callLocalPythonExtract(buf: Buffer, filename: string): Promise<string> {
  try {
    const form = new FormData();
    form.append("file", buf as any, { filename });

    const res = await axios.post("http://127.0.0.1:8000/extract", form, {
      headers: form.getHeaders(),
      timeout: 10 * 60 * 1000, // 10 minutes for large scanned PDFs
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus: () => true,
    });

    if (res.status !== 200) {
      return `[Python OCR error: HTTP ${res.status}]`;
    }

    const text = (res.data?.text || res.data?.result || "").toString();
    return text.trim() || "[No text extracted]";
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      return "[Python OCR service not reachable]";
    }
    return `[Python OCR request failed: ${error.message}]`;
  }
}

async function optimizeImageForOCR(buffer: Buffer): Promise<Buffer> {
  try {
    const img = sharp(buffer);
    const meta = await img.metadata();

    const small = await img.clone().resize(200).greyscale().raw().toBuffer();
    let avg = 0;
    for (let i = 0; i < small.length; i++) avg += small[i];
    avg = avg / small.length;

    const targetWidth = Math.min(2000, Math.max(1000, meta.width || 1200));
    let pipeline = img.resize({ width: targetWidth, withoutEnlargement: false });

    if (avg < 100) {
      pipeline = pipeline.flatten({ background: "#000000" }).negate().modulate({ brightness: 1.05, saturation: 0.0 });
    } else {
      pipeline = pipeline.modulate({ saturation: 0.0, brightness: 1.0 });
    }

    return await pipeline.jpeg({ quality: 80 }).toBuffer();
  } catch (error: any) {
    console.warn("Image optimization failed, using original:", error.message);
    return buffer;
  }
}

export async function extractTextFromImage(imageData: string | Buffer, filename: string = "image.png"): Promise<string> {
  try {
    let buffer: Buffer;
    if (typeof imageData === "string") {
      const base64Data = imageData.split(",")[1] || imageData;
      buffer = Buffer.from(base64Data, "base64");
    } else {
      buffer = imageData;
    }

    const optimizedBuffer = await optimizeImageForOCR(buffer);

    try {
      console.log("[OCR] Attempting Google Vision OCR (Primary)...");
      const result = await googleVisionOCR(optimizedBuffer);
      if (result && result.trim().length > 5) return result;
    } catch (e: any) {
      console.warn("[Google Vision] Image OCR failed, falling back to Gemini:", e.message);
    }

    try {
      if (process.env.GEMINI_API_KEY) {
        const mimeType = filename.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
        const result = await geminiOCR(optimizedBuffer, mimeType);
        if (result && result.length > 50) return result;
      }
    } catch (e: any) {
      console.warn("Gemini OCR failed, falling back:", e.message);
    }

    const pyText = await callLocalPythonExtract(optimizedBuffer, filename);
    if (pyText && !pyText.includes("[Python OCR service not reachable]") && !pyText.includes("[Python OCR error")) {
      return pyText;
    }

    return await callOcrSpaceBuffer(optimizedBuffer, filename);
  } catch (error: any) {
    console.error("Image extraction error:", error.message);
    return "[Failed to process image]";
  }
}

export async function extractTextFromPDF(pdfData: string | Buffer, filename: string = "document.pdf"): Promise<string> {
  try {
    let buffer: Buffer;
    if (typeof pdfData === "string") {
      const base64Data = pdfData.split(",")[1] || pdfData;
      buffer = Buffer.from(base64Data, "base64");
    } else {
      buffer = pdfData;
    }
    const parsedText = await tryExtractTextFromPdfParse(buffer);
    if (parsedText && parsedText.length > 500) {
      return parsedText;
    }

    // PDFs must be routed to Python because Google Vision REST API does not support PDF directly.
    // Python handles splitting the PDF into images first.
    console.log(`[OCR] Routing PDF (${Math.round(buffer.length/1024)} KB) to Python backend for High-Precision OCR...`);
    const pyText = await callLocalPythonExtract(buffer, filename);
    if (pyText && !pyText.includes("[Python OCR service not reachable]") && !pyText.includes("[Python OCR error")) {
      return pyText;
    }

    try {
      if (process.env.GEMINI_API_KEY) {
        console.log("[OCR] Falling back to Gemini for PDF...");
        const result = await geminiOCR(buffer, "application/pdf");
        if (result && result.trim().length > 10) return result;
      }
    } catch (e: any) {
      console.error("[Gemini] PDF OCR failed:", e.message);
    }

    return await callOcrSpaceBuffer(buffer, filename);
  } catch (error: any) {
    console.error("PDF extraction error:", error.message);
    return `[Error processing PDF: ${error.message}]`;
  }
}

export async function extractTextFromPPT(pptData: string | Buffer, filename: string = "presentation.pptx"): Promise<string> {
  try {
    let buffer: Buffer;
    if (typeof pptData === "string") {
      const base64Data = pptData.split(",")[1] || pptData;
      buffer = Buffer.from(base64Data, "base64");
    } else {
      buffer = pptData;
    }

    // Primary: Route to Python backend which uses python-pptx for proper extraction
    // (text, tables, charts, speaker notes, embedded images with OCR)
    console.log(`[PPT] Routing PPTX (${Math.round(buffer.length/1024)} KB) to Python backend for extraction...`);
    const pyText = await callLocalPythonExtract(buffer, filename);
    if (pyText && !pyText.includes("[Python OCR service not reachable]") && !pyText.includes("[Python OCR error") && pyText.trim().length > 20) {
      console.log(`[PPT] Python extraction successful: ${pyText.length} chars`);
      return pyText;
    }

    // Fallback: Try Gemini OCR if Python is unavailable
    try {
      if (process.env.GEMINI_API_KEY) {
        console.log("[PPT] Python unavailable, falling back to Gemini OCR...");
        const result = await geminiOCR(buffer, "application/vnd.openxmlformats-officedocument.presentationml.presentation");
        if (result && result.trim().length > 10) return result;
      }
    } catch (e: any) {
      console.warn("[PPT] Gemini OCR failed:", e.message);
    }

    // Last resort: OCR.space
    console.log("[PPT] Falling back to OCR.space...");
    return await callOcrSpaceBuffer(buffer, filename);
  } catch (error: any) {
    console.error("PPT extraction error:", error.message);
    return `[Error processing PPT: ${error.message}]`;
  }
}

export async function extractTextFromFile(fileData: string | Buffer, filename: string): Promise<string> {
  const name = (filename || "").toLowerCase();
  if (name.endsWith(".pdf")) return extractTextFromPDF(fileData, filename);
  if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".tiff") || name.endsWith(".bmp") || name.endsWith(".webp")) return extractTextFromImage(fileData, filename);
  
  const pdfResult = await extractTextFromPDF(fileData, filename);
  if (!pdfResult.includes("[⚠️")) return pdfResult;
  return extractTextFromImage(fileData, filename);
}

export async function generateSummary(
  text: string,
  language: string = "English",
  preferredModel: string = "llama-3.3-70b-versatile"
): Promise<{
  summary: string;
  keyPoints: string[];
  topicExplanations?: Record<string, string>;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}> {
  try {
    const maxTextLength = preferredModel.includes("gemini") ? 200000 : 100000;
    const truncatedText = text.length > maxTextLength ? text.substring(0, maxTextLength) + "...[truncated]" : text;
    console.log(`Generating summary using ${preferredModel} for ${truncatedText.length} characters in ${language}`);

    const systemPrompt = 
      `You are an expert university professor and lead examiner. Your task is to produce an exhaustive, accurate lesson and solution based SOLELY on the content the user provides.

      ⚠️ PRIME DIRECTIVE: Respond ONLY to what is in the text. If the document is about Biology, teach Biology. If History, teach History. If Accounting, solve the specific accounting problem presented. NEVER invent topics, examples, or questions not in the text.

      ⚠️ SUBJECT-SPECIFIC RULES:
      - ACCOUNTING & FINANCE: Identify the exact topic (e.g., P&L, Balance Sheet, Trial Balance, BRS, Bank Reconciliation, Cash Flow Statement, Depreciation, Ratio Analysis, Partnership Accounts, Company Accounts, etc.). Solve using the correct proforma for THAT specific topic. Show all workings in tables.
      - MATHEMATICS: Solve all problems step-by-step. Show every working line. Final answers must be clearly boxed.
      - SCIENCE: Cover theory, formulas, diagrams (text-based), and example problems.
      - HUMANITIES/THEORY: Provide comprehensive notes with key terminology, causes, effects, examples, and exam-ready points.

      ⚠️ MANDATORY RESPONSE STRUCTURE:
      ## 1. OVERVIEW
      (State the exact subject and list all specific topics/problems found in the text.)

      ## 2. LESSON_AND_SOLUTION
      (90% of the response. Exhaustively cover EVERY problem and topic in the document.
      - Solve EVERY question, calculation, or problem presented.
      - For multi-part questions, label each part clearly.
      - Do NOT skip any detail.)

      ## 3. TAKEAWAYS
      (The must-know answers, formulas, and key points from THIS document only.)

      CRITICAL: Be as detailed and verbose as needed. Only reference content from the provided text.
      IMPORTANT LANGUAGE RULE: You MUST write your entire response, all explanations, and all notes entirely in ${language}.`;

    const userPrompt = `Professor, analyse and solve EVERYTHING in this document text. Be exhaustive.\n\n${truncatedText}`;
    let summaryText = "";
    let totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    const callGemini = async (model: string) => {
      const m = model === "gemini-pro" ? "gemini-1.5-pro" : "gemini-1.5-flash";
      const res = await geminiChat([{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], m);
      return { content: res.content, usage: res.usage };
    };

    const callGroq = async (model: string) => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({
        model: model as any || "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        temperature: 0.1,
        max_tokens: 8192,
      });
      return { 
        content: res.choices[0]?.message?.content || "", 
        usage: { promptTokens: res.usage?.prompt_tokens || 0, completionTokens: res.usage?.completion_tokens || 0, totalTokens: res.usage?.total_tokens || 0 }
      };
    };

    try {
      if (preferredModel.includes("gemini")) {
        const res = await callGemini(preferredModel);
        summaryText = res.content;
        totalUsage = res.usage;
      } else {
        const res = await callGroq(preferredModel);
        summaryText = res.content;
        totalUsage = res.usage;
      }
    } catch (primaryError: any) {
      console.warn(`[Summarize] Primary model '${preferredModel}' failed: ${primaryError.message}. Attempting fallback...`);
      
      try {
        if (preferredModel.includes("gemini")) {
          console.log(`[Summarize] Falling back from Gemini to Llama...`);
          const res = await callGroq("llama-3.3-70b-versatile");
          summaryText = res.content;
          totalUsage = res.usage;
        } else {
          console.log(`[Summarize] Falling back from Llama to Gemini...`);
          const res = await callGemini("gemini-1.5-flash");
          summaryText = res.content;
          totalUsage = res.usage;
        }
      } catch (fallbackError: any) {
        console.error(`[Summarize] Fallback model also failed: ${fallbackError.message}`);
        
        const isRateLimit = (e: any) => {
          try {
            const msg = (typeof e === 'object' ? JSON.stringify(e) : String(e)).toLowerCase();
            return msg.includes('429') || msg.includes('rate limit') || msg.includes('too many requests') || e?.status === 429;
          } catch {
            return false;
          }
        };
        
        if (isRateLimit(primaryError) || isRateLimit(fallbackError)) {
             throw new Error("__GROQ_RATE_LIMIT__: The AI service is temporarily busy. Please wait 1-2 minutes and try again.");
        }
        throw primaryError; 
      }
    }

    const lines = summaryText.split("\n");
    const keyPoints = lines.filter(l => /^(\d+\.|[-•*])\s+/.test(l)).map(l => l.replace(/^(\d+\.|[-•*])\s+/, "").trim()).filter(p => p.length > 0).slice(0, 7);
    if (keyPoints.length === 0) keyPoints.push(summaryText.slice(0, 200).replace(/#/g, ""));

    const topicExplanations: Record<string, string> = {};
    const topics = keyPoints.slice(0, 4).map(p => {
      const match = p.match(/^([^:]+?)(?:\s*[:—]|$)/);
      return match ? match[1].trim() : p.split(" ").slice(0, 3).join(" ");
    });

    const searchPromises = topics.map(topic =>
      Promise.race([
        serperSearch(topic).then(results => ({ topic, results })),
        new Promise(resolve => setTimeout(() => resolve({ topic, results: [] }), 3000))
      ]) as Promise<{topic: string, results: string[]}>
    );

    const searchResults = await Promise.all(searchPromises);
    const searchMap: Record<string, string[]> = {};
    searchResults.forEach(r => searchMap[r.topic] = r.results);

    const researchPromises = topics.map(async (topic) => {
      try {
        const results = searchMap[topic] || [];
        const context = results.length > 0 ? `\n\nWeb results:\n${results.join("\n")}` : "";
        const rSys = "Expert educational research assistant. Clear, detailed 3-4 sentence explanations.";
        const rUsr = `Explain: "${topic}".${context}`;

        if (preferredModel.includes("gemini")) {
          const m = preferredModel === "gemini-pro" ? "gemini-1.5-pro" : "gemini-1.5-flash";
          const res = await geminiChat([{ role: "system", content: rSys }, { role: "user", content: rUsr }], m);
          topicExplanations[topic] = res.content.trim();
          totalUsage.promptTokens += res.usage.promptTokens;
          totalUsage.completionTokens += res.usage.completionTokens;
          totalUsage.totalTokens += res.usage.totalTokens;
        } else {
          const groq = getGroq();
          const res = await groq.chat.completions.create({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: rSys }, { role: "user", content: rUsr }], temperature: 0.7, max_tokens: 200 });
          topicExplanations[topic] = (res.choices[0].message.content || "").trim();
          totalUsage.promptTokens += res.usage?.prompt_tokens || 0;
          totalUsage.completionTokens += res.usage?.completion_tokens || 0;
          totalUsage.totalTokens += res.usage?.total_tokens || 0;
        }
      } catch (e) { console.warn(`Topic research failed: ${topic}`); }
    });

    await Promise.all(researchPromises);
    return { summary: summaryText, keyPoints, topicExplanations, usage: totalUsage };
  } catch (e: any) {
    console.error("Summary error:", e);
    throw e;
  }
}

export async function extractAndSummarize(fileData: string | Buffer, filename: string, preferredModel: string = "llama-3.3-70b-versatile") {
  try {
    const extracted = await extractTextFromFile(fileData, filename);
    
    // BEST-EFFORT MODE: Only block if ALL the text is an error message.
    // Partial page failures (e.g., one blank page in a 10-page doc) should not block the summary.
    const cleanedText = extracted
      .split("\n")
      .filter(line => !line.includes("[Python OCR failed") && !line.includes("ERROR ---") && !line.trim().startsWith("---"))
      .join("\n")
      .trim();

    const isCompleteFailure =
      cleanedText.length < 50 ||
      cleanedText.toLowerCase().includes("not reachable") ||
      cleanedText.toLowerCase().includes("[empty pdf]");

    if (isCompleteFailure) {
      console.warn(`[OCR Failure] Blocking summarization for ${filename}: No usable text found.`);
      return {
        extracted,
        summary: "Unable to generate summary: No readable text could be extracted from this document. Please ensure the document is a clear, non-encrypted PDF or image.",
        keyPoints: [],
        error: "No readable text extracted."
      };
    }

    const res = await generateSummary(cleanedText, "English", preferredModel);
    return { extracted, ...res };
  } catch (e: any) {
    return { extracted: "", summary: "", keyPoints: [], error: e.message };
  }
}
