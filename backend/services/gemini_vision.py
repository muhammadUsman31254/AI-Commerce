import io
import logging

import httpx
from fastapi import HTTPException
from google import genai
from google.genai import errors as genai_errors

from config import settings

logger = logging.getLogger(__name__)

_CAPTION_PROMPT = (
    "Give a single brief caption for this product photo: one short phrase only "
    "(about 6–15 words). No prices, no bullets, no JSON, no extra sentences."
)


def _genai_client() -> genai.Client:
    return genai.Client(api_key=settings.gemini_api_key)


def _normalize_mime(mime: str | None) -> str:
    if not mime:
        return "image/jpeg"
    main = mime.split(";")[0].strip().lower()
    if main in ("image/jpg", "image/jpeg", "image/png", "image/webp", "image/gif"):
        return "image/jpeg" if main == "image/jpg" else main
    return "image/jpeg"


async def _caption_image_bytes(data: bytes, mime_type: str) -> str:
    if not data:
        raise ValueError("Empty image data")

    client = _genai_client()
    mime = _normalize_mime(mime_type)
    buf = io.BytesIO(data)
    buf.seek(0)

    uploaded = await client.aio.files.upload(file=buf, config={"mime_type": mime})
    try:
        model = (settings.gemini_model or "gemini-2.5-flash").strip()
        response = await client.aio.models.generate_content(
            model=model,
            contents=[uploaded, _CAPTION_PROMPT],
        )
    finally:
        try:
            if uploaded.name:
                await client.aio.files.delete(name=uploaded.name)
        except Exception:
            logger.debug("Could not delete uploaded Gemini file %s", getattr(uploaded, "name", None))

    text = (response.text or "").strip()
    if not text:
        raise ValueError("Model returned an empty caption")
    return text


async def caption_product_image(data: bytes, mime_type: str | None) -> dict:
    """HTTP API: returns {caption} for /products/analyze-photo."""
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=503,
            detail="AI captioning is not configured. Add GEMINI_API_KEY or enter details manually.",
        )
    try:
        caption = await _caption_image_bytes(data, mime_type)
    except genai_errors.APIError as e:
        raise HTTPException(
            status_code=502,
            detail=e.message or "Gemini API error",
        ) from e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.exception("Gemini caption failed")
        raise HTTPException(status_code=502, detail="Could not caption image.") from e

    return {"caption": caption}


async def caption_image_from_url(image_url: str) -> str:
    """Voice/agent tool: download image and return a short caption or error text."""
    if not settings.gemini_api_key:
        return "Gemini API key set nahi hai — photo caption nahi ban sakta."

    try:
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.get(image_url)
            resp.raise_for_status()
            data = resp.content
            mime = resp.headers.get("content-type")
        return await _caption_image_bytes(data, mime)
    except genai_errors.APIError as e:
        return e.message or "Gemini API error."
    except Exception as e:
        return f"Photo caption nahi ban saka: {e!s}"
