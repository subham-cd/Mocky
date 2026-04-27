# 🧠 Mocky AI
### The Neural Operating System for Modern Careers

Mocky AI is a state-of-the-art career preparation platform that leverages high-speed neural orchestration to bridge the gap between job seekers and their target roles. It provides a unified ecosystem for resume optimization, real-time mock interviews, and role-specific coding assessments.

---

## 🚀 Core Neural Modules

### 1. **Neural Coding Lab** 💻
- **Role-Based Challenges:** Algorithm assessments tailored to specific designations (Software Engineer, DevOps, ML, etc.).
- **AI Evaluation Engine:** Instant review of Logic, Time/Space Complexity (Big O), and Clean Code standards.
- **Neural Terminal:** A professional, browser-based coding environment with real-time evaluation feedback.

### 2. **Sarah Mitchell: Live Interview Room** 🎙️
- **Voice Interaction:** Natural, voice-based interview simulation featuring our AI recruiter, Sarah Mitchell.
- **Dynamic Follow-ups:** Unlike static tools, our AI listens to your responses and asks logical follow-up questions.
- **Sentiment & Depth Analysis:** Evaluates candidate confidence, communication flow, and technical accuracy.

### 3. **Career Roadmap & Ladder** 🪜
- **12-Step Progression:** A visual ladder UI mapping the path from Junior to Lead roles.
- **Gap Identification:** Compares your current skills against market requirements to generate actionable milestones.
- **Mastery Tracking:** Real-time progress monitoring as you complete specific career nodes.

### 4. **Surgical ATS Engine** 🎯
- **Keyword Matching:** Deep analysis of resume text against Job Descriptions (JD).
- **Critical Fixes:** Identifies exactly what is preventing your resume from passing automated filters.
- **Neural Scoring:** Provides a "Neural Competency Index" (0-100) and actionable improvement suggestions.

### 5. **GitHub Ecosystem Audit** 🐙
- **Neural Pulse Tracking:** Analyzes commit density and repository activity.
- **Tech Stack Detection:** Automatically identifies your core ecosystem based on actual code contributions.
- **Recruiter Verdict:** Generates an AI-driven summary of your engineering impact.

---

## 🛠️ Technical Architecture

### **Frontend**
- **Framework:** React 18 (TypeScript)
- **Styling:** Vanilla CSS & Tailwind CSS (Rich, futuristic dark-mode UI)
- **Visualization:** Recharts (Radar charts & Performance vectors)
- **Icons:** Lucide React

### **Backend**
- **Engine:** FastAPI (Python 3.12)
- **Parsing:** PDFMiner.six & PDFPlumber (High-accuracy resume extraction)
- **AI Orchestration:** Groq Cloud API
- **Models:** Llama-3.3-70b-versatile & Llama-3-8b-instant

### **Deployment**
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Railway
- **Containerization:** Docker

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.12+
- Node.js 18+
- Groq API Key

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create .env and add GROQ_API_KEY
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create .env and add VITE_API_URL=http://localhost:8000
npm run dev
```

---

## 🌟 Why Mocky AI?

In a world where 70% of resumes are rejected by bots, Mocky AI gives candidates the "Neural Edge." By combining **Speed** (via Groq), **Context** (via Llama-3.3), and **Design**, we've built more than a tool—we've built a Career Operating System.

---

## 📄 License
Project developed for **Tech Sageathon 2K26**. All rights reserved.
