import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import {
  careerCoachService,
  type CareerCoachResponse,
} from "../services/careerCoach";

function CareerCoach() {
  const [data, setData] = useState<CareerCoachResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await careerCoachService.getInsights();
      setData(result);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your career coaching insights."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="cv-dashboard">
      <main className="cv-main">
        <div className="cv-content">
          <div className="cv-page-heading">
            <div>
              <span className="cv-section-kicker">AI CAREER COACH</span>
              <h1>Your personalized career guidance</h1>
              <p>
                Get actionable advice based on your assessment results and
                career progress.
              </p>
            </div>

            <button
              className="cv-primary-button"
              onClick={fetchInsights}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh insights
            </button>
          </div>

          {loading && (
            <div className="cv-panel">
              <p>Analyzing your career progress...</p>
            </div>
          )}

          {!loading && error && (
            <div className="cv-panel">
              <AlertCircle size={20} />
              <p>{error}</p>
              <button
                className="cv-primary-button"
                onClick={fetchInsights}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && data && (
            <>
              <div className="cv-panel">
                <div className="cv-panel-heading">
                  <div>
                    <span className="cv-section-kicker">
                      YOUR CAREER TARGET
                    </span>
                    <h2>{data.career_role}</h2>
                  </div>
                  <Sparkles size={24} />
                </div>

                <div className="cv-stats-grid">
                  <div>
                    <h3>{data.assessment_count}</h3>
                    <p>Assessments</p>
                  </div>

                  <div>
                    <h3>{data.completed_simulations}</h3>
                    <p>Completed simulations</p>
                  </div>

                  <div>
                    <h3>{data.current_xp}</h3>
                    <p>Current XP</p>
                  </div>
                </div>
              </div>

              <div className="cv-panel">
                <div className="cv-panel-heading">
                  <div>
                    <span className="cv-section-kicker">
                      PERSONALIZED GUIDANCE
                    </span>
                    <h2>Your AI career coaching report</h2>
                  </div>
                  <Sparkles size={22} />
                </div>

                <div className="cv-coaching-content">
                  {data.coaching}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default CareerCoach;