from langchain_core.tools import tool
from bson import ObjectId
from datetime import datetime
from typing import Optional

# seller_id is injected per-request via a context var
import contextvars
current_seller_id: contextvars.ContextVar[str] = contextvars.ContextVar("current_seller_id")


def get_db():
    from database import db
    return db


# ── Tools ─────────────────────────────────────────────────────────────────────

@tool
async def add_product(product_name: str, price: float, quantity: int, description: str = "", category: str = "") -> str:
    """Add a new product to the seller's store."""
    db = get_db()
    sid = current_seller_id.get()
    now = datetime.utcnow()
    await db.products.insert_one({
        "seller_id": ObjectId(sid),
        "name": product_name,
        "price": price,
        "quantity": quantity,
        "description": description,
        "category": category,
        "images": [],
        "status": "active",
        "created_at": now,
        "updated_at": now,
    })
    return f"{product_name} successfully add ho gaya! Price: Rs.{price:.0f}, Stock: {quantity} pieces."


@tool
async def update_stock(product_name: str, quantity: int) -> str:
    """Update the stock quantity of an existing product by name."""
    db = get_db()
    sid = current_seller_id.get()
    result = await db.products.update_one(
        {"name": {"$regex": product_name, "$options": "i"}, "seller_id": ObjectId(sid)},
        {"$set": {"quantity": quantity, "status": "active" if quantity > 0 else "out_of_stock", "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        return f"'{product_name}' naam ka koi product nahi mila. Dobara check karein."
    return f"{product_name} ka stock update ho gaya. Naya stock: {quantity} pieces."


@tool
async def view_orders(status: str = "new") -> str:
    """Fetch seller orders filtered by status. Status options: new, confirmed, shipped, delivered, rejected, all."""
    db = get_db()
    sid = current_seller_id.get()
    query: dict = {"seller_id": ObjectId(sid)}
    if status != "all":
        query["status"] = status
    orders = await db.orders.find(query).sort("created_at", -1).to_list(10)
    if not orders:
        return f"Koi {status} orders nahi hain abhi."
    lines = [
        f"Order #{str(o['_id'])[-6:].upper()}: {o['buyer_name']} — Rs.{o['total_amount']:.0f} ({o['status']})"
        for o in orders
    ]
    return f"Aap ke {status} orders ({len(orders)}):\n" + "\n".join(lines)


@tool
async def confirm_order(order_id: str) -> str:
    """Confirm a pending order. Pass the last 6 characters of the order ID."""
    db = get_db()
    sid = current_seller_id.get()
    # Try to match by last-6 suffix
    orders = await db.orders.find({"seller_id": ObjectId(sid), "status": "new"}).to_list(100)
    matched = [o for o in orders if str(o["_id"]).endswith(order_id.lower())]
    if not matched:
        return f"Order #{order_id} nahi mila ya already processed hai."
    order = matched[0]
    await db.orders.update_one(
        {"_id": order["_id"]},
        {"$set": {"status": "confirmed", "updated_at": datetime.utcnow()}}
    )
    return f"Order #{str(order['_id'])[-6:].upper()} confirm ho gaya! Buyer: {order['buyer_name']}."


@tool
async def reject_order(order_id: str, reason: str = "") -> str:
    """Reject an order by its last-6-character ID with an optional reason."""
    db = get_db()
    sid = current_seller_id.get()
    orders = await db.orders.find({"seller_id": ObjectId(sid), "status": "new"}).to_list(100)
    matched = [o for o in orders if str(o["_id"]).endswith(order_id.lower())]
    if not matched:
        return f"Order #{order_id} nahi mila ya already processed hai."
    order = matched[0]
    await db.orders.update_one(
        {"_id": order["_id"]},
        {"$set": {"status": "rejected", "rejection_reason": reason, "updated_at": datetime.utcnow()}}
    )
    return f"Order #{str(order['_id'])[-6:].upper()} reject ho gaya."


@tool
async def get_analytics(period: str = "today") -> str:
    """Get sales analytics summary. Period options: today, week, month."""
    from datetime import timedelta
    db = get_db()
    sid = current_seller_id.get()

    now = datetime.utcnow()
    if period == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start = now - timedelta(days=7)
    else:
        start = now - timedelta(days=30)

    orders = await db.orders.find({
        "seller_id": ObjectId(sid),
        "created_at": {"$gte": start},
        "status": {"$ne": "rejected"},
    }).to_list(1000)

    total = sum(o["total_amount"] for o in orders)
    count = len(orders)

    # Top product
    sales: dict = {}
    for o in orders:
        for item in o.get("items", []):
            n = item["product_name"]
            sales[n] = sales.get(n, 0) + item["quantity"]
    top = max(sales, key=sales.get) if sales else None

    summary = f"{period.capitalize()} mein {count} orders aaye, total sales Rs.{total:.0f}."
    if top:
        summary += f" Sab se zyada bikne wala product: {top} ({sales[top]} pieces)."

    # Low stock warning
    low = await db.products.find({"seller_id": ObjectId(sid), "quantity": {"$lt": 5, "$gt": 0}}).to_list(5)
    if low:
        names = ", ".join(p["name"] for p in low)
        summary += f" Low stock alert: {names}."
    return summary


@tool
async def view_products(category: str = "") -> str:
    """View all products in the seller's store. Optionally filter by category."""
    db = get_db()
    sid = current_seller_id.get()
    query: dict = {"seller_id": ObjectId(sid)}
    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    products = await db.products.find(query).sort("created_at", -1).to_list(50)
    if not products:
        return "Aap ke store mein abhi koi product nahi hai." if not category else f"'{category}' category mein koi product nahi mila."
    lines = [
        f"{i+1}. {p['name']} — Rs.{p['price']:.0f}, Stock: {p['quantity']}, Status: {p['status']}"
        for i, p in enumerate(products)
    ]
    return f"Aap ke products ({len(products)}):\n" + "\n".join(lines)


@tool
async def delete_product(product_name: str) -> str:
    """Delete a product from the seller's store by name."""
    db = get_db()
    sid = current_seller_id.get()
    product = await db.products.find_one(
        {"name": {"$regex": product_name, "$options": "i"}, "seller_id": ObjectId(sid)}
    )
    if not product:
        return f"'{product_name}' naam ka koi product nahi mila."
    await db.products.delete_one({"_id": product["_id"]})
    return f"{product['name']} delete ho gaya store se."


@tool
async def analyze_photo(image_url: str) -> str:
    """Use Gemini to write a very short caption for a product photo URL."""
    from services.gemini_vision import caption_image_from_url
    caption = await caption_image_from_url(image_url)
    return f"Caption: {caption}"


ALL_TOOLS = [
    add_product,
    update_stock,
    view_products,
    delete_product,
    view_orders,
    confirm_order,
    reject_order,
    get_analytics,
    analyze_photo,
]
