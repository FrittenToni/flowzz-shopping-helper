<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let searchFields;
	export let selectedPreset = '';

	const dispatch = createEventDispatcher();
	let presets = JSON.parse(localStorage.getItem('presets') || '[]');

	function savePreset(presetName) {
		if (!presetName) {
			alert("Preset name cannot be empty.");
			return;
		}

		const existingPresetIndex = presets.findIndex(p => p.name === presetName);
		const newPreset = {
			name: presetName,
			fields: searchFields
		};

		if (existingPresetIndex >= 0) {
			presets[existingPresetIndex] = newPreset;
		} else {
			presets = [...presets, newPreset];
		}

		localStorage.setItem('presets', JSON.stringify(presets));
	}

	function loadPreset(presetName) {
		const preset = presets.find(p => p.name === presetName);
		if (preset) {
			dispatch('presetLoad', { fields: preset.fields, presetName });
			selectedPreset = presetName;
		}
	}

	function deletePreset() {
		if (selectedPreset) {
			presets = presets.filter(p => p.name !== selectedPreset);
			localStorage.setItem('presets', JSON.stringify(presets));
			selectedPreset = '';
			dispatch('presetClear');
		}
	}
</script>

<div>
	<label for="presetSelect">Load Preset:</label>
	<select id="presetSelect" bind:value={selectedPreset} on:change={(e) => loadPreset(e.target.value)}>
		<option value="">Select a preset</option>
		{#each presets as preset}
			<option value={preset.name}>{preset.name}</option>
		{/each}
	</select>
</div>

<button on:click={() => savePreset(prompt('Enter preset name:'))}>Save Preset</button>
{#if selectedPreset}
	<button on:click={deletePreset}>Delete Preset</button>
{/if}
