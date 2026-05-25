/**
 * FitCoach Exercise 种子脚本 (Raw SQL 版)
 * 绕过 Prisma Client 类型限制，直接执行 SQL
 *
 * 用法: node scripts/seed-exercises.cjs
 */

const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// ───── 内置动作数据 ─────
const BUILT_IN = [
  { name: '卧推 (Bench Press)', alias: 'bench press, barbell bench', muscleGroup: 'chest', category: '力量', difficulty: '中等', equipment: 'Barbell' },
  { name: '上斜卧推 (Incline Press)', alias: 'incline bench press', muscleGroup: 'chest', category: '力量', difficulty: '中等', equipment: 'Barbell' },
  { name: '下斜卧推 (Decline Press)', alias: 'decline bench press', muscleGroup: 'chest', category: '力量', difficulty: '中等', equipment: 'Barbell' },
  { name: '哑铃卧推 (Dumbbell Press)', alias: 'dumbbell bench', muscleGroup: 'chest', category: '力量', difficulty: '中等', equipment: 'Dumbbell' },
  { name: '上斜哑铃卧推 (Incline Dumbbell Press)', alias: 'incline dumbbell', muscleGroup: 'chest', category: '力量', difficulty: '中等', equipment: 'Dumbbell' },
  { name: '哑铃飞鸟 (Dumbbell Fly)', alias: 'fly, flyes', muscleGroup: 'chest', category: '力量', difficulty: '中等', equipment: 'Dumbbell' },
  { name: '绳索夹胸 (Cable Crossover)', alias: 'cable crossover', muscleGroup: 'chest', category: '力量', difficulty: '中等', equipment: 'Cable' },
  { name: '双杠臂屈伸 (Dip)', alias: 'dips, chest dip', muscleGroup: 'chest', category: '力量', difficulty: '中等', equipment: 'Bodyweight' },
  { name: '俯卧撑 (Push-up)', alias: 'push up', muscleGroup: 'chest', category: '力量', difficulty: '简单', equipment: 'Bodyweight' },

  { name: '引体向上 (Pull-up)', alias: 'pull up', muscleGroup: 'back', category: '力量', difficulty: '中等', equipment: 'Bodyweight' },
  { name: '杠铃划船 (Barbell Row)', alias: 'barbell row, row', muscleGroup: 'back', category: '力量', difficulty: '中等', equipment: 'Barbell' },
  { name: '哑铃划船 (Dumbbell Row)', alias: 'dumbbell row', muscleGroup: 'back', category: '力量', difficulty: '中等', equipment: 'Dumbbell' },
  { name: '高位下拉 (Lat Pulldown)', alias: 'lat pulldown, pulldown', muscleGroup: 'back', category: '力量', difficulty: '中等', equipment: 'Machine' },
  { name: '坐姿划船 (Seated Row)', alias: 'seated row, cable row', muscleGroup: 'back', category: '力量', difficulty: '中等', equipment: 'Cable' },
  { name: '硬拉 (Deadlift)', alias: 'deadlift', muscleGroup: 'back', category: '力量', difficulty: '困难', equipment: 'Barbell' },
  { name: '罗马尼亚硬拉 (Romanian Deadlift)', alias: 'romanian deadlift, rdl', muscleGroup: 'back', category: '力量', difficulty: '中等', equipment: 'Barbell' },
  { name: '面拉 (Face Pull)', alias: 'face pull', muscleGroup: 'back', category: '力量', difficulty: '中等', equipment: 'Cable' },

  { name: '深蹲 (Squat)', alias: 'squat, barbell squat', muscleGroup: 'legs', category: '力量', difficulty: '困难', equipment: 'Barbell' },
  { name: '前蹲 (Front Squat)', alias: 'front squat', muscleGroup: 'legs', category: '力量', difficulty: '困难', equipment: 'Barbell' },
  { name: '腿举 (Leg Press)', alias: 'leg press', muscleGroup: 'legs', category: '力量', difficulty: '中等', equipment: 'Machine' },
  { name: '腿弯举 (Leg Curl)', alias: 'leg curl, hamstring curl', muscleGroup: 'legs', category: '力量', difficulty: '简单', equipment: 'Machine' },
  { name: '腿屈伸 (Leg Extension)', alias: 'leg extension, quad extension', muscleGroup: 'legs', category: '力量', difficulty: '简单', equipment: 'Machine' },
  { name: '保加利亚分腿蹲 (Bulgarian Split Squat)', alias: 'bulgarian split squat', muscleGroup: 'legs', category: '力量', difficulty: '中等', equipment: 'Dumbbell' },
  { name: '箭步蹲 (Lunges)', alias: 'lunges', muscleGroup: 'legs', category: '力量', difficulty: '中等', equipment: 'Dumbbell' },
  { name: '提踵 (Calf Raise)', alias: 'calf raise', muscleGroup: 'legs', category: '力量', difficulty: '简单', equipment: 'Machine' },
  { name: '臀推 (Hip Thrust)', alias: 'hip thrust, glute bridge', muscleGroup: 'legs', category: '力量', difficulty: '中等', equipment: 'Barbell' },

  { name: '杠铃推举 (Overhead Press)', alias: 'overhead press, ohp, military press', muscleGroup: 'shoulders', category: '力量', difficulty: '中等', equipment: 'Barbell' },
  { name: '哑铃推举 (Dumbbell Shoulder Press)', alias: 'dumbbell shoulder press', muscleGroup: 'shoulders', category: '力量', difficulty: '中等', equipment: 'Dumbbell' },
  { name: '侧平举 (Lateral Raise)', alias: 'lateral raise', muscleGroup: 'shoulders', category: '力量', difficulty: '简单', equipment: 'Dumbbell' },
  { name: '前平举 (Front Raise)', alias: 'front raise', muscleGroup: 'shoulders', category: '力量', difficulty: '简单', equipment: 'Dumbbell' },
  { name: '俯身飞鸟 (Rear Delt Fly)', alias: 'rear delt fly, reverse fly', muscleGroup: 'shoulders', category: '力量', difficulty: '简单', equipment: 'Dumbbell' },
  { name: '阿诺德推举 (Arnold Press)', alias: 'arnold press', muscleGroup: 'shoulders', category: '力量', difficulty: '中等', equipment: 'Dumbbell' },
  { name: '杠铃耸肩 (Shrug)', alias: 'shrug', muscleGroup: 'shoulders', category: '力量', difficulty: '简单', equipment: 'Barbell' },

  { name: '杠铃弯举 (Barbell Curl)', alias: 'barbell curl, curl', muscleGroup: 'arms', category: '力量', difficulty: '简单', equipment: 'Barbell' },
  { name: '哑铃弯举 (Dumbbell Curl)', alias: 'dumbbell curl', muscleGroup: 'arms', category: '力量', difficulty: '简单', equipment: 'Dumbbell' },
  { name: '锤式弯举 (Hammer Curl)', alias: 'hammer curl', muscleGroup: 'arms', category: '力量', difficulty: '简单', equipment: 'Dumbbell' },
  { name: '牧师凳弯举 (Preacher Curl)', alias: 'preacher curl', muscleGroup: 'arms', category: '力量', difficulty: '中等', equipment: 'Barbell' },
  { name: '绳索下压 (Tricep Pushdown)', alias: 'tricep pushdown, pushdown', muscleGroup: 'arms', category: '力量', difficulty: '简单', equipment: 'Cable' },
  { name: '窄距卧推 (Close-grip Bench Press)', alias: 'close grip bench, cgbp', muscleGroup: 'arms', category: '力量', difficulty: '中等', equipment: 'Barbell' },
  { name: '仰卧臂屈伸 (Skull Crusher)', alias: 'skull crusher, lying tricep extension', muscleGroup: 'arms', category: '力量', difficulty: '中等', equipment: 'Barbell' },
  { name: '颈后臂屈伸 (Overhead Tricep Extension)', alias: 'overhead tricep extension', muscleGroup: 'arms', category: '力量', difficulty: '中等', equipment: 'Dumbbell' },
];

async function main() {
  console.log('🌱 Seed via Raw SQL...\n');

  // ─── Step 1: 插入内置动作（跳过重复）───
  let builtInCreated = 0;
  for (const ex of BUILT_IN) {
    const existing = await p.$queryRaw`SELECT id FROM Exercise WHERE name = ${ex.name}`;
    if (existing.length === 0) {
      const id = cuid();
      await p.$executeRaw`
        INSERT INTO Exercise (id, name, alias, muscleGroup, category, difficulty, equipment, userId, isCustom, createdAt)
        VALUES (${id}, ${ex.name}, ${ex.alias}, ${ex.muscleGroup}, ${ex.category}, ${ex.difficulty}, ${ex.equipment}, NULL, 0, datetime('now'))
      `;
      builtInCreated++;
    }
  }
  console.log(`✅ 内置动作: 新增 ${builtInCreated}`);

  // ─── Step 2: 确保 WorkoutSet 中所有动作都有 Exercise 记录 ───
  const wsExercises = await p.$queryRaw`SELECT DISTINCT exercise FROM WorkoutSet`;
  for (const row of wsExercises) {
    const name = row.exercise;
    const existing = await p.$queryRaw`SELECT id FROM Exercise WHERE name = ${name}`;
    if (existing.length === 0) {
      let muscleGroup = 'chest';
      const lower = name.toLowerCase();
      if (/背|back|row|pull|lats|lat|dead|硬拉|划船|引体/i.test(lower)) muscleGroup = 'back';
      else if (/腿|leg|squat|深蹲|蹲|cal(f|ve)|提踵|lunge|箭步|臀|hip|thrust/i.test(lower)) muscleGroup = 'legs';
      else if (/肩|shoulder|del|press|推举|shrug|耸肩|lateral/i.test(lower)) muscleGroup = 'shoulders';
      else if (/臂|arm|bicep|tricep|curl|弯举|extension|臂屈伸|下压|pushdown/i.test(lower)) muscleGroup = 'arms';

      const id = cuid();
      await p.$executeRaw`
        INSERT INTO Exercise (id, name, muscleGroup, category, userId, isCustom, createdAt)
        VALUES (${id}, ${name}, ${muscleGroup}, '力量', NULL, 0, datetime('now'))
      `;
      console.log(`🆕 自动创建: ${name} → ${muscleGroup}`);
    }
  }

  // ─── Step 3: 回填 WorkoutSet.exerciseId ───
  const exercises = await p.$queryRaw`SELECT id, name FROM Exercise`;
  const nameToId = {};
  for (const row of exercises) { nameToId[row.name] = row.id; }

  const allWS = await p.$queryRaw`SELECT id, exercise FROM WorkoutSet`;
  let updated = 0, skipped = 0;

  for (const ws of allWS) {
    const exId = nameToId[ws.exercise];
    if (exId) {
      await p.$executeRaw`UPDATE WorkoutSet SET exerciseId = ${exId} WHERE id = ${ws.id}`;
      updated++;
    } else {
      console.warn(`⚠️  no Exercise for "${ws.exercise}" (ws=${ws.id})`);
      skipped++;
    }
  }

  console.log(`\n🔗 exerciseId 回填: ${updated} OK / ${skipped} skip`);

  // ─── Step 4: 验证 ───
  const [exCount] = await p.$queryRaw`SELECT COUNT(*) as c FROM Exercise`;
  const [wsCount] = await p.$queryRaw`SELECT COUNT(*) as c FROM WorkoutSet WHERE exerciseId IS NOT NULL`;
  console.log(`\n✅ Done! Exercise: ${exCount.c}, WS linked: ${wsCount.c}/${allWS.length}`);
}

// cuid helper (copy of cuid structure)
function cuid() {
  const ts = Date.now().toString(36);
  let rand = '';
  for (let i = 0; i < 16; i++) rand += 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)];
  return 'c' + ts + rand;
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => p.$disconnect());