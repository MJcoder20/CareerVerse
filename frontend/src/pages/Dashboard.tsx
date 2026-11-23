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
  Award, CheckCircle,
    Lock,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  simulationService,
  type UserProgress,
  type SimulationAnalytics,
} from "../services/simulation";
import {
  getCareerGoal,
  type CareerGoal,
} from "../services/goals";
import type { SimulationHistoryItem } from "../types/simulationHistory";



export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [history, setHistory] = useState<SimulationHistoryItem[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [analytics, setAnalytics] = useState<SimulationAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityPeriod, setActivityPeriod] = useState<"week" | "month">("week");

  const [careerGoal, setCareerGoal] = useState<CareerGoal | null>(null);
  const [goalLoading, setGoalLoading] = useState(true);

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

    simulationService
      .getAnalytics()
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setAnalyticsLoading(false));

    getCareerGoal()
      .then(setCareerGoal)
      .catch(console.error)
      .finally(() => setGoalLoading(false));
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

  const careerGoalProgress = careerGoal
    ? Math.round(
        (careerGoal.simulation_progress + careerGoal.xp_progress) / 2
      )
    : 0;

  const careerGoalMilestones = [25, 50, 75, 100];

  const completedGoalMilestones = careerGoalMilestones.filter(
    (milestone) => careerGoalProgress >= milestone
  ).length;

  const nextGoalMilestone = careerGoalMilestones.find(
    (milestone) => careerGoalProgress < milestone
  );

  const activityWindowStart = new Date();
  activityWindowStart.setDate(
    activityWindowStart.getDate() - (activityPeriod === "week" ? 7 : 30)
  );

  const periodAssessmentCount =
    analytics?.score_history.filter(
      (item) => new Date(item.completed_at) >= activityWindowStart
    ).length ?? 0;

  const activityChartData = Array.from(
    { length: activityPeriod === "week" ? 7 : 30 },
    (_, index) => {
      const daysToShow = activityPeriod === "week" ? 7 : 30;
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (daysToShow - 1 - index));

      const count =
        analytics?.score_history.filter((item) => {
          const completedDate = new Date(item.completed_at);

          return (
            completedDate.getFullYear() === date.getFullYear() &&
            completedDate.getMonth() === date.getMonth() &&
            completedDate.getDate() === date.getDate()
          );
        }).length ?? 0;

      return {
        date,
        count,
      };
    }
  );

  // Career Readiness Score
  const simulationExperienceScore = Math.min(
    (progress?.completed_simulations ?? 0) / 10,
    1
  ) * 100;

  const simulationPerformanceScore = Math.min(
    averageScore,
    100
  );

  const xpProgressScore = Math.min(
    (progress?.total_xp ?? 0) / 2000,
    1
  ) * 100;

  const achievementScore =
    (progress?.achievements?.length ?? 0) > 0
      ? (progress!.achievements.filter((item) => item.unlocked).length /
          progress!.achievements.length) * 100
      : 0;

  const careerReadinessScore = Math.round(
    simulationExperienceScore * 0.3 +
    simulationPerformanceScore * 0.3 +
    xpProgressScore * 0.2 +
    achievementScore * 0.2
  );

  const readinessLabel =
    careerReadinessScore >= 80
      ? "Career Ready"
      : careerReadinessScore >= 60
      ? "Almost There"
      : careerReadinessScore >= 40
      ? "Making Progress"
      : "Just Getting Started";

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

  const getAchievementRarity = (key: string) => {
    switch (key) {
      case "first_simulation":
        return { label: "Common", className: "common" };

      case "career_explorer_3":
      case "high_performer_27":
        return { label: "Rare", className: "rare" };

      case "rising_professional_5":
        return { label: "Epic", className: "epic" };

      default:
        return { label: "Common", className: "common" };
    }
  };

  const unlockedAchievements =
    progress?.achievements.filter((achievement) => achievement.unlocked) ?? [];

  const latestAchievement = [...unlockedAchievements].sort(
    (a, b) =>
      new Date(b.unlocked_at ?? 0).getTime() -
      new Date(a.unlocked_at ?? 0).getTime()
  )[0];

  const recentAchievements = (progress?.achievements ?? [])
    .filter((achievement) => achievement.unlocked)
    .sort(
      (a, b) =>
        new Date(b.unlocked_at ?? 0).getTime() -
        new Date(a.unlocked_at ?? 0).getTime()
    )
    .slice(0, 3);

  const careerMilestones = [
    {
      id: "first-simulation",
      title: "First Career Simulation",
      description: "Complete your first career simulation.",
      requirement: 1,
      current: progress?.completed_simulations ?? 0,
      unit: "simulations",
      reward: "Career journey started",
    },
    {
      id: "career-explorer",
      title: "Career Explorer",
      description: "Complete 3 career simulations.",
      requirement: 3,
      current: progress?.completed_simulations ?? 0,
      unit: "simulations",
      reward: "Experienced explorer",
    },
    {
      id: "rising-professional",
      title: "Rising Professional",
      description: "Complete 5 career simulations.",
      requirement: 5,
      current: progress?.completed_simulations ?? 0,
      unit: "simulations",
      reward: "Consistent learner",
    },
    {
      id: "xp-collector",
      title: "XP Collector",
      description: "Earn 500 total experience points.",
      requirement: 500,
      current: progress?.total_xp ?? 0,
      unit: "XP",
      reward: "Level progression",
    },
  ];

  const completedMilestones = careerMilestones.filter(
    (milestone) => milestone.current >= milestone.requirement
  ).length;

  const nextCareerMilestone = careerMilestones.find(
    (milestone) => milestone.current < milestone.requirement
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
          <button
            className="cv-nav-item"
            onClick={() => navigateFromSidebar("/goals")}
          >
            <Target size={19} />
            <span>Career Goals</span>
            <ArrowUpRight size={15} className="cv-nav-arrow" />
          </button>
          <button
            className="cv-nav-item"
            onClick={() => navigateFromSidebar("/career-coach")}
          >
            <Sparkles size={19} />
            <span>AI Career Coach</span>
            <ArrowUpRight size={15} className="cv-nav-arrow" />
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

          {!goalLoading && (
            <section className="cv-section career-dashboard-goal">
              <div className="cv-section-heading">
                <div>
                  <div className="cv-section-kicker">
                    <Target size={15} /> YOUR CAREER JOURNEY
                  </div>
                  <h2>Career Goal</h2>
                </div>

                <button
                  className="cv-outline-button"
                  onClick={() => navigate("/goals")}
                >
                  {careerGoal ? "Edit goal" : "Set a goal"}
                  <ArrowUpRight size={16} />
                </button>
              </div>

              {careerGoal ? (
                <div className="cv-panel">
                  <div className="career-goal-overview">
                    <div>
                      <span>Target career role</span>
                      <h3>{careerGoal.career_role}</h3>
                    </div>
                    {careerGoal.is_completed && (
                      <div className="career-goal-status">
                        <CheckCircle size={17} />
                        Goal achieved!
                      </div>
                    )}
                  </div>

                  <div className="career-goal-progress-grid">
                    <div className="career-goal-progress-card">
                      <div className="career-goal-progress-icon">
                        <BriefcaseBusiness size={21} />
                      </div>
                      <span>Completed simulations</span>
                      <strong>
                        {careerGoal.completed_simulations} / {careerGoal.target_simulations}
                      </strong>
                      <div className="cv-progress-track">
                        <div
                          className="cv-progress-fill"
                          style={{ width: `${careerGoal.simulation_progress}%` }}
                        />
                      </div>
                      <small>{careerGoal.simulation_progress}% completed</small>
                    </div>

                    <div className="career-goal-progress-card">
                      <div className="career-goal-progress-icon">
                        <Zap size={21} />
                      </div>
                      <span>Experience points</span>
                      <strong>
                        {careerGoal.current_xp} / {careerGoal.target_xp} XP
                      </strong>
                      <div className="cv-progress-track">
                        <div
                          className="cv-progress-fill"
                          style={{ width: `${careerGoal.xp_progress}%` }}
                        />
                      </div>
                      <small>{careerGoal.xp_progress}% completed</small>
                    </div>
                  </div>
                  <div className="career-goal-milestones">
                    <div className="career-goal-milestones-heading">
                      <div>
                        <span>OVERALL PROGRESS</span>
                        <strong>{careerGoalProgress}%</strong>
                      </div>

                      <small>
                        {completedGoalMilestones} of {careerGoalMilestones.length} milestones completed
                      </small>
                    </div>

                    <div className="career-goal-milestone-track">
                      {careerGoalMilestones.map((milestone) => (
                        <div
                          key={milestone}
                          className={`career-goal-milestone ${
                            careerGoalProgress >= milestone ? "completed" : ""
                          }`}
                        >
                          <div className="career-goal-milestone-dot">
                            {careerGoalProgress >= milestone && "✓"}
                          </div>
                          <span>{milestone}%</span>
                        </div>
                      ))}
                    </div>

                    <p className="career-goal-next-milestone">
                      {careerGoal.is_completed
                        ? "Congratulations! You've achieved your career goal."
                        : nextGoalMilestone
                          ? `Next milestone: reach ${nextGoalMilestone}% overall progress.`
                          : "You're almost there!"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="cv-panel">
                  <p>You haven't set a career goal yet. Choose your target role and start tracking your progress!</p>
                  <button
                    className="cv-primary-button"
                    onClick={() => navigate("/goals")}
                  >
                    Create your career goal <ArrowRight size={17} />
                  </button>
                </div>
              )}
            </section>

          )}
          {!progressLoading && !historyLoading && (
            <section className="cv-section career-readiness-section">
              <div className="cv-section-heading">
                <div>
                  <div className="cv-section-kicker">
                    <Sparkles size={15} /> YOUR PROFESSIONAL GROWTH
                  </div>
                  <h2>Career Readiness</h2>
                </div>
                <span className="career-readiness-label">
                  {readinessLabel}
                </span>
              </div>

              <div className="cv-panel career-readiness-panel">
                <div className="career-readiness-main">
                  <div
                    className="career-readiness-circle"
                    style={{
                      background: `conic-gradient(var(--primary) ${careerReadinessScore * 3.6}deg, var(--border) 0deg)`,
                    }}
                  >
                    <div className="career-readiness-circle-inner">
                      <strong>{careerReadinessScore}%</strong>
                      <span>Readiness</span>
                    </div>
                  </div>

                  <div className="career-readiness-description">
                    <h3>{readinessLabel}</h3>
                    <p>
                      Your readiness score reflects your simulation experience,
                      performance, XP progression, and achievements.
                      Keep learning and completing simulations to improve it.
                    </p>
                  </div>
                </div>

                <div className="career-readiness-breakdown">
                  <div>
                    <span>Simulation experience</span>
                    <strong>{Math.round(simulationExperienceScore)}%</strong>
                  </div>
                  <div>
                    <span>Simulation performance</span>
                    <strong>{Math.round(simulationPerformanceScore)}%</strong>
                  </div>
                  <div>
                    <span>XP progression</span>
                    <strong>{Math.round(xpProgressScore)}%</strong>
                  </div>
                  <div>
                    <span>Achievement completion</span>
                    <strong>{Math.round(achievementScore)}%</strong>
                  </div>
                </div>
              </div>
            </section>
          )}

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

          <section className="cv-section cv-analytics-section">
            <div className="cv-section-heading">
              <div>
                <span className="cv-section-kicker">
                  <TrendingUp size={15} /> PERFORMANCE INSIGHTS
                </span>
                <h2>Career Progress Analytics</h2>
              </div>
              <div className="cv-activity-period-controls">
                <button
                  className={activityPeriod === "week" ? "active" : ""}
                  onClick={() => setActivityPeriod("week")}
                >
                  7 days
                </button>

                <button
                  className={activityPeriod === "month" ? "active" : ""}
                  onClick={() => setActivityPeriod("month")}
                >
                  30 days
                </button>
              </div>
            </div>

            <div className="cv-activity-summary">
              <strong>{periodAssessmentCount}</strong>
              <span>
                assessments in the last {activityPeriod === "week" ? "7 days" : "30 days"}
              </span>
            </div>

            <div className="cv-activity-chart">
              <div className="cv-activity-chart-bars">
                {activityChartData.map((item, index) => {
                  const maxCount = Math.max(
                    1,
                    ...activityChartData.map((day) => day.count)
                  );

                  const barHeight = (item.count / maxCount) * 100;

                  return (
                    <div className="cv-activity-chart-column" key={index}>
                      <span className="cv-activity-chart-count">
                        {item.count > 0 ? item.count : ""}
                      </span>

                      <div className="cv-activity-chart-track">
                        <div
                          className="cv-activity-chart-bar"
                          style={{ height: `${barHeight}%` }}
                          title={`${item.count} assessments`}
                        />
                      </div>

                      <span className="cv-activity-chart-label">
                        {item.date.toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {analyticsLoading ? (
              <div className="cv-panel">
                <p className="cv-empty-text">Loading your analytics...</p>
              </div>
            ) : analytics ? (
              <>
                <div className="cv-analytics-stats">
                  <article className="cv-panel cv-analytics-stat">
                    <span>Average score</span>
                    <strong>{analytics.average_score}%</strong>
                    <small>Across all assessments</small>
                  </article>

                  <article className="cv-panel cv-analytics-stat">
                    <span>Highest score</span>
                    <strong>{analytics.highest_score}%</strong>
                    <small>Your personal best</small>
                  </article>

                  <article className="cv-panel cv-analytics-stat">
                    <span>Latest score</span>
                    <strong>
                      {analytics.latest_score !== null
                        ? `${analytics.latest_score}%`
                        : "—"}
                    </strong>
                    <small>Most recent assessment</small>
                  </article>

                  <article className="cv-panel cv-analytics-stat">
                    <span>Total assessments</span>
                    <strong>{analytics.total_assessments}</strong>
                    <small>Completed evaluations</small>
                  </article>
                </div>

                <div className="cv-analytics-grid">
                  <div className="cv-panel cv-score-chart">
                    <div className="cv-panel-heading">
                      <div>
                        <span className="cv-section-kicker">SCORE DEVELOPMENT</span>
                        <h3>Assessment score history</h3>
                      </div>
                    </div>

                    {analytics.score_history.length > 0 ? (
                      <div className="cv-score-chart-bars">
                        {analytics.score_history.slice(-8).map((item) => (
                          <div
                            className="cv-score-chart-column"
                            key={item.session_id}
                          >
                            <strong>{item.percentage}%</strong>

                            <div className="cv-score-bar-track">
                              <div
                                className="cv-score-bar-fill"
                                style={{
                                  height: `${Math.max(5, Math.min(100, item.percentage))}%`,
                                }}
                              />
                            </div>

                            <span>
                              {new Date(item.completed_at).toLocaleDateString("en", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="cv-empty-text">
                        Complete a simulation to see your score history.
                      </p>
                    )}

                    <p className="cv-chart-caption">
                      Your assessment scores over time, from oldest to newest.
                    </p>
                  </div>



                  <div className="cv-panel cv-career-analytics">
                    <div className="cv-panel-heading">
                      <div>
                        <span className="cv-section-kicker">PRACTICE BREAKDOWN</span>
                        <h3>Simulations by career</h3>
                      </div>
                      <BriefcaseBusiness size={20} />
                    </div>

                    {analytics.completed_simulations_by_career.length > 0 ? (
                      <div className="cv-career-analytics-list">
                        {analytics.completed_simulations_by_career.map((item) => (
                          <div
                            className="cv-career-analytics-item"
                            key={item.career_slug}
                          >
                            <div>
                              <strong>
                                {item.career_slug
                                  .split("-")
                                  .map((word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  )
                                  .join(" ")}
                              </strong>
                              <span>{item.completed_count} completed</span>
                            </div>
                            <BriefcaseBusiness size={19} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="cv-empty-text">
                        Your completed career simulations will appear here.
                      </p>
                    )}
                  </div>
                </div>
                <div className="cv-panel cv-growth-insights">
                  <div className="cv-panel-heading">
                    <div>
                      <span className="cv-section-kicker">SKILL DEVELOPMENT</span>
                      <h3>Career Growth Insights</h3>
                    </div>
                  </div>

                  {analytics.skill_insights.length > 0 ? (
                    <div className="cv-growth-insights-grid">
                      {analytics.skill_insights.map((skill) => (
                        <article
                          className="cv-growth-skill-card"
                          key={skill.skill}
                        >
                          <div className="cv-growth-skill-heading">
                            <strong>{skill.label}</strong>
                            <span className={`cv-growth-trend ${skill.trend}`}>
                              {skill.trend === "improving"
                                ? "↑ Improving"
                                : skill.trend === "declining"
                                  ? "↓ Declining"
                                  : "→ Stable"}
                            </span>
                          </div>

                          <strong className="cv-growth-average">
                            {skill.average_score}%
                          </strong>

                          <span className="cv-growth-description">
                            Average performance
                          </span>

                          <div className="cv-growth-progress-track">
                            <div
                              className="cv-growth-progress-fill"
                              style={{
                                width: `${Math.max(0, Math.min(100, skill.latest_score))}%`,
                              }}
                            />
                          </div>

                          <div className="cv-growth-comparison">
                            <span>First: {skill.first_score}%</span>
                            <span>Latest: {skill.latest_score}%</span>
                          </div>

                          <p className="cv-growth-change">
                            {skill.change > 0 ? "+" : ""}
                            {skill.change} percentage points since your first assessment
                          </p>

                          <small>
                            Based on {skill.assessment_count} assessments
                          </small>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="cv-empty-text">
                      Complete more simulations to discover your skill development trends.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="cv-panel">
                <p className="cv-empty-text">
                  Analytics are currently unavailable. Please try again later.
                </p>
              </div>
            )}
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
                          Unlocked{" "}
                          {achievement.unlocked_at
                            ? new Date(achievement.unlocked_at).toLocaleDateString()
                            : "Date unavailable"}
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

            {recentAchievements.length > 0 && (
              <section className="cv-achievement-showcase">
                <div className="cv-achievement-showcase-heading">
                  <div>
                    <span className="cv-section-kicker">YOUR MILESTONES</span>
                    <h3>Achievement Showcase</h3>
                    <p>Your latest career accomplishments.</p>
                  </div>

                  <button
                    className="cv-achievement-showcase-link"
                    onClick={() => navigate("/achievements")}
                  >
                    View all <ArrowRight size={15} />
                  </button>
                </div>

                <div className="cv-achievement-showcase-grid">
                  {recentAchievements.map((achievement) => {
                    const rarity = getAchievementRarity(achievement.key);

                    return (
                      <div
                        className="cv-achievement-showcase-card"
                        key={achievement.key}
                      >
                        <div className="cv-achievement-showcase-icon">
                          {getAchievementIcon(achievement.key)}
                        </div>

                        <div className="cv-achievement-showcase-info">
                          <span className={`achievement-rarity ${rarity.className}`}>
                            {rarity.label}
                          </span>

                          <strong>{achievement.title}</strong>

                          <span className="cv-achievement-showcase-xp">
                            <Zap size={13} />
                            +{achievement.xp_reward} XP
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="cv-career-milestones">
              <div className="cv-career-milestones-heading">
                <div>
                  <span className="cv-section-kicker">CAREER JOURNEY</span>
                  <h3>Career Progression</h3>
                  <p>Every milestone brings you closer to your career goals.</p>
                </div>

                <div className="cv-milestone-completion">
                  <strong>{completedMilestones}/{careerMilestones.length}</strong>
                  <span>Completed</span>
                </div>
              </div>

              <div className="cv-milestones-list">
                {careerMilestones.map((milestone) => {
                  const isCompleted =
                    milestone.current >= milestone.requirement;

                  const percentage = Math.min(
                    100,
                    Math.round(
                      (milestone.current / milestone.requirement) * 100
                    )
                  );

                  const isNext = nextCareerMilestone?.id === milestone.id;

                  return (
                    <div
                      className={`cv-milestone-item ${
                        isCompleted ? "completed" : isNext ? "current" : "upcoming"
                      }`}
                      key={milestone.id}
                    >
                      <div className="cv-milestone-icon">
                        {isCompleted ? (
                          <CheckCircle size={21} />
                        ) : isNext ? (
                          <Target size={21} />
                        ) : (
                          <Lock size={20} />
                        )}
                      </div>

                      <div className="cv-milestone-content">
                        <div className="cv-milestone-title-row">
                          <strong>{milestone.title}</strong>
                          <span>
                            {isCompleted
                              ? "Completed"
                              : isNext
                                ? "In progress"
                                : "Upcoming"}
                          </span>
                        </div>

                        <p>{milestone.description}</p>

                        <div className="cv-milestone-progress-label">
                          <span>
                            {Math.min(milestone.current, milestone.requirement)} /{" "}
                            {milestone.requirement} {milestone.unit}
                          </span>
                          <strong>{percentage}%</strong>
                        </div>

                        <div className="cv-milestone-progress-track">
                          <div
                            className="cv-milestone-progress-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <small>
                          <Star size={13} />
                          {milestone.reward}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

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
