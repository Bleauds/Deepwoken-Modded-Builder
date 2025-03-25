<script>
	import { toast } from '@zerodevx/svelte-toast';
	import {
		data,
		statsStore,
		attributesStore,
		preShrineStore,
		postShrineStore,
		racialStatsStore
	} from '$lib/stores.js';
	import ImportPrompt from '$lib/importPrompt.svelte';
	import { createEventDispatcher } from 'svelte';
	import { tooltip } from '$lib/tooltip.js';
	//
	import {
		outfits,
		boons,
		flaws,
		bells,
		murmurs,
		oaths,
		races,
		racesStatsBonuses,
		racesStats
	} from '$lib/data/data.json';
	import { quotes, encouragements } from '$lib/data/flavor.json';
	const dispatch = createEventDispatcher();
	let displayPrompt = false;
	//
	Number.prototype.clamp = function (min, max) {
		return Math.min(Math.max(this, min), max);
	};
	// Function to make sure no more than 1 tooltips are seen at any point
	function checkTooltips() {
		let tooltips = document.querySelectorAll('[tooltip="true"]');
		if (tooltips.length > 1) tooltips[0].remove();
	}

	//
	export let stats = {
		buildName: '',
		buildDescription: '',
		buildAuthor: '',
		//
		power: 0,
		pointsUntilNextPower: 25,
		points: 325,
		pointSpent: 5,
		//
		traitsPoints: 12,
		traits: {
			Vitality: 0,
			Erudition: 0,
			Proficiency: 0,
			Songchant: 0
		},
		//
		meta: {
			Race: 'None',
			Oath: 'Oathless',
			Murmur: 'Ardour',
			Origin: 'Castaway',
			Bell: 'Blood Scourge',
			Outfit: 'Black Diver'
		},
		//
		boon1: 'None',
		boon2: 'None',
		flaw1: 'None',
		flaw2: 'None'
	};
	let attributes = {
		base: {
			Strength: 0,
			Fortitude: 0,
			Agility: 0,
			Intelligence: 0,
			Willpower: 0,
			Charisma: 0
		},
		weapon: {
			'Heavy Wep.': 0,
			'Medium Wep.': 0,
			'Light Wep.': 0
		},
		attunement: {
			Flamecharm: 0,
			Frostdraw: 0,
			Thundercall: 0,
			Galebreathe: 0,
			Shadowcast: 0,
			Ironsing: 0,
			Bloodrend: 0
		}
	};
	// Cloning the stats to reset it if needed
	let statsClone;
	let attributesClone;
	let preShrineBuild;
	let postShrineBuild;
	// Meta stats data
	let metaOptions = {
		Race: races,
		Oath: oaths,
		Murmur: murmurs,
		Origin: [
			'Castaway',
			'Lone Warrior',
			'Deepbound',
			'Voidwalker',
			'Ignition Union',
			'Diluvian Mechanism'
		],
		Bell: bells,
		Outfit: outfits
	};
	//
	let racialStats = {};
	function updateMetaStats() {
		let racialStatsData = racesStats[stats.meta.Race];
		// If racial stat previously existed, remove them from current stats
		for (let statName in racialStats) {
			attributes.base[statName] -= racialStats[statName];
		}
		// Racial stats update
		racialStats = {
			Strength: 0,
			Fortitude: 0,
			Agility: 0,
			Intelligence: 0,
			Willpower: 0,
			Charisma: 0
		};
		// Reset meta stats as well
		// if (statsClone != undefined) stats = statsClone;
		// Calculating racial stats
		for (let statName in racialStatsData) {
			racialStats[statName] = racialStatsData[statName];
		}
		// Initial update for stats
		for (let statName in racialStats) {
			attributes.base[statName] += racialStats[statName];
			if (attributes.base[statName] < 0) attributes.base[statName] = racialStats[statName];
		}
		//
		racialStatsStore.set(racialStats);
		updateStats();
	}
	//
	function updateAttribute(ev) {
		let statName = ev.target.getAttribute('statName');
		let statType = ev.target.getAttribute('statType');
		if (statType == 'traits') {
			// Trait values cant go above 6
			if (ev.target.value >= 6) {
				ev.target.value = 6;
			} else if (ev.target.value <= 0) {
				ev.target.value = 0;
			}
			// Failsafe
			let change = ev.target.value - stats.traits[statName];
			if (stats.traitsPoints - change < 0) ev.target.value = stats.traitsPoints;
			stats.traits[statName] = parseInt(ev.target.value);
			// Update trait points
			let traitPointSpent = 0;
			for (let trait in stats.traits) {
				traitPointSpent += stats.traits[trait];
			}
			stats.traitsPoints = 12 - traitPointSpent;
		} else if (statType != 'meta') {
			// Sanitizing input
			if (ev.target.value == '') ev.target.value = 0;
			if (isNaN(parseInt(ev.target.value))) {
				ev.target.value = attributes[statType][statName];
				return;
			}
			//
			let racialStat = racialStats[statName] == undefined ? 0 : racialStats[statName];
			let value = parseInt(ev.target.value);
			if (value >= 100 + racialStat) {
				ev.target.value = 100 + racialStat;
			} else if (value <= 0 + racialStat) {
				ev.target.value = 0 + racialStat;
			}
			// Failsafe
			let change = ev.target.value - attributes[statType][statName];
			if (stats.points - change < 0) ev.target.value = ev.target.value - change;
			attributes[statType][statName] = parseInt(ev.target.value);
		}
		updateStats();
	}
	function updateStats() {
		// Calculate points to deduct
		let investmentPoints = 330;
		stats.pointSpent = 0;
		for (let statType in attributes) {
			for (let stat in attributes[statType]) {
				stats.pointSpent += attributes[statType][stat];
			}
		}
		// Adding a point to investment points if player unlocked more elements
		let unlocked = false;
		for (let stat in attributes.attunement) {
			if (unlocked && attributes.attunement[stat] > 0) {
				stats.pointSpent--;
			}
			if (attributes.attunement[stat] >= 1) {
				unlocked = true;
			}
		}
		// Apply deduction from investment points
		stats.points = investmentPoints - stats.pointSpent;
		// Calculate powers
		if (stats.power == 1 && 30 - stats.pointSpent > 0) {
			stats.pointsUntilNextPower = 30 - stats.pointSpent;
		} else if (stats.power < 20 && 15 - ((stats.pointSpent - 15) % 15) != 0) {
			stats.pointsUntilNextPower = 15 - ((stats.pointSpent - 15) % 15);
		} else {
			stats.pointsUntilNextPower = 0;
		}
		stats.power = Math.floor((stats.pointSpent - 30 + 15) / 15).clamp(0, 20);
		// Send the stats to the main page
		statsStore.set(stats);
		attributesStore.set(attributes);
	}
	// Shrine of Order
	function order() {
		handleShrine('preshrine', 'save');
		//
		let pointsStart = stats.pointSpent;
		console.log(`Starting with ${pointsStart} points spent`);
		console.log(JSON.parse(JSON.stringify(attributes)));
		// Initial division
		let total = 0;
		let divideBy = 0;
		let affectedStats = [];
		for (let statType in attributes) {
			for (let statName in attributes[statType]) {
				// Checks if this should be divided into
				if (attributes[statType][statName] > 0) {
					// Check whether this is a racial stat
					let racialPoints = 0;
					if (racialStats[statName] > 0) {
						if (attributes[statType][statName] - racialStats[statName] == 0) {
							console.log(`Racial stat ${statName} found, skipping due to no investment`);
							continue;
						} else {
							racialPoints = racialStats[statName];
						}
					}
					total += attributes[statType][statName] - racialPoints;
					affectedStats.push(statName);
					console.log(`Stat ${statName} affected by distribution`);
					divideBy++;
				}
			}
		}
		console.log(`Total ${total}`);
		console.log(`Divide by ${divideBy}`);
		for (let statType in attributes) {
			for (let statName in attributes[statType]) {
				if (affectedStats.includes(statName)) {
					attributes[statType][statName] = total / divideBy;
				}
			}
		}
		// Bottlenecking
		let bottleneckedDivideBy = divideBy;
		let bottlenecked = [];
		//
		let bottleneckedStats = false;
		let prev = JSON.parse(JSON.stringify(attributes));
		do {
			let bottleneckedPoints = 0;
			bottleneckedStats = false;
			console.log(`Bottlnecked divideby: ${bottleneckedDivideBy}`);

			//
			(function () {
				for (let statType in attributes) {
					for (let statName in attributes[statType]) {
						if (statType != 'attunement' && affectedStats.includes(statName)) {
							let prevStat = prev[statType][statName];
							let shrineStat = preShrineBuild[statType][statName];
							if (shrineStat - attributes[statType][statName] > 25) {
								console.log(`Stat ${statName} post shrine difference larger than 25`);
								console.log(`Initial shrine ${attributes[statType][statName]}`);
								console.log(`Prev: ${prevStat}`);
								attributes[statType][statName] = shrineStat - 25;
								bottleneckedPoints += attributes[statType][statName] - prevStat;
								console.log(`Bottle neck points: ${bottleneckedPoints}`);
								bottlenecked.push(statName);
								bottleneckedDivideBy--;
								//
							}
						}
					}
				}
			})();
			console.log('Beginning averaging out');
			console.log(`Bottlnecked divideby: ${bottleneckedDivideBy}`);
			console.log(`Bottlnecked divideby amount: ${bottleneckedPoints / bottleneckedDivideBy}`);
			// Averaging out bottlenecked points
			for (let statType in attributes) {
				for (let statName in attributes[statType]) {
					if (
						affectedStats.includes(statName) &&
						!bottlenecked.includes(statName) &&
						affectedStats.includes(statName)
					) {
						//if (statType != "attunement") {
						console.log(`${statName} before spreading bt: ${attributes[statType][statName]}`);
						attributes[statType][statName] -= bottleneckedPoints / bottleneckedDivideBy;
						console.log(`${statName} after spreading bt: ${attributes[statType][statName]}`);
						if (statType != 'attunement') {
							if (preShrineBuild[statType][statName] - attributes[statType][statName] > 25) {
								console.log(
									`stat name ${statName} still larger than 25: ${
										preShrineBuild[statType][statName] - attributes[statType][statName]
									}`
								);
								bottleneckedStats = true;
							}
						}
						//}
					}
				}
			}
			prev = JSON.parse(JSON.stringify(attributes));
		} while (bottleneckedStats);
		// Putting racial stats back in (no longer needed, but kept just in case. Thisis now just a rounding step)
		for (let statType in attributes) {
			for (let statName in attributes[statType]) {
				attributes[statType][statName] = Math.floor(attributes[statType][statName]);
			}
		}
		updateStats();
		let sparePoints = pointsStart - stats.pointSpent;
		console.log(`Spare points: ${sparePoints}`);
		// Redis some points at the end in case spare points exceeds
		while (sparePoints >= bottleneckedDivideBy) {
			let changed = false;
			for (let statType in attributes) {
				for (let statName in attributes[statType]) {
					if (bottlenecked.includes(statName)) continue;
					if (attributes[statType][statName] >= 100) continue;
					if (!affectedStats.includes(statName)) continue;
					changed = true;
					console.log(`${statType} ${statName} increased by 1`);
					attributes[statType][statName] += 1;
					sparePoints -= 1;
				}
			}

			if (!changed) break;
		}
		updateStats();
		toast.push(
			`You have been Ordered! <br><br> Spare points: <b>${pointsStart - stats.pointSpent}</b>`,
			{
				duration: 2000
			}
		);
		console.log(`Total points spent after shrining ${stats.pointSpent}`);
		console.log(JSON.parse(JSON.stringify(attributes)));
		console.log(`Spare points: ${pointsStart - stats.pointSpent}`);
	}
	// Extra shrine functions
	function handleShrine(type, option) {
		console.log(JSON.parse(JSON.stringify(attributes)));
		if (option == 'save') {
			type == 'preshrine'
				? (preShrineBuild = JSON.parse(JSON.stringify(attributes)))
				: (postShrineBuild = JSON.parse(JSON.stringify(attributes)));
		} else {
			if (type == 'preshrine') {
				if (preShrineBuild != undefined) {
					// Save current stats as post shrine if there are no post shrine stats
					if (postShrineBuild == undefined) {
						postShrineBuild = JSON.parse(JSON.stringify(attributes));
					}
					for (let statType in attributes) {
						for (let statName in attributes[statType])
							attributes[statType][statName] = preShrineBuild[statType][statName];
					}
				} else {
					toast.push('No Pre-Shrine build found!');
				}
			} else {
				if (postShrineBuild != undefined) {
					for (let statType in attributes) {
						for (let statName in attributes[statType])
							attributes[statType][statName] = postShrineBuild[statType][statName];
					}
				} else {
					toast.push('No Post-Shrine build found!');
				}
			}
		}
		preShrineStore.set(preShrineBuild);
		postShrineStore.set(postShrineBuild);
		//
		updateStats();
	}
	// Importing from Deepwoken
	function importDeepwoken(e) {
		let results = e.detail;
		data.set({
			talents: $data.talents,
			categories: $data.categories,
			mantras: $data.mantras,
			weapons: $data.weapons,
			enchants: $data.enchants,
			mystic: $data.mystic,
			build: {
				version: 2,
				talents: results.talents,
				attributes: results.attributes,
				stats: {
					buildName: '',
					buildDescription: '',
					buildAuthor: '',
					//
					power: stats.level,
					pointsUntilNextPower: 25,
					points: 325,
					pointSpent: 5,
					//
					traitsPoints: 12,
					traits: {
						Vitality: 0,
						Erudition: 0,
						Proficiency: 0,
						Songchant: 0
					},
					meta: {
						Race: results.race,
						Oath: results.oath,
						Origin: results.origin,
						Murmur: 'Ardour'
					}
					//
				},
				mantras: results.mantras
			}
		});
		updateMetaStats();
		updateStats();
		displayPrompt = false;
	}
	// Initial loading
	let loadedBuild = '';
	data.subscribe(() => {
		//
		updateMetaStats();
		/* Prepare local builds
		for (let i = 0, len = localStorage.length; i < len; ++i) {
			localBuilds[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
		}
		// Sort local builds alphabetically by name
		localBuilds = Object.fromEntries(
			Object.entries(localBuilds).sort((a, b) => a[1].localeCompare(b[1]))
		);*/
		//
		statsClone = JSON.parse(JSON.stringify(stats));
		attributesClone = JSON.parse(JSON.stringify(attributes));
		// Check if theres a build to import
		try {
			if ($data.build != {} && $data.build != undefined) {
				// Check what version it is to load
				if ($data.build.version >= 2) {
					let url = new URL(location.href);
					loadedBuild = `${url.searchParams.get('id')} - ${$data.build.stats.buildName}`;

					for (let statName in stats) {
						if (typeof stats[statName] != 'object') {
							stats[statName] = $data.build.stats[statName];
						} else {
							for (let statDetail in stats[statName])
								stats[statName][statDetail] = $data.build.stats[statName][statDetail];
						}
					}
					updateMetaStats();
					for (let statType in attributes) {
						for (let statName in attributes[statType]) {
							if ($data.build.attributes[statType][statName] != undefined) {
								attributes[statType][statName] = $data.build.attributes[statType][statName];
							} else {
								attributes[statType][statName] = 0;
							}
						}
					}
					preShrineBuild =
						$data.build.preShrine == undefined
							? JSON.parse(JSON.stringify(attributes))
							: $data.build.preShrine;
					postShrineBuild =
						$data.build.postShrine == undefined
							? JSON.parse(JSON.stringify(attributes))
							: $data.build.postShrine;
					preShrineStore.set(preShrineBuild);
					postShrineStore.set(postShrineBuild);
					updateStats();
				} else {
					// Legacy loader
					stats.buildName = $data.build.buildInfo.name;
					stats.buildDescription = $data.build.buildInfo.desc;
					stats.meta.Oath = $data.build.buildInfo.Oath;

					document.getElementById('buildName').value = stats.buildName;
					document.getElementById('buildDescription').value = stats.buildDescription;
					document.getElementById('buildAuthor').value = stats.buildAuthor;

					for (let statName in $data.build.stats.basic)
						attributes.base[statName] = $data.build.stats.basic[statName];
					for (let statName in $data.build.stats.elem) {
						if (statName == 'Galebreath') {
							attributes.attunement.Galebreathe = $data.build.stats.elem.Galebreath;
						} else {
							attributes.attunement[statName] = $data.build.stats.elem[statName];
						}
					}
					for (let statName in $data.build.stats.weapon)
						attributes.weapon[statName] = $data.build.stats.weapon[statName];
				}
			}
		} catch (error) {
			toast.push('An error occurred while loading the build. Please try again later.');
			console.error(error);
		}
	});
	//
	let randomQuote = '';
	randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
	//
	function encourage() {
		toast.push(encouragements[Math.floor(Math.random() * encouragements.length)], {
			theme: {
				'--toastBackground': 'rgba(245, 208, 254, 0.95)',
				'--toastColor': '#424242',
				'--toastBarBackground': 'fuchsia'
			}
		});
	}
</script>

<div class="container" id="Stats" on:change={updateAttribute}>
	<div class="meta-stats grid-item border">
		{#each Object.entries(stats.meta) as [stat] (stat)}
			<div class="stat-item">
				<b>{stat}</b>
				<select
					class="meta-selections input"
					label={stat}
					id={stat}
					bind:value={stats.meta[stat]}
					on:change={updateMetaStats}
					statType="meta"
					statName={stat}
				>
					{#each metaOptions[stat] as option}
						{#if stat == 'Race'}
							<option value={option} style="">{option} ({racesStatsBonuses[option]})</option>
						{:else}
							<option>{option}</option>
						{/if}
					{/each}
				</select>
			</div>
		{/each}
	</div>
	<div class="stats">
		<div class="misc-stats border">
			<div style="margin: 5px;"><b>Power:</b> {stats.power}</div>
			<div style="margin: 5px;">
				<b>Next Power: </b>
				{stats.pointsUntilNextPower} points
			</div>
			<div style="margin: 5px;">
				<i style="opacity: 25%">{randomQuote}</i>
			</div>
		</div>
		<div class="basic-stats border">
			{#each Object.entries(attributes.base) as [stat, amount]}
				<div class="stat-item">
					<b>{stat}</b>
					<div class="stat-number">
						{#if preShrineBuild != undefined}
							<div class="preshrine-stat"><i>{preShrineBuild.base[stat]}</i></div>
						{:else}
							<div class="preshrine-stat"><i>0</i></div>
						{/if}
						<input class="stat-input input" value={amount} statName={stat} statType="base" />
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="stats">
		<div class="weapon-stats border">
			{#each Object.entries(attributes.weapon) as [stat, amount]}
				<div class="stat-item">
					<b>{stat}</b>
					<div class="stat-number">
						{#if preShrineBuild != undefined}
							<div class="preshrine-stat"><i>{preShrineBuild.weapon[stat]}</i></div>
						{/if}
						<input class="stat-input input" value={amount} statName={stat} statType="weapon" />
					</div>
				</div>
			{/each}
		</div>
		<div class="attunement-stats border">
			{#each Object.entries(attributes.attunement) as [stat, amount]}
				<div class="stat-item">
					<b>{stat}</b>
					<div class="stat-number">
						{#if preShrineBuild != undefined}
							<div class="preshrine-stat"><i>{preShrineBuild.attunement[stat]}</i></div>
						{/if}
						<input class="stat-input input" value={amount} statName={stat} statType="attunement" />
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="traits-info grid-item border">
		{#each Object.entries(stats.traits) as [stat, amount]}
			<div class="stat-item">
				<b>{stat}</b>
				<input
					class="stat-input input trait-input"
					value={amount}
					statName={stat}
					statType="traits"
				/>
			</div>
		{/each}
	</div>
	<div class="boons-info grid-item border">
		<div class="stat-item">
			<b>Boon 1 </b>
			<select class="boons-input input" id="boon1" bind:value={stats.boon1}>
				{#each boons as boon}
					<option>{boon}</option>
				{/each}
			</select>
		</div>
		<div class="stat-item">
			<b>Boon 2 </b>
			<select class="boons-input input" id="boon2" bind:value={stats.boon2}>
				{#each boons as boon}
					<option>{boon}</option>
				{/each}
			</select>
		</div>
		<div class="stat-item">
			<b>Flaw 1 </b>
			<select class="boons-input input" id="flaw1" bind:value={stats.flaw1}>
				{#each flaws as flaw}
					<option>{flaw}</option>
				{/each}
			</select>
		</div>
		<div class="stat-item" id="flaw-2">
			<b>Flaw 2 </b>
			<select class="boons-input input" id="flaw2" bind:value={stats.flaw2}>
				{#each flaws as flaw}
					<option>{flaw}</option>
				{/each}
			</select>
		</div>
	</div>
	<div class="points-info grid-item border" ignore-in-export>
		<div><b>Investment Points</b>: {stats.points}</div>
		<div><b>Points Spent</b>: {stats.pointSpent}</div>
	</div>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!--
	<div
		class="local-builds grid-item border"
		on:change={updateMetaStats}
		ignore-in-export
		on:mousemove={checkTooltips}
	>
		<div class="stat-item" style="">
			<b>Local builds </b>
			<select
				bind:value={buildToLoad}
				autocomplete="off"
				statType="meta"
				class="build-input input"
				id="buildToLoad"
				on:change={() => {
					if (buildToLoad.includes('_dwb.build.')) {
						location.href = `https://deepwoken.co/builder?id=${
							buildToLoad.split(' - ')[0].split('_dwb.build.')[1]
						}`;
					if (buildToLoad.includes('_dwb.build.')) {
						location.href = `https://deepwoken.co/builder?id=${
							buildToLoad.split(' - ')[0].split('_dwb.build.')[1]
						}`;
					} else {
						location.href = `https://deepwoken.co/builder?id=${buildToLoad.split(' - ')[0]}`;
					}
				}}
			>
				<option value="" disabled selected>{loadedBuild}</option>
				{#each Object.entries(localBuilds) as [id, name]}
					{#if id.startsWith('_dwb.build.')}
						<option
							>{id.replace('_dwb.build.', '')} - {`${
								name == '' ? '[No name saved]' : name
							}`}</option
						>
					{#if id.startsWith('_dwb.build.')}
						<option
							>{id.replace('_dwb.build.', '')} - {`${
								name == '' ? '[No name saved]' : name
							}`}</option
						>
					{/if}
				{/each}
			</select>
		</div>
		<div style="display: grid; grid-template-columns: 1fr">
			<button
				class="function-button border-thin overworld"
				on:click={() => dispatch('export', { option: 'link' })}
				style="grid-column: span 2"
			>
				<div><b> Export </b> build as link</div>
			</button>
			<button
				class="function-button overworld"
				on:click={() => {
					displayPrompt = !displayPrompt;
				}}
				style="grid-column: span 2"
			>
				<div><b>Import</b> build from Deepwoken</div>
			</button>
			<button
				class="function-button border-thin overworld"
				use:tooltip={{
					desc: 'This will bookmark the initially loaded build! If you modified the build, please export as link instead.',
					reqs: { base: {}, attunement: {}, weapon: {} }
				}}
				on:click={() => {
					let url = new URL(location.href);
					let id = url.searchParams.get('id');
					if (id == null) {
						dispatch('export', { option: 'link' });
					} else {
						toast.push(`Saved build id ${id}`);
					}
					localStorage.setItem(`_dwb.build.${id}`, stats.buildName);
				}}
			>
				<div>Save <b>loaded</b> build</div></button
			>
			<button
				class="function-button border-thin overworld"
				on:click={() => {
					let url = new URL(location.href);
					localStorage.removeItem(`_dwb.build.${url.searchParams.get('id')}`);
					toast.push('Deleted build.');
				}}><div><b>Delete</b> loaded build</div></button
			>
		</div>
	</div>-->
	<div class="functions grid-item" ignore-in-export>
		<button class="function-button overworld border-thin" on:click={order}>
			<div
				use:tooltip={{
					desc: 'Using Shrine will leave you with some spare points, which you can invest again. Thank you arch!',
					reqs: { base: {}, attunement: {}, weapon: {} }
				}}
			>
				Shrine of Order
			</div>
			<img
				style="margin-left: 5px"
				class="icon"
				title="This talent is only obtainable pre-shrine."
				width="14"
				height="14"
				alt="new"
				src="/shrineicon.png"
			/>
		</button>
		<hr style="width: 100%" />
		<button class="function-button border-thin" on:click={() => handleShrine('preshrine', 'save')}
			><div><b>Save</b> Pre-Shrine</div></button
		>
		<button class="function-button border-thin" on:click={() => handleShrine('preshrine', 'load')}
			><div><b>Load</b> Pre-Shrine</div></button
		>
		<button class="function-button border-thin" on:click={() => handleShrine('postshrine', 'save')}
			><div><b>Save</b> Post-Shrine</div></button
		>
		<button class="function-button border-thin" on:click={() => handleShrine('postshrine', 'load')}
			><div><b>Load</b> Post-Shrine</div></button
		>
	</div>
	<div class="functions grid-item" on:mousemove={checkTooltips} ignore-in-export>
		<!-- <button class="function-button overworld" on:click={() => exportBuild("link")}>Export as Link</button> -->
		<a
			class="function-button overworld border-thin"
			on:click={() => (window.location = window.location.href.split('?')[0])}
			href="https://deepwoken.co/builder">New Build</a
		>
		<hr style="width: 100%" />
		<!-- <button class="function-button border-thin" on:click={() => exportBuild("image")}>Export stats as Image</button>-->
		<a
			target="_blank"
			rel="noreferrer"
			style="display: flex; align-items: center; justify-content: center"
			use:tooltip={{ desc: 'We have cookies!', reqs: { base: {}, attunement: {} } }}
			href="https://discord.gg/B3BwytYWVK"
			class="function-button border-thin discord"
			><img
				src="/discord.png"
				alt="discord icon"
				style="color: white; width: 16px; height: 16px; margin-right: 5px"
			/> Deepwoken Builder</a
		>
		<a
			target="_blank"
			use:tooltip={{
				desc: "A Discord bot!\nShe'll handle all your Deepwoken needs.",
				reqs: { base: {}, attunement: {} }
			}}
			href="/aen"
			class="function-button border-thin aen">Invite Aen</a
		>
		<button
			use:tooltip={{
				desc: 'If you ever need one.',
				reqs: { base: {}, attunement: {}, weapon: {} }
			}}
			on:click={encourage}
			class="function-button border-thin encouragement">❤ Had a tough day?</button
		>
		<a
			target="_blank"
			use:tooltip={{ desc: 'Thank you. Really.', reqs: { base: {}, attunement: {}, weapon: {} } }}
			href="/support"
			class="function-button border-thin support"><b>Support Me</b></a
		>
	</div>
	<!-- Import prompt -->
	<button
		class="function-button overworld"
		on:click={() => {
			displayPrompt = !displayPrompt;
		}}
		style="grid-column: span 2"
	>
		<div><b>Import</b> build from Deepwoken</div>
	</button>
	<ImportPrompt on:import={importDeepwoken} display={displayPrompt} />
</div>

<style>
	b {
		font-weight: 600;
	}
	/* Stats */
	.stats > * {
		background: var(--container-background);
		padding: 8px;
		margin: 8px;
	}
	.meta-stats {
		grid-column: span 2;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;

		grid-column-gap: 10px;
	}
	.build-input {
		width: 60%;
	}
	.meta-selections {
		width: 60%;
	}
	.stats {
		display: grid;
		grid-template-rows: 1fr 1.4fr;
	}
	.stat-item {
		display: flex;
		justify-content: space-between;
		margin: 3px;
	}
	.stat-input {
		width: 50%;
	}
	.trait-input {
		width: 20%;
	}
	.stat-number {
		width: 35%;
		font-size: 14px;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}
	.preshrine-stat {
		width: 40%;
		font-size: 13px;
		opacity: 50%;
	}
	.boons-info {
		display: flex;
		flex-direction: column;
	}
	.boons-input {
		width: 50%;
	}
	.points-info {
		grid-column: span 2;
		text-align: center;
	}
	.local-builds {
		grid-column: span 2;
	}
	.functions {
		display: flex;
		flex-direction: column;
		text-align: center;
	}
	.function-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		color: white;
		font-size: 13px;
		margin: 4px;
		background: var(--button-background);
	}
	.discord {
		background-color: rgb(32, 76, 235);
		text-decoration: none;
	}
	.aen {
		background-color: rgb(255, 109, 133);
		text-decoration: none;
	}
	.encouragement {
		background-color: rgb(255, 102, 217);
	}
	.support {
		background-color: rgb(255, 75, 210);
	}
</style>
