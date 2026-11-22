
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target,
  Zap,
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  Compass,
  History,
  Trophy,
  LogOut,
  Menu,
  X,
  CheckCircle,
  Pencil,
  Save,
  BriefcaseBusiness,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  getCareerGoal,
  createCareerGoal,
  updateCareerGoal,
  type CareerGoal,
  type CareerGoalInput,
} from "../services/goals";

export default function CareerGoals() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [goal, setGoal] = useState<CareerGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CareerGoalInput>({
    career_role: "",
    target_simulations: 5,
    target_xp: 1000,
  });

  useEffect(() => {
    getCareerGoal()
      .then((data) => {
        setGoal(data);

        if (data) {
          setForm({
            career_role: data.career_role,
            target_simulations: data.target_simulations,
            target_xp: data.target_xp,
          });
        } else {
          setEditing(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load your career goal.");
      })
      .finally(() => setLoading(false));
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  const navigateFromSidebar = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const savedGoal = goal
        ? await updateCareerGoal(form)
        : await createCareerGoal(form);

      setGoal(savedGoal);

      // Refresh progress data after saving the goal.
      const refreshedGoal = await getCareerGoal();
      setGoal(refreshedGoal);

      setEditing(false);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Unable to save your career goal."
      );
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.full_name || "User")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="cv-dashboard">
      {sidebarOpen && (
        <button
          className="cv-sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close navigation"
        />
      )}

      <aside className={`cv-sidebar ${sidebarOpen ? "cv-sidebar-open" : ""}`}>
        <div className="cv-brand">
          <div className="cv-brand-icon">
            <Sparkles size={21} />
          </div>
          <span>Career<span>Verse</span></span>
          <button
            className="cv-mobile-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="cv-sidebar-label">WORKSPACE</div>

        <nav className="cv-side-nav">
          <button className="cv-nav-item" onClick={() => navigateFromSidebar("/dashboard")}>
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button className="cv-nav-item" onClick={() => navigateFromSidebar("/discovery")}>
            <Compass size={19} />
            <span>Career discovery</span>
          </button>

          <button className="cv-nav-item" onClick={() => navigateFromSidebar("/history")}>
            <History size={19} />
            <span>My simulations</span>
          </button>

          <button className="cv-nav-item" onClick={() => navigateFromSidebar("/achievements")}>
            <Trophy size={19} />
            <span>Achievements</span>
          </button>

          <button className="cv-nav-item active">
            <Target size={19} />
            <span>Career Goals</span>
          </button>
        </nav>

        <div className="cv-sidebar-label cv-sidebar-label-spaced">
          YOUR GROWTH
        </div>

        <div className="cv-sidebar-tip">
          <div className="cv-tip-icon">
            <Zap size={17} />
          </div>
          <h4>Keep moving forward</h4>
          <p>Every experience brings you closer to your future career.</p>
          <button onClick={() => navigateFromSidebar("/discovery")}>
            Explore careers <ArrowRight size={14} />
          </button>
        </div>

        <div className="cv-sidebar-bottom">
          <div className="cv-user-mini">
            <div className="cv-avatar">{initials}</div>
            <div className="cv-user-info">
              <strong>{user?.full_name || "Career Explorer"}</strong>
              <span>Career Explorer</span>
            </div>
            <button className="cv-logout" onClick={handleLogout} title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="cv-main">
        <header className="cv-topbar">
          <button
            className="cv-mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="cv-breadcrumb">
            Workspace <span>/</span> <strong>Career Goals</strong>
          </div>

          <div className="cv-topbar-right">
            <span className="cv-topbar-date">Your future, your direction</span>
            <div className="cv-avatar cv-top-avatar">{initials}</div>
          </div>
        </header>

        <div className="cv-content">
          <section className="cv-section">
            <div className="cv-section-heading">
              <div>
                <span className="cv-section-kicker">PLAN YOUR FUTURE</span>
                <h2>Career Goals</h2>
                <p>Set a destination and track your progress as you grow.</p>
              </div>
            </div>

            {loading ? (
              <p className="cv-empty-text">Loading your career goal...</p>
            ) : (
              <>
                {error && <p className="cv-error-message">{error}</p>}

                {editing ? (
                  <section className="cv-panel">
                    <div className="cv-panel-heading">
                      <div>
                        <span className="cv-section-kicker">
                          {goal ? "UPDATE YOUR TARGET" : "GET STARTED"}
                        </span>
                        <h3>{goal ? "Edit career goal" : "Create your career goal"}</h3>
                      </div>
                      <div className="cv-panel-icon">
                        <Target size={20} />
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="career-goal-form">
                      <label htmlFor="career_role">Target career role</label>
                      <input
                        id="career_role"
                        type="text"
                        value={form.career_role}
                        onChange={(event) =>
                          setForm({ ...form, career_role: event.target.value })
                        }
                        placeholder="e.g. AI Engineer"
                        minLength={2}
                        maxLength={150}
                        required
                      />

                      <label htmlFor="target_simulations">
                        Target completed simulations
                      </label>
                      <input
                        id="target_simulations"
                        type="number"
                        min={1}
                        max={100}
                        value={form.target_simulations}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            target_simulations: Number(event.target.value),
                          })
                        }
                        required
                      />

                      <label htmlFor="target_xp">Target XP</label>
                      <input
                        id="target_xp"
                        type="number"
                        min={100}
                        max={100000}
                        step={100}
                        value={form.target_xp}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            target_xp: Number(event.target.value),
                          })
                        }
                        required
                      />

                      <div className="career-goal-form-actions">
                        {goal && (
                          <button
                            type="button"
                            className="cv-outline-button"
                            onClick={() => setEditing(false)}
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          type="submit"
                          className="cv-primary-button"
                          disabled={saving}
                        >
                          <Save size={16} />
                          {saving ? "Saving..." : "Save career goal"}
                        </button>
                      </div>
                    </form>
                  </section>
                ) : goal ? (
                  <>
                    <section className="cv-panel career-goal-overview">
                      <div className="cv-panel-heading">
                        <div>
                          <span className="cv-section-kicker">YOUR TARGET ROLE</span>
                          <h3>{goal.career_role}</h3>
                        </div>

                        <button
                          className="cv-outline-button"
                          onClick={() => setEditing(true)}
                        >
                          <Pencil size={15} /> Edit goal
                        </button>
                      </div>

                      <div className="career-goal-progress-grid">
                        <div className="career-goal-progress-card">
                          <div className="career-goal-progress-icon">
                            <BriefcaseBusiness size={21} />
                          </div>
                          <span>Completed simulations</span>
                          <strong>
                            {goal.completed_simulations} / {goal.target_simulations}
                          </strong>
                          <div className="cv-progress-track">
                            <div
                              className="cv-progress-fill"
                              style={{ width: `${goal.simulation_progress}%` }}
                            />
                          </div>
                          <small>{goal.simulation_progress}% completed</small>
                        </div>

                        <div className="career-goal-progress-card">
                          <div className="career-goal-progress-icon">
                            <Zap size={21} />
                          </div>
                          <span>Experience points</span>
                          <strong>
                            {goal.current_xp} / {goal.target_xp} XP
                          </strong>
                          <div className="cv-progress-track">
                            <div
                              className="cv-progress-fill"
                              style={{ width: `${goal.xp_progress}%` }}
                            />
                          </div>
                          <small>{goal.xp_progress}% completed</small>
                        </div>
                      </div>

                      <div className="career-goal-status">
                        {goal.is_completed ? (
                          <>
                            <CheckCircle size={19} />
                            <span>Congratulations! You've achieved your career goal.</span>
                          </>
                        ) : (
                          <>
                            <Target size={19} />
                            <span>Keep going. Every completed simulation brings you closer.</span>
                          </>
                        )}
                      </div>
                    </section>
                  </>
                ) : null}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
