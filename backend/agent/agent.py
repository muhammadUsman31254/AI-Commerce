from langchain.agents import create_agent
from langgraph.checkpoint.memory import MemorySaver
from agent.tools import ALL_TOOLS
from agent.prompts import SYSTEM_PROMPT
from config import settings

_agent = None


def _build_model():
    """Return the best available LLM — Ollama (local) if configured, else Groq."""
    if settings.ollama_model:
        from langchain_ollama import ChatOllama
        print(f"Using Ollama model: {settings.ollama_model} @ {settings.ollama_base_url}")
        return ChatOllama(
            model=settings.ollama_model,
            base_url=settings.ollama_base_url,
            temperature=0,
        )

    from langchain_groq import ChatGroq
    print("Using Groq model: llama-3.3-70b-versatile")
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=settings.groq_api_key,
        temperature=0,
    )


def init_agent():
    global _agent
    try:
        model = _build_model()
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
        raise RuntimeError("Voice agent is not available. Check your LLM configuration.")
    return _agent
