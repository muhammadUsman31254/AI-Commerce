import asyncio
import httpx
from fastapi import UploadFile
from config import settings

BASE_URL = "https://api.assemblyai.com"


def _transcribe_sync(audio_bytes: bytes, filename: str) -> str:
    headers = {"authorization": settings.assemblyai_api_key}

    # 1. Upload audio
    upload_resp = httpx.post(
        f"{BASE_URL}/v2/upload",
        headers=headers,
        content=audio_bytes,
        timeout=60,
    )
    upload_resp.raise_for_status()
    audio_url = upload_resp.json()["upload_url"]

    # 2. Submit transcription job
    transcript_resp = httpx.post(
        f"{BASE_URL}/v2/transcript",
        headers=headers,
        json={
            "audio_url": audio_url,
            "language_detection": True,
            "speech_models": ["universal-3-pro", "universal-2"],
        },
        timeout=30,
    )
    transcript_resp.raise_for_status()
    transcript_id = transcript_resp.json()["id"]
    polling_url = f"{BASE_URL}/v2/transcript/{transcript_id}"

    # 3. Poll until complete
    while True:
        result = httpx.get(polling_url, headers=headers, timeout=30).json()
        if result["status"] == "completed":
            return result.get("text") or ""
        elif result["status"] == "error":
            raise RuntimeError(f"AssemblyAI error: {result.get('error')}")
        else:
            import time
            time.sleep(3)


async def transcribe_audio(file: UploadFile) -> str:
    audio_bytes = await file.read()
    return await asyncio.to_thread(_transcribe_sync, audio_bytes, file.filename or "audio.webm")
