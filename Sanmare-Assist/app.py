import gradio as gr
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    from huggingface_hub import InferenceClient
    client = InferenceClient("HuggingFaceH4/zephyr-7b-beta", token=os.getenv("HF_TOKEN"))
except ImportError:
    client = None

class ChatRequest(BaseModel):
    query: str

@app.post("/api/chat")
def chat_api(request: ChatRequest):
    query = request.query
    answer = "I am Sanmare Assist. How can I help you today?"
    suggested_tests = []
    
    if client:
        try:
            system_prompt = "You are Sanmare Assist, a helpful medical AI assistant for the Health Ocean app. Give brief guidance but importantly advice consulting a doctor. Dont use formatting that is hard to read."
            messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": query}]
            response = client.chat_completion(messages, max_tokens=150)
            answer = response.choices[0].message.content
        except Exception as e:
            answer = f"Error generating response: {str(e)}"
            
    query_lower = query.lower()
    if "fever" in query_lower or "blood" in query_lower or "infection" in query_lower:
        suggested_tests.append("Complete Blood Count (CBC)")
    if "sugar" in query_lower or "diabetes" in query_lower:
        suggested_tests.append("HbA1c")
    if "thyroid" in query_lower:
        suggested_tests.append("Thyroid Profile")
    if "heart" in query_lower or "cholesterol" in query_lower:
        suggested_tests.append("Lipid Profile")

    return {
        "answer": answer,
        "sources": ["https://www.who.int/", "https://medlineplus.gov/"],
        "suggested_tests": suggested_tests
    }

def dummy():
    return "Sanmare Assist API is running on Hugging Face Spaces!"

demo = gr.Interface(fn=dummy, inputs=None, outputs="text")
app = gr.mount_gradio_app(app, demo, path="/")
