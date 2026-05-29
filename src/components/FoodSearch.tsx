"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Search, X, Plus, Minus, Check, Loader2, 
  UtensilsCrossed, Fish, Leaf, Apple, Milk, Egg, 
  Coffee, Pizza, Sparkles, Pencil, ScanBarcode, Camera, AlertCircle,
  ChevronUp, ChevronDown, Trash2
} from 'lucide-react';
import { logger } from '@/lib/logger';
import { MyFoodsPanel } from '@/components/MyFoodsPanel';
import { getUserStorageItem, setUserStorageItem } from '@/lib/user-storage';

interface FoodSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodItem, grams: number) => void;
  recentFoods?: string[];
  todaySummary?: { calories: number; protein: number; carbs: number; fat: number };
  userId?: string;
}

interface FoodItem {
  id: string;
  name: string;
  nameEn?: string | null;
  category?: string | null;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
  sugar?: number | null;
  sodium?: number | null;
}

const FOOD_CATEGORIES = [
  { key: '', label: '全', icon: Sparkles },
  { key: '主食', label: '主', icon: UtensilsCrossed },
  { key: '肉禽', label: '肉', icon: UtensilsCrossed },
  { key: '水产', label: '鱼', icon: Fish },
  { key: '蔬菜', label: '菜', icon: Leaf },
  { key: '菌菇', label: '菇', icon: Leaf },
  { key: '豆制品', label: '豆', icon: Leaf },
  { key: '水果', label: '果', icon: Apple },
  { key: '坚果', label: '坚', icon: Apple },
  { key: '奶制品', label: '奶', icon: Milk },
  { key: '蛋类', label: '蛋', icon: Egg },
  { key: '饮品', label: '饮', icon: Coffee },
  { key: '速食', label: '速', icon: Pizza },
  { key: '调味料', label: '调', icon: Sparkles },
];

const getCategoryColor = (category?: string | null) => {
  switch (category) {
    case '主食': return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
    case '肉禽': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
    case '水产': return { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    case '蔬菜': return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
    case '菌菇': return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case '豆制品': return { bg: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500/30' };
    case '水果': return { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' };
    case '坚果': return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
    case '奶制品': return { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30' };
    case '蛋类': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    case '饮品': return { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' };
    case '速食': return { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' };
    case '调味料': return { bg: 'bg-muted/40', text: 'text-muted-foreground', border: 'border-border/30' };
    default: return { bg: 'bg-secondary', text: 'text-muted-foreground', border: 'border-border' };
  }
};

export default function FoodSearch({
  isOpen,
  onClose,
  onSelectFood,
  recentFoods = [],
  todaySummary,
  userId,
}: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dbFoods, setDbFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState(100);
  const [showDetail, setShowDetail] = useState(false);
  const [localRecentFoods, setLocalRecentFoods] = useState<FoodItem[]>([]);
  const [showMyFoods, setShowMyFoods] = useState(false);

  // 条码查询
  const [showBarcodeForm, setShowBarcodeForm] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState('');

  // 拍照识别
  const [showScanForm, setShowScanForm] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanMode, setScanMode] = useState<'label' | 'meal'>('label');
  const [mealResult, setMealResult] = useState<{
    foods: { name: string; quantity: number; unit: string; calories: number; protein: number; carbs: number; fat: number }[];
    combinedItem: { name: string; quantity: number; unit: string; calories: number; protein: number; carbs: number; fat: number } | null;
    totalMacros: { calories: number; protein: number; carbs: number; fat: number };
    fitnessInterpretation: string;
    mealTiming: string;
  } | null>(null);
  const [showMealResult, setShowMealResult] = useState(false);
  const [quickAddLoading, setQuickAddLoading] = useState(false);

  // 自定义食物表单
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customSaving, setCustomSaving] = useState(false);
  const [customError, setCustomError] = useState('');

  // 根据碳蛋脂自动计算热量（Atwater: 碳4 + 蛋4 + 脂9）
  useEffect(() => {
    const c = parseFloat(customCarbs) || 0;
    const p = parseFloat(customProtein) || 0;
    const f = parseFloat(customFat) || 0;
    if (c > 0 || p > 0 || f > 0) {
      setCustomCal(String(Math.round(c * 4 + p * 4 + f * 9)));
    }
  }, [customCarbs, customProtein, customFat]);

  const loadFoods = useCallback(async (search?: string, category?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      params.append('limit', '1000');
      
      const res = await fetch(`/api/foods?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDbFoods(data.foods || []);
      }
    } catch (e) {
      logger.warn('[FoodSearch] 加载失败:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadFoods(searchQuery, selectedCategory);
      const saved = getUserStorageItem(userId, 'recent_foods');
      if (saved) {
        try { setLocalRecentFoods(JSON.parse(saved)); } catch {}
      }
    }
  }, [isOpen, searchQuery, selectedCategory, loadFoods]);

  const saveToRecent = useCallback((food: FoodItem) => {
    const newRecent = [food, ...localRecentFoods.filter(f => f.id !== food.id)].slice(0, 10);
    setLocalRecentFoods(newRecent);
    setUserStorageItem(userId, 'recent_foods', JSON.stringify(newRecent));
  }, [localRecentFoods]);

  const removeRecentFood = useCallback((id: string) => {
    const next = localRecentFoods.filter(f => f.id !== id);
    setLocalRecentFoods(next);
    setUserStorageItem(userId, 'recent_foods', JSON.stringify(next));
  }, [localRecentFoods]);

  const editRecentFood = useCallback((food: FoodItem) => {
    setCustomName(food.name);
    setCustomCal(String(food.calories));
    setCustomProtein(String(food.protein));
    setCustomCarbs(String(food.carbs));
    setCustomFat(String(food.fat));
    setShowCustomForm(true);
  }, []);

  const foodsByCategory = useMemo(() => {
    const groups: Record<string, FoodItem[]> = {};
    for (const food of dbFoods) {
      const cat = food.category || '其他';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(food);
    }
    return groups;
  }, [dbFoods]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    const last = getUserStorageItem(userId, `fsl_${food.id}`);
    setGrams(last ? parseInt(last, 10) : 100);
    setShowDetail(true);
  };

  const handleConfirmAdd = () => {
    if (!selectedFood || grams <= 0) return;
    setUserStorageItem(userId, `fsl_${selectedFood.id}`, String(grams));
    saveToRecent(selectedFood);
    onSelectFood(selectedFood, grams);
    setShowDetail(false);
    setSelectedFood(null);
    onClose();
  };

  const handleRepeatFood = (food: FoodItem) => {
    const last = getUserStorageItem(userId, `fsl_${food.id}`);
    const g = last ? parseInt(last, 10) : 100;
    saveToRecent(food);
    onSelectFood(food, g);
    onClose();
  };

  const adjustGrams = (delta: number) => {
    setGrams(Math.max(1, Math.min(5000, grams + delta)));
  };

  // 保存自定义食物
  const handleSaveCustomFood = async () => {
    setCustomError('');
    if (!customName.trim()) { setCustomError('请输入食物名称'); return; }
    if (!customCal || !customProtein || !customCarbs || !customFat) {
      setCustomError('请填写完整的营养成分'); return;
    }

    setCustomSaving(true);
    try {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customName.trim(),
          category: '其他',
          calories: parseFloat(customCal),
          protein: parseFloat(customProtein),
          carbs: parseFloat(customCarbs),
          fat: parseFloat(customFat),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Add to list and select
        setDbFoods(prev => [data.food, ...prev]);
        handleSelectFood(data.food);
        // Reset form
        setShowCustomForm(false);
        setCustomName(''); setCustomCal(''); setCustomProtein(''); setCustomCarbs(''); setCustomFat('');
      } else {
        const err = await res.json();
        setCustomError(err.error || '创建失败');
      }
    } catch {
      setCustomError('网络错误，请重试');
    } finally {
      setCustomSaving(false);
    }
  };

  // 拍照识别处理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setScanError('图片大小不能超过 10MB');
      return;
    }
    setScanError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setScanPreview(ev.target?.result as string);
      setShowScanForm(true);
    };
    reader.readAsDataURL(file);
    // reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleScanRecognize = async () => {
    if (!scanPreview) return;
    setScanError('');
    setScanLoading(true);
    try {
      if (scanMode === 'meal') {
        // 餐食拍照模式 — 调用 photo-meal
        const res = await fetch('/api/foods/photo-meal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64: scanPreview }),
        });
        const data = await res.json();
        if (!res.ok) { setScanError(data.error || '识别失败，请重试'); return; }
        setMealResult(data);
        setShowScanForm(false);
        setScanPreview(null);
        setShowMealResult(true);
      } else {
        // 成分表拍照模式 — 调用 scan
        const res = await fetch('/api/foods/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64: scanPreview }),
        });
        const data = await res.json();
        if (!res.ok) { setScanError(data.error || '识别失败，请重试'); return; }
        const n = data.nutrition;
        setShowScanForm(false);
        setScanPreview(null);
        if (n.name) setCustomName(n.name);
        setCustomCal(String(n.calories));
        setCustomProtein(String(n.protein));
        setCustomCarbs(String(n.carbs));
        setCustomFat(String(n.fat));
        setShowCustomForm(true);
      }
    } catch {
      setScanError('网络错误，请重试');
    } finally {
      setScanLoading(false);
    }
  };

  const addMealFoodToCustomForm = (f: NonNullable<typeof mealResult>['foods'][0]) => {
    setShowMealResult(false);
    setMealResult(null);
    setCustomName(f.name);
    const per100cal = f.calories > 0 ? Math.round((f.calories / (f.quantity || 100)) * 100) : 0;
    const per100p   = f.protein  > 0 ? Math.round((f.protein  / (f.quantity || 100)) * 100 * 10) / 10 : 0;
    const per100c   = f.carbs    > 0 ? Math.round((f.carbs    / (f.quantity || 100)) * 100 * 10) / 10 : 0;
    const per100fat = f.fat      > 0 ? Math.round((f.fat      / (f.quantity || 100)) * 100 * 10) / 10 : 0;
    setCustomCal(String(per100cal));
    setCustomProtein(String(per100p));
    setCustomCarbs(String(per100c));
    setCustomFat(String(per100fat));
    setShowCustomForm(true);
  };

  const handleQuickAddMealFood = async (f: NonNullable<typeof mealResult>['foods'][0]) => {
    setQuickAddLoading(true);
    try {
      const qty = f.quantity || 100;
      const per100cal = f.calories > 0 ? Math.round((f.calories / qty) * 100) : 0;
      const per100p   = f.protein  > 0 ? Math.round((f.protein  / qty) * 100 * 10) / 10 : 0;
      const per100c   = f.carbs    > 0 ? Math.round((f.carbs    / qty) * 100 * 10) / 10 : 0;
      const per100fat = f.fat      > 0 ? Math.round((f.fat      / qty) * 100 * 10) / 10 : 0;
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.name,
          category: '其他',
          calories: per100cal,
          protein: per100p,
          carbs: per100c,
          fat: per100fat,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowMealResult(false);
        setMealResult(null);
        setDbFoods(prev => [data.food, ...prev.filter(fo => fo.id !== data.food.id)]);
        handleSelectFood(data.food);
      } else {
        setScanError('创建食物失败，请重试');
      }
    } catch {
      setScanError('网络错误，请重试');
    } finally {
      setQuickAddLoading(false);
    }
  };

  // ── 餐食明细展开组件 ─────────────────────────────────────────────────────
  function MealFoodsDetail({
    foods, onAdd, onEdit
  }: {
    foods: NonNullable<typeof mealResult>['foods'];
    onAdd: (f: NonNullable<typeof mealResult>['foods'][0]) => void;
    onEdit: (f: NonNullable<typeof mealResult>['foods'][0]) => void;
  }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="rounded-xl overflow-hidden bg-secondary border border-border">
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-2.5">
          <span className="text-xs font-medium text-muted-foreground">成分明细（{foods.length} 项）</span>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        {open && (
          <div className="px-3 pb-3 space-y-2">
            {foods.map((f, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg p-2.5 bg-card/80">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-secondary-foreground truncate">{f.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{f.quantity}{f.unit} · {f.calories}kcal</div>
                </div>
                <button onClick={() => onEdit(f)}
                  className="flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="编辑调整">
                  编辑
                </button>
                <button onClick={() => onAdd(f)}
                  className="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-primary-foreground"
                  style={{ background: 'var(--accent)' }}>
                  添加
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 条码查询
  const handleBarcodeLookup = async () => {
    const code = barcodeInput.trim();
    setBarcodeError('');
    if (!/^\d{6,14}$/.test(code)) {
      setBarcodeError('请输入 6-14 位数字条形码'); return;
    }
    setBarcodeLoading(true);
    try {
      const res = await fetch(`/api/foods/barcode/${code}`);
      if (res.ok) {
        const data = await res.json();
        if (data.food) {
          setDbFoods(prev => [data.food, ...prev.filter(f => f.id !== data.food.id)]);
          setShowBarcodeForm(false);
          setBarcodeInput('');
          handleSelectFood(data.food);
        } else {
          setBarcodeError('未找到该条码对应的食物');
        }
      } else if (res.status === 404) {
        setBarcodeError('未找到该商品，请尝试自定义添加');
      } else {
        const err = await res.json().catch(() => ({}));
        setBarcodeError(err.error || '查询失败，请重试');
      }
    } catch (e) {
      setBarcodeError('网络错误，请重试');
    } finally {
      setBarcodeLoading(false);
    }
  };

  if (!isOpen) return null;

  // 餐食识别结果
  if (showMealResult && mealResult) {
    return (
      <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
          <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <h2 className="text-base font-semibold text-foreground">识别结果</h2>
            </div>
            <button onClick={() => { setShowMealResult(false); setMealResult(null); }}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-4 space-y-3">
            {/* Fitness interpretation */}
            <div className="rounded-xl p-3 border" style={{ background: 'var(--accent-dim)', borderColor: 'var(--accent-glow)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>健身解读</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{mealResult.mealTiming}</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{mealResult.fitnessInterpretation}</p>
            </div>

            {/* Total macros */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { l: '热量', v: mealResult.totalMacros.calories, u: 'kcal', c: 'var(--accent)' },
                { l: '蛋白', v: mealResult.totalMacros.protein,  u: 'g',    c: '#4ADE80' },
                { l: '碳水', v: mealResult.totalMacros.carbs,    u: 'g',    c: '#22D3EE' },
                { l: '脂肪', v: mealResult.totalMacros.fat,      u: 'g',    c: '#FB923C' },
              ].map((m, i) => (
                <div key={i} className="rounded-xl p-2 text-center bg-card border border-border">
                  <div className="text-[9px] text-muted-foreground mb-0.5">{m.l}</div>
                  <div className="text-sm font-black" style={{ color: m.c }}>{m.v}<span className="text-[9px] text-muted-foreground ml-0.5">{m.u}</span></div>
                </div>
              ))}
            </div>

            {/* Combined item — primary action */}
            {mealResult.combinedItem && (
              <div className="rounded-xl p-4 border-2" style={{ background: 'var(--surface-2)', borderColor: 'var(--accent)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-foreground">{mealResult.combinedItem.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    {mealResult.combinedItem.quantity}{mealResult.combinedItem.unit}
                  </span>
                </div>
                <div className="flex gap-3 mb-3">
                  <span className="text-xs text-muted-foreground">{mealResult.combinedItem.calories}kcal</span>
                  <span className="text-xs text-emerald-400">P{mealResult.combinedItem.protein}g</span>
                  <span className="text-xs text-cyan-400">C{mealResult.combinedItem.carbs}g</span>
                  <span className="text-xs text-orange-400">F{mealResult.combinedItem.fat}g</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickAddMealFood(mealResult.combinedItem!)}
                    disabled={quickAddLoading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-primary-foreground active:scale-[0.98] disabled:opacity-60"
                    style={{ background: 'var(--accent)' }}>
                    {quickAddLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '添加整餐'}
                  </button>
                  <button
                    onClick={() => addMealFoodToCustomForm(mealResult.combinedItem!)}
                    className="px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border"
                    title="编辑调整">
                    编辑
                  </button>
                </div>
              </div>
            )}

            {/* Individual breakdown */}
            {mealResult.foods.length > 1 && (
              <MealFoodsDetail foods={mealResult.foods} onAdd={handleQuickAddMealFood} onEdit={addMealFoodToCustomForm} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // 拍照识别表单
  if (showScanForm && scanPreview) {
    return (
      <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* 隐藏 input，用于重新选图 */}
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

        <div className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <h2 className="text-base font-semibold text-foreground">
                {scanMode === 'meal' ? '餐食识别' : '营养成分识别'}
              </h2>
            </div>
            <button
              onClick={() => { setShowScanForm(false); setScanPreview(null); setScanError(''); }}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* 图片预览 */}
            <div className="relative rounded-2xl overflow-hidden bg-card border border-border" style={{ maxHeight: 260 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={scanPreview}
                alt="营养成分表"
                className="w-full object-contain"
                style={{ maxHeight: 260 }}
              />
              {scanLoading && (
                <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
                  <span className="text-sm text-foreground font-medium">AI 识别中...</span>
                  <span className="text-xs text-muted-foreground">通义千问正在读取营养成分</span>
                </div>
              )}
            </div>

            {/* 提示 */}
            {!scanLoading && !scanError && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-card border border-border">
                <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {scanMode === 'meal'
                    ? 'AI 将识别照片中的食物种类和份量，并从健身角度给出解读。'
                    : '请确保营养成分表清晰可见。识别后数据会自动填入表单，你可以再次核对修改。'
                  }
                </p>
              </div>
            )}

            {/* 错误 */}
            {scanError && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">{scanError}</p>
              </div>
            )}

            {/* 按钮组 */}
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={scanLoading}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-muted-foreground bg-card border border-border hover:bg-secondary transition-all disabled:opacity-60"
              >
                重新拍摄
              </button>
              <button
                onClick={handleScanRecognize}
                disabled={scanLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'var(--accent)' }}
              >
                {scanLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Camera className="w-4 h-4" />
                }
                {scanLoading ? '识别中…' : '开始识别'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 条码查询表单
  if (showBarcodeForm) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <ScanBarcode className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <h2 className="text-base font-semibold text-foreground">条码查询</h2>
            </div>
            <button onClick={() => { setShowBarcodeForm(false); setBarcodeError(''); setBarcodeInput(''); }} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">商品条形码（EAN/UPC）</label>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="例如：6920202888884"
                className="w-full px-3 py-3 rounded-xl text-foreground bg-card border border-border focus:outline-none focus:border-border text-base font-mono tracking-wider placeholder:text-muted-foreground"
                onKeyDown={(e) => { if (e.key === 'Enter') handleBarcodeLookup(); }}
              />
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                查询包装食品的营养成分。数据由 <span className="text-muted-foreground">Open Food Facts</span> 提供，覆盖全球数百万件商品。
              </p>
            </div>

            {barcodeError && (
              <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{barcodeError}</div>
            )}

            <button
              onClick={handleBarcodeLookup}
              disabled={barcodeLoading || !barcodeInput}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'var(--accent)' }}
            >
              {barcodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {barcodeLoading ? '查询中…' : '查询'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 自定义食物表单
  if (showCustomForm) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">自定义食物</h2>
            <button onClick={() => { setShowCustomForm(false); setCustomError(''); }} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          <div className="p-5 space-y-4">
            {/* 名称 */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">食物名称</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="如：自制沙拉、蛋白粉"
                className="w-full px-3 py-2.5 rounded-xl text-foreground bg-card border border-border focus:outline-none focus:border-border text-sm placeholder:text-muted-foreground"
              />
            </div>

            {/* 营养成分 — 每100g，顺序：热量 碳水 蛋白质 脂肪 */}
            <div>
              <label className="block text-xs text-muted-foreground mb-2">每100g 营养成分</label>
              <div className="grid grid-cols-2 gap-3">
                {/* 热量 — 自动从碳蛋脂计算 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-foreground">热量</span>
                      {(parseFloat(customCarbs) || parseFloat(customProtein) || parseFloat(customFat)) ? (
                        <span className="text-[9px] px-1 py-0.5 rounded-full" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>自动</span>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-muted-foreground">kcal</span>
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={customCal}
                    onChange={(e) => setCustomCal(e.target.value)}
                    placeholder="碳×4 + 蛋×4 + 脂×9"
                    className="w-full px-3 py-2.5 rounded-xl text-foreground bg-card border border-border focus:outline-none focus:border-border text-sm placeholder:text-muted-foreground"
                  />
                </div>
                {/* 碳水 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-cyan-400">碳水化合物</span>
                    <span className="text-[10px] text-muted-foreground">g</span>
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    placeholder="如 43"
                    className="w-full px-3 py-2.5 rounded-xl text-foreground bg-card border border-border focus:outline-none focus:border-border text-sm placeholder:text-muted-foreground"
                  />
                </div>
                {/* 蛋白质 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-emerald-400">蛋白质</span>
                    <span className="text-[10px] text-muted-foreground">g</span>
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    placeholder="如 6.5"
                    className="w-full px-3 py-2.5 rounded-xl text-foreground bg-card border border-border focus:outline-none focus:border-border text-sm placeholder:text-muted-foreground"
                  />
                </div>
                {/* 脂肪 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-orange-400">脂肪</span>
                    <span className="text-[10px] text-muted-foreground">g</span>
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    placeholder="如 8"
                    className="w-full px-3 py-2.5 rounded-xl text-foreground bg-card border border-border focus:outline-none focus:border-border text-sm placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* 错误提示 */}
            {customError && (
              <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{customError}</div>
            )}

            {/* 保存按钮 */}
            <button
              onClick={handleSaveCustomFood}
              disabled={customSaving}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'var(--accent)' }}
            >
              {customSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              保存食物
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 食物详情弹窗
  if (showDetail && selectedFood) {
    const cals = Math.round(selectedFood.calories * grams / 100);
    const prot = (selectedFood.protein * grams / 100);
    const carb = (selectedFood.carbs * grams / 100);
    const fatv = (selectedFood.fat * grams / 100);
    const colors = getCategoryColor(selectedFood.category);

    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">{selectedFood.name}</h2>
              {selectedFood.category && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                  {selectedFood.category}
                </span>
              )}
            </div>
            <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          <div className="p-5 space-y-5">
            {/* 每100g 静态营养卡片 */}
            <div className="bg-card rounded-xl p-3 border border-border">
              <div className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">每100g 营养成分</div>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="text-sm font-bold text-foreground">{selectedFood.calories}</div>
                  <div className="text-[10px] text-muted-foreground">千卡</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-emerald-400">{selectedFood.protein}</div>
                  <div className="text-[10px] text-muted-foreground">蛋白质</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-cyan-400">{selectedFood.carbs}</div>
                  <div className="text-[10px] text-muted-foreground">碳水</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-orange-400">{selectedFood.fat}</div>
                  <div className="text-[10px] text-muted-foreground">脂肪</div>
                </div>
              </div>
            </div>

            {/* 重量输入 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">重量 (g)</span>
                {getUserStorageItem(userId, `fsl_${selectedFood.id}`) && (
                  <span className="text-[10px] text-muted-foreground">上次 {getUserStorageItem(userId, `fsl_${selectedFood.id}`)}g</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <button
                  onClick={() => adjustGrams(-50)}
                  className="w-9 h-9 rounded-xl bg-secondary hover:bg-muted flex items-center justify-center transition-colors text-xs text-muted-foreground font-medium"
                >
                  -50
                </button>
                <button
                  onClick={() => adjustGrams(-10)}
                  className="w-9 h-9 rounded-xl bg-secondary hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4 text-muted-foreground" />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  value={grams}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v > 0 && v <= 5000) setGrams(v);
                    else if (e.target.value === '') setGrams(0);
                  }}
                  className="w-20 text-center py-2 bg-transparent border-b-2 border-border focus:border-primary text-2xl font-bold text-foreground outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => adjustGrams(10)}
                  className="w-9 h-9 rounded-xl bg-secondary hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => adjustGrams(50)}
                  className="w-9 h-9 rounded-xl bg-secondary hover:bg-muted flex items-center justify-center transition-colors text-xs text-muted-foreground font-medium"
                >
                  +50
                </button>
              </div>
            </div>

            {/* 动态计算结果 */}
            <div className="bg-card rounded-xl p-3 border border-border">
              <div className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">
                按 {grams}g 计算
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="text-sm font-bold text-foreground">{cals}</div>
                  <div className="text-[10px] text-muted-foreground">千卡</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-emerald-400">{prot.toFixed(1)}</div>
                  <div className="text-[10px] text-muted-foreground">蛋白质</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-cyan-400">{carb.toFixed(1)}</div>
                  <div className="text-[10px] text-muted-foreground">碳水</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-orange-400">{fatv.toFixed(1)}</div>
                  <div className="text-[10px] text-muted-foreground">脂肪</div>
                </div>
              </div>
            </div>

            {/* 确认按钮 */}
            <button
              onClick={handleConfirmAdd}
              disabled={grams <= 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-sm text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'var(--accent)' }}
            >
              <Check className="w-4 h-4" />
              添加 {grams}g {selectedFood.name}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 主界面 — 无分类侧边栏
  const allFoods = dbFoods;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full h-[90vh] bg-card rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden">
        
        {/* 隐藏的 file input */}
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

        {/* 顶部：关闭 + 搜索框 */}
        <div className="p-4 border-b border-border space-y-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors flex-shrink-0">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            {/* 模式切换 */}
            <div className="flex gap-1 p-1 rounded-xl flex-shrink-0" style={{ background: 'var(--surface-2)' }}>
              <button
                onClick={() => setShowMyFoods(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={!showMyFoods ? { background: 'var(--accent)', color: 'var(--accent-text)' } : { color: 'rgba(255,255,255,0.4)' }}
              >
                搜索
              </button>
              <button
                onClick={() => setShowMyFoods(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={showMyFoods ? { background: 'var(--accent)', color: 'var(--accent-text)' } : { color: 'rgba(255,255,255,0.4)' }}
              >
                我的食物
              </button>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索食物，如：鸡胸肉、米饭…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-foreground bg-card border border-border focus:outline-none focus:border-border transition-colors placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* 今日已摄入汇总 */}
          {todaySummary && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/60 border border-border">
              <span className="text-[10px] text-muted-foreground font-medium shrink-0">今日已摄入</span>
              <span className="text-[10px] font-bold text-foreground shrink-0">{Math.round(todaySummary.calories)}kcal</span>
              <span className="text-[10px] text-cyan-400">{Math.round(todaySummary.carbs)}C</span>
              <span className="text-[10px] text-emerald-400">{Math.round(todaySummary.protein)}P</span>
              <span className="text-[10px] text-orange-400">{Math.round(todaySummary.fat)}F</span>
            </div>
          )}

          {/* 快捷工具栏 — 2×2 大按钮 */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => { setScanMode('meal'); fileInputRef.current?.click(); }}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all text-sm font-medium"
            >
              <Camera className="w-4 h-4" />
              拍食物
            </button>
            <button
              onClick={() => { setScanMode('label'); fileInputRef.current?.click(); }}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all text-sm font-medium"
            >
              <ScanBarcode className="w-4 h-4" />
              拍成分表
            </button>
            <button
              onClick={() => setShowBarcodeForm(true)}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all text-sm font-medium"
            >
              <ScanBarcode className="w-4 h-4" />
              扫条码
            </button>
            <button
              onClick={() => setShowCustomForm(true)}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all text-sm font-medium"
            >
              <Pencil className="w-4 h-4" />
              自定义
            </button>
          </div>
        </div>

        {/* 滚动内容区 */}
        <div className="flex-1 overflow-y-auto">

          {/* 我的食物面板 */}
          {showMyFoods && (
            <div className="p-4 h-full">
              <MyFoodsPanel
                onSelectFood={(food) => {
                  setShowMyFoods(false);
                  handleSelectFood(food as Parameters<typeof handleSelectFood>[0]);
                }}
                onAddNew={() => { setShowMyFoods(false); setShowCustomForm(true); }}
              />
            </div>
          )}

          {/* 搜索模式内容 */}
          {!showMyFoods && <>

          {/* 最近使用 — 带编辑/删除 */}
          {!searchQuery && localRecentFoods.length > 0 && (
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">最近</h3>
              <div className="grid grid-cols-2 gap-2">
                {localRecentFoods.slice(0, 10).map((food) => {
                  return (
                    <div key={food.id}
                      className="group relative flex items-center gap-2 p-3 rounded-xl bg-card border border-border hover:bg-secondary/80 transition-all text-left"
                    >
                      <button onClick={() => handleSelectFood(food)}
                        className="flex-1 min-w-0 text-left active:scale-[0.98]">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-secondary-foreground block leading-snug mb-0.5">{food.name}</span>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{food.calories}kcal</span>
                            <div className="flex gap-1.5">
                              <span className="text-[10px] text-cyan-500">{food.carbs}C</span>
                              <span className="text-[10px] text-emerald-500">{food.protein}P</span>
                              <span className="text-[10px] text-orange-500">{food.fat}F</span>
                            </div>
                          </div>
                        </div>
                      </button>
                      {/* 操作按钮 */}
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleRepeatFood(food); }}
                          className="p-1 rounded-md hover:bg-muted" title="再次添加">
                          <Plus className="w-3 h-3 text-muted-foreground" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); editRecentFood(food); }}
                          className="p-1 rounded-md hover:bg-muted" title="编辑">
                          <Pencil className="w-3 h-3 text-muted-foreground" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); removeRecentFood(food.id); }}
                          className="p-1 rounded-md hover:bg-muted" title="删除">
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 加载中 */}
          {loading && (
            <div className="flex items-center justify-center h-[40vh] gap-3">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              <span className="text-sm text-muted-foreground">加载中...</span>
            </div>
          )}

          {/* 搜索结果（搜索时直接显示） */}
          {!loading && searchQuery && allFoods.length > 0 && (
            <div className="p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                搜索结果 · {allFoods.length}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {allFoods.map((food) => {
                  return (
                    <button key={food.id} onClick={() => handleSelectFood(food)}
                      className="p-3 rounded-xl bg-card border border-border hover:bg-secondary/80 transition-all active:scale-[0.98] text-left">
                      <span className="text-xs text-secondary-foreground block leading-snug mb-0.5">{food.name}</span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted-foreground">{food.calories}kcal</span>
                        <div className="flex gap-1.5">
                          <span className="text-[10px] text-cyan-500">{food.carbs}C</span>
                          <span className="text-[10px] text-emerald-500">{food.protein}P</span>
                          <span className="text-[10px] text-orange-500">{food.fat}F</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 全部食物 — 自然展开 */}
          {!loading && !searchQuery && allFoods.length > 0 && (
            <div className="px-4 pb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2.5">
                全部 · {allFoods.length}
              </h3>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {allFoods.map((food) => {
                  return (
                    <button key={food.id} onClick={() => handleSelectFood(food)}
                      className="p-3 rounded-xl bg-card border border-border hover:bg-secondary/80 transition-all active:scale-[0.98] text-left">
                      <span className="text-xs text-secondary-foreground block leading-snug mb-0.5">{food.name}</span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted-foreground">{food.calories}kcal</span>
                        <div className="flex gap-1.5">
                          <span className="text-[10px] text-cyan-500">{food.carbs}C</span>
                          <span className="text-[10px] text-emerald-500">{food.protein}P</span>
                          <span className="text-[10px] text-orange-500">{food.fat}F</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 无搜索结果 */}
          {!loading && searchQuery && allFoods.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[40vh] px-6">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-secondary-foreground mb-1">未找到 &quot;{searchQuery}&quot;</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">试试其他关键词，或添加自定义食物</p>
              <button
                onClick={() => { setShowCustomForm(true); setCustomName(searchQuery); }}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                + 添加自定义食物
              </button>
            </div>
          )}

          </>}

        </div>
      </div>
    </div>
  );
}