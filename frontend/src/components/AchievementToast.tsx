
import { useEffect } from "react";
import { Trophy, X, Zap } from "lucide-react";

export interface AchievementToastData {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
}

interface AchievementToastProps {
  achievement: AchievementToastData;
  onDismiss: (id: string) => void;
}

export default function AchievementToast({
  achievement,
  onDismiss,
}: AchievementToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismiss(achievement.id);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [achievement.id, onDismiss]);

  return (
    <div className="achievement-toast" role="status">
      <div className="achievement-toast-icon">
        <Trophy size={24} />
      </div>

      <div className="achievement-toast-content">
        <span className="achievement-toast-label">
          Achievement Unlocked!
        </span>

        <strong>{achievement.title}</strong>

        <p>{achievement.description}</p>

        <span className="achievement-toast-xp">
          <Zap size={15} />
          +{achievement.xp_reward} XP
        </span>
      </div>

      <button
        className="achievement-toast-close"
        onClick={() => onDismiss(achievement.id)}
        aria-label="Dismiss notification"
      >
        <X size={18} />
      </button>
    </div>
  );
}
