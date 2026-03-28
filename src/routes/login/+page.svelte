<script lang="ts">
  let handle = $state("");
  let error = $state("");

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!handle.trim()) {
      error = "Please enter your handle";
      return;
    }
    // Redirect to the auth API endpoint with handle
    const searchParams = new URLSearchParams();
    searchParams.set("handle", handle.trim());
    window.location.href = `/auth/login?${searchParams.toString()}`;
  }
</script>

<div class="centered-container">
  <div class="card">
    <div class="card-header">
      <h1 class="heading-1">Connect to Atmosphere</h1>
      <p class="subtle">
        Enter your Bluesky handle to connect your CV to the Atmosphere.
      </p>
    </div>

    <form onsubmit={handleSubmit} class="form-stack">
      <div class="form-group">
        <label for="handle" class="form-label">Your Handle</label>
        <input
          type="text"
          id="handle"
          name="handle"
          bind:value={handle}
          placeholder="your-handle.bsky.social"
          class="form-input"
          autocomplete="username"
        />
      </div>

      {#if error}
        <p class="alert alert-error">{error}</p>
      {/if}

      <button type="submit" class="button button-primary">Connect</button>
    </form>

    <div class="card-footer">
      <a href="/" class="link">← Back to CV Editor</a>
    </div>
  </div>
</div>

<style>
  .card-footer {
    margin-top: var(--space-6);
    text-align: center;
  }
</style>
