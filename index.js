// Ensure gesture handler is initialized before any other imports
import 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

// Minimal URL polyfill for Android Hermes if needed (avoids crashes from URL.protocol)
(() => {
	if (Platform.OS === 'web') return;
	try {
		// If URL exists and works, do nothing
		// eslint-disable-next-line no-undef
		const ok = typeof URL !== 'undefined' && (() => {
			try { return !!new URL('http://example.com').protocol; } catch { return false; }
		})();
		if (ok) return;
	} catch {}
	// Provide a tiny parser that supports protocol, host, href
	// eslint-disable-next-line no-undef
	global.URL = function URL(href) {
		const str = String(href || '');
		const m = str.match(/^(https?):\/\/([^\/#?]+)(.*)$/i);
		const protocol = m ? (m[1].toLowerCase() + ':') : '';
		const host = m ? m[2] : '';
		const rest = m ? m[3] : '';
		this.href = str;
		this.protocol = protocol;
		this.host = host;
		this.pathname = rest || '';
	};
})();

registerRootComponent(App);

// Ensure Snack and other bundlers that expect a default export can render the app
export default App;
