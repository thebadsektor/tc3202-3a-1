from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation

from dotenv import load_dotenv
import os

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

# Download required NLTK datasets
nltk.download("punkt")
nltk.download('punkt_tab')
nltk.download("wordnet")
nltk.download("stopwords")

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

MONTHS = {
    "january", "jan", "february", "feb", "march", "mar", "april", "apr", "may", "june", "jun",
    "july", "jul", "august", "aug", "september", "sep", "october", "oct", "november", "nov", "december", "dec"
}
LOCATION_TERMS = {
    "province", "city", "state", "country", "region", "district", "area", 
    "village", "municipality", "town", "location", "zipcode", "barangay"
}
# Custom stopwords for resumes (improves accuracy)
CUSTOM_STOPWORDS = set(stopwords.words("english")).union(
    {"resume", "experience", "work", "job", "position", "role", "company", "skills", "responsibilities", "summary"}
).union(MONTHS).union(LOCATION_TERMS)

# Function: Clean and Preprocess Text (Using NLTK)
def preprocess_text(text):
    text = text.lower()  # Convert to lowercase
    text = re.sub(r"\d+", "", text)  # Remove numbers
    text = re.sub(r"\W+", " ", text)  # Remove special characters
    
    tokens = word_tokenize(text)
    lemmatizer = WordNetLemmatizer()
    
    words = [lemmatizer.lemmatize(word) for word in tokens if word.isalpha() and word not in CUSTOM_STOPWORDS]
    
    return " ".join(words)

# Root Route (Check if running)
@app.get("/")
def root():
    return {"message": "FastAPI is running!"}

# Resume Analysis Route (Using Gemini API)
@app.post("/analyze-resume/")
def analyze_resume(request: ResumeRequest):
    print("🔹 Received Resume Text for Analysis")  # Debugging Log

    if not request.resumeText.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [{
                "text": f"""
Extract structured data from resumes, key sections such as personal details, education, work experience, and skills.

I. Personal Details:

Name: [Extracted Name]
Title: [Extracted Title]
Address: [Extracted Address]
Phone: [Extracted Phone]
Email: [Extracted Email]
LinkedIn: [Extracted LinkedIn or " Missing - Needs User Input"]
Age: [Extracted Age or " Missing - Needs User Input"]

II. Education:

Degree: [Degree]
Institution: [University Name]
Duration: [Start Date - End Date]

III. Work Experience:

Job Title: [Title]
Company: [Company Name]
Location: [Location]
Duration: [Start Date - End Date]
Responsibilities:
   [Responsibility 1]
   [Responsibility 2]
   [Key Achievement]

IV. Skills:

- [Skill 1]
- [Skill 2]
- [Skill 3]

---

V. Resume Assessment:

Strengths:

- [Strength 1]
- [Strength 2]

---

Areas for Improvement:

- [Issue 1]
- [Issue 2]

---

Suggestions for Enhancement:

- Clarify employment dates and duration.
- Quantify accomplishments with more data.
- Expand the skills section with relevant keywords.
- Include a professional LinkedIn profile URL.

---

Resume:
{request.resumeText}
"""
            }]
        }]
    }

    GOOGLE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    # Send Request to Google API
    try:
        response = requests.post(
            f"{GOOGLE_API_URL}?key={API_KEY}",
            json=payload,
            headers=headers
        )
        print("🔹 Google API Response Status:", response.status_code)  # Debugging Log
        print("🔹 Google API Response:", response.text[:500])  # Log first 500 chars

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.json())

        return response.json()

    except requests.exceptions.RequestException as e:
        print("❌ Google API Request Failed:", str(e))
        raise HTTPException(status_code=500, detail="Failed to connect to Google API.")

# Job Role Extraction (Topic Modeling)
@app.post("/analyze-topics/")
def analyze_topics(request: ResumeRequest):
    print("🔹 Received Resume Text for Topic Modeling")  # Debugging Log

    text = request.resumeText.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")

    cleaned_text = preprocess_text(text)

    # Ensure there is enough content for topic modeling
    if len(cleaned_text.split()) < 10:  # At least 10 words
        return {"job_roles": ["Not enough text for analysis"]}

    # Vectorization (Using TF-IDF for better results)
    vectorizer = TfidfVectorizer(max_features=2000)
    X = vectorizer.fit_transform([cleaned_text])

    # Check if vectorized text is empty
    if X.shape[1] == 0:
        return {"job_roles": ["No significant terms found in the resume"]}

    # LDA Topic Modeling (Detecting Job Roles)
    lda = LatentDirichletAllocation(n_components=1, random_state=42, max_iter=10)
    lda.fit(X)

    # Extracting Job Roles
    job_roles = []
    for topic_idx, topic in enumerate(lda.components_):
        topic_words = [vectorizer.get_feature_names_out()[i] for i in topic.argsort()[:-6:-1]]
        job_roles.append(", ".join(topic_words))

    return {"job_roles": job_roles if job_roles else ["No job roles detected"]}

