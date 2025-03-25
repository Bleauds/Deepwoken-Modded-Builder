<script>
	import { onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import { dev } from '$app/environment';
	import {
		api,
		statsStore,
		attributesStore,
		takenTalentsStore,
		takenMantrasStore,
		preShrineStore,
		postShrineStore,
		takenWeapon,
		takenEnchant,
		takenMotif,
		notes,
		favoritedTalents,
		mantraModifications,
		tagsStore,
		isPrivate,
		user
	} from '$lib/stores.js';
	import Icon from '@iconify/svelte';

	// Props
	export let display;
	export let currentBuildId = null;
	export let authorId = 0;

	$: console.log(authorId);

	let exportedBuildUrl = null;
	let isAuthor = false;

	// Client-side model and export (Svelte component)
	const CLIENT_BUILD_MODEL = {
		version: 3,
		stats: {},
		attributes: {},
		content: {
			mantraModifications: {},
			notes: ''
		},
		meta: {
			tags: []
		},
		talents: [],
		mantras: [],
		weapons: '',
		enchant: '',
		motif: '',
		preShrine: {
			weapon: {},
			attunement: {},
			base: {}
		}
	};

	function normalizeClientBuildData(buildData) {
		// Previous normalization code remains the same
		const normalized = {
			...CLIENT_BUILD_MODEL,
			version: 3,
			stats: {
				...buildData.stats,
				buildName: buildData.stats.buildName || '',
				buildDescription: buildData.stats.buildDescription || '',
				buildAuthor: buildData.stats.buildAuthor || '',
				meta: buildData.stats.meta || {}
			},
			attributes: {
				weapon: buildData.attributes?.weapon || {},
				attunement: buildData.attributes?.attunement || {},
				base: buildData.attributes?.base || {}
			},
			content: {
				mantraModifications: buildData.content?.mantraModifications || {},
				notes: buildData.content?.notes || ''
			},
			meta: {
				tags: buildData.tags || [],
				isPrivate: buildData.isPrivate || false
			},
			talents: buildData.talents || [],
			mantras: buildData.mantras || [],
			weapons: buildData.weapons || '',
			enchant: buildData.enchant || '',
			motif: buildData.motif || '',
			preShrine: buildData.preShrine || {
				weapon: {},
				attunement: {},
				base: {}
			},
			postShrine: buildData.postShrine || {
				weapon: {},
				attunement: {},
				base: {}
			},
			favoritedTalents: buildData.favoritedTalents || []
		};

		return normalized;
	}

	// Helper functions remain the same
	async function copyToClipboard(buildUrl) {
		try {
			await navigator.clipboard.writeText(buildUrl);
			toast.push('Build link copied to the clipboard! Loading the build in 2 seconds...');
			return true;
		} catch (err) {
			toast.push(`Could not copy link due to: ${err.message}`);
			toast.push('Please copy the ID yourself!');
			return false;
		}
	}

	function saveBuildToLocalStorage(buildId, buildName) {
		try {
			localStorage.setItem(`_dwb.build.${buildId}`, buildName);
			return true;
		} catch (err) {
			console.error('Failed to save to localStorage:', err);
			return false;
		}
	}

	function createBuildUrl(buildId) {
		const baseUrl = dev ? 'http://localhost:5173/builder' : 'https://deepwoken.co/builder';
		return `${baseUrl}?id=${buildId}`;
	}

	// New function to handle build updates
	async function updateBuild() {
		if (!$user) {
			toast.push('You must be logged in to update builds');
			return;
		}

		toast.push('Updating build...');

		// Prepare build data
		const clientBuild = normalizeClientBuildData({
			stats: {
				...$statsStore,
				buildName: document.querySelector('#build-name').value,
				buildDescription: document.querySelector('#build-description').textContent
			},
			attributes: $attributesStore,
			content: {
				mantraModifications: $mantraModifications || {},
				notes: $notes || ''
			},
			talents: $takenTalentsStore || [],
			mantras: $takenMantrasStore || [],
			weapons: $takenWeapon || '',
			preShrine: $preShrineStore ? $preShrineStore : $attributesStore,
			postShrine: $postShrineStore ? $postShrineStore : $attributesStore,
			tags: $tagsStore || [],
			favoritedTalents: $favoritedTalents || [],
			isPrivate: $isPrivate || false
		});

		try {
			const response = await fetch(`${api}/build/${currentBuildId}`, {
				method: 'PUT',
				body: JSON.stringify(clientBuild),
				headers: {
					'content-type': 'application/json'
				},
				credentials: 'include'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to update build');
			}

			toast.push('Build updated successfully!');

			// Refresh the page to show updated build
			window.location.reload();
		} catch (error) {
			console.error('Error updating build:', error);
			toast.push(`Failed to update build: ${error.message}`);
		}
	}

	// Main export build function
	async function exportBuild() {
		if ($user === null) {
			toast.push('Exporting... We recommend logging in to save your build!');
		} else {
			toast.push('Exporting...');
		}

		// Prepare build data
		const clientBuild = normalizeClientBuildData({
			stats: {
				...$statsStore,
				buildName: document.querySelector('#build-name').value,
				buildDescription: document.querySelector('#build-description').textContent
			},
			attributes: $attributesStore,
			content: {
				mantraModifications: $mantraModifications || {},
				notes: $notes || ''
			},
			talents: $takenTalentsStore || [],
			mantras: $takenMantrasStore || [],
			weapons: $takenWeapon || '',
			preShrine: $preShrineStore ? $preShrineStore : $attributesStore,
			postShrine: $postShrineStore ? $postShrineStore : $attributesStore,
			tags: $tagsStore || [],
			favoritedTalents: $favoritedTalents || [],
			isPrivate: $isPrivate || false
		});

		console.log('Exporting build:', clientBuild);

		// Send build to server
		let response;
		try {
			response = await fetch(`${api}/build`, {
				method: 'POST',
				body: JSON.stringify(clientBuild),
				headers: {
					'content-type': 'application/json'
				},
				credentials: 'include'
			});
		} catch (error) {
			console.error('Network error during export:', error);
			toast.push(`Export failed: Network error - ${error.message}`);
			return;
		}

		// Handle non-OK response
		if (!response.ok) {
			let errorData;
			try {
				errorData = await response.json();
			} catch (e) {
				console.error('Error parsing error response:', e);
				toast.push(`Export failed: Server error (${response.status})`);
				return;
			}

			const errorMessage = `Export failed! Error: ${errorData.error || 'undefined'} - ${
				errorData.details || ''
			}`;
			console.error('Server error during export:', errorData);
			toast.push(errorMessage);
			return;
		}

		// Handle successful response
		let buildId;
		try {
			const res = await response.json();
			buildId = res.id;
			console.log('Export successful: ', res.id);
		} catch (error) {
			console.error('Error parsing success response:', error);
			toast.push('Export failed: Invalid server response');
			return;
		}

		// Save to localStorage if build has a name
		//if (clientBuild.stats.buildName) {
		saveBuildToLocalStorage(buildId, clientBuild.stats.buildName);
		//}

		// Create and set build URL
		const buildUrl = createBuildUrl(buildId);
		const buildLinkElement = document.querySelector('#buildLink');
		if (buildLinkElement) {
			buildLinkElement.value = buildUrl;
		}
		// Make the get link button copy the link to clipboard and redirect
		exportedBuildUrl = buildUrl;

		// Copy to clipboard and redirect
		await copyToClipboard(buildUrl);
		setTimeout(() => {
			window.location.href = buildUrl;
		}, 2000);
	}

	function handleCopyLink() {
		const url = exportedBuildUrl || window.location.href;
		navigator.clipboard.writeText(url);
		toast.push('Link copied to clipboard!');
	}

	// Modified onMount to check if user is author
	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		const buildId = urlParams.get('id');
		if (buildId) {
			currentBuildId = buildId;
			exportedBuildUrl = createBuildUrl(buildId);
		}
	});

	$: isAuthor = $user?.id === authorId;
</script>

<div style={`display: ${display}`}>
	<input
		id="buildLink"
		readonly
		value={exportedBuildUrl || 'https://deepwoken.co/builder?id=XXXXXXXX'}
	/>

	{#if currentBuildId}
		<!-- Viewing an existing build -->
		<button on:click={handleCopyLink} class="copy-link">
			<Icon icon="octicon:link-16" /> Copy
		</button>
		{#if isAuthor}
			<button on:click={updateBuild} class="update-build">
				<Icon icon="octicon:sync-16" /> Update
			</button>
		{/if}
		<button on:click={() => exportBuild()} class="re-export">
			<Icon icon="octicon:copy-16" /> Re-export
		</button>
	{:else}
		<!-- Creating a new build -->
		<button on:click={() => exportBuild()} class="export-link">
			<Icon icon="octicon:link-16" /> Get Link
		</button>
	{/if}
</div>

<style>
	div {
		z-index: 99;
		justify-content: center;
		align-items: center;
		padding: 0 0.5rem;
		width: 100%;
		height: 2rem;
		top: 50%;
		background: none;
		display: flex;
		box-sizing: border-box;
		gap: 0.5rem;
	}
	#buildLink {
		flex: 2;
	}
	button {
		flex: 1;
	}
	button,
	input {
		font-size: 12px;
		padding: 3px;
		border: 1px solid rgba(0, 0, 0, 0.25);
		background: none;
		border-radius: 5px;
	}
	button:hover {
		cursor: pointer;
		background: rgba(0, 0, 0, 0.05);
	}
	i {
		margin-right: 0.25rem;
	}
</style>
