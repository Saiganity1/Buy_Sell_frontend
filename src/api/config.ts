// Using a simple env shim for Expo without extra plugins. Edit this value if needed.
declare const process: any;

function detectBaseUrl() {
	// Prefer explicit env when provided
	const envUrl = process && process.env && process.env.API_BASE_URL;
	if (envUrl) return envUrl;
	// In web, use current hostname with port 8000 to avoid 127.0.0.1 vs localhost or LAN IP mismatches
	if (typeof window !== 'undefined' && window.location && window.location.hostname) {
		const host = window.location.hostname;
		return `http://${host}:8000/api`;
	}
	// Fallback for native dev
	return 'http://127.0.0.1:8000/api';
}

export const API_BASE_URL = detectBaseUrl();
