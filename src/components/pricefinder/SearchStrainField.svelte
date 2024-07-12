<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { formatStrainName } from "$components/utils"; // Adjust the import path as necessary

  export let field;
  export let index;
  export let cannabisStrains;
  export let searchFields;

  const dispatch = createEventDispatcher();

  function handleInputChange(event) {
    dispatch("inputChange", { index, value: event.target.value });
  }

  function handleAmountChange(event) {
    let amount = parseFloat(event.target.value);
    if (isNaN(amount) || amount < 1) {
      amount = 1;
    }
    dispatch("amountChange", { index, amount });
  }

  function handleRemoveField() {
    dispatch("removeField", { index });
  }

  function navigateToUrl(url: string) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.update(tabs[0].id, { url });
    });
  }

  $: selectedStrainDetails = cannabisStrains.find(
    (strain) => strain.name.toLowerCase() === field.inputValue.toLowerCase(),
  );

  $: formattedStrainName = selectedStrainDetails
    ? formatStrainName(selectedStrainDetails.strain_name)
    : "";
</script>

<div class="input-group">
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

  {#if searchFields.length > 1}
    <button class="remove-button" on:click={handleRemoveField}>-</button>
  {/if}
</div>

{#if selectedStrainDetails}
  <div class="strain-details">
    <div class="strain-links">
      <a
        href={"https://flowzz.com/product/" + selectedStrainDetails.url}
        on:click={(e) => {
          e.preventDefault();
          navigateToUrl(
            "https://flowzz.com/product/" + selectedStrainDetails.url,
          );
        }}
      >
        {selectedStrainDetails.name}
      </a>
      <a
        href={"https://flowzz.com/strain/" + formattedStrainName}
        on:click={(e) => {
          e.preventDefault();
          navigateToUrl("https://flowzz.com/strain/" + formattedStrainName);
        }}
      >
        ({formattedStrainName})
      </a>
    </div>
    <div class="strain-info">
      <p>
        Genetic: {selectedStrainDetails.genetic} THC: {selectedStrainDetails.thc}%
        CBD: {selectedStrainDetails.cbd}% Rating: {selectedStrainDetails.ratings_score ??
          0} ({selectedStrainDetails.ratings_count ?? 0} reviews)
      </p>
    </div>
  </div>
{/if}

{#if field.loadingVendors}
  <p>Loading...</p>
{:else if field.selectedStrain}
  {#if field.noVendors}
    <div class="no-vendors">
      <p>No vendor available providing selected strain.</p>
    </div>
  {:else if field.vendors.length > 0}
    <table>
      <thead>
        <tr>
          <th>Vendor</th>
          <th>Price</th>
          {#if field.amount > 1}
            <th>Total</th>
          {/if}
        </tr>
      </thead>
      <tbody>
        {#each field.vendors as vendor}
          <tr>
            <td>
              {#if vendor.website && (vendor.website.startsWith('http') || vendor.website.startsWith('www.'))}
                <a href={vendor.website} on:click={(e) => { e.preventDefault(); navigateToUrl(vendor.website); }} class="vendorLink">{vendor.name}</a>
              {:else}
                {vendor.name}
              {/if}
            </td>
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

<style>
  .input-group {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }
  .strain-input {
    margin-top: 1rem;
    padding: 0.5rem;
    font-size: 1.25rem;
    width: 100%;
  }
  .amount-input {
    margin-top: 1rem;
    padding: 0.5rem;
    font-size: 1.25rem;
    width: 50px; /* Fixed width to fit up to 3 digits */
    margin-left: 10px;
  }
  .strain-details {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: var(--background-color);
    color: var(--text-color);
  }
  .strain-links a {
    display: inline-block;
    color: var(--link-color);
    text-decoration: underline;
  }
  .strain-info p {
    margin: 5px 0;
  }
  table {
    margin-top: 1rem;
    width: 100%;
    border-collapse: collapse;
    background-color: var(--background-color);
    color: var(--text-color);
  }
  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  th {
    text-align: left;
  }
  .remove-button {
    background-color: red;
    border: var(--button-border);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin: 26px 0px 10px 10px;
  }
  .remove-button:hover {
    background-color: var(--button-active-color);
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
