<script>
	import { createEventDispatcher, onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import Portal from './Portal.svelte';
	import Icon from '@iconify/svelte';

	export let selectedTags = [];
	export let tagStats;
	export let isOpen = false;

	$: isLoading = tagStats?.isLoading;
	$: categories = tagStats?.categorized || {};
	$: filteredTags = filterTags(categories, searchQuery, selectedCategory);

	let addButtonElement;
	let dropdownPosition = { top: 0, left: 0, width: 0 };
	const dispatch = createEventDispatcher();
	let searchQuery = '';
	let selectedCategory = 'all';
	let isPositioned = false;

	async function updateDropdownPosition() {
		if (!addButtonElement) return;

		await tick();

		const rect = addButtonElement.getBoundingClientRect();
		dropdownPosition = {
			top: rect.bottom + window.scrollY + 5,
			left: rect.left + window.scrollX,
			width: Math.max(rect.width, 275) // Minimum width of 200px
		};
		isPositioned = true;
	}

	function toggleDropdown(event) {
		// Prevent event from bubbling to document
		event.stopPropagation();
		if (!isOpen) {
			isOpen = true;
			isPositioned = false;
			updateDropdownPosition();
		} else {
			isOpen = false;
		}
	}

	function handleClickOutside(event) {
		// Only close if click is outside both the button and dropdown
		const dropdownElement = document.querySelector('.tag-dropdown');
		if (!addButtonElement?.contains(event.target) && !dropdownElement?.contains(event.target)) {
			isOpen = false;
		}
	}

	onMount(() => {
		const handleResize = () => {
			if (isOpen) updateDropdownPosition();
		};

		window.addEventListener('resize', handleResize);
		document.addEventListener('click', handleClickOutside);

		return () => {
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('click', handleClickOutside);
		};
	});

	// Existing functions
	function filterTags(categories, query, category) {
		if (!categories || Object.keys(categories).length === 0) return [];

		let tags = [];
		if (category === 'all') {
			Object.values(categories).forEach((catTags) => {
				tags = [...tags, ...catTags];
			});
		} else {
			tags = categories[category] || [];
		}

		return tags.filter(
			(tag) =>
				tag.name.toLowerCase().includes(query.toLowerCase()) && !selectedTags.includes(tag.name)
		);
	}

	function addTag(tag) {
		if (selectedTags.length < 6 && !selectedTags.includes(tag)) {
			dispatch('addTag', tag);
		}
	}

	function removeTag(tag) {
		dispatch('removeTag', tag);
	}
</script>

<div class="tag-selector">
	<div class="selected-tags">
		{#each selectedTags as tag}
			<div class="tag">
				{tag}
				<button class="remove-tag" on:click|stopPropagation={() => removeTag(tag)}>×</button>
			</div>
		{/each}
	</div>
	{#if selectedTags.length < 5}
		<button
			bind:this={addButtonElement}
			class="add-tag"
			class:active={isOpen}
			on:click={toggleDropdown}
		>
			<Icon icon="octicon:plus-16" />
			Add tags...
		</button>
	{/if}
</div>

{#if isOpen}
	<Portal>
		{#if isPositioned}
			<div
				class="tag-dropdown"
				transition:fade={{ duration: 100 }}
				style="position: fixed; top: {dropdownPosition.top}px; left: {dropdownPosition.left}px; width: {dropdownPosition.width}px;"
			>
				<div class="dropdown-header">
					<div class="search-container">
						<Icon icon="octicon:search-16" />
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search tags..."
							disabled={isLoading}
						/>
					</div>
					<select bind:value={selectedCategory} class="category-select" disabled={isLoading}>
						<option value="all">All Categories</option>
						{#if !isLoading && categories}
							{#each Object.keys(categories) as category}
								<option value={category}>{category}</option>
							{/each}
						{/if}
					</select>
				</div>

				<div class="tags-list">
					{#if isLoading}
						<div class="state-message">Loading tags...</div>
					{:else if filteredTags.length === 0}
						<div class="state-message">No matching tags found</div>
					{:else}
						{#each filteredTags as tag}
							<button class="tag-option" on:click={() => addTag(tag.name)}>
								<span class="tag-name tag-{tag.name.toLowerCase().replace(/\s+/g, '-')}"
									>{tag.name}</span
								>
								<div class="tag-stats">
									<span class="stat">
										<Icon icon="octicon:graph-16" />
										{tag.trending.last24h}
									</span>
									<span class="stat">
										<Icon icon="octicon:star-fill-16" />
										{tag.percentage}%
									</span>
								</div>
							</button>
						{/each}
					{/if}
				</div>
			</div>
		{/if}
	</Portal>
{/if}

<style>
	.tag-selector {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
		padding: 0.25rem;
	}

	.selected-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(25, 25, 25, 1);
		border-radius: 25px;
		padding: 0.2rem 1rem;
		font-size: 12px;
		color: white;
	}

	.remove-tag {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.6);
		cursor: pointer;
		padding: 0 0.25rem;
	}

	.remove-tag:hover {
		color: rgba(255, 255, 255, 0.9);
	}

	.add-tag {
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(25, 25, 25, 1);
		border-radius: 25px;
		padding: 0.2rem 1rem;
		background: rgba(0, 0, 0, 0);
		border: 1px solid rgba(0, 0, 0, 0.25);
		color: rgba(0, 0, 0, 0.5);
		cursor: pointer;
		gap: 0.25rem;
		transition: all 0.2s;
	}

	.add-tag:hover {
		background: rgba(0, 0, 0, 0.03);
		border-color: rgba(0, 0, 0, 0.3);
		color: rgba(0, 0, 0, 0.7);
	}

	.tag-dropdown {
		background: var(--container-background);
		border: 1px solid var(--button-background);
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		z-index: 1000;
		max-height: 300px;
		overflow-y: auto;
	}

	.dropdown-header {
		padding: 0.5rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		display: flex;
		gap: 3rem;
	}

	.search-container {
		position: relative;
		flex: 1;
	}

	.search-container i {
		position: absolute;
		left: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		color: rgba(0, 0, 0, 0.5);
	}

	input,
	select {
		width: 100%;
		padding: 0.25rem 0.5rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 25px;
		background: rgba(255, 255, 255, 0.9);
		color: var(--button-background);
	}

	input {
		padding-left: 1.75rem;
	}

	.tags-list {
		padding: 0.25rem;
	}

	.tag-option {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--button-background);
		text-align: left;
	}

	.tag-option:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	.tag-stats {
		display: flex;
		gap: 1rem;
		font-size: 0.8rem;
		color: rgba(0, 0, 0, 0.6);
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.state-message {
		padding: 1rem;
		text-align: center;
		color: rgba(0, 0, 0, 0.5);
	}

	:global(.tag-dropdown::-webkit-scrollbar) {
		width: 8px;
	}

	:global(.tag-dropdown::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(.tag-dropdown::-webkit-scrollbar-thumb) {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 4px;
	}

	.tag-name {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 25px;
		background: rgba(25, 25, 25, 1);
		color: white;
		font-size: 12px;
	}

	/* Tag colors */
	.tag-flamecharm {
		color: #ff6f61;
	}
	.tag-frostdraw {
		color: #a0e7e5;
	}
	.tag-thundercall {
		color: #f9f871;
	}
	.tag-galebreathe {
		color: #4dff83;
	}
	.tag-shadowcast {
		color: #a825ff;
	}
	.tag-ironsing {
		color: #c2c2c2;
	}
	.tag-bloodrend {
		color: rgb(255, 31, 10);
	}

	.tag-oathless,
	.tag-blindseer,
	.tag-visionshaper,
	.tag-starkindred,
	.tag-arcwarder,
	.tag-linkstrider,
	.tag-jetstriker,
	.tag-dawnwalker,
	.tag-contractor,
	.tag-silentheart,
	.tag-chainwarden,
	.tag-bladeharper,
	.tag-fadetrimmer,
	.tag-saltchemist {
		color: #374bff;
	}
</style>
