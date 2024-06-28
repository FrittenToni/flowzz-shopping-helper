<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let strainId;
    export let ratings;
  
    const dispatch = createEventDispatcher();
  
    function handleClose() {
      dispatch('close', { strainId });
    }
  </script>
  
  {#if ratings === 'loading'}
    <div>Loading...</div>
  {:else if ratings === 'No ratings found.'}
    <div>No ratings found.</div>
  {:else}
    <div>
      <h3><a class="clickable" on:click={(e) => { e.preventDefault(); handleClose(); }}>Close</a></h3>
      {#each ratings as rating}
        <div class="rating">
          <p><strong>{rating.author.username}</strong> ({rating.score}/5)</p>
          <p>{rating.comment.content}</p>
        </div>
      {/each}
    </div>
  {/if}
  
  <style>
    .clickable {
      cursor: pointer;
      color: var(--link-color);
      text-decoration: underline;
    }
    .rating {
      border-bottom: 1px solid #ddd;
      margin-bottom: 10px;
      padding-bottom: 10px;
    }
  </style>
  