from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from services.groq_client import groq_client
import json

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/")
async def global_chat_stream(data: dict):
    message = data.get("message")
    history = data.get("conversation_history", [])
    user_context = data.get("user_context", {})
    
    resume_data = user_context.get("resumeData")
    ats_score = user_context.get("atsScore", 0)
    interview_score = user_context.get("interviewScore", 0)
    target_role = user_context.get("targetRole", "Unknown")
    
    system_prompt = f"""
    You are Mocky, an elite AI career assistant embedded in the Mocky AI platform. 
    You have direct access to the user's current session data: 
    - Resume Context: {json.dumps(resume_data) if resume_data else "No resume uploaded yet."}
    - ATS Keyword Match: {ats_score}/100
    - Interview Performance: {interview_score}/100
    - Target Career Path: {target_role}
    
    Mission:
    1. Answer questions about their specific scores and suggest concrete ways to improve them.
    2. Guide them through platform features (Neural Coding Lab, GitHub Audit, Resume AI).
    3. Provide encouraging, high-level career strategy based on their resume.
    
    Style:
    - Be concise (max 3-4 sentences).
    - Be professional, sharp, and encouraging.
    - If data is missing, suggest they upload a resume or take an interview to see results.
    """
    
    # Clean history to standard role/content format
    clean_history = [{"role": m["role"], "content": m["content"]} for m in history]
    messages = [{"role": "system", "content": system_prompt}] + clean_history + [{"role": "user", "content": message}]

    async def generate():
        try:
            stream = await groq_client.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                max_tokens=400,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield f"data: {delta}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
