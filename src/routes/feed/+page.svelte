<script lang="ts">
  import Topbar from "$lib/topbar.svelte";

  let { data } = $props();

  function formatDate(dateString: string | undefined): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
</script>

<div class="container">
  <Topbar handle={data.handle} />

  <div class="recommendations-list">
    {#each data.recommendations as rec}
      <article>
        <div>
          <a
            href="/profile/{rec.subject_handle}#recommendation-{rec.id}"
            class="link"
          >
            {rec.subject_name || rec.subject_handle}
          </a>
          {#if rec.invitation_id}
            <span class="subtle">joined by invitation from</span>
          {:else}
            <span class="subtle">was recommended by</span>
          {/if}
          <a href="/profile/{rec.author_handle}" class="link">
            {rec.author_name || rec.author_handle}
          </a>
        </div>
        <div class="subtle">
          {formatDate(rec.created_at)}
        </div>
      </article>
    {/each}
  </div>
</div>

<style>
  .recommendations-list {
    display: grid;
    gap: var(--space-4);
    margin: var(--space-6) 0;
  }
</style>
