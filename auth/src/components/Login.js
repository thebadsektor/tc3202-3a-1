import { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Import CSS file

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      setError(formatFirebaseError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/home");
    } catch (err) {
      setError(formatFirebaseError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent to your email!");
      setError(""); // Clear error if successful
    } catch (err) {
      setError(formatFirebaseError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const formatFirebaseError = (message) => {
    if (message.includes("auth/user-not-found")) return "No account found with this email.";
    if (message.includes("auth/wrong-password")) return "Incorrect password. Try again.";
    if (message.includes("auth/invalid-email")) return "Invalid email format.";
    return "Failed to log in. Please try again.";
  };

  return (
    <div className="login-wrapper">
    <div className="login-welcome">
    <h1>
      Welcome to<br />
      <span>Resume Analyzer</span>
    </h1>
    <p>Let's make your resume so good, HR will say, "Whoa!"</p>
    <p><strong>Log in now</strong> to finally stop your resume from scaring recruiters.</p>
  </div>

    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="input-field"
          />
          <button type="submit" disabled={loading} className="btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <button onClick={handleGoogleLogin} disabled={loading} className="btn google-btn">
          {loading ? "Processing..." : "Login with Google"}
        </button>
        <button onClick={handleForgotPassword} disabled={loading} className="btn secondary-btn">
          Forgot Password?
        </button>
        <p>Don't have an account?</p>
        <button onClick={() => navigate("/signup")} disabled={loading} className="btn secondary-btn">
          Go to Signup
        </button>
      </div>
    </div>
    </div>
  );
};

export default Login;
