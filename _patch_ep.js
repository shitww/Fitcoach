const fs = require('fs');

const epPath = 'D:\\\FitCoach\\\ssrc\\\components\\\ExercisePicker.tsx';
let c = fs.readFileSync(epPath, 'utf-8');

// 1. Fix state type
c = c.replace(
    '  const [dbCustomExercises, setDbCustomExercises] = useState<{ id: string; name: string; muscleGroup: string }>[](;[]);',
    '  const [dbCustomExercises, setDbCustomExercises] = useState<{ id: string; name: string; muscleGroup: string; muscleGroupLabel: string }[][[]);'
);

// 2. Fix search results to track muscleGroupLabel
c = c.replace(
    'results.push({ exercise: ex.name, score, isCustom: true });',
    'const dbEx = dbCustomExercises.find(e => e.name === ex.name);
    results.push({ exercise: ex.name, score, isCustom: true, muscleGroup: dbEx?.muscleGroup, muscleGroupLabel: dbEx?.muscleGroupLabel || ex.muscleGroup });'
);

// 3. Fix group color lookup (use muscleGroupLabel for display)
const oldGroup = "const group = item.isCustom \n                                  ? (dbCustomExercises.find(e => e.name === item.exercise)?.muscleGroup || 'å°äºš' \n\n                                  : getExerciseGroup(item.exercise);";
const newGroup = "const group = item.isCustom \n                                 ? (mitem.muscleGroupLabel || dbCustomExercises.find(e => e.name === item.exercise)?.muscleGroupLabel || 'ä°ä–ª') \n\n                                  : getExerciseGroup(item.exercise);";
c = c.replace(oldGroup, newGroup);

// 4. Fix custom label text
c = c.replace(
    '<span className="text-xs text-zinc-600">{item.isCustom ? 'å‘äº”' : getExerciseType(item.exercise)}</span>',
    '<span className="text-xs text-zinc-600">{item.isCustom ? (item.muscleGroupLabel || 'Ø–”œ¤€è•Ñá•É¥Í•QåÁ”¡¥Ñ•´¹•á•É¥Í”¥ôğ½ÍÁ…¸øœ€(¤ì((¼¼€Ô¸¥à•µÁÑäÍÑ…Ñ”)Œ€ôŒ¹É•Á±…” (€€€€Ÿ¢×º“Ê;Â¾ƒŠª×Ê“Ê«‚«Š«Ê–Ã‚ú·’º»¢ŠŸÊƒ‚“Ê›ÊƒŠÂÚ«‚Š†ƒÒ£†