import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function discoverModels() {
    console.log("🚀 Starting Gemini Model Discovery...");
    console.log(`🔑 Key found: ${GEMINI_API_KEY.substring(0, 8)}...`);

    try {
        // Test with different model names to see what works
        const testModels = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-pro-vision"];
        
        for (const modelName of testModels) {
            try {
                console.log(`⏳ Testing model: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Say 'Ready'");
                console.log(`✅ ${modelName}: SUCCESS - ${result.response.text().trim()}`);
            } catch (e) {
                console.warn(`❌ ${modelName}: FAILED - ${e.message}`);
            }
        }
    } catch (e) {
        console.error("Fatal diagnostic error:", e.message);
    }
}

discoverModels();
