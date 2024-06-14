<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { fetchStrains } from "$lib/syncStrains.ts";

	let loading = false;
	let message = "";
	let strainCount = 0;
	let cannabisStrains = [];

	const dispatch = createEventDispatcher();

	function updateMessage(newMessage) {
		message = newMessage;
	}

	async function loadStrains() {
		const storedStrains = localStorage.getItem("cannabisStrains");
		if (storedStrains) {
			const strains = JSON.parse(storedStrains);
			cannabisStrains = strains.map((strain) => ({
				id: strain.id,
				name: strain.name,
				thc: strain.thc,
				cbd: strain.cbd,
				genetic: strain.genetic,
				ratings_score: strain.ratings_score,
				ratings_count: strain.ratings_count,
				min_price: strain.min_price,
				max_price: strain.max_price,
				url: strain.url,
			}));
			strainCount = strains.length;
			updateMessage(`${strainCount} Cannabis Strains available`);
			dispatch("strainsUpdated", { cannabisStrains, strainCount });
		} else {
			await fetchAndStoreStrains();
		}
	}

	async function fetchAndStoreStrains() {
		loading = true;
		await fetchStrains(updateMessage);
		const storedStrains = localStorage.getItem("cannabisStrains");
		if (storedStrains) {
			const strains = JSON.parse(storedStrains);
			cannabisStrains = strains.map((strain) => ({
				id: strain.id,
				name: strain.name,
				thc: strain.thc,
				cbd: strain.cbd,
				genetic: strain.genetic,
				ratings_score: strain.ratings_score,
				ratings_count: strain.ratings_count,
				min_price: strain.min_price,
				max_price: strain.max_price,
				url: strain.url,
			}));
			strainCount = strains.length;
			dispatch("strainsUpdated", { cannabisStrains, strainCount });
		}
		loading = false;
	}

	async function refreshStrains() {
		dispatch("resetView");
		await fetchAndStoreStrains();
	}

	onMount(() => {
		loadStrains();
	});
</script>

<main>
	{#if loading}
		<p>{message}</p>
	{:else}
		<div>
			<div>
			{message}
			</div>
			{#if strainCount > 0}
				<img
					src="/refresh.png"
					alt="Refresh Strains"
					class="refresh-icon"
					on:click={refreshStrains}
				/>
			{/if}
		</div>
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1rem;
		width: 600px;
		color: green;
	}
	.refresh-icon {
		width: 14px;
		height: 14px;
		cursor: pointer;
	}
</style>
