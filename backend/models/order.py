from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class OrderItem(BaseModel):
    product_id: Optional[str] = ""
    product_name: str
    quantity: int
    price: float


class OrderCreate(BaseModel):
    buyer_name: str
    buyer_phone: str
    items: List[OrderItem]


class OrderStatusUpdate(BaseModel):
    reason: Optional[str] = ""


class OrderOut(BaseModel):
    id: str
    seller_id: str
    buyer_name: str
    buyer_phone: str
    items: List[OrderItem]
    total_amount: float
    status: str
    rejection_reason: Optional[str] = ""
    created_at: datetime
    updated_at: datetime
