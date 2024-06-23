<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  export let cannabisStrains = [];

  let priceMin = 0;
  let priceMax = "";
  let thcMin = 0;
  let thcMax = 100;
  let ratingMin = 0;
  let scoreCountMin = 0;
  let sortOption = "";
  let sortOrder = "asc";
  let showAvailableOnly = false;
  let searchStrain = "";
  let searchCultivar = "";
  let searchProducer = "";
  let selectedGenetic = "";
  let preciseSearch = false;

  const dispatch = createEventDispatcher();

  function saveState() {
    const state = {
      priceMin,
      priceMax,
      thcMin,
      thcMax,
      ratingMin,
      scoreCountMin,
      sortOption,
      sortOrder,
      showAvailableOnly,
      searchStrain,
      searchCultivar,
      searchProducer,
      selectedGenetic,
      preciseSearch
    };
    localStorage.setItem("advancedSearchState", JSON.stringify(state));
  }

  function loadState() {
    const state = JSON.parse(localStorage.getItem("advancedSearchState"));
    if (state) {
      priceMin = state.priceMin;
      priceMax = state.priceMax;
      thcMin = state.thcMin;
      thcMax = state.thcMax;
      ratingMin = state.ratingMin;
      scoreCountMin = state.scoreCountMin;
      sortOption = state.sortOption;
      sortOrder = state.sortOrder;
      showAvailableOnly = state.showAvailableOnly;
      searchStrain = state.searchStrain;
      searchCultivar = state.searchCultivar;
      searchProducer = state.searchProducer;
      selectedGenetic = state.selectedGenetic;
      preciseSearch = state.preciseSearch;
    }
  }

  function clearFilters() {
    priceMin = 0;
    priceMax = "";
    thcMin = 0;
    thcMax = 100;
    ratingMin = 0;
    ratingMin = 0;
    scoreCountMin = 0;
    sortOption = "";
    sortOrder = "asc";
    showAvailableOnly = false;
    searchStrain = "";
    searchCultivar = "";
    searchProducer = "";
    selectedGenetic = "";
    preciseSearch = false;
    saveState();
    handleFilterChange();
  }

  function handleFilterChange() {
    saveState();
    dispatch("filterChange", {
      priceMin,
      priceMax,
      thcMin,
      thcMax,
      ratingMin,
      scoreCountMin,
      sortOption,
      sortOrder,
      showAvailableOnly,
      searchStrain,
      searchCultivar,
      searchProducer,
      selectedGenetic,
      preciseSearch
    });
  }

  function formatStrainName(strain_name) {
    return strain_name
      .trim()
      .replace(/\s+/g, "-") // Replace whitespace with dash
      .replace(/[^\w-]+/g, "") // Remove all other special characters
      .toLowerCase();
  }

  const uniqueCultivars = [
    ...new Set(
      cannabisStrains.map((strain) => formatStrainName(strain.strain_name))
    ),
  ].sort((a, b) => a.localeCompare(b));
  
  const uniqueProducers = [
    ...new Set(
      cannabisStrains.map((strain) =>
        (strain.producer_name ?? "").toLowerCase()
      )
    ),
  ].sort((a, b) => a.localeCompare(b));

  const uniqueGenetics = [
    ...new Set(
      cannabisStrains.map((strain) => (strain.genetic ?? "").toLowerCase())
    ),
  ].sort((a, b) => a.localeCompare(b));

  onMount(() => {
    loadState();
    handleFilterChange();
  });
</script>

<div class="filter-group">
  <div class="filter-item">
    <label>Price Range:</label>
    <input
      type="number"
      bind:value={priceMin}
      min="0"
      placeholder="Min Price"
      on:input={handleFilterChange}
    />
    <input
      type="number"
      bind:value={priceMax}
      min="0"
      placeholder="Max Price"
      on:input={handleFilterChange}
    />
  </div>
  <div class="filter-item">
    <label>THC Range:</label>
    <input
      type="number"
      bind:value={thcMin}
      min="0"
      max="100"
      placeholder="Min THC"
      on:input={handleFilterChange}
    />
    <input
      type="number"
      bind:value={thcMax}
      min="0"
      max="100"
      placeholder="Max THC"
      on:input={handleFilterChange}
    />
  </div>
  <div class="filter-item">
    <label>Sort By:</label>
    <select bind:value={sortOption} on:change={handleFilterChange}>
      <option value="">None</option>
      <option value="name">Name</option>
      <option value="price">Price</option>
      <option value="rating">Rating</option>
      <option value="thc">THC</option>
      <option value="reviewCount">Review Count</option>
      <option value="published_at">Published Date</option>
    </select>
    <select bind:value={sortOrder} on:change={handleFilterChange}>
      <option value="asc">Ascending</option>
      <option value="desc">Descending</option>
    </select>
  </div>
  <div class="filter-item">
    <label>Producer:</label>
    <input
      list="producerNames"
      bind:value={searchProducer}
      placeholder="Enter producer name"
      on:input={handleFilterChange}
    />
    <datalist id="producerNames">
      {#each uniqueProducers as producer}
        <option value={producer}>{producer}</option>
      {/each}
    </datalist>
  </div>
  <div class="filter-item">
    <label>Genetic:</label>
    <select bind:value={selectedGenetic} on:change={handleFilterChange}>
      <option value="">Select Genetic</option>
      {#each uniqueGenetics as genetic}
        <option value={genetic}>{genetic}</option>
      {/each}
    </select>
  </div>
  <div class="filter-item">
    <label>Min Reviews:</label>
    <input
      type="number"
      bind:value={scoreCountMin}
      min="0"
      placeholder="Min Score Count"
      on:input={handleFilterChange}
    />
  </div>
  <div class="filter-item">
    <label>Cultivar:</label>
    <input
      list="cultivarNames"
      bind:value={searchCultivar}
      placeholder="Enter cultivar"
      on:input={handleFilterChange}
    />
    <datalist id="cultivarNames">
      {#each uniqueCultivars as cultivar}
        <option value={cultivar}>{cultivar}</option>
      {/each}
    </datalist>
  </div>
  <div class="filter-item">
    <label>Name:</label>
    <input
      list="strainNames"
      bind:value={searchStrain}
      placeholder="Enter strain name"
      on:input={handleFilterChange}
    />
    <datalist id="strainNames">
      {#each cannabisStrains as strain}
        <option value={strain.name}>{strain.name}</option>
      {/each}
    </datalist>
  </div>
  <div class="filter-item">
    <label>Review Score:</label>
    <input
      type="number"
      bind:value={ratingMin}
      min="0"
      max="5"
      step="0.1"
      placeholder="Min Score"
      on:input={handleFilterChange}
    />
  </div>
  <div class="filter-item checkbox-item">
    <label class="checkbox-container">
      <input
        type="checkbox"
        bind:checked={preciseSearch}
        on:change={handleFilterChange}
      />
      Precise cultivar search
    </label>
  </div>
  <div class="filter-item checkbox-item">
    <label class="checkbox-container">
      <input
        type="checkbox"
        bind:checked={showAvailableOnly}
        on:change={handleFilterChange}
      />
      Show Available Only
    </label>
  </div>
  <div class="filter-item">
    <button class="reset-button" on:click={clearFilters}>Reset</button>
  </div>
</div>

<style>
  .filter-group {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .filter-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .checkbox-item {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .checkbox-container {
    display: flex;
    align-items: center;
  }
  .checkbox-container input[type="checkbox"] {
    width: auto;
    margin-right: 0.5rem;
  }
  label {
    margin-bottom: 0.5rem;
  }
  input {
    padding: 0.5rem;
    font-size: 1rem;
    width: 150px;
  }
  select {
    padding: 0.5rem;
    font-size: 1rem;
    width: 170px;
  }
  button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
  }
  .reset-button {
    background-color: red;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 10px;
  }

  .reset-button:hover {
    background-color: black;
  }
</style>
