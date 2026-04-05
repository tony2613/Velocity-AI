import axios from "axios";
import "dotenv/config";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    if (!GEMINI_API_KEY) {
        console.error("❌ No API Key found in .env");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    
    try {
        const response = await axios.get(url);
        if (response.data && response.data.models) {
            const models = response.data.models
                .filter(m => m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name);
            console.log(JSON.stringify(models));
        } else {
            console.error("No models found.");
        }
    } catch (err) {
        console.error("FAILED:", err.message);
    }
}

listModels();
