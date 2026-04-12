"""Helpers to parse special action signals embedded in LangChain agent messages."""
import json

_UPLOAD_SIGNAL = "__UPLOAD_IMAGE__:"
_NAVIGATE_SIGNAL = "__NAVIGATE__:"


def parse_agent_actions(messages: list) -> dict:
    """
    Scan all agent messages for action signals.
    Returns a dict with any of:
      { "action": "upload_image", "pending": {...} }
      { "action": "navigate",     "route":   "..." }
    Returns {} if no signals found.
    """
    for msg in messages:
        content = getattr(msg, "content", "")
        if not isinstance(content, str):
            continue

        if _UPLOAD_SIGNAL in content:
            try:
                json_part = content.split(_UPLOAD_SIGNAL, 1)[1].strip()
                return {"action": "upload_image", "pending": json.loads(json_part)}
            except Exception:
                pass

        if _NAVIGATE_SIGNAL in content:
            route = content.split(_NAVIGATE_SIGNAL, 1)[1].strip().split()[0]
            return {"action": "navigate", "route": route}

    return {}
