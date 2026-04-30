"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Dumbbell, Clock, Play, Pause, Check, 
  Plus, Minus, X, Timer, Flame, Activity, Search, Target, 
  BookOpen, Cpu, Barrel, Loader2
} from 'lucide-react';
import ExercisePicker from '@/components/ExercisePicker';
import { useWorkoutTimer } from '@/stores/workoutTimer';
import { getLastExerciseRecord } from '@/app/actions/workout';
import { logger } from '@/lib/logger';

interface Set {
  weight: number;
  reps: number;
  rir: number | null;
  isFailure: boolean;
  estimated1RM: number;
  isBodyweight: boolean;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  restTime: number;
  totalVolume: number;
}

const restTimePresets = [
  { label: '短', seconds: 60 }, { label: '中', seconds: 90 },
  { label: '长', seconds: 120 }, { label: '超长', seconds: 180 }
];

const getExerciseMuscleGroup = (exercise: string): string => {
  // 简化版本，实际应该从动作库中获取肌群信息
  return '未知';
};

const getWorkoutMuscleGroups = (exercises: Exercise[]): string[] => {
  // 简化版本，实际应该从动作库中获取肌群信息
  const groups = new Set<string>();
  exercises.forEach(ex => {
    // 这里可以根据动作名称推断肌群，或者从数据库中获取
    groups.add('未知');
  });
  return Array.from(groups);
};

// 动作注意事项数据库
const exerciseNotes: Record<string, { tips: string[]; mistakes: string[] }> = {
  '卧推': {
    tips: ['保持核心收紧，背部贴紧凳面', '下降时控制速度，避免反弹', '推起时呼气，下降时吸气'],
    mistakes: ['腰部拱起', '手腕弯曲', '下降过快']
  },
  '深蹲': {
    tips: ['保持膝盖与脚尖方向一致', '重心在脚后跟', '下降时吸气，推起时呼气'],
    mistakes: ['膝盖内扣', '背部弯曲', '深度不够']
  },
  '硬拉': {
    tips: ['保持背部挺直，避免弯腰', '用腿发力，不是用背', '提起时呼气，下降时吸气'],
    mistakes: ['背部弯曲', '膝盖内扣', '提起时腰部过度伸展']
  },
  '引体向上': {
    tips: ['保持核心收紧，避免摆动', '拉动时呼气，下降时吸气', '尝试全范围运动'],
    mistakes: ['身体摆动', '动作范围不足', '只用手臂力量']
  },
  '肩推': {
    tips: ['保持核心收紧，避免腰部过度伸展', '推起时呼气，下降时吸气', '保持手腕中立'],
    mistakes: ['腰部过度伸展', '手腕弯曲', '下降过快']
  },
  '二头弯举': {
    tips: ['保持肘部固定，避免晃动', '弯曲时呼气，放下时吸气', '控制动作速度'],
    mistakes: ['身体摆动', '肘部移动', '动作过快']
  },
  '三头下压': {
    tips: ['保持肘部固定，避免移动', '推动时呼气，回到时吸气', '控制动作速度'],
    mistakes: ['肘部移动', '动作范围不足', '身体前倾']
  },
  '平板支撑': {
    tips: ['保持身体成一条直线', '收紧核心和臀部', '保持均匀呼吸'],
    mistakes: ['臀部抬起', '腰部下垂', '呼吸不均匀']
  },
  '腿举': {
    tips: ['保持背部贴紧座椅', '双脚与肩同宽，脚尖稍向外', '推起时呼气，下降时吸气'],
    mistakes: ['背部离开座椅', '膝盖内扣', '下降过低']
  },
  '侧平举': {
    tips: ['保持手臂微屈，不要完全伸直', '抬起时呼气，放下时吸气', '控制动作速度'],
    mistakes: ['手臂完全伸直', '身体摆动', '动作过快']
  },
  '单臂龙门架Y字侧平举': {
    tips: ['保持手臂微屈，避免锁定关节', '控制动作速度，避免摆动', '感受肩部肌肉的收缩'],
    mistakes: ['手臂完全伸直', '身体过度摆动', '动作范围不足']
  },
  '仰卧臂屈伸': {
    tips: ['保持上臂固定，只移动前臂', '下降时控制速度，避免反弹', '推起时呼气，下降时吸气'],
    mistakes: ['上臂移动', '下降过快', '手腕弯曲']
  },
  '单腿哑铃硬拉': {
    tips: ['保持背部挺直，避免弯腰', '核心收紧，保持平衡', '动作要控制，避免晃动'],
    mistakes: ['背部弯曲', '失去平衡', '动作过快']
  },
  '保加利亚分腿蹲': {
    tips: ['保持前膝盖与脚尖方向一致', '核心收紧，保持平衡', '控制动作速度'],
    mistakes: ['膝盖内扣', '身体过度前倾', '动作范围不足']
  },
  '高脚杯深蹲': {
    tips: ['保持核心收紧，背部挺直', '重心在脚后跟', '控制动作速度'],
    mistakes: ['背部弯曲', '膝盖内扣', '深度不够']
  },
  '杠铃罗马尼亚硬拉': {
    tips: ['保持背部挺直，避免弯腰', '膝盖微屈，不要完全伸直', '控制动作速度'],
    mistakes: ['背部弯曲', '膝盖完全伸直', '动作过快']
  },
  '山羊挺身': {
    tips: ['保持核心收紧', '动作要控制，避免摆动', '感受背部肌肉的收缩'],
    mistakes: ['过度抬头或低头', '动作过快', '腰部过度伸展']
  },
  '单手钢线下拉': {
    tips: ['保持核心收紧，避免身体过度摆动', '拉动时感受背部肌肉的收缩', '控制动作速度'],
    mistakes: ['身体过度摆动', '动作范围不足', '只用手臂力量']
  },
  '单手器械划船': {
    tips: ['保持背部挺直，避免扭曲', '拉动时感受背部肌肉的收缩', '控制动作速度'],
    mistakes: ['背部扭曲', '动作范围不足', '只用手臂力量']
  },
  '对握下拉': {
    tips: ['保持核心收紧，背部挺直', '拉动时感受背部肌肉的收缩', '控制动作速度'],
    mistakes: ['身体过度后倾', '动作范围不足', '只用手臂力量']
  },
  '开肘划船': {
    tips: ['保持核心收紧，背部挺直', '肘部向外展开，不要贴近身体', '控制动作速度'],
    mistakes: ['背部弯曲', '肘部贴近身体', '动作范围不足']
  },
  '肱线大臂屈角度弯举': {
    tips: ['保持大臂固定，避免晃动', '弯曲时呼气，放下时吸气', '控制动作速度'],
    mistakes: ['身体摆动', '肘部移动', '动作过快']
  },
  '杠铃卧推': {
    tips: ['保持核心收紧，背部贴紧凳面', '下降时控制速度，避免反弹', '推起时呼气，下降时吸气'],
    mistakes: ['腰部拱起', '手腕弯曲', '下降过快']
  },
  '上斜哑铃卧推': {
    tips: ['保持核心收紧，背部贴紧凳面', '下降时控制速度，避免反弹', '推起时呼气，下降时吸气'],
    mistakes: ['腰部拱起', '手腕弯曲', '下降过快']
  }
};

const getExerciseNotes = (exerciseName: string) => {
  const name = exerciseName.split(' (')[0];
  return exerciseNotes[name] || null;
};

export default function WorkoutPage() {
  const router = useRouter();

  const [currentExercise, setCurrentExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rir, setRir] = useState('1');
  const [restTime, setRestTime] = useState('90');
  const [isBodyweight, setIsBodyweight] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showTimerCompleteAlert, setShowTimerCompleteAlert] = useState(false);

  const [savedExercises, setSavedExercises] = useState<string[]>([]);
  const [trainingDuration, setTrainingDuration] = useState(0);
  const [isTrainingStarted, setIsTrainingStarted] = useState(false);
  const [planExercises, setPlanExercises] = useState<string[]>([]);
  const [planDayName, setPlanDayName] = useState('');
  const [customExercises, setCustomExercises] = useState<string[]>([]);
  const [currentExerciseNotes, setCurrentExerciseNotes] = useState<{tips: string[]; mistakes: string[]} | null>(null);
  const [activeTab, setActiveTab] = useState<'training' | 'notes'>('training');
  const [trainingNotes, setTrainingNotes] = useState('');
  const [lastExerciseRecord, setLastExerciseRecord] = useState<{weight: number; reps: number; date: string} | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [completedSets, setCompletedSets] = useState<{weight: number; reps: number; rir: number | null; isBodyweight: boolean}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trainingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3');
    const saved = localStorage.getItem('fitcoach_saved_exercises');
    if (saved) {
      try { setSavedExercises(JSON.parse(saved)); } catch (e) {}
    }
    
    // 加载自定义动作
    const savedCustom = localStorage.getItem('fitcoach_custom_exercises');
    if (savedCustom) {
      try { setCustomExercises(JSON.parse(savedCustom)); } catch (e) {}
    }

    // 从 URL 参数读取计划信息
    const params = new URLSearchParams(window.location.search);
    
    // 处理从计划页面传来的训练动作
    const exercisesParam = params.get('exercises');
    const dayName = params.get('dayName');
    
    if (exercisesParam) {
      try {
        const exercises = JSON.parse(decodeURIComponent(exercisesParam));
        if (Array.isArray(exercises) && exercises.length > 0) {
          // 为每个动作创建一个空的训练记录
          const exerciseRecords = exercises.map(exerciseName => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: exerciseName,
            sets: [],
            restTime: 90,
            totalVolume: 0
          }));
          
          setExercises(exerciseRecords);
          setSavedExercises(exercises);
          
          // 如果有训练日名称，显示提示
          if (dayName) {
            alert(`开始训练：${decodeURIComponent(dayName)}`);
          }
        }
      } catch (error) {
        logger.error('解析训练动作参数失败:', error);
      }
    } else {
      // 原有的计划ID处理逻辑
      const planId = params.get('plan');
      const dayIdx = params.get('day');
      if (planId && dayIdx !== null) {
        fetch(`/api/plans/${planId}`, {
          credentials: "include"
        })
          .then(r => {
            if (r.status === 401) {
              logger.warn("User not authenticated for plan data");
              return null;
            } else if (r.ok) {
              return r.json();
            } else {
              return r.text().then(text => {
                logger.warn("Plan API warning:", text);
                return null;
              });
            }
          })
          .then(data => {
            if (data?.plan?.days) {
              const day = data.plan.days[Number(dayIdx)];
              if (day) {
                const exercises = JSON.parse(day.exercises || '[]') as string[];
                setPlanExercises(exercises);
                setPlanDayName(day.dayName || '');
                setSavedExercises(exercises);
              }
            }
          })
          .catch((error) => {
            logger.error("Plan fetch error:", error);
          });
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (trainingTimerRef.current) clearInterval(trainingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (savedExercises.length > 0) {
      localStorage.setItem('fitcoach_saved_exercises', JSON.stringify(savedExercises));
    }
  }, [savedExercises]);

  useEffect(() => {
    if (isTrainingStarted) {
      trainingTimerRef.current = setInterval(() => {
        setTrainingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (trainingTimerRef.current) clearInterval(trainingTimerRef.current);
    };
  }, [isTrainingStarted]);

  useEffect(() => {
    if (isTimerRunning && remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsTimerRunning(false);
            if (audioRef.current) audioRef.current.play().catch(() => {});
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            setShowTimerCompleteAlert(true);
            setTimeout(() => setShowTimerCompleteAlert(false), 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, remainingTime]);

  const selectExercise = async (exercise: string) => {
    setCurrentExercise(exercise);
    setShowExercisePicker(false);
    if (!savedExercises.includes(exercise)) {
      setSavedExercises(prev => [exercise, ...prev].slice(0, 10));
    }
    
    // 检查动作是否在动作库中，如果不在，添加到自定义动作列表
    if (getExerciseMuscleGroup(exercise) === '' && !customExercises.includes(exercise)) {
      const updatedCustomExercises = [...customExercises, exercise];
      setCustomExercises(updatedCustomExercises);
      // 保存到本地存储
      localStorage.setItem('fitcoach_custom_exercises', JSON.stringify(updatedCustomExercises));
    }
    
    // 先检查当前训练中是否已有该动作的记录
    const lastExercise = exercises.find(e => e.name === exercise);
    if (lastExercise?.sets.length) {
      const lastSet = lastExercise.sets[lastExercise.sets.length - 1];
      setWeight(lastSet.weight.toString());
      setReps(lastSet.reps.toString());
      setRir(lastSet.rir.toString());
      setRestTime(lastExercise.restTime.toString());
    } else {
      // 从数据库获取上次训练记录
      try {
        // 这里假设 exercise 参数是动作的 ID
        // 实际实现中，需要根据动作名称或 ID 来获取记录
        // 暂时使用 API 调用作为 fallback
        const exerciseName = exercise.split(' (')[0];
        const response = await fetch(`/api/exercises/last-record?name=${encodeURIComponent(exerciseName)}`, {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setLastExerciseRecord(data.data);
            setWeight(data.data.weight.toString());
            setReps(data.data.reps.toString());
          } else {
            setLastExerciseRecord(null);
            setWeight('');
            setReps('');
          }
        } else {
          if (response.status === 401) {
            // 未登录，静默处理
            return;
          }
          logger.warn("API warning:", await response.text());
          setLastExerciseRecord(null);
          setWeight('');
          setReps('');
        }
      } catch (error) {
        logger.error('Failed to fetch last exercise record:', error);
        setLastExerciseRecord(null);
      }
    }
    
    // 获取动作的注意事项
    const notes = getExerciseNotes(exercise);
    setCurrentExerciseNotes(notes);
  };

  const logSet = () => {
    if (!currentExercise || !reps) { alert('请填写所有字段'); return; }
    if (!isBodyweight && !weight) { alert('请填写所有字段'); return; }
    if (!isTrainingStarted) setIsTrainingStarted(true);
    
    // 检查动作是否在动作库中，如果不在，添加到自定义动作列表
    if (getExerciseMuscleGroup(currentExercise) === '' && !customExercises.includes(currentExercise)) {
      setCustomExercises(prev => [...prev, currentExercise]);
    }
    
    const rirValue = rir ? Number(rir) : null;
    const newSet: Set = {
      weight: isBodyweight ? 0 : Number(weight), reps: Number(reps), rir: rirValue,
      isFailure: rirValue === 0,
      estimated1RM: isBodyweight ? 0 : Number(weight) * (1 + Number(reps) / 30),
      isBodyweight: isBodyweight,
      completed: true // 直接标记为已完成
    };
    
    // 添加到 completedSets
    setCompletedSets(prev => [...prev, {
      weight: isBodyweight ? 0 : Number(weight),
      reps: Number(reps),
      rir: rirValue,
      isBodyweight: isBodyweight
    }]);
    
    const setVolume = isBodyweight ? 0 : newSet.weight * newSet.reps;
    setExercises(prev => {
      const existing = prev.find(e => e.name === currentExercise);
      if (existing) {
        return prev.map(e =>
          e.name === currentExercise
            ? { ...e, sets: [...e.sets, newSet], totalVolume: e.totalVolume + setVolume }
            : e
        );
      }
      return [...prev, {
        id: Date.now().toString(), name: currentExercise,
        sets: [newSet], restTime: Number(restTime),
        totalVolume: setVolume
      }];
    });
    
    // 自动触发休息倒计时
    setRemainingTime(Number(restTime));
    setIsTimerRunning(true);
    
    // 保持重量和次数输入框的值，方便用户直接开始下一组训练
  };

  const finishWorkout = async () => {
    if (exercises.length === 0) { alert('请至少添加一组训练'); return; }
    
    setIsLoading(true);
    setIsTrainingStarted(false);
    
    try {
      const exercisesWithMuscleGroups = exercises.map(ex => ({
        name: ex.name,
        muscleGroup: getExerciseMuscleGroup(ex.name),
        sets: ex.sets.map(set => ({
          weight: set.weight,
          reps: set.reps,
          rir: set.rir,
          restTime: ex.restTime
        }))
      }));
      
      const totalVolume = exercises.reduce((sum, e) => sum + e.totalVolume, 0);
      
      const response = await fetch('/api/workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exercises: exercisesWithMuscleGroups,
          totalVolume: totalVolume,
          duration: trainingDuration,
          notes: trainingNotes
        }),
        credentials: "include"
      });
      
      if (response.status === 401) {
        logger.warn("User not authenticated for saving workout");
        alert('请先登录再保存训练记录');
        router.push('/auth/signin');
      } else if (!response.ok) {
        const errorText = await response.text();
        logger.warn("Workout save API warning:", errorText);
        alert('保存训练记录失败，请重试');
      } else {
        const workout = await response.json();

        // 跳转到总结页面，传递 workout ID 和新 PRs
        const newPRs = workout.newPRs || [];
        const prParams = newPRs.length > 0 ? `&prs=${encodeURIComponent(JSON.stringify(newPRs))}` : '';
        router.push(`/summary?id=${workout.id}${prParams}`);
      }
    } catch (error) {
      logger.error('Error finishing workout:', error);
      alert('保存训练记录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算下一组的渐进超负荷建议
  const calculateProgressiveOverload = () => {
    if (!currentExercise || !weight || !reps) return null;

    const currentWeight = parseFloat(weight);
    const currentReps = parseInt(reps);
    const currentRir = parseInt(rir);

    // 目标次数范围
    const targetRepsMin = 8;
    const targetRepsMax = 12;

    // 计算当前训练强度的预估1RM
    const estimated1RM = currentWeight * (1 + currentReps / 30);

    // 基于RIR调整下一组的建议
    let suggestedWeight = currentWeight;
    let suggestedReps = currentReps;

    if (currentRir <= 1) {
      // 接近力竭或力竭，建议增加重量，减少次数
      suggestedWeight = Math.round(currentWeight / 2.5) * 2.5 + 2.5;
      suggestedReps = Math.max(targetRepsMin, currentReps - 2);
    } else if (currentRir >= 3 && currentReps >= targetRepsMax) {
      // 轻松完成且次数达到上限，建议增加重量
      suggestedWeight = Math.round(currentWeight / 2.5) * 2.5 + 2.5;
      suggestedReps = targetRepsMin;
    } else if (currentReps < targetRepsMin) {
      // 次数不足，建议保持重量，增加次数
      suggestedReps = Math.min(targetRepsMax, currentReps + 2);
    } else {
      // 在目标范围内，保持重量，尝试增加次数
      suggestedReps = Math.min(targetRepsMax, currentReps + 1);
    }

    return {
      weight: suggestedWeight,
      reps: suggestedReps
    };
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(204,255,0,0.04) 0%, transparent 60%)'
      }} />

      <div className="relative max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2.5 rounded-xl transition-all"
              style={{ background: '#111', border: '1px solid #1e1e1e' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black">训练中</h1>
              {planDayName && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Target className="w-3.5 h-3.5" style={{ color: '#CCFF00' }} />
                  {planDayName}
                </div>
              )}
              {isTrainingStarted && (
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#CCFF00' }}>
                  <Activity className="w-4 h-4" />
                  {formatDuration(trainingDuration)}
                </div>
              )}
            </div>
          </div>
          {!isTrainingStarted ? (
            <button
              onClick={() => setIsTrainingStarted(true)}
              className="px-4 py-2 rounded-xl font-bold text-sm text-black transition-all"
              style={{ background: '#CCFF00' }}
            >
              开始训练
            </button>
          ) : exercises.length > 0 && (
            <button
              onClick={finishWorkout}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl font-bold text-sm text-black transition-all"
              style={{ background: '#CCFF00', opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? '保存中...' : '完成训练'}
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('training')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2`}
            style={activeTab === 'training' ? 
              { background: '#CCFF00', color: '#000' } : 
              { background: '#111', color: 'rgba(255,255,255,0.6)', border: '1px solid #1e1e1e' }
            }
          >
            <Dumbbell className="w-4 h-4" />
            训练记录
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2`}
            style={activeTab === 'notes' ? 
              { background: '#CCFF00', color: '#000' } : 
              { background: '#111', color: 'rgba(255,255,255,0.6)', border: '1px solid #1e1e1e' }
            }
          >
            <BookOpen className="w-4 h-4" />
            训练心得
          </button>
        </div>

        {/* Rest Timer - 置顶显示 */}
        {isTimerRunning && activeTab === 'training' && (
          <div className="mb-6 rounded-2xl p-6" style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0.05) 100%)',
            border: '1px solid rgba(0,212,255,0.3)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-semibold text-lg" style={{ color: '#00D4FF' }}>
                <Timer className="w-6 h-6" />
                <span>休息时间</span>
              </div>
              <div className="text-3xl font-black" style={{ color: '#00D4FF' }}>{remainingTime}s</div>
            </div>
            
            {/* 进度条 */}
            <div className="h-3 rounded-full bg-black bg-opacity-30 mb-4 overflow-hidden">
              <div 
                className="h-full transition-all duration-1000 ease-linear" 
                style={{
                  background: 'linear-gradient(90deg, #00D4FF 0%, #0099CC 100%)',
                  width: `${(remainingTime / Number(restTime)) * 100}%`
                }}
              />
            </div>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setRemainingTime(0);
                  setShowTimerCompleteAlert(true);
                  setTimeout(() => setShowTimerCompleteAlert(false), 3000);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                style={{ background: '#111', color: 'rgba(255,255,255,0.6)' }}
              >
                <X className="w-4 h-4" />结束计时
              </button>
              {!isTimerRunning && (
                <button
                  onClick={() => setIsTimerRunning(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-black transition-all"
                  style={{ background: '#10B981' }}
                >
                  <Play className="w-4 h-4" />继续训练
                </button>
              )}
            </div>
          </div>
        )}

        {/* Timer Complete Alert */}
        {showTimerCompleteAlert && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="rounded-3xl p-8 text-center" style={{ background: '#111', border: '1px solid rgba(204,255,0,0.3)', boxShadow: '0 0 40px rgba(204,255,0,0.2)' }}>
              <div className="text-6xl mb-4">⏰</div>
              <h3 className="text-2xl font-black mb-2" style={{ color: '#CCFF00' }}>休息时间结束！</h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>准备开始下一组训练</p>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'training' ? (
          <>
            {/* Input Card */}
            <div className="rounded-2xl p-5 mb-6 bg-zinc-900 border border-zinc-800">

              {/* 动作选择区域 */}
              <div className="mb-6">
                {/* 已选中动作 */}
                {currentExercise ? (
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>当前动作</label>
                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#111', border: '1px solid #2a2a2a' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(204,255,0,0.1)' }}>
                          <Dumbbell className="w-5 h-5" style={{ color: '#CCFF00' }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{currentExercise.split(' (')[0]}</h3>
                          {currentExercise.includes('(') && (
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{currentExercise.split('(')[1]?.replace(')', '')}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowExercisePicker(true)}
                          className="px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                          style={{ background: 'transparent', border: '1px solid #374151', color: 'rgba(255,255,255,0.6)' }}
                        >
                          更换动作
                        </button>
                        <button
                          onClick={() => { setCurrentExercise(''); setLastExerciseRecord(null); }}
                          className="p-2 rounded-xl transition-all"
                          style={{ background: 'rgba(255,59,92,0.1)', color: '#FF3B5C' }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>动作名称</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={currentExercise}
                        readOnly
                        className="flex-1 rounded-l-xl px-4 py-3 text-white placeholder-gray-600 text-sm cursor-pointer"
                        style={{ background: '#111', border: '1px solid #374151', borderRight: 'none' }}
                      />
                      <button
                        onClick={() => setShowExercisePicker(true)}
                        className="px-4 py-3 rounded-r-xl font-semibold text-sm transition-all"
                        style={{ background: 'transparent', border: '1px solid #374151', color: 'rgba(255,255,255,0.6)' }}
                      >
                        选择动作
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Weight / Reps */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>重量 (kg)</label>
                    <button
                      onClick={() => setIsBodyweight(!isBodyweight)}
                      className="px-2 py-0.5 rounded text-xs font-semibold transition-all"
                      style={
                        isBodyweight
                          ? { background: '#CCFF00', color: '#000' }
                          : { background: '#1e1e1e', color: 'rgba(255,255,255,0.35)' }
                      }
                    >
                      自重
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        if (!isBodyweight) {
                          const current = parseFloat(weight) || 0;
                          const newValue = Math.max(0, current - 2.5);
                          setWeight(newValue.toString());
                        }
                      }}
                      onMouseDown={(e) => {
                        if (!isBodyweight) {
                          let interval: NodeJS.Timeout;
                          const startDecreasing = () => {
                            interval = setInterval(() => {
                              const current = parseFloat(weight) || 0;
                              const newValue = Math.max(0, current - 2.5);
                              setWeight(newValue.toString());
                            }, 150);
                          };
                          startDecreasing();
                          e.currentTarget.addEventListener('mouseup', () => clearInterval(interval));
                          e.currentTarget.addEventListener('mouseleave', () => clearInterval(interval));
                        }
                      }}
                      className="w-12 h-12 flex items-center justify-center rounded-l-xl transition-all"
                      style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRight: 'none' }}
                    >
                      <Minus className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                    </button>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="0"
                      disabled={isBodyweight}
                      className="flex-1 h-12 text-center text-white text-lg font-semibold disabled:opacity-40 bg-zinc-800 border border-zinc-700"
                      style={{ 
                        'MozAppearance': 'textfield',
                        'WebkitAppearance': 'none',
                        'appearance': 'textfield'
                      }}
                    />
                    <style jsx>{`
                      input[type=number]::-webkit-inner-spin-button, 
                      input[type=number]::-webkit-outer-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                      }
                    `}</style>
                    <button
                      onClick={() => {
                        if (!isBodyweight) {
                          const current = parseFloat(weight) || 0;
                          const newValue = current + 2.5;
                          setWeight(newValue.toString());
                        }
                      }}
                      onMouseDown={(e) => {
                        if (!isBodyweight) {
                          let interval: NodeJS.Timeout;
                          const startIncreasing = () => {
                            interval = setInterval(() => {
                              const current = parseFloat(weight) || 0;
                              const newValue = current + 2.5;
                              setWeight(newValue.toString());
                            }, 150);
                          };
                          startIncreasing();
                          e.currentTarget.addEventListener('mouseup', () => clearInterval(interval));
                          e.currentTarget.addEventListener('mouseleave', () => clearInterval(interval));
                        }
                      }}
                      className="w-12 h-12 flex items-center justify-center rounded-r-xl transition-all"
                      style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderLeft: 'none' }}
                    >
                      <Plus className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>次数</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        const current = parseInt(reps) || 0;
                        const newValue = Math.max(0, current - 1);
                        setReps(newValue.toString());
                      }}
                      onMouseDown={(e) => {
                        let interval: NodeJS.Timeout;
                        const startDecreasing = () => {
                          interval = setInterval(() => {
                            const current = parseInt(reps) || 0;
                            const newValue = Math.max(0, current - 1);
                            setReps(newValue.toString());
                          }, 150);
                        };
                        startDecreasing();
                        e.currentTarget.addEventListener('mouseup', () => clearInterval(interval));
                        e.currentTarget.addEventListener('mouseleave', () => clearInterval(interval));
                      }}
                      className="w-12 h-12 flex items-center justify-center rounded-l-xl transition-all"
                      style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRight: 'none' }}
                    >
                      <Minus className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                    </button>
                    <input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      placeholder="0"
                      className="flex-1 h-12 text-center text-white text-lg font-semibold bg-zinc-800 border border-zinc-700"
                      style={{ 
                        'MozAppearance': 'textfield',
                        'WebkitAppearance': 'none',
                        'appearance': 'textfield'
                      }}
                    />
                    <button
                      onClick={() => {
                        const current = parseInt(reps) || 0;
                        const newValue = current + 1;
                        setReps(newValue.toString());
                      }}
                      onMouseDown={(e) => {
                        let interval: NodeJS.Timeout;
                        const startIncreasing = () => {
                          interval = setInterval(() => {
                            const current = parseInt(reps) || 0;
                            const newValue = current + 1;
                            setReps(newValue.toString());
                          }, 150);
                        };
                        startIncreasing();
                        e.currentTarget.addEventListener('mouseup', () => clearInterval(interval));
                        e.currentTarget.addEventListener('mouseleave', () => clearInterval(interval));
                      }}
                      className="w-12 h-12 flex items-center justify-center rounded-r-xl transition-all"
                      style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderLeft: 'none' }}
                    >
                      <Plus className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 实时预估 1RM */}
              {!isBodyweight && weight && reps && (
                <div className="mb-4">
                  <div className="text-xs text-zinc-500">
                    预估 1RM: {((parseFloat(weight) || 0) * (1 + (parseInt(reps) || 0) / 30)).toFixed(1)} kg
                  </div>
                </div>
              )}
              
              {/* 上次训练记录 */}
              {lastExerciseRecord && (
                <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      上次：{lastExerciseRecord.weight}kg × {lastExerciseRecord.reps}次
                    </div>
                    <button
                      onClick={() => {
                        setWeight(lastExerciseRecord.weight.toString());
                        setReps(lastExerciseRecord.reps.toString());
                      }}
                      className="px-3 py-1 rounded text-xs font-semibold transition-all"
                      style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00' }}
                    >
                      一键同步
                    </button>
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {new Date(lastExerciseRecord.date).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* RIR + Rest */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block mb-1 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>剩余潜力 (RIR)</label>
                  <div className="flex rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                    {
                      [
                        { value: '4', label: '轻松' },
                        { value: '3', label: '轻松' },
                        { value: '2', label: '适中' },
                        { value: '1', label: '接近力竭' },
                        { value: '0', label: '力竭' }
                      ].map((option) => {
                        let bgColor = '';
                        if (rir === option.value) {
                          if (option.value === '0') {
                            bgColor = 'bg-red-500/80 text-white';
                          } else if (option.value === '1' || option.value === '2') {
                            bgColor = 'bg-amber-500/80 text-white';
                          } else {
                            bgColor = 'bg-emerald-500/80 text-white';
                          }
                        } else {
                          bgColor = 'text-zinc-400';
                        }
                        return (
                          <button
                            key={option.value}
                            onClick={() => setRir(option.value)}
                            className={`flex-1 py-3 text-sm font-semibold transition-all ${bgColor}`}
                          >
                            {option.value} - {option.label}
                          </button>
                        );
                      })
                    }
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>休息时间</label>
                  <div className="flex gap-1 mb-2">
                    {
                      restTimePresets.map((preset) => (
                        <button
                          key={preset.seconds}
                          onClick={() => setRestTime(preset.seconds.toString())}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                          style={
                            restTime === preset.seconds.toString()
                              ? { background: '#CCFF00', color: '#000' }
                              : { background: '#111', color: 'rgba(255,255,255,0.35)' }
                          }
                        >
                          {preset.label}
                        </button>
                      ))
                    }
                  </div>
                  <input
                    type="number"
                    value={restTime}
                    onChange={(e) => setRestTime(e.target.value)}
                    className="w-full rounded-xl px-4 py-2 text-white text-sm"
                    style={{ background: '#111', border: '1px solid #1e1e1e' }}
                  />
                </div>
              </div>

              {/* 即时训练组数列表 */}
              {completedSets.length > 0 && (
                <div className="mb-6 pb-6 border-b border-zinc-800">
                  <div className="text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    训练组数记录
                  </div>
                  <div className="space-y-2">
                    {completedSets.map((set, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-800 border border-zinc-700"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>第 {index + 1} 组</span>
                          {set.isBodyweight ? (
                            <span className="font-semibold text-sm">{set.reps} 次 (自重)</span>
                          ) : (
                            <span className="font-semibold text-sm">{set.weight} kg × {set.reps}次</span>
                          )}
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>[RIR: {set.rir ?? '未记录'}]</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* 完成此组按钮 */}
              <button
                onClick={logSet}
                disabled={!currentExercise || !reps || (!isBodyweight && !weight)}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-base text-black transition-all"
                style={{ background: '#10B981' }} // 亮绿色
              >
                <Check className="w-5 h-5" />
                完成此组
              </button>
              
              {/* 渐进超负荷建议 */}
              {!isBodyweight && currentExercise && weight && reps && (
                <div className="mt-4 p-4 rounded-xl bg-zinc-800 border border-zinc-700">
                  <div className="text-sm font-semibold mb-2" style={{ color: '#CCFF00' }}>下一组建议</div>
                  {(() => {
                    const suggestion = calculateProgressiveOverload();
                    if (suggestion) {
                      return (
                        <div className="text-lg font-bold">
                          {suggestion.weight}kg × {suggestion.reps}次
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
              
              {/* 动作注意事项 */}
              {currentExerciseNotes && (
                <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.1)' }}>
                  <h3 className="text-sm font-bold mb-3" style={{ color: '#CCFF00' }}>动作注意事项</h3>
                  
                  {/* 训练建议 */}
                  {currentExerciseNotes.tips.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>训练建议</div>
                      <ul className="space-y-1">
                        {currentExerciseNotes.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs">
                            <span style={{ color: '#CCFF00' }}>•</span>
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 常见错误 */}
                  {currentExerciseNotes.mistakes.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,184,0,0.6)' }}>常见错误</div>
                      <ul className="space-y-1">
                        {currentExerciseNotes.mistakes.map((mistake, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs">
                            <span style={{ color: '#FFB800' }}>•</span>
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{mistake}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 全场训练概览 */}
            {exercises.length > 0 && (
              <div className="rounded-2xl p-5 mt-8 bg-zinc-900 border border-zinc-800">
                <h3 className="text-lg font-bold mb-4">全场训练概览</h3>
                <div className="space-y-3">
                  {exercises.map((exercise, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all hover:bg-zinc-800 bg-zinc-800 border border-zinc-700"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => setCurrentExercise(exercise.name)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(204,255,0,0.1)' }}>
                          <Dumbbell className="w-4 h-4" style={{ color: '#CCFF00' }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{exercise.name.split(' (')[0]}</h4>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{exercise.sets.length} 组</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold" style={{ color: '#CCFF00' }}>{exercise.totalVolume} kg</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Finish */}
            {exercises.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={finishWorkout}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-base text-black transition-all"
                  style={{ background: '#CCFF00', opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      完成训练
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Training Notes Tab */
          <div className="rounded-2xl p-5 mb-6" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#CCFF00' }}>训练心得</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>记录你的训练感受、遇到的挑战或取得的进步</p>
            <textarea
              value={trainingNotes}
              onChange={(e) => setTrainingNotes(e.target.value)}
              placeholder="在这里写下你的训练心得...\n\n例如：\n- 今天深蹲感觉力量有所提升\n- 卧推时核心保持得更好了\n- 下次要注意动作规范"
              className="w-full rounded-xl p-4 text-white text-sm min-h-[300px] resize-none"
              style={{ background: '#111', border: '1px solid #1e1e1e' }}
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{trainingNotes.length} 字符</span>
              <button
                onClick={() => setActiveTab('training')}
                className="px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                style={{ background: '#CCFF00', color: '#000' }}
              >
                保存并返回
              </button>
            </div>
          </div>
        )}

        {/* Exercise Picker */}
        <ExercisePicker
          isOpen={showExercisePicker}
          onClose={() => setShowExercisePicker(false)}
          onSelectExercise={selectExercise}
          customExercises={customExercises}
          savedExercises={savedExercises}
        />
      </div>
    </div>
  );
}
