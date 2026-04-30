"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Edit, Save, Trash2, ChevronDown, ChevronUp, Check, Layers, Play, Target, Clock, Dumbbell } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function PlansPage() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState('muscle');
  const [selectedFrequency, setSelectedFrequency] = useState('3');
  const [selectedLevel, setSelectedLevel] = useState('intermediate');
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'custom' or 'my-plans'
  const [customPlan, setCustomPlan] = useState({
    name: '我的自定义计划',
    days: [
      { dayName: '训练日 1', exercises: [], newExercise: '' }
    ]
  });
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [myPlans, setMyPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generatePlan = () => {
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

  // 删除计划
  const deletePlan = async (planId: string) => {
    if (!confirm('确定删除这个计划吗？')) return;
    try {
      const res = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.status === 401) {
        logger.warn('User not authenticated for deleting plan');
        alert('请先登录再删除计划');
        router.push('/auth/signin');
      } else if (res.ok) {
        fetchMyPlans();
      } else {
        const text = await res.text();
        logger.warn('删除失败:', text);
        alert('删除失败');
      }
    } catch (error) {
      logger.error('删除计划错误:', error);
      alert('删除失败');
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
      // 检查用户是否登录
      const sessionRes = await fetch('/api/auth/session');
      if (sessionRes.status === 401 || !sessionRes.ok) {
        alert('请先登录再保存计划');
        router.push('/auth/signin');
        return;
      }
      const sessionData = await sessionRes.json();
      if (!sessionData.user) {
        alert('请先登录再保存计划');
        router.push('/auth/signin');
        return;
      }

      // 准备保存数据，移除newExercise字段
      const planData = {
        name: customPlan.name,
        goal: 'muscle', // 默认目标
        frequency: customPlan.days.length, // 根据训练日数量设置频率
        level: 'intermediate', // 默认水平
        days: customPlan.days.map(day => ({
          dayName: day.dayName,
          exercises: day.exercises // 直接传递数组，API会在后端进行JSON.stringify
        }))
      };
      
      logger.info('保存计划数据:', planData);
      
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(planData)
      });
      
      if (res.status === 401) {
        logger.warn('User not authenticated for saving plan');
        alert('请先登录再保存计划');
        router.push('/auth/signin');
      } else if (res.ok) {
        alert('计划保存成功！');
        router.push('/');
      } else {
        const responseText = await res.text();
        logger.warn('保存失败:', responseText);
        alert('保存失败: ' + responseText);
      }
    } catch (error) {
      logger.error('保存错误:', error);
      alert('保存失败，请检查网络连接');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(204,255,0,0.04) 0%, transparent 60%)'
      }} />

      <div className="relative max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8" style={{ color: '#CCFF00' }}>训练计划</h1>

        {/* 选项卡 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'generate' ? 'bg-CCFF00 text-black' : 'bg-111 border border-1e1e1e text-white'}`}
            style={{
              background: activeTab === 'generate' ? '#CCFF00' : '#111',
              border: activeTab === 'generate' ? 'none' : '1px solid #1e1e1e',
              color: activeTab === 'generate' ? '#000' : '#fff'
            }}
          >
            生成计划
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'custom' ? 'bg-CCFF00 text-black' : 'bg-111 border border-1e1e1e text-white'}`}
            style={{
              background: activeTab === 'custom' ? '#CCFF00' : '#111',
              border: activeTab === 'custom' ? 'none' : '1px solid #1e1e1e',
              color: activeTab === 'custom' ? '#000' : '#fff'
            }}
          >
            自定义计划
          </button>
          <button
            onClick={() => setActiveTab('my-plans')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'my-plans' ? 'bg-CCFF00 text-black' : 'bg-111 border border-1e1e1e text-white'}`}
            style={{
              background: activeTab === 'my-plans' ? '#CCFF00' : '#111',
              border: activeTab === 'my-plans' ? 'none' : '1px solid #1e1e1e',
              color: activeTab === 'my-plans' ? '#000' : '#fff'
            }}
          >
            我的计划
          </button>
        </div>

        {/* 生成计划 */}
        {activeTab === 'generate' && (
          <div className="rounded-2xl p-6 mb-8" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
            <h2 className="text-lg font-bold mb-6">生成专属训练计划</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>健身目标</label>
                <select value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-white" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                  <option value="muscle">增肌</option>
                  <option value="strength">力量</option>
                  <option value="fat">减脂</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>每周训练次数</label>
                <select value={selectedFrequency} onChange={(e) => setSelectedFrequency(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-white" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                  <option value="3">3次</option>
                  <option value="4">4次</option>
                  <option value="5">5次</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>训练水平</label>
                <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-white" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                  <option value="beginner">初级</option>
                  <option value="intermediate">中级</option>
                  <option value="advanced">高级</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>训练偏好</label>
                <select
                  className="w-full rounded-xl px-4 py-3 text-white" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                  <option value="equipment">器械训练</option>
                  <option value="bodyweight">自重训练</option>
                  <option value="mixed">混合训练</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>训练时长</label>
                <select
                  className="w-full rounded-xl px-4 py-3 text-white" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                  <option value="30">30分钟</option>
                  <option value="45">45分钟</option>
                  <option value="60">60分钟</option>
                  <option value="90">90分钟</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>恢复能力</label>
                <select
                  className="w-full rounded-xl px-4 py-3 text-white" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                  <option value="fast">快速</option>
                  <option value="normal">正常</option>
                  <option value="slow">较慢</option>
                </select>
              </div>
            </div>
            <button onClick={generatePlan}
              className="w-full py-3 rounded-xl font-bold text-black transition-all"
              style={{ background: '#CCFF00', boxShadow: '0 0 20px rgba(204,255,0,0.2)' }}>
              生成计划
            </button>
          </div>
        )}

        {/* 自定义计划 */}
        {activeTab === 'custom' && (
          <div className="rounded-2xl p-6 mb-8" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">创建自定义训练计划</h2>
            </div>
            
            {/* 计划名称 */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>计划名称</label>
              <input
                type="text"
                value={customPlan.name}
                onChange={(e) => setCustomPlan(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-white" style={{ background: '#111', border: '1px solid #1e1e1e' }}
                placeholder="输入计划名称"
              />
            </div>

            {/* 训练日 */}
            <div className="space-y-4 mb-6">
              {customPlan.days.map((day, index) => (
                <div key={index} className="rounded-xl p-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={day.dayName}
                      onChange={(e) => updateDayName(index, e.target.value)}
                      className="flex-1 rounded-xl px-3 py-2 text-white mr-3" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => removeTrainingDay(index)}
                        disabled={customPlan.days.length <= 1}
                        className="p-2 rounded-lg transition-all"
                        style={{
                          background: customPlan.days.length <= 1 ? '#1a1a1a' : 'rgba(255,59,92,0.1)',
                          color: customPlan.days.length <= 1 ? 'rgba(255,255,255,0.2)' : '#FF3B5C'
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 动作列表 */}
                  <div className="space-y-2 mb-3">
                    {day.exercises.map((exercise, ei) => (
                      <div key={ei} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#CCFF00' }}></div>
                        <span className="flex-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{exercise}</span>
                        <button
                          onClick={() => removeExercise(index, ei)}
                          className="p-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(255,59,92,0.1)', color: '#FF3B5C' }}
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
                      className="flex-1 rounded-xl px-3 py-2 text-white" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                      placeholder="输入动作名称"
                    />
                    <button
                      onClick={() => addExercise(index)}
                      disabled={!day.newExercise.trim()}
                      className="p-2.5 rounded-xl transition-all"
                      style={{
                        background: day.newExercise.trim() ? '#CCFF00' : '#1a1a1a',
                        color: day.newExercise.trim() ? '#000' : 'rgba(255,255,255,0.3)'
                      }}
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
              className="w-full py-3 rounded-xl font-bold text-black transition-all mb-6"
              style={{ background: '#CCFF00', boxShadow: '0 0 20px rgba(204,255,0,0.2)' }}
            >
              <Plus className="w-4 h-4 inline mr-2" />添加训练日
            </button>

            {/* 保存计划 */}
            <button
              onClick={saveCustomPlan}
              className="w-full py-3 rounded-xl font-bold text-black transition-all"
              style={{ background: '#CCFF00', boxShadow: '0 0 20px rgba(204,255,0,0.2)' }}
            >
              <Save className="w-4 h-4 inline mr-2" />保存自定义计划
            </button>
          </div>
        )}

        {/* 我的计划 */}
        {activeTab === 'my-plans' && (
          <div className="rounded-2xl p-6 mb-8" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
            <h2 className="text-lg font-bold mb-6">我的计划</h2>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-CCFF00 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : myPlans.length === 0 ? (
              <div className="text-center py-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Layers className="w-12 h-12 mx-auto mb-4" />
                <p>还没有保存的计划</p>
                <p className="text-sm mt-2">创建自定义计划或生成计划后，会显示在这里</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myPlans.map((plan) => (
                  <div key={plan.id} className="rounded-xl p-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold" style={{ color: '#CCFF00' }}>{plan.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/workout?planId=${plan.id}`)}
                          className="p-2 rounded-lg transition-all"
                          style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00' }}
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="p-2 rounded-lg transition-all"
                          style={{ background: 'rgba(255,59,92,0.1)', color: '#FF3B5C' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <Target className="w-3.5 h-3.5" />
                        <span>{plan.goal === 'muscle' ? '增肌' : plan.goal === 'strength' ? '力量' : '减脂'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>每周 {plan.frequency} 次</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>{plan.level === 'beginner' ? '初级' : '中级'}</span>
                      </div>
                    </div>
                    <div className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
                              className="px-2 py-1 rounded text-xs font-semibold transition-all"
                              style={{ background: '#CCFF00', color: '#000' }}
                            >
                              开始训练
                            </button>
                          </div>
                          <div className="space-y-0.5 pl-3">
                            {JSON.parse(day.exercises).map((ex: string, ei: number) => (
                              <div key={ei} className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#CCFF00' }}></div>
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

        {/* Generated plan */}
        {activeTab === 'generate' && generatedPlan && (
          <div className="rounded-2xl p-6 mb-8" style={{ background: '#0a0a0a', border: '1px solid rgba(204,255,0,0.2)', boxShadow: '0 0 20px rgba(204,255,0,0.06)' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black" style={{ color: '#CCFF00' }}>{generatedPlan.name}</h2>
              <button
                onClick={async () => {
                  try {
                    // 检查用户是否登录
                    const sessionRes = await fetch('/api/auth/session');
                    if (!sessionRes.ok) {
                      alert('请先登录再保存计划');
                      return;
                    }
                    const sessionData = await sessionRes.json();
                    if (!sessionData.user) {
                      alert('请先登录再保存计划');
                      return;
                    }

                    // 准备保存数据
                    const planData = {
                      name: generatedPlan.name,
                      goal: selectedGoal,
                      frequency: selectedFrequency,
                      level: selectedLevel,
                      days: generatedPlan.days
                    };

                    const res = await fetch('/api/plans', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify(planData)
                    });

                    if (res.ok) {
                      alert('计划保存成功！');
                      fetchMyPlans();
                    } else {
                      alert('保存失败');
                    }
                  } catch (error) {
                    logger.error('保存计划错误:', error);
                    alert('保存失败');
                  }
                }}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-black transition-all"
                style={{ background: '#CCFF00' }}
              >
                保存到我的计划
              </button>
            </div>
            <div className="space-y-4">
              {generatedPlan.days.map((day: any, index: number) => (
                <div key={index} className="rounded-xl p-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                  <h3 className="font-bold mb-3" style={{ color: '#CCFF00' }}>第 {index + 1} 天: {day.name}</h3>
                  <ul className="space-y-1.5">
                    {day.exercises.map((ex: string, ei: number) => (
                      <li key={ei} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#CCFF00' }}></div>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl p-4" style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.15)' }}>
              <h3 className="font-bold mb-2">训练建议</h3>
              <ul className="space-y-1 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <li>• 每组训练间休息 60-90 秒</li>
                <li>• 逐渐增加重量，保持正确动作姿势</li>
                <li>• 训练后充分休息，保证肌肉恢复</li>
                <li>• 结合合理饮食，效果更佳</li>
              </ul>
            </div>
          </div>
        )}

        {/* 推荐计划 */}
        <div className="rounded-2xl p-6" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
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
                <div key={i} className="rounded-xl p-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold" style={{ color: '#CCFF00' }}>{plan.title}</h3>
                    <button
                      onClick={async () => {
                        try {
                          // 检查用户是否登录
                          const sessionRes = await fetch('/api/auth/session');
                          if (!sessionRes.ok) {
                            alert('请先登录再保存计划');
                            return;
                          }
                          const sessionData = await sessionRes.json();
                          if (!sessionData.user) {
                            alert('请先登录再保存计划');
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
                            alert('计划保存成功！');
                            fetchMyPlans();
                          } else {
                            alert('保存失败');
                          }
                        } catch (error) {
                          logger.error('保存计划错误:', error);
                          alert('保存失败');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                      style={{ background: '#CCFF00', color: '#000' }}
                    >
                      保存到我的计划
                    </button>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{plan.desc}</p>
                  
                  {/* 计划说明 */}
                  <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.15)' }}>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: '#CCFF00' }}>计划说明</h4>
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
                              <div className="w-1 h-1 rounded-full flex-shrink-0 mt-1" style={{ background: '#CCFF00' }}></div>
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
          <button onClick={() => router.push('/')} className="px-6 py-3 rounded-xl font-bold" style={{ background: '#111', border: '1px solid #1e1e1e' }}>返回首页</button>
          <button onClick={() => router.push('/workout')} className="px-6 py-3 rounded-xl font-bold text-black" style={{ background: '#CCFF00' }}>开始训练</button>
        </div>
      </div>
    </div>
  );
}
