import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  History,
  LogOut,
  Zap,
  Trophy,
  Target,
  BriefcaseBusiness,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Star,
  Clock3,
  TrendingUp,
  Menu,
  X,
  Award,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  simulationService,
  type UserProgress,
} from "../services/simulation";
import type { SimulationHistoryItem } from "../types/simulationHistory";



export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [history, setHistory] = useState<SimulationHistoryItem[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    simulationService
      .getHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setHistoryLoading(false));

    simulationService
      .getProgress()
      .then(setProgress)
      .catch(console.error)
      .finally(() => setProgressLoading(false));
  }, []);

  const completed = history.filter(
    (item) => item.status === "completed"
  );

  const averageScore =
    completed.length > 0
      ? Math.round(
          (completed.reduce(
            (sum, item) => sum + (item.score ?? 0),
            0
          ) /
            completed.length /
            30) *
            100
        )
      : 0;

  const recentActivity = history.slice(0, 4);

  const firstName = user?.full_name?.split(" ")[0] || "Explorer";
  const initials = user?.full_name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  const closeSidebar = () => setSidebarOpen(false);

  const navigateFromSidebar = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  function getAchievementIcon(key: string) {
    switch (key) {
      case "first_simulation":
        return <Star size={18} />;

      case "career_explorer_3":
        return <Target size={18} />;

      case "rising_professional_5":
        return <Zap size={18} />;

      case "high_performer_27":
        return <Trophy size={18} />;

      default:
        return <Award size={18} />;
    }
  }

  const unlockedAchievements =
    progress?.achievements.filter((achievement) => achievement.unlocked) ?? [];

  const latestAchievement = [...unlockedAchievements].sort(
    (a, b) =>
      new Date(b.unlocked_at ?? 0).getTime() -
      new Date(a.unlocked_at ?? 0).getTime()
  )[0];

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
          <button
            className="cv-nav-item active"
            onClick={() => navigateFromSidebar("/dashboard")}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className="cv-nav-item"
            onClick={() => navigateFromSidebar("/discovery")}
          >
            <Compass size={19} />
            <span>Career discovery</span>
            <ArrowUpRight size={15} className="cv-nav-arrow" />
          </button>

          <button
            className="cv-nav-item"
            onClick={() => navigateFromSidebar("/history")}
          >
            <History size={19} />
            <span>My simulations</span>
          </button>
          <button
            className="cv-nav-item"
            onClick={() => navigateFromSidebar("/achievements")}
          >
            <Trophy size={19} />
            <span>Achievements</span>
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
            <button
              className="cv-logout"
              onClick={handleLogout}
              title="Log out"
            >
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
            Workspace <span>/</span> <strong>Dashboard</strong>
          </div>

          <div className="cv-topbar-right">
            <span className="cv-topbar-date">Your career journey</span>
            <div className="cv-avatar cv-top-avatar">{initials}</div>
          </div>
        </header>

        <div className="cv-content">
          <section className="cv-welcome">
            <div>
              <div className="cv-eyebrow">
                <Sparkles size={14} /> YOUR PERSONAL CAREER SPACE
              </div>
              <h1>Welcome back, {firstName}<span>.</span></h1>
              <p>
                Your future is built one experience at a time.
                Here's how your journey is going.
              </p>
            </div>
            <button
              className="cv-outline-button"
              onClick={() => navigate("/history")}
            >
              View activity <ArrowUpRight size={16} />
            </button>
          </section>

          <section className="cv-hero">
            <div className="cv-hero-content">
              <div className="cv-hero-tag">
                <Sparkles size={14} /> YOUR NEXT CHAPTER
              </div>
              <h2>Experience your future<br />before choosing it.</h2>
              <p>
                Discover career paths, step into real-world scenarios,
                and build the skills that matter.
              </p>
              <div className="cv-hero-actions">
                <button
                  className="cv-primary-button"
                  onClick={() => navigate("/discovery")}
                >
                  Explore careers <ArrowRight size={17} />
                </button>
                <button
                  className="cv-hero-link"
                  onClick={() => navigate("/simulation")}
                >
                  Try the Software Engineer simulation <ArrowUpRight size={16} />
                </button>

              </div>
            </div>

            <div className="cv-hero-art" aria-hidden="true">
              <div className="cv-orbit cv-orbit-one" />
              <div className="cv-orbit cv-orbit-two" />
              <div className="cv-hero-glow" />
              <div className="cv-hero-symbol">
                <GraduationCap size={68} strokeWidth={1.2} />
              </div>
              <div className="cv-floating-card cv-floating-top">
                <div className="cv-floating-icon"><Zap size={16} /></div>
                <div><strong>Keep growing</strong><span>Unlock your potential</span></div>
              </div>
              <div className="cv-floating-card cv-floating-bottom">
                <div className="cv-floating-icon purple"><Trophy size={16} /></div>
                <div><strong>{progress?.total_xp ?? 0} XP earned</strong><span>Your progress matters</span></div>
              </div>
            </div>
          </section>

          <section className="cv-section">
            <div className="cv-section-heading">
              <div>
                <span className="cv-section-kicker">AT A GLANCE</span>
                <h3>Your progress</h3>
              </div>
              <span className="cv-muted-label">All-time overview</span>
            </div>

            <div className="cv-stats-grid">
              <article className="cv-stat-card">
                <div className="cv-stat-top">
                  <div className="cv-stat-icon violet"><Zap size={19} /></div>
                  <span className="cv-stat-caption">EXPERIENCE</span>
                </div>
                <strong>{progressLoading ? "—" : progress?.total_xp ?? 0}</strong>
                <span className="cv-stat-description">Total XP earned</span>
                <div className="cv-stat-bottom"><TrendingUp size={14} /> Keep building momentum</div>
              </article>

              <article className="cv-stat-card">
                <div className="cv-stat-top">
                  <div className="cv-stat-icon blue"><Target size={19} /></div>
                  <span className="cv-stat-caption">PRACTICE</span>
                </div>
                <strong>{historyLoading ? "—" : progress?.completed_simulations ?? completed.length}</strong>
                <span className="cv-stat-description">Completed simulations</span>
                <div className="cv-stat-bottom">Every attempt is progress</div>
              </article>

              <article className="cv-stat-card">
                <div className="cv-stat-top">
                  <div className="cv-stat-icon orange"><Star size={19} /></div>
                  <span className="cv-stat-caption">PERFORMANCE</span>
                </div>
                <strong>{historyLoading ? "—" : `${averageScore}%`}</strong>
                <span className="cv-stat-description">Average simulation score</span>
                <div className="cv-stat-bottom">Based on completed sessions</div>
              </article>

              <article className="cv-stat-card">
                <div className="cv-stat-top">
                  <div className="cv-stat-icon green"><Trophy size={19} /></div>
                  <span className="cv-stat-caption">ACHIEVEMENTS</span>
                </div>
                <strong>{progressLoading ? "—" : progress?.achievements.filter((achievement) => achievement.unlocked).length ?? 0}</strong>
                <span className="cv-stat-description">Milestones unlocked</span>
                <div className="cv-stat-bottom">Celebrate your wins</div>
              </article>
            </div>
          </section>

          <div className="cv-dashboard-grid">
            <section className="cv-panel cv-level-panel">
              <div className="cv-panel-heading">
                <div>
                  <span className="cv-section-kicker">LEVEL UP</span>
                  <h3>Your experience level</h3>
                </div>
                <div className="cv-level-badge">
                  <Zap size={15} /> Level {progress?.level ?? 1}
                </div>
              </div>

              <div className="cv-level-main">
                <div className="cv-level-number">{progress?.level ?? 1}</div>
                <div>
                  <strong>{progress?.total_xp ?? 0} XP</strong>
                  <p>Experience points collected</p>
                </div>
              </div>

              <div className="cv-progress-labels">
                <span>Level progress</span>
                <strong>{Math.round(progress?.level_progress ?? 0)}%</strong>
              </div>
              <div className="cv-level-milestones">
                <span>Level {progress?.level ?? 1}</span>
                <span>Level {(progress?.level ?? 1) + 1}</span>
              </div>
              <div className="cv-progress-track">
                <div
                  className="cv-progress-fill"
                  style={{ width: `${Math.min(100, progress?.level_progress ?? 0)}%` }}
                />
              </div>
              <div className="cv-progress-footer">
                <span>{progress?.xp_in_level ?? 0} XP earned this level</span>
                <span>{progress?.xp_to_next_level ?? 500} XP to next level</span>
              </div>
            </section>

            <section className="cv-panel cv-achievement-panel">
              <div className="cv-panel-heading">
                <div>
                  <span className="cv-section-kicker">YOUR MILESTONES</span>
                  <h3>Achievements</h3>
                </div>
                <div className="cv-panel-icon"><Trophy size={19} /></div>
              </div>

              {progressLoading ? (
                <p className="cv-empty-text">Loading achievements...</p>
              ) : unlockedAchievements.length > 0 ? (
                <div className="cv-achievement-list">
                  {unlockedAchievements.slice(0, 4).map((achievement) => (
                    <div className="cv-achievement-item" key={achievement.key}>
                      <div className="cv-achievement-icon">
                        {getAchievementIcon(achievement.key)}
                      </div>
                      <div className="cv-achievement-details">
                        <strong>{achievement.title}</strong>
                        <span>{achievement.description}</span>
                        <small>
                          Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                        </small>
                      </div>
                      <Star size={15} className="cv-achievement-star" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cv-empty-state">
                  <div className="cv-empty-icon"><Trophy size={25} /></div>
                  <strong>Your first achievement awaits</strong>
                  <p>Complete a simulation to start collecting milestones.</p>
                  <button onClick={() => navigate("/simulation")}>
                    Start a simulation <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </section>


            {latestAchievement && (
              <div className="cv-latest-achievement">
                <div className="cv-latest-achievement-icon">
                  {getAchievementIcon(latestAchievement.key)}
                </div>

                <div className="cv-latest-achievement-content">
                  <span className="cv-section-kicker">
                    LATEST MILESTONE UNLOCKED
                  </span>
                  <strong>{latestAchievement.title}</strong>
                  <p>{latestAchievement.description}</p>
                  <span className="cv-latest-achievement-xp">
                    <Zap size={14} />
                    +{latestAchievement.xp_reward} XP earned
                  </span>
                </div>

                <button
                  className="cv-latest-achievement-link"
                  onClick={() => navigate("/achievements")}
                >
                  View <ArrowRight size={15} />
                </button>
              </div>
            )}


            <section className="cv-panel cv-activity-panel">
              <div className="cv-panel-heading">
                <div>
                  <span className="cv-section-kicker">RECENT ACTIVITY</span>
                  <h3>Your journey so far</h3>
                </div>
                <button
                  className="cv-text-button"
                  onClick={() => navigate("/history")}
                >
                  View all <ArrowRight size={15} />
                </button>

              </div>


              {historyLoading ? (
                <p className="cv-empty-text">Loading your activity...</p>
              ) : recentActivity.length ? (
                <div className="cv-activity-list">
                  {recentActivity.map((item) => (
                    <div className="cv-activity-item" key={item.session_id}>
                      <div className="cv-activity-icon">
                        <BriefcaseBusiness size={18} />
                      </div>

                      <div className="cv-activity-info">
                        <strong>{item.career}</strong>
                        <span>
                          {item.scenario} ·{" "}
                          {item.status === "completed" ? "Completed" : "In progress"}
                        </span>
                      </div>

                      <div className="cv-activity-result">
                        {item.status === "completed"
                          ? `${Math.round((item.score / 30) * 100)}%`
                          : "—"}
                      </div>

                      <button
                        className="cv-activity-arrow"
                        onClick={() =>
                          navigate(
                            item.status === "completed"
                              ? `/assessment/${item.session_id}`
                              : `/simulation/${item.session_id}`
                          )
                        }
                        aria-label="View simulation"
                      >
                        <ArrowUpRight size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cv-empty-state cv-activity-empty">
                  <div className="cv-empty-icon">
                    <Clock3 size={25} />
                  </div>
                  <strong>Your journey starts here</strong>
                  <p>Your recent simulation activity will appear here.</p>
                  <button onClick={() => navigate("/simulation")}>
                    Try your first simulation <ArrowRight size={15} />
                  </button>
                </div>
              )}

            </section>

            <section className="cv-panel cv-quick-panel">
              <div className="cv-panel-heading">
                <div>
                  <span className="cv-section-kicker">TAKE THE NEXT STEP</span>
                  <h3>Quick actions</h3>
                </div>
              </div>

              <button className="cv-action-card" onClick={() => navigate("/discovery")}>
                <div className="cv-action-icon purple"><Compass size={20} /></div>
                <div>
                  <strong>Discover careers</strong>
                  <span>Find paths that match you</span>
                </div>
                <ArrowUpRight size={18} />
              </button>

              <button className="cv-action-card" onClick={() => navigate("/simulation")}>
                <div className="cv-action-icon blue"><BriefcaseBusiness size={20} /></div>
                <div>
                  <strong>Software Engineer simulation</strong>
                  <span>Experience a real-world software role</span>
                </div>
                <ArrowUpRight size={18} />
              </button>

              <button className="cv-action-card" onClick={() => navigate("/history")}>
                <div className="cv-action-icon orange"><History size={20} /></div>
                <div>
                  <strong>Review your history</strong>
                  <span>Reflect on past experiences</span>
                </div>
                <ArrowUpRight size={18} />
              </button>

            </section>
          </div>

          <footer className="cv-footer">
            <span>© 2026 CareerVerse</span>
            <span>Experience your future before choosing it.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
