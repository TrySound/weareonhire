<script lang="ts">
  import { goto } from "$app/navigation";
</script>

<div class="centered-container">
  <div class="card-header" style="max-width: 400px;">
    <h1 class="heading-1" style="color: var(--color-danger);">Access Denied</h1>
    <p class="heading-3" style="margin-bottom: var(--space-2);">
      You are not authorized to access this closed community.
    </p>
    <p class="subtle" style="margin-bottom: var(--space-6);">
      Only approved members can view and edit profiles.
    </p>
    <div class="page-actions" style="justify-content: center;">
      <a href="/" class="button">Back to Home</a>
    </div>
  </div>
</div>
