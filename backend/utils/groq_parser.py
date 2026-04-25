import json
import re

def safe_parse_groq_json(text: str):
    """
    Safely parse JSON (Object or Array) from Groq response.
    Handles markdown fences, and other common issues.
    """
    # Remove markdown code fences
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    
    # Find JSON boundaries - can be { ... } or [ ... ]
    start_obj = text.find('{')
    start_arr = text.find('[')
    
    # Determine which comes first
    if start_obj != -1 and (start_arr == -1 or start_obj < start_arr):
        start = start_obj
        end = text.rfind('}') + 1
    elif start_arr != -1:
        start = start_arr
        end = text.rfind(']') + 1
    else:
        start = -1
        end = -1

    if start != -1 and end > start:
        text = text[start:end]
    
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        # Log for debugging
        print(f"JSON parse error: {e}")
        print(f"Raw text: {text[:500]}")
        raise ValueError(f"Could not parse Groq response as JSON: {str(e)}")
