
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setVerificationRequired(false);
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      if (axios.isAxiosError<{ detail?: string }>(err)) {
        const detail = err.response?.data?.detail;

        if (
          err.response?.status === 403 &&
          detail?.toLowerCase().includes("verify")
        ) {
          setError(detail);
          setVerificationRequired(true);
        } else {
          setError(detail || "Invalid email or password.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const response = await authService.resendVerification(email);
      setSuccess(response.message);
    } catch (err) {
      if (axios.isAxiosError<{ detail?: string }>(err)) {
        setError(err.response?.data?.detail || "Could not send the email.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p>Continue exploring your future with CareerVerse.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <p className="success-message">{success}</p>}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {verificationRequired && (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending || !email}
          >
            {resending ? "Sending..." : "Resend verification email"}
          </button>
        )}

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}
