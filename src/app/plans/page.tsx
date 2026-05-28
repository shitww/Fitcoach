"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutTimer } from '@/stores/workoutTimer';
import { Plus, X, Edit, Save, Trash2, ChevronDown, ChevronUp, Check, Layers, Play, Target, Clock, Dumbbell, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';
import { SkeletonList } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import { PageShell, PageHeader, PageContent } from "@/components/layout";

type CustomPlanDay = { dayName: string; exercises: string[]; newExercise: string };
type CustomPlanState = { name: string; days: CustomPlanDay[] };

export default function PlansPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isTrainingActive, isPaused } = useWorkoutTimer();
  const hasActiveSession = isTrainingActive || isPaused;
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState('muscle');
  const [selectedFrequency, setSelectedFrequency] = useState('3');
  const [selectedLevel, setSelectedLevel] = useState('intermediate');
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'custom' or 'my-plans'
  const [customPlan, setCustomPlan] = useState<CustomPlanState>({
    name: '我的自定义计划',
    days: [
      { dayName: '训练日 1', exercises: [], newExercise: '' }
    ]
  });
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [myPlans, setMyPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generateAIPlan = async () => {
    setIsGenerating(true);
    setGeneratedPlan(null);
    try {
      const res = await fetch('/api/analysis/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ goal: selectedGoal, daysPerWeek: Number(selectedFrequency), level: selectedLevel }),
      });
      if (res.status === 401) { router.push('/auth/signin'); return; }
      if (!res.ok) { toast({ message: '生成失败，请重试', type: 'error' }); return; }
      const data = await res.json();
      setGeneratedPlan(data.plan);
    } catch (e) {
      logger.error('生成计划错误:', e);
      toast({ message: '生成失败，请检查网络', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const _generatePlanLegacy = () => {
    const plans: Record<string, Record<string, Record<string, any>>> = {
      muscle: {
        '3': {
          beginner: { name: '初级增肌计划', days: [
            { name: '胸部 + 肱三头肌', exercises: ['卧推 (Bench Press)', '胸肌飞鸟 (Chest Fly)', '双杠臂屈伸 (Dips)', '三头肌下压 (Tricep Pushdown)'] },
            { name: '背部 + 肱二头肌', exercises: ['硬拉 (Deadlift)', '引体向上 (Pull Up)', '划船 (Row)', '二头肌弯举 (Bicep Curl)'] },
            { name: '腿部 + 肩部', exercises: ['深蹲 (Squat)', '腿举 (Leg Press)', '肩上推举 (Overhead Press)', '侧平举 (Lateral Raise)'] },
          ]},
          intermediate: { name: '中级增肌计划', days: [
            { name: '胸部 + 肱三头肌', exercises: ['卧推 (Bench Press)', '上斜卧推 (Incline Press)', '胸肌夹胸 (Cable Crossover)', '双杠臂屈伸 (Dips)', '三头肌下压 (Tricep Pushdown)', '窄距卧推 (Close Grip Bench Press)'] },
            { name: '背部 + 肱二头肌', exercises: ['硬拉 (Deadlift)', '引体向上 (Pull Up)', '杠铃划船 (Barbell Row)', '哑铃单臂划船 (One-Arm Dumbbell Row)', '二头肌弯举 (Bicep Curl)', '锤式弯举 (Hammer Curl)'] },
            { name: '腿部 + 肩部', exercises: ['深蹲 (Squat)', '罗马尼亚硬拉 (Romanian Deadlift)', '腿举 (Leg Press)', '腿弯举 (Leg Curl)', '肩上推举 (Overhead Press)', '侧平举 (Lateral Raise)', '反向飞鸟 (Rear Delt Fly)'] },
          ]},
        },
        '4': { intermediate: { name: '四天增肌计划', days: [
          { name: '胸部', exercises: ['卧推 (Bench Press)', '上斜卧推 (Incline Press)', '胸肌夹胸 (Cable Crossover)', '双杠臂屈伸 (Dips)'] },
          { name: '背部', exercises: ['硬拉 (Deadlift)', '引体向上 (Pull Up)', '杠铃划船 (Barbell Row)', '哑铃单臂划船 (One-Arm Dumbbell Row)'] },
          { name: '腿部', exercises: ['深蹲 (Squat)', '罗马尼亚硬拉 (Romanian Deadlift)', '腿举 (Leg Press)', '腿弯举 (Leg Curl)'] },
          { name: '肩部 + 手臂', exercises: ['肩上推举 (Overhead Press)', '侧平举 (Lateral Raise)', '反向飞鸟 (Rear Delt Fly)', '二头肌弯举 (Bicep Curl)', '锤式弯举 (Hammer Curl)', '三头肌下压 (Tricep Pushdown)'] },
        ]}},
      },
      strength: {
        '3': { intermediate: { name: '力量提升计划', days: [
          { name: '推日', exercises: ['卧推 (Bench Press)', '肩上推举 (Overhead Press)', '哑铃肩推 (Dumbbell Shoulder Press)', '三头肌下压 (Tricep Pushdown)'] },
          { name: '拉日', exercises: ['硬拉 (Deadlift)', '引体向上 (Pull Up)', '杠铃划船 (Barbell Row)', '二头肌弯举 (Bicep Curl)'] },
          { name: '腿日', exercises: ['深蹲 (Squat)', '罗马尼亚硬拉 (Romanian Deadlift)', '腿举 (Leg Press)', '腿弯举 (Leg Curl)'] },
        ]}},
      },
      fat: {
        '3': { intermediate: { name: '减脂训练计划', days: [
          { name: '全身训练 1', exercises: ['深蹲 (Squat)', '卧推 (Bench Press)', '硬拉 (Deadlift)', '肩上推举 (Overhead Press)'] },
          { name: '全身训练 2', exercises: ['箭步蹲 (Lunge)', '哑铃卧推 (Dumbbell Press)', '哑铃单臂划船 (One-Arm Dumbbell Row)', '侧平举 (Lateral Raise)'] },
          { name: '全身训练 3', exercises: ['腿举 (Leg Press)', '双杠臂屈伸 (Dips)', '引体向上 (Pull Up)', '二头肌弯举 (Bicep Curl)'] },
        ]}},
      }
    };
    setGeneratedPlan(plans[selectedGoal]?.[selectedFrequency]?.[selectedLevel] || null);
  };

  // 获取我的计划
  const fetchMyPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/plans', {
        credentials: 'include'
      });
      if (res.status === 401) {
        logger.warn('User not authenticated for plans');
        setMyPlans([]);
      } else if (res.ok) {
        const data = await res.json();
        setMyPlans(data.plans || []);
      } else {
        const text = await res.text();
        logger.warn('获取计划失败:', text);
        setMyPlans([]);
      }
    } catch (error) {
      logger.error('获取计划错误:', error);
      setMyPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // 删除计划（2-click 确认）
  const deletePlan = async (planId: string) => {
    if (confirmDeleteId !== planId) { setConfirmDeleteId(planId); return; }
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/plans/${planId}`, { method: 'DELETE', credentials: 'include' });
      if (res.status === 401) { router.push('/auth/signin'); return; }
      if (res.ok) {
        toast({ message: '计划已删除', type: 'success' });
        fetchMyPlans();
      } else {
        toast({ message: '删除失败', type: 'error' });
      }
    } catch (error) {
      logger.error('删除计划错误:', error);
      toast({ message: '删除失败', type: 'error' });
    }
  };

  // 组件加载时获取我的计划
  useEffect(() => {
    fetchMyPlans();
  }, []);

  // 自定义计划相关函数
  const addTrainingDay = () => {
    setCustomPlan(prev => ({
      ...prev,
      days: [...prev.days, { dayName: `训练日 ${prev.days.length + 1}`, exercises: [], newExercise: '' }]
    }));
  };

  const removeTrainingDay = (index: number) => {
    if (customPlan.days.length > 1) {
      setCustomPlan(prev => ({
        ...prev,
        days: prev.days.filter((_, i) => i !== index)
      }));
    }
  };

  const updateDayName = (index: number, newName: string) => {
    setCustomPlan(prev => ({
      ...prev,
      days: prev.days.map((day, i) => i === index ? { ...day, dayName: newName } : day)
    }));
  };

  const addExercise = (dayIndex: number) => {
    const day = customPlan.days[dayIndex];
    if (day.newExercise.trim()) {
      setCustomPlan(prev => ({
        ...prev,
        days: prev.days.map((d, i) => {
          if (i === dayIndex) {
            return { ...d, exercises: [...d.exercises, d.newExercise.trim()], newExercise: '' };
          }
          return d;
        })
      }));
    }
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    setCustomPlan(prev => ({
      ...prev,
      days: prev.days.map((day, i) => {
        if (i === dayIndex) {
          return { ...day, exercises: day.exercises.filter((_, ei) => ei !== exerciseIndex) };
        }
        return day;
      })
    }));
  };

  const saveCustomPlan = async () => {
    try {
      const planData = {
        name: customPlan.name,
        goal: 'muscle',
        frequency: customPlan.days.length,
        level: 'intermediate',
        days: customPlan.days.map(day => ({ dayName: day.dayName, exercises: day.exercises }))
      };
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(planData)
      });
      if (res.status === 401) { router.push('/auth/signin'); return; }
      if (res.ok) {
        toast({ message: '计划保存成功', type: 'success' });
        router.push('/');
      } else {
        toast({ message: '保存失败，请重试', type: 'error' });
      }
    } catch (error) {
      logger.error('保存错误:', error);
      toast({ message: '保存失败，请检查网络', type: 'error' });
    }
  };

  return (
    <PageShell>
      <PageHeader title="训练计划" />
      <PageContent>

        {/* 选项卡 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all border ${activeTab === 'generate' ? 'bg-primary text-primary-foreground border-transparent' : 'bg-card text-foreground border-border hover:bg-secondary'}`}
          >
            生成计划
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all border ${activeTab === 'custom' ? 'bg-primary text-primary-foreground border-transparent' : 'bg-card text-foreground border-border hover:bg-secondary'}`}
          >
            自定义计划
          </button>
          <button
            onClick={() => setActiveTab('my-plans')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all border ${activeTab === 'my-plans' ? 'bg-primary text-primary-foreground border-transparent' : 'bg-card text-foreground border-border hover:bg-secondary'}`}
          >
            我的计划
          </button>
        </div>

        {/* 生成计划 */}
        {activeTab === 'generate' && (
          <div className="rounded-2xl p-6 mb-8 bg-card border border-border">
            <h2 className="text-lg font-bold mb-6">生成专属训练计划</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-muted-foreground">健身目标</label>
                <select value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-foreground bg-secondary border border-border">
                  <option value="muscle">增肌</option>
                  <option value="strength">力量</option>
                  <option value="fat">减脂</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-muted-foreground">每周训练次数</label>
                <select value={selectedFrequency} onChange={(e) => setSelectedFrequency(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-foreground bg-secondary border border-border">
                  <option value="3">3次</option>
                  <option value="4">4次</option>
                  <option value="5">5次</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-muted-foreground">训练水平</label>
                <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-foreground bg-secondary border border-border">
                  <option value="beginner">初级</option>
                  <option value="intermediate">中级</option>
                  <option value="advanced">高级</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-muted-foreground">训练偏好</label>
                <select
                  className="w-full rounded-xl px-4 py-3 text-foreground bg-secondary border border-border">
                  <option value="equipment">器械训练</option>
                  <option value="bodyweight">自重训练</option>
                  <option value="mixed">混合训练</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-muted-foreground">训练时长</label>
                <select
                  className="w-full rounded-xl px-4 py-3 text-foreground bg-secondary border border-border">
                  <option value="30">30分钟</option>
                  <option value="45">45分钟</option>
                  <option value="60">60分钟</option>
                  <option value="90">90分钟</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-muted-foreground">恢复能力</label>
                <select
                  className="w-full rounded-xl px-4 py-3 text-foreground bg-secondary border border-border">
                  <option value="fast">快速</option>
                  <option value="normal">正常</option>
                  <option value="slow">较慢</option>
                </select>
              </div>
            </div>
            <button onClick={generateAIPlan} disabled={isGenerating}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-primary-foreground ${isGenerating ? 'bg-primary/40' : 'bg-primary hover:bg-primary/90'}`}>
              {isGenerating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> AI 正在生成个性化计划…</>
                : <><Sparkles className="w-4 h-4" /> AI 生成个性化计划</>}
            </button>
          </div>
        )}

        {/* 自定义计划 */}
        {activeTab === 'custom' && (
          <div className="rounded-2xl p-6 mb-8 bg-card border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">创建自定义训练计划</h2>
            </div>
            
            {/* 计划名称 */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-semibold text-muted-foreground">计划名称</label>
              <input
                type="text"
                value={customPlan.name}
                onChange={(e) => setCustomPlan(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-foreground bg-secondary border border-border"
                placeholder="输入计划名称"
              />
            </div>

            {/* 训练日 */}
            <div className="space-y-4 mb-6">
              {customPlan.days.map((day, index) => (
                <div key={index} className="rounded-xl p-4 bg-secondary border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={day.dayName}
                      onChange={(e) => updateDayName(index, e.target.value)}
                      className="flex-1 rounded-xl px-3 py-2 text-foreground mr-3 bg-background border border-border"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => removeTrainingDay(index)}
                        disabled={customPlan.days.length <= 1}
                        className={`p-2 rounded-lg transition-all ${customPlan.days.length <= 1 ? 'bg-secondary text-muted-foreground opacity-40' : 'bg-danger/10 text-danger'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 动作列表 */}
                  <div className="space-y-2 mb-3">
                    {day.exercises.map((exercise, ei) => (
                      <div key={ei} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-primary"></div>
                        <span className="flex-1 text-sm text-foreground/60">{exercise}</span>
                        <button
                          onClick={() => removeExercise(index, ei)}
                          className="p-1.5 rounded-lg transition-all bg-danger/10 text-danger"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 添加动作 */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={day.newExercise}
                      onChange={(e) => {
                        setCustomPlan(prev => ({
                          ...prev,
                          days: prev.days.map((d, i) => {
                            if (i === index) {
                              return { ...d, newExercise: e.target.value };
                            }
                            return d;
                          })
                        }));
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && addExercise(index)}
                      className="flex-1 rounded-xl px-3 py-2 text-foreground bg-background border border-border"
                      placeholder="输入动作名称"
                    />
                    <button
                      onClick={() => addExercise(index)}
                      disabled={!day.newExercise.trim()}
                      className={`p-2.5 rounded-xl transition-all ${day.newExercise.trim() ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-muted-foreground opacity-40'}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 添加训练日 */}
            <button
              onClick={addTrainingDay}
              className="w-full py-3 rounded-xl font-bold transition-all mb-6 text-primary-foreground bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 inline mr-2" />添加训练日
            </button>

            {/* 保存计划 */}
            <button
              onClick={saveCustomPlan}
              className="w-full py-3 rounded-xl font-bold transition-all text-primary-foreground bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 inline mr-2" />保存自定义计划
            </button>
          </div>
        )}

        {/* 我的计划 */}
        {activeTab === 'my-plans' && (
          <div className="rounded-2xl p-6 mb-8 bg-card border border-border">
            <h2 className="text-lg font-bold mb-6">我的计划</h2>
            {loading ? (
              <SkeletonList rows={2} />
            ) : myPlans.length === 0 ? (
              <EmptyState
                compact
                icon={<Layers className="w-7 h-7" />}
                title="还没有保存的计划"
                description="创建自定义计划或生成计划后，会显示在这里"
              />
            ) : (
              <div className="space-y-4">
                {myPlans.map((plan) => (
                  <div key={plan.id} className="rounded-xl p-4 bg-secondary border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-primary">{plan.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/workout?planId=${plan.id}`)}
                          className="p-2 rounded-lg transition-all bg-primary/10 text-primary"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className={`p-2 rounded-lg transition-all text-danger ${confirmDeleteId === plan.id ? 'bg-danger/30' : 'bg-danger/10'}`}
                          title={confirmDeleteId === plan.id ? '再次点击确认删除' : '删除'}
                        >
                          {confirmDeleteId === plan.id ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Target className="w-3.5 h-3.5" />
                        <span>{plan.goal === 'muscle' ? '增肌' : plan.goal === 'strength' ? '力量' : '减脂'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>每周 {plan.frequency} 次</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>{plan.level === 'beginner' ? '初级' : '中级'}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {plan.days.map((day: any, index: number) => (
                        <div key={index} className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-semibold">{day.dayName}</div>
                            <button
                              onClick={() => {
                                // 跳转到训练页面，携带该天的训练动作
                                const exercises = JSON.parse(day.exercises);
                                const exercisesParam = encodeURIComponent(JSON.stringify(exercises));
                                window.location.href = `/workout?exercises=${exercisesParam}&dayName=${encodeURIComponent(day.dayName)}`;
                              }}
                              className="px-2 py-1 rounded text-xs font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              {hasActiveSession ? '继续训练' : '开始训练'}
                            </button>
                          </div>
                          <div className="space-y-0.5 pl-3">
                            {JSON.parse(day.exercises).map((ex: string, ei: number) => (
                              <div key={ei} className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-primary"></div>
                                {ex}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generated plan — AI format */}
        {activeTab === 'generate' && generatedPlan && (
          <div className="rounded-2xl p-6 mb-8 bg-card border border-primary/30">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">AI 个性化计划</span>
                </div>
                <h2 className="text-xl font-black text-primary">{generatedPlan.planName}</h2>
              </div>
              <button
                onClick={async () => {
                  try {
                    const planData = {
                      name: generatedPlan.planName,
                      goal: selectedGoal,
                      frequency: generatedPlan.weeklyStructure?.length || Number(selectedFrequency),
                      level: selectedLevel,
                      days: (generatedPlan.weeklyStructure || []).map((d: any) => ({
                        dayName: `${d.day} — ${d.focus}`,
                        exercises: (d.exercises || []).map((e: any) => e.name || e),
                      })),
                    };
                    const res = await fetch('/api/plans', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      credentials: 'include', body: JSON.stringify(planData),
                    });
                    if (res.ok) { toast({ message: '计划已保存', type: 'success' }); fetchMyPlans(); }
                    else { toast({ message: '保存失败', type: 'error' }); }
                  } catch (e) { logger.error('保存错误:', e); toast({ message: '保存失败', type: 'error' }); }
                }}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap text-primary-foreground bg-primary hover:bg-primary/90"
              >
                保存到我的计划
              </button>
            </div>

            {/* Overview */}
            {generatedPlan.overview && (
              <p className="text-sm mb-5 leading-relaxed text-muted-foreground">{generatedPlan.overview}</p>
            )}

            {/* Weekly structure */}
            <div className="space-y-3 mb-5">
              {(generatedPlan.weeklyStructure || []).map((day: any, i: number) => (
                <div key={i} className="rounded-xl p-4 bg-secondary border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black bg-primary/10 text-primary">{i + 1}</div>
                    <div>
                      <div className="font-bold text-sm">{day.day}</div>
                      <div className="text-xs text-primary">{day.focus}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(day.exercises || []).map((ex: any, ei: number) => (
                      <div key={ei} className="rounded-lg p-2.5 bg-card/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold">{ex.name}</span>
                          <span className="text-xs font-mono text-primary">{ex.sets}组×{ex.reps}</span>
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground/60">
                          {ex.rest && <span>休息 {ex.rest}</span>}
                          {ex.notes && <span className="flex-1">{ex.notes}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Progression guide */}
            {generatedPlan.progressionGuide && (
              <div className="rounded-xl p-4 mb-3 bg-primary/10 border border-primary/20">
                <div className="text-xs font-semibold mb-1 text-primary">渐进超负荷方案</div>
                <p className="text-sm text-muted-foreground">{generatedPlan.progressionGuide}</p>
              </div>
            )}
            {generatedPlan.deloadRecommendation && (
              <div className="rounded-xl p-4 mb-3 bg-recovery/10 border border-recovery/20">
                <div className="text-xs font-semibold mb-1 text-recovery">减量周建议</div>
                <p className="text-sm text-muted-foreground">{generatedPlan.deloadRecommendation}</p>
              </div>
            )}

            {/* Warning */}
            {generatedPlan.warning && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                  <span className="text-xs font-semibold text-warning">安全注意事项</span>
                </div>
                <p className="text-sm text-muted-foreground">{generatedPlan.warning}</p>
              </div>
            )}
          </div>
        )}

        {/* 推荐计划 */}
        <div className="rounded-2xl p-6 bg-card border border-border">
          <h2 className="text-lg font-bold mb-6">推荐计划</h2>
          <div className="space-y-4">
            {
              [
                {
                  title: '三分化训练计划',
                  desc: '适合中级训练者，每周 3 次',
                  days: [
                    {
                      dayName: 'Day1 推 (胸 / 肩 / 三头)',
                      exercises: [
                        '杠铃卧推 (Barbell Bench Press)',
                        '上斜哑铃卧推 (Incline Dumbbell Press)',
                        '双杠臂屈伸 (Dips)',
                        '仰卧臂屈伸 (Tricep Extension)',
                        '单臂龙门架Y字侧平举 (Lateral Raise)'
                      ]
                    },
                    {
                      dayName: 'Day2 拉 (背阔 / 上背 / 二头)',
                      exercises: [
                        '单手钢线下拉 (One-Arm Lat Pulldown)',
                        '单手器械划船 (One-Arm Machine Row)',
                        '对握下拉 (Close Grip Pulldown)',
                        '开肘划船 (Bent Over Row)',
                        '肱线大臂屈角度弯举 (Bicep Curl)'
                      ]
                    },
                    {
                      dayName: 'Day3 腿 (髋 / 股四 / 臀 / 腘绳肌 / 竖脊肌)',
                      exercises: [
                        '单腿哑铃硬拉 (Single-Leg Dumbbell Deadlift)',
                        '保加利亚分腿蹲 (Bulgarian Split Squat)',
                        '高脚杯深蹲 (Goblet Squat)',
                        '杠铃罗马尼亚硬拉 (Romanian Deadlift)',
                        '山羊挺身 (Back Extension)'
                      ]
                    }
                  ]
                }
              ].map((plan, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold" style={{ color: 'var(--accent)' }}>{plan.title}</h3>
                    <button
                      onClick={async () => {
                        try {
                          // 检查用户是否登录
                          const sessionRes = await fetch('/api/auth/session');
                          if (!sessionRes.ok) {
                            toast({ message: '请先登录再保存计划', type: 'error' });
                            return;
                          }
                          const sessionData = await sessionRes.json();
                          if (!sessionData.user) {
                            toast({ message: '请先登录再保存计划', type: 'error' });
                            return;
                          }

                          // 准备保存数据
                          const planData = {
                            name: plan.title,
                            goal: 'muscle',
                            frequency: plan.days.length,
                            level: 'intermediate',
                            days: plan.days
                          };

                          const res = await fetch('/api/plans', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify(planData)
                          });

                          if (res.ok) {
                            toast({ message: '计划保存成功', type: 'success' });
                            fetchMyPlans();
                          } else {
                            toast({ message: '保存失败', type: 'error' });
                          }
                        } catch (error) {
                          logger.error('保存计划错误:', error);
                          toast({ message: '保存失败', type: 'error' });
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                      style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                    >
                      保存到我的计划
                    </button>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{plan.desc}</p>
                  
                  {/* 计划说明 */}
                  <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-dim)' }}>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--accent)' }}>计划说明</h4>
                    <ul className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      <li>• 采用三分化训练模式，分别针对推、拉、腿三大肌群</li>
                      <li>• 每个训练日包含5个核心动作，全面覆盖目标肌群</li>
                      <li>• 推荐每组训练间休息60-90秒，保证肌肉恢复</li>
                      <li>• 逐渐增加重量，保持正确动作姿势</li>
                      <li>• 结合合理饮食，效果更佳</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    {plan.days.map((day, j) => (
                      <div key={j} className="ml-2">
                        <div className="font-semibold text-sm mb-2">{day.dayName}</div>
                        
                        {/* 每日训练说明 */}
                        <div className="mb-3 p-2 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          {j === 0 && '重点训练胸部、肩部和肱三头肌，以卧推为核心动作，配合上斜训练和双杠臂屈伸，全面发展推力肌群。'}
                          {j === 1 && '重点训练背部和肱二头肌，以下拉和划船动作为主，注重背部宽度和厚度的发展。'}
                          {j === 2 && '重点训练腿部、臀部和核心，包含单腿训练和复合动作，全面发展下肢力量和稳定性。'}
                        </div>
                        
                        <div className="space-y-1 pl-3">
                          {day.exercises.map((ex, k) => (
                            <div key={k} className="flex items-start gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                              <div className="w-1 h-1 rounded-full flex-shrink-0 mt-1" style={{ background: 'var(--accent)' }}></div>
                              <div>
                                {ex}
                                {/* 动作说明 */}
                                {j === 0 && k === 0 && <span className="block mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>主项，越往后越重，不力竭</span>}
                                {j === 0 && k === 1 && <span className="block mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>上胸主练，保持持续张力</span>}
                                {j === 0 && k === 2 && <span className="block mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>偏下胸做法，做不了就退阶</span>}
                                {j === 1 && k === 0 && <span className="block mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>背阔主练，顺着肌纤维方向拉，优先对握</span>}
                                {j === 1 && k === 1 && <span className="block mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>背阔主练，幅度不用贪大，保持张力</span>}
                                {j === 2 && k === 0 && <span className="block mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>建立单腿稳定、髋控制和后侧链发力</span>}
                                {j === 2 && k === 1 && <span className="block mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>前腿主导，后腿尽量放松</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Nav */}
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={() => router.push('/')} className="px-6 py-3 rounded-xl font-bold bg-secondary border border-border text-foreground">返回首页</button>
          <button onClick={() => router.push('/workout')} className="px-6 py-3 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90">{hasActiveSession ? '继续训练' : '开始训练'}</button>
        </div>
      </PageContent>

    </PageShell>
  );
}
