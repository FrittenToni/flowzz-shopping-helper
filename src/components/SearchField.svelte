<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let field;
	export let index;
	export let cannabisStrains;

	const dispatch = createEventDispatcher();

	function handleInputChange(event) {
		dispatch('inputChange', { index, value: event.target.value });
	}
</script>

<div>
	<input
		list="strains"
		id={"strainInput" + field.id}
		placeholder="Enter strain name"
		bind:value={field.inputValue}
		on:input={handleInputChange}
	/>
	<datalist id="strains">
		{#each cannabisStrains as strain}
			<option value={strain.name}>{strain.name}</option>
		{/each}
	</datalist>
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

<style>
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
</style>
