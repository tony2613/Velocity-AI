import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.GOOGLE_SEARCH_API_KEY;

async function testVision(imagePath) {
    if (!API_KEY) {
        console.error('❌ API KEY not found in .env');
        return;
    }

    if (!imagePath || !fs.existsSync(imagePath)) {
        console.error('❌ Image path not found:', imagePath);
        return;
    }

    console.log(`Using API Key: ${API_KEY.substring(0, 5)}...`);
    console.log(`Testing with image: ${imagePath}`);

    const base64Image = fs.readFileSync(imagePath).toString('base64');

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

    try {
        const response = await axios.post(url, payload);
        const results = response.data.responses[0];

        if (results.error) {
            console.error('❌ Vision API Error:', results.error.message);
            return;
        }

        const text = results.fullTextAnnotation?.text;
        if (text) {
            console.log('✅ Vision API SUCCESS!');
            console.log('--- Extracted Text ---');
            console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
            console.log('----------------------');
        } else {
            console.log('⚠️ No text detected in image.');
        }
    } catch (error) {
        console.error('❌ Request failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

// Use the existing test image if it exists
const testImage = 'test_ocr_image.png';
testVision(testImage);
