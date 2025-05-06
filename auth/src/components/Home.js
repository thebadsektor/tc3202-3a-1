import { auth } from "../firebase"; // Import Firebase authentication module
import { signOut } from "firebase/auth"; // Import Firebase sign-out function
import { useNavigate } from "react-router-dom"; // Import React Router navigation hook
import { useAuthState } from "react-firebase-hooks/auth"; // Import hook to manage user authentication state
import { useState } from "react"; // Import useState hook for local state management
import { useDropzone } from "react-dropzone"; // Import dropzone hook for drag-and-drop file upload
import axios from "axios"; // Import axios for HTTP requests
import * as pdfjsLib from "pdfjs-dist/webpack"; // Import pdf.js library for extracting text from PDFs
import "pdfjs-dist/build/pdf.worker"; // Import the PDF worker file
import "../styles/Home.css"; // Import component-specific CSS

const API_URL = "http://127.0.0.1:8000"; // Set the API URL for backend endpoints

// Set the worker script URL for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Define the main Home component
const Home = () => {
  const [user] = useAuthState(auth); // Get current authenticated user
  const navigate = useNavigate(); // Hook for navigation
  const [files, setFiles] = useState([]); // State for uploaded files
  const [analysisResult, setAnalysisResult] = useState(null); // State for AI analysis result
  const [topicModelingResult, setTopicModelingResult] = useState(null); // State for topic modeling (job roles) result
  const [resumeText, setResumeText] = useState(""); // State for extracted text from resume
  const [loading, setLoading] = useState(false); // State to show loading status

  // Function to log out user
  const handleLogout = async () => {
    await signOut(auth); // Sign out using Firebase
    navigate("/login"); // Navigate back to login page
  };

  // Function to handle file drop event
  const onDrop = (acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter((file) => file.type === "application/pdf"); // Filter for PDF files only
    setFiles(pdfFiles); // Set the selected files in state
  };

  // Clear all uploaded and processed data
  const handleClearFiles = () => {
    setFiles([]); // Clear uploaded files
    setAnalysisResult(null); // Clear analysis result
    setTopicModelingResult(null); // Clear topic modeling result
    setResumeText(""); // Clear extracted text
  };

  // Function to extract text from uploaded PDF
  const extractTextFromPDF = async () => {
    if (files.length === 0) return; // Exit if no files uploaded
    const file = files[0]; // Take the first uploaded file
    const reader = new FileReader(); // Create file reader
    reader.readAsArrayBuffer(file); // Read file as array buffer
    reader.onload = async () => {
      const loadingTask = pdfjsLib.getDocument({ data: reader.result }); // Load PDF using pdf.js
      const pdf = await loadingTask.promise; // Await PDF load completion
      let text = ""; // Initialize text container
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i); // Get each page
        const textContent = await page.getTextContent(); // Get text content from page
        text += textContent.items.map((item) => item.str).join(" ") + " "; // Append all text items from the page
      }
      setResumeText(text); // Save extracted text to state
    };
  };

  // Send extracted resume text to backend for AI analysis
  const analyzeResume = async () => {
    if (!resumeText) return; // Exit if no text to analyze
    setAnalysisResult(null); // Clear previous result
    setLoading(true); // Set loading state
  
    try {
      const response = await axios.post(`${API_URL}/analyze-resume/`, { resumeText }); // Send POST request to backend

      // Extract structured content from Gemini API response
      const aiResponse = response.data; // Get response data
      if (aiResponse && aiResponse.candidates) {
        const analysisText = aiResponse.candidates[0].content.parts[0].text; // Get analysis text from response
        setAnalysisResult(analysisText); // Save analysis result
      } else {
        setAnalysisResult("Analysis failed. Unexpected API response format."); // Handle unexpected response format
      }
    } catch (error) {
      console.error("Error analyzing resume:", error.response?.data || error.message); // Log error
      setAnalysisResult("Failed to analyze resume. Please try again."); // Show error to user
    }

    setLoading(false); // Stop loading indicator
  };

  // Send resume text for topic modeling (job role extraction)
  const analyzeTopics = async () => {
    if (!resumeText) return; // Exit if no text
    setTopicModelingResult(null); // Clear previous topics
    setLoading(true); // Start loading
  
    try {
      const response = await axios.post(`${API_URL}/analyze-topics/`, { resumeText }); // POST request to analyze topics
  
      if (response.data && response.data.job_roles) {
        setTopicModelingResult(response.data.job_roles); // Save extracted job roles
      } else {
        setTopicModelingResult(["Failed to analyze topics. Unexpected response format."]); // Handle invalid response
      }
    } catch (error) {
      console.error("Error analyzing topics:", error.response?.data || error.message); // Log error
      setTopicModelingResult(["Failed to analyze job roles. Please try again."]); // Show error to user
    }

    setLoading(false); // Stop loading
  };
  // Get dropzone props for drag-and-drop
  const { getRootProps, getInputProps } = useDropzone({
    onDrop, // Use the onDrop function defined above
    accept: { "application/pdf": [".pdf"] }, // Accept only PDF files
  });

  // Return the JSX structure for the component
  return (
    <div className="home-container">
      {/* Header section with title and logout button */}
      <header className="header">
        <h1>Resume Analyzer</h1>
        <button onClick={handleLogout} className="btn logout-btn">Logout</button>
      </header>

      {/* Welcome message and file upload section */}
      <div className="card">
        <h2>Welcome, {user ? user.email : "Guest"}!</h2>
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          <p>Drag & drop a PDF here, or click to upload</p>
        </div>
      </div>

      {/* Display uploaded file with action buttons */}
      {files.length > 0 && (
        <div className="card">
          <h3>Uploaded File:</h3>
          <ul>{files.map((file, index) => (<li key={index}>{file.name}</li>))}</ul>
          <div className="btn-group">
            <button onClick={handleClearFiles} className="btn clear-btn">Clear</button>
            <button onClick={extractTextFromPDF} className="btn process-btn">Extract Text</button>
          </div>
        </div>
      )}

      {/* Show analyze buttons if text is extracted and not loading */}
      {resumeText && !loading && (
        <>
          <button onClick={analyzeResume} className="btn analyze-btn">Analyze Resume</button>
          <button onClick={analyzeTopics} className="btn analyze-btn">Analyze Topics</button>
        </>
      )}

      {/* Loading message while analyzing */}
      {loading && (
  <div className="loader-container">
    <div className="loader-spinner"></div>
    <p>Analyzing your resume... Please wait.</p>
  </div>
)}


      {/* Show analysis result if available */}
      {analysisResult && (
        <div className="card analysis-result">
          <h3>Resume Analysis:</h3>
          <pre>{analysisResult}</pre>
        </div>
      )}

      {/* Show topic modeling result if available */}
      {topicModelingResult && (
        <div className="card topic-result">
          <h3>Extracted Topics(Identified job roles):</h3>
          <ul>{topicModelingResult.map((topic, index) => (<li key={index}>{topic}</li>))}</ul>
        </div>
      )}
    </div>
  );
};

// Export the Home component for use in other files
export default Home;
