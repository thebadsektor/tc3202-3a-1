import { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css"; // Import CSS file

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
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
      <div className="signup-box">
        <h2>Sign Up</h2>
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
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="input-field"
          />
          <button type="submit" disabled={loading} className="btn">
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <button onClick={handleGoogleSignup} disabled={loading} className="btn google-btn">
          {loading ? "Processing..." : "Sign Up with Google"}
        </button>
        <p>Already have an account?</p>
        <button onClick={() => navigate("/login")} disabled={loading} className="btn secondary-btn">
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default Signup;
