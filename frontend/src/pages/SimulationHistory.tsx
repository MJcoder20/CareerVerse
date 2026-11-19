import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { simulationService } from "../services/simulation";
import type { SimulationHistoryItem } from "../types/simulationHistory";

export default function SimulationHistory() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<SimulationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    simulationService.getHistory()
      .then(setSessions)
      .catch(() => setError("Unable to load simulation history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="simulation-page">
      <nav className="simulation-nav">
        <h2>CareerVerse</h2>
        <button onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>
      </nav>

      <section className="history-container">
        <p className="eyebrow">YOUR CAREER JOURNEY</p>
        <h1>Simulation History</h1>
        <p className="history-description">
          Review your previous experiences and continue unfinished simulations.
        </p>

        {loading && <p>Loading your history...</p>}
        {error && <p className="simulation-error">{error}</p>}

        {!loading && !error && sessions.length === 0 && (
          <div className="history-empty">
            <h2>No simulations yet</h2>
            <p>Start your first career simulation to see your progress here.</p>
            <button
              className="simulation-primary-button"
              onClick={() => navigate("/simulation")}
            >
              Explore Simulation
            </button>
          </div>
        )}

        <div className="history-list">
          {sessions.map((session) => (
            <article className="history-card" key={session.session_id}>
              <div className="history-card-header">
                <div>
                  <span className="history-career">{session.career}</span>
                  <h2>{session.scenario}</h2>
                  <p>
                    Started:{" "}
                    {new Date(session.created_at).toLocaleString()}
                  </p>
                </div>

                <span className={`history-status ${session.status}`}>
                  {session.status === "completed"
                    ? "Completed"
                    : "In Progress"}
                </span>
              </div>

              <div className="history-card-footer">
                <div>
                  <span>Score</span>
                  <strong>{session.score} points</strong>
                </div>

                <button
                  className="simulation-primary-button"
                  onClick={() =>
                    navigate(`/simulation/${session.session_id}`)
                  }
                >
                  {session.status === "completed"
                    ? "View Summary"
                    : "Resume Simulation"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}