<script lang="ts">
  import { page } from "$app/state";
  import Topbar from "$lib/topbar.svelte";

  let { data } = $props();

  const inviterDisplayName = $derived(
    data.invitation.invitedBy.name || data.invitation.invitedBy.handle,
  );
</script>

<div class="container">
  <Topbar handle={data.handle} />

  <div class="card-lg">
    <div class="invite-header">
      <div class="avatar">
        {inviterDisplayName.charAt(0).toUpperCase()}
      </div>
      <div class="inviter-info">
        <h1 class="heading-2">{inviterDisplayName}</h1>
        <p class="handle">@{data.invitation.invitedBy.handle}</p>
      </div>
    </div>

    <div class="recommendation-section">
      <h2 class="heading-3">Invitation: {data.invitation.name}</h2>
      <div class="recommendation-quote">
        <p>{data.invitation.recommendationText}</p>
      </div>
    </div>

    {#if data.handle === data.invitation.invitedBy.handle}
      <div class="alert alert-info">
        <p>
          This is your invitation link. Share it with someone you'd like to
          invite.
        </p>
        <code class="invite-url">
          {`${page.url.origin}/invite/${data.invitation.code}`}
        </code>
      </div>
    {:else if data.handle}
      {#if data.hasAlreadyRecommended}
        <div class="alert alert-success">
          <p>You're already have recommendation from this user.</p>
          <a href="/profile/{data.invitation.invitedBy.handle}" class="button">
            View {inviterDisplayName}'s Profile
          </a>
        </div>
      {:else}
        <form method="POST" action="?/accept">
          <p class="subtle">
            You're already a community member. Accept this recommendation from {inviterDisplayName}.
          </p>
          <button type="submit" class="button">Recommend Back</button>
        </form>
      {/if}
    {:else}
      <form method="POST" action="?/accept">
        <p class="subtle">
          {inviterDisplayName} has invited you to join the community with this recommendation.
        </p>
        <button type="submit" class="button button-primary">
          Join Community
        </button>
      </form>
    {/if}
  </div>
</div>

<style>
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
    color: var(--color-text);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }

  .inviter-info h1 {
    margin: 0;
  }

  .handle {
    color: var(--color-text-tertiary);
    margin: var(--space-1) 0 0;
    font-size: var(--font-size-sm);
  }

  .recommendation-section h2 {
    margin-bottom: var(--space-4);
  }

  .recommendation-quote {
    background: var(--color-bg);
    padding: var(--space-6);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--color-primary);
    margin-bottom: var(--space-6);
  }

  .recommendation-quote p {
    margin: 0;
    line-height: var(--line-height-relaxed);
    font-size: var(--font-size-lg);
    color: var(--color-text);
    white-space: pre-wrap;
  }

  .invite-url {
    display: block;
    background: var(--color-bg-elevated);
    color: var(--color-text);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    word-break: break-all;
    margin-top: var(--space-3);
  }
</style>
