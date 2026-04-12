from fastapi import APIRouter, HTTPException, status, Depends
import bcrypt
from datetime import datetime
from bson import ObjectId
from database import get_db
from models.seller import SellerRegister, SellerLogin
from auth.jwt import create_access_token, get_current_seller

router = APIRouter(prefix="/auth", tags=["auth"])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


@router.post("/register", status_code=201)
async def register(data: SellerRegister):
    db = get_db()
    existing = await db.sellers.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    seller = {
        "name": data.name,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "store_name": data.store_name,
        "phone": data.phone,
        "created_at": datetime.utcnow(),
    }
    result = await db.sellers.insert_one(seller)
    token = create_access_token(str(result.inserted_id))
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login")
async def login(data: SellerLogin):
    db = get_db()
    seller = await db.sellers.find_one({"email": data.email})
    if not seller or not verify_password(data.password, seller["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(seller["_id"]))
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
async def me(seller_id: str = Depends(get_current_seller)):
    db = get_db()
    seller = await db.sellers.find_one({"_id": ObjectId(seller_id)})
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    return {
        "id": str(seller["_id"]),
        "name": seller["name"],
        "store_name": seller["store_name"],
        "email": seller["email"],
    }
