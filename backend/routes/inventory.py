from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime

from database import get_db, parse_object_id
from auth.jwt import get_current_seller

router = APIRouter(prefix="/inventory", tags=["inventory"])


class StockUpdate(BaseModel):
    quantity: int


def serialize(doc) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc["seller_id"] = str(doc["seller_id"])
    return doc


@router.get("")
async def list_inventory(seller_id: str = Depends(get_current_seller)):
    db = get_db()
    products = await db.products.find(
        {"seller_id": parse_object_id(seller_id)},
        {"name": 1, "quantity": 1, "price": 1, "category": 1, "status": 1, "seller_id": 1},
    ).sort("quantity", 1).to_list(200)
    return [serialize(p) for p in products]


@router.patch("/{product_id}")
async def update_stock(product_id: str, data: StockUpdate, seller_id: str = Depends(get_current_seller)):
    db = get_db()
    new_status = "out_of_stock" if data.quantity == 0 else "active"
    result = await db.products.update_one(
        {"_id": parse_object_id(product_id), "seller_id": parse_object_id(seller_id)},
        {"$set": {"quantity": data.quantity, "status": new_status, "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Stock updated", "quantity": data.quantity}
