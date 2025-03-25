<script>
	import { onMount, onDestroy } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import { dev } from '$app/environment';
	import { api, user } from '$lib/stores.js';

	export let interval = 30000; // 30 seconds default
	export let minTimeActive = 5000; // 5 seconds minimum activity threshold

	let lastActivity = Date.now();
	let heartbeatInterval;
	let mounted = false;
	let beforeUnloadHandler;
	let eventListeners = [];

	function updateActivity() {
		lastActivity = Date.now();
	}

	async function sendHeartbeat() {
		const timeSinceLastActivity = Date.now() - lastActivity;

		if (!mounted || timeSinceLastActivity > minTimeActive || !$user) {
			return;
		}

		try {
			const response = await fetch(`${api}/user/heartbeat`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				credentials: 'include'
			});

			// Handle rate limiting
			if (response.status === 429) {
				const data = await response.json();
				const retryAfter = parseInt(response.headers.get('Retry-After') || data.retryAfter || '60');

				if (heartbeatInterval) {
					clearInterval(heartbeatInterval);
					setTimeout(() => {
						heartbeatInterval = setInterval(sendHeartbeat, interval);
						sendHeartbeat(); // Try again after delay
					}, retryAfter * 1000);
				}

				if (dev) {
					console.warn(`Rate limited, will retry in ${retryAfter} seconds`);
				}
				return;
			}

			if (!response.ok) {
				throw new Error('Heartbeat failed');
			}

			const data = await response.json();
			if (!data.success) {
				throw new Error('Heartbeat unsuccessful');
			}

			if (dev) {
				console.log('Heartbeat sent successfully');
			}
		} catch (err) {
			if (dev) {
				console.error('Heartbeat error:', err);
			}
			if (err.name === 'TypeError') {
				toast.push('Lost connection to server. Some features may be unavailable.');
			}
		}
	}

	onMount(() => {
		mounted = true;

		// Initial heartbeat
		sendHeartbeat();

		// Set up activity listeners and store their references
		const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
		events.forEach((event) => {
			if (typeof window !== 'undefined') {
				window.addEventListener(event, updateActivity);
				eventListeners.push({ event, handler: updateActivity });
			}
		});

		// Set up heartbeat interval
		heartbeatInterval = setInterval(sendHeartbeat, interval);

		// Set up beforeunload handler
		if (typeof window !== 'undefined') {
			beforeUnloadHandler = () => {
				const timeSinceLastActivity = Date.now() - lastActivity;
				if (timeSinceLastActivity <= minTimeActive && $user) {
					sendHeartbeat();
				}
			};
			window.addEventListener('beforeunload', beforeUnloadHandler);
		}
	});

	onDestroy(() => {
		mounted = false;

		if (heartbeatInterval) {
			clearInterval(heartbeatInterval);
		}

		// Clean up all event listeners
		if (typeof window !== 'undefined') {
			eventListeners.forEach(({ event, handler }) => {
				window.removeEventListener(event, handler);
			});

			if (beforeUnloadHandler) {
				window.removeEventListener('beforeunload', beforeUnloadHandler);
			}
		}
	});
</script>

<slot />
