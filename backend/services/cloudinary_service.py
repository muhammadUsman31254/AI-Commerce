import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile
from config import settings


def _cloudinary_configured() -> bool:
    return bool(
        settings.cloudinary_cloud_name
        and settings.cloudinary_api_key
        and settings.cloudinary_api_secret
    )


async def upload_image(file: UploadFile) -> str:
    if not _cloudinary_configured():
        raise HTTPException(
            status_code=503,
            detail="Image upload is not configured. Add Cloudinary credentials or save without an image.",
        )
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
    )
    contents = await file.read()
    result = cloudinary.uploader.upload(
        contents,
        folder="ai-commerce/products",
        resource_type="image",
        transformation=[{"width": 800, "crop": "limit", "quality": "auto"}],
    )
    return result["secure_url"]
