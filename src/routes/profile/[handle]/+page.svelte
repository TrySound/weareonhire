<script lang="ts">
  import { parseResume, type Resume } from "$lib/cv-parser";
  import Topbar from "$lib/topbar.svelte";
  import Editor from "../../../editor.svelte";
  import Print from "../../../print.svelte";

  let { data, form } = $props();

  let resume = $state<Resume>(data.resume);
  let isSaving = $state(false);
  let saveMessage = $state("");
  let autofillText = $state("");
  let recommendationText = $state("");
  let showRecommendationForm = $state(false);

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

  function toggleRecommendationForm() {
    showRecommendationForm = !showRecommendationForm;
    if (!showRecommendationForm) {
      recommendationText = "";
    }
  }
</script>

<div class="container">
  <Topbar handle={data.handle} />

  <div class="actions">
    {#if data.isOwnProfile}
      <button
        type="button"
        class="button"
        commandfor="app-autofill-dialog"
        command="show-modal"
      >
        Autofill
      </button>
    {/if}
    <button type="button" class="button" onclick={() => window.print()}>
      Print
    </button>
  </div>

  {#if saveMessage}
    <div
      class="save-message alert"
      class:alert-success={!saveMessage.includes("Failed")}
      class:alert-error={saveMessage.includes("Failed")}
    >
      {saveMessage}
    </div>
  {/if}

  <Editor bind:resume onSave={handleSave} readonly={!data.isOwnProfile} />

  <!-- Recommendations Section -->
  {#if data.inviter || data.recommendations.length > 0 || (!data.isOwnProfile && !data.hasRecommended)}
    <div class="recommendations-section">
      <h2 class="heading-2">Recommendations from other members</h2>

      <!-- Write Recommendation Form -->
      {#if !data.isOwnProfile && !data.hasRecommended}
        {#if !showRecommendationForm}
          <button
            type="button"
            class="button button-secondary"
            onclick={toggleRecommendationForm}
          >
            Write a recommendation
          </button>
        {:else}
          <form
            method="POST"
            action="?/recommend"
            class="recommendation-form card-lg"
          >
            <h3 class="heading-3">Write a recommendation</h3>

            {#if form?.error}
              <div class="alert alert-error">{form.error}</div>
            {/if}

            {#if form?.success}
              <div class="alert alert-success">
                Recommendation submitted successfully!
              </div>
            {:else}
              <div class="form-group">
                <textarea
                  name="text"
                  bind:value={recommendationText}
                  placeholder="Write your recommendation here..."
                  rows="6"
                  class="form-input"
                  required
                  minlength="200"
                ></textarea>
                <div class="character-count">
                  {recommendationText.length} / 200 characters
                </div>
              </div>

              <div class="form-actions">
                <button
                  type="button"
                  class="button button-ghost"
                  onclick={toggleRecommendationForm}
                >
                  Cancel
                </button>
                <button type="submit" class="button button-primary">
                  Submit Recommendation
                </button>
              </div>
            {/if}
          </form>
        {/if}
      {/if}

      {#if data.recommendations.length > 0}
        <div class="recommendations-list">
          {#each data.recommendations as rec}
            <div
              class="card-lg recommendation-card"
              class:from-invite={rec.isFromInvite}
            >
              <div class="recommendation-header">
                <a href="/profile/{rec.authorHandle}" class="author-link">
                  {rec.authorName || rec.authorHandle}
                </a>
                {#if rec.isFromInvite}
                  <span class="badge badge-primary">Invitation</span>
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
  .autofill-input {
    field-sizing: fixed;
  }

  .save-message {
    text-align: center;
    margin-bottom: var(--space-4);
  }

  @media print {
    .container {
      display: none;
    }
  }

  .recommendations-section {
    display: grid;
    gap: var(--space-8);
    margin-top: var(--space-8);
    padding: var(--space-8) 0;
    border-top: 2px solid var(--color-border);
  }

  .recommendations-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .recommendation-card {
    padding: var(--space-5);
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
    font-weight: var(--font-weight-semibold);
    text-decoration: none;
  }

  .author-link:hover {
    color: var(--color-primary);
  }

  .recommendation-text {
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--space-3);
    color: var(--color-text);
  }

  .recommendation-date {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
  }

  .recommendation-form {
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .recommendation-form h3 {
    margin: 0;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .form-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
  }

  .character-count {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    text-align: right;
  }
</style>
