<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { fetchStrains } from "$lib/syncStrains.ts";
    import AdvancedSearch from "$components/search/AdvancedSearch.svelte";
    import SearchStrains from "$components/pricefinder/SearchStrains.svelte";
  
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
          producer_name: strain.producer_name,
          published_at: strain.published_at
        }));
        strainCount = strains.length;
        updateMessage(`${strainCount} Cannabis Strains available`);
        dispatch("strainsUpdated", { cannabisStrains, strainCount });
  
        // Fetch total number of products and compare
        const totalProducts = await fetchTotalProducts();
        if (totalProducts && totalProducts !== strainCount) {
          await fetchAndStoreStrains();
        }
      } else {
        await fetchAndStoreStrains();
      }
    }
  
    async function fetchTotalProducts() {
      try {
        const response = await fetch("https://flowzz.com/api/v1/views/flowers?avail=0");
        const data = await response.json();
        return data.data.meta.pagination.total;
      } catch (error) {
        console.error("Failed to fetch total products:", error);
        return null;
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
          producer_name: strain.producer_name,
          published_at: strain.published_at
        }));
        strainCount = strains.length;
        dispatch("strainsUpdated", { cannabisStrains, strainCount });
      }
      loading = false;
    }
  
    function toggleAdvancedSearch() {
      showAdvancedSearch = !showAdvancedSearch;
      if (showAdvancedSearch) {
        showPriceFinder = false;
      }
      saveState();
    }
  
    function togglePriceFinder() {
      showPriceFinder = !showPriceFinder;
      if (showPriceFinder) {
        showAdvancedSearch = false;
      }
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
        <div class="message-text">{message}</div>
        {#if strainCount > 0}
          <br />
          <div>
            <button
              class="styled-button"
              class:active-button={showAdvancedSearch}
              on:click={toggleAdvancedSearch}
            >
              Advanced Search
            </button>
            <button
              class="styled-button"
              class:active-button={showPriceFinder}
              on:click={togglePriceFinder}
            >
              Price Finder
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
      color: green;
      min-width: 650px;
    }
  
    button {
      margin: 0.5rem;
    }
  
    .styled-button {
      background-color: var(--button-inactive-color);
      border: var(--button-border);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      margin-bottom: 10px;
    }
  
    .styled-button:hover {
      background-color: var(--button-active-color);
    }
  
    .active-button {
      background-color: var(--button-active-color);
    }
  
    .message-text {
      font-size: large;
    }
  </style>
  