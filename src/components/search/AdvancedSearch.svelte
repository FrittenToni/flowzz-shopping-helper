<script lang="ts">
  import { onMount } from 'svelte';
  import StrainTable from './StrainTable.svelte';
  import FilterGroup from './FilterGroup.svelte';

  export let cannabisStrains = [];

  let filteredStrains = [];
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
  let searchCultivar = '';

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
          searchStrain,
          searchCultivar
      } = event.detail;

      filteredStrains = cannabisStrains.filter(strain => {
          const isPriceInRange = priceMax === '' ? strain.min_price >= priceMin : (strain.min_price >= priceMin && strain.min_price <= priceMax);
          const isThcInRange = strain.thc >= thcMin && strain.thc <= thcMax;
          const isRatingInRange = (strain.ratings_score ?? 0) >= ratingMin && (strain.ratings_count ?? 0) >= scoreCountMin;
          const isAvailable = showAvailableOnly ? strain.availibility === 1 : true;
          const isStrainMatch = searchStrain === '' ? true : strain.name.toLowerCase().includes(searchStrain.toLowerCase());
          const isCultivarMatch = searchCultivar === '' ? true : formatStrainName(strain.strain_name).includes(searchCultivar.toLowerCase());

          return isPriceInRange && isThcInRange && isRatingInRange && isAvailable && isStrainMatch && isCultivarMatch;
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

  function formatStrainName(strain_name) {
      return strain_name
          .trim()
          .replace(/\s+/g, '-') // Replace whitespace with dash
          .replace(/[^\w-]+/g, '') // Remove all other special characters
          .toLowerCase();
  }

  onMount(() => {
      handleFilterChange({ detail: { priceMin, priceMax, thcMin, thcMax, ratingMin, scoreCountMin, sortOption, sortOrder, showAvailableOnly, searchStrain, searchCultivar } });
  });
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
