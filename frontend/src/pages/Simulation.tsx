
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { simulationService } from "../services/simulation";
import type { SimulationResponse } from "../types/simulation";

export default function Simulation() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const [simulation, setSimulation] =
    useState<SimulationResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  useEffect(() => {
    if (!sessionId) return;

    setLoading(true);

    simulationService
      .getSession(Number(sessionId))
      .then(setSimulation)
      .catch(() => setError("Unable to load this simulation session."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  async function startSimulation() {
    try {
      setLoading(true);
      setError("");

      const result = await simulationService.start();
      navigate(`/simulation/${result.session_id}`);
    } catch {
      setError("Unable to start the simulation.");
    } finally {
      setLoading(false);
    }
  }

  async function submitDecision() {
    if (!simulation || !selectedOption) return;

    try {
      setLoading(true);
      setError("");

      const result = await simulationService.submitDecision(
        simulation.session_id,
        selectedOption
      );

      setSimulation(result);
      setSelectedOption("");
    } catch {
      setError("Unable to submit your decision.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="simulation-page">
      <nav className="simulation-nav">
        <h2>CareerVerse</h2>
        <button onClick={() => navigate("/history")}>
          Simulation History
        </button>
      </nav>

      {loading && !simulation && (
        <p className="simulation-loading">Loading...</p>
      )}

      {!sessionId && !simulation && (
        <section className="simulation-intro">
          <p className="eyebrow">CAREER SIMULATION</p>
          <h1>The NexaTech Login Outage</h1>
          <p>
            Step into the role of a junior software engineer.
            Investigate a production incident and make professional decisions.
          </p>
          <button
            className="simulation-primary-button"
            onClick={startSimulation}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Simulation"}
          </button>
        </section>
      )}

      {simulation && (
        <section className="simulation-workspace">
          <div className="simulation-top">
            <div>
              <p className="eyebrow">{simulation.career}</p>
              <h1>{simulation.scenario}</h1>
            </div>

            <div className="simulation-score">
              <span>YOUR SCORE</span>
              <strong>{simulation.score}</strong>
            </div>
          </div>

          <div className="simulation-progress">
            <div
              style={{
                width: `${
                  simulation.status === "completed"
                    ? 100
                    : simulation.current_step * 50
                }%`,
              }}
            />
          </div>

          <div className="simulation-step">
            <span>STAGE {simulation.current_step}</span>
            <h2>{simulation.title}</h2>
            <p>{simulation.message}</p>
          </div>

          {simulation.feedback && (
            <div className="simulation-feedback">
              <h3>Decision Feedback</h3>
              <p>{simulation.feedback}</p>
            </div>
          )}

          {simulation.status === "completed" ? (
            <div className="simulation-completed">
              <h2>Simulation completed!</h2>
              <p>
                Your final score is{" "}
                <strong>{simulation.score} points</strong>.
              </p>

              <button
                className="simulation-primary-button"
                onClick={() =>
                  navigate(`/assessment/${simulation.session_id}`)
                }
              >
                View Performance Assessment
              </button>

              <button
                className="simulation-secondary-button"
                onClick={() => navigate("/history")}
              >
                Back to History
              </button>
            </div>
          ) : (
            <div className="simulation-decisions">
              <h3>What would you do?</h3>

              {simulation.options.map((option) => (
                <button
                  key={option.id}
                  className={`simulation-option ${
                    selectedOption === option.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedOption(option.id)}
                  disabled={loading}
                >
                  {option.label}
                </button>
              ))}

              <button
                className="simulation-primary-button"
                onClick={submitDecision}
                disabled={!selectedOption || loading}
              >
                {loading ? "Submitting..." : "Submit Decision"}
              </button>
            </div>
          )}
        </section>
      )}

      {error && <p className="simulation-error">{error}</p>}
    </main>
  );
}
