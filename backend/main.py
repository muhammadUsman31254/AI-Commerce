from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import connect_db, close_db
from auth.routes import router as auth_router
from routes.products import router as products_router
from routes.orders import router as orders_router
from routes.inventory import router as inventory_router
from routes.analytics import router as analytics_router
from routes.voice import router as voice_router
from routes.chat import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    try:
        from agent.agent import init_agent
        init_agent()
    except Exception as e:
        print(f"WARNING: Agent init skipped — {e}")
    yield
    await close_db()


app = FastAPI(title="AI-Commerce API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(inventory_router)
app.include_router(analytics_router)
app.include_router(voice_router)
app.include_router(chat_router)


@app.get("/")
async def root():
    return {"status": "AI-Commerce API running"}
