// Gate de tipos con ratchet: falla si los errores de TS superan la línea base.
// La línea base solo puede bajar (ver docs/sdd/SPEC-testing-profesional.md).
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const BASELINE_FILE = new URL('./typecheck-baseline.json', import.meta.url);
const run = spawnSync('pnpm', ['exec', 'tsc', '-b'], { encoding: 'utf8', shell: true });
const errors = new Set(
  `${run.stdout}${run.stderr}`.split('\n').filter((l) => l.includes('error TS')),
).size;
const { baseline } = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));

if (process.argv.includes('--update') && errors < baseline) {
  writeFileSync(BASELINE_FILE, JSON.stringify({ baseline: errors }) + '\n');
  console.log(`Línea base bajó: ${baseline} -> ${errors}`);
} else if (errors > baseline) {
  console.error(`Typecheck: ${errors} errores > línea base ${baseline}. No introduzcas errores nuevos.`);
  process.exit(1);
} else {
  console.log(`Typecheck OK: ${errors} errores (línea base ${baseline}).`);
}
