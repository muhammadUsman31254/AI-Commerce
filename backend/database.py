from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from config import settings


def parse_object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except InvalidId:
        raise HTTPException(status_code=404, detail="Not found")

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(
        settings.mongodb_url,
        tls=True,
        tlsAllowInvalidCertificates=True,
    )
    db = client[settings.mongodb_database]
    # Create indexes
    await db.sellers.create_index("email", unique=True)
    await db.products.create_index("seller_id")
    await db.orders.create_index("seller_id")
    print(f"Connected to MongoDB: {settings.mongodb_database}")


async def close_db():
    global client
    if client:
        client.close()


def get_db():
    return db
