
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authService } from "../services/auth";
import axios from "axios";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        setMessage("The verification link is missing its token.");
        setLoading(false);
        return;
      }

      try {
        const response = await authService.verifyEmail(token);

        if (!cancelled) {
          setSuccess(true);
          setMessage(response.message || "Your email has been verified.");
        }
      } catch (err) {
        if (!cancelled) {
          if (axios.isAxiosError<{ detail?: string }>(err)) {
            setMessage(
              err.response?.data?.detail ||
                "This verification link is invalid or has expired."
            );
          } else {
            setMessage("Verification failed. Please try again.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="brand">
          CareerVerse<span>.</span>
        </Link>

        {loading ? (
          <>
            <h1>Verifying your email...</h1>
            <p className="subtitle">
              Please wait while we activate your account.
            </p>
          </>
        ) : (
          <>
            <h1>{success ? "Email verified!" : "Verification failed"}</h1>

            <p className={success ? "success-message" : "error-message"}>
              {message}
            </p>

            {success ? (
              <p className="auth-footer">
                Your account is ready. <Link to="/login">Sign in</Link>
              </p>
            ) : (
              <p className="auth-footer">
                You can request another verification email from the{" "}
                <Link to="/login">login page</Link>.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
