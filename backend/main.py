from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from routers import resume, ats, interview, github, coverletter, salary

app = FastAPI(title="Mocky AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, you can list your specific Vercel URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router)
app.include_router(ats.router)
app.include_router(interview.router)
app.include_router(github.router)
app.include_router(coverletter.router)
app.include_router(salary.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Mocky AI API - Production Active"}
