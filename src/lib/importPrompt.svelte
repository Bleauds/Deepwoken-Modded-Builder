<script>
	export let display = false;
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	/*
	Cowboy Ixatoke
	LVL 20 Ganymede Castaway Pathfinder
	== ATTRIBUTES ==
	59 STR; 20 FTD; 3 AGL; 5 INT; 37 WLL; 35 CHA
	100 HVY; 100 MED; 85 LHT
	120 FIR; 0 ICE; 100 LTN; 100 WND; 0 SDW; 100 MTL
	== MANTRAS ==
	Frozen Servants
	Metal Turret
	== TALENTS ==
	Union Card
	Expert Galebreather
	Flamecharmer
	Union Hook
	Adept Flamecharmer
	Deepfolk
	Breathing Exercise
	Master Flamecharmer
	Kick Off
	Already Dead
	Master Galebreather
	Union Pager
	Master Ironsinger
	Adept Ironsinger
	Adept Galebreather
	Expert Ironsinger
	Braced Collapse
	Adept Thundercaller
	Shaper Mimicry
	Master Thundercaller
	Oath: Visionshaper
	Expert Flamecharmer
	Expert Thundercaller
	Reality Shift
	*/
	function processCharacterData(data) {
		console.log(data);
		// Split input data by line and remove any empty lines
		const lines = data
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.length > 0);

		// Set default values for level, race, origin, and oath
		let level = 0;
		let race = 'Etrean';
		let origin = 'Castaway';
		let oath = 'Oathless';

		// Ensure there are enough lines
		if (lines.length >= 3) {
			// Try extracting basic information from the third line
			const levelLine = lines[2];
			const levelMatch = levelLine.match(/LVL (\d+)/);
			level = levelMatch ? parseInt(levelMatch[1], 10) : 0;

			// Extract race, origin, and oath dynamically from the third line
			const infoParts = levelLine.split(' ');
			race = infoParts[3] || 'Etrean';
			origin = infoParts[4] || 'Castaway';
			oath = infoParts[5] || 'Oathless';
		}

		// Set default attributes
		const attributes = {
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
				Ironsing: 0
			}
		};

		// Try to extract attributes (ensure there are enough lines)
		if (lines.length >= 5) {
			const attributesLine = lines[4];
			const attributesMatch = attributesLine.match(
				/(\d+) STR; (\d+) FTD; (\d+) AGL; (\d+) INT; (\d+) WLL; (\d+) CHA/
			);
			if (attributesMatch) {
				attributes.base.Strength = parseInt(attributesMatch[1], 10);
				attributes.base.Fortitude = parseInt(attributesMatch[2], 10);
				attributes.base.Agility = parseInt(attributesMatch[3], 10);
				attributes.base.Intelligence = parseInt(attributesMatch[4], 10);
				attributes.base.Willpower = parseInt(attributesMatch[5], 10);
				attributes.base.Charisma = parseInt(attributesMatch[6], 10);
			}
		}

		// Try to extract weapon skills (ensure there are enough lines)
		if (lines.length >= 7) {
			const weaponLine = lines[6];
			const weaponMatch = weaponLine.match(/(\d+) HVY; (\d+) MED; (\d+) LHT/);
			if (weaponMatch) {
				attributes.weapon['Heavy Wep.'] = parseInt(weaponMatch[1], 10);
				attributes.weapon['Medium Wep.'] = parseInt(weaponMatch[2], 10);
				attributes.weapon['Light Wep.'] = parseInt(weaponMatch[3], 10);
			}
		}

		// Try to extract attunement skills (ensure there are enough lines)
		if (lines.length >= 9) {
			const attunementLine = lines[8];
			const attunementMatch = attunementLine.match(
				/(\d+) FIR; (\d+) ICE; (\d+) LTN; (\d+) WND; (\d+) SDW; (\d+) MTL/
			);
			if (attunementMatch) {
				attributes.attunement.Flamecharm = parseInt(attunementMatch[1], 10);
				attributes.attunement.Frostdraw = parseInt(attunementMatch[2], 10);
				attributes.attunement.Thundercall = parseInt(attunementMatch[3], 10);
				attributes.attunement.Galebreathe = parseInt(attunementMatch[4], 10);
				attributes.attunement.Shadowcast = parseInt(attunementMatch[5], 10);
				attributes.attunement.Ironsing = parseInt(attunementMatch[6], 10);
			}
		}

		// Extract mantras and talents
		const mantras = [];
		const talents = [];
		let isMantrasSection = false;
		let isTalentsSection = false;

		// Check if there are enough lines and process mantras and talents
		if (lines.length >= 10) {
			for (let i = 10; i < lines.length; i++) {
				if (lines[i] === '== MANTRAS ==') {
					isMantrasSection = true;
					isTalentsSection = false;
				} else if (lines[i] === '== TALENTS ==') {
					isTalentsSection = true;
					isMantrasSection = false;
				} else if (isMantrasSection) {
					mantras.push(lines[i]);
				} else if (isTalentsSection) {
					talents.push(lines[i]);
				}
			}
		}
		// Return processed data
		let results = {
			level,
			race,
			origin,
			oath,
			attributes,
			mantras: mantras.length > 0 ? mantras : [],
			talents: talents.length > 0 ? talents : []
		};

		console.log(results);

		dispatch('import', results);
	}
</script>

<div class="wrapper" style="max-width: 475px; width: 50vw; display: {display ? 'block' : 'none'}">
	<textarea
		id="importDeepwokenData"
		placeholder="Paste your Deepwoken build here... Click 'Import build from Deepwoken' again to close this window."
	></textarea>
	<button
		class="function-button overworld border-thin"
		on:click={() => {
			processCharacterData(document.querySelector('#importDeepwokenData').value);
		}}>Import</button
	>
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
		margin: 0 -5px;
		box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.4);
		border: 1px solid transparent;
		border-image: url(/borderthin.png) 45%;
		border-image-width: 10px;
		border-image-outset: 2px;
		padding: 15px 5px 5px 5px;
		background-color: #e5e0ca;
		font-size: 14px;
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
</style>
