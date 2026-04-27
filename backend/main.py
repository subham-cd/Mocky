from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from routers import resume, ats, interview, github, coverletter, salary, coding, roadmap

app = FastAPI(title="Mocky AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router)
app.include_router(ats.router)
app.include_router(interview.router)
app.include_router(github.router)
app.include_router(coverletter.router)
app.include_router(salary.router)
app.include_router(coding.router)
app.include_router(roadmap.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Mocky AI API - Production Active"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
