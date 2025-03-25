<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import NavMenu from '$lib/nav.svelte';
	import LoadingScreen from '$lib/loading.svelte';
	import Heartbeat from '$lib/Heartbeat.svelte';
	import { user } from '$lib/stores.js';
	//
	import { onMount } from 'svelte';
	import { getStores, navigating, page, updated } from '$app/stores';
	//
	const options = {};
	// Navigating ui
	let naving = false;
	$: $navigating,
		(() => {
			if ($navigating != null) {
				document.body.style.overflowY = 'hidden';
				naving = true;
				console.log(typeof window.ramp !== 'undefined');
			} else if (naving) {
				document.body.style.overflowY = 'scroll';
			}
		})();
	// Initial run
	onMount(async () => {
		//
	});
</script>

<head>
	<meta charset="utf-8" />

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap"
		rel="stylesheet"
	/>
	<script>
		var global = global || window;

		//
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag('js', new Date());

		gtag('config', 'G-00M516D817');
	</script>
	<style lang="scss">
		/* CSS variables */
		:root {
			--button-background: #04100d;
			--background: radial-gradient(#18221a, #04100d);
			--color: white;
			--container-background: rgba(216, 215, 202, 1);
		}
		body {
			display: flex;
			align-items: center;
			flex-direction: column;
			padding: 60px;
			background: var(--background);
			min-height: 600px;
			font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			overflow-x: hidden;
		}
		.black-silence {
			background: #171717 !important;
			color: white !important;
		}
		/* Festive stuff! 
		.festive-grid-item {
			border: 5px solid transparent !important;
			border-image: url(/borderthin-festive.png) 25% repeat !important;
			border-image-width: 5px !important;
			background: white;
		}
		.festive-builder-container {
			border: 5px solid transparent !important;
			border-image: url(/border-festive.png) 25% repeat !important;
			border-image-width: 10px !important;
		}
		.festive {
			background: radial-gradient(#820016, #45000c);
		}
		.snow-container {
			position: fixed;
			top: 0;
			left: 0;
			overflow: hidden;
			width: 100vw;
			height: 100vh;
			z-index: 99999;
			pointer-events: none;
		}

		.snowflake {
			position: absolute !important;
			background-color: white;
			border-radius: 50%;
			opacity: 0.8;
			pointer-events: none;
		}

		@keyframes fall {
			0% {
				opacity: 0;
				transform: translateY(0);
			}
			10% {
				opacity: 1;
			}
			100% {
				opacity: 0.5;
				transform: translateY(100vh);
			}
		}

		@keyframes diagonal-fall {
			0% {
				opacity: 0;
				transform: translate(0, 0);
			}
			10% {
				opacity: 1;
			}
			100% {
				opacity: 0.25;
				transform: translate(10vw, 100vh);
			}
		}*/
		.fixed {
			position: fixed;
			color: white;
			border: 1px solid transparent;
			border-image: url(/border.png) 45%;
			border-image-width: 15px;
			border-image-outset: 2px;
			padding: 5px;
		}
		/* */
		.toggle-desktop {
			margin: 5px;
			color: #202020;
			border: 1px solid transparent;
			border-image: url(/border.png) 45%;
			border-image-width: 15px;
			border-image-outset: 2px;
			padding: 5px;
			font-size: 14px;
			background-color: hsl(56, 16%, 82%);
		}
		/* */
		.footer {
			font-family: 'Lora', 'sans-serif';
			font-size: 12px;
			padding: 5px;
		}
		.selected {
			color: white !important;
			background-color: #1a1a1a !important;
		}
		/* Loading */
		.loading {
			display: none;
		}
		#footer-ad {
			width: 100%;
		}
		#first-med-rect {
			display: none;
		}
		@media only screen and (max-width: 600px) {
			#first-med-rect {
				display: block;
			}
		}
		._toastItem {
			border-image: url(/borderthin.png) 45% !important;
			border-image-width: 10px !important;
			border-image-outset: 2px !important;
			background: hsl(56, 16%, 82%) !important;
			color: black !important;
		}

		input:disabled,
		select:disabled {
			cursor: not-allowed;
		}
	</style>
</head>

<div class="notifWrapper"><SvelteToast {options} /></div>
<!-- Navigation -->
<NavMenu />
<!-- Loading -->
<div id="first-med-rect" />
{#if $navigating}
	<LoadingScreen />
{:else}
	<!-- Only mount heartbeat component if user is logged in -->
	{#if $user}
		<Heartbeat />
	{/if}

	<slot />
{/if}
<!-- Footer -->
<!--<div style="margin-top: 100px">
	<p>
		<a href="https://www.playwire.com/contact-direct-sales" rel="noopener"
			><img
				src="https://www.playwire.com/hubfs/Powered-by-Playwire-Badges/Ads-Powered-by-playwire-2021-standalone-small-white-300px.png"
				alt="Ads-Powered-by-playwire-2021-standalone-small-white-300px"
				width="200"
				height="56"
				loading="lazy"
				style="width: 200px; margin-left: auto; margin-right: auto; display: block; height: auto; max-width: 100%;"
			/></a
		>
	</p>
	<p style="text-align: center;">
		<a href="https://www.playwire.com/contact-direct-sales" rel="noopener" target="_blank"
			>Advertise on this site.</a
		>
	</p>
</div>-->
<!-- Footers -->
