// Load OCR API key from environment or use default
const OCR_API_KEY = process.env.OCR_API_KEY || "helloworld";

// Use OCR.space API (free cloud OCR) to extract text from images
// This hybrid approach attempts robust text extraction with good error handling
async function ocrSpaceFile(imageBytes: Buffer): Promise<string> {
  try {
    const formData = new FormData();
    const blob = new Blob([imageBytes], { type: "image/png" });
    formData.append("filename", blob);
    formData.append("apikey", OCR_API_KEY);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    try {
      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (data?.IsErroredOnProcessing) {
        const errorMsg = data?.ErrorMessage || "Unknown OCR error";
        console.warn(`OCR processing error: ${errorMsg}`);
        return "";
      }

      const parsed = data?.ParsedResults;
      if (!parsed || parsed.length === 0) {
        console.warn("OCR.space returned no parsed results");
        return "";
      }

      const text = parsed.map((p: any) => p.ParsedText || "").join("\n\n");
      const result = text.trim();
      console.log(`OCR extraction: Successfully extracted ${result.length} characters`);
      return result;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error: any) {
    console.error("OCR.space API error:", error.message);
    return "";
  }
}

// Extract text from image using OCR.space
export async function extractTextFromImage(imageData: string): Promise<string> {
  try {
    const base64Data = imageData.split(",")[1] || imageData;
    const buffer = Buffer.from(base64Data, "base64");
    const text = await ocrSpaceFile(buffer);
    
    if (!text) {
      return "[No text detected in image. Try uploading a clearer, higher-contrast image.]";
    }
    
    return text;
  } catch (error: any) {
    console.error("Image extraction error:", error.message);
    return "[Failed to process image. Please ensure it's a valid image file.]";
  }
}
