import "dotenv/config";
import { runMultiAIResearch } from "./server/aiProviders/index.js";

async function main() {
  console.log("Starting Multi-AI Research Test...");
  console.log("Checking API Keys:");
  console.log("- GROQ_API_KEY:", process.env.GROQ_API_KEY ? "Present" : "Missing");
  console.log("- OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "Present" : "Missing");
  console.log("- ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY ? "Present" : "Missing");
  console.log("- GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
  
  console.log("\nExecuting test query: 'What are the three main causes of ocean tides?'");
  const results = await runMultiAIResearch("What are the three main causes of ocean tides? Be incredibly concise.");
  
  console.log("\n============== RESULTS ==============\n");
  for (const result of results) {
    console.log(`[PROVIDER]: ${result.provider}`);
    if (result.error) {
      console.log(`[ERROR]: ${result.error}`);
    } else {
      // Print first 150 chars to prove it works
      const preview = result.content.substring(0, 150).replace(/\n/g, ' ');
      console.log(`[SUCCESS]: ${preview}...`);
    }
    console.log("-------------------------------------");
  }
}

main().catch(console.error);
