import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
console.log(`[Gemini] API Key configured: ${!!GEMINI_API_KEY}`);

export async function geminiOCR(buffer: Buffer, mimeType: string, retries: number = 2): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured in .env");
    }

    try {
        console.log(`[Gemini] Attempting OCR via REST for ${mimeType} (${Math.round(buffer.length / 1024)} KB)...`);
        
        // Use v1beta endpoint for best compatibility with gemini-1.5-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const payload = {
            contents: [{
                parts: [
                    { text: "Return the FULL and ACCURATE text extraction of this document. Extract every single word exactly as written. If there are tables, preserve the layout in markdown. Do NOT summarize. Do NOT omit any text. Return ONLY the extracted text content." },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: buffer.toString("base64")
                        }
                    }
                ]
            }]
        };

        // For large PDFs, we increase the timeout to 5 minutes
        const timeout = mimeType === "application/pdf" ? 600000 : 120000;
        
        console.log(`[Gemini] Sending ${mimeType} (size: ${Math.round(buffer.length/1024)}KB) to Gemini... (Timeout: ${timeout/1000}s)`);
        
        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout
        });

        if (!response.data || !response.data.candidates || !response.data.candidates[0].content) {
            // Handle cases where the model might refuse to process (saftey filters)
            if (response.data?.promptFeedback?.blockReason) {
                console.error(`[Gemini] Content blocked: ${response.data.promptFeedback.blockReason}`);
                throw new Error(`Content blocked by Gemini safety filters: ${response.data.promptFeedback.blockReason}`);
            }
            console.error("[Gemini] Invalid REST Response:", JSON.stringify(response.data));
            throw new Error("Invalid response from Gemini API");
        }

        const text = response.data.candidates[0].content.parts[0].text.trim();
        
        if (!text) {
            console.warn("[Gemini] OCR REST returned an empty response string.");
        } else {
            console.log(`[Gemini] OCR Successful: extracted ${text.length} characters.`);
        }
        
        return text;
    } catch (error: any) {
        const status = error.response?.status;
        
        // Retry on 429 (Rate Limit) or 503/504 (Server error)
        if (retries > 0 && (status === 429 || status === 503 || status === 504 || error.code === 'ECONNABORTED')) {
            const delay = status === 429 ? 5000 : 2000;
            console.warn(`[Gemini] Error ${status || error.code}. Retrying in ${delay}ms... (${retries} attempts left)`);
            await new Promise(r => setTimeout(r, delay));
            return geminiOCR(buffer, mimeType, retries - 1);
        }

        console.error("❌ Gemini OCR API Error Details:");
        console.error("- Message:", error.message);
        if (error.response) {
            console.error("- Status:", error.response.status);
            console.error("- Data:", JSON.stringify(error.response.data));
        }
        throw error;
    }
}

export async function geminiChat(messages: { role: string; content: string }[], model: string = "gemini-1.5-flash"): Promise<{ content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        let systemInstruction = undefined;
        const contents = [];

        for (const m of messages) {
            if (m.role === "system") {
                systemInstruction = { parts: [{ text: m.content }] };
            } else {
                contents.push({
                    role: m.role === "user" ? "user" : "model",
                    parts: [{ text: m.content }]
                });
            }
        }

        const payload = {
            system_instruction: systemInstruction,
            contents,
            generationConfig: {
                maxOutputTokens: 8192,
                temperature: 0.1
            }
        };

        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 300000
        });

        const candidate = response.data.candidates?.[0];
        if (!candidate || !candidate.content) {
            throw new Error(`Invalid response from Gemini API: ${JSON.stringify(response.data)}`);
        }

        const text = candidate.content.parts[0].text;
        
        const usage = {
            promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
            completionTokens: response.data.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: response.data.usageMetadata?.totalTokenCount || 0
        };

        return { content: text, usage };
    } catch (error: any) {
        console.error(`[Gemini Chat] Error: ${error.message}`);
        if (error.response?.data) {
            console.error(`[Gemini Data]: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
}
