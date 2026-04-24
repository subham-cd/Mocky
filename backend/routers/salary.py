from fastapi import APIRouter, HTTPException
import json
from services.groq_client import groq_client
from utils.groq_parser import safe_parse_groq_json

router = APIRouter(prefix="/salary", tags=["salary"])

@router.post("/estimate")
async def salary_estimate(data: dict):
    skills = data.get("skills", [])
    role = data.get("role", "Software Engineer")
    experience_years = data.get("experience_years", 0)
    location = data.get("location", "India")
    
    system_prompt = "You are a compensation expert. Return ONLY raw JSON."
    user_prompt = f"""
        Estimate salary range for:
        Role: {role}
        Skills: {', '.join(skills)}
        Experience: {experience_years} years
        Location: {location}
        
        Return this exact JSON structure:
        {{
            "min_salary": 0,
            "max_salary": 0,
            "median_salary": 0,
            "currency": "LPA" or "USD/yr",
            "top_paying_skills": ["skill1", "skill2"],
            "skills_to_add_for_raise": ["skill1", "skill2"],
            "market_demand": "High/Medium/Low",
            "insight": "2-sentence market insight"
        }}
    """
    
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        parsed = safe_parse_groq_json(raw_json)
        return {"success": True, "result": parsed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
