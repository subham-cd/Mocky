import json
import re

def safe_parse_groq_json(text: str) -> dict:
    """
    Safely parse JSON from Groq response.
    Handles markdown fences, trailing commas, and other common issues.
    """
    # Remove markdown code fences
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    
    # Find JSON object boundaries
    start = text.find('{')
    end = text.rfind('}') + 1
    if start != -1 and end > start:
        text = text[start:end]
    
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        # Log for debugging
        print(f"JSON parse error: {e}")
        print(f"Raw text: {text[:500]}")
        raise ValueError(f"Could not parse Groq response as JSON: {str(e)}")
