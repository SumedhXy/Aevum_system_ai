interface SurvivalScoreProps {
  score: number;
}

export default function SurvivalScore({ score }: SurvivalScoreProps) {
  const safeScore = isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        {/* Background Circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="12"
          className="text-[#141414]/5"
        />
        {/* Progress Circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="square"
          className="text-[#141414] transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black tracking-tighter leading-none">{safeScore}%</span>
        <span className="text-[8px] font-mono uppercase tracking-widest opacity-40 mt-1">Survival</span>
      </div>
    </div>
  );
}
