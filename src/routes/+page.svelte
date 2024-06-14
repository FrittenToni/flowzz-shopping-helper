<script lang="ts">
	import { onMount } from "svelte";
	import SyncStrains from "$components/SyncStrains.svelte";
	import SearchStrains from "$components/SearchStrains.svelte";

	let cannabisStrains = [];
	let strainCount = 0;
	let showError = false;

	function handleStrainsUpdated(event) {
		cannabisStrains = event.detail.cannabisStrains;
		strainCount = event.detail.strainCount;
	}

	function handleResetView() {
		cannabisStrains = [];
		strainCount = 0;
	}

	function navigateToFlowzz() {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.update(tabs[0].id, { url: "https://flowzz.com/" });
		});
	}

	onMount(() => {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			const currentTab = tabs[0];
			if (!currentTab.url.startsWith("https://flowzz.com/")) {
				showError = true;
			}
		});
	});
</script>

{#if showError}
	<div class="error">
		<p>
			Open 
			<a href="#" on:click|preventDefault={navigateToFlowzz}>flowzz.com</a> 
			and log on to use this extension.
		</p>
	</div>
{:else}
	<main>
		<div class="header">
			<h1>Flowzz Shopping Helper</h1>
		</div>

		<SyncStrains
			on:strainsUpdated={handleStrainsUpdated}
			on:resetView={handleResetView}
		/>

		{#if strainCount > 0}
			<SearchStrains {cannabisStrains} {strainCount} />
		{/if}
	</main>
{/if}

<style>
	main {
		text-align: center;
	}
	.header {
		display: flex;
		align-items: center;
		justify-content: center;
		color: green;
	}
	.error {
		background-color: green;
		color: white;
		text-align: center;
		padding: 2rem;
		font-size: 1.5rem;
	}
	.error a {
		color: white;
		text-decoration: underline;
		cursor: pointer;
	}
</style>
