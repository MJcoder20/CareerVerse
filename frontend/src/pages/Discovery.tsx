
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { discoveryService } from "../services/discovery";
import { simulationService } from "../services/simulation";
import type {
  DiscoveryRequest,
  CareerRecommendation,
} from "../types/discovery";

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
      <nav className="discovery-nav">
        <h2 onClick={() => navigate("/dashboard")}>
          CareerVerse
        </h2>

        <button onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>
      </nav>

      <section className="discovery-header">
        <span>CAREER DISCOVERY ENGINE</span>
        <h1>Discover possibilities.</h1>
        <p>
          Tell us about yourself. We'll identify careers worth
          exploring based on your interests, strengths, and priorities.
        </p>
      </section>

      <form className="discovery-form" onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <section className="question-card" key={question.key}>
            <div className="question-number">
              STEP 0{index + 1}
            </div>

            <h2>{question.title}</h2>
            <p>{question.subtitle}</p>

            <div className="option-grid">
              {question.options.map(([value, label]) => {
                const category = question.key as Category;
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
                    <span>{label}</span>
                  </label>
                );
              })}
            </div>
          </section>
        ))}

        {error && (
          <div className="error-message">{error}</div>
        )}

        <button
          className="discover-button"
          type="submit"
          disabled={
            loading ||
            Object.values(answers).some(
              (values) => values.length === 0
            )
          }
        >
          {loading
            ? "Discovering careers..."
            : "Discover My Career Matches"}
        </button>
      </form>

      {results.length > 0 && (
        <section className="results-section">
          <span>YOUR DISCOVERY RESULTS</span>
          <h2>Careers worth exploring</h2>
          <p>{message}</p>

          <div className="results-grid">
            {results.map((career) => {
              const isSupported =
                career.career.toLowerCase() ===
                "software engineer";

              return (
                <article
                  className="career-result"
                  key={career.career}
                >
                  <div className="career-result-top">
                    <h3>{career.career}</h3>
                    <span>
                      {career.match_score}% alignment
                    </span>
                  </div>

                  <p>{career.description}</p>

                  <h4>Why it appeared</h4>
                  <ul>
                    {career.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>

                  <div className="reality-check">
                    <strong>Career reality check</strong>
                    <p>{career.reality_check}</p>
                  </div>

                  {isSupported ? (
                    <button
                      type="button"
                      className="discover-button"
                      disabled={simulationLoading}
                      onClick={() =>
                        handleStartSimulation(career.career)
                      }
                    >
                      {simulationLoading
                        ? "Starting simulation..."
                        : "Experience This Career"}
                    </button>
                  ) : (
                    <p className="simulation-unavailable">
                      Career simulation coming soon.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
