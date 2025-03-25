<script>
	import { api, user } from '$lib/stores.js';
	import { toast } from '@zerodevx/svelte-toast';
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';

	export let isLoadedBuild;
	export let buildId;
	export let onPrivacyToggle;
	export let data;
	export let isSaved = false; // New prop to pass in saved status directly
	export let isPrivate = false; // New prop to pass in private status directly

	let isOpen = false;
	let isDeleting = false;

	// Check if current user owns the build
	$: isOwnBuild = $user && data?.build?.author?.verifiedId === $user.id;

	async function handleSave() {
		if (!buildId) {
			toast.push('Cannot save build: No build ID');
			return;
		}
		try {
			const response = await fetch(`${api}/user/builds/save/${buildId}`, {
				method: 'POST',
				credentials: 'include'
			});
			if (!response.ok) {
				throw new Error('Failed to save build');
			}
			const result = await response.json();
			isSaved = result.saved;
			toast.push(isSaved ? 'Build saved to profile' : 'Build removed from profile');
			isOpen = false;

			// Call onRefresh if provided
			if (data.onRefresh) data.onRefresh();
		} catch (error) {
			console.error('Error saving build:', error);
			toast.push('Failed to save build');
		}
	}

	async function handleDelete() {
		if (!buildId || !isOwnBuild) {
			toast.push('Cannot delete build: Invalid permissions');
			return;
		}

		if (!confirm('Are you sure you want to delete this build? This action cannot be undone.')) {
			return;
		}

		isDeleting = true;
		try {
			const response = await fetch(`${api}/build/${buildId}`, {
				method: 'DELETE',
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error('Failed to delete build');
			}

			toast.push('Build deleted successfully');
			isOpen = false;

			if (data.onRefresh) {
				data.onRefresh();
			} else {
				// Redirect to home if no refresh callback
				goto('/');
			}
		} catch (error) {
			console.error('Error deleting build:', error);
			toast.push('Failed to delete build');
		} finally {
			isDeleting = false;
		}
	}

	function handlePrivacyToggle() {
		onPrivacyToggle();
		isOpen = false;
	}

	function clickOutside(node) {
		const handleClick = (event) => {
			if (node && !node.contains(event.target)) {
				event.stopPropagation();
				isOpen = false;
			}
		};
		document.addEventListener('click', handleClick, true);
		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}

	let menuButton;
	let menuDropdown;

	function positionMenu(node) {
		if (!menuButton) return;
		const rect = menuButton.getBoundingClientRect();
		node.style.top = `${rect.bottom + 5}px`;
		node.style.left = `${rect.left - node.offsetWidth + menuButton.offsetWidth}px`;
	}

	function toggleMenu(e) {
		e.stopPropagation();
		isOpen = !isOpen;
	}

	function handleButtonClick(handler) {
		return (e) => {
			e.preventDefault();
			e.stopPropagation();
			handler();
		};
	}
</script>
<!--
<div class="menu-container" on:click={toggleMenu}>
	<button bind:this={menuButton} class="p-1 rounded hover:bg-black/5 transition-colors">
		<Icon icon="octicon:kebab-vertical" />
	</button>
	{#if isOpen}
		<div bind:this={menuDropdown} use:clickOutside use:positionMenu class="menu-dropdown-dots">
			{#if isLoadedBuild}
				{#if $user}
					<button
						class="w-full px-4 py-2 text-left hover:bg-black/5 flex items-center gap-2"
						on:click|preventDefault={handleButtonClick(handleSave)}
					>
						<Icon icon="octicon:bookmark-{isSaved ? 'slash' : 'fill'}-24" />
						<span>{isSaved ? 'Unsave' : 'Save to Profile'}</span>
					</button>
				{/if}
				{#if isOwnBuild}
					<button
						class="w-full px-4 py-2 text-left hover:bg-black/5 flex items-center gap-2"
						on:click|preventDefault={handleButtonClick(handlePrivacyToggle)}
					>
						<Icon icon="octicon:eye-{isPrivate ? 'slash' : ''}-16" />
						<span>{isPrivate ? 'Make Public' : 'Make Private'}</span>
					</button>
					 Delete button
					<button
						class="w-full px-4 py-2 text-left hover:bg-black/5 flex items-center gap-2 text-red-600"
						on:click|preventDefault={handleButtonClick(handleDelete)}
						disabled={isDeleting}
					>
						<Icon icon="octicon:trash-16" />
						<span>{isDeleting ? 'Deleting...' : 'Delete Build'}</span>
					</button>
				{/if}
			{:else}
				<button
					class="w-full px-4 py-2 text-left hover:bg-black/5 flex items-center gap-2"
					on:click|preventDefault={handleButtonClick(handlePrivacyToggle)}
				>
					<Icon icon="octicon:eye{isPrivate ? '-closed' : ''}-16" />
					<span>{isPrivate ? 'Make Public' : 'Make Private'}</span>
				</button>
			{/if}
		</div>
	{/if}
</div>
-->
<style>
	.menu-container {
		position: static;
		margin: 0 0.5rem;
		cursor: pointer;
	}
	.menu-dropdown-dots {
		position: fixed;
		background: rgb(216, 215, 202);
		border-radius: 0.25rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border: 1px solid black;
		z-index: 100;
		width: 160px;
		padding: 0.25rem 0;
	}
	button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0 0.25rem 1rem;
		font-size: 14px;
		background: none;
		border: none;
		cursor: pointer;
		font-family: inherit;
		width: 100%;
	}
	button:hover:not(:disabled) {
		background: rgba(0, 0, 0, 0.05);
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	button:focus {
		outline: none;
	}
	.text-red-600 {
		color: #dc2626;
	}
</style>
