from fastapi import APIRouter, HTTPException
import httpx
import json
from services.groq_client import groq_client
from utils.groq_parser import safe_parse_groq_json

router = APIRouter(prefix="/github", tags=["github"])

@router.post("/analyze")
async def analyze_github(data: dict):
    username = data.get("username", "").strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username required")
    
    async with httpx.AsyncClient() as client_http:
        repos_res = await client_http.get(
            f"https://api.github.com/users/{username}/repos?per_page=30&sort=updated",
            headers={"Accept": "application/vnd.github.v3+json"}
        )
        if repos_res.status_code == 404:
            raise HTTPException(status_code=404, detail="GitHub user not found")
        
        repos = repos_res.json()
        user_res = await client_http.get(f"https://api.github.com/users/{username}")
        user_data = user_res.json()
    
    repo_summary = [
        {
            "name": r["name"],
            "language": r["language"],
            "stars": r["stargazers_count"],
            "description": r["description"] or "",
            "updated": r["updated_at"][:10],
            "fork": r["fork"]
        }
        for r in repos if not r["fork"]
    ]
    
    lang_count = {}
    for r in repo_summary:
        if r["language"]:
            lang_count[r["language"]] = lang_count.get(r["language"], 0) + 1
    
    system_prompt = "You are a senior engineering recruiter analyzing a developer profile. Return ONLY raw JSON."
    user_prompt = f"""
        Analyze this GitHub profile for placement readiness.
        
        Username: {username}
        Public repos: {user_data.get('public_repos')}
        Followers: {user_data.get('followers')}
        Bio: {user_data.get('bio')}
        Top languages: {lang_count}
        Recent repos: {json.dumps(repo_summary[:10])}
        
        Return this exact JSON:
        {{
            "profile_score": 0,
            "top_languages": ["lang1", "lang2"],
            "strongest_projects": ["repo name with why"],
            "tech_stack_detected": ["tech1", "tech2"],
            "strengths": ["strength1", "strength2"],
            "red_flags": ["flag1", "flag2"],
            "recommendations": ["rec1", "rec2", "rec3"],
            "recruiter_verdict": "2-sentence honest assessment"
        }}
    """
    
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        parsed = safe_parse_groq_json(raw_json)
        return {
            "success": True,
            "github_data": {
                "username": username,
                "avatar": user_data.get("avatar_url"),
                "name": user_data.get("name"),
                "public_repos": user_data.get("public_repos"),
                "followers": user_data.get("followers"),
                "top_languages": lang_count,
            },
            "analysis": parsed,
            "repos": repo_summary[:8],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
