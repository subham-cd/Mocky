from fastapi import APIRouter, HTTPException
from services.ats_engine import calculate_keyword_overlap
from services.groq_client import groq_client
from utils.groq_parser import safe_parse_groq_json
import json

router = APIRouter(prefix="/ats", tags=["ats"])

@router.post("/score")
async def score_ats_endpoint(data: dict):
    # data expected: { "resume_text": "...", "job_description": "..." }
    resume_text = data.get("resume_text")
    jd_text = data.get("job_description")
    
    if not resume_text or not jd_text:
        raise HTTPException(status_code=400, detail="Both resume text and job description are required")
        
    # 1. Quantitative Match (ML: TF-IDF Vectorization)
    tf_idf_results = calculate_keyword_overlap(resume_text, jd_text)
    ml_score = tf_idf_results.get("match_percentage", 0)
    
    # 2. Qualitative Match (DL: Llama 3.3 Large Language Model)
    system_prompt = """
    You are an ATS (Applicant Tracking System) forensic analyst.
    Evaluate the resume against the job description for qualitative alignment.
    
    Return ONLY a JSON object with:
    {
      "qualitative_score": <0-100 score based on context, semantics, and seniority match>,
      "matched_keywords": [...],
      "missing_keywords": [...],
      "section_scores": {
        "summary": <0-20>, "experience": <0-30>,
        "skills": <0-25>, "education": <0-15>, "projects": <0-10>
      },
      "critical_fixes": ["fix1", "fix2"],
      "format_issues": [...]
    }
    """
    user_prompt = f"Resume:\n{resume_text}\n\nJob Description:\n{jd_text}\nML Math Score: {ml_score}%"
    
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        groq_results = safe_parse_groq_json(raw_json)
        
        # 3. Hybrid Synthesis
        qualitative_score = groq_results.get("qualitative_score", 0)
        
        # Final combined score: 40% ML Match, 60% Qualitative Context
        final_ats_score = int((ml_score * 0.4) + (qualitative_score * 0.6))
        
        # Add metadata for UI
        groq_results["ats_score"] = final_ats_score
        groq_results["ml_score"] = ml_score
        groq_results["llm_score"] = qualitative_score
        
        return groq_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
