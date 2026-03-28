<script lang="ts">
  import { parseResume, type Resume } from "$lib/cv-parser";
  import Topbar from "$lib/topbar.svelte";
  import Editor from "../../../editor.svelte";
  import Print from "../../../print.svelte";

  let { data } = $props();

  let resume = $state<Resume>(data.resume);
  let isSaving = $state(false);
  let saveMessage = $state("");
  let autofillText = $state("");

  async function handleSave() {
    if (!data.isOwnProfile) return;

    isSaving = true;
    saveMessage = "";

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });

      if (!response.ok) {
        const error = await response.json();
        saveMessage = error.error || "Failed to save profile";
      }
    } catch (e) {
      saveMessage = "Failed to save profile";
    } finally {
      isSaving = false;
    }
  }

  function handleExtract() {
    if (!autofillText.trim()) {
      return;
    }
    resume = parseResume(autofillText);
    autofillText = "";
    handleSave();
    // Dialog will auto-close due to method=dialog on the form
  }
</script>

<div class="container">
  <Topbar handle={data.handle} />

  <div class="profile-actions">
    {#if data.isOwnProfile}
      <button
        type="button"
        class="button"
        commandfor="app-autofill-dialog"
        command="show-modal"
      >
        Autofill
      </button>
      <a href="/invite" class="button">Invite</a>
    {/if}
    <button type="button" class="button" onclick={() => window.print()}>
      Print
    </button>
  </div>

  {#if saveMessage}
    <div
      class="save-message"
      class:success={!saveMessage.includes("Failed")}
      class:error={saveMessage.includes("Failed")}
    >
      {saveMessage}
    </div>
  {/if}

  <Editor bind:resume onSave={handleSave} />

  <!-- Recommendations Section -->
  {#if data.inviter || data.recommendations.length > 0}
    <div class="recommendations-section">
      <h2 class="recommendations-title">Community Recommendations</h2>

      {#if data.inviter}
        <div class="inviter-info">
          <span class="badge">Invited by</span>
          <a href="/profile/{data.inviter.handle}" class="inviter-link">
            {data.inviter.name || data.inviter.handle}
          </a>
        </div>
      {/if}

      {#if data.recommendations.length > 0}
        <div class="recommendations-list">
          {#each data.recommendations as rec}
            <div
              class="recommendation-card"
              class:from-invite={rec.isFromInvite}
            >
              <div class="recommendation-header">
                <a href="/profile/{rec.authorHandle}" class="author-link">
                  {rec.authorName || rec.authorHandle}
                </a>
                {#if rec.isFromInvite}
                  <span class="badge invite-badge">Invitation</span>
                {/if}
              </div>
              <p class="recommendation-text">{rec.text}</p>
              <time class="recommendation-date" datetime={rec.createdAt}>
                {new Date(rec.createdAt ?? 0).toLocaleDateString()}
              </time>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<dialog id="app-autofill-dialog" closedby="any" class="dialog">
  <form method="dialog" class="dialog-content" onsubmit={handleExtract}>
    <h2 class="dialog-title">Autofill from Resume Text</h2>
    <p class="dialog-description">
      Paste your resume text below to extract and populate the editor
    </p>
    <textarea
      bind:value={autofillText}
      placeholder="Paste your resume text here..."
      rows="15"
      class="form-input autofill-input"
    ></textarea>
    <div class="flex justify-end">
      <button type="submit" class="button">Extract</button>
    </div>
  </form>
</dialog>

<Print {resume} />

<style>
  .profile-actions {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
  }

  .autofill-input {
    field-sizing: fixed;
  }

  .save-message {
    padding: var(--space-3);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
    text-align: center;
  }

  .save-message.success {
    background: var(--color-success-bg, #dcfce7);
    color: var(--color-success, #166534);
  }

  .save-message.error {
    background: var(--color-danger-bg, #fee2e2);
    color: var(--color-danger, #991b1b);
  }

  @media print {
    .container {
      display: none;
    }
  }

  .recommendations-section {
    margin-top: var(--space-8);
    padding-top: var(--space-8);
    border-top: 2px solid var(--color-border);
  }

  .recommendations-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: var(--space-6);
    color: var(--color-text);
  }

  .inviter-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
    padding: var(--space-4);
    background: var(--color-info-bg, #dbeafe);
    border-radius: var(--radius-md);
  }

  .badge {
    font-size: 0.75rem;
    padding: var(--space-1) var(--space-2);
    background: var(--color-badge-bg, var(--color-bg-secondary));
    border-radius: var(--radius-sm);
    color: var(--color-muted);
  }

  .invite-badge {
    background: var(--color-primary);
    color: var(--color-primary-text, white);
  }

  .inviter-link {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
  }

  .inviter-link:hover {
    text-decoration: underline;
  }

  .recommendations-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .recommendation-card {
    background: var(--color-card-bg, var(--color-bg-secondary));
    padding: var(--space-5);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .recommendation-card.from-invite {
    border-left: 4px solid var(--color-primary);
  }

  .recommendation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3);
  }

  .author-link {
    color: var(--color-text);
    font-weight: 600;
    text-decoration: none;
  }

  .author-link:hover {
    color: var(--color-primary);
  }

  .recommendation-text {
    line-height: 1.6;
    margin-bottom: var(--space-3);
    color: var(--color-text);
  }

  .recommendation-date {
    font-size: 0.875rem;
    color: var(--color-muted);
  }
</style>
