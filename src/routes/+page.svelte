<script lang="ts">
	import { onMount } from "svelte";
	import SyncStrains from "$components/SyncStrains.svelte";
	import SearchStrains from "$components/SearchStrains.svelte";

	let cannabisStrains: { id: number; name: string }[] = [];
	let strainCount = 0;
	let isMuted = false;
	let audio;

	function handleStrainsUpdated(event) {
		cannabisStrains = event.detail.cannabisStrains;
		strainCount = event.detail.strainCount;
	}

	function handleResetView() {
		cannabisStrains = [];
		strainCount = 0;
	}

	function toggleMute() {
		isMuted = !isMuted;
		localStorage.setItem("isMuted", JSON.stringify(isMuted));
		if (isMuted && audio) {
			audio.pause();
		} else if (audio) {
			audio.play();
		}
	}

	onMount(() => {
		const storedMuteState = localStorage.getItem("isMuted");
		if (storedMuteState) {
			isMuted = JSON.parse(storedMuteState);
		}

		if (!isMuted) {
			// Array of sound file names
			const sounds = [
				"/sounds/sound1.mp3",
				"/sounds/sound2.mp3",
				"/sounds/sound3.mp3",
				"/sounds/sound4.mp3"
			];

			// Select a random sound file
			const randomSound = sounds[Math.floor(Math.random() * sounds.length)];

			// Play the selected sound in loop
			audio = new Audio(randomSound);
			audio.loop = true;
			audio.play();
		}
	});
</script>

<main>
	<div class="header">
		<h1>Flowzz Shopping Helper</h1>
		<img
			src={isMuted ? "/mute.png" : "/unmute.png"}
			alt={isMuted ? "Unmute" : "Mute"}
			class="mute-icon"
			on:click={toggleMute}
		/>
	</div>

	<SyncStrains
		on:strainsUpdated={handleStrainsUpdated}
		on:resetView={handleResetView}
	/>

	{#if strainCount > 0}
		<SearchStrains {cannabisStrains} {strainCount} />
	{/if}
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
	.mute-icon {
		width: 24px;
		height: 24px;
		cursor: pointer;
		margin-left: 10px;
    	margin-top: 5px;
	}
</style>
