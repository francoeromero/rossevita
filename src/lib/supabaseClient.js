// Archivo: src/lib/supabaseClient.js
// Este archivo exporta un cliente Supabase configurado para usar en la app.
// INSTRUCCIONES: Agrega tus credenciales en un archivo .env a la raíz del proyecto
// con las siguientes variables (recomendado para Vite):
// VITE_SUPABASE_URL="https://xyzcompany.supabase.co"
// VITE_SUPABASE_ANON_KEY="public-anon-key-..."
// No peges las claves directamente aquí en el código en producción.

import { createClient } from '@supabase/supabase-js';

// Helper: try several places for env values so deployments that inject at runtime
// can still work. Vite sets import.meta.env at build time; some hosts require a
// runtime injection (window.__env) or via meta tags.
function readRuntimeEnv() {
	// 1) build-time Vite vars
	const viteUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined;
	const viteKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined;
	if (viteUrl && viteKey) return { url: viteUrl, key: viteKey };

	// 2) runtime global (window.__env) — useful if you generate a small script that
	// writes window.__env = { VITE_SUPABASE_URL: '...', VITE_SUPABASE_ANON_KEY: '...' };
	if (typeof window !== 'undefined' && window.__env && window.__env.VITE_SUPABASE_URL && window.__env.VITE_SUPABASE_ANON_KEY) {
		return { url: window.__env.VITE_SUPABASE_URL, key: window.__env.VITE_SUPABASE_ANON_KEY };
	}

	// 3) meta tags in index.html: <meta name="vite-supabase-url" content="...">
	try {
		if (typeof document !== 'undefined') {
			const mUrl = document.querySelector('meta[name="vite-supabase-url"]')?.getAttribute('content');
			const mKey = document.querySelector('meta[name="vite-supabase-anon-key"]')?.getAttribute('content');
			if (mUrl && mKey) return { url: mUrl, key: mKey };
		}
	} catch (e) {
		// ignore
	}

	return { url: null, key: null };
}

function isValidUrl(u) {
	try {
		if (!u) return false;
		const p = new URL(u);
		return p.protocol === 'http:' || p.protocol === 'https:';
	} catch (e) {
		return false;
	}
}

const runtime = readRuntimeEnv();
const SUPABASE_URL = runtime.url || null;
const SUPABASE_ANON_KEY = runtime.key || null;

let supabase;
if (!isValidUrl(SUPABASE_URL) || !SUPABASE_ANON_KEY) {
	// Provide a clear developer-friendly error and export a stub that throws on use.
	// This avoids cryptic stack traces from deep in the SDK.
	// eslint-disable-next-line no-console
	console.error('Supabase not configured: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found or invalid.\n' +
		'Set these as build-time env vars (Vite) or provide runtime values via window.__env or meta tags.\n' +
		'See README or project docs for instructions.');

	// Minimal stub to fail fast if used.
	supabase = new Proxy({}, {
		get() { throw new Error('Supabase client is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'); }
	});
} else {
	supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export { supabase };

// Nota: Para operaciones de servidor seguras (ej. backups, triggers) usa la
// service_role key en un entorno backend seguro — nunca desde el cliente.
