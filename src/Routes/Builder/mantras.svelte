<script>
	// 
	import { press, tap } from 'svelte-gestures';
	import { data, statsStore, attributesStore, takenMantrasStore, mantraModifications, takenRollableMantrasStore, takenTalentsStore, preShrineStore, racialStatsStore } from '$lib/stores.js';
	import { tooltip } from "$lib/tooltip.js";
	import { oathsInfo } from "$lib/data/data.json";
	
	let chosenOath = "Oathless";
	// Updating mantras
	let selectedMantra = {
		name: "None",
		gem: "None",
		spark: "None"
	};
	let baseMantraSlots = {
		Combat: 3,
		Mobility: 1,
		Support: 1,
		Wisp: 0,
		Wildcard: 1,

	}
	let mantraSlots = {
		Combat: 3,
		Mobility: 1,
		Support: 1,
		Wisp: 0,
		Wildcard: 1,
	}
	//
	let obtainables = {
		Combat: [],
		Mobility: [],
		Support: [],
		Wisp: []
	}
	let takenMantras = {};
	let takenMantrasSlots = {
		Combat: 0,
		Mobility: 0,
		Support: 0,
		Wisp: 0,
		Wildcard: 0,
	};
	// Other data
	let gems = ["None", "Bloodless", "Blessed", "Insignia", "Blue", "Wayward", "Wind"]
	let sparks = ["None", "Blast", "Reversal", "Multiplying", "Magnet", "Spring", "Tornado"]
	// Function to make sure no more than 1 tooltips are seen at any point
	function checkTooltips() {
		let tooltips = document.querySelectorAll("[tooltip=\"true\"]");
		if (tooltips.length > 1) tooltips[0].remove();	
	}
	function removeAllTooltip() {
		let tooltips = document.querySelectorAll("[tooltip=\"true\"]");
		for (let tooltip of tooltips) tooltip.remove();
	}
	//
	function checkReqs(type, talent) {
		for (let reqType in talent.reqs) {
			let reqValue = talent.reqs[reqType];
			//
			if (typeof(reqValue) == "object") {
				for (let req in reqValue) {
					if (type == "normal") {
						if (reqType == "from") continue;
						if ($attributesStore[reqType][req] < reqValue[req]) return false
					} else {
						if ($preShrineStore == undefined) return false;
						let racial = $racialStatsStore[req];
						if (racial == undefined) {racial = 0};
						if ($preShrineStore[reqType][req] + racial < reqValue[req]) return false
					}
				}
			}
		}
		return true
	}
	//
	function updateMantras() {
		if ($statsStore == undefined || $statsStore == {}) return;
		let info = oathsInfo[chosenOath];
		if (info == undefined) return;
		for (let slot in mantraSlots) {
			if (info.slots[slot] != undefined) {
				mantraSlots[slot] = baseMantraSlots[slot] + info.slots[slot]
			} else {
				mantraSlots[slot] = baseMantraSlots[slot];
			}
		}
		// Neuroplasticity
		if ($takenTalentsStore != undefined) {
			if ($takenTalentsStore.includes("Neuroplasticity")) mantraSlots.Wildcard++
			if ($takenTalentsStore.findIndex(element => element.includes("Will o' Wisp")) != -1) mantraSlots.Wisp++
		}
		//
		obtainables = {
			Combat: [],
			Mobility: [],
			Support: [],
			Wisp: []
		}
		// Check through all talents and see if the player satisfies the req
		//console.log(data.talents)
		for (let mantraName in $data.mantras) {
			(() => {
				let mantra = $data.mantras[mantraName];
				mantra.shrine = false;
				// Reqs
				if (!checkReqs("normal", mantra)) {
					if (!checkReqs("shrine", mantra)) {
						return;
					};
					mantra.shrine = true;
				};
				// Oath checkk
				if (mantra.type == "Oath") {
					let oath = mantra.reqs.from.split(": ")[1];
					if (oath != $statsStore.meta.Oath) return;
				}
				// Additional properties to pass in 
				obtainables[mantra.category].push(mantra);
			})();
		}
		// Updating modded mamntras
		let mantraMods = {}
		for (let category in takenMantras) {
			for (let mantra of takenMantras[category]) {
				// Push to modifications table
				mantraMods[mantra.name] = {
					gem: mantra.gem,
					spark: mantra.spark
				}
			}
			mantraModifications.set(mantraMods)
		}
		obtainables = obtainables;
	}
	// listen to stat or attributes changes
	$: $statsStore, (() => {
		// Update oath
		if ($statsStore == undefined || $statsStore == {}) return;
		chosenOath = $statsStore.meta.Oath;
		updateMantras();
	})();
	$: $takenTalentsStore, (() => {
		updateMantras();
	})()
	//
	let takenMantraNames = [];
	function getMantra(category, mantra, taking) {
		takenMantraNames = [];
		//
		if (takenMantras[category] == undefined) takenMantras[category] = [];
		let foundMantra = false; let mantraIndex = 0;
		// Check whether the mantra is already taken
		takenMantras[category].map((takenMantra, i) => {
			if (takenMantra.name == mantra.name) {
				foundMantra = true; 
				mantraIndex = i;
			}
		});
		if (!foundMantra) {
			// Check if the mantra is taken in a wildcard slot
			if (takenMantras.Wildcard != undefined) {
				takenMantras.Wildcard.map((takenMantra, i) => {
					if (takenMantra.name == mantra.name) {
						foundMantra = true; 
						mantraIndex = i;
						category = "Wildcard";
					}
				})
			}
		}
		// Take if not already
		if (taking == "toggle") {
			if (foundMantra) {
				getMantra(category, mantra, false);
				return
			} else {
				getMantra(category, mantra, true);
				return
			}
		} else if (taking) {
			if (!foundMantra) {
				// Push to wildcard or to wildcard?
				if (takenMantrasSlots[category] == mantraSlots[category] && takenMantrasSlots.Wildcard < mantraSlots.Wildcard) {
					if (takenMantras.Wildcard == undefined) takenMantras.Wildcard = [];
					takenMantras.Wildcard.push(mantra);
					takenMantrasSlots.Wildcard++;
				} else if (category == "Wisp" && takenMantrasSlots.Wisp == mantraSlots.Wisp && takenMantrasSlots.Support < mantraSlots.Support) {
					// Instead push Wisp mantras to support if Wisp is full
					if (takenMantras.Support == undefined) takenMantras.Support = [];
					takenMantras.Support.push(mantra);
					takenMantrasSlots.Support++;
				} else {
					takenMantras[category].push(mantra);
					takenMantrasSlots[category]++;
				}
			}
		} else {
			takenMantras[category].splice(mantraIndex, 1)
			if (takenMantras[category].length == 0) {
				delete takenMantras[category];
			}
			takenMantrasSlots[category]--;
		}
		// Push the event
		let nonOathMantras = [];
		for (let category in takenMantras) {
			takenMantras[category].map(mantra => takenMantraNames.push(mantra.name));
			for (let mantra of takenMantras[category]) {
				if (mantra.type != "Monster" && mantra.type != "Oath") {
					nonOathMantras.push(mantra);
				}
			}
		}
		takenMantrasStore.set(takenMantraNames)
		takenRollableMantrasStore.set(nonOathMantras)
		//
		takenMantras = takenMantras;
	}
	//
	function viewMantra(mantra) {
		selectedMantra = mantra;
	}
	// First load
	data.subscribe(() => {
		//
		if ($data.build != {} && $data.build != undefined && $data.build.mantras != undefined) {
			if ($data.build.version == undefined) {
				$data.build.mantras = $data.build.taken.mantras;
			}
			// Load taken talents after oath loads
			for (let mantraName in $data.mantras) {
				let mantra = $data.mantras[mantraName]
				if ($data.build.mantras.indexOf(mantra.name) != -1) {
					if ($data.build.mantraModifications != undefined) {
						if ($data.build.mantraModifications[mantra.name] != undefined) {
							mantra.gem = $data.build.mantraModifications[mantra.name].gem;
							mantra.spark = $data.build.mantraModifications[mantra.name].spark;
						} else {
							mantra.gem = "None"
							mantra.spark = "None"
						}
					}
					getMantra(mantra.category, mantra, true);
				}
			}
		}
		updateMantras();
	});
</script>

<style>
    .container {
		display: none;
		width: 100%;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr;
		background: url(/background.png) repeat;
		font-size: 15px;
		max-height: 800px;
		min-height: 600px;
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
	fieldset { 
		border: none;
		border-top: 1px solid #7c7c7c;;
		padding: 0px 0px 0px 0px;
		margin: 0px 4px 0px 1px;
		width: 100%;
		font-size: 14px;
	}
	.mantra-category {
		display: flex;
		justify-content: space-between;
		color: #B6B7B7;
		font-size: 13px;
		margin-right: 3px;
	}
	.obtained-mantras {
		display: grid;
		grid-template-rows: 4fr 1fr;
	}
	.rollable-mantras {
		overflow-y: scroll;
    }
	.mantras-container {
		display: flex;
		flex-direction: column;
		font-size: 14px;
		padding: 5px;
		margin: -2px 0px 20px 0px;
		border: 1px solid transparent;
		border-image: url(/borderthin.png) 45%;
		border-image-width: 10px;
		border-image-outset: 2px;
		background: url(/background.png) repeat;
		color: #dfddc5;
	}
	.mantra {
		margin: 1px;
		margin-left: 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
	}
	.shrineicon {
		order: 0;
		margin-right: 5px;
	}
	select {
		font-size: 14px;
		background-color: transparent;
		border-radius: 5px;
		border: 1px solid rgba(0, 0, 0, 0.25);
		padding: 2px;
		margin-right: 5px;
		color: rgb(49, 49, 49);
		margin: 0;
	}
	.stars-1::after {content: "★"; color:white; -webkit-text-fill-color: white}
	.stars-2::after {content: "★★"; color:white; -webkit-text-fill-color: white}
	.stars-3::after {content: "★★★"; color:white; -webkit-text-fill-color: white}
	.Flamecharm {color:rgb(255, 160, 70)}
	.Frostdraw {color:#5cffff}
	.Thundercall {color:rgb(251, 255, 0)}
	.Galebreathe {color:rgb(167, 255, 126)}
	.Shadowcast {color:rgb(155, 92, 255)}
	.Ironsing {color: rgb(230, 230, 230)}

	.Galebreathe-Thundercall {
		color: color-mix(in srgb, rgb(251, 255, 0), rgb(167, 255, 126));
	}

	.Flamecharm-Thundercall {
		color: color-mix(in srgb, rgb(255, 160, 70), rgb(251, 255, 0));
	}

	.Monster {color: green}
	.obtained-mantra {
		color: rgba(255, 255, 255, 0.25);
	}
</style>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="container" id="Mantras" on:mousemove={checkTooltips}>
	{#if chosenOath != "Silentheart"}
		<div class="grid-item rollable-mantras" id="rollable-mantra-1">
			<div style="text-align: center"><b>Obtainable Mantras</b></div>
			<div id="" class="mantras-container" style="display: flex; margin-top: 10px">
				{#if (Object.keys(obtainables) != 0)}
					{#each Object.entries(obtainables) as [category]}
						<div class="mantra-category"><fieldset><legend>{category}</legend></fieldset></div>
						{#each obtainables[category] as mantra (mantra)}
							{#if mantra.type == "Attunement"}
								<div use:press={{timeframe: 300}} use:tap={{ timeframe: 300 }} on:tap={getMantra(category, mantra, "toggle")} use:tooltip={mantra} class="mantra {takenMantraNames.includes(mantra.name) ? "obtained-mantra" : ""} {mantra.attribute.join("-")}">{mantra.name}
									<div class="stars-{mantra.stars}" style="text-align: center; display: flex; align-items: center">
										{#if mantra.shrine} 
										<img width=14 height=14 alt="new" class="shrineicon" src="/shrineicon.png">
										{/if}
									</div>
								</div>
							{:else}
								<div use:press={{timeframe: 300}} use:tap={{ timeframe: 300 }} on:tap={getMantra(category, mantra, "toggle")} use:tooltip={mantra} class="mantra {takenMantraNames.includes(mantra.name) ? "obtained-mantra" : ""} {mantra.type}">{mantra.name}
									<div class="stars-{mantra.stars}" style="text-align: center; display: flex; align-items: center">
										{#if mantra.shrine} 
										<img width=14 height=14 alt="new" class="shrineicon" src="/shrineicon.png">
										{/if}
									</div>
								</div>
							{/if}
						{/each}
					{/each}
				{:else}
					<div class="mantra">No obtainable mantras :(</div>
				{/if}
			</div>
		</div>
		<div class="obtained-mantras">
			<div class="grid-item" id="rollable-mantra-2">
				<div style="text-align: center"><b>Obtained Mantras</b></div>
				<div id="" class="mantras-container" style="display: flex; margin-top: 10px">
					{#if (Object.keys(takenMantras) != 0)}
						{#each Object.entries(takenMantras) as [category]}
							<div class="mantra-category"><fieldset><legend>{category}</legend></fieldset>
									{#if takenMantrasSlots[category] > mantraSlots[category]}
										<span style="color: #ff6b6b">{takenMantrasSlots[category]}/{mantraSlots[category]}</span>
									{:else}
										{takenMantrasSlots[category]}/{mantraSlots[category]}
									{/if}
							</div>
							{#each takenMantras[category] as mantra}
								{#if mantra.type == "Attunement"}
									<div use:press={{timeframe: 300}} use:tap={{ timeframe: 300 }} on:tap={getMantra(category, mantra, false)} on:press={viewMantra(mantra)} use:tooltip={mantra} class="mantra {mantra.attribute.join("-")}">{mantra.name}
										<div class="stars-{mantra.stars}" style="text-align: center; display: flex; align-items: center">
											{#if mantra.shrine} 
												<img width=14 height=14 alt="new" class="shrineicon" src="/shrineicon.png">
											{/if}
										</div>
									</div>
								{:else}
									<div use:press={{timeframe: 300}} use:tap={{ timeframe: 300 }} on:tap={getMantra(category, mantra, false)} on:press={viewMantra(mantra)} use:tooltip={mantra} class="mantra {mantra.type}">{mantra.name}
										<div class="stars-{mantra.stars}" style="text-align: center; display: flex; align-items: center">
											{#if mantra.shrine} 
												<img width=14 height=14 alt="new" class="shrineicon" src="/shrineicon.png">
											{/if}
										</div>
									</div>
								{/if}
							{/each}
						{/each}
					{:else}
						<div class="mantra">You can click on the mantras to pick them!</div>
					{/if}
				</div>
			</div>
			<div class="grid-item mantra-details">
				{#if selectedMantra.name != "None"}
					<div style="font-size: 15px; margin: 10px;">{selectedMantra.name}</div>
					<div style="font-size: 15px; margin: 10px">
						<b>Gem: </b>
						<select bind:value={selectedMantra.gem} on:change={updateMantras}>
							{#each gems as gem}
								<option value={gem}>{gem}</option>
							{/each}
						</select>
					</div>
					<div style="font-size: 15px; margin: 10px">
						<b>Spark: </b>
						<select bind:value={selectedMantra.spark} on:change={updateMantras}>
							{#each sparks as spark}
								<option value={spark}>{spark}</option>
							{/each}
						</select>
					</div>
				{:else}
					<div style="font-size: 15px; margin: 10px;">Hold click on a mantra to view it's modifications.</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="grid-item" style="grid-column: span 2;  text-align: center"><b style="color: red;">You seek to go against your vows?</b></div>
	{/if}
</div>