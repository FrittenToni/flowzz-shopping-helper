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
	<div class="header">
		<h1>Flowzz Shopping Helper</h1>
	</div>
  
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
	.header {
		display: flex;
		align-items: center;
		justify-content: center;
		color: green;
	}
</style>
