import axios from "axios";


function getGeminiKeys(): string[] {
    const keys: string[] = [];
    if (process.env.GEMINI_API_KEY) {
        keys.push(...process.env.GEMINI_API_KEY.split(",").map(k => k.trim()));
    }
    if (process.env.GEMINI_API_KEY_2) {
        keys.push(process.env.GEMINI_API_KEY_2.trim());
    }
    return keys.filter(Boolean);
}

const geminiKeys = getGeminiKeys();
console.log(`[Gemini] API Keys configured: ${geminiKeys.length} key(s) detected`);

const safetySettings = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_NONE" }
];

async function executeWithRotation<T>(
    apiCall: (key: string) => Promise<T>
): Promise<T> {
    const keys = getGeminiKeys();
    if (keys.length === 0) {
        throw new Error("No GEMINI_API_KEY is configured in .env");
    }

    let lastError: any = null;
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        try {
            return await apiCall(key);
        } catch (error: any) {
            const status = error.response?.status;
            // Retry on rate limit (429) if we have more keys left
            if (status === 429 && i < keys.length - 1) {
                console.warn(`[Gemini Rotation] Key ${i + 1} rate limited (429). Rotating to next key...`);
                lastError = error;
                continue;
            }
            throw error;
        }
    }
    throw lastError || new Error("All Gemini keys exhausted or failed");
}

export async function geminiOCR(buffer: Buffer, mimeType: string, retries: number = 2): Promise<string> {
    return executeWithRotation(async (key: string) => {
        try {
            console.log(`[Gemini] Attempting OCR via REST for ${mimeType} (${Math.round(buffer.length / 1024)} KB)...`);
            
            // Use v1beta endpoint for best compatibility with gemini-1.5-flash
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

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
                }],
                safetySettings
            };

            // For large PDFs, we increase the timeout to 5 minutes
            const timeout = mimeType === "application/pdf" ? 600000 : 120000;
            
            console.log(`[Gemini] Sending ${mimeType} (size: ${Math.round(buffer.length/1024)}KB) to Gemini... (Timeout: ${timeout/1000}s)`);
            
            const response = await axios.post(url, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout
            });

            if (!response.data || !response.data.candidates || !response.data.candidates[0].content) {
                // Handle cases where the model might refuse to process (safety filters)
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
    });
}

async function callGroqChat(messages: { role: string; content: string }[]): Promise<{ content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
    const key = process.env.GROQ_API_KEY;
    if (!key) {
        throw new Error("No GROQ_API_KEY configured");
    }
    const url = "https://api.groq.com/openai/v1/chat/completions";
    const payload = {
        model: "llama-3.3-70b-versatile",
        messages: messages.map(m => ({
            role: m.role === "assistant" ? "assistant" : m.role === "system" ? "system" : "user",
            content: m.content
        })),
        temperature: 0.1
    };
    
    console.log("[Groq Fallback] Sending request to Groq (llama-3.3-70b-versatile)...");
    const response = await axios.post(url, payload, {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        timeout: 60000
    });
    
    const content = response.data.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("Empty response from Groq API");
    }
    
    const usage = {
        promptTokens: response.data.usage?.prompt_tokens || 0,
        completionTokens: response.data.usage?.completion_tokens || 0,
        totalTokens: response.data.usage?.total_tokens || 0
    };
    
    return { content, usage };
}

export async function geminiChat(messages: { role: string; content: string }[], model: string = "gemini-2.5-flash"): Promise<{ content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
    try {
        return await executeWithRotation(async (key: string) => {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

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
                    },
                    safetySettings
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
        });
    } catch (geminiError: any) {
        if (process.env.GROQ_API_KEY) {
            console.warn(`[Gemini Fallback] Gemini API call failed: ${geminiError.message}. Falling back to Groq API...`);
            try {
                return await callGroqChat(messages);
            } catch (groqError: any) {
                console.error(`[Groq Fallback Failed] Groq API call also failed: ${groqError.message}`);
                throw new Error(`Both Gemini and Groq APIs failed. Gemini: ${geminiError.message}. Groq: ${groqError.message}`);
            }
        }
        throw geminiError;
    }
}

