<script lang="ts">
    import RatingSection from './RatingSection.svelte';
  
    export let filteredStrains;
  
    let activeRatings = {};
  
    function formatStrainName(strain_name) {
      return strain_name
        .replace(/\s+/g, '-') // Replace whitespace with dash
        .replace(/[^\w-]+/g, '') // Remove all other special characters
        .toLowerCase();
    }
  
    function openInCurrentTab(url) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.update(tabs[0].id, { url: url });
      });
    }
  
    function handleShowRatings(id) {
      if (activeRatings[id]) {
        delete activeRatings[id];
      } else {
        activeRatings = { ...activeRatings, [id]: 'loading' };
        fetchRatings(id);
      }
    }
  
    async function fetchRatings(id) {
      let ratings = [];
      let start = 0;
      let hasMore = true;
  
      while (hasMore) {
        const response = await fetch(`https://flowzz.com/api/raitings/${id}?t=1&id=${id}&start=${start}`);
        const data = await response.json();
  
        if (data.message.data.ratings.length > 0) {
          ratings = [...ratings, ...data.message.data.ratings];
          start += 20;
        } else {
          hasMore = false;
        }
      }
  
      activeRatings = { ...activeRatings, [id]: ratings.length > 0 ? ratings : 'No ratings found.' };
    }
  
    function handleCloseRatings(id) {
      delete activeRatings[id];
      activeRatings = { ...activeRatings };
    }
  </script>
  
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
            <a class="clickable" href={"https://www.leafly.com/search?q=" + strain.strain_name} on:click={(e) => { e.preventDefault(); openInCurrentTab("https://www.leafly.com/search?q=" + strain.strain_name); }}>Leafly</a> |
            <a class="clickable" href={"https://www.cannaconnection.com/search?controller=search&orderby=position&orderway=desc&search_query=" + strain.strain_name} on:click={(e) => { e.preventDefault(); openInCurrentTab("https://www.cannaconnection.com/search?controller=search&orderby=position&orderway=desc&search_query=" + strain.strain_name); }}>Cannaconnection</a>
          </td>
          <td>{strain.thc}%</td>
          <td>
            {strain.ratings_score ?? 0}
            <a class="clickable" on:click={(e) => { e.preventDefault(); handleShowRatings(strain.id); }}>
              ({strain.ratings_count ?? 0} reviews)
            </a>
          </td>
          <td>{strain.min_price} - {strain.max_price}</td>
        </tr>
        {#if activeRatings[strain.id]}
          <tr>
            <td colspan="5">
              <RatingSection strainId={strain.id} ratings={activeRatings[strain.id]} on:close={() => handleCloseRatings(strain.id)} />
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
  
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
      color: black;
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
  