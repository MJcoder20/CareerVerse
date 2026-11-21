
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { discoveryService } from "../services/discovery";
import { simulationService } from "../services/simulation";
import type {
  DiscoveryRequest,
  CareerRecommendation,
} from "../types/discovery";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Sparkles,
  Target,
  Lightbulb,
  BriefcaseBusiness,
  AlertCircle,
  Play,
  LoaderCircle,
} from "lucide-react";

const questions = [
  {
    key: "interests",
    title: "What interests you?",
    subtitle: "Choose the fields you would enjoy exploring.",
    options: [
      ["software", "Software & Technology"],
      ["healthcare", "Healthcare"],
      ["design", "Art & Design"],
      ["science", "Science & Research"],
      ["education", "Education"],
      ["business", "Business & Entrepreneurship"],
      ["law", "Law & Justice"],
      ["engineering", "Engineering"],
    ],
  },
  {
    key: "strengths",
    title: "What are your strengths?",
    subtitle: "Select abilities you enjoy using.",
    options: [
      ["problem_solving", "Problem Solving"],
      ["communication", "Communication"],
      ["creativity", "Creativity"],
      ["empathy", "Understanding Others"],
      ["analysis", "Analytical Thinking"],
      ["organization", "Organization"],
      ["technical", "Technical Skills"],
    ],
  },
  {
    key: "work_styles",
    title: "How do you prefer to work?",
    subtitle: "Think about your ideal working environment.",
    options: [
      ["independent", "Working Independently"],
      ["collaborative", "Working in a Team"],
      ["structured", "Structured Environment"],
      ["flexible", "Flexible Environment"],
      ["fast_paced", "Fast-Paced Environment"],
    ],
  },
  {
    key: "priorities",
    title: "What matters most in your career?",
    subtitle: "Choose the things you value professionally.",
    options: [
      ["impact", "Making a Difference"],
      ["stability", "Job Stability"],
      ["creativity", "Creative Freedom"],
      ["income", "Financial Growth"],
      ["flexibility", "Work-Life Flexibility"],
      ["learning", "Continuous Learning"],
    ],
  },
] as const;

type Category = keyof DiscoveryRequest;

const initialAnswers: DiscoveryRequest = {
  interests: [],
  strengths: [],
  work_styles: [],
  priorities: [],
};

export default function Discovery() {
  const navigate = useNavigate();

  const [answers, setAnswers] =
    useState<DiscoveryRequest>(initialAnswers);

  const [results, setResults] =
    useState<CareerRecommendation[]>([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [simulationLoading, setSimulationLoading] =
    useState(false);
  const [error, setError] = useState("");

  const completedQuestions = questions.filter((question) => {
    const category = question.key as Category;
    return answers[category].length > 0;
  }).length;

  const totalSelections = Object.values(answers).reduce(
    (total, values) => total + values.length,
    0
  );

  const progressPercentage =
    (completedQuestions / questions.length) * 100;

  function toggleOption(category: Category, value: string) {
    setAnswers((previous) => {
      const current = previous[category];

      return {
        ...previous,
        [category]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });

    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResults([]);

    try {
      const response =
        await discoveryService.getRecommendations(answers);

      setResults(response.recommendations);
      setMessage(response.message);
    } catch {
      setError(
        "We couldn't generate recommendations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStartSimulation(careerName: string) {
    if (careerName.toLowerCase() !== "software engineer") {
      return;
    }

    setError("");
    setSimulationLoading(true);

    try {
      const session = await simulationService.start();
      navigate(`/simulation/${session.session_id}`);
    } catch (err) {
      console.error("Failed to start simulation:", err);
      setError(
        "We couldn't start the simulation. Please try again."
      );
      setSimulationLoading(false);
    }
  }

  return (
    <main className="discovery-page">
      {/* Navigation */}
      <nav className="discovery-nav">
        <h2
          onClick={() => navigate("/dashboard")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate("/dashboard");
            }
          }}
        >
          CareerVerse<span>.</span>
        </h2>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>
      </nav>

      {/* Introduction */}
      <header className="discovery-header">
        <div className="discovery-heading-icon">
          <Compass size={25} />
        </div>

        <span>CAREER DISCOVERY ENGINE</span>

        <h1>
          Discover possibilities.
          <br />
          <span>Find your direction.</span>
        </h1>

        <p>
          Your next career move starts with understanding yourself.
          Tell us about your interests, strengths, and priorities to
          discover professional paths worth exploring.
        </p>

        <div className="discovery-highlights">
          <div>
            <Sparkles size={17} />
            Personalized matches
          </div>

          <div>
            <Target size={17} />
            Strength-based insights
          </div>

          <div>
            <BriefcaseBusiness size={17} />
            Real career perspectives
          </div>
        </div>
      </header>

      {/* Questionnaire */}
      <form className="discovery-form" onSubmit={handleSubmit}>
        <div className="discovery-form-heading">
          <div>
            <span className="discovery-section-label">
              YOUR PROFILE
            </span>
            <h2>Let's get to know you</h2>
            <p>
              Select at least one option in each category.
            </p>
          </div>

          <div className="discovery-completion">
            <strong>
              {completedQuestions}/{questions.length}
            </strong>
            <span>completed</span>
          </div>
        </div>

        <div className="discovery-progress">
          <div
            className="discovery-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {questions.map((question, index) => {
          const category = question.key as Category;

          return (
            <section
              className="question-card"
              key={question.key}
            >
              <div className="question-card-header">
                <div className="question-number">
                  0{index + 1}
                </div>

                <div>
                  <span className="question-step">
                    STEP {index + 1} OF {questions.length}
                  </span>

                  <h2>{question.title}</h2>
                  <p>{question.subtitle}</p>
                </div>

                {answers[category].length > 0 && (
                  <span className="question-complete">
                    <Check size={14} />
                    Completed
                  </span>
                )}
              </div>

              <div className="option-grid">
                {question.options.map(([value, label]) => {
                  const selected =
                    answers[category].includes(value);

                  return (
                    <label
                      key={value}
                      className={`option-card ${
                        selected ? "selected" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleOption(category, value)
                        }
                      />

                      <span className="option-check">
                        {selected && <Check size={14} />}
                      </span>

                      <span className="option-label">
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="question-selection-count">
                {answers[category].length} selected
              </div>
            </section>
          );
        })}

        {error && (
          <div className="error-message" role="alert">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="discovery-submit-area">
          <div>
            <strong>{totalSelections} selections made</strong>
            <span>
              {completedQuestions === questions.length
                ? "Your profile is ready."
                : "Complete all four categories to continue."}
            </span>
          </div>

          <button
            className="discover-button"
            type="submit"
            disabled={
              loading ||
              completedQuestions !== questions.length
            }
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="spinning" />
                Discovering careers...
              </>
            ) : (
              <>
                Discover My Career Matches
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <section className="results-section">
          <div className="results-heading">
            <div className="results-heading-icon">
              <Sparkles size={22} />
            </div>

            <span>YOUR DISCOVERY RESULTS</span>

            <h2>Careers worth exploring</h2>

            <p>{message}</p>
          </div>

          <div className="results-summary">
            <strong>{results.length}</strong>
            <span>
              career {results.length === 1 ? "match" : "matches"} found
              based on your profile
            </span>
          </div>

          <div className="results-grid">
            {results.map((career, index) => {
              const isSupported =
                career.career.toLowerCase() ===
                "software engineer";

              return (
                <article
                  className="career-result"
                  key={career.career}
                >
                  <div className="career-result-top">
                    <div className="career-result-title">
                      <span className="career-result-rank">
                        MATCH 0{index + 1}
                      </span>

                      <h3>{career.career}</h3>
                    </div>

                    <div className="career-match-score">
                      <strong>{career.match_score}%</strong>
                      <span>Match</span>
                    </div>
                  </div>

                  <div className="career-match-track">
                    <div
                      className="career-match-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, career.match_score)
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="career-description">
                    {career.description}
                  </p>

                  <div className="career-reasons">
                    <h4>
                      <Target size={17} />
                      Why this career matches you
                    </h4>

                    <ul>
                      {career.reasons.map((reason) => (
                        <li key={reason}>
                          <Check size={15} />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="reality-check">
                    <h4>
                      <Lightbulb size={18} />
                      Career reality check
                    </h4>

                    <p>{career.reality_check}</p>
                  </div>

                  {isSupported ? (
                    <button
                      type="button"
                      className="discover-button career-action"
                      disabled={simulationLoading}
                      onClick={() =>
                        handleStartSimulation(career.career)
                      }
                    >
                      {simulationLoading ? (
                        <>
                          <LoaderCircle
                            size={17}
                            className="spinning"
                          />
                          Starting simulation...
                        </>
                      ) : (
                        <>
                          <Play size={17} />
                          Experience This Career
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="simulation-unavailable">
                      <BriefcaseBusiness size={16} />
                      Career simulation coming soon
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <button
            type="button"
            className="discovery-back-button"
            onClick={() => {
              setResults([]);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <ArrowLeft size={16} />
            Refine my answers
          </button>
        </section>
      )}
    </main>
  );
}
