<script>
	export let title = {
		name: 'Title',
		color: 'white',
		description: 'Description'
	};
</script>

<div class="author-title border-edge" style={`color: ${title.color}`} title={title.description}>
	{title.name}
</div>

<style>
	.author-title {
		justify-content: space-between;
		background: url('/background.png') repeat;
		padding: 2px 5px;
		font-size: 12px;
		width: fit-content;
	}
</style>
