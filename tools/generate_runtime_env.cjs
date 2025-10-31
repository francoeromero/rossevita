// tools/generate_runtime_env.cjs
// Generates `public/runtime-env.js` containing a small snippet that assigns
// window.__env = { VITE_SUPABASE_URL: '...', VITE_SUPABASE_ANON_KEY: '...' }
// Run this before `vite build` so the file is included in the final bundle.

const fs = require('fs');
const path = require('path');

const outDir = path.resolve(process.cwd(), 'public');
const outFile = path.join(outDir, 'runtime-env.js');

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const content = `// This file is generated at build time. Do NOT commit secrets to source.
window.__env = window.__env || {};
window.__env.VITE_SUPABASE_URL = ${JSON.stringify(url)};
window.__env.VITE_SUPABASE_ANON_KEY = ${JSON.stringify(key)};
`;

fs.writeFileSync(outFile, content, 'utf8');
console.log('Wrote runtime env to', outFile);
