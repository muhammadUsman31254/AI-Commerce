from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional, List
from datetime import datetime
from database import get_db, parse_object_id
from auth.jwt import get_current_seller
from services.cloudinary_service import upload_image
from services.gemini_vision import caption_product_image

router = APIRouter(prefix="/products", tags=["products"])


def serialize(doc) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc["seller_id"] = str(doc["seller_id"])
    return doc


@router.get("")
async def list_products(seller_id: str = Depends(get_current_seller)):
    db = get_db()
    products = await db.products.find({"seller_id": parse_object_id(seller_id)}).sort("created_at", -1).to_list(100)
    return [serialize(p) for p in products]


@router.get("/{product_id}")
async def get_product(product_id: str, seller_id: str = Depends(get_current_seller)):
    db = get_db()
    product = await db.products.find_one({"_id": parse_object_id(product_id), "seller_id": parse_object_id(seller_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize(product)


@router.post("", status_code=201)
async def create_product(
    name: str = Form(...),
    description: str = Form(""),
    price: float = Form(...),
    quantity: int = Form(...),
    category: str = Form(""),
    status: str = Form("active"),
    image: Optional[UploadFile] = File(None),
    seller_id: str = Depends(get_current_seller),
):
    db = get_db()
    image_urls = []
    if image:
        url = await upload_image(image)
        image_urls.append(url)

    now = datetime.utcnow()
    doc = {
        "seller_id": parse_object_id(seller_id),
        "name": name,
        "description": description,
        "price": price,
        "quantity": quantity,
        "category": category,
        "images": image_urls,
        "status": status,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.products.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.put("/{product_id}")
async def update_product(
    product_id: str,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    quantity: Optional[int] = Form(None),
    category: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    seller_id: str = Depends(get_current_seller),
):
    db = get_db()
    existing = await db.products.find_one({"_id": parse_object_id(product_id), "seller_id": parse_object_id(seller_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    updates: dict = {"updated_at": datetime.utcnow()}
    if name is not None:       updates["name"] = name
    if description is not None: updates["description"] = description
    if price is not None:       updates["price"] = price
    if quantity is not None:    updates["quantity"] = quantity
    if category is not None:    updates["category"] = category
    if status is not None:      updates["status"] = status
    if image:
        url = await upload_image(image)
        updates["images"] = [url]

    await db.products.update_one({"_id": parse_object_id(product_id)}, {"$set": updates})
    updated = await db.products.find_one({"_id": parse_object_id(product_id)})
    return serialize(updated)


@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: str, seller_id: str = Depends(get_current_seller)):
    db = get_db()
    result = await db.products.delete_one({"_id": parse_object_id(product_id), "seller_id": parse_object_id(seller_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")


@router.post("/voice-add", status_code=201)
async def voice_add_product(
    name: str = Form(...),
    price: float = Form(...),
    quantity: int = Form(...),
    category: str = Form(""),
    image: UploadFile = File(...),
    seller_id: str = Depends(get_current_seller),
):
    """Called by the voice image-upload modal. Uploads photo to Cloudinary,
    generates description via Gemini, then saves the product to MongoDB."""
    from services.gemini_vision import caption_image_from_url

    db = get_db()

    # 1. Upload image → get Cloudinary URL
    image_url = await upload_image(image)

    # 2. Auto-generate description from the photo
    description = await caption_image_from_url(image_url)

    # 3. Save product
    now = datetime.utcnow()
    doc = {
        "seller_id": parse_object_id(seller_id),
        "name": name,
        "description": description,
        "price": price,
        "quantity": quantity,
        "category": category,
        "images": [image_url],
        "status": "active",
        "created_at": now,
        "updated_at": now,
    }
    result = await db.products.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.post("/analyze-photo")
async def analyze_photo(
    image: UploadFile = File(...),
    seller_id: str = Depends(get_current_seller),
):
    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty image file.")
    mime = image.content_type
    return await caption_product_image(data, mime)
