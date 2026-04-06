from elevenlabs import ElevenLabs
from config import settings
import asyncio

client = ElevenLabs(api_key=settings.elevenlabs_api_key)

VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"


def _tts_sync(text: str) -> bytes:
    audio_generator = client.text_to_speech.stream(
        voice_id=VOICE_ID,
        output_format="mp3_44100_128",
        text=text,
        model_id="eleven_multilingual_v2",
    )
    return b"".join(audio_generator)


async def text_to_speech(text: str) -> bytes:
    # Run blocking SDK call in a thread so the event loop stays free
    return await asyncio.to_thread(_tts_sync, text)
