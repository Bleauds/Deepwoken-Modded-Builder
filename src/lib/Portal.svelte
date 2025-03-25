<script>
	import { onMount, onDestroy } from 'svelte';

	let portal;

	onMount(() => {
		// Create portal container if it doesn't exist
		portal = document.getElementById('portal');
		if (!portal) {
			portal = document.createElement('div');
			portal.id = 'portal';
			document.body.appendChild(portal);
		}
	});

	onDestroy(() => {
		// Clean up empty portal container
		if (portal && portal.children.length === 0) {
			portal.remove();
		}
	});
</script>

<div>
	<portal target="#portal">
		<slot />
	</portal>
</div>
