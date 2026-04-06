# AI-Commerce — Claude Code Project Context

## Project Overview

AI-Commerce is an AI-integrated e-commerce platform designed specifically to empower home-based Pakistani sellers — particularly those with low digital literacy — to manage an online store through voice commands, AI-driven assistance, and automated e-commerce workflows. Sellers can interact entirely through voice in Urdu or Roman Urdu, or use the full manual dashboard interface just like any modern e-commerce platform. The MVP scope is seller-side only. The demo seller persona is "Clay & Craft," a handmade pottery and ceramics store selling products like handmade mugs, clay bowls, decorative vases, and ceramic plates.

The platform has two modes of operation that must coexist seamlessly. The first is a full manual e-commerce management system — comparable to Shopify — with a clean, professional dashboard for managing products, orders, inventory, and analytics. The second is an AI-enhanced layer on top of that system: a floating voice assistant button that lets sellers speak commands in Urdu, have products auto-listed from a photo, receive AI-generated analytics insights, and get audio feedback for every action. The UI/UX design language is inspired by Shopify: modern, polished, minimal, and trustworthy.

---

## Architecture Overview

The core voice pipeline flows as follows. The seller taps the Floating Action Button (FAB) on the dashboard and speaks a command in Urdu or Roman Urdu. The audio is sent to AssemblyAI for real-time speech-to-text transcription and returned as a raw Urdu text string. That transcript is passed to a LangChain agent running on the FastAPI backend, which uses Groq's Llama 3.3 70B model for fast LLM inference. The LangChain agent detects the seller's intent and routes the command to the appropriate `@tool` function. Each tool function performs the actual operation — reading from or writing to MongoDB Atlas, uploading images to Cloudinary, or calling Google Gemini for vision-based product description generation. The agent assembles a natural language response in Urdu, which is sent to ElevenLabs for text-to-speech conversion, and the resulting audio is played back to the seller confirming the action.

```
Seller speaks (Urdu / Roman Urdu)
    ↓
AssemblyAI STT  →  Urdu transcript string
    ↓
FastAPI /voice-command endpoint
    ↓
LangChain Agent (Groq — Llama 3.3 70B)
    Intent detection + tool routing
    ↓
@tool functions:
    ├── add_product()       → MongoDB Atlas (insert) + Cloudinary (image)
    ├── update_stock()      → MongoDB Atlas (update)
    ├── view_orders()       → MongoDB Atlas (read)
    ├── confirm_order()     → MongoDB Atlas (update)
    ├── reject_order()      → MongoDB Atlas (update)
    ├── get_analytics()     → MongoDB Atlas (aggregate)
    └── analyze_photo()     → Google Gemini Vision API
    ↓
Response text (Urdu)
    ↓
ElevenLabs TTS  →  Audio
    ↓
Audio played back to seller in browser
```

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 14 + Tailwind CSS | PWA, App Router |
| STT | AssemblyAI API | Real-time Urdu transcription |
| LLM | Groq API — `llama-3.3-70b-versatile` | Fast inference, intent parsing and tool routing |
| Vision AI | Google Gemini 1.5 Flash API | Product photo → auto-generated title and description |
| TTS | ElevenLabs API | Audio feedback to seller in Urdu |
| AI Framework | LangChain (Python) | `@tool` decorator, `create_agent`, `InMemorySaver` for session memory |
| Backend | FastAPI (Python) | Async REST API |
| Database | MongoDB Atlas | Flexible document schema |
| Image Storage | Cloudinary | Product image hosting and transformation |
| Auth | JWT (manual, FastAPI) | Seller authentication |

---

## Project Structure

```
ai-commerce/
├── frontend/                        # Next.js 14 App Router
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Redirect to /dashboard
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx           # Sidebar + topbar shell
│   │       ├── page.tsx             # Dashboard home / overview
│   │       ├── products/
│   │       │   ├── page.tsx         # Product listing
│   │       │   ├── add/page.tsx     # Add product form
│   │       │   └── [id]/page.tsx    # Edit product
│   │       ├── orders/
│   │       │   ├── page.tsx         # Orders list
│   │       │   └── [id]/page.tsx    # Order detail
│   │       ├── inventory/page.tsx   # Stock management
│   │       └── analytics/page.tsx   # Sales analytics
│   ├── components/
│   │   ├── ui/                      # Reusable primitives (Button, Card, Badge, Modal)
│   │   ├── layout/                  # Sidebar, Topbar, PageHeader
│   │   ├── dashboard/               # StatsCard, RecentOrders, LowStockAlert
│   │   ├── products/                # ProductTable, ProductForm, ImageUpload
│   │   ├── orders/                  # OrdersTable, OrderStatusBadge, OrderDetail
│   │   └── voice/
│   │       ├── VoiceFAB.tsx         # Floating Action Button — mic trigger
│   │       ├── VoiceModal.tsx       # Recording UI with waveform + transcript
│   │       └── useVoiceAssistant.ts # Hook: record → AssemblyAI → backend → TTS
│   └── lib/
│       ├── api.ts                   # Axios instance pointing to FastAPI
│       └── auth.ts                  # JWT helpers
│
├── backend/                         # FastAPI (Python)
│   ├── main.py                      # FastAPI app entry point
│   ├── config.py                    # Environment variables and settings
│   ├── database.py                  # MongoDB Atlas connection (Motor async)
│   ├── auth/
│   │   ├── jwt.py                   # JWT encode/decode
│   │   └── routes.py                # /auth/register, /auth/login
│   ├── routes/
│   │   ├── products.py              # CRUD /products
│   │   ├── orders.py                # CRUD /orders
│   │   ├── inventory.py             # /inventory
│   │   ├── analytics.py             # /analytics
│   │   └── voice.py                 # /voice-command (main AI pipeline endpoint)
│   ├── agent/
│   │   ├── agent.py                 # LangChain create_agent setup
│   │   ├── tools.py                 # All @tool definitions
│   │   └── prompts.py               # System prompt (Urdu-aware)
│   ├── services/
│   │   ├── assemblyai_stt.py        # STT: audio → Urdu text
│   │   ├── elevenlabs_tts.py        # TTS: Urdu text → audio
│   │   ├── cloudinary_service.py    # Image upload
│   │   └── gemini_vision.py         # Photo → product description
│   └── models/
│       ├── seller.py                # Seller Pydantic model
│       ├── product.py               # Product Pydantic model
│       └── order.py                 # Order Pydantic model
```

---

## MongoDB Collections and Schema

### sellers
```json
{
  "_id": "ObjectId",
  "name": "Clay & Craft",
  "email": "seller@example.com",
  "password_hash": "string",
  "phone": "+92-xxx-xxxxxxx",
  "store_name": "Clay & Craft",
  "store_description": "Handmade pottery and ceramics",
  "created_at": "ISODate"
}
```

### products
```json
{
  "_id": "ObjectId",
  "seller_id": "ObjectId (ref: sellers)",
  "name": "Handmade Clay Mug",
  "description": "Hand-thrown stoneware mug with earthy glaze finish",
  "price": 1500,
  "quantity": 25,
  "category": "Mugs",
  "images": ["https://cloudinary.com/..."],
  "status": "active | inactive | out_of_stock",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### orders
```json
{
  "_id": "ObjectId",
  "seller_id": "ObjectId (ref: sellers)",
  "buyer_name": "string",
  "buyer_phone": "string",
  "items": [
    {
      "product_id": "ObjectId",
      "product_name": "string",
      "quantity": 2,
      "price": 1500
    }
  ],
  "total_amount": 3000,
  "status": "new | confirmed | shipped | delivered | rejected",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

---

## Backend: LangChain Agent + Tools

The LangChain agent is initialized once per FastAPI app startup and handles all voice command processing. Each seller session is identified by their `seller_id`, which is used as the `thread_id` for `InMemorySaver` — this gives each seller their own conversational memory within a session so multi-turn commands work (e.g. seller says "lawn suit add karo" then follows up with "price 1500 hai").

### System Prompt (agent/prompts.py)

```python
SYSTEM_PROMPT = """
Aap AI-Commerce platform ke liye ek helpful AI assistant hain.
Seller Urdu ya Roman Urdu mein baat karta hai.
Unki baat samjho, intent pehchano, aur sahi tool call karo.

Available intents:
- add_product: product add karna store mein
- update_stock: stock/quantity update karna
- view_orders: orders dekhna (status ke saath filter)
- confirm_order: order confirm karna
- reject_order: order reject karna
- get_analytics: sales stats ya summary dekhna
- analyze_photo: photo se product description banana

Agar koi zaruri field missing ho (jaise price ya quantity), toh seller se dobara poochho.
Har response short aur clear Urdu mein do.
Confirmation messages mein action ka summary zarur batao.
"""
```

### Tool Definitions (agent/tools.py)

```python
from langchain.tools import tool
from database import db

@tool
async def add_product(product_name: str, price: float, quantity: int, description: str = "") -> str:
    """Add a new product to the seller's store in MongoDB."""
    await db.products.insert_one({
        "seller_id": current_seller_id,
        "name": product_name,
        "price": price,
        "quantity": quantity,
        "description": description,
        "status": "active",
    })
    return f"{product_name} successfully add ho gaya! Price: Rs.{price}, Stock: {quantity} pieces."

@tool
async def update_stock(product_name: str, quantity: int) -> str:
    """Update the stock quantity of an existing product."""
    await db.products.update_one(
        {"name": {"$regex": product_name, "$options": "i"}, "seller_id": current_seller_id},
        {"$set": {"quantity": quantity}}
    )
    return f"{product_name} ka stock update ho gaya. Naya stock: {quantity} pieces."

@tool
async def view_orders(status: str = "new") -> str:
    """Fetch seller orders filtered by status. Status options: new, confirmed, shipped, delivered, rejected, all."""
    query = {"seller_id": current_seller_id}
    if status != "all":
        query["status"] = status
    orders = await db.orders.find(query).to_list(20)
    if not orders:
        return f"Koi {status} orders nahi hain abhi."
    summary = "\n".join([f"Order #{str(o['_id'])[-6:]}: {o['buyer_name']} — Rs.{o['total_amount']}" for o in orders])
    return f"Aap ke {status} orders:\n{summary}"

@tool
async def confirm_order(order_id: str) -> str:
    """Confirm a pending order by its ID."""
    await db.orders.update_one({"_id": ObjectId(order_id)}, {"$set": {"status": "confirmed"}})
    return f"Order #{order_id[-6:]} confirm ho gaya!"

@tool
async def reject_order(order_id: str, reason: str = "") -> str:
    """Reject an order by its ID with an optional reason."""
    await db.orders.update_one({"_id": ObjectId(order_id)}, {"$set": {"status": "rejected", "rejection_reason": reason}})
    return f"Order #{order_id[-6:]} reject ho gaya."

@tool
async def get_analytics(period: str = "today") -> str:
    """Get sales analytics summary for a given period: today, week, month."""
    # aggregate total sales, order count, top product for the period
    return "Aaj aap ne 5 orders receive kiye, total sales Rs.12,500. Sab se zyada bikne wala product: Handmade Clay Mug."

@tool
async def analyze_photo(image_url: str) -> str:
    """Use Google Gemini Vision to analyze a product photo and return a suggested title and description."""
    from services.gemini_vision import generate_product_description
    result = await generate_product_description(image_url)
    return f"Product: {result['title']}\nDescription: {result['description']}\nSuggested price: Rs.{result['suggested_price']}"
```

### Agent Initialization (agent/agent.py)

```python
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langgraph.checkpoint.memory import InMemorySaver
from .tools import add_product, update_stock, view_orders, confirm_order, reject_order, get_analytics, analyze_photo
from .prompts import SYSTEM_PROMPT

model = init_chat_model("groq/llama-3.3-70b-versatile", temperature=0)
checkpointer = InMemorySaver()

agent = create_agent(
    model=model,
    system_prompt=SYSTEM_PROMPT,
    tools=[add_product, update_stock, view_orders, confirm_order, reject_order, get_analytics, analyze_photo],
    checkpointer=checkpointer
)
```

### Voice Endpoint (routes/voice.py)

```python
@app.post("/voice-command")
async def voice_command(audio: UploadFile, seller_id: str = Depends(get_current_seller)):
    # 1. STT
    transcript = await assemblyai_transcribe(audio)

    # 2. LangChain agent
    config = {"configurable": {"thread_id": seller_id}}
    result = agent.invoke(
        {"messages": [{"role": "user", "content": transcript}]},
        config=config
    )
    reply_text = result["messages"][-1].content

    # 3. TTS
    audio_bytes = await elevenlabs_tts(reply_text)

    return {"transcript": transcript, "reply": reply_text, "audio_base64": base64.b64encode(audio_bytes).decode()}
```

---

## Frontend: Voice Assistant UI

The voice assistant is a Floating Action Button (FAB) fixed to the bottom-right of every dashboard page. When tapped, it opens a centered modal overlay. The modal shows a pulsing waveform animation while recording, displays a live transcript as AssemblyAI processes the audio, shows the AI's text response, and auto-plays the ElevenLabs audio reply. The modal closes automatically after the reply finishes, or the seller can dismiss it manually.

### VoiceFAB.tsx
```tsx
// Floating mic button — fixed bottom-right, always visible on dashboard
// On click → open VoiceModal
// Show a subtle pulse animation when the AI is processing
```

### VoiceModal.tsx
```tsx
// States: idle → recording → processing → responding → done
// Shows: animated waveform (recording), transcript text, AI reply text
// Auto-plays audio response via HTMLAudioElement
// Plays base64 audio returned from /voice-command endpoint
```

### useVoiceAssistant.ts
```tsx
// 1. Start MediaRecorder → collect audio chunks
// 2. On stop → send audio blob to POST /voice-command
// 3. Receive { transcript, reply, audio_base64 }
// 4. Set transcript and reply in state
// 5. Play audio_base64 via new Audio("data:audio/mp3;base64,...")
```

---

## Frontend: Dashboard UI

The dashboard design is Shopify-inspired — clean white surfaces, subtle card shadows, a left sidebar with icon + label navigation, a topbar with store name and seller avatar, and consistent use of a teal/green primary color palette. Every page has a clear page header, breadcrumb, and primary action button.

### Pages to build:

**Dashboard Home (`/dashboard`):** Summary stats cards (Total Revenue, Total Orders, Active Products, Low Stock Alerts), a Recent Orders table showing the last 5 orders with status badges, a Top Products list, and a Quick Actions section (Add Product, View Orders, Check Analytics).

**Products (`/dashboard/products`):** Searchable, filterable product table with columns for image thumbnail, name, price, stock quantity, status badge, and action buttons (Edit, Delete). Primary action button: "Add Product". Supports bulk status updates.

**Add/Edit Product (`/dashboard/products/add`):** Form with fields for product name, description (with AI-generate button that calls Gemini via photo upload), price, quantity, category, and image upload (Cloudinary). The AI-generate button uploads the photo and auto-fills the name and description fields from Gemini's response.

**Orders (`/dashboard/orders`):** Orders table with filter tabs (All, New, Confirmed, Shipped, Delivered, Rejected). Each row shows order ID, buyer name, items summary, total amount, date, and status badge. Clicking a row opens an order detail panel with confirm/reject action buttons.

**Inventory (`/dashboard/inventory`):** Stock levels table with visual low-stock indicators (red badge when quantity < 5). Inline editable quantity fields for quick stock updates without navigating away.

**Analytics (`/dashboard/analytics`):** Revenue chart (line graph, daily/weekly/monthly toggle), Orders by Status donut chart, Top Selling Products bar chart, and an AI Insights card showing a natural language summary generated by the LangChain agent (e.g. "Your Handmade Clay Mug is your best seller this week. Consider restocking — only 3 units left.").

## API Reference Docs

- LangChain Quickstart: https://docs.langchain.com/oss/python/langchain/quickstart
- FastAPI: https://fastapi.tiangolo.com/
- Groq API: https://console.groq.com/docs/quickstart
- Google Gemini API: https://ai.google.dev/gemini-api/docs
- AssemblyAI API: https://www.assemblyai.com/docs/api-reference/overview
- ElevenLabs API: https://elevenlabs.io/docs/eleven-creative/playground/text-to-speech

---

## Build Order

Build the project in this sequence to avoid dependency blockers:

1. Backend: MongoDB connection + Pydantic models + JWT auth routes
2. Backend: Product and Order CRUD REST endpoints
3. Backend: Cloudinary image upload service + Gemini vision service
4. Backend: AssemblyAI STT + ElevenLabs TTS services
5. Backend: LangChain agent (tools + prompts + agent.py) + /voice-command endpoint
6. Frontend: Auth pages (login/register) + JWT storage
7. Frontend: Dashboard shell (sidebar, topbar, layout)
8. Frontend: Products pages (list, add, edit) with Cloudinary upload + Gemini AI-generate
9. Frontend: Orders pages (list, detail, confirm/reject)
10. Frontend: Inventory page
11. Frontend: Analytics page with charts
12. Frontend: VoiceFAB + VoiceModal + useVoiceAssistant hook (end-to-end voice pipeline)

---

## Demo Notes

The demo seller is "Clay & Craft" — a fictional Pakistani home-based pottery store. Seed the database with the following sample products: Handmade Clay Mug (Rs. 1,200, qty 15), Decorative Ceramic Vase (Rs. 3,500, qty 8), Clay Bowl Set (Rs. 2,800, qty 5), Hand-painted Ceramic Plate (Rs. 1,800, qty 12), Rustic Pottery Planter (Rs. 4,200, qty 3).

