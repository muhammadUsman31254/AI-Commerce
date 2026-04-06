"""
Seed the database with Clay & Craft demo data.
Run from the backend/ directory:
    python scripts/seed.py
"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
from datetime import datetime, timedelta
import random

from config import settings

SELLER_EMAIL = "seller@claycraft.pk"
SELLER_PASSWORD = "claycraft123"

PRODUCTS = [
    {"name": "Handmade Clay Mug",           "price": 1200, "quantity": 15, "category": "Mugs",       "description": "Hand-thrown stoneware mug with earthy glaze finish."},
    {"name": "Decorative Ceramic Vase",     "price": 3500, "quantity": 8,  "category": "Vases",      "description": "Elegant hand-painted vase with floral motifs."},
    {"name": "Clay Bowl Set",               "price": 2800, "quantity": 5,  "category": "Bowls",      "description": "Set of 3 rustic clay bowls, perfect for serving."},
    {"name": "Hand-painted Ceramic Plate",  "price": 1800, "quantity": 12, "category": "Plates",     "description": "Artisan ceramic plate with traditional Pakistani patterns."},
    {"name": "Rustic Pottery Planter",      "price": 4200, "quantity": 3,  "category": "Planters",   "description": "Handcrafted terracotta planter with drainage hole."},
]

BUYERS = ["Ahmed Khan", "Sara Ali", "Bilal Hussain", "Fatima Noor", "Usman Malik", "Ayesha Raza"]
PHONES = ["+92-300-1234567", "+92-311-9876543", "+92-333-5551234", "+92-321-4445678"]
STATUSES = ["new", "new", "confirmed", "confirmed", "shipped", "delivered", "rejected"]


async def seed():
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_database]

    # ── Seller ────────────────────────────────────────────────────────────────
    existing = await db.sellers.find_one({"email": SELLER_EMAIL})
    if existing:
        seller_id = existing["_id"]
        print(f"Seller already exists: {SELLER_EMAIL}")
    else:
        result = await db.sellers.insert_one({
            "name": "Clay & Craft",
            "email": SELLER_EMAIL,
            "password_hash": bcrypt.hashpw(SELLER_PASSWORD.encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
            "store_name": "Clay & Craft",
            "phone": "+92-300-0000000",
            "store_description": "Handmade pottery and ceramics",
            "created_at": datetime.utcnow(),
        })
        seller_id = result.inserted_id
        print(f"Created seller: {SELLER_EMAIL}")

    # ── Products ──────────────────────────────────────────────────────────────
    await db.products.delete_many({"seller_id": seller_id})
    product_ids = []
    for p in PRODUCTS:
        result = await db.products.insert_one({
            "seller_id": seller_id,
            "name": p["name"],
            "description": p["description"],
            "price": p["price"],
            "quantity": p["quantity"],
            "category": p["category"],
            "images": [],
            "status": "active" if p["quantity"] > 0 else "out_of_stock",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })
        product_ids.append((result.inserted_id, p))
        print(f"  + Product: {p['name']}")

    # ── Orders ────────────────────────────────────────────────────────────────
    await db.orders.delete_many({"seller_id": seller_id})
    for i in range(12):
        product_id, product = random.choice(product_ids)
        qty = random.randint(1, 3)
        created = datetime.utcnow() - timedelta(days=random.randint(0, 14), hours=random.randint(0, 23))
        status = random.choice(STATUSES)
        await db.orders.insert_one({
            "seller_id": seller_id,
            "buyer_name": random.choice(BUYERS),
            "buyer_phone": random.choice(PHONES),
            "items": [{
                "product_id": product_id,
                "product_name": product["name"],
                "quantity": qty,
                "price": product["price"],
            }],
            "total_amount": product["price"] * qty,
            "status": status,
            "rejection_reason": "Out of delivery area" if status == "rejected" else "",
            "created_at": created,
            "updated_at": created,
        })
    print(f"  + Created 12 sample orders")

    client.close()
    print("\nSeed complete. Login with:")
    print(f"  Email:    {SELLER_EMAIL}")
    print(f"  Password: {SELLER_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed())
