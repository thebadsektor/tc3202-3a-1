import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist/webpack";
import "pdfjs-dist/build/pdf.worker";
import "../styles/Home.css";

const API_URL = "http://127.0.0.1:8000/analyze-resume/";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const Home = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const onDrop = (acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter((file) => file.type === "application/pdf");
    setFiles(pdfFiles);
  };

  const handleClearFiles = () => {
    setFiles([]);
    setAnalysisResult(null);
    setResumeText("");
  };

  const extractTextFromPDF = async () => {
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const loadingTask = pdfjsLib.getDocument({ data: reader.result });
      const pdf = await loadingTask.promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map((item) => item.str).join(" ") + " ";
      }
      setResumeText(text);
    };
  };

  const analyzeResume = async () => {
    if (!resumeText) return;
    setLoading(true);
    try {
      const response = await axios.post(
        API_URL,
        JSON.stringify({ resumeText }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const candidates = response.data.candidates;
      if (candidates && candidates.length > 0) {
        setAnalysisResult(candidates[0].content.parts[0].text);
      } else {
        setAnalysisResult(" No analysis result.");
      }
    } catch (error) {
      console.error("Error analyzing resume:", error.response?.data || error.message);
      setAnalysisResult(" Failed to analyze resume. Please try again.");
    }
    setLoading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  return (
    <div className="home-container">
      <header className="header">
        <h1>Resume Analyzer</h1>
        <button onClick={handleLogout} className="btn logout-btn">Logout</button>
      </header>

      <div className="card">
        <h2>Welcome, {user ? user.email : "Guest"}!</h2>
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          <p> Drag & drop a PDF here, or click to upload</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="card">
          <h3>Uploaded File:</h3>
          <ul>{files.map((file, index) => (<li key={index}> {file.name}</li>))}</ul>
          <div className="btn-group">
            <button onClick={handleClearFiles} className="btn clear-btn">Clear</button>
            <button onClick={extractTextFromPDF} className="btn process-btn">Extract Text</button>
          </div>
        </div>
      )}

      {resumeText && !loading && (
        <button onClick={analyzeResume} className="btn analyze-btn">Analyze Resume</button>
      )}

      {loading && <p> Analyzing resume... Please wait.</p>}

      {analysisResult && !loading && (
  <div className="card analysis-result">
    <h3>Resume Analysis:</h3>
    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{analysisResult}</pre>
  </div>
)}

    </div>
  );
};

export default Home;
