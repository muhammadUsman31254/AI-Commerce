"""Public STT + TTS endpoints used during voice-guided registration (no auth required)."""
import base64
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.assemblyai_stt import transcribe_audio
from services.elevenlabs_tts import text_to_speech

router = APIRouter(prefix="/voice-register", tags=["voice-register"])


class SpeakRequest(BaseModel):
    text: str


@router.post("/speak")
async def speak_for_registration(body: SpeakRequest):
    """Generate TTS audio for a registration question (public, no auth)."""
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Text is required.")
    try:
        audio_bytes = await text_to_speech(body.text)
        return {"audio_base64": base64.b64encode(audio_bytes).decode()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")


@router.post("/transcribe")
async def transcribe_for_registration(audio: UploadFile = File(...)):
    """Transcribe voice answer during registration (public, no auth)."""
    try:
        transcript = await transcribe_audio(audio)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    if not transcript or not transcript.strip():
        raise HTTPException(status_code=400, detail="Could not transcribe. Please speak clearly.")

    return {"transcript": transcript}
