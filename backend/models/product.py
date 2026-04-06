from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    price: float
    quantity: int
    category: Optional[str] = ""
    status: Optional[str] = "active"


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    category: Optional[str] = None
    status: Optional[str] = None


class ProductOut(BaseModel):
    id: str
    seller_id: str
    name: str
    description: str
    price: float
    quantity: int
    category: str
    images: List[str]
    status: str
    created_at: datetime
    updated_at: datetime
