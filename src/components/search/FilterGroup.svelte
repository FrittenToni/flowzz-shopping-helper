<script lang="ts">
    export let priceMin;
    export let priceMax;
    export let thcMin;
    export let thcMax;
    export let ratingMin;
    export let scoreCountMin;
    export let sortOption;
    export let sortOrder;
    export let showAvailableOnly;
    export let searchStrain;
    export let cannabisStrains;
  
    export let saveState;
    export let clearFilters;
    export let loadState;
  </script>
  
  <div class="filter-group">
    <div class="filter-item">
      <label>Price Range:</label>
      <input type="number" bind:value={priceMin} min="0" placeholder="Min Price" on:input={saveState}/>
      <input type="number" bind:value={priceMax} min="0" placeholder="Max Price" on:input={saveState}/>
    </div>
    <div class="filter-item">
      <label>THC Range:</label>
      <input type="number" bind:value={thcMin} min="0" max="100" placeholder="Min THC" on:input={saveState}/>
      <input type="number" bind:value={thcMax} min="0" max="100" placeholder="Max THC" on:input={saveState}/>
    </div>
    <div class="filter-item">
      <label>Review Score:</label>
      <input type="number" bind:value={ratingMin} min="0" max="5" step="0.1" placeholder="Min Score" on:input={saveState}/>
    </div>
    <div class="filter-item">
      <label>Min Reviews:</label>
      <input type="number" bind:value={scoreCountMin} min="0" placeholder="Min Score Count" on:input={saveState}/>
    </div>
    <div class="filter-item">
      <label>Sort By:</label>
      <select bind:value={sortOption} on:change={saveState}>
        <option value="">None</option>
        <option value="name">Name</option>
        <option value="price">Price</option>
        <option value="rating">Rating</option>
        <option value="thc">THC</option>
        <option value="reviewCount">Review Count</option>
      </select>
      <select bind:value={sortOrder} on:change={saveState}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
    <div class="filter-item">
      <label>Name:</label>
      <input
        list="strainNames"
        bind:value={searchStrain}
        placeholder="Enter strain name"
        on:input={saveState}
      />
      <datalist id="strainNames">
        {#each cannabisStrains as strain}
          <option value={strain.name}>{strain.name}</option>
        {/each}
      </datalist>
    </div>
    <div class="filter-item checkbox-item">
      <label class="checkbox-container">
        <input type="checkbox" bind:checked={showAvailableOnly} on:change={saveState}/>
        Show Available Only
      </label>
    </div>
    <div class="filter-item">
      <button class="clear-button" on:click={clearFilters}>Clear</button>
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
    input, select {
      padding: 0.5rem;
      font-size: 1rem;
      width: 150px;
    }
    button {
      margin-top: 0px;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
    }
  </style>
  