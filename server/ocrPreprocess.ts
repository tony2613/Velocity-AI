import { Router } from "express";
import axios from "axios";
import FormData from "form-data";
import sharp from "sharp";
import multer from "multer";
import { isAuthenticated, checkUsageLimit } from "./middleware";
import { storage } from "./storage";
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const OCR_API_KEY = process.env.OCR_API_KEY || "helloworld";
const OCR_TIMEOUT_MS = 60000;

async function callOcrSpaceBuffer(buf: Buffer, filename: string = "file.png") {
  const form = new FormData();
  form.append("apikey", OCR_API_KEY);
  form.append("language", "eng");
  form.append("file", buf, { filename });
  const res = await axios.post("https://api.ocr.space/parse/image", form, {
    headers: form.getHeaders(),
    timeout: OCR_TIMEOUT_MS,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return res.data;
}

interface PreprocessDiagnostics {
  original_size: number;
  filename: string;
  meta?: Record<string, any>;
  avg_brightness?: number;
  preprocess?: string;
  processed_size?: number;
  ocr_raw?: boolean;
}

async function preprocessImage(
  buf: Buffer,
  originalFilename: string
): Promise<{
  text_sample: string;
  full_ocr: any;
  diagnostics: PreprocessDiagnostics;
}> {
  const diagnostics: PreprocessDiagnostics = {
    original_size: buf.length,
    filename: originalFilename,
  };

  try {
    // Get image metadata
    let img = sharp(buf);
    const meta = (await img.metadata().catch(() => ({}))) as any;
    diagnostics.meta = meta;

    // Calculate average brightness as heuristic for dark background
    const small = await img.resize(200).greyscale().raw().toBuffer();
    let avg = 0;
    for (let i = 0; i < small.length; i++) avg += small[i];
    avg = avg / small.length;
    diagnostics.avg_brightness = avg; // 0=black .. 255=white

    const targetWidth = Math.min(2000, Math.max(1000, meta.width || 1200));

    // Apply preprocessing based on brightness
    if (avg < 100) {
      // Dark background detected - invert, adjust contrast, and upscale
      diagnostics.preprocess = "invert+contrast+upscale";
      buf = await sharp(buf)
        .flatten({ background: "#000000" })
        .negate() // invert colors
        .modulate({ brightness: 1.05, saturation: 1.0 })
        .resize({
          width: targetWidth,
          withoutEnlargement: false,
        })
        .png()
        .toBuffer();
    } else {
      // Light background - just enhance contrast and upscale
      diagnostics.preprocess = "contrast+upscale";
      buf = await sharp(buf)
        .resize({
          width: targetWidth,
          withoutEnlargement: false,
        })
        .png()
        .toBuffer();
    }

    diagnostics.processed_size = buf.length;

    // Call OCR API
    const ocr = await callOcrSpaceBuffer(buf, originalFilename || "file.png");
    diagnostics.ocr_raw = !!ocr;

    const parsed = ocr && ocr.ParsedResults ? ocr.ParsedResults : null;
    const text = parsed
      ? parsed
        .map((p: any) => p.ParsedText || "")
        .join("\n\n")
        .trim()
      : "";

    return {
      text_sample: text.slice(0, 4000),
      full_ocr: ocr,
      diagnostics,
    };
  } catch (error: any) {
    throw new Error(`Preprocessing failed: ${error.message}`);
  }
}

// Router endpoint
router.post("/api/ocr-preprocess", isAuthenticated, checkUsageLimit, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "no_file" });
    }

    const result = await preprocessImage(req.file.buffer, req.file.originalname);

    // Increment usage
    if (req.user) {
      await storage.incrementDailyUsage((req.user as any).id);
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "internal", detail: String(error) });
  }
});

export default router;
