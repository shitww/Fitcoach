"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, Play } from "lucide-react";

export type TrainingType = "strength" | "treadmill" | "stairclimber" | "free";

export interface CardioParams {
  speed: number;
  incline: number;
  level: number;
}

const CARDIO_MACHINES: {
  key: Exclude<TrainingType, "strength">;
  icon: string;
  label: string;
  desc: string;
}[] = [
  { key: "treadmill",    icon: "🏃", label: "跑步机",       desc: "设置速度和坡度，自动计算距离与卡路里" },
  { key: "stairclimber", icon: "🧗", label: "爬楼机 / 踏步机", desc: "设置档位，自动估算卡路里" },
];

interface TrainingTypeModalProps {
  isOpen: boolean;
  initialStep?: "main" | "cardio";
  onSelect: (type: TrainingType, params?: CardioParams) => void;
  onClose: () => void;
}

export default function TrainingTypeModal({ isOpen, initialStep = "main", onSelect, onClose }: TrainingTypeModalProps) {
  const [step, setStep] = useState<"main" | "cardio">(initialStep);

  useEffect(() => { if (isOpen) setStep(initialStep); }, [isOpen, initialStep]);
  const [selectedMachine, setSelectedMachine] = useState<Exclude<TrainingType, "strength" | "free"> | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep("main"); setSelectedMachine(null);
    onClose();
  };

  const handleStart = () => {
    if (!selectedMachine) return;
    onSelect(selectedMachine, { speed: 0, incline: 0, level: 0 });
    setStep("main"); setSelectedMachine(null);
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-background/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl overflow-hidden flex flex-col bg-card border border-border">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            {step === "cardio" && (
              <button onClick={() => { setStep("main"); setSelectedMachine(null); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center mr-1 bg-secondary">
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <div>
              <h2 className="text-base font-black text-foreground">
                {step === "main" ? "今天练什么？" : "有氧训练"}
              </h2>
              <p className="text-xs mt-0.5 text-muted-foreground">
                {step === "main" ? "选择训练类型" : "选择器材并设置参数"}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-xl flex items-center justify-center bg-secondary">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* ── Step 1: 力量 vs 有氧 ── */}
        {step === "main" && (
          <div className="p-4 space-y-3">
            <button onClick={() => onSelect("strength")}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all active:scale-[0.98]"
              style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-glow)" }}>
              <span className="text-3xl">💪</span>
              <div>
                <p className="text-sm font-black text-foreground">力量训练</p>
                <p className="text-xs mt-0.5 text-muted-foreground">组数 · 次数 · 重量 · RIR</p>
              </div>
            </button>
            <button onClick={() => setStep("cardio")}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all active:scale-[0.98] bg-primary/5 border border-primary/20">
              <span className="text-3xl">🏃</span>
              <div>
                <p className="text-sm font-black text-foreground">有氧训练</p>
                <p className="text-xs mt-0.5 text-muted-foreground">跑步机 · 爬楼机 · 自动计算消耗</p>
              </div>
            </button>
          </div>
        )}

        {/* ── Step 2: 器材选择 ── */}
        {step === "cardio" && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {CARDIO_MACHINES.map(m => (
                <button key={m.key} onClick={() => setSelectedMachine(m.key as "treadmill" | "stairclimber")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all active:scale-[0.97] border ${
                    selectedMachine === m.key
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-secondary border-border'
                  }`}>
                  <span className="text-3xl">{m.icon}</span>
                  <p className="text-xs font-bold text-foreground text-center leading-tight">{m.label}</p>
                  <p className="text-xs text-center text-muted-foreground">{m.desc}</p>
                </button>
              ))}
            </div>

            <button onClick={handleStart}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all ${
                selectedMachine
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
              disabled={!selectedMachine}>
              <Play className="w-4 h-4" />
              开始有氧训练
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

