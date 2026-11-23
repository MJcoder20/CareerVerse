
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { simulationService } from "../services/simulation";
import type { SimulationResponse } from "../types/simulation";
import {Sparkles, Trophy, Zap} from "lucide-react";



const ACHIEVEMENT_DETAILS: Record<
  string,
  { title: string; description: string; xp_reward: number }
> = {
  first_simulation: {
    title: "First Steps",
    description: "Complete your first career simulation.",
    xp_reward: 50,
  },
  career_explorer_3: {
    title: "Career Explorer",
    description: "Complete 3 career simulations.",
    xp_reward: 100,
  },
  rising_professional_5: {
    title: "Rising Professional",
    description: "Complete 5 career simulations.",
    xp_reward: 150,
  },
  high_performer_27: {
    title: "High Performer",
    description: "Score at least 27 points in a simulation.",
    xp_reward: 75,
  },
};


export default function Simulation() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const [simulation, setSimulation] =
    useState<SimulationResponse | null>(null);

  const [levelUp, setLevelUp] = useState<{
    previous_level: number;
    new_level: number;
    xp_earned: number;
  } | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [achievementQueueTotal, setAchievementQueueTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  const currentAchievement =
    unlockedAchievements.length > 0
      ? ACHIEVEMENT_DETAILS[unlockedAchievements[0]]
      : null;

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

      setUnlockedAchievements(
        result.newly_unlocked_achievements ?? []
      );
      setAchievementQueueTotal(
        result.newly_unlocked_achievements?.length ?? 0
      );

      if (result.level_up) {
        setLevelUp(result.level_up);
      }
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
                width: `${simulation.progress}%`,
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

    {levelUp && (
      <div className="level-up-overlay">
        <div className="level-up-confetti" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, index) => (
            <span key={index} className="confetti-piece" />
          ))}
        </div>
        <div className="level-up-modal">
          <div className="level-up-icon">
            <Trophy size={42} />
            <Sparkles className="level-up-sparkle" size={24} />
          </div>

          <p className="level-up-eyebrow">CAREERVERSE ACHIEVEMENT</p>

          <h2>Level Up!</h2>

          <p className="level-up-message">
            Amazing work! Your dedication is paying off.
          </p>

          <div className="level-up-level">
            <span>LEVEL</span>
            <strong>{levelUp.new_level}</strong>
          </div>

          <p className="level-up-xp">
            <Zap size={18} />
            +{levelUp.xp_earned} XP earned
          </p>

          <button
            className="simulation-primary-button"
            onClick={() => {
              setLevelUp(null);
              setUnlockedAchievements([]);
              navigate("/dashboard");
            }}
          >
            Continue to Dashboard
          </button>

          <button
            className="level-up-dismiss"
            onClick={() => setLevelUp(null)}
          >
            Continue Simulation
          </button>
        </div>
      </div>
    )}

    {!levelUp && currentAchievement && (
      <div className="level-up-overlay">
        <div className="level-up-confetti" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, index) => (
            <span key={index} className="confetti-piece" />
          ))}
        </div>

        <div className="level-up-modal achievement-celebration-modal">
          <div className="level-up-icon">
            <Trophy size={42} />
            <Sparkles className="level-up-sparkle" size={24} />
          </div>

          <p className="level-up-eyebrow">NEW ACHIEVEMENT UNLOCKED</p>
          <p className="achievement-queue-count">
            Achievement {achievementQueueTotal - unlockedAchievements.length + 1} of {achievementQueueTotal}
          </p>
          <p className="achievement-queue-count">
            Achievement {unlockedAchievements.length > 0
              ? unlockedAchievements.length -
                (unlockedAchievements.length - 1)
              : 0} pending
          </p>
          <h2>{currentAchievement.title}</h2>

          <p className="level-up-message">
            {currentAchievement.description}
          </p>

          <p className="level-up-xp">
            <Zap size={18} />
            +{currentAchievement.xp_reward} XP earned
          </p>

          <button
            className="simulation-primary-button"
            onClick={() => {
              setUnlockedAchievements((previous) => previous.slice(1));
            }}
          >
            Continue Simulation
          </button>

          <button
            className="level-up-dismiss"
            onClick={() => {
              setUnlockedAchievements([]);
              navigate("/achievements");
            }}
          >
            View All Achievements
          </button>
        </div>
      </div>
    )}

    </main>
    );
}
