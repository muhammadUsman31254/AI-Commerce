from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth.jwt import get_current_seller
from agent.agent import get_agent
from agent.tools import current_seller_id
from routes._agent_actions import parse_agent_actions

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str


@router.post("")
async def chat(body: ChatRequest, seller_id: str = Depends(get_current_seller)):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    token = current_seller_id.set(seller_id)
    try:
        agent = get_agent()
        config = {"configurable": {"thread_id": seller_id}}

        # Record how many messages exist before this turn
        state_before = await agent.aget_state(config)
        msgs_before = len(state_before.values.get("messages", []))

        result = await agent.ainvoke(
            {"messages": [{"role": "user", "content": body.message}]},
            config=config,
        )
        reply = result["messages"][-1].content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent failed: {str(e)}")
    finally:
        current_seller_id.reset(token)

    # Only scan NEW messages from this turn (not old history)
    new_messages = result["messages"][msgs_before:]
    agent_action = parse_agent_actions(new_messages)
    return {"reply": reply, **agent_action}
