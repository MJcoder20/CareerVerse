
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register({
        full_name: fullName,
        email,
        password,
      });

      setSuccess(true);
    } catch (err) {
      if (axios.isAxiosError<{ detail?: string }>(err)) {
        const detail = err.response?.data?.detail;

        if (err.response?.status === 503) {
          setError(
            "Your account may have been created, but the verification email could not be sent. Please try requesting a new email from the login page."
          );
        } else {
          setError(detail || "Registration failed. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <Link to="/" className="brand">
            CareerVerse<span>.</span>
          </Link>

          <h1>Check your inbox!</h1>
          <p className="subtitle">
            Your account has been created. We sent a verification link to:
          </p>

          <p><strong>{email}</strong></p>

          <p className="success-message">
            Open the email and click the verification link to activate your
            CareerVerse account.
          </p>

          <p className="subtitle">
            The verification link expires after 24 hours. Check your spam
            folder if you cannot find the email.
          </p>

          <Link to="/login" className="auth-footer">
            Go to sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="brand">
          CareerVerse<span>.</span>
        </Link>

        <h1>Create your account</h1>
        <p className="subtitle">
          Start discovering and experiencing careers.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            required
          />

          <label htmlFor="email">Email address</label>
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
            placeholder="Create a password"
            minLength={8}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
