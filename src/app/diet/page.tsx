"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, Plus, Trash2, Droplets, RotateCcw,
  Coffee, Sun, Cloud, Moon, Cookie, Pencil, Minus, X, Settings2, Dumbbell,
  Clock, Zap, ChevronRight
} from 'lucide-react';
import FoodSearch from '@/components/FoodSearch';
import { logger } from '@/lib/logger';
import { getUserStorageItem, setUserStorageItem } from '@/lib/user-storage';
import { useToast } from '@/components/Toast';
import { getCached, setCached } from '@/lib/client-cache';

const MEAL_TYPES = [
  { key: 'breakfast', label: '早餐', icon: Coffee },
  { key: 'lunch', label: '午餐', icon: Sun },
  { key: 'dinner', label: '晚餐', icon: Cloud },
  { key: 'pre_workout', label: '练前餐', icon: Dumbbell },
  { key: 'post_workout', label: '练后餐', icon: Dumbbell },
  { key: 'snack', label: '加餐', icon: Cookie },
  { key: 'supper', label: '宵夜', icon: Moon },
];

const QUICK_FOODS = [
  { name: '煮鸡蛋', calories: 155, protein: 13, carbs: 1, fat: 11 },
  { name: '鸡胸肉', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: '米饭', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: '燕麦', calories: 389, protein: 16.9, carbs: 66, fat: 6.9 },
  { name: '香蕉', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: '牛奶', calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  { name: '蛋白粉', calories: 120, protein: 24, carbs: 3, fat: 1 },
  { name: '西兰花', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
];

const FALLBACK_GOALS = { calories: 2000, carbs: 250, protein: 150, fat: 65 };

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  const over = value > max;
  return (
    <div className="flex-1">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
        <span className={`text-xs font-bold ${over ? 'text-red-400' : 'text-foreground'}`}>{Math.round(value)}<span className="text-[9px] text-muted-foreground">/{max}</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: over ? '#ef4444' : color }} />
      </div>
    </div>
  );
}

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
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>(() => {
    const cached = getCached<{ logs: FoodLog[] }>(`diet:logs:${new Date().toISOString().split('T')[0]}`);
    return cached?.logs ?? [];
  });
  const [summary, setSummary] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
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

  const loadLogs = useCallback(async (date: string) => {
    const ck = `diet:logs:${date}`;
    const cached = getCached<{ logs: FoodLog[]; summary: any }>(ck);
    if (cached) {
      setFoodLogs(cached.logs || []);
      setSummary(cached.summary || { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
    try {
      const res = await fetch(`/api/food-logs?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setFoodLogs(data.logs || []);
        setSummary(data.summary || { calories: 0, protein: 0, carbs: 0, fat: 0 });
        setCached(ck, data);
      }
    } catch (e) {
      logger.warn('[Diet] 加载失败:', e);
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
          foodId: food.id, date: selectedDate, mealType: activeMeal, grams,
          calories: food.calories * ratio, protein: food.protein * ratio,
          carbs: food.carbs * ratio, fat: food.fat * ratio,
        }),
      });
      if (res.ok) {
        toast({ message: `已添加 ${food.name} ${grams}g`, type: 'success' });
        await loadLogs(selectedDate);
      }
    } catch (e) { logger.error('[Diet] 添加失败:', e); }
  };

  const handleQuickAdd = async (food: typeof QUICK_FOODS[0]) => {
    try {
      const res = await fetch('/api/food-logs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodId: `quick_${food.name}`, date: selectedDate, mealType: activeMeal, grams: 100,
          calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat,
        }),
      });
      if (res.ok) { toast({ message: `已添加 ${food.name}`, type: 'success' }); await loadLogs(selectedDate); }
    } catch (e) { logger.error('[Diet] 快速添加失败:', e); }
  };

  const handleRepeatLast = async () => {
    if (foodLogs.length === 0) return;
    const last = foodLogs[foodLogs.length - 1];
    try {
      const res = await fetch('/api/food-logs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodId: last.foodId, date: selectedDate, mealType: activeMeal, grams: last.servingG,
          calories: last.calories, protein: last.protein, carbs: last.carbs, fat: last.fat,
        }),
      });
      if (res.ok) { toast({ message: `已重复 ${last.food.name}`, type: 'success' }); await loadLogs(selectedDate); }
    } catch (e) { logger.error('[Diet] 重复失败:', e); }
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
      if (res.ok) { await loadLogs(selectedDate); toast({ message: `已删除 ${logToDelete?.food.name ?? '记录'}`, type: 'info' }); }
    } catch (e) { logger.error('[Diet] 删除失败:', e); toast({ message: '删除失败', type: 'error' }); }
  };

  const addWater = async (ml: number) => {
    const newCount = waterCount + ml;
    setWaterCount(newCount);
    if (userId) setUserStorageItem(userId, `water_${selectedDate}`, newCount.toString());
    try { await fetch('/api/water-logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: selectedDate, ml }) }); }
    catch {}
  };

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const dateLabel = new Date(selectedDate).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });

  // Recent foods = unique foods from logs, sorted by most recent
  const recentFoods = useMemo(() => {
    const seen = new Set<string>();
    const unique: FoodLog[] = [];
    for (const log of [...foodLogs].reverse()) {
      if (!seen.has(log.food.name)) { seen.add(log.food.name); unique.push(log); }
    }
    return unique.slice(0, 6);
  }, [foodLogs]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-sm bg-background/80 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-base font-bold">饮食记录</h1>
          <button onClick={() => { setEditGoals({ calories: String(goals.calories), carbs: String(goals.carbs), protein: String(goals.protein), fat: String(goals.fat) }); setShowGoalEditor(true); }}
            className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4 pb-24">

        {/* Date switcher */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => changeDate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-bold min-w-[100px] text-center">
            {selectedDate === new Date().toISOString().split('T')[0] ? '今天' : dateLabel}
          </span>
          <button onClick={() => changeDate(1)} className="p-2 rounded-lg hover:bg-secondary transition-colors"
            disabled={selectedDate >= new Date().toISOString().split('T')[0]}>
            <ArrowLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
          </button>
        </div>

        {/* ═══════ Instant Summary Bar ═══════ */}
        <div className="rounded-2xl p-4 bg-card border border-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">今日摄入</span>
            <span className="text-[10px] text-muted-foreground">{Math.round(summary.calories)} / {goals.calories} kcal</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <MacroBar label="热量" value={summary.calories} max={goals.calories} color="#e4e4e7" />
            <MacroBar label="碳水" value={summary.carbs} max={goals.carbs} color="#22d3ee" />
            <MacroBar label="蛋白质" value={summary.protein} max={goals.protein} color="#34d399" />
            <MacroBar label="脂肪" value={summary.fat} max={goals.fat} color="#fb923c" />
          </div>
        </div>

        {/* ═══════ Quick Actions ═══════ */}
        <div className="flex gap-2">
          <button onClick={() => setShowMealPicker(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-95 transition-all">
            <Plus className="w-4 h-4" />添加食物
          </button>
          <button onClick={handleRepeatLast} disabled={foodLogs.length === 0}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-secondary border border-border text-sm font-bold active:scale-95 transition-all disabled:opacity-40">
            <RotateCcw className="w-4 h-4" />重复
          </button>
        </div>

        {/* ═══════ Quick Add — 极速工具感 ═══════ */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground">快速添加</span>
            <span className="text-[10px] text-muted-foreground">每份100g</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            {QUICK_FOODS.map(food => (
              <button key={food.name} onClick={() => handleQuickAdd(food)}
                className="flex-shrink-0 px-3 py-2 rounded-xl bg-card border border-border text-xs font-bold active:scale-95 transition-all whitespace-nowrap">
                {food.name}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════ Recent Foods ═══════ */}
        {recentFoods.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground">最近添加</span>
              <span className="text-[10px] text-muted-foreground">点击重复</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {recentFoods.map(log => (
                <button key={`${log.food.id}-${log.id}`} onClick={() => handleSelectFood(log.food, log.servingG)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary border border-border text-xs font-medium active:scale-95 transition-all">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span>{log.food.name}</span>
                  <span className="text-[10px] text-muted-foreground">{log.servingG}g</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══════ Water ═══════ */}
        <div className="rounded-2xl p-4 bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-muted-foreground">饮水</span>
            </div>
            <span className="text-xs text-muted-foreground">{waterCount} / 2500 ml</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden mb-2">
            <div className="h-full bg-blue-500/80 rounded-full transition-all" style={{ width: `${Math.min(100, (waterCount / 2500) * 100)}%` }} />
          </div>
          <div className="flex gap-2">
            {[200, 250, 300, 500].map(ml => (
              <button key={ml} onClick={() => addWater(ml)} className="flex-1 py-2 rounded-lg bg-secondary text-xs font-bold text-foreground active:scale-95 transition-all">
                +{ml}ml
              </button>
            ))}
          </div>
        </div>

        {/* ═══════ Meal Sections ═══════ */}
        {foodLogs.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">今天还没有记录</p>
            <p className="text-xs text-muted-foreground">使用快速添加或搜索食物</p>
          </div>
        ) : (
          <div className="space-y-3">
            {MEAL_TYPES.filter(meal => foodLogs.some(l => l.mealType === meal.key)).map(meal => {
              const Icon = meal.icon;
              const logs = foodLogs.filter(l => l.mealType === meal.key);
              const mCal = logs.reduce((s, l) => s + l.calories, 0);
              const mCarbs = logs.reduce((s, l) => s + l.carbs, 0);
              const mProt = logs.reduce((s, l) => s + l.protein, 0);
              const mFat = logs.reduce((s, l) => s + l.fat, 0);
              const earliest = logs.reduce((a, b) => new Date(a.createdAt) < new Date(b.createdAt) ? a : b);
              const timeStr = new Date(earliest.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={meal.key} className="rounded-2xl bg-card border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-bold">{meal.label}</span>
                      <span className="text-[11px] text-muted-foreground">{timeStr}</span>
                    </div>
                    <button onClick={() => { setActiveMeal(meal.key); setShowFoodSearch(true); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold active:scale-95">
                      <Plus className="w-3 h-3" />添加
                    </button>
                  </div>
                  <div className="flex gap-3 px-4 py-2 border-t border-border bg-secondary/50">
                    <span className="text-xs font-bold">{Math.round(mCal)} kcal</span>
                    <span className="text-xs text-cyan-400">{mCarbs.toFixed(0)}C</span>
                    <span className="text-xs text-emerald-400">{mProt.toFixed(0)}P</span>
                    <span className="text-xs text-orange-400">{mFat.toFixed(0)}F</span>
                  </div>
                  <div className="divide-y divide-border">
                    {logs.map(log => (
                      <div key={log.id}
                        className="flex items-center gap-3 px-4 py-2.5 group cursor-pointer hover:bg-secondary/30 transition-colors"
                        onClick={() => { setEditLog(log); setEditGrams(log.servingG); }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm truncate">{log.food.name}</span>
                            <span className="text-[10px] text-muted-foreground">{log.servingG}g</span>
                          </div>
                          <div className="flex gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{Math.round(log.calories)} kcal</span>
                            <span className="text-[10px] text-cyan-500">{log.carbs.toFixed(0)}C</span>
                            <span className="text-[10px] text-emerald-500">{log.protein.toFixed(0)}P</span>
                            <span className="text-[10px] text-orange-500">{log.fat.toFixed(0)}F</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-muted-foreground transition-all" />
                          <button onClick={e => { e.stopPropagation(); handleDeleteLog(log.id); }}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Edit grams modal */}
      {editLog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <p className="text-base font-bold truncate max-w-[200px]">{editLog.food.name}</p>
                <p className="text-[11px] text-muted-foreground">修改克重</p>
              </div>
              <button onClick={() => setEditLog(null)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-2">重量 (g)</div>
                <div className="flex items-center justify-between gap-2">
                  <button onClick={() => setEditGrams(g => Math.max(1, g - 50))} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold">-50</button>
                  <button onClick={() => setEditGrams(g => Math.max(1, g - 10))} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"><Minus className="w-4 h-4 text-muted-foreground" /></button>
                  <input type="number" inputMode="numeric" value={editGrams}
                    onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 0 && v <= 5000) setEditGrams(v); }}
                    className="w-20 text-center py-2 bg-transparent border-b-2 border-border text-2xl font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <button onClick={() => setEditGrams(g => Math.min(5000, g + 10))} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"><Plus className="w-4 h-4 text-muted-foreground" /></button>
                  <button onClick={() => setEditGrams(g => Math.min(5000, g + 50))} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold">+50</button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 rounded-xl p-3 bg-secondary border border-border">
                {[ { val: Math.round(editLog.food.calories * editGrams / 100), label: '千卡' },
                  { val: (editLog.food.carbs * editGrams / 100).toFixed(1), label: '碳水', color: 'text-cyan-400' },
                  { val: (editLog.food.protein * editGrams / 100).toFixed(1), label: '蛋白质', color: 'text-emerald-400' },
                  { val: (editLog.food.fat * editGrams / 100).toFixed(1), label: '脂肪', color: 'text-orange-400' },
                ].map(({ val, label, color }) => (
                  <div key={label} className="text-center">
                    <div className={`text-sm font-bold ${color || ''}`}>{val}</div>
                    <div className="text-[10px] text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditLog(null)} className="flex-1 py-3 rounded-xl text-sm font-bold border border-border bg-card text-foreground">取消</button>
                <button onClick={handleEditLog} disabled={editSaving} className="flex-1 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground disabled:opacity-50 active:scale-95 transition-all">
                  {editSaving ? '保存中…' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal picker */}
      {showMealPicker && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-base font-bold">选择餐次</span>
              <button onClick={() => setShowMealPicker(false)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-3 space-y-1">
              {MEAL_TYPES.map(meal => {
                const Icon = meal.icon;
                const hasLogs = foodLogs.some(l => l.mealType === meal.key);
                return (
                  <button key={meal.key} onClick={() => { setActiveMeal(meal.key); setShowMealPicker(false); setShowFoodSearch(true); }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{meal.label}</span>
                    </div>
                    {hasLogs ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">已有记录</span> : <Plus className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Goal editor */}
      {showGoalEditor && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-base font-bold">设置营养目标</span>
              <button onClick={() => setShowGoalEditor(false)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">热量目标 (kcal)</label>
                <input type="text" inputMode="numeric" value={editGoals.calories}
                  onChange={e => setEditGoals(prev => ({ ...prev, calories: e.target.value }))}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm" />
              </div>
              {([ { key: 'carbs' as const, label: '碳水目标' }, { key: 'protein' as const, label: '蛋白质目标' }, { key: 'fat' as const, label: '脂肪目标' }, ]).map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground">{label} (g)</label>
                  <input type="text" inputMode="decimal" value={editGoals[key]}
                    onChange={e => updateGoalMacro(key, e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm" />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowGoalEditor(false)} className="flex-1 py-3 rounded-xl text-sm font-bold border border-border bg-card">取消</button>
                <button onClick={saveGoals} className="flex-1 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground active:scale-95 transition-all">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FoodSearch */}
      <FoodSearch isOpen={showFoodSearch} onClose={() => setShowFoodSearch(false)} onSelectFood={handleSelectFood} todaySummary={summary} userId={userId} />
    </div>
  );
}