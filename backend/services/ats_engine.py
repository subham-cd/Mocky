from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

def calculate_keyword_overlap(resume_text: str, jd_text: str):
    # Handle Guest Simulation Mode
    if resume_text == "GUEST_SIMULATION_MODE":
        # Provide a baseline score for simulation users instead of zero
        import random
        return {
            "match_percentage": random.uniform(45.0, 65.0),
            "missing_keywords": ["Leadership", "Scalability", "Agile", "Unit Testing"]
        }

    # Clean text
    def clean(text):
        text = str(text).lower()
        # Keep letters and numbers
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        return text

    resume_clean = clean(resume_text)
    jd_clean = clean(jd_text)

    if not resume_clean.strip() or not jd_clean.strip():
        return {"match_percentage": 0.0, "missing_keywords": []}

    try:
        # Use n-grams (1,2) to catch phrases like "machine learning" as well as single words
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english').fit_transform([resume_clean, jd_clean])
        vectors = vectorizer.toarray()

        cosine_sim = cosine_similarity(vectors)
        match_percentage = round(cosine_sim[0][1] * 100, 2)
    except Exception:
        match_percentage = 0.0

    # Extract missing keywords
    jd_words = set(jd_clean.split())
    resume_words = set(resume_clean.split())
    missing = list(jd_words - resume_words)
    important_missing = [w for w in missing if len(w) > 3][:10]

    return {
        "match_percentage": match_percentage,
        "missing_keywords": important_missing
    }
