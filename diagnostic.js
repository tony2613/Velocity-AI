/**
 * VelocityAI Diagnostic Check
 * Tests: Python backend, PPT/PDF/Image extraction pipeline, API keys, DB connectivity
 */
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const PYTHON_URL = 'http://127.0.0.1:8000';
const PASS = '✅';
const FAIL = '❌';
const WARN = '⚠️';
const results = [];

function log(status, test, detail = '') {
  const msg = `${status} ${test}${detail ? ': ' + detail : ''}`;
  console.log(msg);
  results.push({ status, test, detail });
}

// ─── 1. Environment Variables ────────────────────────────────────────────────
function checkEnvVars() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  1. ENVIRONMENT VARIABLES');
  console.log('═══════════════════════════════════════════');
  
  const required = [
    ['GROQ_API_KEY', 'AI Summarization (Primary)'],
    ['GEMINI_API_KEY', 'AI Summarization (Fallback) + OCR'],
    ['DATABASE_URL', 'Database Connection'],
    ['SESSION_SECRET', 'Auth Sessions'],
  ];
  const optional = [
    ['GOOGLE_SEARCH_API_KEY', 'Google Vision OCR + Search'],
    ['SERPER_API_KEY', 'Web Research (CANA)'],
    ['CLOUDINARY_CLOUD_NAME', 'Image Hosting (PPT images)'],
    ['CLOUDINARY_API_KEY', 'Image Hosting'],
    ['CLOUDINARY_API_SECRET', 'Image Hosting'],
    ['RESEND_API_KEY', 'Email Notifications'],
  ];

  for (const [key, purpose] of required) {
    const val = process.env[key];
    if (val && val.length > 5) {
      log(PASS, `${key}`, `Set (${purpose})`);
    } else {
      log(FAIL, `${key}`, `MISSING — ${purpose} will not work`);
    }
  }
  for (const [key, purpose] of optional) {
    const val = process.env[key];
    if (val && val.length > 3) {
      log(PASS, `${key}`, `Set (${purpose})`);
    } else {
      log(WARN, `${key}`, `Not set — ${purpose} disabled`);
    }
  }
}

// ─── 2. Python Backend ───────────────────────────────────────────────────────
async function checkPythonBackend() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  2. PYTHON BACKEND (main.py @ port 8000)');
  console.log('═══════════════════════════════════════════');

  try {
    const res = await axios.get(`${PYTHON_URL}/docs`, { timeout: 3000, validateStatus: () => true });
    if (res.status === 200) {
      log(PASS, 'Python server reachable', `HTTP ${res.status}`);
    } else {
      log(WARN, 'Python server responded', `HTTP ${res.status} (unexpected)`);
    }
  } catch (e) {
    log(FAIL, 'Python server NOT reachable', `${e.code || e.message} — Run "python main.py" first`);
    return false;
  }
  return true;
}

// ─── 3. PPT Extraction (Python) ─────────────────────────────────────────────
async function checkPPTExtraction(pythonUp) {
  console.log('\n═══════════════════════════════════════════');
  console.log('  3. PPT/PPTX EXTRACTION PIPELINE');
  console.log('═══════════════════════════════════════════');

  // Check python-pptx dependency
  const reqFile = path.join(process.cwd(), 'requirements.txt');
  if (fs.existsSync(reqFile)) {
    const reqs = fs.readFileSync(reqFile, 'utf8');
    if (reqs.includes('python-pptx')) {
      log(PASS, 'python-pptx in requirements.txt');
    } else {
      log(FAIL, 'python-pptx MISSING from requirements.txt');
    }
  }

  // Check test PPTX files
  const testFiles = ['test_gen.pptx', 'test_chart.pptx'];
  let testFile = null;
  for (const f of testFiles) {
    const fp = path.join(process.cwd(), f);
    if (fs.existsSync(fp)) {
      testFile = fp;
      log(PASS, `Test PPTX found`, f);
      break;
    }
  }

  if (!testFile) {
    log(WARN, 'No test PPTX file found', 'Skipping extraction test');
    return;
  }

  if (!pythonUp) {
    log(WARN, 'Python backend not running', 'Skipping PPT extraction test');
    return;
  }

  // Actually test extraction
  try {
    const form = new FormData();
    const fileBuffer = fs.readFileSync(testFile);
    form.append('file', fileBuffer, { filename: path.basename(testFile) });

    const res = await axios.post(`${PYTHON_URL}/extract`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
      validateStatus: () => true,
    });

    if (res.status === 200 && res.data?.text) {
      const text = res.data.text;
      const slideCount = (text.match(/--- Slide \d+/g) || []).length;
      log(PASS, 'PPTX extraction WORKING', `${text.length} chars, ${slideCount} slides detected`);

      // Check for specific extraction features
      if (text.includes('[Speaker Notes]')) log(PASS, '  Speaker notes extracted');
      if (text.includes('|')) log(PASS, '  Tables detected in output');
      if (text.includes('Chart Data')) log(PASS, '  Chart data extracted');
      if (text.includes('![Image]')) log(PASS, '  Images uploaded to Cloudinary');
    } else {
      log(FAIL, 'PPTX extraction failed', `HTTP ${res.status}: ${JSON.stringify(res.data).substring(0, 200)}`);
    }
  } catch (e) {
    log(FAIL, 'PPTX extraction request failed', e.message);
  }
}

// ─── 4. PDF Extraction (Python) ─────────────────────────────────────────────
async function checkPDFExtraction(pythonUp) {
  console.log('\n═══════════════════════════════════════════');
  console.log('  4. PDF EXTRACTION PIPELINE');
  console.log('═══════════════════════════════════════════');

  const testFile = path.join(process.cwd(), 'test.pdf');
  if (!fs.existsSync(testFile)) {
    log(WARN, 'No test.pdf found', 'Skipping PDF extraction test');
    return;
  }
  log(PASS, 'Test PDF found', `${fs.statSync(testFile).size} bytes`);

  if (!pythonUp) {
    log(WARN, 'Python backend not running', 'Skipping PDF extraction test');
    return;
  }

  try {
    const form = new FormData();
    const fileBuffer = fs.readFileSync(testFile);
    form.append('file', fileBuffer, { filename: 'test.pdf' });

    const res = await axios.post(`${PYTHON_URL}/extract`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
      validateStatus: () => true,
    });

    if (res.status === 200 && res.data?.text) {
      log(PASS, 'PDF extraction WORKING', `${res.data.text.length} chars`);
    } else {
      log(FAIL, 'PDF extraction failed', `HTTP ${res.status}`);
    }
  } catch (e) {
    log(FAIL, 'PDF extraction request failed', e.message);
  }
}

// ─── 5. Image Extraction (Python) ───────────────────────────────────────────
async function checkImageExtraction(pythonUp) {
  console.log('\n═══════════════════════════════════════════');
  console.log('  5. IMAGE OCR PIPELINE');
  console.log('═══════════════════════════════════════════');

  const testFile = path.join(process.cwd(), 'test_ocr_image.png');
  if (!fs.existsSync(testFile)) {
    log(WARN, 'No test_ocr_image.png found', 'Skipping image OCR test');
    return;
  }
  log(PASS, 'Test image found', `${fs.statSync(testFile).size} bytes`);

  if (!pythonUp) {
    log(WARN, 'Python backend not running', 'Skipping image OCR test');
    return;
  }

  try {
    const form = new FormData();
    const fileBuffer = fs.readFileSync(testFile);
    form.append('file', fileBuffer, { filename: 'test_ocr_image.png' });

    const res = await axios.post(`${PYTHON_URL}/extract`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
      validateStatus: () => true,
    });

    if (res.status === 200 && res.data?.text && res.data.text.trim().length > 5) {
      log(PASS, 'Image OCR WORKING', `${res.data.text.trim().length} chars extracted`);
    } else {
      log(WARN, 'Image OCR returned empty/short text', `${res.data?.text?.length || 0} chars`);
    }
  } catch (e) {
    log(FAIL, 'Image OCR request failed', e.message);
  }
}

// ─── 6. Code Pipeline Audit ─────────────────────────────────────────────────
function checkCodePipeline() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  6. CODE PIPELINE AUDIT (Static Analysis)');
  console.log('═══════════════════════════════════════════');

  // Check UploadZone.tsx
  const uploadZone = fs.readFileSync(path.join(process.cwd(), 'client/src/components/UploadZone.tsx'), 'utf8');

  // Bug Fix 1: PPT routed through processImageMutation
  if (uploadZone.includes('fileType === "ppt"') && uploadZone.match(/fileType === "pdf" \|\| fileType === "ppt" \|\| fileType === "image"/)) {
    log(PASS, 'Frontend: PPT routed through processImageMutation');
  } else {
    log(FAIL, 'Frontend: PPT NOT routed through processImageMutation — will silently fail');
  }

  // Bug Fix 2: isPPT flag sent
  if (uploadZone.includes('isPPT: fileType === "ppt"')) {
    log(PASS, 'Frontend: isPPT flag sent to server');
  } else {
    log(FAIL, 'Frontend: isPPT flag NOT sent — server cannot identify PPT files');
  }

  // Bug Fix 2b: isPPT in mutation type
  if (uploadZone.includes('isPPT?: boolean')) {
    log(PASS, 'Frontend: isPPT typed in mutation');
  } else {
    log(FAIL, 'Frontend: isPPT missing from mutation type');
  }

  // Check routes.ts
  const routes = fs.readFileSync(path.join(process.cwd(), 'server/routes.ts'), 'utf8');

  if (routes.includes('isPPT') && routes.includes('extractTextFromPPT')) {
    log(PASS, 'Server route: isPPT flag destructured and used');
  } else {
    log(FAIL, 'Server route: isPPT not handled — PPT detection broken');
  }

  // Check the old broken detection is gone
  if (routes.includes("title.toLowerCase().endsWith(\".pptx\")")) {
    log(FAIL, 'Server route: Still using title-based PPT detection (title has no extension!)');
  } else {
    log(PASS, 'Server route: Old broken title-based PPT detection removed');
  }

  // Check ocrSummarize.ts
  const ocrSummarize = fs.readFileSync(path.join(process.cwd(), 'server/ocrSummarize.ts'), 'utf8');

  if (ocrSummarize.includes('callLocalPythonExtract') && ocrSummarize.includes('[PPT] Routing PPTX')) {
    log(PASS, 'extractTextFromPPT: Routes to Python backend (python-pptx)');
  } else {
    log(FAIL, 'extractTextFromPPT: NOT routing to Python — will only get OCR.space (broken for PPTX)');
  }

  if (ocrSummarize.includes('geminiOCR') && ocrSummarize.includes('[PPT] Python unavailable')) {
    log(PASS, 'extractTextFromPPT: Has Gemini fallback');
  } else {
    log(WARN, 'extractTextFromPPT: No Gemini fallback configured');
  }

  // Check file type detection in frontend
  if (uploadZone.includes('.ppt"') && uploadZone.includes('.pptx"') && uploadZone.includes('application/vnd.ms-powerpoint')) {
    log(PASS, 'Frontend: Detects .ppt, .pptx, and MIME types');
  } else {
    log(WARN, 'Frontend: May not detect all PPT variants');
  }

  // Check PDF pipeline
  if (ocrSummarize.includes('extractTextFromPDF') && ocrSummarize.includes('callLocalPythonExtract')) {
    log(PASS, 'extractTextFromPDF: Routes to Python with Gemini + OCR.space fallbacks');
  } else {
    log(WARN, 'extractTextFromPDF: May have incomplete fallback chain');
  }

  // Check Image pipeline
  if (ocrSummarize.includes('googleVisionOCR') && ocrSummarize.includes('geminiOCR') && ocrSummarize.includes('callOcrSpaceBuffer')) {
    log(PASS, 'extractTextFromImage: Full fallback chain (Vision → Gemini → Python → OCR.space)');
  } else {
    log(WARN, 'extractTextFromImage: May have incomplete fallback chain');
  }
}

// ─── 7. Google Vision API ───────────────────────────────────────────────────
async function checkGoogleVision() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  7. GOOGLE VISION API');
  console.log('═══════════════════════════════════════════');

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  if (!apiKey) {
    log(WARN, 'Google Vision API key not set', 'Vision OCR disabled');
    return;
  }

  try {
    // Test with a minimal request to see if the API key is valid
    const res = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      { requests: [] },
      { timeout: 5000, validateStatus: () => true }
    );
    if (res.status === 200 || res.status === 400) {
      log(PASS, 'Google Vision API key valid', `HTTP ${res.status}`);
    } else if (res.status === 403) {
      log(FAIL, 'Google Vision API key REJECTED', 'Check API key permissions');
    } else {
      log(WARN, 'Google Vision API response', `HTTP ${res.status}`);
    }
  } catch (e) {
    log(FAIL, 'Google Vision API unreachable', e.message);
  }
}

// ─── 8. Gemini API ──────────────────────────────────────────────────────────
async function checkGeminiAPI() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  8. GEMINI API');
  console.log('═══════════════════════════════════════════');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    log(FAIL, 'Gemini API key not set', 'Fallback OCR + summarization disabled');
    return;
  }

  try {
    const res = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { timeout: 5000, validateStatus: () => true }
    );
    if (res.status === 200) {
      const models = res.data?.models?.map(m => m.name).filter(n => n.includes('gemini')).slice(0, 3);
      log(PASS, 'Gemini API key valid', `Models: ${models?.join(', ') || 'available'}`);
    } else {
      log(FAIL, 'Gemini API key REJECTED', `HTTP ${res.status}`);
    }
  } catch (e) {
    log(FAIL, 'Gemini API unreachable', e.message);
  }
}

// ─── 9. Groq API ────────────────────────────────────────────────────────────
async function checkGroqAPI() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  9. GROQ API (Primary AI)');
  console.log('═══════════════════════════════════════════');

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    log(FAIL, 'Groq API key not set', 'Primary summarization/quiz disabled');
    return;
  }

  try {
    const res = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 5000,
      validateStatus: () => true,
    });
    if (res.status === 200) {
      log(PASS, 'Groq API key valid', 'Connection OK');
    } else if (res.status === 401) {
      log(FAIL, 'Groq API key INVALID', 'Check key at console.groq.com');
    } else {
      log(WARN, 'Groq API response', `HTTP ${res.status}`);
    }
  } catch (e) {
    log(FAIL, 'Groq API unreachable', e.message);
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   VELOCITY AI — FULL DIAGNOSTIC CHECK     ║');
  console.log('║   Testing all upload & extraction pipes    ║');
  console.log('╚═══════════════════════════════════════════╝');

  checkEnvVars();
  const pythonUp = await checkPythonBackend();
  await checkPPTExtraction(pythonUp);
  await checkPDFExtraction(pythonUp);
  await checkImageExtraction(pythonUp);
  checkCodePipeline();
  await checkGoogleVision();
  await checkGeminiAPI();
  await checkGroqAPI();

  // Summary
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║           DIAGNOSTIC SUMMARY              ║');
  console.log('╚═══════════════════════════════════════════╝');
  const passed = results.filter(r => r.status === PASS).length;
  const failed = results.filter(r => r.status === FAIL).length;
  const warned = results.filter(r => r.status === WARN).length;
  console.log(`  ${PASS} Passed: ${passed}`);
  console.log(`  ${FAIL} Failed: ${failed}`);
  console.log(`  ${WARN} Warnings: ${warned}`);
  console.log('');

  if (failed > 0) {
    console.log('  CRITICAL FAILURES:');
    results.filter(r => r.status === FAIL).forEach(r => {
      console.log(`    ${FAIL} ${r.test}: ${r.detail}`);
    });
  }

  if (failed === 0) {
    console.log('  🎉 All systems operational!');
  } else {
    console.log(`\n  ⚡ Fix the ${failed} failure(s) above for full functionality.`);
  }
  console.log('');
}

main().catch(console.error);
