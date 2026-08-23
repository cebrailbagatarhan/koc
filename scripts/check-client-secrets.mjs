import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';

const sourceRoots = ['api', 'app', 'components', 'constants', 'hooks'];
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx']);

const walk = path => {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? walk(child) : sourceExtensions.has(extname(entry.name)) ? [child] : [];
  });
};

const targets = [...sourceRoots.flatMap(walk), 'package.json'].filter(existsSync);

const forbidden = [
  ['Google API key literal', /AIza[A-Za-z0-9_-]{20,}/],
  ['direct Gemini client SDK', /@google\/genai/],
  ['client-side Gemini key variable', /EXPO_PUBLIC_(?:GEMINI|GOOGLE).*KEY/],
  ['hard-coded API key assignment', /(?:apiKey|GEMINI_API_KEY)\s*=\s*['"][^'"]+['"]/],
];

const failures = [];
for (const path of targets) {
  const content = readFileSync(path, 'utf8');
  for (const [name, pattern] of forbidden) {
    if (pattern.test(content)) failures.push(`${path}: ${name}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Client secret regression check passed.');
