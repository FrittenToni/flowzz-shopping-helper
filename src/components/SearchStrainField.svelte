<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let field;
	export let index;
	export let cannabisStrains;

	const dispatch = createEventDispatcher();

	function handleInputChange(event) {
		dispatch('inputChange', { index, value: event.target.value });
	}

	function handleAmountChange(event) {
		let amount = parseFloat(event.target.value);
		if (isNaN(amount) || amount < 1) {
			amount = 1;
		}
		dispatch('amountChange', { index, amount });
	}

	function handleRemoveField() {
		dispatch('removeField', { index });
	}
</script>

<div>
	<input
		list="strains"
		id={"strainInput" + field.id}
		placeholder="Enter strain name"
		bind:value={field.inputValue}
		on:input={handleInputChange}
		class="strain-input"
	/>
	<datalist id="strains">
		{#each cannabisStrains as strain}
			<option value={strain.name}>{strain.name}</option>
		{/each}
	</datalist>

	<input
		type="number"
		min="1"
		id={"amountInput" + field.id}
		placeholder="Amount"
		bind:value={field.amount}
		on:input={handleAmountChange}
		class="amount-input"
	/>

	<button on:click={handleRemoveField}>-</button>
	
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
						{#if field.amount > 1}
							<th>Total Amount</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#each field.vendors as vendor}
						<tr>
							<td>{vendor.name}</td>
							<td>{vendor.price}</td>
							{#if field.amount > 1}
								<td>{(vendor.price * field.amount).toFixed(2)}</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	{/if}
</div>

<style>
	.strain-input {
		margin-top: 1rem;
		padding: 0.5rem;
		font-size: 1.25rem;
		width: 400px;
	}
	.amount-input {
		margin-top: 1rem;
		padding: 0.5rem;
		font-size: 1.25rem;
		width: 50px; /* Fixed width to fit up to 3 digits */
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
		padding: 0.5rem;
		font-size: 1.25rem;
		cursor: pointer;
	}
</style>
