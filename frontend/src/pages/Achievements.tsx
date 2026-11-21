
import { useEffect, useState } from "react";
import {
  Trophy,
  Star,
  Target,
  Zap,
  Award,
  Lock,
  CheckCircle,
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  Compass,
  LogOut,
  X,
  History as HistoryIcon, Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { simulationService, type UserProgress } from "../services/simulation";
import { useAuth } from "../context/AuthContext";

function getAchievementIcon(key: string) {
  switch (key) {
    case "first_simulation":
      return <Star size={24} />;
    case "career_explorer_3":
      return <Target size={24} />;
    case "rising_professional_5":
      return <Zap size={24} />;
    case "high_performer_27":
      return <Trophy size={24} />;
    default:
      return <Award size={24} />;
  }
}

export default function Achievements() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    simulationService
      .getProgress()
      .then(setProgress)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const achievements = progress?.achievements ?? [];
  const unlockedCount = achievements.filter((item) => item.unlocked).length;

  const [selectedAchievement, setSelectedAchievement] = useState<
    (typeof achievements)[number] | null
  >(null);

  const unlockedTimeline = achievements
    .filter((achievement) => achievement.unlocked && achievement.unlocked_at)
    .sort(
      (a, b) =>
        new Date(b.unlocked_at!).getTime() -
        new Date(a.unlocked_at!).getTime()
    );


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
            className="cv-nav-item"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className="cv-nav-item"
            onClick={() => navigate("/discovery")}
          >
            <Compass size={19} />
            <span>Career discovery</span>
          </button>

          <button
            className="cv-nav-item"
            onClick={() => navigate("/history")}
          >
            <HistoryIcon size={19} />
            <span>My simulations</span>
          </button>

          <button className="cv-nav-item active">
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
          <button onClick={() => navigate("/discovery")}>
            Explore careers <ArrowRight size={14} />
          </button>
        </div>

        <div className="cv-sidebar-bottom">
          <div className="cv-user-mini">
            <div className="cv-avatar">
              {(user?.full_name || "Career Explorer")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="cv-user-info">
              <strong>{user?.full_name || "Career Explorer"}</strong>
              <span>Career Explorer</span>
            </div>
            <button
              className="cv-logout"
              onClick={logout}
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
            <Menu size={21} />
          </button>
          <div className="cv-breadcrumb">
            Dashboard <span>/</span> <strong>Achievements</strong>
          </div>
          <div className="cv-topbar-right">
            <span className="cv-topbar-date">
              {user?.full_name ?? "Welcome"}
            </span>
          </div>
        </header>

        <div className="cv-content">
          <section className="cv-section">
            <div className="cv-section-heading">
              <div>
                <span className="cv-section-kicker">YOUR MILESTONES</span>
                <h2>Achievements</h2>
                <p>Celebrate your progress and keep reaching new milestones.</p>
              </div>
            </div>

            {loading ? (
              <p className="cv-empty-text">Loading achievements...</p>
            ) : (
              <>
                <div className="achievement-summary">
                  <div>
                    <Trophy size={25} />
                    <strong>{unlockedCount}/{achievements.length}</strong>
                    <span>Achievements unlocked</span>
                  </div>
                  <div>
                    <Zap size={25} />
                    <strong>{progress?.total_xp ?? 0}</strong>
                    <span>Total XP earned</span>
                  </div>
                </div>

                <div className="achievements-grid">
                  {achievements.map((achievement) => (
                    <article
                      className={`achievement-card ${
                        achievement.unlocked ? "unlocked" : "locked"
                      }`}
                      key={achievement.key}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedAchievement(achievement)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedAchievement(achievement);
                        }
                      }}
                    >
                      <div className="achievement-card-top">
                        <div className="achievement-icon">
                          {getAchievementIcon(achievement.key)}
                        </div>

                        {achievement.unlocked ? (
                          <span className="achievement-status unlocked-status">
                            <CheckCircle size={14} /> Unlocked
                          </span>
                        ) : (
                          <span className="achievement-status locked-status">
                            <Lock size={13} /> Locked
                          </span>
                        )}
                      </div>

                      <h3>{achievement.title}</h3>
                      <p>{achievement.description}</p>
                      <div className="achievement-xp-reward">
                        <Zap size={15} />
                        <strong>+{achievement.xp_reward} XP</strong>
                        <span>Reward</span>
                      </div>

                      {!achievement.unlocked &&
                        achievement.type === "simulations" && (
                          <div className="achievement-progress">
                            <div className="achievement-progress-label">
                              <span>Progress</span>
                              <strong>
                                {achievement.progress}/{achievement.target}
                              </strong>
                            </div>
                            <div className="achievement-progress-track">
                              <div
                                className="achievement-progress-fill"
                                style={{
                                  width: `${
                                    (achievement.progress /
                                      achievement.target) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                      {achievement.unlocked && achievement.unlocked_at && (
                        <span className="achievement-date">
                          Unlocked{" "}
                          {new Date(
                            achievement.unlocked_at
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </article>
                  ))}
                </div>

                <section className="achievement-timeline-section">
                  <div className="cv-panel-heading">
                    <div>
                      <span className="cv-section-kicker">YOUR JOURNEY</span>
                      <h3>Achievement Timeline</h3>
                    </div>
                    <div className="cv-panel-icon">
                      <HistoryIcon size={19} />
                    </div>
                  </div>

                  {unlockedTimeline.length > 0 ? (
                    <div className="achievement-timeline">
                      {unlockedTimeline.map((achievement, index) => (
                        <div
                          className="achievement-timeline-item"
                          key={achievement.key}
                        >
                          <div className="achievement-timeline-marker">
                            <div className="achievement-timeline-icon">
                              {getAchievementIcon(achievement.key)}
                            </div>
                            {index !== unlockedTimeline.length - 1 && (
                              <div className="achievement-timeline-line" />
                            )}
                          </div>

                          <div className="achievement-timeline-content">
                            <div className="achievement-timeline-heading">
                              <strong>{achievement.title}</strong>
                              <span>
                                {new Date(
                                  achievement.unlocked_at!
                                ).toLocaleDateString()}
                              </span>
                            </div>

                            <p>{achievement.description}</p>

                            <span className="achievement-timeline-xp">
                              <Zap size={14} />
                              +{achievement.xp_reward} XP earned
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="cv-empty-text">
                      Your achievement journey will appear here once you unlock your first milestone.
                    </p>
                  )}
                </section>
                                {selectedAchievement && (
                  <div
                    className="achievement-modal-overlay"
                    onClick={() => setSelectedAchievement(null)}
                  >
                    <div
                      className="achievement-modal"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="achievement-modal-title"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        className="achievement-modal-close"
                        onClick={() => setSelectedAchievement(null)}
                        aria-label="Close achievement details"
                      >
                        <X size={20} />
                      </button>

                      <div className="achievement-modal-icon">
                        {getAchievementIcon(selectedAchievement.key)}
                      </div>

                      <span className="cv-section-kicker">
                        ACHIEVEMENT DETAILS
                      </span>

                      <h2 id="achievement-modal-title">
                        {selectedAchievement.title}
                      </h2>

                      <p className="achievement-modal-description">
                        {selectedAchievement.description}
                      </p>

                      <div className="achievement-modal-status">
                        {selectedAchievement.unlocked ? (
                          <>
                            <CheckCircle size={17} />
                            Achievement unlocked
                          </>
                        ) : (
                          <>
                            <Lock size={16} />
                            Achievement locked
                          </>
                        )}
                      </div>

                      <div className="achievement-modal-reward">
                        <Zap size={20} />
                        <div>
                          <strong>
                            +{selectedAchievement.xp_reward} XP
                          </strong>
                          <span>Achievement reward</span>
                        </div>
                      </div>

                      <div className="achievement-modal-requirement">
                        <strong>Unlock requirement</strong>
                        <p>
                          {selectedAchievement.type === "simulations"
                            ? `Complete ${selectedAchievement.target} career ${
                                selectedAchievement.target === 1
                                  ? "simulation"
                                  : "simulations"
                              }.`
                            : `Reach a score of at least ${selectedAchievement.target} points in a simulation.`}
                        </p>
                      </div>

                      {selectedAchievement.type === "simulations" && (
                        <div className="achievement-modal-progress">
                          <div className="achievement-progress-label">
                            <span>Your progress</span>
                            <strong>
                              {selectedAchievement.progress}/
                              {selectedAchievement.target}
                            </strong>
                          </div>

                          <div className="achievement-progress-track">
                            <div
                              className="achievement-progress-fill"
                              style={{
                                width: `${
                                  (selectedAchievement.progress /
                                    selectedAchievement.target) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {selectedAchievement.unlocked &&
                        selectedAchievement.unlocked_at && (
                          <p className="achievement-modal-date">
                            Unlocked on{" "}
                            {new Date(
                              selectedAchievement.unlocked_at
                            ).toLocaleDateString()}
                          </p>
                        )}

                      <button
                        className="simulation-primary-button achievement-modal-button"
                        onClick={() => setSelectedAchievement(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
