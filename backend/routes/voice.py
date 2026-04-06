import base64
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from auth.jwt import get_current_seller
from services.assemblyai_stt import transcribe_audio
from services.elevenlabs_tts import text_to_speech
from agent.agent import get_agent
from agent.tools import current_seller_id

router = APIRouter(prefix="/voice-command", tags=["voice"])


@router.post("")
async def voice_command(
    audio: UploadFile = File(...),
    seller_id: str = Depends(get_current_seller),
):
    # 1. Speech-to-Text
    try:
        transcript = await transcribe_audio(audio)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"STT failed: {str(e)}")

    if not transcript or not transcript.strip():
        raise HTTPException(status_code=400, detail="Could not transcribe audio. Please speak clearly.")

    # 2. Inject seller_id into context var so tools can access it
    token = current_seller_id.set(seller_id)
    try:
        agent = get_agent()
        config = {"configurable": {"thread_id": seller_id}}
        result = await agent.ainvoke(
            {"messages": [{"role": "user", "content": transcript}]},
            config=config,
        )
        reply_text = result["messages"][-1].content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent failed: {str(e)}")
    finally:
        current_seller_id.reset(token)

    # 3. Text-to-Speech
    try:
        audio_bytes = await text_to_speech(reply_text)
        audio_b64 = base64.b64encode(audio_bytes).decode()
    except Exception as e:
        # TTS failure is non-fatal — return text reply without audio
        audio_b64 = ""

    return JSONResponse({
        "transcript": transcript,
        "reply": reply_text,
        "audio_base64": audio_b64,
    })
