import axios from "axios";
import "dotenv/config";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    if (!GEMINI_API_KEY) {
        console.error("❌ No API Key found in .env");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    
    console.log("Listing available Gemini models...");
    
    try {
        const response = await axios.get(url);
        if (response.data && response.data.models) {
            console.log("✅ Models found:");
            response.data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.error("❌ No models found in response.");
        }
    } catch (err) {
        console.error("❌ ListModels FAILED:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Body:", JSON.stringify(err.response.data));
        }
    }
}

listModels();
