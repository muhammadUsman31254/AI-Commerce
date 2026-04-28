from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MongoDB
    mongodb_url: str
    mongodb_database: str = "aicommerce_db"

    # JWT
    jwt_secret: str = "ai-commerce-super-secret-key-change-in-prod"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Ollama (local) — set ollama_model to use instead of Groq, e.g. "mistral:7b"
    ollama_model: str = ""
    ollama_base_url: str = "http://localhost:11434"

    # Groq (cloud fallback)
    groq_api_key: str = ""
    assemblyai_api_key: str = ""
    elevenlabs_api_key: str = ""
    gemini_api_key: str = ""
    # Gemini model id for google-genai (see https://ai.google.dev/gemini-api/docs/models)
    gemini_model: str = "gemini-2.5-flash"
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"
        extra = "ignore"
        # On Railway / production, env vars are injected directly — missing file is fine


settings = Settings()
