<script>
	//
	import { press, tap } from 'svelte-gestures';
	import {
		data,
		statsStore,
		attributesStore,
		takenTalentsStore,
		takenRollableMantrasStore,
		favoritedTalents,
		preShrineStore,
		postShrineStore,
		racialStatsStore
	} from '$lib/stores.js';
	import { tooltip } from '$lib/tooltip.js';
	import { name } from 'eslint-plugin-svelte/lib/meta';
	import TalentComparison from '$lib/talentComparison.svelte';
	Number.prototype.clamp = function (min, max) {
		return Math.min(Math.max(this, min), max);
	};
	// Handles and sort talents
	let obtainables = {
		Advanced: {},
		Rare: {},
		Common: {},
		Oath: {},
		Quest: {},
		Murmur: {}
		//"Origin": []
	};
	let oldObtainables = {};
	let takenTalents = {};
	let displayedTakenTalents = {};
	let isAlphabetical = false;
	let displayTalentComparison = false;
	//
	let filters = {
		obtainables: {
			PRE: { name: 'PRE', enabled: false },
			POST: { name: 'POST', enabled: false },
			FAV: { name: 'FAV', enabled: false },
			STR: { name: 'Strength', enabled: false },
			AGI: { name: 'Agility', enabled: false },
			FTD: { name: 'Fortitude', enabled: false },
			INT: { name: 'Intelligence', enabled: false },
			WIL: { name: 'Willpower', enabled: false },
			CHA: { name: 'Charisma', enabled: false },
			ATTUNEMENT: { name: 'Attunement', enabled: false }
		},
		taken: {
			PRE: { name: 'PRE', enabled: false },
			POST: { name: 'POST', enabled: false },
			FAV: { name: 'FAV', enabled: false },
			STR: { name: 'Strength', enabled: false },
			AGI: { name: 'Agility', enabled: false },
			FTD: { name: 'Fortitude', enabled: false },
			INT: { name: 'Intelligence', enabled: false },
			WIL: { name: 'Willpower', enabled: false },
			CHA: { name: 'Charisma', enabled: false },
			ATTUNEMENT: { name: 'Attunement', enabled: false }
		}
	};
	//
	let blacklist = {
		categories: ['Innate', 'Angler', 'Shipwright', 'Deepwoken'],
		talents: ['Blinded'],
		rarities: ['Origin', 'Outfit', 'Unique', 'Equipment']
	};
	// Favoriting a talent
	let favs = [];
	function favoriteTalent(talent) {
		talent.loved = !talent.loved;
		if (favs.indexOf(talent.name) == -1) {
			favs.push(talent.name);
		} else {
			favs.splice(favs.indexOf(talent.name), 1);
		}
		favoritedTalents.set(favs);
		obtainables = obtainables;
		takenTalents = takenTalents;
	}
	// Function to make sure no more than 1 tooltips are seen at any point
	function checkTooltips() {
		let tooltips = document.querySelectorAll('[tooltip="true"]');
		if (tooltips.length > 1) tooltips[0].remove();
	}
	function removeAllTooltip() {
		let tooltips = document.querySelectorAll('[tooltip="true"]');
		for (let tooltip of tooltips) tooltip.remove();
	}
	//
	let rollableSearch = '';
	let obtainedSearch = '';
	//
	let obtainablesTalentCount = 0;
	function checkReqs(type, talent) {
		for (let reqType in talent.reqs) {
			let reqValue = talent.reqs[reqType];
			// Additional talent req..
			if (type == 'normal') {
				if (talent.name == 'Neuroplasticity') {
					if (
						$attributesStore.base.Willpower >= 35 ||
						$attributesStore.base.Intelligence >= 35 ||
						$attributesStore.base.Charisma >= 35
					)
						return true;
				}
			} else {
				if ($preShrineStore == undefined) return false;
				if (talent.name == 'Neuroplasticity') {
					let racial = $racialStatsStore;
					if (
						$preShrineStore.base.Willpower + racial.Willpower >= 35 ||
						$preShrineStore.base.Intelligence + racial.Intelligence >= 35 ||
						$preShrineStore.base.Charisma + racial.Charisma >= 35
					)
						return true;
				}
			}
			//
			if (typeof reqValue == 'object') {
				for (let req in reqValue) {
					if (type == 'normal') {
						if ($attributesStore[reqType][req] < reqValue[req]) return false;
					} else if (type == 'shrine') {
						if ($preShrineStore == undefined) return false;
						let racial = $racialStatsStore[req];
						if (racial == undefined) {
							racial = 0;
						}
						if ($preShrineStore[reqType][req] + racial < reqValue[req]) return false;
					} else if (type == 'post') {
						if ($postShrineStore == undefined) return false;
						let racial = $racialStatsStore[req];
						if (racial == undefined) {
							racial = 0;
						}
						if ($postShrineStore[reqType][req] + racial < reqValue[req]) return false;
					}
				}
			}
			//
		}
		//if (talent.rarity == 'Advanced') {
		if (talent.reqs.from == '') return true;
		//console.log("Talent reqs for" + talent.name + ": " + talent.reqs.from)
		for (let preReq of talent.reqs.from.split(', ')) {
			if ($data.talents[preReq.toLowerCase()] == undefined) {
				//console.log("Checking for " + talent.name + "Talent doesn't exist: " + preReq.toLowerCase());
				return true;
			}
			// console.log("Prereq checking for: " + talent.name + " with prereq: " + preReq.toLowerCase());
			if (!checkReqs('normal', $data.talents[preReq.toLowerCase()])) {
				//console.log("Prereq didn't pass for " + talent.name + " with prereq: " + preReq.toLowerCase());
				if (!checkReqs('shrine', $data.talents[preReq.toLowerCase()])) {
					//console.log("Prereq shrine didn't pass for " + talent.name + " with prereq: " + preReq.toLowerCase());
					return false;
				}
			}
		}
		//}
		return true;
	}
	let lockedTalents = [];
	function updateTalents() {
		if ($statsStore == undefined || $statsStore == {}) return;

		// Store currently taken talents before update
		let previousTakenTalents = JSON.parse(JSON.stringify(takenTalents));

		oldObtainables = obtainables;
		obtainables = {
			Advanced: {},
			Rare: {},
			Common: {},
			Oath: {},
			Quest: {},
			Murmur: {}
		};

		// Check through all talents and see if the player satisfies the req
		obtainablesTalentCount = 0;
		for (let talentName in $data.talents) {
			(() => {
				let talent = $data.talents[talentName];

				// Ignore blacklisted talents or categories
				if (blacklist.rarities.includes(talent.rarity)) return;
				if (blacklist.categories.includes(talent.category)) return;
				if (blacklist.talents.includes(talent.name)) return;

				// Adding extra stuff to use
				talent.new = true;
				talent.shrine = false;
				lockedTalents.includes(talent.name) ? (talent.locked = true) : (talent.locked = false);

				// Check attunement requirements for ALL talents
				let attunementMet = false;
				if (filters.obtainables.ATTUNEMENT && filters.obtainables.ATTUNEMENT.enabled) {
					for (let attunement in $attributesStore.attunement) {
						if (talent.reqs.attunement && talent.reqs.attunement[attunement] > 0) {
							attunementMet = true;
							break;
						}
					}
					if (!attunementMet) return;
				}

				// Reqs check
				if (!checkReqs('normal', talent)) {
					if (!checkReqs('shrine', talent)) {
						return;
					}
					talent.shrine = true;
				}

				// Rest of the original checks...
				if (talent.rarity === 'Oath') {
					if ($statsStore.meta.Oath !== talent.category) return;
				} else if (talent.rarity === 'Murmur') {
					if ($statsStore.meta.Murmur !== talent.reqs.from) return;
				}

				// Check filters for obtainables
				for (let filter in filters.obtainables) {
					if (filters.obtainables[filter].enabled) {
						if (
							filter === 'PRE' ||
							filter === 'POST' ||
							filter === 'FAV' ||
							filter === 'ATTUNEMENT'
						)
							continue;
						if (talent.reqs.base[filters.obtainables[filter].name] <= 0) return;
					}
				}

				// Additional filter checks
				if (filters.obtainables.PRE.enabled && !talent.shrine) return;
				if (filters.obtainables.POST.enabled && talent.shrine) return;
				if (filters.obtainables.FAV.enabled && !talent.loved) return;

				// Search and push talent
				if (
					talentName.includes(rollableSearch.toLowerCase()) ||
					talent.category.toLowerCase().includes(rollableSearch.toLowerCase())
				) {
					if (!obtainables[talent.rarity][talent.category]) {
						obtainables[talent.rarity][talent.category] = [];
					}
					obtainables[talent.rarity][talent.category].push(talent);
					obtainablesTalentCount++;
				}
			})();
		}

		// Check obtained talents and mark them with shrine
		for (let category in takenTalents) {
			for (let index = takenTalents[category].length - 1; index >= 0; index--) {
				let talent = takenTalents[category][index];
				if (checkReqs('normal', talent)) {
					talent.shrine = false;
				} else if (checkReqs('shrine', talent)) {
					talent.shrine = true;
				} else if ($preShrineStore != undefined && !checkReqs('post', talent)) {
					// Remove talent if it no longer meets any requirements
					takenTalents[category].splice(index, 1);
					if (takenTalents[category].length === 0) {
						delete takenTalents[category];
					}
				}
			}
		}

		// Sort everything alphabetically
		for (let rarity in obtainables) {
			obtainables[rarity] = Object.keys(obtainables[rarity])
				.sort()
				.reduce((accumulator, key) => {
					accumulator[key] = obtainables[rarity][key];
					return accumulator;
				}, {});
			for (let category in obtainables[rarity]) {
				obtainables[rarity][category].sort((a, b) =>
					a.name.toLowerCase().localeCompare(b.name.toLowerCase())
				);
			}
		}

		// Sort taken talents
		takenTalents = Object.keys(takenTalents)
			.sort()
			.reduce((accumulator, key) => {
				accumulator[key] = takenTalents[key];
				return accumulator;
			}, {});

		for (let category in takenTalents) {
			takenTalents[category].sort((a, b) =>
				a.name.toLowerCase().localeCompare(b.name.toLowerCase())
			);
		}

		// Update displayed taken talents
		displayedTakenTalents = JSON.parse(JSON.stringify(takenTalents));
		for (let category in displayedTakenTalents) {
			for (let index = displayedTakenTalents[category].length - 1; index >= 0; index--) {
				let talent = displayedTakenTalents[category][index];
				// Check filters for taken
				for (let filter in filters.taken) {
					if (filters.taken[filter].enabled) {
						if (filter == 'PRE' || filter == 'POST' || filter == 'FAV') continue;
						if (talent.reqs.base[filters.taken[filter].name] <= 0) {
							displayedTakenTalents[category].splice(index, 1);
						}
					}
				}
				// Attunement check
				let attunementMet = false;
				if (filters.taken.ATTUNEMENT && filters.taken.ATTUNEMENT.enabled) {
					for (let attunement in $attributesStore.attunement) {
						if (talent.reqs.attunement && talent.reqs.attunement[attunement] > 0) {
							attunementMet = true;
							break;
						}
					}
					if (!attunementMet) {
						displayedTakenTalents[category].splice(index, 1);
					}
				}
				// Additional filter checks
				if (
					(filters.taken.PRE.enabled && !talent.shrine) ||
					(filters.taken.POST.enabled && talent.shrine) ||
					(filters.taken.FAV.enabled && !talent.loved)
				) {
					displayedTakenTalents[category].splice(index, 1);
				}
			}
			if (displayedTakenTalents[category].length == 0) {
				delete displayedTakenTalents[category];
			}
		}
		// If alphebetical, sort the talents
		if (isAlphabetical) {
			toggleTalentSort(true);
		}

		// Update stores
		obtainables = obtainables;
		takenTalents = takenTalents;
		displayedTakenTalents = displayedTakenTalents;

		// Update taken talent names if talents were removed
		if (JSON.stringify(previousTakenTalents) !== JSON.stringify(takenTalents)) {
			takenTalentNames = [];
			takenTalentCount = 0;
			takenTalentRarities = {
				Advanced: 0,
				Rare: 0,
				Common: 0,
				Oath: 0,
				Quest: 0,
				Murmur: 0
			};

			for (let category in takenTalents) {
				takenTalents[category].forEach((talent) => {
					takenTalentNames.push(talent.name);
					if (
						talent.rarity == 'Oath' ||
						talent.rarity == 'Murmur' ||
						(talent.rarity == 'Quest' && talent.category != 'Saboteur') ||
						talent.name == 'Family Recipe' ||
						talent.dontCountTowardsTotal
					) {
						return;
					}
					takenTalentCount++;
					takenTalentRarities[talent.rarity]++;
				});
			}
			takenTalentsStore.set(takenTalentNames);
		}
	}
	//
	let takenTalentNames = [];
	let takenTalentCount = 0;
	let takenTalentRarities = {
		Advanced: 0,
		Rare: 0,
		Common: 0,
		Oath: 0,
		Quest: 0,
		Murmur: 0
	};
	function getTalent(category, talent, taking) {
		// console.log(talent);
		takenTalentNames = [];
		takenTalentCount = 0;
		takenTalentRarities = {
			Advanced: 0,
			Rare: 0,
			Common: 0,
			Oath: 0,
			Quest: 0,
			Murmur: 0
		};
		lockedTalents = [];
		//
		if (takenTalents[category] == undefined) takenTalents[category] = [];
		let foundTalent = false;
		let talentIndex = 0;
		takenTalents[category].map((takenTalent, i) => {
			if (takenTalent.name == talent.name) {
				foundTalent = true;
				talentIndex = i;
			}
		});
		if (taking == 'toggle') {
			// Take if not already
			if (foundTalent) {
				getTalent(category, talent, false);
				return;
			} else {
				getTalent(category, talent, true);
				return;
			}
		} else if (taking) {
			if (!foundTalent) {
				takenTalents[category].push(talent);
			}
		} else {
			takenTalents[category].splice(talentIndex, 1);
			if (takenTalents[category].length == 0) {
				delete takenTalents[category];
			}
		}
		// Push the event
		for (let category in takenTalents) {
			takenTalents[category].map((talent) => {
				takenTalentNames.push(talent.name);
				// Does not add certain talents
				if (
					talent.rarity == 'Oath' ||
					talent.rarity == 'Murmur' ||
					(talent.rarity == 'Quest' && talent.category != 'Saboteur') ||
					talent.name == 'Family Recipe'
				)
					return;
				if (talent.dontCountTowardsTotal) return;
				takenTalentCount++;
			});
			for (let talent of takenTalents[category]) {
				// Calculate rarities from taken talents
				takenTalentRarities[talent.rarity]++;
				// Add to locked talents if they exists
				if (talent.exclusiveWith.length != 0) {
					for (let exclusiveTalent of talent.exclusiveWith) {
						lockedTalents.push(exclusiveTalent);
					}
				}
			}
		}
		takenTalentsStore.set(takenTalentNames);
		// Picking up an advanced or a talent with prereq also adds prereq talent
		if (taking) {
			if (talent.rarity == 'Advanced') {
				// Check whether the from requirement is talent or category
				if (talent.reqs.from == '') {
					updateTalents();
					return;
				}
			}
			// Check whether the from requirement is talent or category
			if (!talent.reqs.from == '') {
				for (let talentName of talent.reqs.from.toLowerCase().split(', ')) {
					if ($data.talents[talentName] != undefined) {
						getTalent(
							$data.talents[talentName.toLowerCase()].category,
							$data.talents[talentName.toLowerCase()],
							true
						);
					}
				}
			}
		}
		// Remove extra tooltips
		updateTalents();
		removeAllTooltip();
	}
	// Check whether talen
	// listen to stat or attributes changes
	$: $statsStore,
		(() => {
			updateTalents();
		})();
	// Handling collapsable talent dropdowns
	function dropdown(rarity) {
		let dropdownElement = document.getElementById(rarity + '-dropdown-button');
		// Open if not collapsed
		if (dropdownElement.getAttribute('active') == 'false') {
			document.getElementById(rarity + '-dropdown-icon').innerHTML = '▾';
			document.getElementById(rarity + '-dropdown').style.display = 'flex';
			dropdownElement.setAttribute('active', true);
		} else {
			document.getElementById(rarity + '-dropdown-icon').innerHTML = '▴';
			document.getElementById(rarity + '-dropdown').style.display = 'none';
			dropdownElement.setAttribute('active', false);
		}
	}
	//

	function toggleTalentSort(mode) {
		if (mode == undefined) {
			isAlphabetical = !isAlphabetical;
		} else {
			isAlphabetical = mode;
		}

		if (isAlphabetical) {
			// Create a flat array of all talents
			let allTalents = [];
			for (let category in displayedTakenTalents) {
				displayedTakenTalents[category].forEach((talent) => {
					allTalents.push(talent);
				});
			}

			// Sort alphabetically
			allTalents.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

			// Replace categories with single "All" category
			displayedTakenTalents = {
				All: allTalents
			};
		} else {
			// Restore category-based organization
			let categorizedTalents = {};

			// Get all talents from the "All" category
			let talents = displayedTakenTalents['All'];

			// Sort back into categories
			talents.forEach((talent) => {
				if (!categorizedTalents[talent.category]) {
					categorizedTalents[talent.category] = [];
				}
				categorizedTalents[talent.category].push(talent);
			});

			// Sort categories alphabetically
			displayedTakenTalents = Object.keys(categorizedTalents)
				.sort()
				.reduce((obj, key) => {
					obj[key] = categorizedTalents[key].sort((a, b) =>
						a.name.toLowerCase().localeCompare(b.name.toLowerCase())
					);
					return obj;
				}, {});
		}

		displayedTakenTalents = displayedTakenTalents;
	}
	// First load
	data.subscribe(() => {
		if ($data.build != {} && $data.build != undefined && $data.build.talents != undefined) {
			if ($data.build.version == undefined) {
				$data.build.talents = $data.build.taken.talents;
			}
			// Load taken talents
			for (let talentName in $data.talents) {
				let talent = $data.talents[talentName];
				if ($data.build.talents.indexOf(talent.name) != -1) {
					if ($data.build.favoritedTalents != undefined) {
						if ($data.build.favoritedTalents.includes(talent.name)) {
							talent.loved = true;
						}
					}
					getTalent(talent.category, talent, true);
				}
			}
		}
	});
</script>

<div class="container" id="Talents" on:mousemove={checkTooltips} role="button" tabindex="0">
	<div class="grid-item rollable-talents" id="rollable-talent-1">
		<div style="text-align: center">
			<b>Obtainable Talents</b> <i style="color: gray">{obtainablesTalentCount}</i>
		</div>
		<div style="display: flex; justify-content: space-around">
			<b class="">{Object.keys(obtainables.Common).length}</b>
			<b class="Rare">{Object.keys(obtainables.Rare).length}</b>
			<b class="Advanced">{Object.keys(obtainables.Advanced).length}</b>
		</div>
		<input
			type="text"
			placeholder="Search talents..."
			aria-autocomplete="none"
			bind:value={rollableSearch}
			on:input={() => updateTalents()}
		/>
		<!-- Filters -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<button
			class="filters-display off"
			on:click={(self) => {
				let filters = self.currentTarget.parentNode.querySelector('.filters');
				if (filters.style.display == 'none') {
					filters.style.display = 'grid';
					document.querySelector('.filters-display').classList.remove('off');
					document.querySelector('.filters-display').classList.add('on');
				} else {
					filters.style.display = 'none';
					document.querySelector('.filters-display').classList.remove('on');
					document.querySelector('.filters-display').classList.add('off');
				}
			}}
		>
			Filters
		</button>
		<div class="filters" style="display: none">
			{#each Object.entries(filters.obtainables) as [filter] (filter)}
				<button
					on:click={() => {
						filters.obtainables[filter].enabled = !filters.obtainables[filter].enabled;
						updateTalents();
					}}
					class="filter {filter.toLowerCase()} {filters.obtainables[filter].enabled}"
					tabindex="0"
				>
					{filter}
					{#if filter == 'PRE' || filter == 'POST' || filter == 'FAV'}
						{#if filter == 'FAV'}
							<img
								class="icon"
								title="This talent was favorited by the build's creator!"
								width="14"
								height="14"
								alt="new"
								src="/lovedicon.png"
								style="margin-left: 3px"
							/>
						{/if}
						{#if filter == 'PRE'}
							<img
								class="icon"
								title="This talent is only obtainable pre-shrine."
								width="14"
								height="14"
								alt="new"
								src="/shrineicon.png"
								style="margin-left: 3px"
							/>
						{/if}
					{/if}
				</button>
			{/each}
		</div>
		<!-- Categories -->
		{#each Object.entries(obtainables) as [rarity]}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				id="{rarity}-dropdown-button"
				active="true"
				class="{rarity} rarity"
				on:click={() => dropdown(rarity)}
				role="button"
				tabindex="0"
			>
				<b>{rarity}</b>
				<div style="color:white" id="{rarity}-dropdown-icon">▾</div>
			</div>
			<div id="{rarity}-dropdown" class="talents-container">
				{#if Object.keys(obtainables[rarity]) != 0}
					{#each Object.entries(obtainables[rarity]) as [category] (category)}
						{#if $data.mystic[category.toLowerCase()] != undefined}
							<fieldset>
								<legend
									use:tooltip={{
										desc: `Mystic: ${$data.mystic[category.toLowerCase()]}`,
										reqs: { base: {}, attunement: {}, weapon: {} }
									}}>{category}</legend
								>
							</fieldset>
						{:else}
							<fieldset><legend>{category}</legend></fieldset>
						{/if}
						{#each obtainables[rarity][category] as talent (talent)}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<div
								use:press={{ timeframe: 300 }}
								use:tap={{ timeframe: 300 }}
								on:press={favoriteTalent(talent)}
								use:tooltip={talent}
								on:tap={getTalent(category, talent, 'toggle')}
								class="talent {talent.rarity} {takenTalentNames.includes(talent.name)
									? 'obtained-talent'
									: ''} shrine-{talent.shrine} locked-{talent.locked}"
								role="button"
								tabindex="0"
							>
								{talent.name}
								<div style="display: flex; gap: 4px">
									{#if talent.loved}
										<img
											class="icon"
											title="This talent was favorited by the build's creator!"
											width="14"
											height="14"
											alt="new"
											src="/lovedicon.png"
										/>
									{/if}
									{#if talent.locked}
										<img
											class="icon"
											title="This talent is mutually exclusive with another talent."
											width="14"
											height="14"
											alt="new"
											src="/lockedicon.png"
										/>
									{/if}
									{#if talent.shrine}
										<img
											class="icon"
											title="This talent is only obtainable pre-shrine."
											width="14"
											height="14"
											alt="new"
											src="/shrineicon.png"
										/>
									{/if}
									{#if talent.new}
										<img
											class="icon"
											title="This talent is newly obtainable from your recent stat changes!"
											width="14"
											height="14"
											alt="new"
											src="/newicon.png"
										/>
									{/if}
								</div>
							</div>
						{/each}
					{/each}
				{:else}
					<div class="talent">No talents :(</div>
				{/if}
			</div>
		{/each}
	</div>
	<div class="grid-item obtained-talents" id="rollable-talent-2">
		<div style="text-align: center">
			<b>Obtained Talents</b> <i style="color: gray">{takenTalentCount}</i>
		</div>
		<div style="display: flex; justify-content: space-around">
			<b class="">{takenTalentRarities.Common}</b>
			<b class="Rare">{takenTalentRarities.Rare}</b>
			<b class="Advanced">{takenTalentRarities.Advanced}</b>
		</div>
		<div style="text-align: center; font-size: 12px; color: rgba(0, 0, 0, 0.5)">
			Max of <b>{52 + (12 - $takenRollableMantrasStore.length) * 2}</b> talents, <b>50</b> rollable
			(<b class="Rare">{40}</b> guaranteed rare attempts) and
			<b>{((13 - $takenRollableMantrasStore.length) * 2).clamp(0, 12 * 2)}</b> from Roll 2
		</div>
		<div style="display: flex; flex-direction: row; align-items: center; gap: 5px">
			<input
				type="text"
				placeholder="Search talents..."
				aria-autocomplete="none"
				bind:value={obtainedSearch}
			/>
			<img
				src="/alphabetical.png"
				alt="sort"
				width="14"
				height="14"
				style="cursor: pointer; filter: {isAlphabetical ? 'invert(0%)' : 'invert(50%)'}"
				on:click={() => {
					toggleTalentSort();
				}}
			/>
			<img
				src="/check.png"
				alt="compare"
				width="14"
				height="14"
				style="cursor: pointer;"
				on:click={() => {
					displayTalentComparison = !displayTalentComparison;
				}}
			/>
		</div>

		<!-- Filters -->
		<button
			class="filters-display off"
			on:click={(self) => {
				let filters = self.currentTarget.parentNode.querySelector('.filters');
				if (filters.style.display == 'none') {
					filters.style.display = 'grid';
					document.querySelector('.filters-display').classList.remove('off');
					document.querySelector('.filters-display').classList.add('on');
				} else {
					filters.style.display = 'none';
					document.querySelector('.filters-display').classList.remove('on');
					document.querySelector('.filters-display').classList.add('off');
				}
			}}
		>
			Filters
		</button>
		<div class="filters" style="display: none">
			{#each Object.entries(filters.taken) as [filter] (filter)}
				<button
					on:click={() => {
						filters.taken[filter].enabled = !filters.taken[filter].enabled;
						updateTalents();
					}}
					class="filter {filter.toLowerCase()} {filters.taken[filter].enabled}"
					tabindex="0"
				>
					{filter}
					{#if filter == 'PRE' || filter == 'POST' || filter == 'FAV'}
						{#if filter == 'FAV'}
							<img
								class="icon"
								title="This talent was favorited by the build's creator!"
								width="14"
								height="14"
								alt="new"
								src="/lovedicon.png"
								style="margin-left: 3px"
							/>
						{/if}
						{#if filter == 'PRE'}
							<img
								class="icon"
								title="This talent is only obtainable pre-shrine."
								width="14"
								height="14"
								alt="new"
								src="/shrineicon.png"
								style="margin-left: 3px"
							/>
						{/if}
					{/if}
				</button>
			{/each}
		</div>
		<div id="" class="talents-container" style="display: flex; margin-top: 10px">
			{#if Object.keys(displayedTakenTalents) != 0}
				{#each Object.entries(displayedTakenTalents) as [category] (category)}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					{#if $data.mystic[category.toLowerCase()] != undefined}
						<fieldset>
							<legend
								use:tooltip={{
									desc: `Mystic: ${$data.mystic[category.toLowerCase()]}`,
									reqs: { base: {}, attunement: {}, weapon: {} }
								}}>{category}</legend
							>
						</fieldset>
					{:else}
						<fieldset><legend>{category}</legend></fieldset>
					{/if}
					{#each displayedTakenTalents[category] as talent (talent)}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						{#if talent.name.toLowerCase().includes(obtainedSearch.toLowerCase())}
							<div
								use:press={{ timeframe: 300 }}
								use:tap={{ timeframe: 300 }}
								on:press={favoriteTalent(talent)}
								use:tooltip={talent}
								on:tap={getTalent(category, talent, false)}
								class="talent {talent.rarity} shrine-{talent.shrine} locked-{talent.locked}"
								role="button"
								tabindex="0"
							>
								{talent.name}
								<div style="display: flex; gap: 4px">
									{#if talent.loved}
										<img
											class="icon"
											title="This talent was favorited by the build's creator!"
											width="14"
											height="14"
											alt="new"
											src="/lovedicon.png"
										/>
									{/if}
									{#if talent.locked}
										<img
											class="icon"
											title="This talent is mutually exclusive with another talent."
											width="14"
											height="14"
											alt="new"
											src="/lockedicon.png"
										/>
									{/if}
									{#if talent.shrine}
										<img
											class="icon"
											title="This talent is only obtainable pre-shrine."
											width="14"
											height="14"
											alt="new"
											src="/shrineicon.png"
										/>
									{/if}
								</div>
							</div>
						{/if}
					{/each}
				{/each}
			{:else}
				<div class="talent">You can click on the talents to pick them!</div>
			{/if}
		</div>
	</div>
</div>

<TalentComparison
	display={displayTalentComparison}
	currentTalents={takenTalentNames}
	on:compare={(event) => {
		// Handle comparison results if needed
	}}
	on:close={() => {
		displayTalentComparison = false;
	}}
/>

<style>
	.container {
		display: none;
		width: 100%;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto 1fr;
		background: url(/background.png) repeat;
		font-size: 15px;
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
	.grid-item {
		overflow-y: scroll;
	}
	fieldset {
		border: none;
		border-top: 1px solid #7c7c7c;
		padding: 0px 0px 0px 0px;
		color: #b6b7b7;
		margin: 1px;
	}
	input {
		font-size: 14px;
		background-color: transparent;
		border-radius: 5px;
		border: 1px solid rgba(0, 0, 0, 0.25);
		padding: 3px;
		margin: 12px 0px 8px 8px;
		color: rgb(49, 49, 49);
		width: 88%;
	}
	@keyframes input-hover {
		0% {
			border-color: rgba(0, 0, 0, 0.25);
		}
		100% {
			border-color: black;
		}
	}
	.input:hover {
		animation: input-hover 0.5s forwards;
	}
	.input:focus,
	.function-button:hover {
		box-shadow: 0px 0px 5px black;
		outline: none;
	}
	.rollable-talents,
	.obtained-talents {
		height: 700px;
	}
	.rarity {
		margin: 10px 0px;
		padding: 5px 10px;
		background: url(/background.png) repeat;
		border: 1px solid transparent;
		border-image: url(/borderthin.png) 45%;
		border-image-width: 7px;
		border-image-outset: 2px;
		display: flex;
		user-select: none;
		cursor: pointer;
		justify-content: space-between;
	}
	.talents-container {
		display: flex;
		flex-direction: column;
		font-size: 14px;
		padding: 5px;
		margin: -2px 0px 20px 0px;
		border: 1px solid transparent;
		border-image: url(/borderthin.png) 45%;
		border-image-width: 7px;
		border-image-outset: 2px;
		background: url(/background.png) repeat;
		color: #dfddc5;
	}
	.filters-display {
		width: 100%;
		text-align: center;
		cursor: pointer;
		border-image: url(/borderthin.png) 45%;
		border-image-width: 10px;
		border-image-outset: 2px;
		background: url(/background.png) repeat;
		color: white;
		padding: 5px;
	}
	.filters-display.off::after {
		content: '▴';
	}
	.filters-display.on::after {
		content: '▾';
	}
	.filters {
		margin-top: 10px;
		width: 100%;
		gap: 5px;
		grid-template-columns: repeat(3, calc(33% - 3px));
		grid-template-rows: repeat(3, 1fr);
	}
	.filter.attunement {
		grid-column: span 3;
	}
	.filter {
		background: url(/background.png) repeat;
		border: 1px solid transparent;
		border-image: url(/borderflat.png) 5;
		border-image-width: 3px;
		border-image-outset: 2px;
		display: flex;
		justify-content: center;
		align-items: center;
		user-select: none;
		cursor: pointer;
		color: white;
		font-size: 12px;
	}
	.filter.false {
		filter: brightness(50%);
	}

	.Advanced {
		color: #51b3da;
	}
	.Rare {
		color: #eb6b6d;
	}
	.Quest {
		color: #f79840;
	}
	.Oath {
		color: #3b7fff;
	}
	.Common {
		color: white;
	}
	.Murmur {
		color: #d13bff;
	}
	.talent {
		margin: 1px;
		margin-left: 10px;
		display: flex;
		align-items: center;
		user-select: none;
		justify-content: space-between;
		cursor: pointer;
	}
	.icon {
		margin: 0px 1px;
	}
	.obtained-talent {
		filter: brightness(50%);
	}
	.icon {
		margin: 0px 1px;
	}
	.shrine-true {
		filter: sepia(30%);
	}
	.shrine-true.obtained-talent {
		filter: opacity(20%) sepia(30%);
	}
	.locked-true {
		color: rgba(207, 53, 53, 0.5);
	}
</style>
