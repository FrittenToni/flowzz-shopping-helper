<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let presets = [];
	export let selectedPreset = '';
	export let searchFields = [];
	export let updateSearchFields;
	export let nextId;
	export let setNextId;

	const dispatch = createEventDispatcher();

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
			const updatedFields = preset.fields.map(field => ({
				...field,
				loadingVendors: true, // Set loading to true to fetch the latest vendor data
				vendors: [], // Clear cached vendors
				noVendors: false // Reset no vendors flag
			}));
			const newNextId = Math.max(...updatedFields.map(f => f.id)) + 1;
			updateSearchFields(updatedFields);
			setNextId(newNextId);
			dispatch('presetLoaded', { fields: updatedFields, nextId: newNextId });

			updatedFields.forEach((field, index) => {
				if (field.selectedStrain) {
					dispatch('fetchVendors', { index });
				}
			});
		}
	}

	function deletePreset() {
		if (selectedPreset) {
			presets = presets.filter(p => p.name !== selectedPreset);
			localStorage.setItem('presets', JSON.stringify(presets));
			dispatch('presetDeleted');
		}
	}

	function handleSavePreset() {
		const presetName = prompt('Enter preset name:');
		if (presetName) {
			savePreset(presetName);
		}
	}

	function handleLoadPreset(event) {
		loadPreset(event.target.value);
	}

	function handleDeletePreset() {
		deletePreset();
		dispatch('presetDeleted');
	}
</script>

<div>
	<label for="presetSelect">Load Preset:</label>
	<select id="presetSelect" bind:value={selectedPreset} on:change={handleLoadPreset}>
		<option value="">Select a preset</option>
		{#each presets as preset}
			<option value={preset.name}>{preset.name}</option>
		{/each}
	</select>
</div>

<button on:click={handleSavePreset}>Save Preset</button>
{#if selectedPreset}
	<button on:click={handleDeletePreset}>Delete Preset</button>
{/if}
