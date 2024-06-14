<script lang="ts">
	export let selectedStrains: { id: number; name: string; vendors: { name: string; price: number }[]; amount: number }[] = [];

	let priceComparisonData = [];

	$: {
		// Create a map to accumulate vendor prices
		const vendorPrices = new Map();

		// Initialize vendor map with all vendors for the first strain
		if (selectedStrains.length > 0) {
			for (const vendor of selectedStrains[0].vendors) {
				vendorPrices.set(vendor.name, {
					name: vendor.name,
					prices: { [selectedStrains[0].name]: vendor.price },
					total: vendor.price * selectedStrains[0].amount,
					totalPrice: vendor.price,
					totalAmount: selectedStrains[0].amount
				});
			}

			// Iterate over remaining strains and update the vendor prices map
			for (let i = 1; i < selectedStrains.length; i++) {
				const strain = selectedStrains[i];
				for (const vendor of strain.vendors) {
					if (vendorPrices.has(vendor.name)) {
						const vendorData = vendorPrices.get(vendor.name);
						vendorData.prices[strain.name] = vendor.price;
						vendorData.total += vendor.price * strain.amount;
						vendorData.totalPrice += vendor.price;
						vendorData.totalAmount += strain.amount;
					}
				}

				// Remove vendors that do not sell the current strain
				for (const [vendorName, vendorData] of vendorPrices) {
					if (!vendorData.prices[strain.name]) {
						vendorPrices.delete(vendorName);
					}
				}
			}

			// Convert the map to an array
			priceComparisonData = Array.from(vendorPrices.values());

			// Sort by total price ascending and round total to 2 decimal places
			priceComparisonData.forEach(vendor => {
				vendor.total = parseFloat(vendor.total.toFixed(2));
				vendor.totalPrice = parseFloat(vendor.totalPrice.toFixed(2));
			});
			priceComparisonData.sort((a, b) => a.total - b.total);
		}
	}
</script>

{#if priceComparisonData.length > 0}
	<h2>Vendors offering all strains:</h2>
	<table>
		<thead>
			<tr>
				<th>Vendor</th>
				{#each selectedStrains as strain}
					<th>{strain.name}</th>
				{/each}
				<th>Total</th>
			</tr>
		</thead>
		<tbody>
			{#each priceComparisonData as vendor}
				<tr>
					<td>{vendor.name}</td>
					{#each selectedStrains as strain}
						<td>{(vendor.prices[strain.name] * strain.amount).toFixed(2)} ({vendor.prices[strain.name]})</td>
					{/each}
					<td>{vendor.total.toFixed(2)} ({vendor.totalPrice.toFixed(2)})</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p>No vendor available providing all selected strains :(</p>
{/if}

<style>
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
