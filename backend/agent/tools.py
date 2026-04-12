import json
import contextvars
from datetime import datetime
from bson import ObjectId
from langchain_core.tools import tool

# Injected per-request by the voice/chat route so tools know which seller is active
current_seller_id: contextvars.ContextVar[str] = contextvars.ContextVar("current_seller_id")


def get_db():
    from database import db
    return db


# ── 1. Add Product ────────────────────────────────────────────────────────────

@tool
async def add_product(name: str, price: float, quantity: int, category: str = "") -> str:
    """
    Use when the seller wants to add a new product to their store.
    Extract product name, price, and quantity from what the seller said.
    If any of these three are missing, ask for them before calling this tool.
    Triggers a photo-upload popup in the UI; Gemini will auto-generate
    the description once the seller uploads a photo.
    """
    data = {"name": name, "price": price, "quantity": quantity, "category": category}
    return f"__UPLOAD_IMAGE__:{json.dumps(data, ensure_ascii=False)}"


# ── 2. Show Products ──────────────────────────────────────────────────────────

@tool
async def show_products(category: str = "") -> str:
    """
    Use when the seller wants to see or browse their products.
    Navigates to the products page and returns a voice-friendly summary.
    Pass category only if the seller specifically asks to filter by one.
    """
    db = get_db()
    sid = current_seller_id.get()

    query: dict = {"seller_id": ObjectId(sid)}
    if category:
        query["category"] = {"$regex": category, "$options": "i"}

    products = await db.products.find(query).sort("created_at", -1).to_list(100)
    count = len(products)

    if count == 0:
        summary = (
            "Aap ke store mein abhi koi product nahi hai."
            if not category
            else f"'{category}' category mein koi product nahi mila."
        )
    else:
        active = sum(1 for p in products if p.get("status") == "active")
        low    = sum(1 for p in products if p.get("quantity", 0) < 5)
        summary = f"Aap ke store mein {count} products hain. {active} active hain."
        if low:
            summary += f" {low} products ka stock kam hai."

    return f"__NAVIGATE__:/dashboard/products\n{summary}"


# ── 3. Show Orders ────────────────────────────────────────────────────────────

@tool
async def show_orders(status: str = "all") -> str:
    """
    Use when the seller wants to see their orders.
    Detect status from what the seller said:
      'naye orders' or 'new'       → status='new'
      'confirm orders'             → status='confirmed'
      'shipped'                    → status='shipped'
      'delivered'                  → status='delivered'
      'rejected'                   → status='rejected'
      anything else / 'sare orders'→ status='all'
    Navigates to the correct orders page and returns a voice summary.
    """
    db = get_db()
    sid = current_seller_id.get()

    valid_statuses = {"new", "confirmed", "shipped", "delivered", "rejected"}
    status = status.lower().strip()
    if status not in valid_statuses:
        status = "all"

    query: dict = {"seller_id": ObjectId(sid)}
    if status != "all":
        query["status"] = status

    orders = await db.orders.find(query).sort("created_at", -1).to_list(100)
    count  = len(orders)
    route  = "/dashboard/orders" if status == "all" else f"/dashboard/orders?status={status}"

    if count == 0:
        label   = f"{status} " if status != "all" else ""
        summary = f"Abhi koi {label}orders nahi hain."
    else:
        total   = sum(o.get("total_amount", 0) for o in orders)
        label   = f"{status} " if status != "all" else ""
        summary = (
            f"Aap ke {count} {label}orders hain. "
            f"Total amount: Rs.{total:.0f}."
        )

    return f"__NAVIGATE__:{route}\n{summary}"


# ── 4. Confirm or Reject an Order ─────────────────────────────────────────────

@tool
async def confirm_or_reject_order(order_id: str, action: str, reason: str = "") -> str:
    """
    Use when the seller wants to confirm or reject a specific order.
    action must be 'confirm' or 'reject'.
    order_id is the short ID the seller mentions (last 6 characters of the MongoDB _id).
    reason is optional and only relevant for rejection.
    """
    db  = get_db()
    sid = current_seller_id.get()

    action = action.lower().strip()
    if action not in {"confirm", "reject"}:
        return "Action samajh nahi aaya. 'confirm' ya 'reject' bolein."

    # Match order by trailing 6-char suffix (case-insensitive)
    all_orders = await db.orders.find({"seller_id": ObjectId(sid)}).to_list(500)
    matched = [o for o in all_orders if str(o["_id"]).lower().endswith(order_id.lower())]

    if not matched:
        return (
            f"Order #{order_id} nahi mila. "
            "Pehle orders dekhein aur sahi ID batayein."
        )

    order = matched[0]
    short_id = str(order["_id"])[-6:].upper()
    buyer    = order.get("buyer_name", "")
    amount   = order.get("total_amount", 0)

    if action == "confirm":
        await db.orders.update_one(
            {"_id": order["_id"]},
            {"$set": {"status": "confirmed", "updated_at": datetime.utcnow()}},
        )
        return (
            f"Order #{short_id} confirm ho gaya! "
            f"Buyer: {buyer}, Amount: Rs.{amount:.0f}."
        )
    else:  # reject
        await db.orders.update_one(
            {"_id": order["_id"]},
            {"$set": {
                "status": "rejected",
                "rejection_reason": reason,
                "updated_at": datetime.utcnow(),
            }},
        )
        return f"Order #{short_id} reject ho gaya. Buyer: {buyer}."


# ── 5. Delete Product ─────────────────────────────────────────────────────────

@tool
async def delete_product(name: str) -> str:
    """
    Use when the seller wants to remove a specific product from their store.
    Extract the product name from what the seller said.
    Matches by name (case-insensitive, partial match allowed).
    """
    db  = get_db()
    sid = current_seller_id.get()

    product = await db.products.find_one(
        {"name": {"$regex": name, "$options": "i"}, "seller_id": ObjectId(sid)}
    )
    if not product:
        return f"'{name}' naam ka koi product store mein nahi mila."

    await db.products.delete_one({"_id": product["_id"]})
    return f"{product['name']} store se delete ho gaya."


# ── Exported list ─────────────────────────────────────────────────────────────

ALL_TOOLS = [
    add_product,
    show_products,
    show_orders,
    confirm_or_reject_order,
    delete_product,
]
