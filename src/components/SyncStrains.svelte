<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { fetchStrains } from "$lib/syncStrains.ts";
	import AdvancedSearch from "$components/AdvancedSearch.svelte";
  
	let loading = false;
	let message = "";
	let strainCount = 0;
	let cannabisStrains = [];
	let showAdvancedSearch = false;
  
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
  
	function saveState() {
	  localStorage.setItem("showAdvancedSearch", JSON.stringify(showAdvancedSearch));
	}
  
	function loadState() {
	  const storedShowAdvancedSearch = localStorage.getItem("showAdvancedSearch");
	  if (storedShowAdvancedSearch !== null) {
		showAdvancedSearch = JSON.parse(storedShowAdvancedSearch);
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
		  <br/>
		  <div>
			<button on:click={toggleAdvancedSearch}>
			  {showAdvancedSearch
				? "Close Advanced Search"
				: "Open Advanced Search"}
			</button>
		  </div>
		{/if}
	  </div>
	  {#if showAdvancedSearch}
		<AdvancedSearch {cannabisStrains} />
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
  </style>
  