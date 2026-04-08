import axios from 'axios';

const API_KEY = process.env.GOOGLE_SEARCH_API_KEY;

/**
 * Google Cloud Vision API OCR
 * Uses DOCUMENT_TEXT_DETECTION for high density text (PDFs/Scanned Docs)
 */
export async function googleVisionOCR(buffer: Buffer): Promise<string> {
    if (!API_KEY) {
        throw new Error("GOOGLE_SEARCH_API_KEY is not configured in .env");
    }

    try {
        console.log(`[Google Vision] Sending image (${Math.round(buffer.length / 1024)} KB) to Vision API...`);
        
        const base64Image = buffer.toString('base64');
        const url = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

        const payload = {
            requests: [
                {
                    image: {
                        content: base64Image
                    },
                    features: [
                        {
                            type: 'DOCUMENT_TEXT_DETECTION'
                        }
                    ]
                }
            ]
        };

        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000 // 60s timeout
        });

        const results = response.data.responses?.[0];

        if (!results) {
            throw new Error("Invalid response from Google Vision API");
        }

        if (results.error) {
            throw new Error(`Google Vision API Error: ${results.error.message}`);
        }

        const text = results.fullTextAnnotation?.text || "";
        
        if (!text) {
            console.warn("[Google Vision] No text detected.");
        } else {
            console.log(`[Google Vision] Successfully extracted ${text.length} characters.`);
        }
        
        return text.trim();
    } catch (error: any) {
        console.error("[Google Vision] OCR failed:", error.message);
        if (error.response?.data) {
            console.error("[Google Vision] Response Data:", JSON.stringify(error.response.data));
        }
        throw error;
    }
}
