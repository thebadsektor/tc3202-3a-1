# Import necessary libraries and modules
from fastapi import FastAPI, HTTPException  # FastAPI core and error handling
from pydantic import BaseModel  # Data validation model
from fastapi.middleware.cors import CORSMiddleware  # CORS configuration
import requests  # For making API requests
import re  # Regex for text preprocessing
import nltk  # Natural Language Toolkit for NLP tasks
from nltk.tokenize import word_tokenize  # Tokenizer
from nltk.corpus import stopwords  # Stopwords list
from nltk.stem import WordNetLemmatizer  # Lemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer  # Feature extraction
from sklearn.decomposition import LatentDirichletAllocation  # Topic modeling

from dotenv import load_dotenv  # Load environment variables
import os  # OS module to access environment variables

# Load environment variables from .env file
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")  # Fetch Google API key

# Download necessary NLTK datasets
nltk.download("punkt")  # Tokenizer model
nltk.download('punkt_tab')  # Optional, might not be required
nltk.download("wordnet")  # WordNet Lemmatizer model
nltk.download("stopwords")  # Stopwords

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the request body schema
class ResumeRequest(BaseModel):
    resumeText: str  # Expecting resume text from frontend

# Define extra stopword sets for improved filtering
MONTHS = {
    "january", "jan", "february", "feb", "march", "mar", "april", "apr", "may", "june", "jun",
    "july", "jul", "august", "aug", "september", "sep", "october", "oct", "november", "nov", "december", "dec"
}
LOCATION_TERMS = {
    "province", "city", "state", "country", "region", "district", "area", 
    "village", "municipality", "town", "location", "zipcode", "barangay"
}

# Combine all stopwords into a custom list for resume cleaning
CUSTOM_STOPWORDS = set(stopwords.words("english")).union(
    {"resume", "experience", "work", "job", "position", "role", "company", "skills", "responsibilities", "summary"}
).union(MONTHS).union(LOCATION_TERMS)

# Preprocess resume text
def preprocess_text(text):
    text = text.lower()  # Lowercase
    text = re.sub(r"\d+", "", text)  # Remove numbers
    text = re.sub(r"\W+", " ", text)  # Remove special characters
    
    tokens = word_tokenize(text)  # Tokenize text
    lemmatizer = WordNetLemmatizer()  # Initialize lemmatizer
    
    # Remove stopwords and lemmatize
    words = [lemmatizer.lemmatize(word) for word in tokens if word.isalpha() and word not in CUSTOM_STOPWORDS]
    
    return " ".join(words)  # Return cleaned text

# Function to chunk text into smaller parts
def chunk_resume(text, chunk_size=50):
    words = text.split()
    return [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]

# Root endpoint to test if backend is running
@app.get("/")
def root():
    return {"message": "FastAPI is running!"}

# Endpoint to analyze resume using Gemini API
@app.post("/analyze-resume/")
def analyze_resume(request: ResumeRequest):
    print("🔹 Received Resume Text for Analysis")  # Log

    if not request.resumeText.strip():  # Check if resume is empty
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")

    headers = {"Content-Type": "application/json"}  # Set headers
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

    # Send POST request to Gemini API
    try:
        response = requests.post(
            f"{GOOGLE_API_URL}?key={API_KEY}",
            json=payload,
            headers=headers
        )
        print("🔹 Google API Response Status:", response.status_code)
        print("🔹 Google API Response:", response.text[:500])  # First 500 chars

        # Raise error if not successful
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.json())

        return response.json()  # Return analysis response

    except requests.exceptions.RequestException as e:
        print("❌ Google API Request Failed:", str(e))
        raise HTTPException(status_code=500, detail="Failed to connect to Google API.")

# Endpoint for topic modeling to extract job roles
@app.post("/analyze-topics/")
def analyze_topics(request: ResumeRequest):
    print("🔹 Received Resume Text for Topic Modeling")  # Log

    text = request.resumeText.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")

    cleaned_text = preprocess_text(text)  # Preprocess resume

    if len(cleaned_text.split()) < 10:  # Check word count
        return {"job_roles": ["Not enough text for analysis"]}

    # Chunk the resume text into smaller parts (optional: you can tweak chunk size as needed)
    chunks = chunk_resume(cleaned_text, chunk_size=110)

    # Convert chunks to vector format using TF-IDF
    vectorizer = TfidfVectorizer(max_features=2000)
    X = vectorizer.fit_transform(chunks)

    # If vectorized content is empty
    if X.shape[1] == 0:
        return {"job_roles": ["No significant terms found in the resume"]}

    # Run LDA for topic modeling
    lda = LatentDirichletAllocation(n_components=1, random_state=42, max_iter=10)
    lda.fit(X)

    # Extract top keywords as job roles
    job_roles = []
    for topic_idx, topic in enumerate(lda.components_):
        topic_words = [vectorizer.get_feature_names_out()[i] for i in topic.argsort()[:-6:-1]]  # Top 5 words
        job_roles.append(", ".join(topic_words))

    # Return job roles
    return {"job_roles": job_roles if job_roles else ["No job roles detected"]}