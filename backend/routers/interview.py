from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from services.groq_client import groq_client
from utils.groq_parser import safe_parse_groq_json
import json
import os
import asyncio

router = APIRouter(prefix="/interview", tags=["interview"])

INTERVIEWER_SYSTEM_PROMPT = """
You are Sarah Mitchell, a warm, highly observant, and professional senior interviewer.
Your job is to conduct a high-stakes but encouraging realistic job interview.

Dynamic Interaction Rules:
1. HUMAN-LIKE REACTIVITY: Always acknowledge specific details from the candidate's last answer. If they mentioned a specific technology, challenge, or result, comment on it briefly (e.g., "That's a fascinating approach to microservices...") before moving on.
2. ADAPTIVE FLOW: You are not a robot reading a list. If an answer is brief, ask a probing follow-up (e.g., "Could you tell me more about your specific role in that?"). If an answer is comprehensive, provide a quick insight and transition naturally to the next phase.
3. CONVERSATIONAL TRANSITIONS: Use phrases like "Moving forward," "On a related note," or "I'd like to pivot to..." to keep the dialogue fluid.
4. PHASING: Aim for a deep conversation. While we target about 6-8 turns, focus on quality. If the candidate is on a roll, keep the momentum.
5. NO RATINGS: Never give scores, grades, or "Good job" filler during the interview. Stay in character.
6. BREVITY: Keep each response under 3-4 sentences total (acknowledgment + follow-up/new question).
"""

@router.post("/generate-questions")
async def generate_questions_endpoint(data: dict):
    resume_text = data.get("resume_text")
    role = data.get("role", "Software Engineer")
    
    system_prompt = """
    You are a Senior Technical Interviewer. Generate 6 high-impact interview questions.
    Return a JSON object with a key "questions" containing an array of 6 question objects.
    
    Format:
    {
      "questions": [
        {
          "id": 1,
          "type": "Technical",
          "question": "text",
          "what_we_look_for": "criteria",
          "difficulty": "Medium"
        }
      ]
    }
    """
    user_prompt = f"Role: {role}\nResume:\n{resume_text}"
    
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        parsed = safe_parse_groq_json(raw_json)
        if isinstance(parsed, dict) and "questions" in parsed:
            return parsed["questions"]
        return parsed # Fallback if it's already an array
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/live-start")
async def live_start(data: dict):
    resume_data = data.get("resume_data")
    role = data.get("target_role")
    
    try:
        user_prompt = f"""
            Start the interview for a {role} position.
            Candidate resume summary: {json.dumps(resume_data)}
            
            Open with a brief warm greeting (1 sentence), introduce yourself as Sarah,
            then ask the first question: "Tell me about yourself and what drew you to {role}."
            Keep it natural and human.
        """
        response = await groq_client.get_completion(user_prompt, INTERVIEWER_SYSTEM_PROMPT)
        return {"opening": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/live-turn")
async def live_turn(data: dict):
    history = data.get("conversation_history")
    resume_data = data.get("resume_data")
    role = data.get("target_role")
    q_num = data.get("question_number")
    
    try:
        system_msg = INTERVIEWER_SYSTEM_PROMPT + f"\nRole: {role}\nResume: {json.dumps(resume_data)}\nThis is question {q_num+1}."
        response = await groq_client.get_chat_completion(history, system_msg)
        return {"ai_response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/live-turn-stream")
async def live_turn_stream(data: dict):
    history = data.get("conversation_history")
    resume_data = data.get("resume_data")
    role = data.get("target_role")
    q_num = data.get("question_number")
    
    system_msg = INTERVIEWER_SYSTEM_PROMPT + f"\nRole: {role}\nResume: {json.dumps(resume_data)}\nQuestion {q_num+1}."
    
    messages = [{"role": "system", "content": system_msg}] + history

    async def generate():
        try:
            # We need to expose the stream from groq_client or call Groq direct here
            # For simplicity using the same client pattern as elsewhere
            # I will modify groq_client to support streaming later if needed, 
            # but for now I'll implement it here to satisfy Master Plan
            stream = await groq_client.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                max_tokens=250,
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

@router.post("/live-report")
async def live_report(data: dict):
    history = data.get("conversation_history")
    role = data.get("target_role")
    
    system_prompt = "You are an expert interview coach. Analyze this complete interview and return ONLY valid JSON."
    user_prompt = f"""
        Analyze this complete interview for a {role} position.
        Conversation: {json.dumps(history)}
        
        Return ONLY this JSON structure:
        {{
            "overall_score": <0-100>,
            "composite_grade": "<A/B/C/D>",
            "summary": "<2 sentence overall assessment>",
            "dimension_scores": {{
                "technical_depth": <0-100>,
                "communication": <0-100>,
                "problem_solving": <0-100>,
                "confidence": <0-100>,
                "relevance": <0-100>
            }},
            "strengths": ["strength1", "strength2", "strength3"],
            "optimization_gaps": ["gap1", "gap2", "gap3"],
            "answer_breakdown": [
                {{"question": "...", "answer_summary": "...", "score": <0-10>, "feedback": "..."}}
            ],
            "next_steps": ["actionable step 1", "actionable step 2"]
        }}
    """
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        return safe_parse_groq_json(raw_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate")
async def evaluate_answer_endpoint(data: dict):
    question = data.get("question")
    answer = data.get("answer")
    expected = data.get("what_we_look_for")
    
    system_prompt = """
    You are an expert interview coach.
    Given the question, expected answer criteria, and candidate's answer,
    return ONLY JSON with:
    {
      "scores": {"relevance": <0-10>, "clarity": <0-10>, "technical": <0-10>},
      "overall": <0-10>,
      "strengths": ["..."],
      "improvements": ["..."],
      "ideal_answer_hint": "...",
      "feedback": "A concise 2-3 sentence summary of the performance and how to improve."
    }
    """
    user_prompt = f"Question: {question}\nExpected: {expected}\nCandidate Answer: {answer}"
    
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        return safe_parse_groq_json(raw_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
