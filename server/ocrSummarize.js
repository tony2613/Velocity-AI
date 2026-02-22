// server/ocrSummarize.js  (CommonJS - drop into your existing Express app)
const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const FormData = require("form-data");
const sharp = (() => {
  try { return require("sharp"); } catch (e) { return null; }
})();
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const OCR_API_KEY = process.env.OCR_API_KEY || "helloworld";
const OCR_TIMEOUT_MS = 60000;

async function callOcrSpaceBuffer(buf, filename = "file") {
  const form = new FormData();
  form.append("apikey", OCR_API_KEY);
  // language can be changed if needed (e.g., "eng", "hin")
  form.append("language", "eng");
  // let OCR.space handle PDF directly (it accepts PDFs and images)
  form.append("file", buf, { filename });

  try {
    const res = await axios.post("https://api.ocr.space/parse/image", form, {
      headers: { ...form.getHeaders() },
      timeout: OCR_TIMEOUT_MS,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: err.message || String(err), raw: err.response && err.response.data };
  }
}

function extractTextFromOcrSpaceResponse(respData) {
  // Build combined text if ParsedResults present
  if (!respData) return "";
  if (respData.IsErroredOnProcessing) return "";
  const parsed = respData.ParsedResults;
  if (!parsed || !Array.isArray(parsed) || parsed.length === 0) return "";
  return parsed.map(p => p.ParsedText || "").join("\n\n").trim();
}

// Very small frequency-based sentence extractor (keeps dependencies minimal)
function simpleExtractiveSummary(text, sentenceCount = 5) {
  if (!text || text.trim().length === 0) return "";
  const sentences = text.replace(/\r\n/g, " ").split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= sentenceCount) return sentences.join(" ");
  // word freq
  const words = text.toLowerCase().match(/\w+/g) || [];
  const freq = {};
  const STOP = new Set(["the","and","for","that","with","this","from","are","was","but","not","you","your","have","has","had","they","their","them","she","he","his","her","its","which","when","where","what","who","why","how","a","an","in","on","of","to","is","it"]);
  for (const w of words) {
    if (STOP.has(w) || w.length <= 2) continue;
    freq[w] = (freq[w]||0)+1;
  }
  const scored = sentences.map((s,i) => {
    const ws = (s.toLowerCase().match(/\w+/g) || []);
    const score = ws.reduce((acc,w) => acc + (freq[w]||0), 0);
    return { i, s, score };
  });
  scored.sort((a,b) => b.score - a.score);
  const top = scored.slice(0, sentenceCount).sort((a,b) => a.i - b.i).map(x => x.s);
  return top.join(" ");
}

router.post("/api/ocr-summarize", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "no_file", message: "Please attach a file under form field 'file'." });

    const originalName = req.file.originalname || "upload";
    const mimetype = req.file.mimetype || "";
    const diagnostics = { filename: originalName, mimetype, steps: [] };

    let extractedText = "";
    // 1) If PDF: try pdf-parse first (fast and accurate for selectable text)
    if (mimetype === "application/pdf" || originalName.toLowerCase().endsWith(".pdf")) {
      diagnostics.steps.push("pdf-parse attempt");
      try {
        const parsed = await pdfParse(req.file.buffer);
        diagnostics.pdf_text_length = parsed && parsed.text ? parsed.text.length : 0;
        if (parsed && parsed.text && parsed.text.trim().length > 20) {
          extractedText = parsed.text.trim();
          diagnostics.steps.push("pdf-parse succeeded");
        } else {
          diagnostics.steps.push("pdf-parse empty or minimal text");
        }
      } catch (err) {
        diagnostics.steps.push("pdf-parse error");
        diagnostics.pdf_parse_error = String(err);
      }
    }

    // 2) If no extracted text yet -> use OCR.space (send the original file buffer, OCR.space accepts PDFs and images)
    if (!extractedText || extractedText.trim().length < 20) {
      diagnostics.steps.push("calling ocr.space");
      // For images, try to enhance if sharp is available
      let bufToSend = req.file.buffer;
      if (mimetype && mimetype.startsWith("image/") && sharp) {
        try {
          diagnostics.steps.push("sharp preprocess (resize+png)");
          // upscale small images to ~1500px width for better OCR; keep aspect ratio
          const img = sharp(req.file.buffer);
          const meta = await img.metadata();
          const width = meta.width || 800;
          const target = Math.min(Math.max(1200, width), 2500);
          bufToSend = await img.resize({ width: target, withoutEnlargement: false }).png().toBuffer();
          diagnostics.sharp = { original_width: meta.width, original_height: meta.height, used: true };
        } catch (e) {
          diagnostics.sharp = { used: false, error: String(e) };
          bufToSend = req.file.buffer;
        }
      } else if (mimetype && mimetype.startsWith("image/")) {
        diagnostics.steps.push("no-sharp-image-sent (sharp not installed)");
      }

      const ocrRes = await callOcrSpaceBuffer(bufToSend, originalName);
      diagnostics.ocr_call = ocrRes.ok ? "ok" : "failed";
      if (!ocrRes.ok) {
        diagnostics.ocr_error = ocrRes.error;
        diagnostics.ocr_raw = ocrRes.raw;
      } else {
        diagnostics.ocr_raw = !!ocrRes.data;
      }

      if (ocrRes.ok && ocrRes.data) {
        const txt = extractTextFromOcrSpaceResponse(ocrRes.data);
        diagnostics.ocr_extracted_length = txt.length;
        extractedText = txt;
      }
    }

    diagnostics.extracted_length = extractedText ? extractedText.length : 0;

    if (!extractedText || extractedText.trim().length < 20) {
      // helpful actionable message
      return res.status(400).json({
        error: "no_text_extracted",
        message: "Could not extract text. If you uploaded a scanned PDF, try a clearer scan (>=150 DPI) or set a valid OCR_API_KEY in Replit Secrets. For images, use high-contrast PNG/JPG with readable text.",
        diagnostics
      });
    }

    // 3) Summarize (simple extractive)
    const sentences = Math.max(1, Math.min(20, Number(req.body.sentences || req.query.sentences || 5)));
    const summary = simpleExtractiveSummary(extractedText, sentences);

    return res.json({
      summary,
      extracted_text_sample: extractedText.slice(0, 3000),
      diagnostics
    });

  } catch (err) {
    return res.status(500).json({ error: "internal_error", detail: String(err), stack: err && err.stack });
  }
});

module.exports = router;
