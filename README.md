# TC-3202 Resume Analyzer

![Project Banner](https://via.placeholder.com/1200x400.png?text=Project+Banner+Placeholder)

## Table of Contents
- [Introduction](#introduction)
- [Project Overview](#project-overview)
- [Objectives](#objectives)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Usage Instructions](#usage-instructions)
- [Project Structure](#project-structure)
- [Contributors](#contributors)
- [Chagelog](#changelog)
- [Acknowledgments](#acknowledgments)
- [License](#license)

---

## Introduction
The recruitment process today often involves reviewing a large number of resumes, a task that can be both time-consuming and tedious for hiring teams. As the volume of applications for each job opening continues to grow, manually screening resumes can lead to errors, delays, and missed opportunities. This highlights the need for a faster and more efficient way to evaluate resumes and streamline the hiring process.

## Project Overview
Many companies today receive a large number of resumes when hiring for a job. Reviewing each one manually takes a lot of time and can lead to mistakes or biased decisions. Thus, there is a clear need for a faster and more efficient way to screen resume.

Resume Analyzer is a system developed by Computer Science students from Laguna University to assist HR teams bu automatically reading and analyzing resumes. Also to assist job seekers in improving their resumes and help recruiters screen applications more efficiently. The system leverages Natural Language Processing (NLP), Large Language Models (LLM), Latent Dirichlet Allocation (LDA) Unsupervised Machine Leaning for the Topic Modeling, and Artificial Intelligence (AI) to analyze and assess resume details.

## Objectives
The main objective of the Resume Analyzer is to enhances the recruitment process by automating resume screening, detecting missing information, offering structured feedback, and providing analytical insights to both recruiters and job seekers.

1. To extract and structure resume data, standardizing different formats using LLM-powered techniques.
2. To detect and highlights missing or incomplete information in resumes, providing users with actionable feedback.
3. To analyze resume context through skill gap assessments, keyword matching, and topic modeling.
4. To provide recruiters with insightful analytics and data visualizations that support objective, data driven hiring decisions.
5. To reduce bias in the screening process by standardizing resume evaluation criteria.

## Features
The main features of the project:
1. User Authentication - Users can log in and log out securely using Firebase.
2. Resume Upload - Users can upload PDF resumes through a drag-and-drop interface.
3. Text Extraction - Extracts text from uploaded resumes using pdfjs on the frontend.
4. Resume Analysis (AI-Powered) - Sends resume text to Gemini API to analyze strenghts, weaknesses, and improvement suggestions.
5. Job Role Detection (Topic Modeling) - Uses machine learning (LDA) to extract job roles or dominant topics from the resume.

## Technologies Used
Frontend:
JavaScript (React.js) - Core logic and UI rendering.
CSS - Custom styling for components and layout.
React Dropzone - For file upload (drag-and-drop feature).
pdfjs-dist - To extract text from PDF resumes directly in the browser.
Firebase Authentication - To handle user login and logout.
Axios - To make HTTP request to the backend.

Backend:
Python (FastAPI) - Handle API endpoints and backend logic.
NLTK - For natural language processing of resume text.
Scikit-learn - For topic modeling using TF-IDF and LDA.
Google Gemini API - For AI-powered resume analysis and suggestions.

Tools and Libraries:
axios - For making API calls from React to FastAPI.
CORS Middleware - To allow frontend-backend communications.
pydantic - For request validation in FastAPI.

## Setup and Installation
Step-by-step instructions for setting up the project locally.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo-url.git
   ```
2. **Install dependencies:**
	- If using `npm`:
   ```bash
   git clone https://github.com/your-repo-url.git
   ```
   - If using `pip` (for Python projects):
   ```bash
   git clone https://github.com/your-repo-url.git
   ```
3. **Configure environment variables (if any)**: Provide instructions for setting up .env files or any other required configurations.
   ```bash
   git clone https://github.com/your-repo-url.git
   ```
4. **Run the project:**
   - For web projects:
   ```powershell
   cd auth
   npm start
   ```
   - For backend services:
   ```powershell
   cd backend
   uvicorn main:app --reload
   ```

**Note:** If your project has external depencies like XAMPP, MySQL, special SDK, or other environemnt setup, create another section for it.

## Usage Instructions
Provide detailed instructions on how to use the project after setup:
Login
- Navigate to http://localhost:3000
- Login with your Firebase email/password
Upload Resume
- Drag & drop your PDF into the dropzone
- Alternatively, click to select and upload
Extract Text
- Click "Extract Text" to extract content from your PDF
Analyze Resume
- Click "Analyze Resume" to send resume text to Gemini API
- Results include personal details, skills, strengths, weaknesses, and improvement suggestions
Analyze Topics
- Click "Analyze Topics" to identify top job roles using topic modeling (LDA)
Clear Data
Click "Clear" to reset uploaded files and results
Logout
- Click "Logout" in the top-right corner

## Project Structure
Explain the structure of the project directory. Example:
```bash
.
├── 📂 src/
│   ├── 📂 components/
│   │   ├── Home.js
│   │   ├── Login.js
│   │   └── Signup.js
│   ├── 📂 styles/
│       ├── Home.css
│       ├── Login.css
│       └── Sugnup.css
├── 📂 backend/
│   ├── 📂 _pycache_
│   ├── 📂 venv
│   ├── .env
│   ├── main.py
├── 📂 node_modules/
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```

## Contributors

List all the team members involved in the project. Include their roles and responsibilities:

- **Hyroin Balili**: Lead Developer, Backend Developer
- **Lester Malazarte**: Documentation
- **Karl Angelo Neri**: Documentation
- **Andrei Dawinan**: Documentation, Frontend Developer
- **Gerald Villaran**: Course Instructor

## Project Timeline

Outline the project timeline, including milestones or deliverables. Example:

- **Week 1-2 (Feb 3)**: Concept Paper Proposal.
- **Week 3-5 (Feb 25)**: Consultation.
- **Week 6-10 (Mar 10)**: Plan user journey and refinement.
- **Week 7-8 (Mar 11)**: Refinement.
- **Week 13-14 (Mar 18)**: Repository preparation & Research.
      -Related Repository
- **Week 13-14**:
## Changelog

### [Version 1.0.0] - 2024-09-07
- Initial release of the project.
- Added basic functionality for [Feature 1], [Feature 2], and [Feature 3].

### [Version 1.1.0] - 2024-09-14
- Improved user interface for [Feature 1].
- Fixed bugs related to [Feature 2].
- Updated project documentation with setup instructions.

### [Version 1.2.0] - 2024-09-21
- Added new functionality for [Feature 4].
- Refactored codebase for better performance.
- Added unit tests for [Feature 3] and [Feature 4].


## Acknowledgments

Acknowledge any resources, mentors, or external tools that helped in completing the project.

Special Thanks to Instructor Gerald Villaran, Joville Avilla, Mary Grace Guillermo for inspiration and guidance throughout the development of this project.

This project was built and created by [GROUP 1 "The Resume Peeps"]. You can view the original repository [here](https://github.com/thebadsektor/tc3202-3a-1).

## License

This project is for educational purposes only.