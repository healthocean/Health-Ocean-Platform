from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_community.tools import DuckDuckGoSearchResults
import re
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Health Ocean AI Chatbot")

class ChatRequest(BaseModel):
    query: str

# Globals
embeddings = None
vector_store = None
llm = None
web_search_tool = None

def init_ai_service():
    global embeddings, vector_store, llm, web_search_tool
    print("🚀 Initializing Sanmare Assist AI Service...")

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    if not os.path.exists("./chroma_db"):
        from langchain_core.documents import Document
        vector_store = Chroma.from_documents(
            [Document(page_content="Health Ocean is a diagnostic lab booking platform.")],
            embeddings,
            persist_directory="./chroma_db"
        )
    else:
        vector_store = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)

    api_key = os.getenv("GROQ_API_KEY")
    llm = ChatGroq(
        temperature=0.4,
        groq_api_key=api_key,
        model_name="llama-3.1-8b-instant"
    )

    web_search_tool = DuckDuckGoSearchResults()
    print("✅ Sanmare Assist Ready!")

@app.on_event("startup")
async def startup_event():
    init_ai_service()

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not llm:
        raise HTTPException(status_code=500, detail="AI Service not initialized")

    query = request.query.strip()

    # --- Step 1: Classify intent ---
    intent_prompt = f"""You are classifying a user message for a health & lab booking assistant.

Classify into ONE of:
- GREETING   : hello, hi, how are you, thanks, bye, casual small talk
- CLOSING     : user says no/nhi/theek hai/ok/nothing/never mind to end conversation
- MEDICAL     : symptoms, diseases, health conditions, medicines, diet, fitness, mental health
- PLATFORM    : questions about Health Ocean app, booking tests, lab packages, reports, account
- OFF_TOPIC   : anything unrelated to health or this platform (politics, sports, movies, coding, etc.)

User message: "{query}"

Reply with ONLY the category word."""

    intent_resp = llm.invoke(intent_prompt)
    intent = intent_resp.content.strip().upper()

    # Normalize
    if "GREETING" in intent:
        intent = "GREETING"
    elif "CLOSING" in intent:
        intent = "CLOSING"
    elif "PLATFORM" in intent:
        intent = "PLATFORM"
    elif "OFF_TOPIC" in intent:
        intent = "OFF_TOPIC"
    else:
        intent = "MEDICAL"

    # --- Step 2: Handle GREETING ---
    if intent == "GREETING":
        greeting_prompt = f"""You are Sanmare Assist, a friendly AI health companion for Health Ocean.

CRITICAL LANGUAGE RULES:
Look at the EXACT words the user used: "{query}"
1. If the message is purely English (e.g., "nothing just getting bored", "hello"): You MUST reply in 100% pure professional English. ZERO Hindi words. No "Bhai", "Arre", "beta", "yaar".
2. If the message contains Hindi words (e.g., "kaise ho", "kuch nahi"): You MUST reply in Hinglish.

OTHER RULES:
- Keep your reply to 1 short sentence. Greet back naturally and gently ask how you can help.
- If the user says something casual ("I am bored") → just acknowledge professionally and redirect to health.
- Be a modern professional.
- Do NOT wrap your response in quotation marks.
- Do NOT add translations.

Your response (plain text, no quotes):"""
        resp = llm.invoke(greeting_prompt)
        answer = resp.content.strip().strip('"').strip("'")
        return {"answer": answer, "sources": []}

    # --- Step 3: Handle CLOSING ---
    if intent == "CLOSING":
        closing_prompt = f"""You are Sanmare Assist. The user is wrapping up.

CRITICAL LANGUAGE RULES:
Look at the EXACT words the user used: "{query}"
1. If the message is purely English: You MUST reply in 100% pure professional English. ZERO Hindi words. No "Bhai", "Arre", "yaar".
2. If the message contains Hindi words: You MUST reply in Hinglish.

Rules:
- Acknowledge naturally. Do NOT push them to ask more questions.
- Max 1 sentence. Wait for them to return.
- Do NOT wrap your response in quotation marks.

Your response (plain text, no quotes):"""
        resp = llm.invoke(closing_prompt)
        answer = resp.content.strip().strip('"').strip("'")
        return {"answer": answer, "sources": []}

    # --- Step 4: Handle OFF_TOPIC ---
    if intent == "OFF_TOPIC":
        offtopic_prompt = f"""You are Sanmare Assist, a health and lab booking assistant for Health Ocean.

The user asked something outside your scope. Politely decline and redirect them.

CRITICAL LANGUAGE RULES:
Look at the EXACT words the user used: "{query}"
1. If the message is purely English (e.g., "I am bored"): You MUST reply in 100% pure professional English. ZERO Hindi words. No "Bhai", "Arre", "yaar".
2. If the message contains Hindi words (e.g., "bor ho raha"): You MUST reply in Hinglish.

Rules:
- Be friendly, not dismissive.
- Briefly explain you're focused on health and lab tests.
- Invite them to ask a health-related question.
- Max 2 sentences.
- Do NOT wrap your response in quotation marks.

Your response (plain text, no quotes):"""
        resp = llm.invoke(offtopic_prompt)
        answer = resp.content.strip().strip('"').strip("'")
        return {"answer": answer, "sources": []}

    # --- Step 5: Handle PLATFORM questions ---
    if intent == "PLATFORM":
        platform_context = """Health Ocean is a diagnostic lab booking platform.
- Users can browse and book lab tests and health packages from certified labs.
- Home sample collection is available.
- Bookings can be tracked in the app under 'My Bookings'.
- Reports are available digitally once the lab uploads them.
- Supported payment: Cash on Delivery (COD). UPI/Card coming soon.
- Labs are NABL certified and verified by the admin team.
- Users can apply coupons: HEALTH10, OCEAN20, FIRST15 for discounts.
- To book: Add tests to cart → Proceed to Book → Enter address → Pick date/time → Confirm."""

        platform_prompt = f"""You are Sanmare Assist, the helpful AI assistant for Health Ocean.

Platform info:
{platform_context}

CRITICAL LANGUAGE RULES:
Look at the EXACT words the user used: "{query}"
1. If the message is purely English: You MUST reply in 100% pure professional English. ZERO Hindi words.
2. If the message contains Hindi words: You MUST reply in Hinglish.

Rules:
- Answer the user's question clearly and helpfully using the info above.
- If you don't know something specific, say so honestly and suggest they contact support.
- Be conversational, not robotic. Max 3-4 sentences.
- Do NOT wrap your response in quotation marks.

Your response (plain text, no quotes):"""
        resp = llm.invoke(platform_prompt)
        answer = resp.content.strip().strip('"').strip("'")
        return {"answer": answer, "sources": []}

    # --- Step 6: Handle MEDICAL queries with RAG + Web ---
    try:
        docs = vector_store.as_retriever(search_kwargs={"k": 5}).invoke(query)
        internal_context = "\n\n".join([d.page_content for d in docs])

        try:
                web_raw = web_search_tool.run(f"medical: {query}")
                web_context = web_raw
                # Extract links and filter out untrusted/unverified domains
                links = re.findall(r'https?://[^\s,\]\)]+', web_raw)
                exclude_list = ['wikipedia.org', 'reddit.com', 'quora.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'medium.com', 'pinterest.com']
                links = [link for link in links if not any(ex in link.lower() for ex in exclude_list)]
        except Exception:
            web_context = ""
            links = []

        medical_prompt = f"""You are Sanmare Assist, a direct and expert Medical Guide for Health Ocean.

CRITICAL INSTRUCTIONS:
- BASE your answer ONLY on the user's specific question: "{query}".
- BE EXTREMELY CONCISE. No long introductions or filler.
- DO NOT EXPLAIN basic medical concepts unless the user specifically asks "what is X". 
- GIVE STRAIGHT ANSWERS. (e.g., instead of "To determine if you need one, consider X", say "You should take a blood test if you experience symptoms like X or for yearly health checkups.")
- MAX 3-4 short points total.

FORMATTING RULES:
- Use numbered points.
- Points MUST start immediately after the number on the same line.
- Use double newlines between points.
- DO NOT wrap the response in quotation marks.

CRITICAL LANGUAGE RULES:
Look at the EXACT words the user used: "{query}"
1. If the message is purely English: You MUST reply in 100% pure professional English. ZERO Hindi words.
2. If the message contains Hindi words: You MUST reply in Hinglish.

MANDATORY ENDING:
- Every response MUST end with exactly this bold line on its own new line:
**Reminder:** Please consult one of our qualified doctors for a proper clinical diagnosis and treatment plan.

Reference Context:
{internal_context}

Web Research:
{web_context}

User's Question: "{query}"
Your response (plain text, no quotes):"""

        resp = llm.invoke(medical_prompt)
        answer = resp.content.strip().strip('"').strip("'")
        
        # Ensure the answer doesn't have multiple quotes if LLM hallucinated them
        while (answer.startswith('"') and answer.endswith('"')) or (answer.startswith("'") and answer.endswith("'")):
             answer = answer[1:-1].strip()
        
        # Extract unique source URLs (ONLY external links)
        source_links = []
        seen = set()
        for link in links:
            if link and link not in seen and link.startswith('http'):
                source_links.append(link) 
                seen.add(link)

        # --- New: Extract Suggested Tests ---
        tests_prompt = f"""Identify exactly 2-3 lab tests that are relevant to: "{query}".
CRITICAL: Use the EXACT test names as they appear in the "Reference" context below. 
Do NOT invent new names. Only suggest tests that are present in the Reference.

ONLY reply with a comma-separated list of test names. No other text.
If no tests from the Reference are strictly relevant, reply with: NONE

Reference: {internal_context}"""
        tests_resp = llm.invoke(tests_prompt)
        tests_raw = tests_resp.content.strip().strip('"').strip("'")
        suggested_tests = []
        if tests_raw.upper() != "NONE" and ("," in tests_raw or len(tests_raw) > 2):
            suggested_tests = [t.strip() for t in tests_raw.split(",") if t.strip()]

        return {
            "answer": answer,
            "sources": source_links,
            "suggested_tests": suggested_tests
        }

    except Exception as e:
        print(f"Error in medical chat: {e}")
        return {
            "answer": "I'm having a little trouble right now. Please try again in a moment, or describe your concern differently.",
            "sources": []
        }

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Sanmare Assist is running!"}
