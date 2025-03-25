<!-- TalentComparison.svelte -->
<script>
	export let display = false;
	export let currentTalents = [];
	import { createEventDispatcher } from 'svelte';
	import { data } from '$lib/stores.js';
	const dispatch = createEventDispatcher();

	let comparisonResults = null;

	function shouldCountTalent(talentName) {
		const talent = $data.talents[talentName.toLowerCase()];
		return talent
			? !talent.dontCountTowardsTotal && talent.rarity !== 'Quest' && talent.rarity !== 'Origin'
			: true;
	}

	function processImportedTalents(text) {
		// Split input data by line and remove empty lines
		const lines = text
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.length > 0);

		// Find talents section
		const talentIndex = lines.findIndex((line) => line === '== TALENTS ==');
		if (talentIndex === -1) {
			comparisonResults = {
				error: 'No talents section found. Please make sure to include the "== TALENTS ==" section.'
			};
			return;
		}

		// Extract talents and filter out talents that don't count towards total
		const importedTalents = lines
			.slice(talentIndex + 1)
			.filter((line) => line !== '' && !line.startsWith('=='))
			.map((talent) => talent.trim())
			.filter(shouldCountTalent);

		const countedCurrentTalents = currentTalents.filter(shouldCountTalent);

		// Compare talents
		const missing = importedTalents.filter((talent) => !countedCurrentTalents.includes(talent));
		const extra = countedCurrentTalents.filter((talent) => !importedTalents.includes(talent));

		comparisonResults = {
			missing,
			extra,
			importedCount: importedTalents.length,
			currentCount: countedCurrentTalents.length
		};

		dispatch('compare', comparisonResults);
	}
</script>

<div class="wrapper" style="max-width: 475px; width: 50vw; display: {display ? 'block' : 'none'}">
	<textarea
		id="importTalentsData"
		placeholder="Paste your Deepwoken build here to compare talents... Click the compare button again to close this window."
	></textarea>

	<div class="button-group">
		<button
			class="function-button overworld border-thin"
			on:click={() => {
				processImportedTalents(document.querySelector('#importTalentsData').value);
			}}
		>
			Compare Talents
		</button>
		<button
			class="function-button border-thin"
			on:click={() => {
				dispatch('close');
				comparisonResults = null;
			}}
		>
			Close
		</button>
	</div>

	{#if comparisonResults}
		{#if comparisonResults.error}
			<div class="error">{comparisonResults.error}</div>
		{:else}
			<div class="results">
				<div class="summary">
					Imported build has {comparisonResults.importedCount} counted talents vs your current {comparisonResults.currentCount}
					counted talents
				</div>

				{#if comparisonResults.missing.length > 0}
					<div class="missing">
						<h3>Missing Talents (in imported but not in current):</h3>
						<ul>
							{#each comparisonResults.missing as talent}
								<li>{talent}</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if comparisonResults.extra.length > 0}
					<div class="extra">
						<h3>Extra Talents (in current but not in imported):</h3>
						<ul>
							{#each comparisonResults.extra as talent}
								<li>{talent}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
	textarea {
		font-size: 14px;
		background-color: transparent;
		border-radius: 5px;
		border: 1px solid rgba(0, 0, 0, 0.5);
		padding: 5px;
		color: rgb(49, 49, 49);
		width: 100%;
		height: 200px;
		box-sizing: border-box;
		resize: none;
	}

	.wrapper {
		position: fixed;
		top: 25%;
		margin: 0 -5px;
		box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.4);
		border: 1px solid transparent;
		border-image: url(/borderthin.png) 45%;
		border-image-width: 10px;
		border-image-outset: 2px;
		padding: 15px 5px 5px 5px;
		background-color: #e5e0ca;
		font-size: 14px;
		z-index: 100;
	}

	.function-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		margin: 5px 0;
		color: white;
		font-size: 13px;
		width: 100%;
		box-sizing: border-box;
		background: var(--button-background);
	}

	.results {
		margin-top: 10px;
		padding: 10px;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 5px;
		max-height: 300px;
		overflow-y: auto;
		scrollbar-width: thin;
	}

	.button-group {
		display: flex;
		gap: 10px;
	}

	.button-group .function-button {
		flex: 1;
	}

	.summary {
		font-size: 14px;
		color: rgba(0, 0, 0, 0.7);
		margin-bottom: 10px;
	}

	.missing,
	.extra {
		margin-top: 10px;
	}

	.missing h3,
	.extra h3 {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 5px;
	}

	.missing ul,
	.extra ul {
		list-style: none;
		padding-left: 10px;
	}

	.missing li,
	.extra li {
		font-size: 13px;
		margin: 2px 0;
	}

	.error {
		color: #cc0000;
		margin-top: 10px;
		font-size: 14px;
	}
</style>
