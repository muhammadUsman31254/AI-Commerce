from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class SellerRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    store_name: str
    phone: str


class SellerLogin(BaseModel):
    email: EmailStr
    password: str


class SellerOut(BaseModel):
    id: str
    name: str
    email: str
    store_name: str
    phone: str
    created_at: datetime
