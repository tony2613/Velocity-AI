import axios from "axios";
import "dotenv/config";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
    if (!GEMINI_API_KEY) {
        console.error("❌ No API Key found in .env");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log("Testing Gemini API connection...");
    
    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: "Hello, answer with 'OK' if you see this." }] }]
        });
        
        if (response.data && response.data.candidates) {
            console.log("✅ Gemini API is ONLINE and WORKING.");
            console.log("Response:", response.data.candidates[0].content.parts[0].text);
        } else {
            console.error("❌ Gemini API returned unexpected data:", JSON.stringify(response.data));
        }
    } catch (err) {
        console.error("❌ Gemini API TEST FAILED:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Body:", JSON.stringify(err.response.data));
        }
    }
}

testGemini();
