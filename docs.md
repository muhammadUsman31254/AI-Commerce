# LangChain

Agents

Agents combine language models with tools to create systems that can reason about tasks, decide which tools to use, and iteratively work towards solutions.
create_agent provides a production-ready agent implementation.
An LLM Agent runs tools in a loop to achieve a goal. An agent runs until a stop condition is met - i.e., when the model emits a final output or an iteration limit is reached.

Core components
​
Model
The model is the reasoning engine of your agent. It can be specified in multiple ways, supporting both static and dynamic model selection.
​
Static model
Static models are configured once when creating the agent and remain unchanged throughout execution. This is the most common and straightforward approach.
To initialize a static model from a model identifier string:

from langchain.agents import create_agent

agent = create_agent("openai:gpt-5", tools=tools)

For more control over the model configuration, initialize a model instance directly using the provider package. In this example, we use ChatOpenAI. See Chat models for other available chat model classes.

from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model="gpt-5",
    temperature=0.1,
    max_tokens=1000,
    timeout=30
    # ... (other params)
)
agent = create_agent(model, tools=tools)

Model instances give you complete control over configuration. Use them when you need to set specific parameters like temperature, max_tokens, timeouts, base_url, and other provider-specific settings. Refer to the reference to see available params and methods on your model.

Tools
Tools give agents the ability to take actions. Agents go beyond simple model-only tool binding by facilitating:
Multiple tool calls in sequence (triggered by a single prompt)
Parallel tool calls when appropriate
Dynamic tool selection based on previous results
Tool retry logic and error handling
State persistence across tool calls
For more information, see Tools.
​
Static tools
Static tools are defined when creating the agent and remain unchanged throughout execution. This is the most common and straightforward approach.
To define an agent with static tools, pass a list of the tools to the agent.

from langchain.tools import tool
from langchain.agents import create_agent

@tool
def search(query: str) -> str:
    """Search for information."""
    return f"Results for: {query}"

@tool
def get_weather(location: str) -> str:
    """Get weather information for a location."""
    return f"Weather in {location}: Sunny, 72°F"

agent = create_agent(model, tools=[search, get_weather])

If an empty tool list is provided, the agent will consist of a single LLM node without tool-calling capabilities.

System prompt
You can shape how your agent approaches tasks by providing a prompt. The system_prompt parameter can be provided as a string:

agent = create_agent(
    model,
    tools,
    system_prompt="You are a helpful assistant. Be concise and accurate."
)

When no system_prompt is provided, the agent will infer its task from the messages directly.

Invocation
You can invoke an agent by passing an update to its State. All agents include a sequence of messages in their state; to invoke the agent, pass a new message:
result = agent.invoke(
    {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]}
)

# AssemblyAI
import logging
from typing import Type

import assemblyai as aai
from assemblyai.streaming.v3 import (
    BeginEvent,
    StreamingClient,
    StreamingClientOptions,
    StreamingError,
    StreamingEvents,
    StreamingParameters,
    StreamingSessionParameters,
    TerminationEvent,
    TurnEvent,
)

api_key = "<YOUR_API_KEY>"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def on_begin(self: Type[StreamingClient], event: BeginEvent):
    print(f"Session started: {event.id}")


def on_turn(self: Type[StreamingClient], event: TurnEvent):
    print(f"{event.transcript} ({event.end_of_turn})")


def on_terminated(self: Type[StreamingClient], event: TerminationEvent):
    print(
        f"Session terminated: {event.audio_duration_seconds} seconds of audio processed"
    )


def on_error(self: Type[StreamingClient], error: StreamingError):
    print(f"Error occurred: {error}")


def main():
    client = StreamingClient(
        StreamingClientOptions(
            api_key=api_key,
            api_host="streaming.assemblyai.com",
        )
    )

    client.on(StreamingEvents.Begin, on_begin)
    client.on(StreamingEvents.Turn, on_turn)
    client.on(StreamingEvents.Termination, on_terminated)
    client.on(StreamingEvents.Error, on_error)

    client.connect(
        StreamingParameters(
            speech_model="u3-rt-pro",
            sample_rate=16000,
        )
    )

    try:
        client.stream(
          aai.extras.MicrophoneStream(sample_rate=16000)
        )
    finally:
        client.disconnect(terminate=True)


if __name__ == "__main__":
    main()

# ElevenLabs
from elevenlabs import ElevenLabs

client = ElevenLabs(
    api_key="xi-api-key",
)

client.text_to_speech.stream(
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    output_format="mp3_44100_128",
    text="The first move is what sets everything in motion.",
    model_id="eleven_multilingual_v2",
)
