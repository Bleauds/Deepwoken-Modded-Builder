<script>
	import { afterUpdate, onMount } from 'svelte';
	import {
		data,
		statsStore,
		attributesStore,
		takenMantrasStore,
		takenTalentsStore,
		takenWeapon,
		takenEnchant,
		takenMotif
	} from '$lib/stores.js';
	import { tooltip } from '$lib/tooltip.js';
	import { motifs } from '$lib/data/data.json';
	//
	const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
	function checkReqs(weap) {
		for (let reqType in weap.reqs) {
			let reqValue = weap.reqs[reqType];
			//
			if (typeof reqValue == 'object') {
				for (let req in reqValue) {
					if ($attributesStore[reqType][req] < reqValue[req]) return false;
				}
			}
		}
		return true;
	}
	//
	let rings = {
		Strength: false,
		Agility: false,
		Intelligence: false,
		Willpower: false,
		Charisma: false,
		"Isshin's Ring": false,
		'Ring of Casters': false
	};
	let modTalents = {};
	let mods = {
		Normal: {
			'Speed Demon': { req: ['Speed Demon'], amount: { dmg: 0.15 } },
			Manipulator: { req: ['Manipulator'], amount: { dmg: 0.2 } },
			'Shade Devour': {
				req: ['Mantra: Shade Devour'],
				amount: { dmg: 0.25 }
			},
			'Ardour Scream': {
				req: ['Ardour Scream', 'Ardour Scream [OATH]'],
				amount: { dmg: 0.25 }
			},
			'Raging Static': {
				req: ['Raging Static'],
				amount: { dmg: 0.2 }
			},
			'Charged Return': {
				req: ['Charged Return'],
				amount: { dmg: 0.15 }
			},
			Matador: { req: ['Matador'], amount: { dmg: 0.2 } },
			'Lose Your Mind': {
				req: ['Lose Your Mind'],
				amount: { dmg: 0.15 }
			},
			Taunt: { req: ['Mantra: Taunt'], amount: { dmg: 0.1 } },
			'Nullifying Clarity': {
				req: ['Nullifying Clarity'],
				amount: { dmg: 0.1 }
			},
			'Overflowing Dam': {
				req: ['Overflowing Dam'],
				amount: { dmg: 0.15 }
			},
			'Tough Love': {
				req: ['Tough Love'],
				amount: { dmg: 0.1 }
			},
			'Flame Within': {
				req: ['Flame Within'],
				amount: { dmg: 0.1 }
			},
			'Last Resort': { req: ['Last Resort'], amount: { dmg: 0.1 } },
			'Exposed Durability': {
				req: ['Exposed Durability'],
				amount: { dmg: 0.1 }
			},
			'Spinning Swordsman': {
				req: ['Spinning Swordsman'],
				amount: { dmg: 0.15 }
			},
			"Wyvern's Claw": {
				req: ["Wyvern's Claw [MED]", "Wyvern's Claw [LHT]", "Wyvern's Claw [HVY]"],
				amount: { dmg: 0.1 }
			},
			'Reshape and Remold': {
				req: ['Reshape and Remold'],
				amount: { dmg: 0.05 }
			},
			Underdog: { req: ['Underdog'], amount: { dmg: 0.03 } },
			Reinforce: {
				req: ['Mantra: Reinforce'],
				amount: { dmg: 0.03 }
			},
			// Penetration
			'Armor Piercing': {
				req: ['Armor Piercing [LHT]', 'Armor Piercing [MED]'],
				amount: { pen: 0.2 }
			},
			'Piercing Will': {
				req: ['Piercing Will'],
				amount: { pen: 0.15 }
			},
			'Cult of Personality': {
				req: ['Cult of Personality'],
				amount: { pen: 0.15 }
			},
			'Thresher Claws': {
				req: ['Thresher Claws'],
				amount: { pen: 0.1 }
			},
			'Cheap Shot': { req: ['Cheap Shot'], amount: { pen: 0.1 } },
			Bullets: { req: ['Bullets'], amount: { pen: 0.1 } },
			'Million Ton Piercer': {
				req: ['Million Ton Piercer'],
				amount: { pen: 0.05 }
			},
			'Ether Overdrive': {
				req: [
					'Ether Overdrive [FLM]',
					'Ether Overdrive [ICE]',
					'Ether Overdrive [WND]',
					'Ether Overdrive [MTL]',
					'Ether Overdrive [SDW]',
					'Ether Overdrive [LTN]'
				],
				amount: { pen: 0.05 }
			}
		},
		// Debuffs (not affected by damage multipliers)
		Debuffs: {},
		// Unique (additions not affected by damage multipliers)
		Unique: {
			'After Cut': { req: ['After Cut'], amount: { dmg: 0.1 } }
		}
	};

	let stars = {
		amount: '',
		selected: '',
		values: {
			'DMG%': [0.02, 0.04, 0.06],
			'PEN%': [0.05, 0.1, 0.14],
			'WGT%': [0.04, 0.08, 0.12]
		}
	};
	// Available mods
	function getAvailMods() {
		// Make sure talent object isn't empty
		if ($data.talents == undefined) return;
		modTalents = {};
		for (let modType in mods) {
			for (let modName in mods[modType]) {
				if (modName == 'Bullets') {
					modTalents[modType][modName] = {
						desc: 'Bullets grants Guns 10% Penetration.',
						reqs: { base: {}, attunement: {}, weapon: {} }
					};
					continue;
				}
				// Loop through every possible prerequisite talent
				innerLoop: for (let talentName of mods[modType][modName].req) {
					if (modTalents[modType] == undefined) {
						modTalents[modType] = {};
					}
					if ($data.talents[talentName.toLowerCase()] != undefined) {
						modTalents[modType][modName] = $data.talents[talentName.toLowerCase()];
						break innerLoop;
					} else if (talentName.includes('Mantra')) {
						let mantraNeeded = talentName.split(': ')[1];
						modTalents[modType][modName] = $data.mantras[mantraNeeded.toLowerCase()];
						break innerLoop;
					}
				}
			}
		}
		//
		for (let modType in mods) {
			for (let modName in mods[modType]) {
				let mod = mods[modType][modName];
				mod.available = false;
				mod.enabled = false;
				// Checking if req is
				innerLoop: for (let req of mod.req) {
					//
					if (req.includes('Mantra')) {
						let mantraNeeded = req.split(': ')[1];
						if ($takenMantrasStore == undefined) {
							break;
						}
						if ($takenMantrasStore.includes(mantraNeeded)) {
							mod.available = true;
							mod.enabled = true;
							break innerLoop;
						}
					} else {
						if ($takenTalentsStore == undefined) {
							break;
						}
						if ($takenTalentsStore.includes(req)) {
							mod.available = true;
							mod.enabled = true;
							break innerLoop;
						}
					}
				}
				// Special cases
				if (modName == 'Bullets') {
					mod.available = true;
				}
			}
		}
	}
	// Damage calculations
	let element = '';
	let enchantElement = '';
	let motifElement = '';
	let resists = 35;
	let dvm = 25;
	let monsterHP = 1000;
	//
	let baseDamage = 0;
	let basePen = 0;
	let totalScalingDamage = 0;
	let totalModdedDamage = 0;
	let totalResistedDamage = 0;
	let totalDVM = 0;
	let totalDPS = 0;
	let weapon = { damage: 0, scaling: {}, speed: 0, range: 0, weight: 0, pen: 0 };
	let totalModDamage = 0;
	let totalModPen = 0;
	let bleed = 0;
	let bleedDamage = 0;
	function calculate() {
		if ($attributesStore == undefined) return;
		if ($data.weapons == undefined) return;
		//
		weapon = $data.weapons[element.toLowerCase()];
		if (weapon == undefined) {
			// Attempt autocompletion
			for (let weaponName in $data.weapons) {
				if (weaponName.includes(element.toLowerCase())) {
					weapon = $data.weapons[weaponName];
					break;
				}
			}
			if (weapon == undefined) {
				weapon = {
					damageType: 'Slash',
					damage: 0,
					scaling: {},
					speed: 0,
					range: 0,
					weight: 0,
					pen: 0,
					chip: 0
				};
			}
		}
		takenWeapon.set(element);
		takenEnchant.set(enchantElement);
		takenMotif.set(motifElement);
		// Calculate
		totalScalingDamage = 0;
		totalModdedDamage = 0;
		totalResistedDamage = 0;
		totalDVM = 0;
		totalDPS = 0;
		//
		baseDamage = weapon.damage;
		basePen = weapon.pen;
		// Apply star scaling
		let star = parseInt(stars.amount);
		if (star != NaN && star > 0 && stars.selected != '') {
			let selected = stars.selected;
			if (selected == 'DMG%') baseDamage *= 1 + stars.values[selected][star - 1];
			if (selected == 'PEN%') basePen += stars.values[selected][star - 1];
		}
		//
		for (let stat in weapon.scaling) {
			if ($attributesStore.weapon[stat] != undefined) {
				totalScalingDamage +=
					baseDamage *
					weapon.scaling[stat] *
					$attributesStore.weapon[stat] *
					(1 + $statsStore.traits.Proficiency * 0.065);
			} else if ($attributesStore.attunement[stat] != undefined) {
				totalScalingDamage +=
					baseDamage *
					weapon.scaling[stat] *
					$attributesStore.attunement[stat] *
					(1 + $statsStore.traits.Proficiency * 0.065);
			} else {
				totalScalingDamage +=
					baseDamage *
					weapon.scaling[stat] *
					$attributesStore.base[stat] *
					(1 + $statsStore.traits.Proficiency * 0.065);
			}
		}
		// Mods
		bleed = 0;
		totalModDamage = 0;
		totalModPen =
			0 + ($attributesStore.base.Strength / 10) * 0.01 + $statsStore.traits.Proficiency * 0.025;
		// Rings
		let ringCount = 0;
		// Sorting stats
		let sorted = Object.fromEntries(
			Object.entries($attributesStore.base)
				.sort(([, a], [, b]) => a - b)
				.reverse()
		);
		//
		for (let stat in sorted) {
			if (rings[stat] == undefined) continue;
			if (rings[stat]) {
				ringCount++;
				totalScalingDamage += baseDamage * 1.2 * ($attributesStore.base[stat] / ringCount);
			}
		}
		if (rings["Isshin's Ring"]) totalModDamage += 0.2;
		if (rings['Ring of Casters']) totalModDamage -= 0.1;
		// Mod apply
		for (let modName in mods['Normal']) {
			let mod = mods.Normal[modName];
			if (mod.enabled) {
				if (modName == 'Speed Demon') {
					bleed = 0.15;
					continue;
				}
				for (let type in mod.amount) {
					if (type == 'dmg') totalModDamage += mod.amount[type];
					if (type == 'pen') totalModPen += mod.amount[type];
				}
			}
		}
		totalScalingDamage = (totalScalingDamage * 0.75) / 1000 + baseDamage;
		// Accounting for bleed damage
		if (weapon.damageType.includes('Bleed')) {
			bleed = 0.3;
		}
		bleedDamage = totalScalingDamage * bleed;
		totalScalingDamage += bleedDamage;
		// Enchanted damage
		if (enchantElement == 'Deferred') {
			totalModDamage += 0.07;
		} else if (enchantElement == 'Curse of the Bloodthirsty') {
			totalModDamage += 0.1;
		} else if (enchantElement == 'Heroism') {
			totalModDamage += 0.2;
		} else if (enchantElement == 'Sear') {
			totalModPen *= 1.4;
		}
		// Outfit damage
		if ($statsStore.meta.Outfit == 'Navaen Warchief' && weapon.type == 'Fists') {
			totalModPen += 0.25;
		} else if ($statsStore.meta.Outfit == 'Legion Centurion' && weapon.type == 'Fists') {
			totalModDamage += 0.1;
		} else if ($statsStore.meta.Outfit == "Justicar's Armour" && weapon.type == 'Fists') {
			totalModDamage += 0.1;
		} else if ($statsStore.meta.Outfit == 'Royal Etrean Guard') {
			if (weapon.name == 'Katana' || weapon.name == 'Alloyed Katana') {
				totalModDamage += 0.25;
			} else if (weapon.name == 'Shattered Katana') {
				totalModDamage += 0.05;
			}
		}
		// Reducing and capping effective mod
		if (totalModDamage > 0.5) {
			totalModDamage = 0.5 + (totalModDamage - 0.5) / 2;
			if (totalModDamage > 0.75) totalModDamage = 0.75;
		}
		// Capping pen at 50% unless they have overdrive or piercer
		let totalPen = basePen + totalModPen;
		if (totalPen > 0.5) {
			if (!mods.Normal['Million Ton Piercer'].enabled && !mods.Normal['Ether Overdrive'].enabled) {
				totalPen = 0.5;
			} else {
				if (totalPen > 1) totalPen = 1;
			}
		}
		// Apply debuffs and unique mods
		for (let modName in mods['Debuffs']) {
			let mod = mods.Debuffs[modName];
			if (mod.enabled) {
				for (let type in mod.amount) {
					if (type == 'dmg') totalModDamage += mod.amount[type];
					if (type == 'pen') totalModPen += mod.amount[type];
				}
			}
		}
		for (let modName in mods['Unique']) {
			let mod = mods.Unique[modName];
			if (mod.enabled) {
				for (let type in mod.amount) {
					if (type == 'dmg') totalModDamage += mod.amount[type];
					if (type == 'pen') totalModPen += mod.amount[type];
				}
			}
		}
		// Get resist
		let resistance = parseInt(resists);
		if (isNaN(resistance)) resistance = 0;
		console.log(totalPen);
		//
		totalModdedDamage = totalScalingDamage * 1 * (1 + totalModDamage);
		totalDVM = 3 * (20 + 3.33) * (totalModdedDamage * (dvm / 100 + 1) * 0.089);
		totalResistedDamage = totalModdedDamage * (1 - (1 - totalPen) * (resistance / 100));
		totalDPS = totalResistedDamage * (1 / (1 / (weapon.speed * 0.75) / 2) + weapon.endlag);
	}
	$: $statsStore,
		(() => {
			calculate();
		})();
	$: $takenTalentsStore,
		(() => {
			getAvailMods();
			calculate();
		})();
	$: $takenMantrasStore,
		(() => {
			getAvailMods();
			calculate();
		})();
	// Onload
	data.subscribe(() => {
		// Load weapon!
		if ($data == undefined) {
			return;
		}
		if ($data.build != undefined && $data.build.weapons != undefined) {
			if ($data.build.weapons != undefined) {
				if ($data.weapons[$data.build.weapons.toLowerCase()] != undefined) {
					element = $data.build.weapons;
				} else {
					element = '';
				}
				calculate();
			}
		}
		getAvailMods();
	});
</script>

<div class="container" id="Weapons">
	<div class="grid-item weapon-damage" style="grid-column: 1 / span 5">
		<div class="text-input space">
			<label><b>Weapon: </b></label>
			<div>
				<select
					bind:value={stars.amount}
					on:input={calculate}
					on:change={calculate}
					autocomplete="false"
				>
					<option>0</option>
					<option>1</option>
					<option>2</option>
					<option>3</option>
				</select>
				Stars
				<select
					bind:value={stars.selected}
					on:input={calculate}
					on:change={calculate}
					autocomplete="false"
				>
					<option>DMG%</option>
					<option>PEN%</option>
					<option>WGT%</option>
				</select>
			</div>
			<input
				type="text"
				class="inline-input"
				list="weapons"
				id="weapon-input"
				onmouseover="focus()"
				bind:value={element}
				on:input={calculate}
				on:change={calculate}
				autocomplete="false"
			/>
			<datalist id="weapons">
				{#each Object.entries($data.weapons) as [i, weaponData]}
					{#if weaponData.type != 'Offhand'}
						<option value={weaponData.name}></option>
					{/if}
				{/each}
			</datalist>
		</div>
		<div class="text-input space">
			<label><b>Enchant: </b></label>
			<input
				type="text"
				class="inline-input"
				list="enchants"
				id="enchants-input"
				onmouseover="focus()"
				bind:value={enchantElement}
				on:input={calculate}
				on:change={calculate}
				autocomplete="false"
			/>
			<datalist id="enchants">
				{#each Object.entries($data.enchants) as [i, enchantData]}
					{#if enchantData.type == 'Weapon'}
						<option value={enchantData.name}></option>
					{/if}
				{/each}
			</datalist>
		</div>
		<div class="text-input space">
			<label><b>Motif: </b></label>
			<input
				type="text"
				class="inline-input"
				list="motifs"
				id="motifs-input"
				onmouseover="focus()"
				bind:value={motifElement}
				on:input={calculate}
				on:change={calculate}
				autocomplete="false"
			/>
			<datalist id="motifs">
				{#if motifs[weapon.type] != undefined}
					{#each motifs[weapon.type] as motif}
						<option value={motif}></option>
					{/each}
				{/if}
			</datalist>
		</div>
		{#if bleed == 0}
			<div class="space damage-info">
				<b>Damage: </b>
				{Math.round(totalScalingDamage * 10) / 10}
			</div>
			<div class="space damage-info">
				<b>Damage with Modifiers: </b>
				{Math.round(totalModdedDamage * 10) / 10}
			</div>
		{:else}
			<div class="space damage-info">
				<b>Damage: </b> ({Math.round((totalScalingDamage - bleedDamage) * 10) / 10} + {Math.round(
					bleedDamage * 10
				) / 10}) {Math.round(totalScalingDamage * 10) / 10}
			</div>
			<div class="space damage-info">
				<b>Damage with Modifiers: </b> ({Math.round((totalModdedDamage - bleedDamage) * 10) / 10} + {Math.round(
					bleedDamage * 10
				) / 10}) {Math.round(totalModdedDamage * 10) / 10}
			</div>
		{/if}
		<div class="space damage-info">
			<div>
				<b>Damage against </b>
				<input
					style="width: 25px; margin: 0"
					bind:value={resists}
					on:input={calculate}
					on:change={calculate}
				/>
				<b>% resists:</b>
			</div>
			{Math.round(totalResistedDamage * 10) / 10}
		</div>
		<div class="space damage-info"><b>DPS: </b> {Math.round(totalDPS * 10) / 10}</div>
	</div>
	<div class="grid-item weapon-stats-container" style="grid-column: 1 / span 5">
		<div style="width: 100%; text-align: center; font-size: 18px"><b>{weapon.name}</b></div>
		{#if !checkReqs(weapon)}
			<div style="font-size: 13px; color: rgba(0, 0, 0, 0.5); text-align: center">
				You currently do not have the requirements to equip this weapon.
			</div>
		{/if}
		<div class="weapon-stats">
			<div class="weapon-stat"><b>Damage Type: </b> {weapon.damageType}</div>
			<div class="weapon-stat"><b>Damage: </b> {baseDamage}</div>
			<div class="weapon-stat"><b>Penetration: </b> {Math.round(basePen * 100)}%</div>
			<div class="weapon-stat"><b>Range: </b> {weapon.range}</div>
			<div class="weapon-stat"><b>Swing Speed: </b> {weapon.speed}x</div>
			<div class="weapon-stat"><b>Weight: </b> {weapon.weight}</div>
			<div class="weapon-stat"><b>Endlag: </b> {weapon.endlag}</div>
			<div class="weapon-stat"><b>Chip: </b> {Math.round(weapon.chip * 100)}%</div>
		</div>
		<hr />
		<div style="font-size: 13px; color: rgba(0, 0, 0, 0.5); text-align: center">
			<b>Scaling</b>
		</div>
		<div class="weapon-stats">
			{#each Object.entries(weapon.scaling) as [stat, amount]}
				{#if amount != 0}
					<div class="weapon-stat"><b>{stat}:</b> {amount}</div>
				{/if}
			{/each}
		</div>
	</div>
	<div class="grid-item weapon-stats-container" style="grid-column: 1 / span 5">
		<div style="width: 100%; text-align: center; font-size: 15px"><b>PvE</b></div>
		<div>
			<b>DVM: </b>
			<input
				style="width: 25px; margin: 0"
				bind:value={dvm}
				on:input={calculate}
				on:change={calculate}
			/>%
		</div>
		<div class="space damage-info">
			<b>Max Damage against Monsters: </b>
			{Math.round(totalDVM * 10) / 10}
		</div>
		<div class="space damage-info">
			<div>
				<b>Hits needed against </b>
				<input
					style="width: 50px; margin: 0"
					bind:value={monsterHP}
					on:input={calculate}
					on:change={calculate}
				/>
				<b>HP Monster:</b>
			</div>
			{Math.round((monsterHP / totalDVM) * 10) / 10}
		</div>
	</div>
	<div class="grid-item rings" style="grid-column: 1 / span 1">
		<div style="text-align: center; margin-bottom: 10px"><b>Rings</b></div>
		{#each Object.entries(rings) as [ring]}
			<div class="ring-input space">
				<b>{ring}</b>
				<input type="checkbox" class="checkbox" bind:checked={rings[ring]} on:change={calculate} />
			</div>
		{/each}
	</div>
	<div class="grid-item" style="grid-column: 2 / span 4">
		<div style="text-align: center"><b>Modifiers</b></div>
		<div style="margin: 10px 3px">
			<div style="display: flex; justify-content: space-between">
				Damage Multipliers: <b>{Math.round((1 + totalModDamage) * 100)}%</b>
			</div>
			<div style="display: flex; justify-content: space-between">
				Total Penetration: <b>{Math.round(basePen * 100 + totalModPen * 100)}%</b>
			</div>
		</div>
		{#each Object.entries(modTalents) as [modType] (modType)}
			<span style="text-align: center; width: 100%; display: inline-block;">{modType}</span>
			{#each Object.entries(modTalents[modType]) as [mod, talent] (mod)}
				{#if mods[modType][mod].available}
					<div class="ring-input space">
						<div style="display: flex; justify-content: space-between; width: 100%">
							<b use:tooltip={talent}>{mod}</b>
							<i>
								{#each Object.entries(mods[modType][mod].amount) as [modName, modAmount]}
									{modAmount * 100}% {modName.toUpperCase()}
								{/each}
							</i>
						</div>
						<input
							type="checkbox"
							class="checkbox"
							bind:checked={mods[modType][mod].enabled}
							on:change={calculate}
						/>
					</div>
				{:else}
					<div class="ring-input disabled space">
						<div style="display: flex; justify-content: space-between; width: 100%">
							<b use:tooltip={talent}>{mod}</b>
							<i>
								{#each Object.entries(mods[modType][mod].amount) as [modName, modAmount]}
									{modAmount * 100}% {modName.toUpperCase()}
								{/each}
							</i>
						</div>
						<input
							type="checkbox"
							class="checkbox"
							bind:checked={mods[modType][mod].enabled}
							on:change={calculate}
							disabled
						/>
					</div>
				{/if}
			{/each}
		{/each}
	</div>
</div>

<style>
	.space {
		display: flex;
		justify-content: space-between;
	}
	.container {
		display: none;
		width: 100%;
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
	.weapon-damage {
		display: flex;
		flex-direction: column;
	}
	.rings {
		display: flex;
		flex-direction: column;
	}
	.ring-input {
		margin: 3px;
	}
	.disabled {
		color: gray;
	}
	input,
	select {
		font-size: 14px;
		background-color: transparent;
		border-radius: 5px;
		border: 1px solid rgba(0, 0, 0, 0.25);
		padding: 2px;
		margin-right: 10px;
		color: rgb(49, 49, 49);
	}
	select {
		margin: 0;
	}
	.checkbox {
		width: 20px;
		margin-right: 0px;
	}
	@keyframes input-hover {
		0% {
			border-color: rgba(0, 0, 0, 0.25);
		}
		100% {
			border-color: black;
		}
	}
	input:hover {
		animation: input-hover 0.5s forwards;
	}
	input:focus {
		box-shadow: 0px 0px 5px black;
		outline: none;
	}
	.weapon-stats-container {
		text-align: left;
	}
	.weapon-stats {
		display: grid;
		width: 80%;
		grid-template-columns: 1fr auto;
	}
	.damage-info {
		margin-right: 10px;
	}
	.text-input {
		margin: 2px 0px;
	}
	.inline-input {
		width: 35%;
	}
</style>
