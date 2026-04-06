from langchain.agents import create_agent
from langgraph.checkpoint.memory import MemorySaver
from langchain_groq import ChatGroq
from agent.tools import ALL_TOOLS
from agent.prompts import SYSTEM_PROMPT
from config import settings

_agent = None


def init_agent():
    global _agent
    try:
        model = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=settings.groq_api_key,
            temperature=0,
        )
        checkpointer = MemorySaver()
        _agent = create_agent(
            model,
            tools=ALL_TOOLS,
            system_prompt=SYSTEM_PROMPT,
            checkpointer=checkpointer,
        )
        print("LangChain agent initialised.")
    except Exception as e:
        print(f"WARNING: LangChain agent failed to initialise: {e}")
        print("Voice commands will be unavailable. All other features work normally.")


def get_agent():
    if _agent is None:
        raise RuntimeError("Voice agent is not available. Check your GROQ_API_KEY and LangChain setup.")
    return _agent
