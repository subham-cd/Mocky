from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from services.groq_client import groq_client
from utils.groq_parser import safe_parse_groq_json
import json
import os
import asyncio

router = APIRouter(prefix="/interview", tags=["interview"])

SARAH_SYSTEM_PROMPT = """
You are Maya Lin, a warm, observant, and professional HR Manager.
Your focus: behavioral, situational, and culture fit questions.
Role: HR Manager at a top-tier tech firm.

Maya's Logic:
1. REACTION: Always acknowledge the candidate's last answer (e.g. "That shows great resilience...")
2. FOCUS: Ask about the "How" and "Why" behind their actions (e.g. "How did you handle conflict there?")
3. BREVITY: Keep response under 3 sentences.
"""

ALEX_SYSTEM_PROMPT = """
You are Rohan Menon, a sharp, direct, and elite Technical Lead.
Your focus: system design, coding architecture, and deep technical constraints.
Role: Tech Lead with 15+ years experience.

Rohan's Logic:
1. RIGOR: Be polite but probe for technical depth (e.g. "That's a good start, but how does that scale?")
2. FOCUS: Specific technologies, trade-offs, and Big-O complexity.
3. BREVITY: Keep response under 3 sentences.
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
        return parsed 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/live-start")
async def live_start(data: dict):
    resume_data = data.get("resume_data")
    role = data.get("target_role")
    mode = data.get("mode", "solo") # 'solo' or 'panel'
    
    try:
        if mode == "panel":
            user_prompt = f"""
                Introduction for a Panel Interview ({role}).
                Panel: Rohan Menon (Tech Lead) and Maya Lin (HR Manager).
                Candidate: {json.dumps(resume_data)}
                
                Action: Rohan should introduce both himself and Maya briefly, then ask the FIRST technical question.
                Keep it under 3 sentences.
            """
            response = await groq_client.get_completion(user_prompt, ALEX_SYSTEM_PROMPT)
            return {"opening": response, "agent": "alex"}
        else:
            user_prompt = f"""
                Start the solo interview for a {role} position. Maya is the interviewer.
                Candidate: {json.dumps(resume_data)}
                Ask first question: "Tell me about yourself and your interest in {role}."
            """
            response = await groq_client.get_completion(user_prompt, SARAH_SYSTEM_PROMPT)
            return {"opening": response, "agent": "sarah"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/panel-turn")
async def panel_turn_stream(data: dict):
    history = data.get("conversation_history", [])
    resume_data = data.get("resume_data")
    role = data.get("target_role")
    agent = data.get("agent", "alex") # 'alex' or 'sarah'
    
    system_msg = (ALEX_SYSTEM_PROMPT if agent == "alex" else SARAH_SYSTEM_PROMPT) + f"\nRole: {role}\nResume: {json.dumps(resume_data)}"
    
    # Clean history to remove unsupported properties like 'agent'
    clean_history = [{"role": m["role"], "content": m["content"]} for m in history]
    messages = [{"role": "system", "content": system_msg}] + clean_history

    async def generate():
        try:
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

@router.post("/live-turn-stream")
async def live_turn_stream(data: dict):
    history = data.get("conversation_history", [])
    resume_data = data.get("resume_data")
    role = data.get("target_role")
    
    system_msg = SARAH_SYSTEM_PROMPT + f"\nRole: {role}\nResume: {json.dumps(resume_data)}"
    
    # Clean history to remove unsupported properties like 'agent'
    clean_history = [{"role": m["role"], "content": m["content"]} for m in history]
    messages = [{"role": "system", "content": system_msg}] + clean_history

    async def generate():
        try:
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
    history = data.get("conversation_history", [])
    role = data.get("target_role")
    behavioral = data.get("behavioral_metrics", {})
    
    # Clean history for analysis just in case
    clean_history = [{"role": m["role"], "content": m["content"]} for m in history]
    
    # Nervousness Index Calculation
    filler_count = behavioral.get("filler_count", 0)
    avg_response_time = behavioral.get("avg_response_time", 0)
    answer_variance = behavioral.get("answer_variance", 0)

    f_score = min(100, (filler_count / 20) * 100)
    r_score = min(100, (avg_response_time / 10) * 100)
    v_score = min(100, (answer_variance / 200) * 100)
    
    nervousness_index = int((f_score * 0.4) + (r_score * 0.3) + (v_score * 0.3))
    
    if nervousness_index < 35:
        nervousness_label = "Calm"
    elif nervousness_index < 65:
        nervousness_label = "Moderate"
    else:
        nervousness_label = "Nervous"

    system_prompt = "You are an expert interview coach. Analyze this complete interview and return ONLY valid JSON."
    user_prompt = f"""
        Analyze this complete interview for a {role} position.
        Conversation: {json.dumps(clean_history)}
        Behavioral Metrics: {json.dumps(behavioral)}
        Calculated Nervousness: {nervousness_label} ({nervousness_index}/100)
        
        Return ONLY this JSON structure:
        {{
            "overall_score": <0-100>,
            "composite_grade": "<A/B/C/D>",
            "summary": "<2 sentence overall assessment>",
            "nervousness_index": {nervousness_index},
            "nervousness_label": "{nervousness_label}",
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
        parsed = safe_parse_groq_json(raw_json)
        # Ensure calculated metrics are in final response
        parsed["nervousness_index"] = nervousness_index
        parsed["nervousness_label"] = nervousness_label
        return parsed
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
