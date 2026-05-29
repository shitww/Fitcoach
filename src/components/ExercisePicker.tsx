"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Barrel, Cpu, Plus, X, 
  ChevronRight, User, Loader2, Trash2, Check, Info
} from 'lucide-react';
import { createCustomExercise, getUserCustomExercises, deleteCustomExercise } from '@/app/actions/exercise-actions';
import { logger } from '@/lib/logger';
import { useToast } from '@/components/Toast';
import { 
  MUSCLE_GROUP_MAP, MUSCLE_GROUP_LABELS_CN,
  EXERCISE_CATEGORY_MAP, EXERCISE_CATEGORY_ORDER, EXERCISE_CATEGORY_COLORS,
  getMuscleGroupColor, equipmentToType 
} from '@/lib/exercise-constants';

interface ExercisePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: string) => void;
  customExercises: string[];
  savedExercises: string[];
}

/** DB Exercise 的 TypeScript 接口 */
interface DbExercise {
  id: string;
  name: string;
  muscleGroup: string;
  category: string;
  description: string | null;
  instructions: string | null;
  equipment: string | null;
  difficulty: string | null;
  tips: string | null;
  commonMistakes: string | null;
  isCustom: boolean;
}

export default function ExercisePicker({
  isOpen,
  onClose,
  onSelectExercise,
  customExercises,
  savedExercises
}: ExercisePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [showMyExercises, setShowMyExercises] = useState(false);
  const [dbCustomExercises, setDbCustomExercises] = useState<
    { id: string; name: string; muscleGroup: string; equipment?: string | null }[]
  >([]);
  const [dbBuiltInExercises, setDbBuiltInExercises] = useState<DbExercise[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successText, setSuccessText] = useState('');
  const [confirmDeleteExId, setConfirmDeleteExId] = useState<string | null>(null);
  const { toast } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTarget, setCreateTarget] = useState('');
  const [localSavedExercises, setLocalSavedExercises] = useState<string[]>(savedExercises);
  const MUSCLE_CHAR_CN: Record<string, string> = {
    '胸部': '胸', '背部': '背', '肩部': '肩', '手臂': '臂', '腿部': '腿', '腹部': '腹', '全身': '全',
  };

  const [showExerciseDetail, setShowExerciseDetail] = useState(false);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<{ name: string; type: string; group: string; description?: string; tips?: string[]; mistakes?: string[] } | null>(null);

  /** 加载所有内置动作（从 DB /api/exercises） */
  const loadBuiltInExercises = useCallback(async () => {
    try {
      const res = await fetch('/api/exercises');
      if (res.ok) {
        const data = await res.json();
        setDbBuiltInExercises(data.exercises?.filter((e: DbExercise) => !e.isCustom) || []);
      }
    } catch (e) {
      logger.warn('[ExercisePicker] 加载内置动作失败:', e);
    }
  }, []);

  /** 加载用户自定义动作 */
  const loadCustomExercises = useCallback(async () => {
    setDbLoading(true);
    try {
      const exercises = await getUserCustomExercises();
      setDbCustomExercises(exercises);
    } catch (e) {
      logger.warn('[ExercisePicker] 加载自定义动作失败:', e);
    } finally {
      setDbLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadBuiltInExercises();
      loadCustomExercises();
    }
  }, [isOpen, loadBuiltInExercises, loadCustomExercises]);

  /** 按中文肌群名分组的内置动作 */
  const exercisesByGroup = useMemo(() => {
    const groups: Record<string, { name: string; type: string }[]> = {};
    for (const key of MUSCLE_GROUP_LABELS_CN) {
      groups[key] = [];
    }
    for (const ex of dbBuiltInExercises) {
      const cn = MUSCLE_GROUP_MAP[ex.muscleGroup] || ex.muscleGroup;
      if (!groups[cn]) groups[cn] = [];
      groups[cn].push({ name: ex.name, type: equipmentToType(ex.equipment) });
    }
    return groups;
  }, [dbBuiltInExercises]);

  /** 按运动类型分组的内置动作 */
  const exercisesByCategory = useMemo(() => {
    const groups: Record<string, { name: string; type: string }[]> = {};
    for (const key of EXERCISE_CATEGORY_ORDER) {
      groups[key] = [];
    }
    for (const ex of dbBuiltInExercises) {
      const cat = (ex as any).category ?? 'strength';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ name: ex.name, type: equipmentToType(ex.equipment) });
    }
    return groups;
  }, [dbBuiltInExercises]);

  /** 当前选中的是 category 还是 muscleGroup */
  const isCategorySelected = selectedMuscleGroup in EXERCISE_CATEGORY_MAP;
  const currentItems = useMemo(() => {
    if (!selectedMuscleGroup) return [];
    if (isCategorySelected) return exercisesByCategory[selectedMuscleGroup] ?? [];
    return exercisesByGroup[selectedMuscleGroup] ?? [];
  }, [selectedMuscleGroup, isCategorySelected, exercisesByCategory, exercisesByGroup]);

  /** 动作名 → DB 详情（tips/mistakes）映射 */
  const exerciseDetailMap = useMemo(() => {
    const map: Record<string, { description: string; tips: string[]; mistakes: string[] }> = {};
    for (const ex of dbBuiltInExercises) {
      map[ex.name] = {
        description: ex.description || '',
        tips: ex.tips ? JSON.parse(ex.tips) : [],
        mistakes: ex.commonMistakes ? JSON.parse(ex.commonMistakes) : [],
      };
    }
    return map;
  }, [dbBuiltInExercises]);

  /** 根据动作名查 DB，返回设备类型 */
  const getExerciseType = useCallback((exercise: string): string => {
    const found = dbBuiltInExercises.find(e => e.name === exercise);
    if (found) return equipmentToType(found.equipment);
    const custom = dbCustomExercises.find(e => e.name === exercise);
    if (custom?.equipment) return custom.equipment;
    return '';
  }, [dbBuiltInExercises, dbCustomExercises]);

  /** 根据动作名查 DB，返回中文肌群名 */
  const getExerciseGroup = useCallback((exercise: string): string => {
    const found = dbBuiltInExercises.find(e => e.name === exercise);
    if (found) return MUSCLE_GROUP_MAP[found.muscleGroup] || found.muscleGroup;
    const custom = dbCustomExercises.find(e => e.name === exercise);
    if (custom) return custom.muscleGroup;
    return '其他';
  }, [dbBuiltInExercises, dbCustomExercises]);

  /** 根据动作名获取详情 */
  const getExerciseDetail = useCallback((exercise: string) => {
    const name = exercise.split(' (')[0];
    const found = dbBuiltInExercises.find(e => e.name === exercise);
    if (found) return {
      description: found.description || '',
      tips: found.tips ? safeParseJsonArray(found.tips) : [],
      mistakes: found.commonMistakes ? safeParseJsonArray(found.commonMistakes) : [],
    };
    return exerciseDetailMap[exercise] || null;
  }, [dbBuiltInExercises, exerciseDetailMap]);

  /** 安全解析 JSON 数组 */
  const safeParseJsonArray = (val: string): string[] => {
    try { return JSON.parse(val); } catch { return []; }
  };

  /** 搜索过滤 */
  const filteredExercises = useMemo(() => {
    if (!searchQuery) return [];
    const lowerKeyword = searchQuery.toLowerCase();
    const results: { exercise: string; score: number; isCustom: boolean }[] = [];

    for (const ex of dbBuiltInExercises) {
      const exercise = ex.name;
      const lowerName = exercise.toLowerCase();
      const chineseName = exercise.split(' (')[0];
      const englishName = exercise.split('(')[1]?.replace(')', '') || '';
      let score = 0;
      if (lowerName.includes(lowerKeyword)) score = 3;
      if (chineseName.includes(searchQuery)) score = Math.max(score, 2);
      if (englishName.toLowerCase().includes(lowerKeyword)) score = Math.max(score, 1);
      if (score > 0) results.push({ exercise, score, isCustom: false });
    }

    for (const ex of dbCustomExercises) {
      const lowerName = ex.name.toLowerCase();
      let score = 0;
      if (lowerName.includes(lowerKeyword)) score = 3;
      if (ex.name.includes(searchQuery)) score = Math.max(score, 2);
      if (score > 0) results.push({ exercise: ex.name, score, isCustom: true });
    }

    results.sort((a, b) => b.score - a.score);
    return results;
  }, [searchQuery, dbBuiltInExercises, dbCustomExercises]);

  const handleSelectExercise = (exercise: string) => {
    onSelectExercise(exercise);
    onClose();
  };

  const handleShowExerciseDetail = (exercise: string, type: string, group: string) => {
    const details = getExerciseDetail(exercise);
    setSelectedExerciseDetail({
      name: exercise,
      type,
      group,
      ...details
    });
    setShowExerciseDetail(true);
  };

  const triggerCreate = (name: string) => {
    setCreateTarget(name.trim());
    setShowCreateModal(true);
  };

  const confirmCreate = async (muscleGroup: string) => {
    if (!createTarget) return;
    setIsCreating(true);
    try {
      const result = await createCustomExercise(createTarget, muscleGroup);
      setShowCreateModal(false);
      setSearchQuery('');
      if (result.success && !result.error) {
        setSuccessText(`"${createTarget}" 已保存`);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2500);
        if (showMyExercises) await loadCustomExercises();
      } else {
        setSuccessText(`"${createTarget}" 已添加（本地模式）`);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
      handleSelectExercise(createTarget);
    } catch (error) {
      logger.error('[创建动作] 异常:', error);
      handleSelectExercise(createTarget);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/75 backdrop-blur-sm" onClick={onClose} />

      {/* Bottom sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col rounded-t-3xl overflow-hidden"
        style={{ background: '#0a0a0a', borderTop: '1px solid #1e1e1e', height: '88vh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: '#2a2a2a' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-1 pb-3 shrink-0">
          <h2 className="text-lg font-black text-foreground">选择动作</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#1a1a1a', touchAction: 'manipulation' }}
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索动作，如：卧推、深蹲…"
              className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              style={{ background: '#151515', border: '1px solid #1e1e1e' }}
            />
          </div>
        </div>

        {/* Category tabs — Row 1: 运动类型 */}
        {!searchQuery && (
          <div className="overflow-x-auto shrink-0 px-4 pb-2">
            <div className="flex gap-2 w-max">
              {[
                { label: '全部', key: '__all__', action: () => { setSelectedMuscleGroup(''); setShowMyExercises(false); }, active: !showMyExercises && !selectedMuscleGroup },
                { label: '我的', key: '__mine__', action: () => { setShowMyExercises(true); setSelectedMuscleGroup(''); loadCustomExercises(); }, active: showMyExercises },
                ...EXERCISE_CATEGORY_ORDER.map(k => ({
                  label: EXERCISE_CATEGORY_MAP[k],
                  key: k,
                  action: () => { setSelectedMuscleGroup(k); setShowMyExercises(false); },
                  active: !showMyExercises && selectedMuscleGroup === k,
                  color: EXERCISE_CATEGORY_COLORS[k]?.hex,
                })),
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={tab.action}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all active:scale-95"
                  style={
                    tab.active
                      ? { background: (tab as any).color ?? 'var(--accent)', color: 'var(--accent-text)', touchAction: 'manipulation' }
                      : { background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)', touchAction: 'manipulation' }
                  }
                >{tab.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Category tabs — Row 2: 肌群 */}
        {!searchQuery && (
          <div className="overflow-x-auto shrink-0 px-4 pb-3">
            <div className="flex gap-2 w-max">
              {MUSCLE_GROUP_LABELS_CN.map((g) => {
                const active = !showMyExercises && selectedMuscleGroup === g;
                const colors = getMuscleGroupColor(g);
                return (
                  <button
                    key={g}
                    onClick={() => { setSelectedMuscleGroup(active ? '' : g); setShowMyExercises(false); }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all active:scale-95"
                    style={
                      active
                        ? { background: colors.hex ?? 'var(--accent)', color: 'var(--accent-text)', touchAction: 'manipulation' }
                        : { background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)', touchAction: 'manipulation' }
                    }
                  >{g}</button>
                );
              })}
            </div>
          </div>
        )}

        {/* Success banner */}
        {showSuccessMessage && (
          <div
            className="mx-4 mb-2 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            {successText}
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-10">

          {/* Recent exercises */}
          {!searchQuery && !selectedMuscleGroup && !showMyExercises && localSavedExercises.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>最近使用</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {localSavedExercises.slice(0, 8).map((exercise, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectExercise(exercise)}
                    className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap active:scale-95 transition-all"
                    style={{ background: '#151515', border: '1px solid #1e1e1e', color: 'rgba(255,255,255,0.65)', touchAction: 'manipulation' }}
                  >
                    {exercise.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search results */}
          {searchQuery && filteredExercises.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {filteredExercises.length} 个结果
              </p>
              <div className="grid grid-cols-2 gap-2">
                {filteredExercises.map((item) => {
                  const group = getExerciseGroup(item.exercise);
                  const type = item.isCustom ? '自定义' : getExerciseType(item.exercise);
                  const colors = getMuscleGroupColor(group);
                  return (
                    <button
                      key={item.exercise}
                      onClick={() => handleSelectExercise(item.exercise)}
                      className="flex flex-col gap-2 p-3 rounded-2xl text-left active:scale-[0.97] transition-all"
                      style={{ background: '#111', border: '1px solid #1e1e1e', touchAction: 'manipulation' }}
                    >
                      <div className={`w-8 h-8 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 font-black text-sm`}>
                        {MUSCLE_CHAR_CN[group] ?? group[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground truncate">{item.exercise.split(' (')[0]}</div>
                        <div className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{type}{group ? ` · ${group}` : ''}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No search results */}
          {searchQuery && filteredExercises.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-secondary border border-border">
                <Search className="w-6 h-6 text-muted-foreground/30" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">未找到 "{searchQuery}"</h3>
              <p className="text-xs mb-6 text-center text-muted-foreground/40">点击下方按钮创建自定义动作</p>
              <button
                onClick={() => triggerCreate(searchQuery)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-accent-foreground active:scale-95 transition-all"
                style={{ background: 'var(--accent)', touchAction: 'manipulation' }}
              >
                <Plus className="w-4 h-4" />
                创建 "{searchQuery}"
              </button>
            </div>
          )}

          {/* My exercises */}
          {showMyExercises && !searchQuery && (
            <div>
              {dbLoading ? (
                <div className="flex items-center justify-center py-16 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'rgba(255,255,255,0.2)' }} />
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>加载中...</span>
                </div>
              ) : dbCustomExercises.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {dbCustomExercises.map((exercise) => {
                    const colors = getMuscleGroupColor(exercise.muscleGroup);
                    return (
                      <div key={exercise.id} className="relative">
                        <button
                          onClick={() => handleSelectExercise(exercise.name)}
                          className="w-full flex flex-col gap-2 p-3 rounded-2xl text-left active:scale-[0.97] transition-all"
                          style={{ background: '#111', border: '1px solid #1e1e1e', touchAction: 'manipulation' }}
                        >
                          <div className={`w-8 h-8 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                            <User className={`w-4 h-4 ${colors.text}`} />
                          </div>
                          <div className="min-w-0 pr-6">
                            <div className="text-sm font-bold text-foreground truncate">{exercise.name}</div>
                            <div className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{MUSCLE_GROUP_MAP[exercise.muscleGroup] || exercise.muscleGroup} · 自定义</div>
                          </div>
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirmDeleteExId !== exercise.id) { setConfirmDeleteExId(exercise.id); return; }
                            setConfirmDeleteExId(null);
                            const result = await deleteCustomExercise(exercise.id);
                            if (result.success) {
                              setDbCustomExercises(prev => prev.filter(ex => ex.id !== exercise.id));
                              toast({ message: '已删除自定义动作', type: 'success' });
                            }
                          }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{
                            background: confirmDeleteExId === exercise.id ? 'rgba(255,59,92,0.3)' : 'rgba(255,59,92,0.12)',
                            touchAction: 'manipulation'
                          }}
                          title={confirmDeleteExId === exercise.id ? '再次点击确认' : '删除'}
                        >
                          {confirmDeleteExId === exercise.id
                            ? <Check className="w-3 h-3" style={{ color: '#FF3B5C' }} />
                            : <Trash2 className="w-3 h-3" style={{ color: '#FF3B5C' }} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#151515', border: '1px solid #1e1e1e' }}>
                    <User className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.2)' }} />
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1">还没有自定义动作</p>
                  <p className="text-xs mb-5 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>搜索不存在的动作名即可创建</p>
                  <button
                    onClick={() => { setShowMyExercises(false); setSelectedMuscleGroup(''); }}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0.6)', touchAction: 'manipulation' }}
                  >
                    浏览动作库
                  </button>
                </div>
              )}
            </div>
          )}

          {/* By muscle group / category */}
          {!searchQuery && selectedMuscleGroup && !showMyExercises && (
            <div className="grid grid-cols-2 gap-2">
              {currentItems.map((item) => {
                const colors = getMuscleGroupColor(selectedMuscleGroup);
                return (
                  <button
                    key={item.name}
                    onClick={() => handleSelectExercise(item.name)}
                    className="flex flex-col gap-2 p-3 rounded-2xl text-left active:scale-[0.97] transition-all"
                    style={{ background: '#111', border: '1px solid #1e1e1e', touchAction: 'manipulation' }}
                  >
                    <div className={`w-8 h-8 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 font-black text-sm`}>
                      {MUSCLE_CHAR_CN[selectedMuscleGroup] ?? selectedMuscleGroup[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{item.name.split(' (')[0]}</div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.type}</div>
                    </div>
                  </button>
                );
              })}
              {dbCustomExercises.filter(e => e.muscleGroup === selectedMuscleGroup).map((exercise) => {
                const colors = getMuscleGroupColor(exercise.muscleGroup);
                return (
                  <div key={exercise.id} className="relative">
                    <button
                      onClick={() => handleSelectExercise(exercise.name)}
                      className="w-full flex flex-col gap-2 p-3 rounded-2xl text-left active:scale-[0.97] transition-all"
                      style={{ background: '#111', border: '1px solid #1e1e1e', touchAction: 'manipulation' }}
                    >
                      <div className={`w-8 h-8 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                        <User className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div className="min-w-0 pr-6">
                        <div className="text-sm font-bold text-foreground truncate">{exercise.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>自定义</div>
                      </div>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirmDeleteExId !== exercise.id) { setConfirmDeleteExId(exercise.id); return; }
                        setConfirmDeleteExId(null);
                        const result = await deleteCustomExercise(exercise.id);
                        if (result.success) {
                          setDbCustomExercises(prev => prev.filter(ex => ex.id !== exercise.id));
                          toast({ message: '已删除自定义动作', type: 'success' });
                        }
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{
                        background: confirmDeleteExId === exercise.id ? 'rgba(255,59,92,0.3)' : 'rgba(255,59,92,0.12)',
                        touchAction: 'manipulation'
                      }}
                      title={confirmDeleteExId === exercise.id ? '再次点击确认' : '删除'}
                    >
                      {confirmDeleteExId === exercise.id
                        ? <Check className="w-3 h-3" style={{ color: '#FF3B5C' }} />
                        : <Trash2 className="w-3 h-3" style={{ color: '#FF3B5C' }} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* All groups overview */}
          {!searchQuery && !selectedMuscleGroup && !showMyExercises && (
            <div className="space-y-6">
              {MUSCLE_GROUP_LABELS_CN.map((groupName) => {
                const items = exercisesByGroup[groupName] || [];
                const colors = getMuscleGroupColor(groupName);
                if (items.length === 0) return null;
                return (
                  <div key={groupName}>
                    <button
                      onClick={() => { setSelectedMuscleGroup(groupName); setShowMyExercises(false); }}
                      className="w-full flex items-center justify-between mb-3 active:opacity-70 transition-opacity"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-lg ${colors.bg} ${colors.text} font-bold`}>{groupName}</span>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{items.length} 个</span>
                      </div>
                      <div className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        <span className="text-xs">全部</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      {items.slice(0, 4).map((item) => (
                        <button
                          key={item.name}
                          onClick={() => handleSelectExercise(item.name)}
                          className="flex items-center gap-2.5 p-3 rounded-xl text-left active:scale-[0.97] transition-all"
                          style={{ background: '#111', border: '1px solid #1e1e1e', touchAction: 'manipulation' }}
                        >
                          <div className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 font-black text-sm`}>
                            {MUSCLE_CHAR_CN[groupName] ?? groupName[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-foreground truncate">{item.name.split(' (')[0]}</div>
                            {item.type && <div className="text-[10px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.type}</div>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {dbCustomExercises.length > 0 && (
                <div>
                  <button
                    onClick={() => { setShowMyExercises(true); setSelectedMuscleGroup(''); }}
                    className="w-full flex items-center justify-between mb-3"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-lg font-bold" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>我的</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{dbCustomExercises.length} 个</span>
                    </div>
                    <div className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <span className="text-xs">全部</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    {dbCustomExercises.slice(0, 4).map((ex) => {
                      const colors = getMuscleGroupColor(ex.muscleGroup);
                      return (
                        <button
                          key={ex.id}
                          onClick={() => handleSelectExercise(ex.name)}
                          className="flex items-center gap-2.5 p-3 rounded-xl text-left active:scale-[0.97] transition-all"
                          style={{ background: '#111', border: '1px solid #1e1e1e', touchAction: 'manipulation' }}
                        >
                          <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                            <User className={`w-4 h-4 ${colors.text}`} />
                          </div>
                          <span className="text-xs font-semibold text-foreground truncate">{ex.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 创建动作弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[60] flex items-end justify-center p-0">
          <div className="w-full max-w-lg rounded-t-3xl overflow-hidden" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #1e1e1e' }}>
              <h2 className="text-base font-black text-foreground">创建新动作</h2>
              <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#1a1a1a' }}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5">
              <div className="mb-5">
                <p className="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>动作名称</p>
                <div className="px-4 py-3 rounded-xl text-foreground text-sm font-semibold" style={{ background: '#151515', border: '1px solid #1e1e1e' }}>
                  {createTarget}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>选择关联部位</p>
                <div className="grid grid-cols-3 gap-2 pb-5">
                  {[...MUSCLE_GROUP_LABELS_CN, '其他'].map((group) => {
                    const colors = getMuscleGroupColor(group);
                    return (
                      <button
                        key={group}
                        onClick={() => confirmCreate(group)}
                        disabled={isCreating}
                        className={`p-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${colors.bg} ${colors.text}`}
                        style={{ border: '1px solid #1e1e1e', touchAction: 'manipulation' }}
                      >
                        {group}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 动作详情弹窗 */}
      {showExerciseDetail && selectedExerciseDetail && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[60] flex items-end justify-center">
          <div className="w-full max-w-lg rounded-t-3xl overflow-hidden" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 sticky top-0" style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
              <h2 className="text-base font-black text-foreground">动作详情</h2>
              <button onClick={() => setShowExerciseDetail(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#1a1a1a' }}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${getMuscleGroupColor(selectedExerciseDetail.group).bg} ${getMuscleGroupColor(selectedExerciseDetail.group).text} flex items-center justify-center shrink-0 font-black text-xl`}>
                  {MUSCLE_CHAR_CN[selectedExerciseDetail.group] ?? selectedExerciseDetail.group[0]}
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">{selectedExerciseDetail.name.split(' (')[0]}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0.4)' }}>{selectedExerciseDetail.group}</span>
                    <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0.4)' }}>{selectedExerciseDetail.type}</span>
                  </div>
                </div>
              </div>
              {selectedExerciseDetail.description && (
                <div>
                  <h4 className="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>动作说明</h4>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{selectedExerciseDetail.description}</p>
                </div>
              )}
              {selectedExerciseDetail.tips && selectedExerciseDetail.tips.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>训练建议</h4>
                  <ul className="space-y-1.5">
                    {selectedExerciseDetail.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <span style={{ color: '#10B981' }} className="mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedExerciseDetail.mistakes && selectedExerciseDetail.mistakes.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>常见错误</h4>
                  <ul className="space-y-1.5">
                    {selectedExerciseDetail.mistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <span style={{ color: '#F59E0B' }} className="mt-0.5">•</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="pt-2 pb-3">
                <button
                  onClick={() => { handleSelectExercise(selectedExerciseDetail.name); setShowExerciseDetail(false); }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-black text-sm text-accent-foreground transition-all active:scale-[0.98]"
                  style={{ background: 'var(--accent)', touchAction: 'manipulation' }}
                >
                  <Check className="w-4 h-4" />
                  选择此动作
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}