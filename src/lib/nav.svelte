<script>
	import { user, builds } from '$lib/stores';
	import { onMount } from 'svelte';
	import { api } from '$lib/stores';
	import { toast } from '@zerodevx/svelte-toast';
	import Avatar from '$lib/avatar.svelte';
	import themes from '$lib/data/themes.json';
	import Icon from '@iconify/svelte';

	// Reactive state
	let innerWidth = 0;
	let activeTheme = 'overworld';

	const PAGES = ['home', 'builder', 'talents', 'discord', 'aen', 'support', 'privacy'];
	const TABS = ['Stats', 'Talents', 'Mantras', 'Weapons', 'Summary'];

	// Navigation helper
	function hop(e) {
		const selected = document.getElementsByClassName('selected')[0];
		if (selected) selected.classList.remove('selected');
		document.getElementById(e.target.id)?.classList.add('selected');
	}

	// Display mode handling
	function switchMode(e) {
		const container = document.getElementById('builder-container');
		if (!container) return;

		if (!e.target.checked) {
			container.style.maxWidth = '475px';
			container.style.width = '100vw';
			TABS.forEach((tab) => {
				if (tab !== 'Stats') {
					document.getElementById(tab).style.display = 'none';
				}
			});
		} else {
			container.style.maxWidth = 'none';
			container.style.width = '95vw';
		}
	}

	// Theme management
	function switchTheme(e) {
		const targetTheme = e.target.id;
		if (themes[activeTheme] !== e.target.classList[0]) {
			e.target.classList.add('active-theme');
			document.querySelector(`#${activeTheme}`)?.classList.remove('active-theme');
			applyTheme(targetTheme);
		}
	}

	function applyTheme(theme) {
		if (theme !== 'festive' && theme !== 'black-silence') {
			localStorage.setItem('_dwb.theme', theme);
		}

		activeTheme = theme;
		const root = document.querySelector(':root');
		const themeData = themes[theme];

		Object.entries(themeData).forEach(([property, value]) => {
			root.style.setProperty(property, value);
		});
	}

	// User authentication
	async function initializeAuth() {
		try {
			const res = await fetch(`${api}/user/me`, {
				credentials: 'include'
			});

			const loginButton = document.querySelector('#login');
			const logoutButton = document.querySelector('#logout');

			if (!res.ok) {
				// Handle non-200 responses properly
				if (res.status === 401) {
					setupUnauthenticatedState(loginButton, logoutButton);
					return;
				}
				throw new Error(`Auth request failed with status ${res.status}`);
			}

			const userData = await res.json();

			// Update user store and UI in a single block
			if (userData && userData.id) {
				setupAuthenticatedState(userData, loginButton, logoutButton);
			} else {
				throw new Error('Invalid user data received');
			}
		} catch (error) {
			// Let the error propagate to the onMount handler
			throw error;
		}
	}

	// Helper functions to manage auth states
	function setupAuthenticatedState(userData, loginButton, logoutButton) {
		// Update user store
		userData.avatar = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
		user.set(userData);

		// Update UI
		if (loginButton) {
			loginButton.href = `/profile/u/${userData.username}`;
			loginButton.innerHTML = 'Profile';
		}

		if (logoutButton) {
			logoutButton.style.display = 'block';
			logoutButton.addEventListener('click', handleLogout);
		}
	}

	function setupUnauthenticatedState(loginButton, logoutButton) {
		if (loginButton) {
			loginButton.href = `${api}/login`;
			loginButton.innerHTML = 'Log in';
		}
		if (logoutButton) {
			logoutButton.style.display = 'none';
		}
		user.set(null);
	}

	async function handleLogout() {
		try {
			await fetch(`${api}/logout`, {
				credentials: 'include'
			});
			user.set(null);
			location.reload();
		} catch (error) {
			console.error('Logout error:', error);
			toast.push('Failed to log out. Please try again.');
		}
	}

	onMount(() => {
		// Run UI initialization immediately
		const currentPath = window.location.pathname.substring(1);
		const activePage = currentPath && PAGES.includes(currentPath) ? currentPath : 'home';
		document.querySelector(`#${activePage}`)?.classList.add('selected');

		// Initialize theme
		document.querySelector('#overworld')?.classList.add('active-theme');
		const savedTheme = localStorage.getItem('_dwb.theme') || 'overworld';
		applyTheme(savedTheme);

		// Handle special themes
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('id') === 'WORKSHOP') {
			applyTheme('black-silence');
		}

		// Handle auth separately
		initializeAuth().catch((error) => {
			console.error('Failed to initialize auth:', error);
			toast.push('Authentication failed. Some features may be unavailable.');

			// Ensure UI is in unauthenticated state
			const loginButton = document.querySelector('#login');
			const logoutButton = document.querySelector('#logout');
			if (loginButton) {
				loginButton.href = `${api}/login`;
				loginButton.innerHTML = 'Log in';
			}
			if (logoutButton) {
				logoutButton.style.display = 'none';
			}
			user.set(null);
		});
	});
</script>

<svelte:window bind:innerWidth />
<!-- Right nav -->
<div class="nav right nav-menu border">
	<div
		style="display: flex; align-items: center; padding: 0px 25px 0px 15px; border-bottom: 1px lightgray solid"
	>
		<img src="/menu.png" alt="icon" style="max-width: 18px; margin-right: 10px;" />
		<p>User controls</p>
		<button
			class="close-button"
			on:click={() => document.querySelector('.nav.right').classList.toggle('active')}
		>
			<Icon icon="octicon:x-16" />
		</button>
	</div>
	<a class="nav-option" id="login" href="/">Profile</a>
	<a class="nav-option" id="logout" href="/">Log out</a>
</div>
<!-- Left nav -->
<div class="nav left nav-menu border" data-sveltekit-reload>
	<div
		style="display: flex; align-items: center; padding: 0px 25px 0px 15px; border-bottom: 1px lightgray solid"
	>
		<img src="/menu.png" alt="icon" style="max-width: 18px; margin-right: 10px;" />
		<p>Navigation</p>
		<button
			class="close-button"
			on:click={() => document.querySelector('.nav.left').classList.toggle('active')}
		>
			<Icon icon="octicon:x-16" />
		</button>
	</div>
	<a id="home" class="nav-option" href="/" on:click={hop}>Home</a>
	<a id="builder" class="nav-option" href="/builder" on:click={hop}>Builder</a>
	<a id="talents" class="nav-option" href="/talents" on:click={hop}>Talents</a>
	<a
		id="discord"
		class="nav-option"
		target="_blank"
		rel="noreferrer"
		href="https://discord.gg/B3BwytYWVK">Discord</a
	>
	<a id="aen" class="nav-option" href="/aen" on:click={hop}>Aen (Discord Bot)</a>
	<a id="support" class="nav-option" href="/support" on:click={hop}>Support Me</a>
	<a id="privacy" class="nav-option" href="/privacy" on:click={hop}>Privacy Policy</a>
	<!-- Themes -->
	<div class="themes">
		<hr />
		<div style="display: flex; justify-content: space-between">
			{#each Object.entries(themes) as [theme, themeData]}
				{#if themeData.displayed}
					<button
						class="theme-button"
						style={`background: ${themeData['--background']}`}
						on:click={switchTheme}
						id={theme}
					/>
				{/if}
			{/each}
		</div>
		{#if innerWidth > 800}
			<div class="toggle-desktop">
				<input id="toggleDesktop" type="checkbox" on:change={switchMode} />Desktop Mode
			</div>
		{/if}
		<div style="font-size: 12px; color: grey; margin: 5px">
			<b>@cyfiee</b> - v3.1
		</div>
	</div>
</div>
<div class="navbar border">
	<div class="logo">
		<button
			id="navbutton"
			class="nav-button border-thin"
			on:click={() => document.querySelector('.nav.left').classList.toggle('active')}
		>
			<img src="/menu.png" alt="nav menu" style="max-height: 100%;" />
		</button>
		<a
			style="display: flex; align-items: center; color: white; font-size: 15px; margin-left: 10px; text-decoration: none"
			href="/"
		>
			<img src="/favicon.png" alt="icon" style="max-width: 25px; margin-right: 5px;" />
			<p>Deepwoken Hub</p>
		</a>
	</div>
	<!-- Right menu -->
	<div id="profile">
		<p id="profileName" style="margin-right: 15px">
			{$user && Object.keys($user).length > 0 ? $user.username : 'Guest'}
		</p>
		<Avatar
			img={$user ? $user.avatar : '/discord.png'}
			w="25px"
			h="25px"
			on:click={() => document.querySelector('.nav.right').classList.toggle('active')}
		/>
	</div>
</div>

<style>
	@import '$lib/css/nav.css';
</style>
