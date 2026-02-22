// server/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');

// Configure multer to store file in memory (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/upload/pdf  -> accepts single file field "file"
router.post('/pdf', upload.single('file'), async (req, res) => {
  try {
    // req.file will exist because upload.single ran
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // pdf-parse accepts a Buffer
    const data = await pdfParse(req.file.buffer);

    // data.text contains the PDF text
    const fullText = data.text;

    // For now: return raw text. Later you can pipe fullText into your summarizer function.
    return res.json({ text: fullText });

    // EXAMPLE: if you have a summarizer function:
    // const summary = await summarizeText(fullText);
    // return res.json({ text: fullText, summary });
  } catch (err) {
    console.error('PDF parse error', err);
    return res.status(500).json({ error: 'Failed to parse PDF' });
  }
});

module.exports = router;