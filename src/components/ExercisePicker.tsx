import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Dumbbell, Barrel, Cpu, Plus, X, 
  ChevronRight, User, Loader2, Trash2, Check, Info
} from 'lucide-react';
import { createCustomExercise, getUserCustomExercises, deleteCustomExercise } from '@/app/actions/exercise-actions';
import { logger } from '@/lib/logger';

interface ExercisePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: string) => void;
  customExercises: string[];
  savedExercises: string[];
}

const muscleGroups = {
  '胸部': {
    exercises: [
      { name: '卧推 (Bench Press)', type: '杠铃' },
      { name: '上斜卧推 (Incline Press)', type: '杠铃' },
      { name: '下斜卧推 (Decline Press)', type: '杠铃' },
      { name: '哑铃卧推 (Dumbbell Press)', type: '哑铃' },
      { name: '胸肌飞鸟 (Chest Fly)', type: '哑铃' },
      { name: '俯卧撑 (Push Up)', type: '自重' },
      { name: '双杠臂屈伸 (Dips)', type: '自重' },
      { name: '胸肌夹胸 (Cable Crossover)', type: '器械' },
      { name: '杠铃卧推 (Barbell Bench Press)', type: '杠铃' },
      { name: '上斜哑铃卧推 (Incline Dumbbell Press)', type: '哑铃' }
    ]
  },
  '背部': {
    exercises: [
      { name: '硬拉 (Deadlift)', type: '杠铃' },
      { name: '引体向上 (Pull Up)', type: '自重' },
      { name: '高位下拉 (Lat Pulldown)', type: '器械' },
      { name: '杠铃划船 (Barbell Row)', type: '杠铃' },
      { name: '哑铃划船 (Dumbbell Row)', type: '哑铃' },
      { name: '坐姿划船 (Seated Row)', type: '器械' },
      { name: '直臂下拉 (Straight Arm Pulldown)', type: '器械' },
      { name: '面拉 (Face Pull)', type: '器械' },
      { name: '单手钢线下拉 (One-Arm Lat Pulldown)', type: '器械' },
      { name: '单手器械划船 (One-Arm Machine Row)', type: '器械' },
      { name: '对握下拉 (Close Grip Pulldown)', type: '器械' },
      { name: '开肘划船 (Bent Over Row)', type: '杠铃' }
    ]
  },
  '肩部': {
    exercises: [
      { name: '肩上推举 (Overhead Press)', type: '杠铃' },
      { name: '哑铃肩推 (Dumbbell Shoulder Press)', type: '哑铃' },
      { name: '侧平举 (Lateral Raise)', type: '哑铃' },
      { name: '前平举 (Front Raise)', type: '哑铃' },
      { name: '反向飞鸟 (Rear Delt Fly)', type: '哑铃' },
      { name: '阿诺德推举 (Arnold Press)', type: '哑铃' },
      { name: '单臂龙门架Y字侧平举 (Lateral Raise)', type: '器械' }
    ]
  },
  '腿部': {
    exercises: [
      { name: '深蹲 (Squat)', type: '杠铃' },
      { name: '腿举 (Leg Press)', type: '器械' },
      { name: '罗马尼亚硬拉 (Romanian Deadlift)', type: '杠铃' },
      { name: '箭步蹲 (Lunge)', type: '自重' },
      { name: '保加利亚分腿蹲 (Bulgarian Split Squat)', type: '哑铃' },
      { name: '腿弯举 (Leg Curl)', type: '器械' },
      { name: '腿屈伸 (Leg Extension)', type: '器械' },
      { name: '臀推 (Hip Thrust)', type: '杠铃' },
      { name: '提踵 (Calf Raise)', type: '器械' },
      { name: '单腿哑铃硬拉 (Single-Leg Dumbbell Deadlift)', type: '哑铃' },
      { name: '高脚杯深蹲 (Goblet Squat)', type: '哑铃' },
      { name: '杠铃罗马尼亚硬拉 (Romanian Deadlift)', type: '杠铃' },
      { name: '山羊挺身 (Back Extension)', type: '器械' }
    ]
  },
  '手臂': {
    exercises: [
      { name: '二头肌弯举 (Bicep Curl)', type: '哑铃' },
      { name: '哑铃弯举 (Dumbbell Curl)', type: '哑铃' },
      { name: '锤式弯举 (Hammer Curl)', type: '哑铃' },
      { name: '集中弯举 (Concentration Curl)', type: '哑铃' },
      { name: '三头肌下压 (Tricep Pushdown)', type: '器械' },
      { name: '三头肌伸展 (Tricep Extension)', type: '哑铃' },
      { name: '窄距卧推 (Close Grip Bench Press)', type: '杠铃' },
      { name: '仰卧臂屈伸 (Tricep Extension)', type: '哑铃' }
    ]
  },
  '腹部': {
    exercises: [
      { name: '平板支撑 (Plank)', type: '自重' },
      { name: '腹肌卷腹 (Crunches)', type: '自重' },
      { name: '仰卧起坐 (Sit Up)', type: '自重' },
      { name: '悬垂举腿 (Hanging Leg Raise)', type: '自重' },
      { name: '侧平板支撑 (Side Plank)', type: '自重' },
      { name: '俄罗斯转体 (Russian Twist)', type: '哑铃' },
      { name: '登山者 (Mountain Climber)', type: '自重' }
    ]
  }
};

const muscleGroupLabels = ['胸部', '背部', '肩部', '腿部', '手臂', '腹部'];

const getExerciseType = (exercise: string): string => {
  for (const groupData of Object.values(muscleGroups)) {
    const found = groupData.exercises.find((item) => item.name === exercise);
    if (found) return found.type;
  }
  return '';
};

const getExerciseGroup = (exercise: string): string => {
  for (const [groupName, groupData] of Object.entries(muscleGroups)) {
    if (groupData.exercises.some((item) => item.name === exercise)) return groupName;
  }
  return '其他';
};

// 动作详情数据库
const exerciseDetails: Record<string, { description: string; tips: string[]; mistakes: string[] }> = {
  '卧推': {
    description: '卧推是一种基础的胸部训练动作，主要锻炼胸大肌、三角肌前束和肱三头肌。',
    tips: ['保持核心收紧，背部贴紧凳面', '下降时控制速度，避免反弹', '推起时呼气，下降时吸气'],
    mistakes: ['腰部拱起', '手腕弯曲', '下降过快']
  },
  '深蹲': {
    description: '深蹲是一种全身性的训练动作，主要锻炼股四头肌、臀大肌和核心肌群。',
    tips: ['保持膝盖与脚尖方向一致', '重心在脚后跟', '下降时吸气，推起时呼气'],
    mistakes: ['膝盖内扣', '背部弯曲', '深度不够']
  },
  '硬拉': {
    description: '硬拉是一种复合训练动作，主要锻炼背部、臀部和腿部肌群。',
    tips: ['保持背部挺直，避免弯腰', '用腿发力，不是用背', '提起时呼气，下降时吸气'],
    mistakes: ['背部弯曲', '膝盖内扣', '提起时腰部过度伸展']
  },
  '引体向上': {
    description: '引体向上是一种有效的背部训练动作，主要锻炼背阔肌、大圆肌和肱二头肌。',
    tips: ['保持核心收紧，避免摆动', '拉动时呼气，下降时吸气', '尝试全范围运动'],
    mistakes: ['身体摆动', '动作范围不足', '只用手臂力量']
  },
  '肩推': {
    description: '肩推是一种肩部训练动作，主要锻炼三角肌前束和中束。',
    tips: ['保持核心收紧，避免腰部过度伸展', '推起时呼气，下降时吸气', '保持手腕中立'],
    mistakes: ['腰部过度伸展', '手腕弯曲', '下降过快']
  },
  '二头弯举': {
    description: '二头弯举是一种手臂训练动作，主要锻炼肱二头肌。',
    tips: ['保持肘部固定，避免晃动', '弯曲时呼气，放下时吸气', '控制动作速度'],
    mistakes: ['身体摆动', '肘部移动', '动作过快']
  },
  '三头下压': {
    description: '三头下压是一种手臂训练动作，主要锻炼肱三头肌。',
    tips: ['保持肘部固定，避免移动', '推动时呼气，回到时吸气', '控制动作速度'],
    mistakes: ['肘部移动', '动作范围不足', '身体前倾']
  },
  '平板支撑': {
    description: '平板支撑是一种核心训练动作，主要锻炼核心肌群和肩部稳定肌。',
    tips: ['保持身体成一条直线', '收紧核心和臀部', '保持均匀呼吸'],
    mistakes: ['臀部抬起', '腰部下垂', '呼吸不均匀']
  }
};

const getExerciseDetails = (exercise: string) => {
  const name = exercise.split(' (')[0];
  return exerciseDetails[name] || null;
};

const groupColors: Record<string, { bg: string; text: string; border: string }> = {
  '胸部':   { bg: 'bg-red-500/15',  text: 'text-red-400',    border: 'hover:border-red-500/40' },
  '背部':   { bg: 'bg-blue-500/15', text: 'text-blue-400',   border: 'hover:border-blue-500/40' },
  '肩部':   { bg: 'bg-amber-500/15',text: 'text-amber-400',  border: 'hover:border-amber-500/40' },
  '腿部':   { bg: 'bg-purple-500/15',text:'text-purple-400', border: 'hover:border-purple-500/40' },
  '手臂':   { bg: 'bg-teal-500/15', text: 'text-teal-400',   border: 'hover:border-teal-500/40' },
  '腹部':   { bg: 'bg-pink-500/15', text: 'text-pink-400',   border: 'hover:border-pink-500/40' },
  '其他':   { bg: 'bg-zinc-500/15', text: 'text-zinc-400',    border: 'hover:border-zinc-500/40' },
};

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
  const [dbCustomExercises, setDbCustomExercises] = useState<{ id: string; name: string; muscleGroup: string }[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successText, setSuccessText] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTarget, setCreateTarget] = useState('');
  const [localSavedExercises, setLocalSavedExercises] = useState<string[]>(savedExercises);
  const [showExerciseDetail, setShowExerciseDetail] = useState(false);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<{ name: string; type: string; group: string; description?: string; tips?: string[]; mistakes?: string[] } | null>(null);

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
    if (isOpen) loadCustomExercises();
  }, [isOpen, loadCustomExercises]);

  const filteredExercises = useMemo(() => {
    if (!searchQuery) return [];
    const lowerKeyword = searchQuery.toLowerCase();
    const results: { exercise: string; score: number; isCustom: boolean }[] = [];
    
    for (const groupData of Object.values(muscleGroups)) {
      for (const item of groupData.exercises) {
        const exercise = item.name;
        const lowerName = exercise.toLowerCase();
        const chineseName = exercise.split(' (')[0];
        const englishName = exercise.split('(')[1]?.replace(')', '') || '';
        let score = 0;
        if (lowerName.includes(lowerKeyword)) score = 3;
        if (chineseName.includes(searchQuery)) score = Math.max(score, 2);
        if (englishName.toLowerCase().includes(lowerKeyword)) score = Math.max(score, 1);
        if (score > 0) results.push({ exercise, score, isCustom: false });
      }
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
  }, [searchQuery, dbCustomExercises]);

  const handleSelectExercise = (exercise: string) => {
    onSelectExercise(exercise);
    onClose();
  };

  const handleShowExerciseDetail = (exercise: string, type: string, group: string) => {
    const details = getExerciseDetails(exercise);
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full h-[90vh] bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl flex overflow-hidden">
        
        {/* Left sidebar */}
        <div className="w-14 bg-zinc-900 flex flex-col items-center py-6 gap-2">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-800 transition-colors mb-2">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
          
          <div className="w-8 h-px bg-zinc-800 my-1" />
          
          <button
            onClick={() => { setSelectedMuscleGroup(''); setShowMyExercises(false); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${
              !showMyExercises && selectedMuscleGroup === '' 
                ? 'bg-white text-black shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
            }`}
          >
            全
          </button>
          
          <button
            onClick={() => { setShowMyExercises(true); setSelectedMuscleGroup(''); loadCustomExercises(); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${
              showMyExercises 
                ? 'bg-white text-black shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
            }`}
          >
            我
          </button>
          
          <div className="w-8 h-px bg-zinc-800 my-1" />
          
          {muscleGroupLabels.map((group) => (
            <button
              key={group}
              onClick={() => { setSelectedMuscleGroup(group); setShowMyExercises(false); }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${
                !showMyExercises && selectedMuscleGroup === group
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
              }`}
            >
              {group[0]}
            </button>
          ))}
        </div>

        {/* Right main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Search bar */}
          <div className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索动作，如：卧推、深蹲..."
                className="w-full pl-11 pr-4 py-3 rounded-xl text-white bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-zinc-600 transition-colors placeholder-zinc-600"
              />
            </div>
          </div>
          
          {/* Success message */}
          {showSuccessMessage && (
            <div className="mx-4 mt-3 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium rounded-xl text-sm flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              {successText}
            </div>
          )}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            
            {/* Recent exercises */}
            {!searchQuery && !selectedMuscleGroup && localSavedExercises.length > 0 && (
              <div className="p-4">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">最近</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {localSavedExercises.slice(0, 8).map((exercise, index) => (
                    <div key={index} className="flex-shrink-0 relative group">
                      <button
                        onClick={() => handleSelectExercise(exercise)}
                        className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 transition-all active:scale-95 whitespace-nowrap"
                      >
                        {exercise.split(' (')[0]}
                      </button>
                      <button
                        onClick={() => {
                          const newSavedExercises = localSavedExercises.filter((_, i) => i !== index);
                          setLocalSavedExercises(newSavedExercises);
                          localStorage.setItem('fitcoach_saved_exercises', JSON.stringify(newSavedExercises));
                        }}
                        className="absolute right-1 top-1 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                      >
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search results */}
            {searchQuery && filteredExercises.length > 0 && (
              <div className="p-4">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  搜索结果 · {filteredExercises.length}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {filteredExercises.map((item, index) => {
                    const group = item.isCustom 
                      ? (dbCustomExercises.find(e => e.name === item.exercise)?.muscleGroup || '其他') 
                      : getExerciseGroup(item.exercise);
                    const type = item.isCustom ? '自定义' : getExerciseType(item.exercise);
                    const colors = groupColors[group] || groupColors['其他'];
                    return (
                      <div key={index} className="relative group">
                        <button
                          onClick={() => handleSelectExercise(item.exercise)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 ${colors.border} hover:bg-zinc-800/80 transition-all active:scale-[0.98]`}
                        >
                          <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                            <Cpu className={`w-4 h-4 ${colors.text}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-zinc-200 block truncate">{item.exercise.split(' (')[0]}</span>
                            <span className="text-xs text-zinc-600">{type}</span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleShowExerciseDetail(item.exercise, type, group)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-zinc-700/50 transition-all"
                        >
                          <Info className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No search results */}
            {searchQuery && filteredExercises.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[50vh] px-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-zinc-500" />
                </div>
                <h3 className="text-base font-semibold text-zinc-300 mb-1">未找到 "{searchQuery}"</h3>
                <p className="text-sm text-zinc-600 mb-6 text-center">点击下方按钮，创建新动作并关联部位</p>
                <button
                  onClick={() => triggerCreate(searchQuery)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all active:scale-95 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  创建 "{searchQuery}"
                </button>
              </div>
            )}

            {/* My exercises tab */}
            {showMyExercises && (
              <div className="p-4">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">我的动作</h3>
                
                {dbLoading ? (
                  <div className="flex items-center justify-center h-[40vh] gap-3">
                    <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                    <span className="text-sm text-zinc-500">加载中...</span>
                  </div>
                ) : dbCustomExercises.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {dbCustomExercises.map((exercise) => {
                      const colors = groupColors[exercise.muscleGroup] || groupColors['其他'];
                      return (
                        <div key={exercise.id} className="relative group">
                          <button
                            onClick={() => handleSelectExercise(exercise.name)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 ${colors.border} hover:bg-zinc-800/80 transition-all active:scale-[0.98]`}
                          >
                            <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                              <User className={`w-4 h-4 ${colors.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs text-zinc-200 block truncate">{exercise.name}</span>
                              <span className="text-xs text-zinc-600">{exercise.equipment || ''}{exercise.equipment ? ' ' : ''}{exercise.muscleGroup}（自定义）</span>
                            </div>
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!confirm(`确定删除 "${exercise.name}"？`)) return;
                              const result = await deleteCustomExercise(exercise.id);
                              if (result.success) setDbCustomExercises(prev => prev.filter(ex => ex.id !== exercise.id));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[40vh]">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
                      <User className="w-6 h-6 text-zinc-600" />
                    </div>
                    <p className="text-sm text-zinc-500 mb-2">还没有自定义动作</p>
                    <p className="text-xs text-zinc-700 mb-5 text-center px-4">
                      搜索一个不存在的动作名<br/>即可创建并关联部位
                    </p>
                    <button
                      onClick={() => { setShowMyExercises(false); setSelectedMuscleGroup(''); }}
                      className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-all"
                    >
                      浏览动作库
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* By muscle group */}
            {!searchQuery && selectedMuscleGroup && (
              <div className="p-4">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  {selectedMuscleGroup} · {muscleGroups[selectedMuscleGroup as keyof typeof muscleGroups].exercises.length + dbCustomExercises.filter(e => e.muscleGroup === selectedMuscleGroup).length} 个动作
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {/* 系统动作 */}
                  {muscleGroups[selectedMuscleGroup as keyof typeof muscleGroups].exercises.map((item, index) => {
                    const colors = groupColors[selectedMuscleGroup] || groupColors['其他'];
                    return (
                      <div key={index} className="relative group">
                        <button
                          onClick={() => handleSelectExercise(item.name)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 ${colors.border} hover:bg-zinc-800/80 transition-all active:scale-[0.98]`}
                        >
                          <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                            <Dumbbell className={`w-4 h-4 ${colors.text}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-zinc-200 block truncate">{item.name.split(' (')[0]}</span>
                            <span className="text-xs text-zinc-600">{item.type}</span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleShowExerciseDetail(item.name, item.type, selectedMuscleGroup)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-zinc-700/50 transition-all"
                        >
                          <Info className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                      </div>
                    );
                  })}
                  {/* 用户自定义动作 - 按部位筛选 */}
                  {dbCustomExercises.filter(e => e.muscleGroup === selectedMuscleGroup).map((exercise) => {
                    const colors = groupColors[exercise.muscleGroup] || groupColors['其他'];
                    const type = exercise.equipment || '';
                    return (
                      <div key={exercise.id} className="relative group">
                        <button
                          onClick={() => handleSelectExercise(exercise.name)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 ${colors.border} hover:bg-zinc-800/80 transition-all active:scale-[0.98]`}
                        >
                          <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                            <Dumbbell className={`w-4 h-4 ${colors.text}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-zinc-200 block truncate">{exercise.name}</span>
                            <span className="text-xs text-zinc-600">{type}{type ? ' ' : ''}（自定义）</span>
                          </div>
                        </button>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <button
                            onClick={() => handleShowExerciseDetail(exercise.name, type || '自定义', exercise.muscleGroup)}
                            className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-zinc-700/50 transition-all"
                          >
                            <Info className="w-3.5 h-3.5 text-zinc-400" />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!confirm(`确定删除 "${exercise.name}"？`)) return;
                              const result = await deleteCustomExercise(exercise.id);
                              if (result.success) setDbCustomExercises(prev => prev.filter(ex => ex.id !== exercise.id));
                            }}
                            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All groups overview */}
            {!searchQuery && !selectedMuscleGroup && (
              <div className="p-4 space-y-5">
                {Object.entries(muscleGroups).map(([groupName, groupData]) => {
                  const colors = groupColors[groupName] || groupColors['其他'];
                  return (
                    <div key={groupName}>
                      <button
                        onClick={() => { setSelectedMuscleGroup(groupName); setShowMyExercises(false); }}
                        className="w-full flex items-center justify-between mb-2 group"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} font-medium`}>{groupName}</span>
                          <span className="text-xs text-zinc-600">{groupData.exercises.length} 个</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                          <span className="text-xs">查看</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        {groupData.exercises.slice(0, 4).map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectExercise(item.name)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 ${colors.border} hover:bg-zinc-800/60 transition-all active:scale-[0.98]`}
                          >
                            <div className={`w-7 h-7 rounded-md ${colors.bg} flex items-center justify-center shrink-0`}>
                              <Barrel className={`w-3.5 h-3.5 ${colors.text}`} />
                            </div>
                            <span className="text-xs text-zinc-300 truncate">{item.name.split(' (')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {dbCustomExercises.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-zinc-400 font-medium">我的</span>
                        <span className="text-xs text-zinc-600">{dbCustomExercises.length} 个</span>
                      </div>
                      <button
                        onClick={() => { setShowMyExercises(true); setSelectedMuscleGroup(''); }}
                        className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <span className="text-xs">全部</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {dbCustomExercises.slice(0, 4).map((ex) => {
                        const colors = groupColors[ex.muscleGroup] || groupColors['其他'];
                        return (
                          <button
                            key={ex.id}
                            onClick={() => handleSelectExercise(ex.name)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 ${colors.border} hover:bg-zinc-800/60 transition-all active:scale-[0.98]`}
                          >
                            <div className={`w-7 h-7 rounded-md ${colors.bg} flex items-center justify-center shrink-0`}>
                              <User className={`w-3.5 h-3.5 ${colors.text}`} />
                            </div>
                            <span className="text-xs text-zinc-300 truncate">{ex.name}</span>
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
      </div>

      {/* 创建动作弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold text-white">创建新动作</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
            
            <div className="p-5">
              <div className="mb-5">
                <p className="text-sm text-zinc-400 mb-2">动作名称</p>
                <div className="px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm">
                  {createTarget}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-zinc-400 mb-3">选择关联部位</p>
                <div className="grid grid-cols-3 gap-2">
                  {[...muscleGroupLabels, '其他'].map((group) => {
                    const colors = groupColors[group] || groupColors['其他'];
                    return (
                      <button
                        key={group}
                        onClick={() => confirmCreate(group)}
                        disabled={isCreating}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                          group === selectedMuscleGroup
                            ? 'bg-white text-black border-white shadow-lg'
                            : `${colors.bg} ${colors.text} border-zinc-700 hover:border-zinc-500`
                        }`}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-base font-semibold text-white">动作详情</h2>
              <button onClick={() => setShowExerciseDetail(false)} className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${groupColors[selectedExerciseDetail.group]?.bg || 'bg-zinc-500/15'} flex items-center justify-center shrink-0`}>
                  <Dumbbell className={`w-6 h-6 ${groupColors[selectedExerciseDetail.group]?.text || 'text-zinc-400'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedExerciseDetail.name.split(' (')[0]}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">{selectedExerciseDetail.group}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">{selectedExerciseDetail.type}</span>
                  </div>
                </div>
              </div>
              
              {selectedExerciseDetail.description && (
                <div>
                  <h4 className="text-sm font-semibold text-zinc-300 mb-2">动作说明</h4>
                  <p className="text-sm text-zinc-400">{selectedExerciseDetail.description}</p>
                </div>
              )}
              
              {selectedExerciseDetail.tips && selectedExerciseDetail.tips.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-zinc-300 mb-2">训练建议</h4>
                  <ul className="space-y-1">
                    {selectedExerciseDetail.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-zinc-400">
                        <span className="text-emerald-400 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedExerciseDetail.mistakes && selectedExerciseDetail.mistakes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-zinc-300 mb-2">常见错误</h4>
                  <ul className="space-y-1">
                    {selectedExerciseDetail.mistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-zinc-400">
                        <span className="text-amber-400 mt-1">•</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="pt-4 border-t border-zinc-800">
                <button
                  onClick={() => {
                    handleSelectExercise(selectedExerciseDetail.name);
                    setShowExerciseDetail(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm text-black transition-all"
                  style={{ background: '#CCFF00' }}
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
