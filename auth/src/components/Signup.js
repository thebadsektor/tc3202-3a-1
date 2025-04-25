import { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css"; // Import CSS file

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      setError(formatFirebaseError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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

  const formatFirebaseError = (message) => {
    if (message.includes("auth/email-already-in-use")) return "Email is already in use.";
    if (message.includes("auth/invalid-email")) return "Invalid email address.";
    if (message.includes("auth/weak-password")) return "Password must be at least 6 characters.";
    return "Failed to sign up. Please try again.";
  };

  return (
    <div className="signup-container">
      <div  className="welcome-text">
        <h1>
          <span className="welcome-small">Welcome to</span><br />
          <span className="welcome-big">Resume Analyzer</span>
        </h1>
        <h2>"Let's make your resume so good, HR will say, "Whoa"."<br /></h2>
        <h3>
          <span className="highlight">Sign up now</span> to let AI judge your resume before HR does.
        </h3>
      </div>

      <div className="signup-box">
        
        <h4>Sign Up</h4>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSignup}>

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

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="input-field"
          />

          <div className="show-pass">
            <label><input  type="checkbox" onChange={(e) => setShowPassword(e.target.checked)}/> Show Password</label>
          </div>

          <button type="submit" disabled={loading} className="signup-btn">
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <div class="divider">
            <span>or</span>
          </div>

          <button onClick={handleGoogleSignup} disabled={loading} className="google-btn">
            {loading ? "Processing..." : "Sign Up with Google"}
          </button>
        
          <div className="login">
            <p2>Already have an account?
            <button onClick={() => navigate("/login")} disabled={loading} className="as-link login">Go to Login</button>
            </p2>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Signup;
