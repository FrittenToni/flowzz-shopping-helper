<script lang="ts">
	import SyncStrains from "$components/SyncStrains.svelte";
	import { onMount } from "svelte";

	let cannabisStrains = [];
	let strainCount = 0;
	let isDarkMode = false;

	function handleStrainsUpdated(event) {
		cannabisStrains = event.detail.cannabisStrains;
		strainCount = event.detail.strainCount;
	}

	function handleResetView() {
		cannabisStrains = [];
		strainCount = 0;
	}

	onMount(() => {
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme) {
			document.documentElement.setAttribute("data-theme", savedTheme);
			isDarkMode = savedTheme === "dark";
		}
	});

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		const theme = isDarkMode ? "dark" : "light";
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);
	}
	import "../../static/app.css";
</script>

<main>
	<img
    src="/flowzz-shopping-helper.png"
    alt="Extension Icon"
    class="extension-icon"
    on:click={toggleDarkMode}
  />

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
		cursor: pointer;
	}
	
	.extension-icon:hover {
		cursor: pointer; 
		filter: invert(1);
	}
</style>
