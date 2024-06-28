<script lang="ts">
	import SyncStrains from "$components/SyncStrains.svelte";
	
	let cannabisStrains = [];
	let strainCount = 0;
	
	function handleStrainsUpdated(event) {
	  cannabisStrains = event.detail.cannabisStrains;
	  strainCount = event.detail.strainCount;
	}
	
	function handleResetView() {
	  cannabisStrains = [];
	  strainCount = 0;
	}
  </script>
	
  <main>
	<img src="/flowzz-shopping-helper.png" alt="Extension Icon" class="extension-icon">

	<SyncStrains
	  on:strainsUpdated={handleStrainsUpdated}
	  on:resetView={handleResetView}
	  {cannabisStrains}
	  {strainCount}
	/>
  </main>
	
  <style>
	main {
	  text-align: center;
	}
	.extension-icon {
	  width: 200px;
	  height: 200px;
	}
  </style>
  