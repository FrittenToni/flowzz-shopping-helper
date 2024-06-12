<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchCsrfToken } from '$lib/syncStrains.ts';
	import PriceComparison from './PriceComparison.svelte';

	export let cannabisStrains: { id: number; name: string }[] = [];
	export let strainCount = 0;

	type SearchField = {
		id: number;
		inputValue: string;
		selectedStrain: { id: number; name: string } | null;
		vendors: { name: string; price: number }[];
		loadingVendors: boolean;
		noVendors: boolean;
	};

	let searchFields: SearchField[] = [
		{ id: 1, inputValue: '', selectedStrain: null, vendors: [], loadingVendors: false, noVendors: false }
	];
	let nextId = 2;

	let presets = JSON.parse(localStorage.getItem('presets') || '[]');
	let selectedPreset = '';

	// Function to save the state to localStorage
	function saveState() {
		localStorage.setItem('searchFields', JSON.stringify(searchFields));
		localStorage.setItem('nextId', JSON.stringify(nextId));
	}

	// Function to load the state from localStorage
	function loadState() {
		const savedSearchFields = localStorage.getItem('searchFields');
		const savedNextId = localStorage.getItem('nextId');

		if (savedSearchFields) {
			searchFields = JSON.parse(savedSearchFields);
		}

		if (savedNextId) {
			nextId = JSON.parse(savedNextId);
		}
	}

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
			searchFields = preset.fields.map(field => ({
				...field,
				loadingVendors: true, // Set loading to true to fetch the latest vendor data
				vendors: [], // Clear cached vendors
				noVendors: false // Reset no vendors flag
			}));
			nextId = Math.max(...searchFields.map(f => f.id)) + 1;
			selectedPreset = presetName;
			saveState();

			searchFields.forEach((field, index) => {
				if (field.selectedStrain) {
					fetchVendors(index); // Directly call fetchVendors instead of handleInputChange
				}
			});
		}
	}

	function deletePreset() {
		if (selectedPreset) {
			presets = presets.filter(p => p.name !== selectedPreset);
			localStorage.setItem('presets', JSON.stringify(presets));
			selectedPreset = '';
		}
	}

	onMount(() => {
		loadState();
	});

	function addSearchField() {
		searchFields = [
			...searchFields,
			{ id: nextId++, inputValue: '', selectedStrain: null, vendors: [], loadingVendors: false, noVendors: false }
		];
		saveState();
	}

	function removeSearchField(index: number) {
		if (searchFields.length > 1) {
			searchFields = [
				...searchFields.slice(0, index),
				...searchFields.slice(index + 1)
			];
			saveState();
		}
	}

	function clearSearchFields() {
		searchFields = [
			{ id: 1, inputValue: '', selectedStrain: null, vendors: [], loadingVendors: false, noVendors: false }
		];
		nextId = 2;
		saveState();
	}

	async function handleInputChange(index: number, value: string): Promise<void> {
		const field = { ...searchFields[index] };
		field.inputValue = value;
		const selected = cannabisStrains.find((strain) => strain.name.toLowerCase() === value.toLowerCase());
		if (selected && (!field.selectedStrain || field.selectedStrain.id !== selected.id)) {
			field.selectedStrain = selected;
			field.loadingVendors = true;
			searchFields = [
				...searchFields.slice(0, index),
				field,
				...searchFields.slice(index + 1)
			];
			saveState();
			await fetchVendors(index);
		} else if (!selected) {
			field.selectedStrain = null;
			field.vendors = [];
			field.loadingVendors = false;
			field.noVendors = false;
			searchFields = [
				...searchFields.slice(0, index),
				field,
				...searchFields.slice(index + 1)
			];
			saveState();
		}
	}

	async function fetchVendors(index: number): Promise<void> {
		const field = { ...searchFields[index] };
		if (field.selectedStrain) {
			const data = await fetchCsrfToken(field.selectedStrain.id);
			if (data && !data.error) {
				const vendorData = data.message.data.priceFlowers.data.filter(
					(vendor: any) => vendor.attributes.availibility === 1 || vendor.attributes.availibility === 2
				);
				if (vendorData.length > 0) {
					field.vendors = vendorData.map((vendor: any) => ({
						name: vendor.attributes.vendor.data.attributes.name,
						price: vendor.attributes.price
					})).sort((a, b) => a.price - b.price);
					field.noVendors = false;
				} else {
					field.vendors = [];
					field.noVendors = true;
				}
			} else {
				field.vendors = [];
				field.noVendors = true;
			}
			field.loadingVendors = false;
			searchFields = [
				...searchFields.slice(0, index),
				field,
				...searchFields.slice(index + 1)
			];
			saveState();
		}
	}

	$: if (strainCount === 0) {
		clearSearchFields();
	}

	$: selectedStrains = searchFields
		.filter(field => field.selectedStrain && field.vendors.length > 0)
		.map(field => ({
			id: field.selectedStrain.id,
			name: field.selectedStrain.name,
			vendors: field.vendors
		}));
</script>

<main>
	<div>
		<label for="presetSelect">Load Preset:</label>
		<select id="presetSelect" bind:value={selectedPreset} on:change={(e) => loadPreset(e.target.value)}>
			<option value="">Select a preset</option>
			{#each presets as preset}
				<option value={preset.name}>{preset.name}</option>
			{/each}
		</select>
	</div>

	{#each searchFields as field, index (field.id)}
		<div>
			<input
				list="strains"
				id={"strainInput" + field.id}
				placeholder="Enter strain name"
				bind:value={field.inputValue}
				on:input={(e) => handleInputChange(index, e.target.value)}
			/>
			<datalist id="strains">
				{#each cannabisStrains as strain}
					<option value={strain.name}>{strain.name}</option>
				{/each}
			</datalist>
			<button on:click={() => removeSearchField(index)}>-</button>
			{#if field.loadingVendors}
				<p>Loading...</p>
			{:else if field.selectedStrain}
				{#if field.noVendors}
					<p>No Vendors found.</p>
				{:else if field.vendors.length > 0}
					<table>
						<thead>
							<tr>
								<th>Vendor</th>
								<th>Price</th>
							</tr>
						</thead>
						<tbody>
							{#each field.vendors as vendor}
								<tr>
									<td>{vendor.name}</td>
									<td>{vendor.price}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			{/if}
		</div>
	{/each}

	<div>
		<button on:click={addSearchField}>+</button>
		<button on:click={clearSearchFields}>Reset</button>
		<button on:click={() => savePreset(prompt('Enter preset name:'))}>Save Preset</button>
		{#if selectedPreset}
			<button on:click={deletePreset}>Delete Preset</button>
		{/if}
	</div>

	{#if selectedStrains.length > 1}
		<PriceComparison {selectedStrains} />
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1rem;
		width: 600px;
	}
	input {
		margin-top: 1rem;
		padding: 0.5rem;
		font-size: 1rem;
		width: 400px;
	}
	table {
		margin-top: 1rem;
		width: 100%;
		border-collapse: collapse;
	}
	th, td {
		border: 1px solid #ddd;
		padding: 8px;
	}
	th {
		background-color: #f2f2f2;
		text-align: left;
	}
	button {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
	}
</style>
