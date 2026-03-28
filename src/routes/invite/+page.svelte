<script lang="ts">
  import { page } from "$app/state";
import Topbar from "$lib/topbar.svelte";

  let { data, form } = $props();

  let name = $state("");
  let recommendationText = $state("");
  let charCount = $derived(recommendationText.length);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
</script>

<div class="container">
  <Topbar handle={data.handle} />

  <div class="content">
    <h1>Create Invitation</h1>
    <p class="description">
      Invite someone to join the community with a personal recommendation.
    </p>

    <form method="POST" class="invite-form" action="?/create">
      <div class="form-group">
        <label for="name">Invitation Name</label>
        <input
          type="text"
          id="name"
          name="name"
          bind:value={name}
          placeholder="e.g., My colleague from Meta"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="recommendation_text">
          Recommendation
          <span class="char-count">
            {charCount}/200
          </span>
        </label>
        <textarea
          id="recommendation_text"
          name="recommendation_text"
          bind:value={recommendationText}
          placeholder="Write a recommendation letter for recruiters..."
          rows="6"
          minlength="200"
          required
          class="form-input"
        ></textarea>
      </div>

      {#if form?.error}
        <div class="error-message">{form.error}</div>
      {/if}

      <button type="submit" class="button"> Generate Invite Link </button>
    </form>

    {#if form?.success && form.inviteUrl}
      <div class="success-section">
        <h2>Invitation Created!</h2>
        <p>Share this link with your invitee:</p>
        <div class="invite-link">
          <code>{page.url.origin}{form.inviteUrl}</code>
          <button
            type="button"
            class="button-small"
            onclick={() => copyToClipboard(`${page.url.origin}${form.inviteUrl}`)}
          >
            Copy
          </button>
        </div>
      </div>
    {/if}

    {#if data.invitations.length > 0}
      <div class="invitations-list">
        <h2>Your Invitations</h2>
        <div class="list">
          {#each data.invitations as invitation}
            <div class="invitation-card">
              <div class="invitation-header">
                <h3>{invitation.name}</h3>
                <span class="usage-badge">
                  {invitation.used_count}/{invitation.max_uses} used
                </span>
              </div>
              <p class="recommendation-preview">
                {invitation.recommendation_text.slice(0, 100)}...
              </p>
              <div class="invitation-actions">
                <code class="code">{page.url.origin}/invite/{invitation.code}</code>
                <button
                  type="button"
                  class="button-small"
                  onclick={() =>
                    copyToClipboard(
                      `${page.url.origin}/invite/${invitation.code}`,
                    )}
                >
                  Copy Link
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-4);
  }

  .content {
    margin-top: var(--space-8);
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: var(--space-2);
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: var(--space-4);
  }

  h3 {
    font-size: 1rem;
    font-weight: 600;
  }

  .description {
    color: var(--color-muted);
    margin-bottom: var(--space-6);
  }

  .invite-form {
    background: var(--color-card-bg, var(--color-bg-secondary));
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-8);
  }

  .form-group {
    margin-bottom: var(--space-4);
  }

  label {
    display: block;
    font-weight: 500;
    margin-bottom: var(--space-2);
  }

  .char-count {
    float: right;
    font-weight: normal;
    color: var(--color-muted);
    font-size: 0.875rem;
  }

  .form-input {
    width: 100%;
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 1rem;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .button {
    background: var(--color-primary);
    color: var(--color-primary-text, white);
    border: none;
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-md);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .button:hover:not(:disabled) {
    opacity: 0.9;
  }

  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .button-small {
    background: var(--color-secondary-bg, var(--color-bg-secondary));
    color: var(--color-text);
    border: 1px solid var(--color-border);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    cursor: pointer;
  }

  .error-message {
    background: var(--color-danger-bg, #fee2e2);
    color: var(--color-danger, #991b1b);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
  }

  .success-section {
    background: var(--color-success-bg, #dcfce7);
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-8);
  }

  .invite-link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    background: var(--color-bg);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    margin-top: var(--space-3);
  }

  .invite-link code {
    flex: 1;
    font-family: monospace;
    font-size: 0.875rem;
  }

  .invitations-list {
    margin-top: var(--space-8);
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .invitation-card {
    background: var(--color-card-bg, var(--color-bg-secondary));
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .invitation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }

  .usage-badge {
    font-size: 0.75rem;
    padding: var(--space-1) var(--space-2);
    background: var(--color-badge-bg, var(--color-bg));
    border-radius: var(--radius-sm);
  }

  .recommendation-preview {
    color: var(--color-muted);
    font-size: 0.875rem;
    margin-bottom: var(--space-3);
  }

  .invitation-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .code {
    flex: 1;
    font-family: monospace;
    font-size: 0.75rem;
    color: var(--color-muted);
  }
</style>
