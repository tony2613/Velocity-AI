import Groq from "groq-sdk";
import axios from "axios";
import FormData from "form-data";
import sharp from "sharp";

// Load API keys from environment or use defaults
const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY || "";
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || "";

function getGroq() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API key not configured. Get free key at https://console.groq.com");
  }
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

// Google Search function for web research
async function googleSearch(query: string): Promise<string[]> {
  try {
    if (!GOOGLE_SEARCH_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
      console.log("⚠️  Google Search API not configured - install will use Groq-only research");
      return [];
    }

    // Validate query - skip if it contains error messages or is too short
    if (!query || query.length < 3 || query.length > 200) {
      console.log(`Skipping Google Search: query too short/long (${query.length} chars)`);
      return [];
    }

    // Skip if query looks like an error message
    if (query.includes("[") || query.includes("Failed") || query.includes("could not") || query.includes("extract")) {
      console.log("Skipping Google Search: query appears to be error message");
      return [];
    }

    // Clean the query - remove special characters that might cause 400 errors
    const cleanQuery = query.replace(/[^\w\s]/g, " ").trim().split(/\s+/).slice(0, 8).join(" ");

    if (cleanQuery.length < 3) {
      console.log("Skipping Google Search: cleaned query too short");
      return [];
    }

    console.log(`🔍 Searching Google for: "${cleanQuery}"`);
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(cleanQuery)}&key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&num=3`;

    const response = await axios.get(url, {
      timeout: 5000,
      validateStatus: () => true // Don't throw on any status code
    });

    if (response.status !== 200) {
      if (response.status === 403) {
        console.warn("⚠️  Google Search API 403 (Quota/Permission): Disabling search for this request.");
        return [];
      }
      console.warn(`❌ Google Search API error (${response.status}):`, response.data?.error?.message || response.statusText);
      return [];
    }

    const results = response.data?.items || [];
    if (results.length > 0) {
      console.log(`✅ Found ${results.length} Google Search results`);
    }
    return results.map((item: any) => `${item.title}: ${item.snippet}`).slice(0, 3);
  } catch (error: any) {
    console.warn("❌ Google Search failed:", error.message);
    return [];
  }
}

// OCR.space API call removed (unused)

// Helper to call Python service
async function callPythonOCR(fileBuffer: Buffer, filename: string): Promise<string> {
  try {
    const form = new FormData();
    form.append("file", fileBuffer as any, { filename });

    const res = await axios.post("http://127.0.0.1:8000/extract", form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 300000, // 5 minutes - OCR can take a while for large files
    });

    const text = res.data.text || "";
    if (!text.trim()) {
      return "[No text extracted by Python service]";
    }
    return text;
  }
  catch (error: any) {
    console.error("Python Service Error:", error.message);

    // Log detailed Python error if available
    if (error.response?.data) {
      console.error("Python Stack Trace/Detail:", JSON.stringify(error.response.data, null, 2));
      const pythonError = error.response.data.error || JSON.stringify(error.response.data);
      return `[Python Error: ${pythonError}]`;
    }

    if (error.code === 'ECONNREFUSED') {
      return "[Error: Python Extraction Service is not reachable. Ensure 'main.py' is running.]";
    }
    if (error.code === 'ECONNRESET' || error.message?.includes('socket hang up')) {
      return "[Error: Connection to Python service was lost. The file may be too large or the service crashed. Please try again.]";
    }
    if (error.code === 'ECONNABORTED') {
      return "[Error: Python service timed out processing the file. The file may be too complex. Please try a smaller file.]";
    }
    return `[Error calling Extraction service: ${error.message}]`;
  }
}

// Optimize image for OCR (grayscale, resize, contrast)
async function optimizeImageForOCR(buffer: Buffer): Promise<Buffer> {
  try {
    const img = sharp(buffer);
    const meta = await img.metadata();

    // Check brightness to see if we should invert (e.g. dark mode screenshots)
    const small = await img.clone().resize(200).greyscale().raw().toBuffer();
    let avg = 0;
    for (let i = 0; i < small.length; i++) avg += small[i];
    avg = avg / small.length;

    const targetWidth = Math.min(2000, Math.max(1000, meta.width || 1200));

    let pipeline = img.resize({ width: targetWidth, withoutEnlargement: false });

    // If dark background (avg < 100), invert to make it black-on-white for better OCR
    if (avg < 100) {
      console.log("OCR Preprocess: Dark background detected, inverting image.");
      pipeline = pipeline
        .flatten({ background: "#000000" })
        .negate()
        .modulate({ brightness: 1.05, saturation: 0.0 }); // Grayscale + brighten
    } else {
      // Light background: just grayscale and slight contrast
      pipeline = pipeline.modulate({ saturation: 0.0, brightness: 1.0 }); // Grayscale
    }

    return await pipeline.png().toBuffer();
  } catch (error: any) {
    console.warn("Image optimization failed, using original:", error.message);
    return buffer;
  }
}

// Extract text from image (base64 or buffer) -> delegates to Python
export async function extractTextFromImage(imageData: string | Buffer, filename: string = "image.png"): Promise<string> {
  try {
    let buffer: Buffer;
    if (typeof imageData === "string") {
      const base64Data = imageData.split(",")[1] || imageData;
      buffer = Buffer.from(base64Data, "base64");
    } else {
      buffer = imageData;
    }

    // Preprocess image for better OCR results
    const optimizedBuffer = await optimizeImageForOCR(buffer);

    return await callPythonOCR(optimizedBuffer, filename);
  } catch (error: any) {
    console.error("Image extraction error:", error.message);
    return "[Failed to process image]";
  }
}

// PDF extraction -> delegates to Python
export async function extractTextFromPDF(pdfData: string | Buffer, filename: string = "document.pdf"): Promise<string> {
  try {
    let buffer: Buffer;
    if (typeof pdfData === "string") {
      const base64Data = pdfData.split(",")[1] || pdfData;
      buffer = Buffer.from(base64Data, "base64");
    } else {
      buffer = pdfData;
    }
    console.log(`Using Python Service for PDF: ${filename}`);
    return await callPythonOCR(buffer, filename);
  } catch (error: any) {
    console.error("PDF extraction error:", error.message);
    return `[Error processing PDF: ${error.message}]`;
  }
}


// PPT extraction -> delegates to Python
export async function extractTextFromPPT(pptData: string | Buffer, filename: string = "presentation.pptx"): Promise<string> {
  try {
    let buffer: Buffer;
    if (typeof pptData === "string") {
      const base64Data = pptData.split(",")[1] || pptData;
      buffer = Buffer.from(base64Data, "base64");
    } else {
      buffer = pptData;
    }
    console.log(`Using Python Service for PPT: ${filename}`);
    return await callPythonOCR(buffer, filename);
  } catch (error: any) {
    console.error("PPT extraction error:", error.message);
    return `[Error processing PPT: ${error.message}]`;
  }
}

// Extract text from file (auto-detect PDF or image)
export async function extractTextFromFile(
  fileData: string | Buffer,
  filename: string
): Promise<string> {
  const name = (filename || "").toLowerCase();

  if (name.endsWith(".pdf")) {
    return extractTextFromPDF(fileData, filename);
  } else if (
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".tiff") ||
    name.endsWith(".bmp") ||
    name.endsWith(".webp")
  ) {
    return extractTextFromImage(fileData, filename);
  } else {
    // Attempt PDF extraction first, then image extraction as fallback
    const pdfResult = await extractTextFromPDF(fileData, filename);
    if (!pdfResult.includes("[⚠️")) {
      return pdfResult;
    }
    return extractTextFromImage(fileData, filename);
  }
}

// Generate summary and key points from text using Groq
export async function generateSummary(
  text: string,
  language: string = "English"
): Promise<{
  summary: string;
  keyPoints: string[];
  topicExplanations?: Record<string, string>;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}> {
  try {
    // Truncate text to avoid Groq token limits (max ~50000 chars for Llama 3 70b)
    const maxTextLength = 50000;
    const truncatedText = text.length > maxTextLength
      ? text.substring(0, maxTextLength) + "...[content truncated]"
      : text;

    console.log(`Generating summary for ${truncatedText.length} characters (original: ${text.length}) in ${language}`);

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert exam tutor and study guide creator. Your goal is to create a **COMPREHENSIVE, DETAILED** study guide from the provided lecture notes.\n" +
            `**IMPORTANT**: Output the entire study guide in **${language}**. If the input text is in a different language, TRANSLATE it and summarize it in **${language}**.\n` +
            "**IMPORTANT**: The user is studying for an exam. Do NOT summarize briefly. Do NOT skip details. EXPLAIN EVERYTHING.\n" +
            "Structure your response CLEARLY using **BOLD CAPITALIZED HEADERS** (e.g., **CORE CONCEPTS**, **DETAILED ANALYSIS**) instead of hashtags (#).\n" +
            "Do NOT use markdown headers like # or ##. Use **BOLD** for emphasis.\n" +
            "For the Key Points section, you MUST assign a weightage (High/Medium/Low) to each point based on its importance/exam probability.\n" +
            "**KEY POINTS FORMAT REQUIREMENT**:\n" +
            "- Do NOT say 'This point covers...' or 'The slide discusses...'.\n" +
            "- DIRECTLY define the concept and explain it in 2-3 detailed sentences.\n" +
            "- Format: '- [High Weightage] **Concept Name**: Definition. Detailed explanation of why it matters and how it works.'\n" +
            "Avoid excessive newlines between headers and content.\n" +
            "**INSTRUCTIONS**:\n" +
            "1. **Overview**: Brief intro.\n" +
            "2. **Detailed Notes**: Go through the content slide-by-slide or topic-by-topic. Expand on bullet points. Use the speaker notes for context.\n" +
            "3. **Key Terminology**: Definitions of important terms.\n" +
            "4. **EXAM CONCEPTS & DEFINITIONS**: Do NOT just predict questions. Instead, list key concepts that are likely to be on the exam and provide their **DEFINITIONS** and **EXAMPLES**. Start with 'Here are the key concepts for the exam:'.\n",
        },
        {
          role: "user",
          content: `Create a comprehensive, detailed study guide from these notes. Do not leave out any important details:\n\n${truncatedText}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 4000,
    });

    const summaryText = completion.choices[0].message.content || "";

    // Initialize usage tracking
    const totalUsage = {
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
    };

    const lines = summaryText.split("\n");
    const keyPoints = lines
      .filter((line) => /^(\d+\.|[-•*])\s+/.test(line))
      .map((line) => line.replace(/^(\d+\.|[-•*])\s+/, "").trim())
      .filter((point) => point.length > 0)
      .slice(0, 7);

    if (keyPoints.length === 0) {
      keyPoints.push(summaryText.slice(0, 200));
    }

    // Extract and research main topics from key points
    console.log("Extracting topics for web research...");
    const topicExplanations: Record<string, string> = {};

    // Extract first 3-4 topics from key points for web research
    const topicsToResearch = keyPoints.slice(0, 4).map(point => {
      const match = point.match(/^([^:]+?)(?:\s*[:—]|$)/);
      return match ? match[1].trim() : point.split(" ").slice(0, 3).join(" ");
    });

    // Run Google Search in parallel with timeout to avoid blocking
    console.log("Starting parallel web research (with timeout)...");
    const googleSearchPromises = topicsToResearch.map(topic =>
      Promise.race([
        googleSearch(topic).then(results => ({ topic, results })),
        new Promise<{ topic: string; results: string[] }>(resolve =>
          setTimeout(() => resolve({ topic, results: [] }), 3000) // 3 second timeout per search
        )
      ]).catch(() => ({ topic, results: [] }))
    );

    const searchResults = await Promise.all(googleSearchPromises);
    const searchResultsMap: Record<string, string[]> = {};
    searchResults.forEach(result => {
      searchResultsMap[result.topic] = result.results;
    });

    // Research each topic using Groq for detailed explanations (in parallel)
    const researchPromises = topicsToResearch.map(async (topic) => {
      try {
        console.log(`Researching topic: "${topic}"`);

        // Use cached Google Search results
        let googleContext = "";
        const results = searchResultsMap[topic] || [];
        if (results.length > 0) {
          console.log(`✅ Using ${results.length} Google Search results for "${topic}"`);
          googleContext = `\n\nWeb Research Results:\n${results.join("\n")}\n`;
        }

        // Use Groq to synthesize explanation with Google search context
        const researchCompletion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are an expert educational research assistant. Provide clear, detailed, accurate explanations (3-4 sentences) of academic topics for students. Use the provided web research context to enhance your explanation with current and authoritative information.",
            },
            {
              role: "user",
              content: `Provide a detailed, educational explanation of: "${topic}". Keep it to 3-4 sentences and include relevant information.${googleContext}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 200,
        });

        if (researchCompletion.usage) {
          totalUsage.promptTokens += researchCompletion.usage.prompt_tokens || 0;
          totalUsage.completionTokens += researchCompletion.usage.completion_tokens || 0;
          totalUsage.totalTokens += researchCompletion.usage.total_tokens || 0;
        }

        const explanation = researchCompletion.choices[0].message.content || "";
        topicExplanations[topic] = explanation.trim();
      } catch (error: any) {
        console.warn(`Failed to research topic "${topic}":`, error.message);
      }
    });

    // Wait for all research to complete in parallel
    await Promise.all(researchPromises);

    return {
      summary: summaryText,
      keyPoints: keyPoints.slice(0, 7),
      topicExplanations,
      usage: totalUsage,
    };
  } catch (error: any) {
    console.error("Summary generation error:", error);
    throw error;
  }
}

// Combined: Extract + Summarize
export async function extractAndSummarize(
  fileData: string | Buffer,
  filename: string
): Promise<{
  extracted: string;
  summary: string;
  keyPoints: string[];
  topicExplanations?: Record<string, string>;
  error?: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}> {
  try {
    const extracted = await extractTextFromFile(fileData, filename);

    if (extracted.includes("[⚠️") && extracted.includes("]")) {
      return {
        extracted,
        summary: "",
        keyPoints: [],
        error: extracted,
      };
    }

    // Validate extracted text length to prevent "vowels" hallucination
    const cleanedText = extracted.replace(/\s/g, "");
    if (cleanedText.length < 50) {
      console.warn(`⚠️  OCR Extracted insufficient text (${cleanedText.length} chars). Aborting summary.`);
      console.log(`Preview of extracted text: "${extracted.slice(0, 100)}..."`);

      return {
        extracted,
        summary: "Unable to generate a summary. The document appears to have very little readable text. Please check the image quality or file content.",
        keyPoints: [],
        topicExplanations: {},
        error: "Insufficient text extracted for summarization."
      };
    }

    const { summary, keyPoints, topicExplanations, usage } = await generateSummary(extracted);

    return {
      extracted,
      summary,
      keyPoints,
      topicExplanations,
      usage,
    };
  } catch (error: any) {
    console.error("Extract and summarize error:", error);
    return {
      extracted: "",
      summary: "",
      keyPoints: [],
      error: `Error: ${error.message}`,
    };
  }
}
