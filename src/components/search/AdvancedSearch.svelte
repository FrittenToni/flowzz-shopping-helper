<script lang="ts">
  import FilterGroup from './FilterGroup.svelte';
  import StrainTable from './StrainTable.svelte';

  export let cannabisStrains = [];

  let filteredStrains = [];

  function handleFilterChange(event) {
    const {
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
    } = event.detail;

    filteredStrains = cannabisStrains.filter(strain => {
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
  }
</script>

<main>
  <h2>Advanced Search</h2>
  <FilterGroup {cannabisStrains} on:filterChange={handleFilterChange} />
  <StrainTable {filteredStrains} />
</main>

<style>
  main {
    text-align: center;
    padding: 1rem;
  }
</style>
