<script lang="ts">
    import { onMount } from 'svelte';
  
    export let cannabisStrains = [];
  
    // Filter and sort state
    let priceMin = 0;
    let priceMax = '';
    let thcMin = 0;
    let thcMax = 100;
    let ratingMin = 0;
    let scoreCountMin = 0;
    let sortOption = '';
  
    // Reactive computed property for filtered strains
    $: filteredStrains = cannabisStrains.filter(strain => {
      // Apply price filter
      const isPriceInRange = priceMax === '' ? strain.min_price >= priceMin : (strain.min_price >= priceMin && strain.min_price <= priceMax);
  
      // Apply THC filter
      const isThcInRange = strain.thc >= thcMin && strain.thc <= thcMax;
  
      // Apply rating filter
      const isRatingInRange = strain.ratings_score >= ratingMin && strain.ratings_count >= scoreCountMin;
  
      return isPriceInRange && isThcInRange && isRatingInRange;
    }).sort((a, b) => {
      switch (sortOption) {
        case 'alphabetAsc':
          return a.name.localeCompare(b.name);
        case 'alphabetDesc':
          return b.name.localeCompare(a.name);
        case 'price':
          return a.min_price - b.min_price;
        case 'rating':
          return b.ratings_score - a.ratings_score;
        case 'thc':
          return b.thc - a.thc;
        default:
          return 0;
      }
    });
  
    function openInCurrentTab(url) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.update(tabs[0].id, { url: url });
      });
    }
  
    function saveState() {
      const state = {
        priceMin,
        priceMax,
        thcMin,
        thcMax,
        ratingMin,
        scoreCountMin,
        sortOption
      };
      console.log("Saving state:", state); // Debug log
      localStorage.setItem('advancedSearchState', JSON.stringify(state));
    }
  
    function loadState() {
      const state = JSON.parse(localStorage.getItem('advancedSearchState'));
      if (state) {
        console.log("Loading state:", state); // Debug log
        priceMin = state.priceMin;
        priceMax = state.priceMax;
        thcMin = state.thcMin;
        thcMax = state.thcMax;
        ratingMin = state.ratingMin;
        scoreCountMin = state.scoreCountMin;
        sortOption = state.sortOption;
      } else {
        console.log("No state found in localStorage."); // Debug log
      }
    }
  
    onMount(() => {
      loadState();
    });
  </script>
  
  <main>
    <h2>Advanced Search</h2>
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
        <label>Score:</label>
        <input type="number" bind:value={ratingMin} min="0" max="5" step="0.1" placeholder="Min Score" on:input={saveState}/>
      </div>
      <div class="filter-item">
        <label>Score Count:</label>
        <input type="number" bind:value={scoreCountMin} min="0" placeholder="Min Score Count" on:input={saveState}/>
      </div>
      <div class="filter-item">
        <label>Sort By:</label>
        <select bind:value={sortOption} on:change={saveState}>
          <option value="">None</option>
          <option value="alphabetAsc">Alphabet (ASC)</option>
          <option value="alphabetDesc">Alphabet (DESC)</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
          <option value="thc">THC</option>
        </select>
      </div>
    </div>
  
    <h3>Filtered Strains ({filteredStrains.length})</h3>
    <ul>
      {#each filteredStrains as strain}
        <li on:click={() => openInCurrentTab(`https://flowzz.com/product/${strain.url}`)} class="clickable">
          {strain.name} - {strain.min_price} - {strain.thc}% THC - Rating: {strain.ratings_score} ({strain.ratings_count} reviews)
        </li>
      {/each}
    </ul>
  </main>
  
  <style>
    main {
      text-align: center;
      padding: 1rem;
    }
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
    label {
      margin-bottom: 0.5rem;
    }
    input, select {
      padding: 0.5rem;
      font-size: 1rem;
      width: 150px;
    }
    ul {
      list-style-type: none;
      padding: 0;
      margin-top: 1rem;
    }
    li {
      margin-bottom: 0.5rem;
      cursor: pointer;
    }
    .clickable {
      cursor: pointer;
      color: blue;
      text-decoration: underline;
    }
  </style>
  