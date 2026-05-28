"use client";

interface InstantShellProps {
  onStart: (query?: string) => void;
}

function getRecentExercises(): string[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("fc_recent_exercises") : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return ["卧推", "深蹲", "硬拉", "引体向上", "哑铃弯举"];
}

const MUSCLE_MAP: Record<string, string> = {
  "胸部": "chest",
  "背部": "back",
  "腿部": "legs",
  "肩部": "shoulders",
  "手臂": "arms",
  "腹部": "abs",
};

export default function InstantShell({ onStart }: InstantShellProps) {
  const recent = getRecentExercises();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="relative flex flex-col flex-1 px-4 pt-5 pb-8 sm:max-w-sm md:max-w-md mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-secondary border border-border">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black">开始训练</h1>
            <p className="text-xs mt-0.5 text-muted-foreground">
              选择动作直接记录，无需等待
            </p>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => onStart("mode=strength")}
          className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] bg-primary text-primary-foreground mb-6"
        >
          <span>💪</span>
          开始训练
        </button>

        {/* Recent exercises */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-muted-foreground mb-3">最近动作</h2>
          <div className="grid grid-cols-3 gap-2">
            {recent.map((ex) => (
              <button
                key={ex}
                onClick={() => onStart("mode=strength")}
                className="rounded-xl py-3 px-2 text-xs font-bold text-center transition-all active:scale-95 bg-secondary border border-border"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Quick muscle grid */}
        <div className="flex-1">
          <h2 className="text-sm font-bold text-muted-foreground mb-3">快速选择</h2>
          <div className="grid grid-cols-4 gap-2">
            {["胸部", "背部", "腿部", "肩部", "手臂", "腹部", "有氧", "自由"].map((g) => {
              const query = MUSCLE_MAP[g]
                ? `mg=${MUSCLE_MAP[g]}`
                : g === "有氧"
                ? "mode=cardio&cardioType=treadmill"
                : "mode=recovery&focus=full_body";
              return (
                <button
                  key={g}
                  onClick={() => onStart(query)}
                  className="rounded-xl py-3 flex flex-col items-center gap-1 transition-all active:scale-95 bg-primary/10 text-primary border border-primary/20"
                >
                  <span className="text-lg">
                    {g === "胸部" ? "胸" : g === "背部" ? "背" : g === "腿部" ? "腿" : g === "肩部" ? "肩" : g === "手臂" ? "臂" : g === "腹部" ? "腹" : g === "有氧" ? "🏃" : "📝"}
                  </span>
                  <span className="text-[10px] font-bold">{g}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
