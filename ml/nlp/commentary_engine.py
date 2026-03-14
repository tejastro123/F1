from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import asyncio
import json
from langchain_anthropic import ChatAnthropic
from langchain.prompts import PromptTemplate
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="F1 AI Commentary Engine")

COMMENTARY_PROMPT = """
You are a legendary F1 commentator. Provide a short, exciting, and professional 1-2 sentence commentary for the following race event.
Mode: {mode}
Race State: {state}
Commentary (English + Hindi):"""

llm = ChatAnthropic(
    model="claude-3-5-sonnet-20240620",
    temperature=0.7,
    streaming=True
)

async def generate_commentary_stream(state: str, mode: str):
    prompt = PromptTemplate.from_template(COMMENTARY_PROMPT).format(state=state, mode=mode)
    async for chunk in llm.astream(prompt):
        content = chunk.content
        if content:
            yield f"data: {json.dumps({'content': content})}\n\n"
    yield "data: [DONE]\n\n"

@app.get("/commentary/stream")
async def stream_commentary(state: str, mode: str = "broadcast"):
    """
    Streams AI commentary for a given race state and mode.
    Mode can be: broadcast, stats, fan.
    """
    return StreamingResponse(
        generate_commentary_stream(state, mode),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
