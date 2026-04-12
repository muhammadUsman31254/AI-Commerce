"""
Seed orders for demo@aic.com.
Run from the backend/ directory:
    python scripts/seed_demo_orders.py
"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import random
from config import settings

DEMO_EMAIL = "demo@aic.com"

BUYERS = [
    "Ahmed Khan", "Sara Ali", "Bilal Hussain", "Fatima Noor",
    "Usman Malik", "Ayesha Raza", "Hassan Sheikh", "Zara Siddiqui",
]
PHONES = [
    "+92-300-1234567", "+92-311-9876543",
    "+92-333-5551234", "+92-321-4445678",
]

SAMPLE_PRODUCTS = [
    {"name": "Handmade Handi",        "price": 500},
    {"name": "Clay Mug",              "price": 1200},
    {"name": "Ceramic Vase",          "price": 3500},
    {"name": "Pottery Bowl Set",      "price": 2800},
    {"name": "Decorative Plate",      "price": 1800},
    {"name": "Terracotta Planter",    "price": 4200},
    {"name": "Embroidered Cushion",   "price": 950},
    {"name": "Wooden Tray",           "price": 1500},
]

ORDERS = [
    # new
    {"buyer": "Ahmed Khan",     "phone": "+92-300-1234567", "status": "new",       "product": "Handmade Handi",      "qty": 2,  "days_ago": 0},
    {"buyer": "Sara Ali",       "phone": "+92-311-9876543", "status": "new",       "product": "Clay Mug",            "qty": 1,  "days_ago": 1},
    {"buyer": "Bilal Hussain",  "phone": "+92-333-5551234", "status": "new",       "product": "Embroidered Cushion", "qty": 3,  "days_ago": 1},
    # confirmed
    {"buyer": "Fatima Noor",    "phone": "+92-321-4445678", "status": "confirmed", "product": "Ceramic Vase",        "qty": 1,  "days_ago": 2},
    {"buyer": "Usman Malik",    "phone": "+92-300-1234567", "status": "confirmed", "product": "Pottery Bowl Set",    "qty": 2,  "days_ago": 3},
    {"buyer": "Ayesha Raza",    "phone": "+92-311-9876543", "status": "confirmed", "product": "Wooden Tray",         "qty": 1,  "days_ago": 4},
    # shipped
    {"buyer": "Hassan Sheikh",  "phone": "+92-333-5551234", "status": "shipped",   "product": "Decorative Plate",    "qty": 2,  "days_ago": 5},
    {"buyer": "Zara Siddiqui",  "phone": "+92-321-4445678", "status": "shipped",   "product": "Terracotta Planter",  "qty": 1,  "days_ago": 6},
    # delivered
    {"buyer": "Ahmed Khan",     "phone": "+92-300-1234567", "status": "delivered", "product": "Clay Mug",            "qty": 4,  "days_ago": 8},
    {"buyer": "Bilal Hussain",  "phone": "+92-311-9876543", "status": "delivered", "product": "Handmade Handi",      "qty": 1,  "days_ago": 10},
    {"buyer": "Fatima Noor",    "phone": "+92-333-5551234", "status": "delivered", "product": "Embroidered Cushion", "qty": 2,  "days_ago": 12},
    # rejected
    {"buyer": "Usman Malik",    "phone": "+92-321-4445678", "status": "rejected",  "product": "Ceramic Vase",        "qty": 1,  "days_ago": 7,  "reason": "Out of delivery area"},
    {"buyer": "Sara Ali",       "phone": "+92-300-1234567", "status": "rejected",  "product": "Pottery Bowl Set",    "qty": 2,  "days_ago": 9,  "reason": "Buyer requested cancellation"},
]


async def seed():
    client = AsyncIOMotorClient(settings.mongodb_url, tls=True, tlsAllowInvalidCertificates=True)
    db = client[settings.mongodb_database]

    # Find demo seller
    seller = await db.sellers.find_one({"email": DEMO_EMAIL})
    if not seller:
        print(f"ERROR: No seller found with email '{DEMO_EMAIL}'.")
        print("Please register first, then run this script.")
        client.close()
        return

    seller_id = seller["_id"]
    print(f"Found seller: {seller.get('store_name', DEMO_EMAIL)} ({seller_id})")

    # Remove existing orders for this seller
    deleted = await db.orders.delete_many({"seller_id": seller_id})
    print(f"Removed {deleted.deleted_count} existing orders.")

    # Insert new orders
    for idx, o in enumerate(ORDERS, start=2001):
        created = datetime.utcnow() - timedelta(days=o["days_ago"], hours=random.randint(0, 12))
        price = next(p["price"] for p in SAMPLE_PRODUCTS if p["name"] == o["product"])
        await db.orders.insert_one({
            "seller_id": seller_id,
            "order_no": idx,
            "buyer_name": o["buyer"],
            "buyer_phone": o["phone"],
            "items": [{
                "product_id": seller_id,
                "product_name": o["product"],
                "quantity": o["qty"],
                "price": price,
            }],
            "total_amount": price * o["qty"],
            "status": o["status"],
            "rejection_reason": o.get("reason", ""),
            "created_at": created,
            "updated_at": created,
        })
        print(f"  + [{o['status'].upper():10}] {o['buyer']:<18} — {o['product']} x{o['qty']}  Rs.{price * o['qty']}")

    client.close()
    print(f"\nDone. {len(ORDERS)} orders seeded for {DEMO_EMAIL}.")


if __name__ == "__main__":
    asyncio.run(seed())
