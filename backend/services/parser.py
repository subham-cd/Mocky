import pdfplumber
import spacy
import re
from typing import Dict, List, Any

# Load spaCy model (ensure en_core_web_sm is installed)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If not found, we'll need to install it later: python -m spacy download en_core_web_sm
    nlp = None

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def parse_resume(text: str) -> Dict[str, Any]:
    """
    Very basic initial parser. In a real scenario, this would be much more robust
    or use an LLM for extraction (which we might do via Groq later).
    """
    doc = nlp(text) if nlp else None
    
    # Placeholder simple extraction logic
    parsed_data = {
        "raw_text": text,
        "entities": [],
        "skills": [],
        "experience": [],
        "education": [],
        "projects": []
    }
    
    if doc:
        for ent in doc.ents:
            parsed_data["entities"].append({"text": ent.text, "label": ent.label_})
            
    # Simple keyword-based extraction for demonstration
    # In Phase 2/3, we will use Groq to make this high-quality.
    
    return parsed_data
