from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from services.groq_client import groq_client
from utils.groq_parser import safe_parse_groq_json
import json
import os
import asyncio

router = APIRouter(prefix="/interview", tags=["interview"])

SARAH_SYSTEM_PROMPT = """
You are Maya Lin, a warm, observant, and highly professional HR Manager.
Your goal is to conduct a conversational yet rigorous behavioral interview.

Maya's Human Interview Logic:
1. ADAPTIVE DEPTH: 
   - Early Session (Turns 0-2): Keep it light. Focus on introductions, career interest, and high-level resume highlights.
   - Mid Session (Turns 3-5): Probing phase. Ask for specific 'S.T.A.R' examples (Situations, Tasks, Actions, Results) regarding conflict, leadership, and failure.
   - Late Session (Turns 6+): Culture fit and pressure tests. Ask deep situational curveballs.
2. REAL-TIME FLEXIBILITY: If the candidate asks you a question or seeks clarification, pivot naturally. Answer them like a real human would, then gently steer back to the interview when appropriate.
3. REACTION: Never ignore an answer. Acknowledge what they said with professional empathy or insight before moving to your next point.
4. CONCISION: Keep your responses under 3 sentences. Maintain a professional, executive persona.
"""

ALEX_SYSTEM_PROMPT = """
You are Rohan Menon, a sharp, direct, and elite Technical Lead.
Your goal is to assess technical depth, architectural thinking, and problem-solving rigor.

Rohan's Human Interview Logic:
1. PROGRESSIVE RIGOR:
   - Early Session (Turns 0-2): High-level tech stack and architecture questions based on their resume.
   - Mid Session (Turns 3-5): Deep dive into trade-offs, scalability, and specific technology constraints.
   - Late Session (Turns 6+): Elite-level optimization, Big-O complexity, and disaster recovery scenarios.
2. TECHNICAL FLEXIBILITY: If the candidate asks for technical clarification or asks for your opinion on a tech choice, answer accurately and naturally as an experienced lead before continuing your assessment.
3. REACTION: Briefly acknowledge the validity or flaws in their previous technical explanation.
4. CONCISION: Keep your responses under 3 sentences. Stay in character as a busy, high-performing engineer.
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
    mode = data.get("mode", "solo")
    
    try:
        if mode == "panel":
            user_prompt = f"""
                Introduction for a professional Panel Interview for a {role} position.
                Panelists: Rohan Menon (Tech Lead) and Maya Lin (HR Manager).
                Candidate Resume Data: {json.dumps(resume_data)}
                
                Action: Rohan should warmly introduce both himself and Maya, set the stage, and ask an introductory technical/role-interest question.
                Keep it professional and under 3 sentences.
            """
            response = await groq_client.get_completion(user_prompt, ALEX_SYSTEM_PROMPT)
            return {"opening": response, "agent": "alex"}
        else:
            user_prompt = f"""
                Start a professional interview for a {role} position. You are Maya Lin.
                Candidate Resume Data: {json.dumps(resume_data)}
                Ask an introductory question: "Tell me about yourself and what specifically excites you about the {role} role?"
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
    agent = data.get("agent", "alex")
    
    # Clean history to remove custom UI properties
    clean_history = [{"role": m["role"], "content": m["content"]} for m in history]
    turn_count = len(clean_history) // 2
    
    context_msg = f"\nTarget Role: {role}\nCurrent turn in interview: {turn_count}.\nCandidate Background: {json.dumps(resume_data)}"
    system_msg = (ALEX_SYSTEM_PROMPT if agent == "alex" else SARAH_SYSTEM_PROMPT) + context_msg
    
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
    
    clean_history = [{"role": m["role"], "content": m["content"]} for m in history]
    turn_count = len(clean_history) // 2
    
    context_msg = f"\nTarget Role: {role}\nCurrent turn in interview: {turn_count}.\nCandidate Background: {json.dumps(resume_data)}"
    system_msg = SARAH_SYSTEM_PROMPT + context_msg
    
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
    
    clean_history = [{"role": m["role"], "content": m["content"]} for m in history]
    
    filler_count = behavioral.get("filler_count", 0)
    avg_response_time = behavioral.get("avg_response_time", 0)
    answer_variance = behavioral.get("answer_variance", 0)

    f_score = min(100, (filler_count / 20) * 100)
    r_score = min(100, (avg_response_time / 10) * 100)
    v_score = min(100, (answer_variance / 200) * 100)
    nervousness_index = int((f_score * 0.4) + (r_score * 0.3) + (v_score * 0.3))
    
    if nervousness_index < 35: nervousness_label = "Calm"
    elif nervousness_index < 65: nervousness_label = "Moderate"
    else: nervousness_label = "Nervous"

    system_prompt = "You are an expert interview coach. Analyze this complete interview and return ONLY valid JSON."
    user_prompt = f"""
        Analyze this complete interview for a {role} position.
        Conversation: {json.dumps(clean_history)}
        Behavioral Metrics: {json.dumps(behavioral)}
        
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
