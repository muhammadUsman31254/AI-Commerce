import base64
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from auth.jwt import get_current_seller
from services.assemblyai_stt import transcribe_audio
from services.elevenlabs_tts import text_to_speech
from agent.agent import get_agent
from agent.tools import current_seller_id
from routes._agent_actions import parse_agent_actions

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

        # Record how many messages exist before this turn
        state_before = await agent.aget_state(config)
        msgs_before = len(state_before.values.get("messages", []))

        result = await agent.ainvoke(
            {"messages": [{"role": "user", "content": transcript}]},
            config=config,
        )
        reply_text = result["messages"][-1].content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent failed: {str(e)}")
    finally:
        current_seller_id.reset(token)

    # 3. Only scan NEW messages from this turn (not old history)
    new_messages = result["messages"][msgs_before:]
    agent_action = parse_agent_actions(new_messages)

    # 4. Text-to-Speech
    audio_b64 = ""
    try:
        audio_bytes = await text_to_speech(reply_text)
        audio_b64 = base64.b64encode(audio_bytes).decode()
    except Exception as tts_err:
        print(f"[TTS ERROR] {tts_err}")

    response: dict = {
        "transcript": transcript,
        "reply": reply_text,
        "audio_base64": audio_b64,
        **agent_action,
    }
    return JSONResponse(response)
