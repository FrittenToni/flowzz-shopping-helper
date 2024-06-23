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
			selectedPreset = ''; // Clear the selected preset after deletion
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

	$: isStrainChosen = searchFields.some(field => field.selectedStrain);
</script>

<div>
	{#if presets.length > 0}
		<select id="presetSelect" bind:value={selectedPreset} on:change={handleLoadPreset}>
			<option value="">Select a preset</option>
			{#each presets as preset}
				<option value={preset.name}>{preset.name}</option>
			{/each}
		</select>
	{/if}
</div>
<p>
{#if isStrainChosen}
	<button class="styled-button" on:click={handleSavePreset}>Save Preset</button>
{/if}
{#if selectedPreset && presets.length > 0}
	<button class="styled-button" on:click={handleDeletePreset}>Delete Preset</button>
{/if}
</p>

<style>
	#presetSelect {
		padding: 10px;
		font-size: 16px;
		width: 250px;
	}

	.styled-button {
		background-color: gray;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
		margin-bottom: 10px;
	}

	.styled-button:hover {
		background-color: black;
	}
</style>
