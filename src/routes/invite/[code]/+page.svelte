<script lang="ts">
  import Topbar from "$lib/topbar.svelte";

  let { data } = $props();

  const inviterDisplayName = $derived(
    data.invitation.invitedBy.name || data.invitation.invitedBy.handle,
  );
</script>

<div class="container">
  <Topbar handle={data.handle} />

  <div class="invite-card">
    <div class="invite-header">
      <div class="avatar">
        {inviterDisplayName.charAt(0).toUpperCase()}
      </div>
      <div class="inviter-info">
        <h1>{inviterDisplayName}</h1>
        <p class="handle">@{data.invitation.invitedBy.handle}</p>
      </div>
    </div>

    <div class="recommendation-section">
      <h2>Invitation: {data.invitation.name}</h2>
      <div class="recommendation-text">
        <p>{data.invitation.recommendationText}</p>
      </div>
    </div>

    <div class="actions">
      {#if data.handle === data.invitation.invitedBy.handle}
        <div class="info-box">
          <p>
            This is your invitation link. Share it with someone you'd like to
            invite.
          </p>
          <code class="invite-url"
            >{typeof window !== "undefined"
              ? window.location.href
              : `/invite/${data.invitation.code}`}</code
          >
        </div>
      {:else if data.handle}
        {#if data.hasAlreadyRecommended}
          <div class="success-box">
            <p>You're already have recommendation from this user.</p>
            <a
              href="/profile/{data.invitation.invitedBy.handle}"
              class="button"
            >
              View {inviterDisplayName}'s Profile
            </a>
          </div>
        {:else}
          <form method="POST" action="?/accept">
            <p class="description">
              You're already a community member. Accept this recommendation from {inviterDisplayName}.
            </p>
            <button type="submit" class="button">Recommend Back</button>
          </form>
        {/if}
      {:else}
        <form method="POST" action="?/accept">
          <p class="description">
            {inviterDisplayName} has invited you to join the community with this recommendation.
          </p>
          <button type="submit" class="button button-primary">
            Join Community
          </button>
        </form>
      {/if}
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 700px;
    margin: 0 auto;
    padding: var(--space-4);
  }

  .invite-card {
    background: var(--color-card-bg, var(--color-bg-secondary));
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    margin-top: var(--space-8);
    border: 1px solid var(--color-border);
  }

  .invite-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
    padding-bottom: var(--space-6);
    border-bottom: 1px solid var(--color-border);
  }

  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--color-primary);
    color: var(--color-primary-text, white);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .inviter-info h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .handle {
    color: var(--color-muted);
    margin: var(--space-1) 0 0;
    font-size: 0.875rem;
  }

  .recommendation-section h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: var(--space-4);
    color: var(--color-text);
  }

  .recommendation-text {
    background: var(--color-bg);
    padding: var(--space-6);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--color-primary);
    margin-bottom: var(--space-6);
  }

  .recommendation-text p {
    margin: 0;
    line-height: 1.7;
    font-size: 1.0625rem;
    color: var(--color-text);
    white-space: pre-wrap;
  }

  .actions {
    margin-top: var(--space-6);
  }

  .description {
    color: var(--color-muted);
    margin-bottom: var(--space-4);
    line-height: 1.5;
  }

  .button {
    display: inline-block;
    background: var(--color-secondary-bg, var(--color-bg));
    color: var(--color-text);
    border: 1px solid var(--color-border);
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-md);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
  }

  .button:hover {
    background: var(--color-bg-hover, var(--color-bg-secondary));
  }

  .button-primary {
    background: var(--color-primary);
    color: var(--color-primary-text, white);
    border: none;
  }

  .button-primary:hover {
    opacity: 0.9;
  }

  .info-box {
    background: var(--color-info-bg, #dbeafe);
    border: 1px solid var(--color-info-border, #93c5fd);
    padding: var(--space-4);
    border-radius: var(--radius-md);
  }

  .info-box p {
    margin: 0 0 var(--space-3);
    color: var(--color-info-text, #1e40af);
  }

  .invite-url {
    display: block;
    background: var(--color-bg);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    font-family: monospace;
    font-size: 0.875rem;
    word-break: break-all;
  }

  .success-box {
    background: var(--color-success-bg, #dcfce7);
    border: 1px solid var(--color-success-border, #86efac);
    padding: var(--space-4);
    border-radius: var(--radius-md);
  }

  .success-box p {
    margin: 0 0 var(--space-3);
    color: var(--color-success-text, #166534);
  }
</style>

