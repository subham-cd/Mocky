from fastapi import APIRouter, HTTPException
from services.groq_client import groq_client
from utils.groq_parser import safe_parse_groq_json
import json

router = APIRouter(prefix="/report", tags=["report"])

@router.post("/master-report")
async def generate_master_report(data: dict):
    resume_data = data.get("resumeData", {})
    ats_result = data.get("atsResult", {})
    interview_report = data.get("interviewReport", {})
    coding_results = data.get("codingResults", [])
    target_role = data.get("targetRole", "Unknown Role")

    system_prompt = """
    You are an elite Career Consultant and Executive Coach.
    Your task is to synthesize data from multiple neural assessments (Resume, ATS, Interview, Coding) 
    and generate a high-impact, structured 'Master Career Report'.

    Return ONLY a raw JSON object with the following exact structure:
    {
      "executive_summary": "A powerful 3-sentence summary of the candidate's current market standing.",
      "section_scores": {
        "resume_strength": <0-100>,
        "interview_acumen": <0-100>,
        "technical_efficiency": <0-100>,
        "market_readiness": <0-100>
      },
      "top_strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "critical_gaps": ["Gap 1", "Gap 2", "Gap 3"],
      "ai_verdict": "A blunt, realistic 2-sentence verdict on their immediate hiring probability.",
      "weekly_action_plan": [
        {"week": "Week 1", "focus": "...", "tasks": ["...", "..."]},
        {"week": "Week 2", "focus": "...", "tasks": ["...", "..."]},
        {"week": "Week 3", "focus": "...", "tasks": ["...", "..."]}
      ]
    }
    """
    
    user_prompt = f"""
    Target Role: {target_role}
    
    --- DATA FEEDS ---
    Parsed Resume: {json.dumps(resume_data)}
    ATS Results: {json.dumps(ats_result)}
    Live Interview Report: {json.dumps(interview_report)}
    Coding Lab Results: {json.dumps(coding_results)}
    
    Synthesize this data and generate the JSON report.
    """
    
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        return safe_parse_groq_json(raw_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
