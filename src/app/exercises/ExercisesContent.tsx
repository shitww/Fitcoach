"use client";

import { useState, useEffect } from 'react';
import { useWorkoutTimer } from '@/stores/workoutTimer';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Dumbbell, Search, X, Target, AlertTriangle, CheckCircle, Zap, Plus, Trash2, Edit2, Loader2, Star } from 'lucide-react';
import { createCustomExercise, getUserCustomExercises, updateCustomExercise, deleteCustomExercise } from '@/app/actions/exercise-actions';
import { logger } from '@/lib/logger';
import { AmbientGlow } from "@/components/AmbientGlow";

import { MUSCLE_GROUP_MAP, MUSCLE_GROUP_COLORS, MUSCLE_GROUP_ORDER, EXERCISE_CATEGORY_MAP, EXERCISE_CATEGORY_ORDER, EXERCISE_CATEGORY_COLORS, DIFFICULTY_MAP, DIFFICULTY_OPTIONS, equipmentToType } from '@/lib/exercise-constants';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  category: string;
  description?: string | null;
  instructions?: string | null;
  equipment?: string | null;
  difficulty?: string | null;
  tips?: string[];
  commonMistakes?: string[];
  isCustom?: boolean;
  userNotes?: string;
}


const muscleGroupOptions = MUSCLE_GROUP_ORDER.map(v => ({
  value: v,
  label: MUSCLE_GROUP_MAP[v],
  color: MUSCLE_GROUP_COLORS[v]?.hex ?? '#94A3B8',
}));

const categoryOptions = EXERCISE_CATEGORY_ORDER.map(v => ({
  value: v,
  label: EXERCISE_CATEGORY_MAP[v],
  color: EXERCISE_CATEGORY_COLORS[v]?.hex ?? '#94A3B8',
}));

const difficultyOptions = DIFFICULTY_OPTIONS;

// 训练建议和常见错误的输入组件
const TipInput = ({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) => (
  <div className="space-y-2">
    {values.map((tip, i) => (
      <div key={i} className="flex gap-2">
        <input
          value={tip}
          onChange={(e) => {
            const next = [...values];
            next[i] = e.target.value;
            onChange(next);
          }}
          placeholder={placeholder || `建议 ${i + 1}`}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm text-foreground bg-card border border-border focus:outline-none focus:border-border"
        />
        {values.length > 1 && (
          <button 
            onClick={() => onChange(values.filter((_, j) => j !== i))} 
            className="px-2 text-muted-foreground hover:text-red-400 flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>
    ))}
    <button
      onClick={() => onChange([...values, ''])}
      className="text-xs text-muted-foreground hover:text-secondary-foreground"
    >+ 添加建议</button>
  </div>
);

export default function ExercisesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectMode = searchParams.get('mode') === 'select';
  const backUrl = searchParams.get('back') || '/workout';
  const { isTrainingActive, isPaused } = useWorkoutTimer();
  const hasActiveSession = isTrainingActive || isPaused;
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [dbCustomExercises, setDbCustomExercises] = useState<Exercise[]>([]);
  const [dbBuiltInExercises, setDbBuiltInExercises] = useState<Exercise[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [usageCounts] = useState<Record<string, number>>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('fitcoach:exercise-usage') : null;
      return raw ? (JSON.parse(raw) as Record<string, number>) : {};
    } catch { return {}; }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Exercise | null>(null);
  const [saving, setSaving] = useState(false);
  const [isSelectingExercise, setIsSelectingExercise] = useState(false);
  const [selectedTrainingExercise, setSelectedTrainingExercise] = useState<Exercise | null>(null);

  const [newForm, setNewForm] = useState({
    name: '', muscleGroup: 'chest', difficulty: '中等',
    equipment: '', description: '', instructions: '',
    tips: [''], commonMistakes: ['']
  });

  const loadCustomExercises = async () => {
    setDbLoading(true);
    try {
      const exercises = await getUserCustomExercises();
      setDbCustomExercises(exercises);
    } catch (e) {
      logger.error('加载自定义动作失败:', e);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDbLoading(true);
      try {
        const [custom, builtIn] = await Promise.all([
          getUserCustomExercises().catch(() => []),
          fetch("/api/exercises").then(r => r.ok ? r.json() : { exercises: [] }),
        ]);
        if (cancelled) return;
        setDbCustomExercises(custom);
        const parsed = (builtIn.exercises?.filter((e: Exercise) => !e.isCustom) || []).map(
          (e: Record<string, unknown>) => ({
            ...e,
            tips: Array.isArray(e.tips) ? e.tips : (e.tips ? (() => { try { return JSON.parse(String(e.tips)); } catch { return []; } })() : []),
            commonMistakes: Array.isArray(e.commonMistakes) ? e.commonMistakes : (e.commonMistakes ? (() => { try { return JSON.parse(String(e.commonMistakes)); } catch { return []; } })() : []),
          })
        );
        setDbBuiltInExercises(parsed as Exercise[]);
      } catch (e) {
        logger.error('加载动作失败:', e);
      } finally {
        if (!cancelled) setDbLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 合并内置 + 数据库自定义动作
  const allExercises = [
    ...dbBuiltInExercises,
    ...dbCustomExercises.map(ex => ({ ...ex, isCustom: true }))
  ];

  const sortedByUsage = (list: Exercise[]) =>
    [...list].sort((a, b) => (usageCounts[b.name] ?? 0) - (usageCounts[a.name] ?? 0));

  const filteredExercises = sortedByUsage(allExercises.filter(ex => {
    const matchesGroup = selectedFilter === 'all' || selectedFilter === 'mine'
      ? true
      : ex.muscleGroup === selectedFilter || ex.category === selectedFilter;
    const matchesMine = selectedFilter !== 'mine' || ex.isCustom === true;
    const matchesSearch = !searchTerm ||
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.description && ex.description.includes(searchTerm));
    return matchesGroup && matchesMine && matchesSearch;
  }));

  const getMuscleGroupColor = (group: string) => {
    const found = muscleGroupOptions.find(g => g.value === group);
    return found ? found.color : '#999';
  };

  const getMuscleGroupLabel = (group: string) =>
    MUSCLE_GROUP_MAP[group] ?? group;

  const getMuscleChar = (group: string) =>
    (MUSCLE_GROUP_MAP[group] ?? group).charAt(0);

  const difficultyColors: Record<string, string> = {
    '初级': '#34D399', '中级': '#FBBF24', '高级': '#F87171',
    beginner: '#34D399', intermediate: '#FBBF24', expert: '#F87171',
  };

  const translateEquipment = (eq: string) => equipmentToType(eq);

  const translateCategory = (cat: string) =>
    EXERCISE_CATEGORY_MAP[cat?.toLowerCase()] ?? cat;

  const translateDifficulty = (d: string) =>
    DIFFICULTY_MAP[d?.toLowerCase()] ?? d;

  // 添加新动作
  const handleAddExercise = async () => {
    if (!newForm.name.trim()) return;
    setSaving(true);
    try {
      await createCustomExercise(newForm.name, newForm.muscleGroup, {
        difficulty: newForm.difficulty,
        equipment: newForm.equipment || undefined,
        description: newForm.description || undefined,
        instructions: newForm.instructions || undefined,
        tips: newForm.tips.filter(t => t.trim()),
        commonMistakes: newForm.commonMistakes.filter(m => m.trim())
      });
      await loadCustomExercises();
      setShowAddModal(false);
      setNewForm({ name: '', muscleGroup: 'chest', difficulty: '中等', equipment: '', description: '', instructions: '', tips: [''], commonMistakes: [''] });
    } finally {
      setSaving(false);
    }
  };

  // 打开编辑弹窗
  const openEditModal = (exercise: Exercise) => {
    if (!exercise.isCustom) {
      // 内置动作只能查看，不能编辑
      setSelectedExercise(exercise);
      return;
    }
    setEditTarget({ ...exercise });
    setShowEditModal(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await updateCustomExercise(editTarget.id, {
        name: editTarget.name,
        muscleGroup: editTarget.muscleGroup,
        difficulty: editTarget.difficulty || undefined,
        equipment: editTarget.equipment || undefined,
        description: editTarget.description || undefined,
        instructions: editTarget.instructions || undefined,
        tips: editTarget.tips?.filter(t => t.trim()) || [],
        commonMistakes: editTarget.commonMistakes?.filter(m => m.trim()) || []
      });
      await loadCustomExercises();
      setShowEditModal(false);
      setEditTarget(null);
    } finally {
      setSaving(false);
    }
  };

  // 删除动作
  const handleDeleteExercise = async (exercise: Exercise) => {
    if (!exercise.isCustom) return;
    if (!confirm(`确定删除动作"${exercise.name}"？`)) return;
    await deleteCustomExercise(exercise.id);
    await loadCustomExercises();
    if (selectedExercise?.id === exercise.id) setSelectedExercise(null);
    if (editTarget?.id === exercise.id) { setShowEditModal(false); setEditTarget(null); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient */}
      <AmbientGlow />

      <div className="relative max-w-6xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push(selectMode ? backUrl : '/')} className="p-2.5 rounded-xl bg-card border border-border hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">动作库</h1>
              <p className="text-sm text-muted-foreground">专业动作指导与技巧</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!dbLoading && (
              <span className="text-sm text-muted-foreground">{filteredExercises.length} 个动作</span>
            )}
            {selectedTrainingExercise ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary border border-border">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-sm"
                    style={{ background: `${getMuscleGroupColor(selectedTrainingExercise.muscleGroup)}18`, color: getMuscleGroupColor(selectedTrainingExercise.muscleGroup) }}>
                    {getMuscleChar(selectedTrainingExercise.muscleGroup)}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{selectedTrainingExercise.name.split(' (')[0]}</span>
                </div>
                <button
                  onClick={() => setSelectedTrainingExercise(null)}
                  className="px-3 py-2 rounded-xl bg-muted text-foreground text-sm hover:bg-muted transition-colors"
                >
                  更换动作
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSelectingExercise(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                选择动作
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-foreground font-bold text-sm hover:bg-muted transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加动作
            </button>
          </div>
        </div>

        {/* Select mode banner */}
        {selectMode && (
          <div className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}>
            <Dumbbell className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>选择一个动作添加到训练记录</span>
          </div>
        )}

        {!selectedTrainingExercise && (
          <>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索动作名称…"
                  className="w-full rounded-xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground text-sm bg-card border border-border focus:outline-none focus:border-border transition-colors"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter — Row 1: 运动类型 */}
            <div className="overflow-x-auto pb-1 mb-2 -mx-1 px-1">
              <div className="flex gap-2 w-max">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedFilter === 'all' ? 'bg-white text-black' : 'bg-card text-muted-foreground border border-border hover:bg-secondary'
                  }`}
                >全部</button>
                <button
                  onClick={() => setSelectedFilter('mine')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedFilter === 'mine' ? 'bg-amber-500 text-black' : 'bg-card text-muted-foreground border border-border hover:bg-secondary'
                  }`}
                >我的</button>
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedFilter(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                      selectedFilter === cat.value ? 'text-black' : 'bg-card text-muted-foreground border border-border hover:bg-secondary'
                    }`}
                    style={selectedFilter === cat.value ? { background: cat.color } : {}}
                  >{cat.label}</button>
                ))}
              </div>
            </div>

            {/* Filter — Row 2: 肌群 */}
            <div className="overflow-x-auto pb-1 mb-6 -mx-1 px-1">
              <div className="flex gap-2 w-max">
                {muscleGroupOptions.map((group) => (
                  <button
                    key={group.value}
                    onClick={() => setSelectedFilter(group.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                      selectedFilter === group.value ? 'text-black' : 'bg-card text-muted-foreground border border-border hover:bg-secondary'
                    }`}
                    style={selectedFilter === group.value ? { background: group.color } : {}}
                  >{group.label}</button>
                ))}
              </div>
            </div>

            {/* Loading */}
            {dbLoading && (
              <div className="flex items-center justify-center h-40 gap-3">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                <span className="text-sm text-muted-foreground">加载自定义动作...</span>
              </div>
            )}

            {/* Grid */}
            {!dbLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {filteredExercises.map((exercise) => {
                  const usageCount = usageCounts[exercise.name] ?? 0;
                  const isFrequent = usageCount >= 3;
                  return (
                  <div
                    key={exercise.id}
                    className="rounded-2xl p-5 bg-card border border-border hover:border-border transition-all cursor-pointer"
                    onClick={() => {
                      if (selectMode) {
                        const dest = backUrl.includes('?')
                          ? `${backUrl}&exercise=${encodeURIComponent(exercise.name)}`
                          : `${backUrl}?exercise=${encodeURIComponent(exercise.name)}`;
                        router.push(dest);
                      } else if (isSelectingExercise) {
                        setSelectedTrainingExercise(exercise);
                        setIsSelectingExercise(false);
                      } else {
                        setSelectedExercise(exercise);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-base"
                          style={{ background: `${getMuscleGroupColor(exercise.muscleGroup)}18`, color: getMuscleGroupColor(exercise.muscleGroup) }}>
                          {getMuscleChar(exercise.muscleGroup)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-base font-semibold text-foreground truncate">{exercise.name.split(' (')[0]}</h3>
                            {isFrequent && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                                style={{ background: 'rgba(204,255,0,0.12)', color: '#CCFF00' }}>常用</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{getMuscleGroupLabel(exercise.muscleGroup)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {/* 编辑按钮 */}
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(exercise); }}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors"
                          title={exercise.isCustom ? '编辑动作' : '查看动作'}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        {/* 删除按钮（仅自定义） */}
                        {exercise.isCustom && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteExercise(exercise); }}
                            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="删除动作"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                    {exercise.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{exercise.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {exercise.equipment && (
                        <span className="px-2 py-0.5 rounded-md text-xs bg-secondary text-muted-foreground">
                          {translateEquipment(exercise.equipment)}
                        </span>
                      )}
                      {exercise.difficulty && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{ background: `${difficultyColors[exercise.difficulty] || '#999'}18`, color: difficultyColors[exercise.difficulty] || '#999' }}>
                          {translateDifficulty(exercise.difficulty)}
                        </span>
                      )}
                      {exercise.isCustom && (
                        <span className="px-2 py-0.5 rounded-md text-xs bg-amber-500/15 text-amber-400 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5" /> 自定义
                        </span>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ========== 动作详情弹窗 ========== */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setSelectedExercise(null)}>
          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-card border border-border"
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 px-6 py-4 flex items-center justify-between bg-card border-b border-border z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base"
                  style={{ background: `${getMuscleGroupColor(selectedExercise.muscleGroup)}18`, color: getMuscleGroupColor(selectedExercise.muscleGroup) }}>
                  {getMuscleChar(selectedExercise.muscleGroup)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{selectedExercise.name.split(' (')[0]}</h2>
                  <p className="text-xs text-muted-foreground">
                    {getMuscleGroupLabel(selectedExercise.muscleGroup)} · {translateCategory(selectedExercise.category)}
                    {selectedExercise.difficulty && <span className="ml-2" style={{color: difficultyColors[selectedExercise.difficulty] || '#999'}}>· {translateDifficulty(selectedExercise.difficulty)}</span>}
                    {selectedExercise.isCustom && <span className="ml-2 text-amber-400">· 自定义动作</span>}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedExercise(null)} className="p-2 rounded-xl bg-secondary hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedExercise.description && (
                <p className="text-sm text-muted-foreground">{selectedExercise.description}</p>
              )}

              {/* Info grid */}
              {selectedExercise.equipment && (
                <div className="rounded-xl p-4 bg-zinc-950 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">器械</div>
                  <p className="text-sm font-semibold text-secondary-foreground">{translateEquipment(selectedExercise.equipment)}</p>
                </div>
              )}

              {selectedExercise.instructions && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-base font-semibold text-foreground">分步指导</h3>
                  </div>
                  <ol className="space-y-2">
                    {selectedExercise.instructions.split('\n').filter(s => s.trim()).map((step, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-xl p-3 bg-zinc-950 border border-border">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted text-secondary-foreground text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                        <span className="text-sm text-muted-foreground leading-relaxed">{step.trim()}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {selectedExercise.tips && selectedExercise.tips.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-base font-semibold text-foreground">训练建议</h3>
                  </div>
                  <ul className="space-y-2">
                    {selectedExercise.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-xl p-3 bg-emerald-500/5 border border-emerald-500/15">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{MUSCLE_GROUP_MAP[tip] ?? tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedExercise.commonMistakes && selectedExercise.commonMistakes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-base font-semibold text-foreground">常见错误</h3>
                  </div>
                  <ul className="space-y-2">
                    {selectedExercise.commonMistakes.map((m, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-xl p-3 bg-amber-500/5 border border-amber-500/15">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-6 py-4 flex gap-3 bg-card border-t border-border">
              <button onClick={() => setSelectedExercise(null)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm bg-secondary text-secondary-foreground hover:bg-muted">
                关闭
              </button>
              <button
                onClick={() => {
                  setSelectedExercise(null);
                  const dest = selectMode
                    ? (backUrl.includes('?')
                        ? `${backUrl}&exercise=${encodeURIComponent(selectedExercise.name)}`
                        : `${backUrl}?exercise=${encodeURIComponent(selectedExercise.name)}`)
                    : `/workout?exercise=${encodeURIComponent(selectedExercise.name)}`;
                  router.push(dest);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white text-black hover:bg-zinc-200"
              >
                <Zap className="w-4 h-4" />{hasActiveSession ? '继续训练' : '开始训练'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 添加动作弹窗 ========== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}>
          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-card border border-border"
            onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 px-6 py-4 flex items-center justify-between bg-card border-b border-border z-10">
              <h2 className="text-lg font-bold text-foreground">添加新动作</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl bg-secondary hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">动作名称 *</label>
                <input value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-foreground text-sm bg-zinc-950 border border-border focus:outline-none focus:border-border"
                  placeholder="例如：哑铃牧师凳弯举" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">主练肌群</label>
                  <select value={newForm.muscleGroup}
                    onChange={(e) => setNewForm({ ...newForm, muscleGroup: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-foreground text-sm bg-zinc-950 border border-border focus:outline-none focus:border-border">
                    {muscleGroupOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">难度</label>
                  <select value={newForm.difficulty}
                    onChange={(e) => setNewForm({ ...newForm, difficulty: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-foreground text-sm bg-zinc-950 border border-border focus:outline-none focus:border-border">
                    {difficultyOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">器械需求</label>
                <input value={newForm.equipment}
                  onChange={(e) => setNewForm({ ...newForm, equipment: e.target.value })}
                  placeholder="例如：哑铃、杠铃、龙门架"
                  className="w-full rounded-xl px-4 py-3 text-foreground text-sm bg-zinc-950 border border-border focus:outline-none focus:border-border" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">动作描述</label>
                <textarea value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  placeholder="简要描述这个动作锻炼哪些肌群"
                  className="w-full rounded-xl px-4 py-3 text-foreground text-sm min-h-[80px] resize-none bg-zinc-950 border border-border focus:outline-none focus:border-border" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">执行步骤</label>
                <textarea value={newForm.instructions}
                  onChange={(e) => setNewForm({ ...newForm, instructions: e.target.value })}
                  placeholder="每行一个步骤，例如：\n1. 仰卧在平板凳上\n2. 双手握杠，宽度略宽于肩\n3. 控制速度下降\n4. 推起回到起始位置"
                  className="w-full rounded-xl px-4 py-3 text-foreground text-sm min-h-[100px] resize-none bg-zinc-950 border border-border focus:outline-none focus:border-border font-sans" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">训练建议</label>
                <TipInput values={newForm.tips} onChange={(v) => setNewForm({ ...newForm, tips: v })} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">常见错误</label>
                <TipInput values={newForm.commonMistakes} onChange={(v) => setNewForm({ ...newForm, commonMistakes: v })} />
              </div>
            </div>

            <div className="sticky bottom-0 px-6 py-4 flex gap-3 bg-card border-t border-border">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm bg-secondary text-secondary-foreground hover:bg-muted">
                取消
              </button>
              <button
                onClick={handleAddExercise}
                disabled={saving || !newForm.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />保存中…</> : <><Plus className="w-4 h-4" />添加动作</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 编辑自定义动作弹窗 ========== */}
      {showEditModal && editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowEditModal(false)}>
          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-card border border-border"
            onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 px-6 py-4 flex items-center justify-between bg-card border-b border-border z-10">
              <h2 className="text-lg font-bold text-foreground">编辑动作</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 rounded-xl bg-secondary hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">动作名称 *</label>
                <input value={editTarget.name}
                  onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-foreground text-sm bg-zinc-950 border border-border focus:outline-none focus:border-border" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">主练肌群</label>
                  <select value={editTarget.muscleGroup}
                    onChange={(e) => setEditTarget({ ...editTarget, muscleGroup: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-foreground text-sm bg-zinc-950 border border-border focus:outline-none focus:border-border">
                    {muscleGroupOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">难度</label>
                  <select value={editTarget.difficulty || '中等'}
                    onChange={(e) => setEditTarget({ ...editTarget, difficulty: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-foreground text-sm bg-zinc-950 border border-border focus:outline-none focus:border-border">
                    {difficultyOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">器械需求</label>
                <input value={editTarget.equipment || ''}
                  onChange={(e) => setEditTarget({ ...editTarget, equipment: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-foreground text-sm bg-zinc-950 border border-border focus:outline-none focus:border-border" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">动作描述</label>
                <textarea value={editTarget.description || ''}
                  onChange={(e) => setEditTarget({ ...editTarget, description: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-foreground text-sm min-h-[80px] resize-none bg-zinc-950 border border-border focus:outline-none focus:border-border" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">执行步骤</label>
                <textarea value={editTarget.instructions || ''}
                  onChange={(e) => setEditTarget({ ...editTarget, instructions: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-foreground text-sm min-h-[100px] resize-none bg-zinc-950 border border-border focus:outline-none focus:border-border font-sans" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">训练建议</label>
                <TipInput values={editTarget.tips || ['']} onChange={(v) => setEditTarget({ ...editTarget, tips: v })} placeholder="训练建议" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">常见错误</label>
                <TipInput values={editTarget.commonMistakes || ['']} onChange={(v) => setEditTarget({ ...editTarget, commonMistakes: v })} placeholder="常见错误" />
              </div>
            </div>

            <div className="sticky bottom-0 px-6 py-4 flex gap-3 bg-card border-t border-border">
              <button onClick={() => { setShowEditModal(false); setEditTarget(null); }}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm bg-secondary text-secondary-foreground hover:bg-muted">
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editTarget.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />保存中...</> : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
