<script lang="ts">
  import type { Resume } from "./cv-parser";
  import { SKILLS_TAXONOMY } from "./cv-parser";
  import MultiSelectCombobox from "./multi-select-combobox.svelte";

  let { resume = $bindable() }: { resume: Resume } = $props();

  // Track which section/card is being edited
  // Format: 'contact', 'summary', 'experience-0', 'education-2', 'skills'
  let editingId = $state<string | null>(null);

  // Create flat list of all skills from taxonomy
  const allSkills = [...new Set(Object.values(SKILLS_TAXONOMY).flat())].sort(
    (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
  );

  // Group skills by category for display
  const skillsByCategory = $derived(() => {
    const grouped: Record<string, string[]> = {};
    for (const [category, skills] of Object.entries(SKILLS_TAXONOMY)) {
      const matched = skills.filter((skill) =>
        resume.skills.some((s) => s.toLowerCase() === skill.toLowerCase()),
      );
      if (matched.length > 0) {
        grouped[category] = matched;
      }
    }
    // Add "Other" category for custom skills not in taxonomy
    const taxonomySkills = new Set(Object.values(SKILLS_TAXONOMY).flat());
    const otherSkills = resume.skills.filter(
      (skill) => !taxonomySkills.has(skill),
    );
    if (otherSkills.length > 0) {
      grouped["Other"] = otherSkills;
    }
    return grouped;
  });

  function isEditing(section: string, index?: number): boolean {
    const targetId = index !== undefined ? `${section}-${index}` : section;
    return editingId === targetId;
  }

  function startEditing(section: string, index?: number) {
    const targetId = index !== undefined ? `${section}-${index}` : section;
    editingId = targetId;
  }

  function stopEditing() {
    editingId = null;
  }

  function addExperience() {
    resume.experience.unshift({
      title: "",
      company: "",
      location: "",
      dateRange: { start: "", end: "" },
    });
    // Start editing the new entry (index 0 after unshift)
    startEditing("experience", 0);
  }

  function removeExperience(index: number) {
    resume.experience.splice(index, 1);
    // If we were editing this card, stop editing
    if (isEditing("experience", index)) {
      stopEditing();
    }
  }

  function addEducation() {
    resume.education.unshift({
      institution: "",
      degree: "",
      field: "",
      dateRange: { start: "", end: "" },
    });
    startEditing("education", 0);
  }

  function removeEducation(index: number) {
    resume.education.splice(index, 1);
    if (isEditing("education", index)) {
      stopEditing();
    }
  }

  function addProject() {
    resume.projects.unshift({
      name: "",
      description: "",
      dateRange: { start: "", end: "" },
    });
    startEditing("projects", 0);
  }

  function removeProject(index: number) {
    resume.projects.splice(index, 1);
    if (isEditing("projects", index)) {
      stopEditing();
    }
  }
</script>

<!-- Contact Info -->
<section class="form-section">
  <header class="section-header">
    <h3 class="section-title">Contact Information</h3>
    {#if !isEditing("contact")}
      <button
        class="btn btn--secondary"
        onclick={() => startEditing("contact")}
        type="button"
      >
        Edit
      </button>
    {:else}
      <button
        class="btn btn--primary"
        onclick={() => stopEditing()}
        type="button"
      >
        Save
      </button>
    {/if}
  </header>

  {#if isEditing("contact")}
    <div class="form-grid">
      <div class="form-group">
        <label for="contact-name" class="form-label">Name</label>
        <input
          type="text"
          id="contact-name"
          bind:value={resume.contact.name}
          placeholder="John Doe"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="contact-location" class="form-label">Location</label>
        <input
          type="text"
          id="contact-location"
          bind:value={resume.contact.location}
          placeholder="San Francisco, CA"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="contact-email" class="form-label">Email</label>
        <input
          type="email"
          id="contact-email"
          bind:value={resume.contact.email}
          placeholder="john@example.com"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="contact-linkedin" class="form-label">LinkedIn</label>
        <input
          type="text"
          id="contact-linkedin"
          bind:value={resume.contact.linkedin}
          placeholder="linkedin.com/in/johndoe"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="contact-github" class="form-label">GitHub</label>
        <input
          type="text"
          id="contact-github"
          bind:value={resume.contact.github}
          placeholder="github.com/johndoe"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="contact-website" class="form-label">Website</label>
        <input
          type="text"
          id="contact-website"
          bind:value={resume.contact.website}
          placeholder="https://johndoe.com"
          class="form-input"
        />
      </div>
    </div>
  {:else}
    <div class="card card--view">
      <div class="contact-display">
        {#if resume.contact.name}
          <div class="contact-name">{resume.contact.name}</div>
        {/if}
        <div class="contact-details">
          {#if resume.contact.location}
            <span class="contact-item">
              <svg
                class="contact-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {resume.contact.location}
            </span>
          {/if}
          {#if resume.contact.email}
            <a
              href="mailto:{resume.contact.email}"
              class="contact-item contact-link"
            >
              <svg
                class="contact-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {resume.contact.email}
            </a>
          {/if}
          {#if resume.contact.linkedin}
            <a
              href="https://{resume.contact.linkedin}"
              target="_blank"
              class="contact-item contact-link"
            >
              <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"
                />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              LinkedIn
            </a>
          {/if}
          {#if resume.contact.github}
            <a
              href="https://{resume.contact.github}"
              target="_blank"
              class="contact-item contact-link"
            >
              <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
              GitHub
            </a>
          {/if}
          {#if resume.contact.website}
            <a
              href={resume.contact.website}
              target="_blank"
              class="contact-item contact-link"
            >
              <svg
                class="contact-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path
                  d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                />
              </svg>
              Website
            </a>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</section>

<!-- Summary -->
<section class="form-section">
  <header class="section-header">
    <h3 class="section-title">Professional Summary</h3>
    {#if !isEditing("summary")}
      <button
        class="btn btn--secondary"
        onclick={() => startEditing("summary")}
        type="button"
      >
        Edit
      </button>
    {:else}
      <button
        class="btn btn--primary"
        onclick={() => stopEditing()}
        type="button"
      >
        Save
      </button>
    {/if}
  </header>

  {#if isEditing("summary")}
    <div class="form-group">
      <textarea
        bind:value={resume.summary}
        rows="4"
        placeholder="Enter your professional summary..."
        class="form-input"
      ></textarea>
    </div>
  {:else}
    <div class="card card--view">
      {#if resume.summary}
        <p class="summary-text">{resume.summary}</p>
      {:else}
        <p class="empty-text">
          No professional summary added yet. Click Edit to add one.
        </p>
      {/if}
    </div>
  {/if}
</section>

<!-- Experience -->
<section class="form-section">
  <header class="section-header">
    <h3 class="section-title">Work Experience</h3>
    <button class="btn btn--secondary" onclick={addExperience} type="button">
      Add Experience
    </button>
  </header>
  {#each resume.experience as job, index}
    <div class="card" class:card--editing={isEditing("experience", index)}>
      <header class="card-header">
        <div class="card-header-content">
          {#if isEditing("experience", index)}
            <span class="card-header-title">Edit Experience</span>
          {:else}
            <span class="card-header-title"
              >{job.title || "Untitled Position"}</span
            >
            {#if job.company}
              <span class="card-header-subtitle">{job.company}</span>
            {/if}
          {/if}
        </div>
        {#if !isEditing("experience", index)}
          <button
            class="btn btn--secondary btn--small"
            onclick={() => startEditing("experience", index)}
            type="button"
          >
            Edit
          </button>
        {:else}
          <button
            class="btn btn--primary btn--small"
            onclick={() => stopEditing()}
            type="button"
          >
            Save
          </button>
        {/if}
      </header>

      {#if isEditing("experience", index)}
        <div class="form-stack">
          <div class="form-grid">
            <div class="form-group">
              <label for="job-title-{index}" class="form-label">Job Title</label
              >
              <input
                type="text"
                id="job-title-{index}"
                bind:value={job.title}
                placeholder="Software Engineer"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="company-{index}" class="form-label">Company</label>
              <input
                type="text"
                id="company-{index}"
                bind:value={job.company}
                placeholder="TechCorp Inc."
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="job-location-{index}" class="form-label"
                >Location</label
              >
              <input
                type="text"
                id="job-location-{index}"
                bind:value={job.location}
                placeholder="San Francisco, CA (or Remote)"
                class="form-input"
              />
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label for="job-start-{index}" class="form-label"
                >Start Date</label
              >
              <input
                type="text"
                id="job-start-{index}"
                bind:value={job.dateRange!.start}
                placeholder="Jan 2020"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="job-end-{index}" class="form-label">End Date</label>
              <input
                type="text"
                id="job-end-{index}"
                bind:value={job.dateRange!.end}
                placeholder="Present"
                class="form-input"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="job-desc-{index}" class="form-label">Description</label>
            <textarea
              id="job-desc-{index}"
              bind:value={job.description}
              rows="6"
              placeholder="Describe your role, responsibilities, and achievements..."
              class="form-input"
            ></textarea>
          </div>
        </div>
      {:else}
        <div class="experience-view">
          <div class="experience-meta">
            {#if job.dateRange?.start || job.dateRange?.end}
              <span class="experience-dates">
                {job.dateRange?.start || ""} — {job.dateRange?.end || "Present"}
              </span>
            {/if}
            {#if job.location}
              <span class="experience-location">{job.location}</span>
            {/if}
          </div>
          {#if job.description}
            <p class="experience-description">{job.description}</p>
          {/if}
        </div>
      {/if}
      <div class="card-actions">
        <button
          class="btn btn--danger btn--small"
          onclick={() => removeExperience(index)}
          type="button"
        >
          Remove
        </button>
      </div>
    </div>
  {/each}
</section>

<!-- Education -->
<section class="form-section">
  <header class="section-header">
    <h3 class="section-title">Education</h3>
    <button class="btn btn--secondary" onclick={addEducation} type="button">
      Add Education
    </button>
  </header>
  {#each resume.education as edu, index}
    <div class="card" class:card--editing={isEditing("education", index)}>
      <header class="card-header">
        <div class="card-header-content">
          {#if isEditing("education", index)}
            <span class="card-header-title">Edit Education</span>
          {:else}
            <span class="card-header-title"
              >{edu.degree || "Untitled Degree"}</span
            >
            {#if edu.institution}
              <span class="card-header-subtitle">{edu.institution}</span>
            {/if}
          {/if}
        </div>
        {#if !isEditing("education", index)}
          <button
            class="btn btn--secondary btn--small"
            onclick={() => startEditing("education", index)}
            type="button"
          >
            Edit
          </button>
        {:else}
          <button
            class="btn btn--primary btn--small"
            onclick={() => stopEditing()}
            type="button"
          >
            Save
          </button>
        {/if}
      </header>

      {#if isEditing("education", index)}
        <div class="form-stack">
          <div class="form-grid">
            <div class="form-group">
              <label for="edu-institution-{index}" class="form-label"
                >Institution</label
              >
              <input
                type="text"
                id="edu-institution-{index}"
                bind:value={edu.institution}
                placeholder="University of Example"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="edu-degree-{index}" class="form-label">Degree</label>
              <input
                type="text"
                id="edu-degree-{index}"
                bind:value={edu.degree}
                placeholder="Bachelor of Science"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="edu-field-{index}" class="form-label"
                >Field of Study</label
              >
              <input
                type="text"
                id="edu-field-{index}"
                bind:value={edu.field}
                placeholder="Computer Science"
                class="form-input"
              />
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label for="edu-start-{index}" class="form-label"
                >Start Date</label
              >
              <input
                type="text"
                id="edu-start-{index}"
                bind:value={edu.dateRange!.start}
                placeholder="Sep 2016"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="edu-end-{index}" class="form-label">End Date</label>
              <input
                type="text"
                id="edu-end-{index}"
                bind:value={edu.dateRange!.end}
                placeholder="May 2020"
                class="form-input"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="edu-desc-{index}" class="form-label">Description</label>
            <textarea
              id="edu-desc-{index}"
              bind:value={edu.description}
              rows="4"
              placeholder="Honors, awards, achievements, relevant coursework..."
              class="form-input"
            ></textarea>
          </div>
        </div>
      {:else}
        <div class="education-view">
          <div class="education-meta">
            {#if edu.dateRange?.start || edu.dateRange?.end}
              <span class="education-dates">
                {edu.dateRange?.start || ""} — {edu.dateRange?.end || "Present"}
              </span>
            {/if}
            {#if edu.field}
              <span class="education-field">{edu.field}</span>
            {/if}
          </div>
          {#if edu.description}
            <p class="education-description">{edu.description}</p>
          {/if}
        </div>
      {/if}
      <div class="card-actions">
        <button
          class="btn btn--danger btn--small"
          onclick={() => removeEducation(index)}
          type="button"
        >
          Remove
        </button>
      </div>
    </div>
  {/each}
</section>

<!-- Projects -->
<section class="form-section">
  <header class="section-header">
    <h3 class="section-title">Projects</h3>
    <button class="btn btn--secondary" onclick={addProject} type="button">
      Add Project
    </button>
  </header>
  {#each resume.projects as project, index}
    <div class="card" class:card--editing={isEditing("projects", index)}>
      <header class="card-header">
        <div class="card-header-content">
          {#if isEditing("projects", index)}
            <span class="card-header-title">Edit Project</span>
          {:else}
            <span class="card-header-title"
              >{project.name || "Untitled Project"}</span
            >
          {/if}
        </div>
        {#if !isEditing("projects", index)}
          <button
            class="btn btn--secondary btn--small"
            onclick={() => startEditing("projects", index)}
            type="button"
          >
            Edit
          </button>
        {:else}
          <button
            class="btn btn--primary btn--small"
            onclick={() => stopEditing()}
            type="button"
          >
            Save
          </button>
        {/if}
      </header>

      {#if isEditing("projects", index)}
        <div class="form-stack">
          <div class="form-grid">
            <div class="form-group">
              <label for="project-name-{index}" class="form-label"
                >Project Name</label
              >
              <input
                type="text"
                id="project-name-{index}"
                bind:value={project.name}
                placeholder="E-commerce Platform"
                class="form-input"
              />
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label for="project-start-{index}" class="form-label"
                >Start Date</label
              >
              <input
                type="text"
                id="project-start-{index}"
                bind:value={project.dateRange!.start}
                placeholder="Jan 2023"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="project-end-{index}" class="form-label"
                >End Date</label
              >
              <input
                type="text"
                id="project-end-{index}"
                bind:value={project.dateRange!.end}
                placeholder="Present"
                class="form-input"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="project-desc-{index}" class="form-label"
              >Description</label
            >
            <textarea
              id="project-desc-{index}"
              bind:value={project.description}
              rows="3"
              placeholder="Brief description of the project..."
              class="form-input"
            ></textarea>
          </div>
        </div>
      {:else}
        <div class="project-view">
          <div class="project-meta">
            {#if project.dateRange?.start || project.dateRange?.end}
              <span class="project-dates">
                {project.dateRange?.start || ""} — {project.dateRange?.end ||
                  "Present"}
              </span>
            {/if}
          </div>
          {#if project.description}
            <p class="project-description">{project.description}</p>
          {/if}
        </div>
      {/if}
      <div class="card-actions">
        <button
          class="btn btn--danger btn--small"
          onclick={() => removeProject(index)}
          type="button"
        >
          Remove
        </button>
      </div>
    </div>
  {/each}
</section>

<!-- Skills -->
<section class="form-section">
  <header class="section-header">
    <h3 class="section-title">Skills</h3>
    {#if !isEditing("skills")}
      <button
        class="btn btn--secondary"
        onclick={() => startEditing("skills")}
        type="button"
      >
        Edit
      </button>
    {:else}
      <button
        class="btn btn--primary"
        onclick={() => stopEditing()}
        type="button"
      >
        Save
      </button>
    {/if}
  </header>

  {#if isEditing("skills")}
    <MultiSelectCombobox
      options={allSkills}
      bind:selected={resume.skills}
      label="Select your skills (type to search or add custom)"
      placeholder="e.g., TypeScript"
      id="skills-combobox"
    />
  {:else}
    <div class="card card--view">
      {#if resume.skills.length > 0}
        <div class="skills-display">
          {#each Object.entries(skillsByCategory()) as [category, skills]}
            <div class="skills-group">
              <h4 class="skills-category">{category}</h4>
              <div class="skills-chips">
                {#each skills as skill}
                  <span class="chip">{skill}</span>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="empty-text">No skills added yet. Click Edit to add skills.</p>
      {/if}
    </div>
  {/if}
</section>
