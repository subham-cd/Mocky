from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from routers import resume, ats, interview, github, coverletter, salary

app = FastAPI(title="Mocky AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. Restrict in production.
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
    return {"message": "Welcome to CareerCraft AI API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
