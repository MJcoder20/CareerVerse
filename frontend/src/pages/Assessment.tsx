
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CheckCircle,
  Lightbulb,
  Target,
  TrendingUp,
  Briefcase,
  BookOpen,
} from "lucide-react";

import { assessmentService } from "../services/assessmentService";
import { roadmapService } from "../services/roadmap";
import type { AssessmentResponse } from "../types/assessment";

export default function Assessment() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [assessment, setAssessment] =
    useState<AssessmentResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [completedTasks, setCompletedTasks] =
    useState<Record<string, boolean>>({});


  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!sessionId || !Number.isInteger(Number(sessionId)) || Number(sessionId) <= 0) {
        setError("Invalid simulation session.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const id = Number(sessionId);

        // First: generate or retrieve the assessment.
        const assessmentData =
          await assessmentService.getAssessment(id);

        if (cancelled) return;

        setAssessment(assessmentData);

        // Second: retrieve roadmap progress after assessment exists.
        const progressData =
          await roadmapService.getProgress(id);

        if (cancelled) return;

        setCompletedTasks(progressData.completed_tasks || {});
      } catch (error) {
        console.error("Assessment loading failed:", error);

        if (!cancelled) {
          setError("Unable to load your assessment or roadmap progress.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);


  async function toggleTask(taskId: string) {
    if (!sessionId) return;

    const updatedTasks = {
      ...completedTasks,
      [taskId]: !completedTasks[taskId],
    };

    setCompletedTasks(updatedTasks);
    setSaveStatus("Saving...");
    setSaveError("");

    try {
      await roadmapService.saveProgress(
        Number(sessionId),
        updatedTasks
      );

      setSaveStatus("All progress saved.");
    } catch {
      setSaveStatus("");
      setSaveError("Unable to save progress. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="assessment-loading">
        Loading your assessment...
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <main className="assessment-page">
        <p className="assessment-error">
          {error || "Assessment not found."}
        </p>
        <Link to="/history" className="assessment-back">
          Back to simulation history
        </Link>
      </main>
    );
  }

  const allTasks = assessment.recommendations.flatMap(
    (item) =>
      item.learning_tasks.map(
        (_, index) => `${item.skill}-${index}`
      )
  );

  const completedCount = allTasks.filter(
    (taskId) => completedTasks[taskId]
  ).length;

  const overallRoadmapProgress = allTasks.length
    ? Math.round((completedCount / allTasks.length) * 100)
    : 0;

  return (
    <main className="assessment-page">
      <header className="assessment-header">
        <Link to="/history" className="assessment-back">
          <ArrowLeft size={18} /> Back to history
        </Link>

        <span className="assessment-eyebrow">
          CAREERVERSE · PERFORMANCE REPORT
        </span>

        <h1>Your professional assessment</h1>
        <p>Review your performance and discover how to improve.</p>
      </header>

      <section className="assessment-overview">
        <div className="assessment-score-card">
          <Award size={30} />
          <span className="assessment-label">
            Overall performance
          </span>
          <strong>{assessment.percentage}%</strong>
          <span>
            {assessment.overall_score}/{assessment.max_score} points
          </span>
        </div>

        <div className="assessment-summary-card">
          <h2>Performance summary</h2>
          <p>{assessment.summary}</p>
          <span>
            {Object.keys(assessment.skill_scores).length} skills evaluated
          </span>
        </div>
      </section>

      <section className="assessment-section">
        <h2><Target size={21} /> Skill breakdown</h2>

        <div className="assessment-skills">
          {Object.entries(assessment.skill_scores).map(([key, skill]) => (
            <article className="assessment-skill" key={key}>
              <div className="assessment-skill-heading">
                <strong>{skill.label}</strong>
                <span>{skill.percentage}%</span>
              </div>

              <div className="assessment-progress">
                <div
                  className="assessment-progress-fill"
                  style={{ width: `${skill.percentage}%` }}
                />
              </div>

              <small>
                {skill.score}/{skill.max_score} points
              </small>
            </article>
          ))}
        </div>
      </section>

      <section className="assessment-section">
        <h2><CheckCircle size={21} /> Your strengths</h2>

        <div className="assessment-list">
          {assessment.strengths.map((item, index) => (
            <div className="assessment-list-item" key={index}>
              <CheckCircle size={18} />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="assessment-section">
        <h2><TrendingUp size={21} /> Improvement areas</h2>

        <div className="assessment-list">
          {assessment.improvement_areas.map((item, index) => (
            <div className="assessment-list-item" key={index}>
              <Target size={18} />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="assessment-section roadmap-section">
        <div className="roadmap-header">
          <div>
            <span className="assessment-eyebrow">
              YOUR NEXT STEPS
            </span>
            <h2><BookOpen size={22} /> Skill development roadmap</h2>
            <p>
              Turn your assessment into practical learning activities.
            </p>
          </div>

          <div className="roadmap-total-progress">
            <strong>{overallRoadmapProgress}%</strong>
            <span>Overall progress</span>
          </div>
        </div>

        <div className="assessment-progress roadmap-total-bar">
          <div
            className="assessment-progress-fill"
            style={{ width: `${overallRoadmapProgress}%` }}
          />
        </div>

        <p className="roadmap-task-count">
          {completedCount} of {allTasks.length} tasks completed
        </p>

        {saveStatus && (
          <p className="roadmap-task-count" role="status">
            {saveStatus}
          </p>
        )}

        {saveError && (
          <p className="assessment-error" role="alert">
            {saveError}
          </p>
        )}

        {assessment.recommendations.map((item) => {
          const completed = item.learning_tasks.filter(
            (_, index) => completedTasks[`${item.skill}-${index}`]
          ).length;

          const progress = item.learning_tasks.length
            ? Math.round(
                (completed / item.learning_tasks.length) * 100
              )
            : 0;

          return (
            <article className="roadmap-card" key={item.skill}>
              <div className="roadmap-card-heading">
                <div>
                  <h3>{item.title}</h3>
                  <span className={`assessment-level ${item.level}`}>
                    {item.level}
                  </span>
                </div>

                <strong>{progress}%</strong>
              </div>

              <p className="roadmap-action">{item.action}</p>

              <div className="assessment-progress">
                <div
                  className="assessment-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <h4>Learning tasks</h4>

              <div className="roadmap-tasks">
                {item.learning_tasks.map((task, index) => {
                  const taskId = `${item.skill}-${index}`;

                  return (
                    <label className="roadmap-task" key={taskId}>
                      <input
                        type="checkbox"
                        checked={!!completedTasks[taskId]}
                        onChange={() => toggleTask(taskId)}
                      />

                      <span
                        className={
                          completedTasks[taskId]
                            ? "task-completed"
                            : ""
                        }
                      >
                        {task}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="roadmap-project">
                <h4><Briefcase size={17} /> Portfolio project</h4>
                <p>{item.portfolio_project}</p>
              </div>

              <div className="roadmap-goal">
                <h4><Target size={17} /> Completion goal</h4>
                <p>{item.completion_goal}</p>
              </div>

              <p className="roadmap-task-count">
                {completed} of {item.learning_tasks.length} tasks completed
              </p>
            </article>
          );
        })}
      </section>

      <section className="assessment-section">
        <h2><Lightbulb size={21} /> Personalized recommendations</h2>

        <div className="assessment-recommendations">
          {assessment.recommendations.map((item) => (
            <article
              className="assessment-recommendation"
              key={item.skill}
            >
              <div className="assessment-recommendation-heading">
                <h3>{item.title}</h3>
                <span className={`assessment-level ${item.level}`}>
                  {item.level}
                </span>
              </div>
              <p>{item.action}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="assessment-footer">
        <Link to="/simulation" className="assessment-primary-button">
          Try another simulation
        </Link>

        <Link to="/dashboard" className="assessment-secondary-button">
          Return to dashboard
        </Link>
      </footer>
    </main>
  );
}
