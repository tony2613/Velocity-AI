# VelocityAI 🚀

> **AI-powered study tool that transforms notes, PDFs, and lectures into smart summaries and quizzes — built for students.**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **AI Summarization** | Upload PDFs, images, DOCX or paste text — get concise, structured summaries instantly |
| 🧠 **Quiz Generation** | Automatically generate multiple-choice and short-answer quizzes from any document |
| 🔍 **Research Mode** | Integrated Google search summarization for quick research assistance |
| 🗂️ **Note Dashboard** | Organize all your summaries and quizzes in one place |
| 🌍 **Multi-language UI** | Interface available in multiple languages |
| 📱 **PWA Support** | Works offline and installable as a mobile app |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui components
- Wouter (client-side routing)
- Framer Motion (animations)

**Backend**
- Node.js + Express
- Drizzle ORM + NeonDB (PostgreSQL)
- Passport.js (authentication)

**AI / ML**
- Groq API (LLM inference — Llama 3)
- Python + PyMuPDF + Tesseract OCR (document extraction)

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 20+
- Python 3.10+
- A Neon PostgreSQL database
- Groq API key

### 1. Clone the repo
```bash
git clone https://github.com/Tony2613/Velocity-AI.git
cd Velocity-AI
```

### 2. Install dependencies
```bash
npm install
pip install -r requirements.txt
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your keys:
```
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret
GROQ_API_KEY=gsk_...
GOOGLE_API_KEY=...
GOOGLE_CX=...
```

### 4. Push the database schema
```bash
npm run db:push
```

### 5. Start the dev server
```bash
npm run dev
```

The app runs at **http://localhost:5000**.

---

## 📁 Project Structure

```
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── pages/   # Route-level page components
│   │   ├── components/  # Shared UI components
│   │   └── hooks/   # Custom React hooks
├── server/          # Express API (TypeScript)
├── shared/          # Shared schemas (Drizzle + Zod)
├── main.py          # Python OCR extraction service
└── Dockerfile       # Production Docker image
```

---

## 📜 License

MIT © [Swapnil Tony Lewis](mailto:velocityai.app@gmail.com)
