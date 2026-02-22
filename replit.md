# AI-Powered Student Study Platform

## Project Overview

A modern web application for students to upload study materials in multiple formats and generate AI-powered summaries and quizzes. Built with React, Express, and OpenAI's GPT-4o-mini model.

**Aesthetic**: Purple and black theme with glowing effects and clean, modern UI.

## Architecture

### Frontend (React + TypeScript)
- **Pages**: Home, My Notes, Quizzes, Upload Notes
- **Upload System**: 5 tabs for different input methods
  - Text paste
  - File upload (TXT, PDF, DOC)
  - PDF processing
  - Image upload with OCR
  - YouTube link extraction
- **UI Components**: Shadcn components with Tailwind CSS
- **Routing**: Wouter for client-side navigation

### Backend (Express + Node.js)
- **API Routes**: Notes, Summaries, Quizzes, OCR processing
- **Storage**: In-memory MemStorage (no database)
- **Text Extraction**:
  - PDF: pdf-parse library for direct text extraction
  - Images: OCR.space cloud API (free) for reliable OCR
- **Summarization**: OpenAI GPT-4o-mini for AI-powered content summaries
- **Quiz Generation**: Automatic quiz creation from note content

## Key Features

✅ **Multi-format Upload**:
- Direct text input
- File uploads (TXT, PDF, DOC)
- Image/syllabus photos with OCR
- PDF processing with text extraction
- YouTube transcript extraction

✅ **AI Summarization**:
- Cloud-based OCR for images (OCR.space)
- PDF text extraction with pdf-parse
- GPT-4o-mini powered summarization
- Key points extraction
- Automatic summary generation on upload

✅ **Quiz Generation**:
- Create quizzes from any note
- Multiple choice format
- AI-generated questions from content

✅ **Note Organization**:
- Organize by subject
- View all notes
- Generate summaries on demand
- Delete/manage notes

## Technology Stack

**Frontend**:
- React 18
- TypeScript
- Tailwind CSS + Shadcn components
- React Query (data fetching)
- React Hook Form (forms)
- Wouter (routing)

**Backend**:
- Express.js
- Node.js
- OpenAI API (gpt-4o-mini)
- pdf-parse (PDF extraction)
- OCR.space API (image OCR)

**Styling**:
- Tailwind CSS
- Custom CSS variables (purple/black theme)
- Lucide icons

## Current Status

✅ **Completed**:
- Core UI with purple/black aesthetic
- Multi-format upload system (5 tabs)
- PDF text extraction
- Image OCR via cloud API
- AI summarization pipeline
- Note management (CRUD)
- Quiz generation
- Full frontend-backend integration

✅ **Running**:
- Express backend on port 5000
- React frontend on port 5000 (via Vite)
- OpenAI integration active (requires API key)

## Optional: Python Microservice

A FastAPI-based Python service is available (`main.py`) for alternative OCR/summarization:
- More robust PDF handling
- Sumy-based extractive summarization
- Can run on separate port (8000)
- Use for testing or comparison

To use:
```bash
pip install fastapi uvicorn python-multipart Pillow requests PyMuPDF sumy
python main.py
```

## Environment Variables

**Node.js Backend (Required)**:
- `OPENAI_API_KEY`: OpenAI API key for GPT-4o-mini

**Python Microservice (Optional)**:
- `OCR_API_KEY`: OCR.space API key (defaults to free demo key "helloworld")
  - Set this to a personal key if you hit rate limits with the demo key

## File Structure

```
├── client/
│   └── src/
│       ├── pages/ (My Notes, Quizzes, Upload)
│       ├── components/ (UploadZone, Navbar, etc.)
│       └── App.tsx
├── server/
│   ├── routes.ts (API endpoints)
│   ├── storage.ts (Data persistence)
│   ├── ocr-service.ts (OCR.space integration)
│   ├── pdf-service.ts (PDF extraction)
│   └── index.ts
├── shared/
│   └── schema.ts (Data models)
├── main.py (Optional Python service)
└── replit.md (This file)
```

## User Preferences

- **Design**: Purple and black aesthetic with purple accents in top-left corner
- **Storage**: In-memory (no persistent database needed)
- **OCR Method**: Cloud-based (OCR.space) for reliability
- **AI Model**: OpenAI GPT-4o-mini for cost efficiency

## Notes

- All file uploads are processed with automatic text extraction
- Summaries are generated on-demand or automatically during upload
- App uses in-memory storage - data resets on server restart
- OCR.space uses free API key (rate-limited but suitable for demos)
- Python service is optional and runs independently
