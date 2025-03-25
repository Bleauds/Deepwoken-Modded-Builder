<script>
	import { onMount } from 'svelte';
	import { data, statsStore, attributesStore, takenTalentsStore, notes } from '$lib/stores.js';
	//
	let talentStats = {};
	function updateTalentStats() {
		talentStats = {
			Health: 0,
			Ether: 0,
			'Max Ether': 0,
			'Max Tempo': 0,
			'Tempo Gain': 0
		};
		if ($takenTalentsStore != undefined) {
			// Cycle through all obtained talents and get their stats
			for (let talent of $takenTalentsStore) {
				let stats = $data.talents[talent.toLowerCase()].stats;
				if (stats == 'N/A' || stats == '') continue;
				for (let stat of stats.split(', ')) {
					let statAmount = parseInt(stat.split(' ')[0]);
					let statName = stat.split(' ');
					statName.shift();
					statName = statName.join(' ');
					//
					if (talentStats[statName] == undefined) talentStats[statName] = 0;
					talentStats[statName] += statAmount;
				}
			}
		}
		if ($statsStore != undefined) {
			// Adding stat stuff
			talentStats.Health += $attributesStore.base.Fortitude * 0.5;
			// Traits
			talentStats.Health += $statsStore.traits.Vitality * 10;
			talentStats['Max Ether'] += $statsStore.traits.Erudition * 30;
			talentStats['Max Tempo'] += $statsStore.traits.Erudition * 5;
			talentStats['Tempo Gain'] += Math.round($statsStore.traits.Erudition * 0.05 * 100);
		}
	}
	$: $takenTalentsStore,
		(() => {
			updateTalentStats();
		})();
	$: $statsStore,
		(() => {
			updateTalentStats();
		})();
	// Onload
	let notesText = '';
	data.subscribe(() => {
		// Load weapon!
		if ($data.build != undefined && $data.build.content.notes != undefined) {
			notesText = $data.build.content.notes == undefined ? '' : $data.build.content.notes;
		}
	});
</script>

<div class="container" id="Summary">
	<div class="grid-item notes">
		<p style="text-align: center; margin: 5px"><b>Notes</b></p>
		<textarea id="summary-text" bind:value={notesText} on:change={notes.set(notesText)}></textarea>
	</div>
	<div class="grid-item notes">
		<p style="text-align: center; margin: 5px"><b>Stats</b></p>
		{#each Object.entries(talentStats) as [statName, statAmount]}
			{#if statAmount > 0}
				<b>
					+{statAmount}
					{#if statName == 'Tempo Gain'}%{/if}
				</b>
				{statName}
				<br />
			{/if}
		{/each}
	</div>
</div>

<style>
	.container {
		display: none;
		width: 100%;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto 1fr;
		background: url(/background.png) repeat;
		font-size: 15px;
	}
	.grid-item {
		border: 1px solid transparent;
		border-image: url(/borderthin.png) 45%;
		border-image-width: 7px;
		border-image-outset: 2px;
		background: hsl(56, 16%, 82%);
		padding: 8px;
		margin: 8px;
	}
	* {
		scrollbar-color: rgb(0, 0, 0);
		scrollbar-width: thin;
	}
	*::-webkit-scrollbar {
		width: 7px;
	}

	*::-webkit-scrollbar-thumb {
		background-color: rgba(168, 168, 168, 0.514);
		border-radius: 20px;
		border: 3px solid transparent;
	}

	*::-webkit-scrollbar-thumb:hover {
		background-color: rgba(51, 51, 51, 0.5);
	}
	.notes {
		grid-column: span 2;
		overflow-y: scroll;
	}
	#summary-text {
		font-size: 14px;
		background-color: transparent;
		border-radius: 5px;
		border: 1px solid rgba(0, 0, 0, 0.25);
		padding: 5px;
		color: rgb(49, 49, 49);
		box-sizing: border-box;
		height: 200px;
		resize: vertical;
		width: 100%;
	}
	@keyframes input-hover {
		0% {
			border-color: rgba(0, 0, 0, 0.25) forwards;
		}
		100% {
			border-color: black;
		}
	}
	textarea:hover {
		animation: input-hover 0.5s;
	}
	textarea:focus {
		box-shadow: 0px 0px 5px black;
		outline: none;
	}
</style>
