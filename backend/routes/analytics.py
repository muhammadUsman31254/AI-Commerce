from fastapi import APIRouter, Depends, Query
from datetime import datetime, timedelta
from database import get_db, parse_object_id
from auth.jwt import get_current_seller

router = APIRouter(prefix="/analytics", tags=["analytics"])


def get_date_range(period: str):
    now = datetime.utcnow()
    if period == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        days, fmt = 1, "%H:00"
    elif period == "week":
        start = now - timedelta(days=6)
        start = start.replace(hour=0, minute=0, second=0, microsecond=0)
        days, fmt = 7, "%a"
    else:  # month
        start = now - timedelta(days=29)
        start = start.replace(hour=0, minute=0, second=0, microsecond=0)
        days, fmt = 30, "%b %d"
    return start, now, days, fmt


@router.get("")
async def get_analytics(
    period: str = Query("week", pattern="^(today|week|month)$"),
    seller_id: str = Depends(get_current_seller),
):
    db = get_db()
    sid = parse_object_id(seller_id)
    start, now, days, fmt = get_date_range(period)

    # ── Aggregations ──────────────────────────────────────────────────────────
    orders_in_period = await db.orders.find(
        {"seller_id": sid, "created_at": {"$gte": start}, "status": {"$ne": "rejected"}}
    ).to_list(1000)

    all_orders = await db.orders.find({"seller_id": sid}).to_list(1000)
    active_products = await db.products.count_documents({"seller_id": sid, "status": "active"})
    low_stock = await db.products.count_documents({"seller_id": sid, "quantity": {"$lt": 5}})

    total_revenue = sum(o["total_amount"] for o in orders_in_period)
    total_orders = len(orders_in_period)
    avg_order = round(total_revenue / total_orders, 2) if total_orders else 0

    # ── Revenue chart — bucket by day ─────────────────────────────────────────
    revenue_by_day: dict = {}
    for i in range(days):
        day = (start + timedelta(days=i)).strftime(fmt)
        revenue_by_day[day] = 0
    for o in orders_in_period:
        day = o["created_at"].strftime(fmt)
        if day in revenue_by_day:
            revenue_by_day[day] += o["total_amount"]
    revenue_chart = [{"label": k, "revenue": v} for k, v in revenue_by_day.items()]

    # ── Orders by status ──────────────────────────────────────────────────────
    status_counts: dict = {"new": 0, "confirmed": 0, "shipped": 0, "delivered": 0, "rejected": 0}
    for o in all_orders:
        s = o.get("status", "new")
        if s in status_counts:
            status_counts[s] += 1
    orders_by_status = [{"status": k, "count": v} for k, v in status_counts.items() if v > 0]

    # ── Top products by units sold ─────────────────────────────────────────────
    product_sales: dict = {}
    for o in orders_in_period:
        for item in o.get("items", []):
            name = item["product_name"]
            product_sales[name] = product_sales.get(name, {"units_sold": 0, "revenue": 0})
            product_sales[name]["units_sold"] += item["quantity"]
            product_sales[name]["revenue"] += item["price"] * item["quantity"]
    top_products = sorted(
        [{"name": k, **v} for k, v in product_sales.items()],
        key=lambda x: x["units_sold"], reverse=True
    )[:5]

    # ── AI insight (simple rule-based, replaced by agent call in voice flow) ──
    ai_insight = ""
    if top_products:
        top = top_products[0]
        low_items = await db.products.find({"seller_id": sid, "quantity": {"$lt": 5}}).to_list(3)
        low_names = [p["name"] for p in low_items]
        ai_insight = f"Your best seller this {period} is '{top['name']}' with {top['units_sold']} units sold."
        if low_names:
            ai_insight += f" Low stock alert: {', '.join(low_names)}. Consider restocking soon."

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "average_order_value": avg_order,
        "active_products": active_products,
        "low_stock_count": low_stock,
        "revenue_chart": revenue_chart,
        "orders_by_status": orders_by_status,
        "top_products": top_products,
        "ai_insight": ai_insight,
    }
