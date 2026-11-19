
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { simulationService } from "../services/simulation";
import type { SimulationHistoryItem } from "../types/simulationHistory";
import {
  Compass,
  BriefcaseBusiness,
  History,
  Trophy,
  Target,
  TrendingUp,
  ArrowRight,
  LogOut,
} from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState<SimulationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    simulationService
      .getHistory()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const completed = history.filter(
    (item) => item.status === "completed"
  );

  const averageScore = completed.length
    ? Math.round(
        completed.reduce((sum, item) => sum + item.score, 0) /
          completed.length
      )
    : 0;

  const recentActivity = [...history].slice(0, 3);

  return (
    <main className="dashboard">
      <nav className="dashboard-nav">
        <h2>CareerVerse</h2>
        <button onClick={logout}>
          <LogOut size={16} /> Sign Out
        </button>
      </nav>

      <section className="dashboard-content">
        <p className="eyebrow">YOUR CAREER JOURNEY STARTS HERE</p>

        <h1>Welcome, {user?.full_name}!</h1>

        <p>
          Experience your future before choosing it.
          Discover careers, explore professional challenges,
          and find the path that fits your ambitions.
        </p>

        <section className="dashboard-stats">
          <article className="dashboard-stat">
            <BriefcaseBusiness size={22} />
            <span>Simulations completed</span>
            <strong>{loading ? "..." : completed.length}</strong>
          </article>

          <article className="dashboard-stat">
            <Trophy size={22} />
            <span>Average score</span>
            <strong>{loading ? "..." : `${averageScore}%`}</strong>
          </article>

          <article className="dashboard-stat">
            <Target size={22} />
            <span>Total experiences</span>
            <strong>{loading ? "..." : history.length}</strong>
          </article>
        </section>

        <div className="dashboard-card">
          <h2><Compass size={21} /> Discover Your Career</h2>
          <p>
            Explore careers that match your interests, strengths,
            working preferences, and ambitions.
          </p>
          <button onClick={() => navigate("/discovery")}>
            Start Career Discovery <ArrowRight size={16} />
          </button>
        </div>

        <div className="dashboard-card">
          <h2><BriefcaseBusiness size={21} /> Experience a Career</h2>
          <p>
            Enter a realistic professional environment, solve challenges,
            and experience the decisions software engineers make every day.
          </p>
          <button onClick={() => navigate("/simulation")}>
            Start Software Engineering Simulation <ArrowRight size={16} />
          </button>
        </div>

        <div className="dashboard-card">
          <h2><History size={21} /> Your Simulation History</h2>
          <p>
            Review completed experiences and continue unfinished simulations.
          </p>
          <button onClick={() => navigate("/history")}>
            View History <ArrowRight size={16} />
          </button>
        </div>

        <section className="dashboard-recent">
          <h2><TrendingUp size={21} /> Recent Activity</h2>

          {loading ? (
            <p>Loading your activity...</p>
          ) : recentActivity.length === 0 ? (
            <p>
              Your journey is waiting! Complete your first simulation
              to see your progress here.
            </p>
          ) : (
            recentActivity.map((item) => (
              <article
                className="dashboard-activity"
                key={item.session_id}
              >
                <div>
                  <strong>{item.scenario}</strong>
                  <span>{item.career}</span>
                </div>

                <div className="dashboard-activity-score">
                  <strong>{item.score} pts</strong>
                  <span>
                    {item.status === "completed"
                      ? "Completed"
                      : "In progress"}
                  </span>
                </div>

                <button
                  onClick={() =>
                    navigate(
                      item.status === "completed"
                        ? `/assessment/${item.session_id}`
                        : `/simulation/${item.session_id}`
                    )
                  }
                >
                  <ArrowRight size={17} />
                </button>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}
