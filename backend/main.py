from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define Request Model
class ResumeRequest(BaseModel):
    resumeText: str

# Root Route (Check if running)
@app.get("/")
def root():
    return {"message": "FastAPI is running!"}

# Post route to analyze resume
@app.post("/analyze-resume/")
def analyze_resume(request: ResumeRequest):
    if not request.resumeText.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [{
                "text": f"""
Extract structured data from resumes, key sections such as personal details, education, work experience, and skills.\n\n

I. Personal Details:\n\n
Name: [Extracted Name]\n\n
Title: [Extracted Title]\n\n
Address: [Extracted Address]\n\n
Phone: [Extracted Phone]\n\n
Email: [Extracted Email]\n\n
LinkedIn: [Extracted LinkedIn or " Missing - Needs User Input"]\n\n
Age: [Extracted Age or " Missing - Needs User Input"]\n\n

\n\n
II. Education:\n\n
Degree: [Degree]\n\n
Institution: [University Name]\n\n
Duration: [Start Date - End Date]\n\n

\n\n
III. Work Experience:\n\n
Job Title: [Title]\n\n
Company: [Company Name]\n\n
Location: [Location]\n\n
Duration: [Start Date - End Date]\n\n
Responsibilities:\n\n
   [Responsibility 1]\n\n
   [Responsibility 2]\n\n
   [Key Achievement]\n\n

\n\n
IV. Skills:\n\n
- [Skill 1]\n\n
- [Skill 2]\n\n
- [Skill 3]\n\n
---
\n\n
V. Resume Assessment:\n\n
Strengths:\n\n
- [Strength 1]\n\n
- [Strength 2]\n\n
---
\n\n
Areas for Improvement:\n\n
- [Issue 1]\n\n
- [Issue 2]\n\n
---
\n\n
Suggestions for Enhancement:\n\n
Clarify employment dates and duration.\n\n
Quantify accomplishments with more data.\n\n
Expand the skills section with relevant keywords.\n\n
Include a professional LinkedIn profile URL.\n\n

\n\n
Resume:\n\n
{request.resumeText}
"""
            }]
        }]
    }

    GOOGLE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    response = requests.post(
        f"{GOOGLE_API_URL}?key=AIzaSyBdh3Bcn8ik-kf-IKAt8nx_yjpfLWw1F6s",
        json=payload,
        headers=headers
    )

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())

    return response.json()




