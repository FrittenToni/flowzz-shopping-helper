<script lang="ts">
    import "../../static/app.css";
    import SyncStrains from "$components/SyncStrains.svelte";
    import { onMount } from "svelte";
    
    let cannabisStrains = [];
    let strainCount = 0;
    let isDarkMode = false;
    let themeLoaded = false; // Track if theme has finished loading
    
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
        const theme = savedTheme || "light"; // default to light if no theme is saved
        document.documentElement.setAttribute("data-theme", theme);
        isDarkMode = theme === "dark";
        themeLoaded = true; // Mark theme as loaded
    });
    
    function toggleDarkMode() {
        isDarkMode = !isDarkMode;
        const theme = isDarkMode ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }
</script>

<main>
    {#if themeLoaded}
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
    {/if}
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