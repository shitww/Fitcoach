"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, Flame, Check, SkipForward } from "lucide-react";

// ── 训练部位 → DB muscleGroup 映射 ─────────────────────────────────────────
const TRAINING_GROUPS: {
  key: string;
  label: string;
  emoji: string;
  color: string;
  hex: string;
  dbGroups: string[];
}[] = [
  { key: "chest",     label: "胸部", emoji: "胸", color: "bg-rose-500/20 text-rose-400 border-rose-500/30",     hex: "var(--accent)", dbGroups: ["chest"] },
  { key: "back",      label: "背部", emoji: "背", color: "bg-blue-500/20 text-blue-400 border-blue-500/30",     hex: "var(--accent)", dbGroups: ["lats", "middle back", "lower back"] },
  { key: "shoulders", label: "肩部", emoji: "肩", color: "bg-violet-500/20 text-violet-400 border-violet-500/30", hex: "var(--accent)", dbGroups: ["shoulders"] },
  { key: "arms",      label: "手臂", emoji: "臂", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", hex: "var(--accent)", dbGroups: ["biceps", "triceps", "forearms"] },
  { key: "legs",      label: "腿部", emoji: "腿", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", hex: "var(--accent)", dbGroups: ["quadriceps", "hamstrings", "glutes", "calves"] },
  { key: "abs",       label: "腹部", emoji: "腹", color: "bg-orange-500/20 text-orange-400 border-orange-500/30",  hex: "var(--accent)", dbGroups: ["abdominals"] },
  { key: "fullbody",  label: "全身", emoji: "全", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",      hex: "var(--accent)", dbGroups: ["chest", "lats", "quadriceps", "hamstrings", "shoulders", "abdominals"] },
];

// 每个训练部位取几条热身动作
const PER_GROUP_LIMIT = 3;

interface WarmupExercise {
  id: string;
  name: string;
  muscleGroup: string;
  groupLabel: string;
  groupColor: string;
}

interface WarmupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWarmup: (exercises: string[]) => void;
  /** 已从计划预加载的训练部位（英文key），传入时跳过第一步 */
  preselectedGroups?: string[];
}

export default function WarmupGuideModal({
  isOpen,
  onClose,
  onAddWarmup,
  preselectedGroups,
}: WarmupGuideModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(preselectedGroups ?? []);
  const [warmupExercises, setWarmupExercises] = useState<WarmupExercise[]>([]);
  const [checkedExercises, setCheckedExercises] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // 预选了部位直接进第2步
  useEffect(() => {
    if (isOpen && preselectedGroups && preselectedGroups.length > 0) {
      setSelectedGroups(preselectedGroups);
      fetchWarmup(preselectedGroups);
    } else if (isOpen) {
      setStep(1);
      setSelectedGroups([]);
      setWarmupExercises([]);
      setCheckedExercises(new Set());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const toggleGroup = (key: string) => {
    setSelectedGroups(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const fetchWarmup = async (groups: string[]) => {
    setLoading(true);
    try {
      // 收集所有需要的 DB muscleGroup
      const dbGroups = new Set<string>();
      groups.forEach(key => {
        const g = TRAINING_GROUPS.find(t => t.key === key);
        g?.dbGroups.forEach(dg => dbGroups.add(dg));
      });

      // 拉取所有拉伸动作
      const res = await fetch("/api/exercises?category=stretching");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const allStretches: any[] = data.exercises || [];

      // 按训练部位分桶，每桶取 PER_GROUP_LIMIT 条，优先有名的动作
      const result: WarmupExercise[] = [];
      const seenNames = new Set<string>();

      for (const g of groups) {
        const config = TRAINING_GROUPS.find(t => t.key === g);
        if (!config) continue;

        const bucket = allStretches
          .filter(e => config.dbGroups.includes(e.muscleGroup))
          .slice(0, PER_GROUP_LIMIT);

        for (const ex of bucket) {
          if (seenNames.has(ex.name)) continue;
          seenNames.add(ex.name);
          result.push({
            id: ex.id,
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            groupLabel: config.label,
            groupColor: config.hex,
          });
        }
      }

      setWarmupExercises(result);
      setCheckedExercises(new Set(result.map(e => e.name)));
      setStep(2);
    } catch (e) {
      console.error("加载热身动作失败:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (selectedGroups.length === 0) return;
    fetchWarmup(selectedGroups);
  };

  const handleConfirm = () => {
    onAddWarmup(Array.from(checkedExercises));
    onClose();
  };

  const toggleCheck = (name: string) => {
    setCheckedExercises(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden flex flex-col"
        style={{ background: "var(--surface)", border: "1px solid rgb(var(--border))", maxHeight: "85vh" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0"
          style={{ borderBottom: "1px solid rgb(var(--border))" }}
        >
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-black text-foreground">
              {step === 1 ? "今天练什么部位？" : "推荐热身动作"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-secondary"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Step 1 — 选部位 */}
        {step === 1 && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <p className="px-5 pt-4 pb-2 text-sm text-muted-foreground">
              选择今天的训练部位，系统自动推荐对应热身拉伸动作
            </p>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="grid grid-cols-3 gap-3 pt-2">
                {TRAINING_GROUPS.map(g => {
                  const active = selectedGroups.includes(g.key);
                  return (
                    <button
                      key={g.key}
                      onClick={() => toggleGroup(g.key)}
                      className={`rounded-2xl py-4 flex flex-col items-center gap-2 border transition-all ${
                        active
                          ? `bg-${g.hex}/20 text-${g.hex} border-${g.hex}/30`
                          : "bg-card text-muted-foreground border-border"
                      }`}
                    >
                      <span className="text-2xl font-black" style={{ color: active ? g.hex : "var(--text-low)" }}>
                        {g.emoji}
                      </span>
                      <span className="text-xs font-bold">{g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="px-5 pb-6 pt-2 shrink-0 flex gap-3 border-t border-border">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl py-3.5 text-sm font-bold text-muted-foreground bg-card"
              >
                跳过热身
              </button>
              <button
                onClick={handleNext}
                disabled={selectedGroups.length === 0 || loading}
                className="flex-1 rounded-2xl py-3.5 text-sm font-black text-primary-foreground flex items-center justify-center gap-1.5 transition-opacity disabled:opacity-60"
                style={{ background: "var(--accent)" }}
              >
                {loading ? "加载中…" : (
                  <>下一步 <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — 推荐热身 */}
        {step === 2 && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <p className="px-5 pt-3 pb-1 text-xs text-muted-foreground">
              勾选想加入训练的热身动作，建议各部位做 5–10 分钟
            </p>
            <div className="flex-1 overflow-y-auto px-5 pb-2">
              {warmupExercises.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">暂无对应拉伸动作</p>
              ) : (
                <div className="space-y-2 pt-2">
                  {warmupExercises.map(ex => {
                    const checked = checkedExercises.has(ex.name);
                    return (
                      <button
                        key={ex.id}
                        onClick={() => toggleCheck(ex.name)}
                        className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
                        style={{
                          background: checked ? "var(--accent-dim)" : "rgb(var(--secondary))",
                          border: `1px solid ${checked ? "var(--accent-glow)" : "rgb(var(--border))"}`,
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                          style={{
                            background: checked ? "var(--accent)" : "transparent",
                            border: `1.5px solid ${checked ? "var(--accent)" : "rgb(var(--muted-foreground))"}`,
                          }}
                        >
                          {checked && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{ex.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: ex.groupColor }}>
                            {ex.groupLabel} · 拉伸
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-5 pb-6 pt-3 shrink-0 flex gap-3 border-t border-border">
              <button
                onClick={() => setStep(1)}
                className="px-4 rounded-2xl py-3.5 text-sm font-bold text-muted-foreground bg-card"
              >
                返回
              </button>
              <button
                onClick={() => { onAddWarmup([]); onClose(); }}
                className="px-4 rounded-2xl py-3.5 text-sm font-bold text-muted-foreground flex items-center gap-1"
              >
                <SkipForward className="w-4 h-4" /> 跳过
              </button>
              <button
                onClick={handleConfirm}
                disabled={checkedExercises.size === 0}
                className="flex-1 rounded-2xl py-3.5 text-sm font-black text-primary-foreground disabled:opacity-60 transition-opacity"
                style={{ background: "var(--accent)" }}
              >
                加入训练 ({checkedExercises.size})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
