"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Plus, Trash2, Droplets,
  Coffee, Sun, Cloud, Moon, Cookie, Pencil, Minus, X, Settings2, Dumbbell
} from 'lucide-react';
import FoodSearch from '@/components/FoodSearch';
import { logger } from '@/lib/logger';
import { getUserStorageItem, setUserStorageItem } from '@/lib/user-storage';
import { useToast } from '@/components/Toast';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonRingRow, SkeletonList } from '@/components/Skeleton';
import { useTheme } from '@/contexts/ThemeContext';

const MEAL_TYPES = [
  { key: 'breakfast', label: '早餐', icon: Coffee },
  { key: 'lunch', label: '午餐', icon: Sun },
  { key: 'dinner', label: '晚餐', icon: Cloud },
  { key: 'pre_workout', label: '练前餐', icon: Dumbbell },
  { key: 'post_workout', label: '练后餐', icon: Dumbbell },
  { key: 'snack', label: '加餐', icon: Cookie },
  { key: 'supper', label: '宵夜', icon: Moon },
];

const FALLBACK_GOALS = { calories: 2000, carbs: 250, protein: 150, fat: 65 };

interface Goals { calories: number; carbs: number; protein: number; fat: number; }
type GoalInputs = { calories: string; carbs: string; protein: string; fat: string; }

function RingProgress({ value, max, color, label, themeColors }: { value: number; max: number; color: string; label: string; themeColors: { border: string; text: string; textMuted: string; textSec: string } }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, max > 0 ? value / max : 0);
  const over = value > max;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg width="70" height="70" viewBox="0 0 70 70">
          <circle cx="35" cy="35" r={r} fill="none" stroke={themeColors.border} strokeWidth="6" />
          <circle cx="35" cy="35" r={r} fill="none"
            stroke={over ? 'var(--error)' : color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
            strokeLinecap="round" transform="rotate(-90 35 35)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold leading-none" style={{ color: themeColors.text }}>{Math.round(value)}</span>
          <span className="text-[9px]" style={{ color: themeColors.textMuted }}>/{max}</span>
        </div>
      </div>
      <span className="text-[10px] text-center" style={{ color: themeColors.textSec }}>{label}</span>
    </div>
  );
}

interface FoodLog {
  id: string;
  foodId: string;
  date: string;
  mealType: string;
  serving: number;
  servingG: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
  food: {
    id: string;
    name: string;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DaySummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function DietPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id || '';
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [activeMeal, setActiveMeal] = useState('breakfast');
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [summary, setSummary] = useState<DaySummary>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(true);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [waterCount, setWaterCount] = useState(0);
  const [editLog, setEditLog] = useState<FoodLog | null>(null);
  const [editGrams, setEditGrams] = useState(100);
  const [editSaving, setEditSaving] = useState(false);
  const [goals, setGoals] = useState<Goals>(FALLBACK_GOALS);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [editGoals, setEditGoals] = useState<GoalInputs>({ calories: '2000', carbs: '250', protein: '150', fat: '65' });
  const [showMealPicker, setShowMealPicker] = useState(false);
  const { toast } = useToast();
  const { t } = useTheme();

  const loadLogs = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/food-logs?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setFoodLogs(data.logs || []);
        setSummary(data.summary || { calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    } catch (e) {
      logger.warn('[Diet] 加载失败:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch('/api/nutrition-goals', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          const g: Goals = { calories: data.targetCalories, carbs: data.targetCarbs, protein: data.targetProtein, fat: data.targetFat };
          setGoals(g);
          setEditGoals({ calories: String(g.calories), carbs: String(g.carbs), protein: String(g.protein), fat: String(g.fat) });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadLogs(selectedDate);
    const savedWater = userId ? getUserStorageItem(userId, `water_${selectedDate}`) : null;
    if (savedWater) setWaterCount(parseInt(savedWater, 10) || 0);
    else setWaterCount(0);
  }, [selectedDate, loadLogs]);

  const saveGoals = async () => {
    const parsed: Goals = {
      calories: parseFloat(editGoals.calories) || 0,
      carbs: parseFloat(editGoals.carbs) || 0,
      protein: parseFloat(editGoals.protein) || 0,
      fat: parseFloat(editGoals.fat) || 0,
    };
    setGoals(parsed);
    setShowGoalEditor(false);
    try {
      await fetch('/api/nutrition-goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetCalories: parsed.calories, targetCarbs: parsed.carbs, targetProtein: parsed.protein, targetFat: parsed.fat }),
      });
    } catch (e) {
      logger.warn('[Diet] 保存目标失败:', e);
    }
  };

  const updateGoalMacro = (key: 'carbs' | 'protein' | 'fat', val: string) => {
    const c = parseFloat(key === 'carbs' ? val : editGoals.carbs) || 0;
    const p = parseFloat(key === 'protein' ? val : editGoals.protein) || 0;
    const f = parseFloat(key === 'fat' ? val : editGoals.fat) || 0;
    setEditGoals(prev => ({ ...prev, [key]: val, calories: String(Math.round(c * 4 + p * 4 + f * 9)) }));
  };

  const handleSelectFood = async (food: FoodItem, grams: number) => {
    try {
      const ratio = grams / 100;
      const res = await fetch('/api/food-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodId: food.id,
          date: selectedDate,
          mealType: activeMeal,
          grams,
          calories: food.calories * ratio,
          protein: food.protein * ratio,
          carbs: food.carbs * ratio,
          fat: food.fat * ratio,
        }),
      });
      if (res.ok) {
        toast({ message: `已添加 ${food.name} ${grams}g · ${Math.round(food.calories * ratio)} kcal`, type: 'success' });
        await loadLogs(selectedDate);
      }
    } catch (e) {
      logger.error('[Diet] 添加失败:', e);
    }
  };

  const handleEditLog = async () => {
    if (!editLog || editGrams <= 0) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/food-logs/${editLog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grams: editGrams }),
      });
      if (res.ok) {
        toast({ message: `已更新 ${editLog.food.name} → ${editGrams}g`, type: 'success' });
        setEditLog(null);
        await loadLogs(selectedDate);
      }
    } catch (e) {
      logger.error('[Diet] 编辑失败:', e);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    const logToDelete = foodLogs.find(l => l.id === logId);
    try {
      const res = await fetch(`/api/food-logs/${logId}`, { method: 'DELETE' });
      if (res.ok) {
        await loadLogs(selectedDate);
        toast({
          message: `已删除 ${logToDelete?.food.name ?? '记录'}`,
          type: 'info',
          duration: 3500,
          undoLabel: '撤销',
          onUndo: async () => {
            if (!logToDelete) return;
            await handleSelectFood(logToDelete.food, logToDelete.servingG);
          },
        });
      }
    } catch (e) {
      logger.error('[Diet] 删除失败:', e);
      toast({ message: '删除失败，请重试', type: 'error' });
    }
  };

  const addWater = async (ml: number) => {
    const newCount = waterCount + ml;
    setWaterCount(newCount);
    if (userId) setUserStorageItem(userId, `water_${selectedDate}`, newCount.toString());
    try {
      await fetch('/api/water-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, ml }),
      });
    } catch {}
  };

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const dateLabel = new Date(selectedDate).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });

  return (
    <div className="min-h-screen" style={{ background: t.bg, color: t.text }}>
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 backdrop-blur-sm border-b" style={{ background: t.topBg, borderColor: t.border }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5" style={{ color: t.textSec }} />
          </button>
          <h1 className="text-base font-semibold">饮食记录</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">

        {/* 日期选择 */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => changeDate(-1)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-4 h-4" style={{ color: t.textSec }} />
          </button>
          <span className="text-sm font-medium min-w-[100px] text-center" style={{ color: t.textSec }}>
            {selectedDate === new Date().toISOString().split('T')[0] ? '今天' : dateLabel}
          </span>
          <button onClick={() => changeDate(1)} className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            disabled={selectedDate >= new Date().toISOString().split('T')[0]}>
            <ArrowLeft className="w-4 h-4 rotate-180" style={{ color: t.textSec }} />
          </button>
        </div>

        {/* 营养摄入目标 — 图圈进度 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 border" style={{ background: t.surface, borderColor: t.border }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: t.text }}>营养摄入目标</span>
            <button onClick={() => { setEditGoals({ calories: String(goals.calories), carbs: String(goals.carbs), protein: String(goals.protein), fat: String(goals.fat) }); setShowGoalEditor(true); }}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <Settings2 className="w-4 h-4" style={{ color: t.textMuted }} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            <RingProgress value={summary.calories} max={goals.calories} color="#e4e4e7" label="热量(kcal)" themeColors={{ border: t.border, text: t.text, textMuted: t.textMuted, textSec: t.textSec }} />
            <RingProgress value={summary.carbs} max={goals.carbs} color="#22d3ee" label="碳水(g)" themeColors={{ border: t.border, text: t.text, textMuted: t.textMuted, textSec: t.textSec }} />
            <RingProgress value={summary.protein} max={goals.protein} color="#34d399" label="蛋白质(g)" themeColors={{ border: t.border, text: t.text, textMuted: t.textMuted, textSec: t.textSec }} />
            <RingProgress value={summary.fat} max={goals.fat} color="#fb923c" label="脂肪(g)" themeColors={{ border: t.border, text: t.text, textMuted: t.textMuted, textSec: t.textSec }} />
          </div>
        </motion.div>

        {/* 饮水追踪 */}
        <div className="rounded-2xl p-4 border" style={{ background: t.surface, borderColor: t.border }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium" style={{ color: t.textSec }}>饮水</span>
            </div>
            <span className="text-xs" style={{ color: t.textMuted }}>{waterCount} ml / 2500 ml</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: t.surface2 }}>
            <div className="h-full bg-blue-500/80 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (waterCount / 2500) * 100)}%` }} />
          </div>
          <div className="flex gap-2">
            {[200, 250, 300, 500].map((ml) => (
              <button key={ml} onClick={() => addWater(ml)}
                className="flex-1 py-2 rounded-lg hover:bg-white/5 text-xs transition-colors"
                style={{ background: t.surface2, color: t.textSec }}>
                +{ml}ml
              </button>
            ))}
          </div>
        </div>

        {/* 各餐 sections — 仅显示已有记录的餐次 */}
        {loading ? (
          <SkeletonList rows={4} />
        ) : foodLogs.length === 0 ? (
          <EmptyState
            icon={
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
                <path d="M24 6C15.163 6 8 13.163 8 22s7.163 16 16 16 16-7.163 16-16S32.837 6 24 6z"/>
                <path d="M16 22h16M24 14v16"/>
              </svg>
            }
            title="今天还没有记录饮食"
            description="记录每一餐，让 AI 为你分析营养缺口并给出补充建议"
            action={{ label: '记录第一餐', onClick: () => setShowMealPicker(true) }}
          />
        ) : (
          <>
          {MEAL_TYPES.filter(meal => foodLogs.some(l => l.mealType === meal.key)).map((meal) => {
            const Icon = meal.icon;
            const logs = foodLogs.filter(l => l.mealType === meal.key);
            const mCal = logs.reduce((s, l) => s + l.calories, 0);
            const mCarbs = logs.reduce((s, l) => s + l.carbs, 0);
            const mProt = logs.reduce((s, l) => s + l.protein, 0);
            const mFat = logs.reduce((s, l) => s + l.fat, 0);
            const earliest = logs.reduce((a, b) =>
              new Date(a.createdAt) < new Date(b.createdAt) ? a : b
            );
            const timeStr = new Date(earliest.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={meal.key} className="rounded-2xl border overflow-hidden" style={{ background: t.surface, borderColor: t.border }}>
                {/* 餐次标题行 */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: t.textMuted }} />
                    <span className="text-sm font-semibold" style={{ color: t.text }}>{meal.label}</span>
                    <span className="text-[11px]" style={{ color: t.textMuted }}>({timeStr})</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: t.surface2, color: t.textSec }}>{logs.length}</span>
                  </div>
                  <button
                    onClick={() => { setActiveMeal(meal.key); setShowFoodSearch(true); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                    style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                  >
                    <Plus className="w-3 h-3" />添加
                  </button>
                </div>

                {/* 本餐合计 */}
                {logs.length > 0 && (
                  <div className="flex gap-4 px-4 py-2 border-t" style={{ borderColor: t.border, background: t.surface3 }}>
                    <span className="text-xs font-medium" style={{ color: t.text }}>{Math.round(mCal)} kcal</span>
                    <span className="text-xs text-cyan-400">{mCarbs.toFixed(1)}C</span>
                    <span className="text-xs text-emerald-400">{mProt.toFixed(1)}P</span>
                    <span className="text-xs text-orange-400">{mFat.toFixed(1)}F</span>
                  </div>
                )}

                {/* 食物列表 */}
                {logs.length > 0 && (
                  <div className="divide-y" style={{ borderColor: t.border }}>
                    {logs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 px-4 py-3 group cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => { setEditLog(log); setEditGrams(log.servingG); }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm truncate" style={{ color: t.text }}>{log.food.name}</span>
                            <span className="text-[10px] flex-shrink-0" style={{ color: t.textMuted }}>{log.servingG}g</span>
                          </div>
                          <div className="flex gap-3 mt-0.5">
                            <span className="text-[10px]" style={{ color: t.textMuted }}>{Math.round(log.calories)} kcal</span>
                            <span className="text-[10px] text-cyan-500">{log.carbs.toFixed(1)}C</span>
                            <span className="text-[10px] text-emerald-500">{log.protein.toFixed(1)}P</span>
                            <span className="text-[10px] text-orange-500">{log.fat.toFixed(1)}F</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" style={{ color: t.textMuted }} />
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteLog(log.id); }}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* 添加下一餐按钮 */}
          <button
            onClick={() => setShowMealPicker(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed hover:border-white/20 transition-all active:scale-[0.98] text-sm font-medium"
            style={{ borderColor: t.border, color: t.textSec }}
          >
            <Plus className="w-4 h-4" />
            添加下一餐
          </button>
          </>
        )}

      </div>

      {/* 编辑食物克重弹窗 */}
      {editLog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ overscrollBehavior: 'contain' }}>
          <div className="w-full max-w-xs rounded-3xl border shadow-2xl overflow-hidden" style={{ background: t.surface, borderColor: t.border }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: t.border }}>
              <div>
                <p className="text-base font-semibold leading-tight truncate max-w-[200px]" style={{ color: t.text }}>{editLog.food.name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: t.textMuted }}>修改克重</p>
              </div>
              <button onClick={() => setEditLog(null)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-4 h-4" style={{ color: t.textMuted }} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* 克重调节 */}
              <div>
                <div className="text-xs mb-2" style={{ color: t.textSec }}>重量 (g)</div>
                <div className="flex items-center justify-between gap-2">
                  <button onClick={() => setEditGrams(g => Math.max(1, g - 50))} className="w-9 h-9 rounded-xl hover:bg-white/5 flex items-center justify-center text-xs font-medium"
                    style={{ background: t.surface2, color: t.textSec }}>-50</button>
                  <button onClick={() => setEditGrams(g => Math.max(1, g - 10))} className="w-9 h-9 rounded-xl hover:bg-white/5 flex items-center justify-center"
                    style={{ background: t.surface2 }}><Minus className="w-4 h-4" style={{ color: t.textSec }} /></button>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editGrams}
                    onChange={(e) => { const s = e.target.value; if (s === '') { setEditGrams(0); return; } const v = parseInt(s); if (!isNaN(v) && v >= 0 && v <= 5000) setEditGrams(v); }}
                    className="w-20 text-center py-2 bg-transparent border-b-2 focus:border-white text-2xl font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ borderColor: t.border, color: t.text }}
                  />
                  <button onClick={() => setEditGrams(g => Math.min(5000, g + 10))} className="w-9 h-9 rounded-xl hover:bg-white/5 flex items-center justify-center"
                    style={{ background: t.surface2 }}><Plus className="w-4 h-4" style={{ color: t.textSec }} /></button>
                  <button onClick={() => setEditGrams(g => Math.min(5000, g + 50))} className="w-9 h-9 rounded-xl hover:bg-white/5 flex items-center justify-center text-xs font-medium"
                    style={{ background: t.surface2, color: t.textSec }}>+50</button>
                </div>
              </div>
              {/* 实时预览 */}
              <div className="grid grid-cols-4 gap-2 rounded-xl p-3 border" style={{ background: t.surface, borderColor: t.border }}>
                {[{
                  val: Math.round(editLog.food.calories * editGrams / 100), label: '千卡', cls: ''
                }, {
                  val: (editLog.food.carbs * editGrams / 100).toFixed(1), label: '碳水', cls: 'text-cyan-400'
                }, {
                  val: (editLog.food.protein * editGrams / 100).toFixed(1), label: '蛋白质', cls: 'text-emerald-400'
                }, {
                  val: (editLog.food.fat * editGrams / 100).toFixed(1), label: '脂肪', cls: 'text-orange-400'
                }].map(({ val, label, cls }) => (
                  <div key={label} className="text-center">
                    <div className={`text-sm font-bold ${cls}`} style={!cls ? { color: t.text } : undefined}>{val}</div>
                    <div className="text-[10px]" style={{ color: t.textMuted }}>{label}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditLog(null)} className="flex-1 py-3 rounded-xl text-sm font-medium border hover:bg-white/5 transition-all"
                  style={{ color: t.textSec, background: t.surface, borderColor: t.border }}>取消</button>
                <button
                  onClick={handleEditLog}
                  disabled={editSaving}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{ background: 'var(--accent)', color: t.accentText }}
                >
                  {editSaving ? '保存中…' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 餐次选择弹窗 */}
      {showMealPicker && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center p-4" style={{ overscrollBehavior: 'contain' }}>
          <div className="w-full max-w-xs rounded-3xl border shadow-2xl overflow-hidden" style={{ background: t.surface, borderColor: t.border }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: t.border }}>
              <span className="text-base font-semibold" style={{ color: t.text }}>选择餐次</span>
              <button onClick={() => setShowMealPicker(false)} className="p-1.5 rounded-lg hover:bg-white/5">
                <X className="w-4 h-4" style={{ color: t.textMuted }} />
              </button>
            </div>
            <div className="p-3 space-y-1.5">
              {MEAL_TYPES.map((meal) => {
                const Icon = meal.icon;
                const hasLogs = foodLogs.some(l => l.mealType === meal.key);
                return (
                  <button
                    key={meal.key}
                    onClick={() => { setActiveMeal(meal.key); setShowMealPicker(false); setShowFoodSearch(true); }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                    style={{ background: t.surface }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" style={{ color: t.textMuted }} />
                      <span className="text-sm font-medium" style={{ color: t.text }}>{meal.label}</span>
                    </div>
                    {hasLogs ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: t.textMuted, background: t.surface2 }}>已有记录</span>
                    ) : (
                      <Plus className="w-3.5 h-3.5" style={{ color: t.textMuted }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 目标编辑弹窗 */}
      {showGoalEditor && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ overscrollBehavior: 'contain' }}>
          <div className="w-full max-w-xs rounded-3xl border shadow-2xl overflow-hidden" style={{ background: t.surface, borderColor: t.border }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: t.border }}>
              <span className="text-base font-semibold" style={{ color: t.text }}>设置营养目标</span>
              <button onClick={() => setShowGoalEditor(false)} className="p-1.5 rounded-lg hover:bg-white/5">
                <X className="w-4 h-4" style={{ color: t.textMuted }} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {/* 热量—自动计算，只读提示 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs" style={{ color: t.textSec }}>热量目标</label>
                  <span className="text-[10px]" style={{ color: t.textMuted }}>米=碳×4+蛋×4+脂×9 · kcal</span>
                </div>
                <input
                  type="text" inputMode="numeric"
                  value={editGoals.calories}
                  onChange={(e) => setEditGoals(prev => ({ ...prev, calories: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-border text-sm"
                  style={{ color: t.text, background: t.surface, borderColor: t.border }}
                />
              </div>
              {([
                { key: 'carbs' as const, label: '碳水目标', unit: 'g' },
                { key: 'protein' as const, label: '蛋白质目标', unit: 'g' },
                { key: 'fat' as const, label: '脂肪目标', unit: 'g' },
              ]).map(({ key, label, unit }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs" style={{ color: t.textSec }}>{label}</label>
                    <span className="text-[10px]" style={{ color: t.textMuted }}>{unit}</span>
                  </div>
                  <input
                    type="text" inputMode="decimal"
                    value={editGoals[key]}
                    onChange={(e) => updateGoalMacro(key, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-border text-sm"
                    style={{ color: t.text, background: t.surface, borderColor: t.border }}
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowGoalEditor(false)} className="flex-1 py-3 rounded-xl text-sm font-medium border"
                  style={{ color: t.textSec, background: t.surface, borderColor: t.border }}>取消</button>
                <button onClick={saveGoals} className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--accent)', color: t.accentText }}>保存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FoodSearch 弹窗 */}
      <FoodSearch
        isOpen={showFoodSearch}
        onClose={() => setShowFoodSearch(false)}
        onSelectFood={handleSelectFood}
        todaySummary={summary}
        userId={userId}
      />
    </div>
  );
}