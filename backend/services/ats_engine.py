from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

def calculate_keyword_overlap(resume_text: str, jd_text: str):
    # Clean text
    def clean(text):
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        return text

    resume_clean = clean(resume_text)
    jd_clean = clean(jd_text)

    # Use TF-IDF to find keyword similarity
    vectorizer = TfidfVectorizer().fit_transform([resume_clean, jd_clean])
    vectors = vectorizer.toarray()

    cosine_sim = cosine_similarity(vectors)
    match_percentage = round(cosine_sim[0][1] * 100, 2)

    # Extract some potential missing keywords (simplified)
    # This is better done with LLM, but here's a basic version
    jd_words = set(jd_clean.split())
    resume_words = set(resume_clean.split())
    missing = list(jd_words - resume_words)
    
    # Filter for technical-looking words (optional, keep it simple for now)
    important_missing = [w for w in missing if len(w) > 3][:10]

    return {
        "match_percentage": match_percentage,
        "missing_keywords": important_missing
    }
