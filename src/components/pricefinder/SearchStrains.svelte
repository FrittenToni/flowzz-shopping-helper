<script lang="ts">
	import { onMount } from "svelte";
	import { fetchVendorsForStrain } from "$lib/syncStrains.ts";
	import SearchStrainField from "./SearchStrainField.svelte";
	import PresetManager from "./PresetManager.svelte";
	import PriceComparison from "./PriceComparison.svelte";

	export let cannabisStrains: { id: number; name: string }[] = [];
	export let strainCount = 0;

	type SearchField = {
		id: number;
		inputValue: string;
		selectedStrain: { id: number; name: string } | null;
		vendors: { name: string; price: number }[];
		loadingVendors: boolean;
		noVendors: boolean;
		amount: number;
	};

	let searchFields: SearchField[] = [
		{
			id: 1,
			inputValue: "",
			selectedStrain: null,
			vendors: [],
			loadingVendors: false,
			noVendors: false,
			amount: 1,
		},
	];
	let nextId = 2;

	let presets = JSON.parse(localStorage.getItem("presets") || "[]");
	let selectedPreset = "";

	let presetManager;

	function saveState() {
		localStorage.setItem("searchFields", JSON.stringify(searchFields));
		localStorage.setItem("nextId", JSON.stringify(nextId));
		localStorage.setItem("selectedPreset", selectedPreset);
	}

	function loadState() {
		const savedSearchFields = localStorage.getItem("searchFields");
		const savedNextId = localStorage.getItem("nextId");
		const savedSelectedPreset = localStorage.getItem("selectedPreset");

		if (savedSearchFields) {
			searchFields = JSON.parse(savedSearchFields);
		}

		if (savedNextId) {
			nextId = JSON.parse(savedNextId);
		}

		if (savedSelectedPreset) {
			selectedPreset = savedSelectedPreset;
		}
	}

	function updateSearchFields(fields) {
		searchFields = fields;
		saveState();
	}

	function setNextId(id) {
		nextId = id;
		saveState();
	}

	onMount(() => {
		loadState();
	});

	function addSearchField() {
		searchFields = [
			...searchFields,
			{
				id: nextId++,
				inputValue: "",
				selectedStrain: null,
				vendors: [],
				loadingVendors: false,
				noVendors: false,
				amount: 1,
			},
		];
		saveState();
	}

	function removeSearchField(event) {
		const index = event.detail.index;
		if (searchFields.length > 1) {
			searchFields = [
				...searchFields.slice(0, index),
				...searchFields.slice(index + 1),
			];
			saveState();
		}
	}

	function clearSearchFields() {
		searchFields = [
			{
				id: 1,
				inputValue: "",
				selectedStrain: null,
				vendors: [],
				loadingVendors: false,
				noVendors: false,
				amount: 1,
			},
		];
		nextId = 2;
		saveState();
	}

	async function handleInputChange(event) {
		const index = event.detail.index;
		const value = event.detail.value;
		const field = { ...searchFields[index] };
		field.inputValue = value;
		const selected = cannabisStrains.find(
			(strain) => strain.name.toLowerCase() === value.toLowerCase(),
		);
		if (
			selected &&
			(!field.selectedStrain || field.selectedStrain.id !== selected.id)
		) {
			field.selectedStrain = selected;
			field.loadingVendors = true;
			searchFields = [
				...searchFields.slice(0, index),
				field,
				...searchFields.slice(index + 1),
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
				...searchFields.slice(index + 1),
			];
			saveState();
		}
	}

	async function handleAmountChange(event) {
		const index = event.detail.index;
		const amount = event.detail.amount;
		const field = { ...searchFields[index] };
		field.amount = amount;
		searchFields = [
			...searchFields.slice(0, index),
			field,
			...searchFields.slice(index + 1),
		];
		saveState();
	}

	async function fetchVendors(index: number): Promise<void> {
		const field = { ...searchFields[index] };
		if (field.selectedStrain) {
			const data = await fetchVendorsForStrain(field.selectedStrain.id);
			if (data && !data.error) {
				const vendorData = data.message.data.priceFlowers.data.filter(
					(vendor: any) =>
						vendor.attributes.availibility === 1 ||
						vendor.attributes.availibility === 2,
				);
				if (vendorData.length > 0) {
					field.vendors = vendorData
						.map((vendor: any) => ({
							name: vendor.attributes.vendor.data.attributes.name,
							price: vendor.attributes.price,
							website: vendor.attributes.vendor.data.attributes.website
						}))
						.sort((a, b) => a.price - b.price);
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
				...searchFields.slice(index + 1),
			];
			saveState();
		}
	}

	$: if (strainCount === 0) {
		clearSearchFields();
	}

	$: selectedStrains = searchFields
		.filter((field) => field.selectedStrain)
		.map((field) => ({
			id: field.selectedStrain.id,
			name: field.selectedStrain.name,
			vendors: field.vendors,
			amount: field.amount,
		}));
</script>

<main>
	<PresetManager
		bind:this={presetManager}
		{presets}
		{selectedPreset}
		{searchFields}
		{nextId}
		{updateSearchFields}
		{setNextId}
		on:presetLoaded={(event) => {
			searchFields = event.detail.fields;
			nextId = event.detail.nextId;
			saveState();
		}}
		on:presetDeleted={() => {
			clearSearchFields();
			selectedPreset = "";
			saveState();
		}}
		on:fetchVendors={(event) => {
			const { index } = event.detail;
			fetchVendors(index);
		}}
	/>

	{#each searchFields as field, index (field.id)}
		<SearchStrainField
			{field}
			{index}
			{cannabisStrains}
			{searchFields}
			on:inputChange={handleInputChange}
			on:amountChange={handleAmountChange}
			on:removeField={removeSearchField}
		/>
	{/each}

	<br/>
	<div id="buttonContainer">
		{#if searchFields.some((field) => field.selectedStrain)}
			<button class="styled-button" on:click={addSearchField}>+</button>
			<button
				class="styled-button"
				on:click={() => presetManager.handleSavePreset()}
				>Save Preset</button
			>
		{/if}
		{#if searchFields.length > 1}
			<button
				class="styled-button resetButton"
				on:click={clearSearchFields}>Reset</button
			>
		{/if}
	</div>

	{#if selectedStrains.length > 1}
		<PriceComparison {selectedStrains} />
	{/if}
</main>

<style>
	h2 {
		color: green;
	}
	main {
		text-align: center;
		padding: 1rem;
		width: 600px;
		color: black;
	}

	#buttonContainer {
		padding: 10px;
	}

	.styled-button {
		background-color: var(--button-inactive-color);
		border: var(--button-border);
		color: white;
		padding: 10px 20px;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
		margin-bottom: 10px;
	}

	.styled-button:hover {
		background-color: var(--button-active-color);
	}
	
	.resetButton {
		background-color: red;
	}


</style>
