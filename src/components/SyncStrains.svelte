<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { fetchStrains } from "$lib/syncStrains.ts";
	import AdvancedSearch from "$components/AdvancedSearch.svelte";
	import SearchStrains from "$components/SearchStrains.svelte";

	let loading = false;
	let message = "";
	let strainCount = 0;
	let cannabisStrains = [];
	let showAdvancedSearch = false;
	let showPriceFinder = false;

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
				availibility: strain.availibility,
				strain_name: strain.strain_name,
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
				availibility: strain.availibility,
				strain_name: strain.strain_name,
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

	function toggleAdvancedSearch() {
		showAdvancedSearch = !showAdvancedSearch;
		saveState();
	}

	function togglePriceFinder() {
		showPriceFinder = !showPriceFinder;
		saveState();
	}

	function saveState() {
		const state = {
			showAdvancedSearch,
			showPriceFinder
		};
		localStorage.setItem("viewState", JSON.stringify(state));
	}

	function loadState() {
		const storedViewState = localStorage.getItem("viewState");
		if (storedViewState !== null) {
			const state = JSON.parse(storedViewState);
			showAdvancedSearch = state.showAdvancedSearch;
			showPriceFinder = state.showPriceFinder;
		}
	}

	onMount(() => {
		loadStrains();
		loadState();
	});
</script>

<main>
	{#if loading}
		<p>{message}</p>
	{:else}
		<div>
			{#if strainCount > 0}
			<img
				src="/refresh.png"
				alt="Refresh Strains"
				class="refresh-icon"
				on:click={refreshStrains}
			/>
			{/if}
			<div>
				{message}
			</div>
			
			{#if strainCount > 0}
				<br/>
				<div>
					<button on:click={toggleAdvancedSearch}>
						{showAdvancedSearch
							? "Close Advanced Search"
							: "Open Advanced Search"}
					</button>
					<button on:click={togglePriceFinder}>
						{showPriceFinder
							? "Close Price Finder"
							: "Open Price Finder"}
					</button>
				</div>
			{/if}
		</div>
		{#if showAdvancedSearch}
			<AdvancedSearch {cannabisStrains} />
		{/if}
		{#if showPriceFinder}
			<SearchStrains {cannabisStrains} {strainCount} />
		{/if}
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
	button {
		margin: 0.5rem;
	}
</style>
