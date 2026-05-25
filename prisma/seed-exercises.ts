/**
 * 从 Free Exercise DB 导入动作数据并合并到现有数据库
 * 运行: npx ts-node prisma/seed-exercises.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Free Exercise DB primaryMuscles → 我们的 muscleGroup 英文 key
const MUSCLE_MAP: Record<string, string> = {
  'chest': 'chest',
  'lats': 'back',
  'middle back': 'back',
  'lower back': 'back',
  'traps': 'back',
  'rhomboids': 'back',
  'neck': 'back',
  'shoulders': 'shoulders',
  'biceps': 'arms',
  'triceps': 'arms',
  'forearms': 'arms',
  'quadriceps': 'legs',
  'hamstrings': 'legs',
  'glutes': 'legs',
  'calves': 'legs',
  'adductors': 'legs',
  'abductors': 'legs',
  'abdominals': 'abs',
  'hip flexors': 'legs',
  'it band': 'legs',
  'inner thighs': 'legs',
  'groin': 'legs',
  'soleus': 'legs',
  'piriformis': 'legs',
  'hamstring': 'legs',
  'tibialis anterior': 'legs',
  'brachialis': 'arms',
  'wrist': 'arms',
  'serratus anterior': 'chest',
  'rotator cuff': 'shoulders',
  'supraspinatus': 'shoulders',
  'infraspinatus': 'shoulders',
  'biceps brachii': 'arms',
  'triceps brachii': 'arms',
  'iliopsoas': 'abs',
  'rectus abdominis': 'abs',
  'obliques': 'abs',
  'transverse abdominis': 'abs',
  'erector spinae': 'back',
  'multifidus': 'back',
  'latissimus dorsi': 'back',
};

// equipment 映射
const EQUIPMENT_MAP: Record<string, string> = {
  'barbell': 'Barbell',
  'dumbbell': 'Dumbbell',
  'body only': 'Bodyweight',
  'machine': 'Machine',
  'cable': 'Cable',
  'kettlebells': 'Kettlebell',
  'bands': 'Bands',
  'e-z curl bar': 'EZ Bar',
  'exercise ball': 'Exercise Ball',
  'medicine ball': 'Medicine Ball',
  'foam roll': 'Foam Roll',
  'other': null as unknown as string,
};

// level → difficulty
const LEVEL_MAP: Record<string, string> = {
  'beginner': '简单',
  'intermediate': '中等',
  'expert': '困难',
};

interface FreeExercise {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

async function main() {
  console.log('⬇️  正在从 Free Exercise DB 下载动作数据...');

  const res = await fetch(
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
  );
  if (!res.ok) throw new Error(`下载失败: ${res.status}`);

  const data: FreeExercise[] = await res.json();
  console.log(`✅ 共 ${data.length} 个动作`);

  // 获取现有动作名（避免重名）
  const existing = await prisma.exercise.findMany({
    where: { userId: null },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((e) => e.name.toLowerCase()));
  console.log(`📦 现有系统动作: ${existingNames.size} 个`);

  let inserted = 0;
  let skipped = 0;

  for (const ex of data) {
    // 获取主肌群（未知肌群使用原始名称作为新类型）
    const primary = ex.primaryMuscles[0]?.toLowerCase() || 'other';
    const muscleGroup = MUSCLE_MAP[primary] || primary;

    // 跳过已存在的动作名
    if (existingNames.has(ex.name.toLowerCase())) {
      skipped++;
      continue;
    }

    const equipment = ex.equipment
      ? (EQUIPMENT_MAP[ex.equipment.toLowerCase()] ?? ex.equipment)
      : null;

    const difficulty = LEVEL_MAP[ex.level] || '中等';

    // instructions 是数组，合并为字符串
    const instructions = ex.instructions.join('\n');

    // mechanic → category
    const category = ex.mechanic === 'compound' ? 'compound' : 'isolation';

    try {
      await prisma.exercise.create({
        data: {
          name: ex.name,
          muscleGroup,
          category,
          equipment: equipment || null,
          difficulty,
          instructions: instructions || null,
          description: null,
          tips: null,
          commonMistakes: null,
          userId: null, // 系统动作
        },
      });
      existingNames.add(ex.name.toLowerCase());
      inserted++;
    } catch {
      skipped++;
    }
  }

  console.log(`\n🎉 导入完成！`);
  console.log(`   ✅ 新增: ${inserted} 个`);
  console.log(`   ⏭️  跳过(重复): ${skipped} 个`);

  const total = await prisma.exercise.count({ where: { userId: null } });
  console.log(`   📊 数据库现有系统动作: ${total} 个`);
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
