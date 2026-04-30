const { execSync } = require('child_process');
try {
  const out = execSync('npx tsc --noEmit --pretty false src/app/page.tsx 2>&1', { cwd: 'D:\\FitCoach', encoding: 'utf8', timeout: 20000 });
  console.log(out);
} catch (e) {
  console.log('STDOUT:', e.stdout);
  console.log('STDERR:', e.stderr);
}
