from fastapi import APIRouter, UploadFile, File, HTTPException
from services.parser import extract_text_from_pdf, parse_resume
from services.groq_client import groq_client
from utils.groq_parser import safe_parse_groq_json
import os
import shutil
import json

router = APIRouter(prefix="/resume", tags=["resume"])

@router.post("/parse")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        text = extract_text_from_pdf(temp_path)
        
        system_prompt = """
        You are a world-class Resume Parsing Engine. Extract information from the provided resume text into a strictly valid JSON object.
        
        Rules:
        1. Extract all technical and soft skills into the 'skills' array.
        2. Format 'experience' and 'projects' to be clear and professional.
        3. If a field is missing, use an empty string or empty array.
        4. Focus on accuracy; do not hallucinate information.
        
        JSON format:
        {
            "name": "Full Name",
            "email": "Email Address",
            "phone": "Phone Number",
            "location": "City, Country",
            "summary": "Professional summary (2-3 sentences)",
            "skills": ["Skill 1", "Skill 2"],
            "experience": [{"company": "Company Name", "role": "Job Title", "duration": "Dates", "description": "Key achievements"}],
            "education": [{"institution": "University Name", "degree": "Degree", "year": "Graduation Year"}],
            "projects": [{"name": "Project Name", "description": "What was built and tech used"}]
        }
        """
        user_prompt = f"Resume Text:\n{text}"
        
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        parsed_data = safe_parse_groq_json(raw_json)
        
        parsed_data["raw_text"] = text
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/enhance")
async def enhance_resume_endpoint(data: dict):
    resume_text = data.get("resume_text")
    target_role = data.get("target_role", "Software Engineer")
    
    system_prompt = """
    You are an expert resume writer. Rewrite the given resume to be more impactful.

    Rules:
    - Use strong action verbs (Led, Engineered, Optimised, Delivered, Architected)
    - Add metrics where possible (even estimated ones like "~30% faster")
    - Keep same facts, just improve phrasing
    - Do NOT invent new experience

    Return ONLY raw JSON, no markdown.
    {
      "sections": {
        "summary": {
          "original": "...",
          "enhanced": "..."
        },
        "experience": [
          {
            "company": "...",
            "role": "...",
            "original_bullets": ["..."],
            "enhanced_bullets": ["..."]
          }
        ],
        "skills": {
          "original": ["..."],
          "enhanced": ["..."],
          "added": ["new skill suggestions based on existing skills"]
        },
        "projects": [
          {
            "name": "...",
            "original": "...",
            "enhanced": "..."
          }
        ]
      },
      "impact_score_before": 0,
      "impact_score_after": 0,
      "key_improvements": ["improvement 1", "improvement 2"]
    }
    """
    user_prompt = f"Target Role: {target_role}\nResume Text:\n{resume_text}"
    
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        parsed = safe_parse_groq_json(raw_json)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tailor")
async def tailor_resume_endpoint(data: dict):
    resume_text = data.get("resume_text")
    jd_text = data.get("job_description")
    
    if not resume_text or not jd_text:
        raise HTTPException(status_code=400, detail="Both resume text and job description are required")
        
    system_prompt = """
    You are a surgical resume consultant. Your job is to tailor a resume for a specific job description.

    Analyze carefully and return ONLY a raw JSON object (no markdown, no backticks, no explanation).
    The JSON must follow this EXACT structure:

    {
      "tailored_summary": {
        "original": "existing summary text or empty string if none",
        "tailored": "completely rewritten summary targeting this specific JD"
      },
      "bullet_rewrites": [
        {
          "original": "exact original bullet point text",
          "tailored": "improved version with JD keywords and metrics",
          "reason": "why this change improves ATS match"
        }
      ],
      "skills_to_add": ["skill missing from resume but in JD"],
      "skills_to_highlight": ["existing skill that directly matches JD requirement"],
      "skills_to_remove": ["skill irrelevant to this role that hurts ATS"],
      "keywords_injected": ["keyword1", "keyword2"],
      "ats_score_before": 0,
      "ats_score_after": 0,
      "changes_summary": "2-3 sentence explanation of the overall tailoring strategy"
    }
    """
    user_prompt = f"RESUME:\n{resume_text}\n\nJOB DESCRIPTION:\n{jd_text}"
    
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        parsed = safe_parse_groq_json(raw_json)
        return {"success": True, "result": parsed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
