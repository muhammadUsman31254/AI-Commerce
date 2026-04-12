from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from datetime import datetime
from database import get_db, parse_object_id
from auth.jwt import get_current_seller
from models.order import OrderCreate, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["orders"])


def serialize(doc) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc["seller_id"] = str(doc["seller_id"])
    for item in doc.get("items", []):
        item["product_id"] = str(item["product_id"])
    return doc


@router.get("")
async def list_orders(
    status: Optional[str] = Query(None),
    seller_id: str = Depends(get_current_seller),
):
    db = get_db()
    query: dict = {"seller_id": parse_object_id(seller_id)}
    if status and status != "all":
        query["status"] = status
    orders = await db.orders.find(query).sort("created_at", -1).to_list(100)
    return [serialize(o) for o in orders]


@router.get("/{order_id}")
async def get_order(order_id: str, seller_id: str = Depends(get_current_seller)):
    db = get_db()
    order = await db.orders.find_one({"_id": parse_object_id(order_id), "seller_id": parse_object_id(seller_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize(order)


@router.post("", status_code=201)
async def create_order(data: OrderCreate, seller_id: str = Depends(get_current_seller)):
    db = get_db()
    total = sum(item.price * item.quantity for item in data.items)
    now = datetime.utcnow()

    # Auto-generate order_no: max existing + 1
    last = await db.orders.find_one(
        {"seller_id": parse_object_id(seller_id), "order_no": {"$exists": True}},
        sort=[("order_no", -1)],
    )
    order_no = (last["order_no"] + 1) if last else 1001

    doc = {
        "seller_id": parse_object_id(seller_id),
        "order_no": order_no,
        "buyer_name": data.buyer_name,
        "buyer_phone": data.buyer_phone,
        "items": [
            {
                "product_id": item.product_id or "",
                "product_name": item.product_name,
                "quantity": item.quantity,
                "price": item.price,
            }
            for item in data.items
        ],
        "total_amount": total,
        "status": "new",
        "rejection_reason": "",
        "created_at": now,
        "updated_at": now,
    }
    result = await db.orders.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.delete("/{order_id}", status_code=204)
async def delete_order(order_id: str, seller_id: str = Depends(get_current_seller)):
    db = get_db()
    result = await db.orders.delete_one(
        {"_id": parse_object_id(order_id), "seller_id": parse_object_id(seller_id)}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")


@router.patch("/{order_id}/confirm")
async def confirm_order(order_id: str, seller_id: str = Depends(get_current_seller)):
    db = get_db()
    result = await db.orders.update_one(
        {"_id": parse_object_id(order_id), "seller_id": parse_object_id(seller_id)},
        {"$set": {"status": "confirmed", "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order confirmed"}


@router.patch("/{order_id}/reject")
async def reject_order(order_id: str, data: OrderStatusUpdate, seller_id: str = Depends(get_current_seller)):
    db = get_db()
    result = await db.orders.update_one(
        {"_id": parse_object_id(order_id), "seller_id": parse_object_id(seller_id)},
        {"$set": {"status": "rejected", "rejection_reason": data.reason, "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order rejected"}
