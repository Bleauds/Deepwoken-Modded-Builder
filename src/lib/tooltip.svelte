<script>
	export let data;
	export let x;
	export let y;
</script>

<div tooltip="true" style="top: {y}px; left: {x + 15}px;" class="wrapper border-thin">
	{#if data.reqs != {}}
		<div id="tags">
			{#if data.reqs.power > 0}
				<span class="power req"><b>Power</b>: {data.reqs.power}</span>
			{/if}
			{#each Object.entries(data.reqs.base) as [statName, statAmount]}
				{#if statAmount != 0}
					<span class="req {statName.toLowerCase()}"><b>{statName}</b>: {statAmount}</span>
				{/if}
			{/each}
			{#if data.reqs.weapon != undefined}
				{#each Object.entries(data.reqs.weapon) as [statName, statAmount]}
					{#if statAmount != 0}
						<span class="req {statName.toLowerCase()}"><b>{statName}</b>: {statAmount}</span>
					{/if}
				{/each}
			{/if}
			{#each Object.entries(data.reqs.attunement) as [statName, statAmount]}
				{#if statAmount != 0}
					<span class="req {statName.toLowerCase()}"><b>{statName}</b>: {statAmount}</span>
				{/if}
			{/each}
		</div>
	{/if}
	<!-- GIF if it has one-->
	{#if data.gif != undefined && data.gif != ''}
		<div style="display: flex; justify-content: center">
			<img class="mantra-preview" src={data.gif} alt="preview" />
		</div>
	{/if}
	<p>{data.desc}</p>
	{#if data.reqs.from != undefined && data.reqs.from != ''}
		<p style="color: rgba(0, 0, 0, 0.5); margin-bottom: -10px">Need: {data.reqs.from}</p>
		<br />
	{/if}
	{#if data.stats != undefined && data.stats != 'N/A' && data.stats != ''}
		<p style="color: rgba(0, 0, 0, 0.5)">{data.stats}</p>
	{/if}
</div>

<style>
	.wrapper {
		position: absolute;
		padding: 15px 5px 5px 5px;
		background-color: #e5e0ca;
		width: 200px;
		font-size: 14px;
		color: black;
	}
	.mantra-preview {
		display: block;
		border: 1px solid transparent;
		border-image: url(/borderthin.png) 45%;
		border-image-width: 10px;
		border-image-outset: 2px;
		max-width: 180px;
		max-height: 180px;
		width: auto;
		height: auto;
		margin: 15px;
	}
	#tags {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
	}
	.req {
		padding: 5px;
		border-radius: 8px;
		font-size: 12px;
		white-space: nowrap;
		color: white;
	}
	p {
		margin: 5px;
	}
	.buggedReq {
		background-color: black;
	}
	.noReqs,
	.power,
	.strength,
	.fortitude,
	.agility,
	.intelligence,
	.willpower,
	.charisma {
		background-color: dimgray;
	}
	.mantra,
	.equipped,
	.talent {
		background-color: darkslategrey;
	}
	.medium,
	.heavy,
	.light {
		background-color: rgb(211, 211, 211);
	}
	.flamecharm {
		background-color: rgb(216, 104, 0);
	}
	.frostdraw {
		background-color: #00dddd;
	}
	.thundercall {
		background-color: rgb(226, 230, 0);
		color: black;
	}
	.galebreathe {
		background-color: rgb(69, 218, 0);
	}
	.shadowcast {
		background-color: rgb(205, 6, 255);
	}
	.ironsing {
		background-color: rgb(0, 0, 0);
	}
	.bloodrend {
		background-color: rgb(180, 0, 0);
	}
</style>
