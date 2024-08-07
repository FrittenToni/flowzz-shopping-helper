<script lang="ts">
	export let selectedStrains: { id: number; name: string; vendors: { name: string; price: number }[]; amount: number }[] = [];
  
	let priceComparisonData = [];
  
	function navigateToUrl(url: string) {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.update(tabs[0].id, { url });
		});
	}

	$: {
	  const vendorPrices = new Map();
  
	  // Check if any strain has no vendors
	  const anyStrainNoVendors = selectedStrains.some(strain => strain.vendors.length === 0);
  
	  if (selectedStrains.length > 0 && !anyStrainNoVendors) {
		for (const vendor of selectedStrains[0].vendors) {
		  vendorPrices.set(vendor.name, {
			name: vendor.name,
			website: vendor.website,
			prices: { [selectedStrains[0].name]: vendor.price },
			total: vendor.price * selectedStrains[0].amount,
			totalPrice: vendor.price,
			totalAmount: selectedStrains[0].amount
		  });
		}
  
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
  
		  for (const [vendorName, vendorData] of vendorPrices) {
			if (!vendorData.prices[strain.name]) {
			  vendorPrices.delete(vendorName);
			}
		  }
		}
  
		priceComparisonData = Array.from(vendorPrices.values());
  
		priceComparisonData.forEach(vendor => {
		  vendor.total = parseFloat(vendor.total.toFixed(2));
		  vendor.totalPrice = parseFloat(vendor.totalPrice.toFixed(2));
		});
		priceComparisonData.sort((a, b) => a.total - b.total);
	  } else {
		priceComparisonData = [];
	  }
	}
  </script>
  <h2>Vendors offering all strains</h2>
  {#if priceComparisonData.length > 0}
	
	<div class="table-container">
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
				<td>
				{#if vendor.website && (vendor.website.startsWith('http') || vendor.website.startsWith('www.'))}
                	<a href={vendor.website} on:click={(e) => { e.preventDefault(); navigateToUrl(vendor.website); }} class="vendorLink">{vendor.name}</a>
              	{:else}
                	{vendor.name}
              	{/if}
				</td>			  
				{#each selectedStrains as strain}
				<td>
				  {(vendor.prices[strain.name] * strain.amount).toFixed(2)}
				  {#if strain.amount > 1}
				    <br/>
					({strain.amount} x {vendor.prices[strain.name]})
				  {/if}
				</td>
			  {/each}
			  <td>
				{vendor.total.toFixed(2)}
				{#if selectedStrains.some(strain => strain.amount > 1)}
				  ({vendor.totalPrice.toFixed(2)})
				{/if}
			  </td>
			</tr>
		  {/each}
		</tbody>
	  </table>
	</div>
  {:else}
	<div class="no-vendors">
	  <p>No vendor available providing all selected strains.</p>
	</div>
  {/if}
  
  <style>
	h2 {
	  color: green;
	}
	.table-container {
	  margin-top: 1rem;
	  overflow-x: auto;
	}
	table {
	  width: 100%;
	  border-collapse: collapse;
	  background-color: var(--background-color);
	  color: var(--text-color);
	}
	th, td {
	  border: 1px solid #ddd;
	  padding: 8px;
	}
	th {
	  text-align: left;
	  min-width: 60px;
	}
	.no-vendors {
	  color: red;
	  margin-top: 1rem;
	  padding: 1rem;
	  border: 1px solid #ddd;
	  border-radius: 8px;
	  background-color: var(--background-color);
	  text-align: center;
	}

	.vendorLink {
      color: var(--link-color);
    }
  </style>
  