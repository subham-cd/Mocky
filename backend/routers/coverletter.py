from fastapi import APIRouter, HTTPException
import json
from services.groq_client import groq_client
from utils.groq_parser import safe_parse_groq_json

router = APIRouter(prefix="/coverletter", tags=["coverletter"])

@router.post("/generate")
async def generate_cover_letter(data: dict):
    resume_data = data["resume_data"]
    jd_text = data["jd_text"]
    company_name = data.get("company_name", "the company")
    style = data.get("style", "professional")
    
    style_instructions = {
        "professional": "Formal, structured, traditional corporate tone",
        "conversational": "Warm, human, slightly informal but respectful",
        "bold": "Confident, direct, attention-grabbing opener"
    }
    
    system_prompt = "You are an expert career coach. Return ONLY raw JSON."
    user_prompt = f"""
        Generate a cover letter and cold email based on this candidate's profile and job description.
        
        Style: {style_instructions.get(style, style_instructions['professional'])}
        Company: {company_name}
        
        Resume: {json.dumps(resume_data)}
        Job Description: {jd_text}
        
        Return this JSON:
        {{
            "cover_letter": "full cover letter text with proper line breaks",
            "cold_email": {{
                "subject": "email subject line",
                "body": "full cold email body"
            }},
            "key_selling_points": ["point1", "point2", "point3"]
        }}
    """
    
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        parsed = safe_parse_groq_json(raw_json)
        return {"success": True, "result": parsed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
