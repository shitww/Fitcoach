const fs = require('fs');
const files = [
  'D:/FitCoach/src/components/ExercisePicker.tsx',
  'D:/FitCoach/src/app/exercises/page.tsx',
  'D:/FitCoach/src/app/workout/page.tsx'
];
files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(/api\/exercises/g);
  console.log(f.replace('D:/FitCoach/src/', '') + ': ' + (m ? m.length : 0) + ' calls to /api/exercises');
});