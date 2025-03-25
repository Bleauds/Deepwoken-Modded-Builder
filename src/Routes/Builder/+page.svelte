<script>
	import { onMount } from 'svelte';
	import { api, data, user, tagStats, tagsStore, isPrivate } from '$lib/stores.js';
	import Tags from '$lib/Tags.svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import Icon from '@iconify/svelte';

	// Component imports
	import Stats from './stats.svelte';
	import Talents from './talents.svelte';
	import Mantras from './mantras.svelte';
	import Weapons from './weapons.svelte';
	import Summary from './summary.svelte';
	import Comments from './comments.svelte';
	import Avatar from '$lib/avatar.svelte';
	import TitleBadge from '$lib/TitleBadge.svelte';
	import ExportPopup from '$lib/export.svelte';
	import TagSelector from '$lib/TagSelector.svelte';
	import BuildMenu from '$lib/BuildMenu.svelte';

	// Constants
	const TABS = ['Stats', 'Talents', 'Mantras', 'Weapons', 'Summary'];
	const API_TIMEOUT = 10000;

	// Reactive states
	let activeTab = 0;
	let activeTabs = ['Stats'];
	let loadedBuild = '';
	let displayExport = false;
	let buildAuthor = null;
	let isLoadingBuild = true;
	let isLoadingGameData = true;
	let isLoadingTags = true;
	let isTagSelectorOpen = false;
	let isMenuOpen = false;
	let currentVote = null;
	let isVoting = false;
	let optimisticVoteCount = 0;
	let optimisticVoteType = null;
	let buildIds = []; // Array to store saved build IDs
	let canEdit = false; // Flag to determine if user can edit the build

	// Function to check if user has saved build
	async function loadSavedBuilds() {
		if (!$user) {
			buildIds = [];
			return;
		}

		try {
			const response = await fetchWithTimeout(`${api}/user/builds/saved`, {
				credentials: 'include'
			});

			if (response.ok) {
				const { builds } = await response.json();
				buildIds = builds.map((build) => build.id);
			} else {
				console.error('Failed to load saved builds');
				buildIds = [];
			}
		} catch (error) {
			console.error('Error loading saved builds:', error);
			buildIds = [];
		}
	}

	// Function to handle privacy toggle for loaded builds
	async function handlePrivacyToggle() {
		if (!loadedBuild || !canEdit) return;

		const buildId = $data.build?.id;
		const newPrivateState = !$data.build?.meta?.private;

		try {
			const response = await fetch(`${api}/build/${buildId}/privacy`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					private: newPrivateState
				}),
				credentials: 'include'
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to update privacy');
			}

			// Update local state
			data.update((d) => ({
				...d,
				build: {
					...d.build,
					meta: {
						...d.build.meta,
						private: newPrivateState
					}
				}
			}));

			toast.push(`Build is now ${newPrivateState ? 'private' : 'public'}`);
		} catch (error) {
			console.error('Error updating privacy:', error);
			toast.push(error.message || 'Failed to update privacy settings');
		}
	}

	// Helper function to fetch data with timeout
	async function fetchWithTimeout(resource, options = {}) {
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), API_TIMEOUT);

		try {
			const response = await fetch(resource, {
				...options,
				signal: controller.signal
			});
			clearTimeout(id);
			return response;
		} catch (error) {
			clearTimeout(id);
			throw error;
		}
	}

	// Tab switching logic
	function switchTab(e) {
		const desktopMode = document.getElementById('toggleDesktop')?.checked || false;
		const newTabName = e.target.innerHTML;
		const newTab = document.getElementById(newTabName);

		if (!desktopMode) {
			if (TABS[activeTab] !== newTabName) {
				document.getElementById(TABS[activeTab]).style.display = 'none';
				newTab.style.display = 'grid';
				activeTab = TABS.indexOf(newTabName);
			}
		} else {
			const tabIndex = activeTabs.indexOf(newTabName);
			if (tabIndex !== -1) {
				newTab.style.display = 'none';
				activeTabs = activeTabs.filter((tab) => tab !== newTabName);
			} else {
				newTab.style.display = 'grid';
				activeTabs = [...activeTabs, newTabName];

				// Update rollable heights
				['mantra-1', 'mantra-2', 'talent-1', 'talent-2'].forEach((id) => {
					document.getElementById(`rollable-${id}`).style.height = '1100px';
				});
			}
		}

		// Also turns off comments when switching tabs
		if (isCommentsVisible) {
			toggleComments();
		}
	}

	// Description handling
	function showDescription(e) {
		if (!loadedBuild) return;

		const target = e.target;
		const buildInfo = document.querySelector('.build-info');

		target.classList.toggle('show');
		buildInfo.classList.toggle('show');

		if (target.classList.contains('show')) {
			target.innerHTML = $data.build.stats.buildDescription;
			if (target.scrollWidth <= target.offsetWidth) {
				target.classList.remove('has-overflow');
			}
		} else {
			if (target.scrollWidth > target.offsetWidth) {
				target.classList.add('has-overflow');
			}
			while (target.scrollWidth > target.offsetWidth) {
				target.innerHTML = target.innerHTML.slice(0, -1);
			}
			target.innerHTML = target.innerHTML.slice(0, -2);
		}
	}

	// Tag handling
	function handleAddTag(event) {
		const newTag = event.detail;
		tagsStore.update((tags) => {
			if (!tags.includes(newTag)) {
				return [...tags, newTag];
			}
			return tags;
		});
	}

	function handleRemoveTag(event) {
		const tagToRemove = event.detail;
		tagsStore.update((tags) => tags.filter((tag) => tag !== tagToRemove));
	}

	// Add function to handle voting
	async function handleVote(voteType) {
		if (!$user) {
			toast.push('Please log in to vote');
			return;
		}

		if (isVoting) return;

		try {
			isVoting = true;
			const buildId = loadedBuild.searchParams.get('id');

			// Calculate optimistic updates
			const oldVoteType = currentVote;
			const newVoteType = currentVote === voteType ? null : voteType;

			// Calculate vote count change
			let voteChange = 0;
			if (oldVoteType === 'up') voteChange--; // Remove old upvote
			if (oldVoteType === 'down') voteChange++; // Remove old downvote
			if (newVoteType === 'up') voteChange++; // Add new upvote
			if (newVoteType === 'down') voteChange--; // Add new downvote

			// Apply optimistic updates
			currentVote = newVoteType;
			optimisticVoteType = newVoteType;
			optimisticVoteCount =
				($data.build?.meta?.votes?.up - $data.build?.meta?.votes?.down || 0) + voteChange;

			// Update store with optimistic data
			data.update((d) => ({
				...d,
				build: {
					...d.build,
					meta: {
						...d.build.meta,
						votes: {
							...d.build.meta.votes,
							up:
								d.build.meta.votes.up +
								(newVoteType === 'up' ? 1 : 0) -
								(oldVoteType === 'up' ? 1 : 0),
							down:
								d.build.meta.votes.down +
								(newVoteType === 'down' ? 1 : 0) -
								(oldVoteType === 'down' ? 1 : 0),
							voters: {
								...d.build.meta.votes.voters,
								[$user.id]: newVoteType
							}
						}
					}
				}
			}));

			// Make API request
			const response = await fetch(`${api}/build/${buildId}/vote`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userId: $user.id,
					voteType: newVoteType
				}),
				credentials: 'include'
			});

			if (!response.ok) {
				const error = await response.json();
				// Revert optimistic updates on error
				currentVote = oldVoteType;
				data.update((d) => ({
					...d,
					build: {
						...d.build,
						meta: {
							...d.build.meta,
							votes: {
								...d.build.meta.votes,
								up:
									d.build.meta.votes.up -
									(newVoteType === 'up' ? 1 : 0) +
									(oldVoteType === 'up' ? 1 : 0),
								down:
									d.build.meta.votes.down -
									(newVoteType === 'down' ? 1 : 0) +
									(oldVoteType === 'down' ? 1 : 0),
								voters: {
									...d.build.meta.votes.voters,
									[$user.id]: oldVoteType
								}
							}
						}
					}
				}));
				throw new Error(`${error.error} - ${error.message}`);
			}

			// Update with server response
			const { votes } = await response.json();
			data.update((d) => ({
				...d,
				build: {
					...d.build,
					meta: {
						...d.build.meta,
						votes
					}
				}
			}));
		} catch (error) {
			console.error('Error voting:', error);
			toast.push(error.message || 'Failed to process vote');
		} finally {
			isVoting = false;
		}
	}

	function togglePrivacy() {
		if (loadedBuild) {
			handlePrivacyToggle();
		} else {
			isPrivate.set(!$isPrivate);
			isMenuOpen = false;
		}
	}

	// Toggle comments visibility
	let isCommentsVisible = false;
	function toggleComments() {
		isCommentsVisible = !isCommentsVisible;
		const builderContainer = document.querySelector('.tabs-container');
		if (builderContainer) {
			builderContainer.style.display = isCommentsVisible ? 'none' : 'block';
		}
	}

	async function loadTagData() {
		try {
			tagStats.update((t) => ({ ...t, isLoading: true }));
			const tagsResponse = await fetchWithTimeout(`${api}/tags`);

			if (tagsResponse.ok) {
				const tags = await tagsResponse.json();
				tagStats.set({
					categorized: tags.categorized || {},
					lastUpdated: tags.lastUpdated,
					isLoading: false
				});
			} else {
				console.error('Failed to load tags');
				tagStats.update((t) => ({ ...t, isLoading: false }));
			}
		} catch (error) {
			console.error('Tag load error:', error);
			tagStats.update((t) => ({ ...t, isLoading: false }));
		} finally {
			isLoadingTags = false;
		}
	}

	async function loadBuildData(buildId) {
		try {
			const buildResponse = await fetchWithTimeout(`${api}/build?id=${buildId}`);

			if (buildResponse.ok) {
				const build = await buildResponse.json();

				build.id = buildId;

				// Set canEdit based on build author
				canEdit = $user && build.author?.verifiedId === $user.id;

				// Update tagsStore with build tags
				tagsStore.set(build.meta?.tags || []);

				if (build.author?.verifiedId && build.author.verifiedId !== $user?.verifiedId) {
					fetchWithTimeout(`${api}/user/${build.author.verifiedId}`, {
						credentials: 'include'
					})
						.then((res) => (res.ok ? res.json() : null))
						.then((author) => {
							if (author) buildAuthor = author;

							/*const tabsContainer = document.querySelector('.tabs-container');
							tabsContainer.querySelectorAll('input, select').forEach((el) => {
								// Except for search inputs
								if (!el.classList.contains('search-input')) el.disabled = true;
							});*/
						})
						.catch(console.error);
				} else if (build.author?.verifiedId === $user?.verifiedId) {
					buildAuthor = {
						id: $user.id,
						displayName: $user.username,
						avatar: $user.avatar,
						titles: $user.titles
					};
				} else {
					buildAuthor = null;
				}

				if ($user && build.meta?.votes?.voters)
					currentVote = build.meta.votes.voters[$user.id] || null;

				// Update UI
				const buildName = document.querySelector('#build-name');
				const buildDescription = document.querySelector('#build-description');
				buildName.value = build.stats.buildName;
				buildDescription.innerHTML = build.stats.buildDescription;
				showDescription({ target: buildDescription });

				loadedBuild = new URL(window.location.href);
				data.update((d) => ({ ...d, build }));
			} else if (buildResponse.status === 404) {
				toast.push('Build not found.');
			} else {
				toast.push('Failed to load build. Please try again later.');
			}
		} catch (error) {
			console.error('Build load error:', error);
			toast.push('Failed to load build. Please check your connection.');
		} finally {
			isLoadingBuild = false;
		}
	}

	async function loadGameData() {
		try {
			const gameDataPromise = fetchWithTimeout(`${api}/get?type=all`)
				.then((res) => (res.ok ? res.json() : null))
				.catch(() => null);

			const { talents, categories, mantras, weapons, enchants, mystics } = await gameDataPromise;

			function isEmpty(obj) {
				return Object.keys(obj).length === 0;
			}

			if (
				!isEmpty(talents) &&
				!isEmpty(categories) &&
				!isEmpty(mantras) &&
				!isEmpty(weapons) &&
				!isEmpty(enchants) &&
				!isEmpty(mystics)
			) {
				data.set({
					talents,
					categories,
					mantras,
					weapons,
					enchants,
					mystic: mystics,
					build: $data.build
				});
				toast.push('Builder loaded!', { duration: 1000 });
			} else {
				toast.push('Some game data failed to load. Please refresh the page.');
			}
		} catch (error) {
			console.error('Game data load error:', error);
			toast.push('Failed to load game data. Please refresh the page.');
		} finally {
			isLoadingGameData = false;
		}
	}

	// Add this function to handle initial vote loading
	$: {
		if ($user && $data.build?.meta?.votes?.voters) {
			currentVote = $data.build.meta.votes.voters[$user.id] || null;
			optimisticVoteType = currentVote;
			optimisticVoteCount = $data.build.meta.votes.up - $data.build.meta.votes.down || 0;
		} else {
			// Reset states when user is not logged in
			currentVote = null;
			optimisticVoteType = null;
			optimisticVoteCount = $data.build?.meta?.votes?.up - $data.build?.meta?.votes?.down || 0;
		}
	}

	// Initialize all data asynchronously
	function initializeData() {
		const url = new URL(window.location.href);
		const buildId = url.searchParams.get('id');

		// Start all loads in parallel
		const loadPromises = [loadGameData(), loadTagData(), loadSavedBuilds()];

		if (buildId) {
			toast.push('Loading build data...');
			loadPromises.push(loadBuildData(buildId));
		} else {
			isLoadingBuild = false;
		}

		// Handle timeout warnings independently for each type of data
		setTimeout(() => {
			if (isLoadingGameData) {
				toast.push('Game data is taking longer than usual to load.');
			}
			if (isLoadingTags) {
				toast.push('Tag data is taking longer than usual to load.');
			}
		}, API_TIMEOUT);

		return Promise.all(loadPromises);
	}

	$: if ($user) {
		loadSavedBuilds();
	} else {
		buildIds = [];
	}

	onMount(() => {
		initializeData();

		// Confirm before leaving
		window.addEventListener('beforeunload', (e) => {
			const message = 'You have unsaved changes. Are you sure you want to leave?';
			e.returnValue = message;
			return message;
		});
	});
</script>

<!-- Meta -->
<svelte:head>
	<title>
		{$data.build == undefined || $data.build.stats.buildName == ''
			? 'Deepwoken Builder'
			: $data.build.stats.buildName}
	</title>
	<!-- Primary Meta Tags -->
	<meta name="title" content="Deepwoken Builder" />
	<meta
		name="description"
		content="Deepwoken stats builder, with full talents and mantra support. Available for all devices! Made by Cyfer#2380"
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://discord.gg/B3BwytYWVK" />
	<meta property="og:title" content="Deepwoken Builder" />
	<meta
		property="og:description"
		content="Deepwoken stats builder, with full talents and mantra support. Available for all devices! Made by Cyfer#2380"
	/>
	<meta
		property="og:image"
		content="https://cdn.discordapp.com/attachments/854957876313063447/1199965058848018462/dark-favicon.png"
	/>

	<!-- Twitter -->
	<meta property="twitter:url" content="https://discord.gg/B3BwytYWVK" />
	<meta property="twitter:title" content="Deepwoken Builder" />
	<meta
		property="twitter:description"
		content="Deepwoken stats builder, with full talents and mantra support. Available for all devices! Made by Cyfer#2380"
	/>
	<meta
		property="twitter:image"
		content="https://cdn.discordapp.com/attachments/854957876313063447/1199965058848018462/dark-favicon.png"
	/>
	<!-- Meta stuff-->
	<meta
		name="keywords"
		content="deepwoken, roblox, deepwoken roblox, deepwoken builder, builder, dw builder, dw, deepwoken stat builder, stat builder, build maker, dw build maker, deepwoken build maker, build maker deepwoken, dw build, deepwoken vercel"
	/>
	<meta name="author" content="Cyfer" />
	<meta
		name="description"
		content="Deepwoken stats builder, with full talents and mantra support. Available for all devices! Made by Cyfer#2380"
	/>
</svelte:head>

<div class="error-container border" style={'display: none'}>
	<h1 style="text-align: center">Maintenence</h1>
	Cyfer is currently working on changes to the website. In the meantime, you can join the<a
		href="https://discord.gg/deepwokenbuilder"
		target="_blank">Discord</a
	> to stay up to date about the site's availability!.
</div>

<div class="builder-container" id="builder-container" style="max-width: 475px; width: 90vw;">
	<div class="build-info border show">
		<div class="author-container">
			<div class="author">
				{#if buildAuthor}
					<Avatar
						w="30px"
						h="30px"
						img={buildAuthor.avatar
							? `https://cdn.discordapp.com/avatars/${buildAuthor.id}/${buildAuthor.avatar}.png`
							: '/discord.png'}
						on:click={() => {
							window.location.href = `/profile/u/${buildAuthor.username}`;
						}}
					/>
					<div class="author-name">
						<div>{buildAuthor.displayName}</div>
						{#if buildAuthor.titles?.length}
							<TitleBadge title={buildAuthor.titles[0]} />
						{/if}
					</div>
				{:else if $user && !loadedBuild}
					<Avatar w="30px" h="30px" img={$user.avatar ? $user.avatar : '/discord.png'} />
					<div class="author-name">
						<div>{$user.displayName ? $user.displayName : 'Guest'}</div>
						{#if $user.titles?.length}
							<TitleBadge title={$user.titles[0]} />
						{/if}
					</div>
				{:else}
					<Avatar w="30px" h="30px" />
					<div class="author-name">
						<div>Anonymous</div>
					</div>
				{/if}
			</div>

			<!-- BuildMenu component with proper props -->
			<div class="menu-wrapper">
				<BuildMenu
					isLoadedBuild={!!loadedBuild}
					buildId={loadedBuild ? $data.build?.id : null}
					data={{
						build: $data.build,
						onRefresh: () => {
							if (loadedBuild) {
								loadBuildData($data.build?.id);
								loadSavedBuilds(); // Reload saved builds after any changes
							}
						}
					}}
					isSaved={buildIds.includes($data.build?.id)}
					onPrivacyToggle={togglePrivacy}
					{canEdit}
					isPrivate={$data.build?.meta?.private}
				/>
			</div>
		</div>

		<!-- build name -->
		<input id="build-name" class="input title" placeholder="Build name" />
		<!-- build tags -->
		<div id="tags">
			<TagSelector
				selectedTags={$tagsStore || []}
				tagStats={$tagStats}
				isOpen={isTagSelectorOpen}
				on:addTag={handleAddTag}
				on:removeTag={handleRemoveTag}
				on:toggleOpen={() => (isTagSelectorOpen = !isTagSelectorOpen)}
				on:close={() => (isTagSelectorOpen = false)}
			/>
			<!-- {/if} -->
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			contenteditable="true"
			id="build-description"
			class="input description show"
			placeholder="Build description"
			readonly={loadedBuild}
		></div>
	</div>
	<!-- Tabs -->
	<div class="tabs border">
		<!-- Socials -->
		<div class="social-buttons">
			{#if loadedBuild}
				<div class="vote">
					<button
						class="vote-button"
						class:active={optimisticVoteType === 'up'}
						disabled={isVoting}
						on:click={() => handleVote('up')}
					>
						<img src={optimisticVoteType === 'up' ? 'upvote.png' : 'neutralup.png'} alt="upvote" />
					</button>
					<p>{optimisticVoteCount}</p>
					<button
						class="vote-button"
						class:active={optimisticVoteType === 'down'}
						disabled={isVoting}
						on:click={() => handleVote('down')}
					>
						<img
							src={optimisticVoteType === 'down' ? 'downvote.png' : 'neutraldown.png'}
							alt="downvote"
						/>
					</button>
				</div>
				<!-- Add view counter -->
				<div class="stats-counters">
					<div class="stat-counter" title="Total Views">
						<Icon icon="octicon:eye-16" />
						<span>{$data.build?.meta?.views?.toLocaleString() || 0}</span>
					</div>
					<div class="stat-counter" title="Times Saved">
						<Icon icon="octicon:bookmark-filled-16" />
						<span>{$data.build?.meta?.saved?.toLocaleString() || 0}</span>
					</div>
				</div>
				<button
					on:click={() => toggleComments()}
					style={`background: ${isCommentsVisible ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.0)'}`}
				>
					<Icon icon="octicon:comment-16" />
					<div>Comments</div>
				</button>
			{/if}
			<button
				class={loadedBuild ? '' : 'full'}
				on:click={() => {
					displayExport = !displayExport;
				}}
				style={`background: ${displayExport ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.0)'}`}
			>
				<Icon icon="octicon:share-16" />
				<div>{loadedBuild ? 'Share' : 'Export'}</div>
			</button>
		</div>
		<ExportPopup
			display={displayExport ? 'flex' : 'none'}
			id="export-popup"
			authorId={buildAuthor ? buildAuthor?.id : 0}
		/>
		<div class="tabs-buttons border">
			<!--<button id="expand">

<img style="" src="expand.png" alt="expand">
                                </button>-->
			{#each TABS as tab}
				<button class="tabs-button border-thin" on:click={switchTab}>{tab}</button>
			{/each}
		</div>
	</div>
	<!--{#if loadedBuild && buildAuthor?.id !== $user?.id && buildAuthor !== null}
		<div
			class="border-edge"
			style="display: flex; align-items: center; justify-content: center; background: url('/background.png'); margin: 0.5rem; padding: 0.25rem; text-align: center"
		>
			<span style="color: lightgray; font-size: 12px"
				>You can not modify other's builds - make a new build if you need to.</span
			>
		</div>
	{/if}-->
	<div class="tabs-container border">
		<Stats />
		<Talents />
		<Mantras />
		<Weapons />
		<Summary />
	</div>
	{#if loadedBuild}
		<Comments
			buildId={loadedBuild ? loadedBuild.searchParams.get('id') : null}
			isVisible={isCommentsVisible}
		/>
	{/if}
</div>

<style>
	@import '$lib/css/border.css';
	@import '$lib/css/builder/layout.css';
	@import '$lib/css/builder/main.css';
</style>
