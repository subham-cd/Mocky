from fastapi import APIRouter, HTTPException
import httpx
import json
import os
from services.groq_client import groq_client
from utils.groq_parser import safe_parse_groq_json
from datetime import datetime, timedelta

router = APIRouter(prefix="/github", tags=["github"])

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

@router.post("/analyze")
async def analyze_github(data: dict):
    username = data.get("username", "").strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username required")
    
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    async with httpx.AsyncClient() as client_http:
        # Fetch basic user data
        user_res = await client_http.get(f"https://api.github.com/users/{username}", headers=headers)
        if user_res.status_code == 404:
            raise HTTPException(status_code=404, detail="GitHub user not found")
        user_data = user_res.json()

        # Fetch repos
        repos_res = await client_http.get(
            f"https://api.github.com/users/{username}/repos?per_page=50&sort=updated",
            headers=headers
        )
        repos = repos_res.json() if repos_res.status_code == 200 else []

        # Fetch recent events for activity analysis
        events_res = await client_http.get(
            f"https://api.github.com/users/{username}/events/public?per_page=100",
            headers=headers
        )
        events = events_res.json() if events_res.status_code == 200 else []

    # Process activity
    activity_count = len(events)
    recent_push_events = [e for e in events if e["type"] == "PushEvent"]
    last_push = recent_push_events[0]["created_at"] if recent_push_events else None
    
    # Analyze commit frequency (mock logic based on events)
    unique_days = len(set(e["created_at"][:10] for e in events))
    activity_density = unique_days / 30 if unique_days > 0 else 0 # approx last 30 days of public events

    repo_summary = []
    for r in repos:
        if not r["fork"]:
            repo_summary.append({
                "name": r["name"],
                "language": r["language"],
                "stars": r["stargazers_count"],
                "description": r["description"] or "",
                "updated": r["updated_at"][:10],
                "topics": r.get("topics", [])
            })
    
    # Get top 3 repos for deep dive
    top_repos = sorted(repo_summary, key=lambda x: x["stars"], reverse=True)[:3]
    
    lang_count = {}
    for r in repo_summary:
        if r["language"]:
            lang_count[r["language"]] = lang_count.get(r["language"], 0) + 1
    
    system_prompt = "You are a senior engineering recruiter and technical architect. Analyze this GitHub profile deeply. Return ONLY raw JSON."
    user_prompt = f"""
        Perform an ENHANCED audit of this GitHub profile for high-end engineering roles.
        
        Username: {username}
        Name: {user_data.get('name')}
        Bio: {user_data.get('bio')}
        Public Repos: {user_data.get('public_repos')}
        Followers: {user_data.get('followers')}
        
        ACTIVITY METRICS:
        - Recent Public Events (last 100): {activity_count}
        - Unique Active Days (in last 100 events): {unique_days}
        - Last Push Activity: {last_push}
        - Activity Density: {activity_density:.2f}
        
        REPO ANALYSIS:
        - Top Languages: {lang_count}
        - Primary Projects: {json.dumps(top_repos)}
        
        Return this exact JSON:
        {{
            "profile_score": 0,
            "activity_rating": "Elite/Active/Moderate/Inactive",
            "top_languages": ["lang1", "lang2"],
            "tech_stack_detected": ["framework1", "tool1"],
            "strongest_projects": [
                {{"name": "repo", "impact": "description of why it's strong"}}
            ],
            "strengths": ["detailed strength 1", "detailed strength 2"],
            "red_flags": ["potential concern 1"],
            "recommendations": ["specific actionable advice"],
            "recruiter_verdict": "Professional executive summary"
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
                "activity": {
                    "event_count": activity_count,
                    "last_push": last_push,
                    "density": activity_density
                }
            },
            "analysis": parsed,
            "repos": repo_summary[:10],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
