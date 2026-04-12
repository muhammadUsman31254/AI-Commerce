# AI-Commerce — Multilingual AI-Powered E-Commerce Dashboard

An AI-integrated e-commerce platform built for home-based Pakistani sellers, enabling store management through **voice commands in Urdu**, a full manual dashboard, and AI-driven automation.

> **FYP Project** — Muhammad Usman, 2026

---

## Features

- **Voice Assistant** — Speak commands in Urdu or Roman Urdu; the platform transcribes, understands, and acts
- **AI Chat Panel** — Text-based chat with the AI agent directly from the dashboard
- **Multilingual UI** — Full English / Urdu toggle with RTL layout and Noto Nastaliq Urdu font
- **Product Management** — Add, edit, delete products with Cloudinary image hosting
- **AI Product Captions** — Upload a product photo; Google Gemini generates the title and description automatically
- **Order Management** — View, confirm, and reject orders with status tracking
- **Inventory Tracking** — Real-time stock levels with low-stock alerts
- **Analytics Dashboard** — Revenue charts, top products, and AI-generated insights (Recharts)
- **JWT Authentication** — Secure seller login and registration

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | MongoDB Atlas (Motor async driver) |
| LLM / Agent | LangChain + Groq (`llama-3.3-70b-versatile`) |
| Speech-to-Text | AssemblyAI REST API |
| Text-to-Speech | ElevenLabs (`eleven_multilingual_v2`) |
| Vision AI | Google Gemini 2.5 Flash |
| Image Storage | Cloudinary |
| Auth | JWT (python-jose) |

---

## Project Structure

```
fyp/
├── backend/                  # FastAPI application
│   ├── main.py               # App entry point + CORS
│   ├── config.py             # Pydantic settings (reads .env)
│   ├── database.py           # MongoDB Atlas connection
│   ├── auth/                 # JWT helpers + /auth routes
│   ├── routes/               # REST endpoints (products, orders, inventory, analytics, voice, chat)
│   ├── agent/                # LangChain agent (agent.py, tools.py, prompts.py)
│   ├── services/             # AssemblyAI STT, ElevenLabs TTS, Cloudinary, Gemini Vision
│   └── models/               # Pydantic models (seller, product, order)
│
├── frontend/                 # Next.js 14 application
│   ├── app/                  # App Router pages (auth, dashboard)
│   ├── components/           # UI components (layout, products, orders, voice, chat)
│   ├── context/              # React Contexts (LanguageContext, ChatContext)
│   └── lib/                  # API client, auth helpers, i18n translations
│
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variable template
└── docs.md                   # Architecture and API reference docs
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB Atlas account
- API keys: Groq, AssemblyAI, ElevenLabs, Google Gemini, Cloudinary

### 1. Clone and configure environment

```bash
git clone https://github.com/<your-username>/ai-commerce-fyp.git
cd ai-commerce-fyp

# Copy env template and fill in your keys
cp .env.example .env
```

Edit `.env` with your actual API keys (see `.env.example` for all required variables).

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`

### 3. Frontend setup

```bash
cd frontend
npm install          # or: yarn install
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## Voice Pipeline

```
Seller speaks (Urdu / Roman Urdu)
    ↓
AssemblyAI STT  →  Urdu transcript
    ↓
FastAPI /voice-command
    ↓
LangChain Agent (Groq — Llama 3.3 70B)
    ↓
@tool functions → MongoDB / Cloudinary / Gemini
    ↓
Urdu reply text
    ↓
ElevenLabs TTS  →  Audio bytes (base64)
    ↓
Browser plays audio + chat panel shows transcript & reply
```

---

## API Keys Required

| Service | Where to get it |
|---|---|
| Groq | [console.groq.com](https://console.groq.com) |
| AssemblyAI | [assemblyai.com](https://www.assemblyai.com) |
| ElevenLabs | [elevenlabs.io](https://elevenlabs.io) → Profile → API Keys |
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) → Get API Key |
| Cloudinary | [cloudinary.com](https://cloudinary.com) → Dashboard |
| MongoDB Atlas | [cloud.mongodb.com](https://cloud.mongodb.com) |

---

## License

MIT
