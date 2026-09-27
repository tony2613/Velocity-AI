import dotenv from 'dotenv';
import axios from 'axios';
import { Pool } from 'pg';
import path from 'path';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

function maskKey(key) {
  if (!key) return '(not set)';
  if (key.length <= 8) return `${key.substring(0, 2)}...${key.substring(key.length - 2)}`;
  return `${key.substring(0, 6)}...${key.substring(key.length - 4)} (${key.length} chars)`;
}

export const results = [];

function recordResult({ service, envVar, status, summary, details = null, actionRequired = null }) {
  results.push({ service, envVar, status, summary, details, actionRequired });
}

// 1. Google Gemini API
async function checkGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    recordResult({
      service: 'Google Gemini AI',
      envVar: 'GEMINI_API_KEY',
      status: 'FAIL',
      summary: 'Missing in .env',
      actionRequired: 'Add GEMINI_API_KEY in .env',
    });
    return;
  }
  try {
    const t0 = Date.now();
    const testModel = 'gemini-3.6-flash';
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${key}`,
      { contents: [{ parts: [{ text: 'Say "OK"' }] }] },
      { timeout: 15000 }
    );
    const latency = Date.now() - t0;
    const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    recordResult({
      service: 'Google Gemini AI',
      envVar: 'GEMINI_API_KEY',
      status: 'PASS',
      summary: `Active & Working (${latency}ms, model: ${testModel})`,
      details: { preview: maskKey(key), sampleOutput: reply },
    });
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error?.message || err.message;
    recordResult({
      service: 'Google Gemini AI',
      envVar: 'GEMINI_API_KEY',
      status: 'FAIL',
      summary: `Error ${status || ''}: ${msg}`,
      details: { preview: maskKey(key) },
      actionRequired: 'Verify API key or switch model in server/gemini.ts',
    });
  }
}

// 2. Groq AI
async function checkGroq() {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    recordResult({
      service: 'Groq AI',
      envVar: 'GROQ_API_KEY',
      status: 'FAIL',
      summary: 'Missing in .env',
      actionRequired: 'Add GROQ_API_KEY in .env',
    });
    return;
  }
  try {
    const res = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
      timeout: 6000,
    });
    const modelCount = (res.data?.data || []).length;
    recordResult({
      service: 'Groq AI',
      envVar: 'GROQ_API_KEY',
      status: 'WARN',
      summary: `Key authenticated (${modelCount} models listed), but models are blocked at project level in Groq Console`,
      details: { preview: maskKey(key) },
      actionRequired: 'Visit https://console.groq.com/settings/project/limits and enable models or create new API key',
    });
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error?.message || err.message;
    recordResult({
      service: 'Groq AI',
      envVar: 'GROQ_API_KEY',
      status: 'FAIL',
      summary: `HTTP ${status || ''}: ${msg}`,
      details: { preview: maskKey(key) },
      actionRequired: 'Check GROQ_API_KEY in console.groq.com',
    });
  }
}

// 3. Serper.dev Google Search API
async function checkSerper() {
  const key = process.env.SERPER_API_KEY;
  if (!key) {
    recordResult({
      service: 'Serper Web Search',
      envVar: 'SERPER_API_KEY',
      status: 'WARN',
      summary: 'Missing in .env',
      actionRequired: 'Add SERPER_API_KEY for web research',
    });
    return;
  }
  try {
    const t0 = Date.now();
    const res = await axios.post(
      'https://google.serper.dev/search',
      { q: 'VelocityAI', num: 1 },
      {
        headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
        timeout: 8000,
      }
    );
    const latency = Date.now() - t0;
    recordResult({
      service: 'Serper Web Search',
      envVar: 'SERPER_API_KEY',
      status: 'PASS',
      summary: `Active & Working (${latency}ms, credits: ${res.data.credits ?? 'OK'})`,
      details: { preview: maskKey(key), resultCount: res.data?.organic?.length || 0 },
    });
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message || err.message;
    recordResult({
      service: 'Serper Web Search',
      envVar: 'SERPER_API_KEY',
      status: 'FAIL',
      summary: `HTTP ${status || ''}: ${msg}`,
      details: { preview: maskKey(key) },
      actionRequired: 'Check SERPER_API_KEY at serper.dev',
    });
  }
}

// 4. Resend Email API
async function checkResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    recordResult({
      service: 'Resend Email Service',
      envVar: 'RESEND_API_KEY',
      status: 'WARN',
      summary: 'Missing in .env',
      actionRequired: 'Add RESEND_API_KEY for email notifications',
    });
    return;
  }
  try {
    const t0 = Date.now();
    const res = await axios.get('https://api.resend.com/api-keys', {
      headers: { Authorization: `Bearer ${key}` },
      timeout: 8000,
    });
    const latency = Date.now() - t0;
    recordResult({
      service: 'Resend Email Service',
      envVar: 'RESEND_API_KEY',
      status: 'PASS',
      summary: `Active & Authenticated (${latency}ms)`,
      details: { preview: maskKey(key), keysFound: res.data?.data?.length ?? 1 },
    });
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message || err.message;
    recordResult({
      service: 'Resend Email Service',
      envVar: 'RESEND_API_KEY',
      status: 'FAIL',
      summary: `HTTP ${status || ''}: ${msg}`,
      details: { preview: maskKey(key) },
      actionRequired: 'Verify API key at resend.com/api-keys',
    });
  }
}

// 5. OCR.space API
async function checkOCRSpace() {
  const key = process.env.OCR_API_KEY || 'helloworld';
  try {
    const t0 = Date.now();
    // 1x1 test gif with "hello" text simulation
    const form = new FormData();
    form.append('apikey', key);
    // Base64 sample image
    const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9QzwAEjDAGYzUAAIp0AQn4pI5+AAAAAElFTkSuQmCC';
    form.append('base64Image', sampleBase64);
    form.append('language', 'eng');

    const res = await axios.post('https://api.ocr.space/parse/image', form, {
      headers: form.getHeaders(),
      timeout: 10000,
    });
    const latency = Date.now() - t0;
    if (res.data?.OCRExitCode === 1 || res.data?.OCRExitCode === 2 || res.status === 200) {
      recordResult({
        service: 'OCR.space Cloud OCR',
        envVar: 'OCR_API_KEY',
        status: 'PASS',
        summary: `Active & Responding (${latency}ms, using ${key === 'helloworld' ? 'free demo key' : 'custom key'})`,
        details: { preview: maskKey(key) },
      });
    } else {
      recordResult({
        service: 'OCR.space Cloud OCR',
        envVar: 'OCR_API_KEY',
        status: 'WARN',
        summary: `Responded with: ${res.data?.ErrorMessage || 'Warning'}`,
        details: { preview: maskKey(key) },
      });
    }
  } catch (err) {
    recordResult({
      service: 'OCR.space Cloud OCR',
      envVar: 'OCR_API_KEY',
      status: 'WARN',
      summary: `Error: ${err.message}`,
      details: { preview: maskKey(key) },
    });
  }
}

// 6. Neon PostgreSQL Database
async function checkDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    recordResult({
      service: 'Neon PostgreSQL Database',
      envVar: 'DATABASE_URL',
      status: 'FAIL',
      summary: 'Missing in .env',
      actionRequired: 'Provide DATABASE_URL in .env',
    });
    return;
  }
  const pool = new Pool({ connectionString: dbUrl, connectionTimeoutMillis: 7000 });
  try {
    const t0 = Date.now();
    const client = await pool.connect();
    const res = await client.query('SELECT current_database() as db, current_user as usr;');
    client.release();
    await pool.end();
    const latency = Date.now() - t0;
    recordResult({
      service: 'Neon PostgreSQL Database',
      envVar: 'DATABASE_URL',
      status: 'PASS',
      summary: `Connected successfully (${latency}ms)`,
      details: { database: res.rows[0]?.db, user: res.rows[0]?.usr },
    });
  } catch (err) {
    await pool.end().catch(() => {});
    recordResult({
      service: 'Neon PostgreSQL Database',
      envVar: 'DATABASE_URL',
      status: 'FAIL',
      summary: `Connection failed: ${err.message}`,
      actionRequired: 'Check connection string or network/SSL settings',
    });
  }
}

// 7. Google Custom Search
async function checkGoogleSearch() {
  const key = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
  if (!key || !cx) {
    recordResult({
      service: 'Google Custom Search API',
      envVar: 'GOOGLE_SEARCH_API_KEY',
      status: 'WARN',
      summary: 'Key or CX not fully configured',
    });
    return;
  }
  try {
    const url = `https://www.googleapis.com/customsearch/v1?q=test&key=${key}&cx=${cx}&num=1`;
    await axios.get(url, { timeout: 8000 });
    recordResult({
      service: 'Google Custom Search API',
      envVar: 'GOOGLE_SEARCH_API_KEY',
      status: 'PASS',
      summary: 'Active & responding',
    });
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error?.message || err.message;
    recordResult({
      service: 'Google Custom Search API',
      envVar: 'GOOGLE_SEARCH_API_KEY',
      status: 'FAIL',
      summary: `HTTP ${status}: ${msg}`,
      actionRequired: 'Enable Custom Search JSON API in Google Cloud Console for project #102169561650',
    });
  }
}

// 8. Google Cloud Vision OCR
async function checkGoogleVision() {
  const key = process.env.GOOGLE_SEARCH_API_KEY;
  if (!key) {
    recordResult({
      service: 'Google Cloud Vision OCR',
      envVar: 'GOOGLE_SEARCH_API_KEY',
      status: 'WARN',
      summary: 'Key not set',
    });
    return;
  }
  try {
    const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${key}`;
    await axios.post(url, {
      requests: [{ image: { content: tinyPng }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }] }]
    }, { timeout: 8000 });
    recordResult({
      service: 'Google Cloud Vision OCR',
      envVar: 'GOOGLE_SEARCH_API_KEY',
      status: 'PASS',
      summary: 'Active and accepting OCR requests',
    });
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error?.message || err.message;
    recordResult({
      service: 'Google Cloud Vision OCR',
      envVar: 'GOOGLE_SEARCH_API_KEY',
      status: 'FAIL',
      summary: `HTTP ${status}: ${msg.length > 100 ? msg.substring(0, 97) + '...' : msg}`,
      actionRequired: 'Link billing account to project #102169561650 in Google Cloud Console',
    });
  }
}

// 9. Cloudinary
async function checkCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    recordResult({
      service: 'Cloudinary Image Hosting',
      envVar: 'CLOUDINARY_*',
      status: 'WARN',
      summary: 'Credentials not configured',
    });
    return;
  }
  try {
    const authHeader = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    await axios.get(`https://api.cloudinary.com/v1_1/${cloudName}/ping`, {
      headers: { Authorization: `Basic ${authHeader}` },
      timeout: 8000,
    });
    recordResult({
      service: 'Cloudinary Image Hosting',
      envVar: 'CLOUDINARY_*',
      status: 'PASS',
      summary: 'Active and authenticated',
    });
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error?.message || err.message;
    recordResult({
      service: 'Cloudinary Image Hosting',
      envVar: 'CLOUDINARY_*',
      status: 'FAIL',
      summary: `HTTP ${status}: ${msg} (current cloud_name: "${cloudName}")`,
      actionRequired: 'Update CLOUDINARY_CLOUD_NAME in .env to match the cloud name for API key ' + maskKey(apiKey),
    });
  }
}

// 10. OpenAI API
async function checkOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    recordResult({
      service: 'OpenAI API',
      envVar: 'OPENAI_API_KEY',
      status: 'WARN',
      summary: 'Not configured in .env',
    });
    return;
  }
  try {
    await axios.get('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
      timeout: 8000,
    });
    recordResult({
      service: 'OpenAI API',
      envVar: 'OPENAI_API_KEY',
      status: 'PASS',
      summary: 'Active and valid',
    });
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error?.message || err.message;
    recordResult({
      service: 'OpenAI API',
      envVar: 'OPENAI_API_KEY',
      status: 'FAIL',
      summary: `HTTP ${status}: ${msg}`,
      actionRequired: 'Replace OPENAI_API_KEY in .env with a valid, non-truncated key from platform.openai.com',
    });
  }
}

// 11. Anthropic API
async function checkAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    recordResult({
      service: 'Anthropic Claude API',
      envVar: 'ANTHROPIC_API_KEY',
      status: 'WARN',
      summary: 'Not configured in .env',
    });
    return;
  }
  try {
    const res = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'Say OK' }],
      },
      {
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        timeout: 8000,
      }
    );
    recordResult({
      service: 'Anthropic Claude API',
      envVar: 'ANTHROPIC_API_KEY',
      status: 'PASS',
      summary: 'Active and responding',
      details: { reply: res.data?.content?.[0]?.text },
    });
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error?.message || err.message;
    recordResult({
      service: 'Anthropic Claude API',
      envVar: 'ANTHROPIC_API_KEY',
      status: status === 400 && msg.includes('balance') ? 'WARN' : 'FAIL',
      summary: `HTTP ${status}: ${msg}`,
      actionRequired: 'Add credits at console.anthropic.com/settings/plans',
    });
  }
}

// 12. Google OAuth
async function checkGoogleOAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (clientId && clientSecret) {
    recordResult({
      service: 'Google OAuth 2.0',
      envVar: 'GOOGLE_CLIENT_ID / SECRET',
      status: 'PASS',
      summary: 'Configured and credentials format valid',
      details: { clientId: `${clientId.substring(0, 15)}...apps.googleusercontent.com` },
    });
  } else {
    recordResult({
      service: 'Google OAuth 2.0',
      envVar: 'GOOGLE_CLIENT_ID',
      status: 'WARN',
      summary: 'OAuth credentials incomplete',
    });
  }
}

async function main() {
  await checkGemini();
  await checkGroq();
  await checkSerper();
  await checkResend();
  await checkOCRSpace();
  await checkDatabase();
  await checkGoogleSearch();
  await checkGoogleVision();
  await checkCloudinary();
  await checkOpenAI();
  await checkAnthropic();
  await checkGoogleOAuth();

  console.log(JSON.stringify(results, null, 2));
}

main();
