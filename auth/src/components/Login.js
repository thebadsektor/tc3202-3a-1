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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="login-container">

      <div  className="welcome-text">
        <h1>
          <span className="welcome-small">Welcome to</span><br />
          <span className="welcome-big">Resume Analyzer</span>
        </h1>
        <h2>"Let's make your resume so good, HR will say, "Whoa"."<br /></h2>
        <h3>
          <span className="highlight">Login now</span> to finally stop your resume from scaring recruiters
        </h3>
      </div>

      <div className="login-box">

        <h4>Login</h4>
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
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="input-field"
          />

          <div className="show-forgot">
            <label><input  type="checkbox" onChange={(e) => setShowPassword(e.target.checked)}/> Show Password</label>
            <button type="button" onClick={handleForgotPassword} disabled={loading} className="as-link show-forgot">Forgot Password?</button>
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Logging in..." : "Login"}
          </button>

          <div class="divider">
            <span>or</span>
          </div>

          <button onClick={handleGoogleLogin} disabled={loading} className="google-btn">
            {loading ? "Processing..." : "Login with Google"}
          </button>

          <div className="signup">
            <p2>Don't have an account?
              <button type="button" onClick={() => navigate("/signup")} disabled={loading} className="as-link signup">Sign up Now!</button>
            </p2>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;
