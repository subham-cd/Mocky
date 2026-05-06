from fastapi import APIRouter, HTTPException
from services.groq_client import groq_client
from utils.groq_parser import safe_parse_groq_json
import json

router = APIRouter(prefix="/coding", tags=["coding"])

@router.post("/generate")
async def generate_challenge(data: dict):
    role = data.get("role", "Software Engineer")
    difficulty = data.get("difficulty", "Medium")
    category = data.get("category", "Data Structures & Algorithms")
    
    system_prompt = """
    You are a Technical Interviewer. Generate a realistic coding or technical challenge based on the requested category.
    Return ONLY a JSON object.
    
    Format:
    {
      "title": "Problem Title",
      "category": "category_name",
      "description": "Detailed problem description...",
      "constraints": ["constraint 1", "constraint 2"],
      "examples": [
        {"input": "...", "output": "...", "explanation": "..."}
      ],
      "starter_code": "The initial code snippet the user should see",
      "difficulty": "Easy/Medium/Hard"
    }
    
    Category Specific Rules:
    - SQL: provide table schemas in description, and expect a SQL query as solution.
    - System Design: provide a architectural scenario and expect a written design/component list.
    - DSA: provide typical input/output expectations and expect a function implementation.
    """
    user_prompt = f"Role: {role}\nCategory: {category}\nDifficulty: {difficulty}\nProvide a high-quality challenge focusing strictly on {category}."
    
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        return safe_parse_groq_json(raw_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate")
async def evaluate_code(data: dict):
    problem = data.get("problem")
    code = data.get("code")
    role = data.get("role")
    
    system_prompt = """
    You are a Senior Software Architect and Technical Interviewer. 
    Thoroughly evaluate the user's submitted response to the given problem.
    
    Rules:
    1. For code (DSA/SQL): Analyze logic, efficiency, and style.
    2. For System Design: Analyze scalability, fault tolerance, and component choice.
    3. Be critical but constructive.
    
    Return ONLY a JSON object.
    Format:
    {
      "logic_score": <0-100>,
      "complexity_score": <0-100>,
      "style_score": <0-100>,
      "overall_score": <0-100>,
      "time_complexity": "O(...) or N/A",
      "space_complexity": "O(...) or N/A",
      "feedback": "...",
      "strengths": ["...", "..."],
      "improvements": ["...", "..."],
      "optimized_version": "Full optimized version of the code or a structured design review"
    }
    """
    user_prompt = f"Problem: {json.dumps(problem)}\nRole: {role}\nCandidate Response:\n{code}"
    
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        return safe_parse_groq_json(raw_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
