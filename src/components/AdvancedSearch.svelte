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
  let sortOrder = 'asc';
  let showAvailableOnly = false;
  let searchStrain = '';

  // Reactive computed property for filtered strains
  $: filteredStrains = cannabisStrains.filter(strain => {
    const isPriceInRange = priceMax === '' ? strain.min_price >= priceMin : (strain.min_price >= priceMin && strain.min_price <= priceMax);
    const isThcInRange = strain.thc >= thcMin && strain.thc <= thcMax;
    const isRatingInRange = (strain.ratings_score ?? 0) >= ratingMin && (strain.ratings_count ?? 0) >= scoreCountMin;
    const isAvailable = showAvailableOnly ? strain.availibility === 1 : true;
    const isStrainMatch = searchStrain === '' ? true : strain.name.toLowerCase().includes(searchStrain.toLowerCase());

    return isPriceInRange && isThcInRange && isRatingInRange && isAvailable && isStrainMatch;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortOption) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.min_price - b.min_price;
        break;
      case 'rating':
        comparison = b.ratings_score - a.ratings_score;
        break;
      case 'thc':
        comparison = b.thc - a.thc;
        break;
      case 'reviewCount':
        comparison = b.ratings_count - a.ratings_count;
        break;
      default:
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
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
      sortOption,
      sortOrder,
      showAvailableOnly,
      searchStrain
    };
    localStorage.setItem('advancedSearchState', JSON.stringify(state));
  }

  function loadState() {
    const state = JSON.parse(localStorage.getItem('advancedSearchState'));
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
    }
  }

  function clearFilters() {
    priceMin = 0;
    priceMax = '';
    thcMin = 0;
    thcMax = 100;
    ratingMin = 0;
    scoreCountMin = 0;
    sortOption = '';
    sortOrder = 'asc';
    showAvailableOnly = false;
    searchStrain = '';
    saveState();
  }

  onMount(() => {
    loadState();
  });

  function formatStrainName(strain_name) {
    return strain_name
      .replace(/\s+/g, '-') // Replace whitespace with dash
      .replace(/[^\w-]+/g, '') // Remove all other special characters
      .toLowerCase();
  }
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

  <h3>Filtered Strains ({filteredStrains.length})</h3>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Details</th>
        <th>THC</th>
        <th>Rating</th>
        <th>Price Range</th>
      </tr>
    </thead>
    <tbody>
      {#each filteredStrains as strain}
        <tr>
          <td>
            <a class="clickable" href={"https://flowzz.com/product/" + strain.url} on:click={(e) => { e.preventDefault(); openInCurrentTab("https://flowzz.com/product/" + strain.url); }}>
              {strain.name}
            </a>
            <a class="clickable" href={"https://flowzz.com/strain/" + formatStrainName(strain.strain_name)} on:click={(e) => { e.preventDefault(); openInCurrentTab("https://flowzz.com/strain/" + formatStrainName(strain.strain_name)); }}>
              ({formatStrainName(strain.strain_name)})
            </a>
          </td>
          <td>
            <a class="clickable" href={"https://www.leafly.com/search?q=" + strain.strain_name} target="_blank">Leafly</a> |
            <a class="clickable" href={"https://www.cannaconnection.com/search?controller=search&orderby=position&orderway=desc&search_query=" + strain.strain_name} target="_blank">Cannaconnection</a>
          </td>
          <td>{strain.thc}%</td>
          <td>{(strain.ratings_score ?? 0)} ({(strain.ratings_count ?? 0)} reviews)</td>
          <td>{strain.min_price} - {strain.max_price}</td>
        </tr>
      {/each}
    </tbody>
  </table>
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
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
  }
  .clear-button {
    margin-top: 0px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    color: black; /* Set text color to black */
  }
  th {
    background-color: #f2f2f2;
  }
  .clickable {
    cursor: pointer;
    color: blue;
    text-decoration: underline;
  }
</style>
