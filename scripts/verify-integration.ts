import { extractTextFromImage } from './server/ocrSummarize';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function verify() {
    console.log("Verifying OCR Integration with Google Vision...");
    const imagePath = 'test_ocr_image.png';
    if (!fs.existsSync(imagePath)) {
        console.error("Test image not found!");
        return;
    }

    const buffer = fs.readFileSync(imagePath);
    try {
        const text = await extractTextFromImage(buffer, 'test_ocr_image.png');
        console.log("--- FINAL OCR RESULT ---");
        console.log(text);
        console.log("------------------------");
        if (text && text.length > 5) {
            console.log("✅ INTEGRATION VERIFIED!");
        } else {
            console.log("❌ Integration check failed: No text returned.");
        }
    } catch (e) {
        console.error("❌ Integration check crashed:", e);
    }
}

verify();
