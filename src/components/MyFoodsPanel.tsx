'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Plus, Search, Check, X } from 'lucide-react';
import { logger } from '@/lib/logger';

interface EditState {
  name: string;
  carbs: string;
  protein: string;
  fat: string;
}

interface FoodItem {
  id: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
  createdAt: string;
}

interface Props {
  onSelectFood?: (food: FoodItem) => void;
  onAddNew?: () => void;
}


export const MyFoodsPanel: React.FC<Props> = ({ onSelectFood, onAddNew }) => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditState>({ name: '', carbs: '', protein: '', fat: '' });
  const [saving, setSaving] = useState(false);

  const autoCalories = (e: EditState) => {
    const c = parseFloat(e.carbs) || 0;
    const p = parseFloat(e.protein) || 0;
    const f = parseFloat(e.fat) || 0;
    return Math.round(c * 4 + p * 4 + f * 9);
  };

  const startEdit = (food: FoodItem) => {
    setEditingId(food.id);
    setEditForm({ name: food.name, carbs: String(food.carbs), protein: String(food.protein), fat: String(food.fat) });
  };

  const cancelEdit = () => { setEditingId(null); };

  const handleSaveEdit = async (food: FoodItem) => {
    if (!editForm.name.trim()) return;
    setSaving(true);
    try {
      const calories = autoCalories(editForm);
      const res = await fetch(`/api/foods/${food.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editForm.name.trim(),
          carbs: parseFloat(editForm.carbs) || 0,
          protein: parseFloat(editForm.protein) || 0,
          fat: parseFloat(editForm.fat) || 0,
          calories,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFoods(prev => prev.map(f => f.id === food.id ? { ...f, ...data.food } : f));
        setEditingId(null);
      }
    } catch (e) {
      logger.error('Save food error:', e);
    } finally {
      setSaving(false);
    }
  };

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ mine: 'true', limit: '100' });
      if (search) params.set('search', search);
      if (sourceFilter) params.set('category', sourceFilter);
      const res = await fetch(`/api/foods?${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        // filter by source client-side since category and source are different fields
        const list: FoodItem[] = data.foods || [];
        const filtered = sourceFilter ? list.filter(f => f.source === sourceFilter) : list;
        setFoods(filtered);
        setTotal(sourceFilter ? filtered.length : (data.total ?? filtered.length));
      }
    } catch (e) {
      logger.error('MyFoodsPanel fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [search, sourceFilter]);

  useEffect(() => { fetchFoods(); }, [fetchFoods]);

  const handleDelete = async (food: FoodItem) => {
    if (!confirm(`确认删除「${food.name}」？此操作不可撤销。`)) return;
    setDeleting(food.id);
    try {
      const res = await fetch(`/api/foods/${food.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setFoods(prev => prev.filter(f => f.id !== food.id));
        setTotal(prev => prev - 1);
      }
    } catch (e) {
      logger.error('Delete food error:', e);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 搜索栏 */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索我的食物…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-foreground bg-card border border-border focus:outline-none focus:border-border placeholder:text-muted-foreground"
        />
      </div>

      {/* 统计行 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">共 {total} 种食物</span>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            添加食物
          </button>
        )}
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 rounded-xl animate-pulse bg-card" />
          ))}
        </div>
      ) : foods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <span className="text-2xl">🍽️</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {search ? `未找到「${search}」` : '还没有个人食物'}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            通过拍照识食、扫条码或自定义添加后会显示在这里
          </p>
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              立即添加
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto">
          {foods.map(food => {
            const isEditing = editingId === food.id;
            const previewCal = isEditing ? autoCalories(editForm) : food.calories;

            return (
              <div
                key={food.id}
                className="rounded-xl bg-card border border-border overflow-hidden"
              >
                {isEditing ? (
                  /* ── 编辑表单 ── */
                  <div className="p-3 space-y-3">
                    {/* 名称 */}
                    <input
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="食物名称"
                      className="w-full px-3 py-2 rounded-lg text-sm text-foreground bg-secondary border border-border focus:outline-none focus:border-border"
                    />
                    {/* 热量预览 */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                      style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-dim)' }}>
                      <span className="text-xs text-muted-foreground">自动计算热量</span>
                      <span className="text-sm font-black ml-auto" style={{ color: 'var(--accent)' }}>{previewCal} kcal</span>
                      <span className="text-xs text-muted-foreground">/ 100g</span>
                    </div>
                    {/* 碳蛋脂输入 */}
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { key: 'carbs',   label: '碳水 (g)', color: 'var(--cyan-500)' },
                        { key: 'protein', label: '蛋白质 (g)', color: 'var(--emerald-500)' },
                        { key: 'fat',     label: '脂肪 (g)', color: 'var(--orange-500)' },
                      ] as { key: keyof EditState; label: string; color: string }[]).map(({ key, label, color }) => (
                        <div key={key}>
                          <div className="text-[10px] mb-1" style={{ color }}>{label}</div>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={editForm[key]}
                            onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                            className="w-full px-2.5 py-2 rounded-lg text-sm text-foreground bg-secondary border border-border focus:outline-none focus:border-border"
                          />
                        </div>
                      ))}
                    </div>
                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleSaveEdit(food)}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {saving ? '保存中…' : '保存'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground bg-secondary hover:bg-muted transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── 正常显示 ── */
                  <div className="group flex items-center gap-3 p-3">
                    {/* 食物信息 */}
                    <button onClick={() => onSelectFood?.(food)} className="flex-1 min-w-0 text-left">
                      <span className="text-sm text-secondary-foreground font-medium block leading-snug mb-0.5">{food.name}</span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted-foreground">{food.calories}kcal / 100{food.servingUnit}</span>
                        <div className="flex gap-2">
                          <span className="text-[10px] text-cyan-500">{food.carbs}C</span>
                          <span className="text-[10px] text-emerald-500">{food.protein}P</span>
                          <span className="text-[10px] text-orange-500">{food.fat}F</span>
                        </div>
                      </div>
                    </button>

                    {/* 操作按钮 — hover 显示 */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => startEdit(food)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="编辑">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(food)} disabled={deleting === food.id}
                        className="p-1.5 rounded-lg hover:bg-red-500/15 transition-colors" title="删除">
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
