<script>
	export let w;
	export let h;
	export let img;
</script>

<div id="profilePictureContainer" style="width: {w}; height: {h}">
	<button id="profilePictureButton" on:click>
		<img
			id="profilePicture"
			style="pointer-events: none"
			src={img == undefined ? '/discord.png' : img}
			alt="discord"
		/>
	</button>
	<div class="login-button border-thin"></div>
</div>

<style>
	#profilePictureContainer {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	#profilePictureButton {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1;
		padding: 0;
		border: none;
		cursor: pointer;
		overflow: hidden;
		width: calc(100% + 3px);
		height: calc(100% + 3px);
	}
	#profilePictureButton:hover {
		filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
	}
	#profilePicture {
		max-width: 100%;
		height: 100%;
	}
	.login-button {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: transparent;
		z-index: 1;
		pointer-events: none;
	}
</style>
