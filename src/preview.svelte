<script lang="ts">
  import { groupSkillsByCategory, type Resume } from "./cv-parser";

  let { resume }: { resume: Resume } = $props();
</script>

<div class="resume-container">
  <header class="resume-header">
    {#if resume.contact.name}
      <h2 class="name">{resume.contact.name}</h2>
    {/if}
    <div class="contact-info">
      {#if resume.contact.email}
        <span class="contact-item">{resume.contact.email}</span>
      {/if}
      {#if resume.contact.phone}
        <span class="contact-item">{resume.contact.phone}</span>
      {/if}
      {#if resume.contact.location}
        <span class="contact-item">{resume.contact.location}</span>
      {/if}
      {#if resume.contact.linkedin}
        <span class="contact-item">{resume.contact.linkedin}</span>
      {/if}
      {#if resume.contact.github}
        <span class="contact-item">{resume.contact.github}</span>
      {/if}
      {#if resume.contact.website}
        <span class="contact-item">{resume.contact.website}</span>
      {/if}
    </div>
  </header>

  {#if resume.summary}
    <section class="resume-section">
      <h3 class="section-title">Summary</h3>
      <p class="summary-text">{resume.summary}</p>
    </section>
  {/if}

  {#if resume.experience.length > 0}
    <section class="resume-section">
      <h3 class="section-title">Experience</h3>
      <div class="experience-list">
        {#each resume.experience as job}
          <div class="experience-item">
            <div class="experience-header">
              <div class="experience-title-company">
                <h4 class="job-title">{job.title}</h4>
                <span class="company">{job.company}</span>
                {#if job.location}
                  <span class="location">{job.location}</span>
                {/if}
              </div>
              <span class="date-range"
                >{job.dateRange?.start || ""} - {job.dateRange?.end || ""}</span
              >
            </div>
            {#if job.description}
              <p class="job-description">{job.description}</p>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if resume.education.length > 0}
    <section class="resume-section">
      <h3 class="section-title">Education</h3>
      <div class="education-list">
        {#each resume.education as edu}
          <div class="education-item">
            <div class="education-header">
              <h4 class="institution">{edu.institution}</h4>
              <span class="date-range">
                {edu.dateRange?.start || ""} - {edu.dateRange?.end || ""}
              </span>
            </div>
            <p class="degree-field">
              {#if edu.degree}
                <span class="degree">{edu.degree}</span>
              {/if}
              {#if edu.field}
                <span class="field">{edu.field}</span>
              {/if}
            </p>
            {#if edu.description}
              <p class="edu-description">{edu.description}</p>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if resume.projects.length > 0}
    <section class="resume-section">
      <h3 class="section-title">Projects</h3>
      <div class="project-list">
        {#each resume.projects as project}
          <div class="project-item">
            <div class="project-header">
              <h4 class="project-name">{project.name}</h4>
              {#if project.dateRange?.end || project.dateRange?.start}
                <span class="date-range">
                  {project.dateRange?.start || ""} - {project.dateRange?.end ||
                    ""}
                </span>
              {/if}
            </div>
            {#if project.description}
              <p class="project-description">{project.description}</p>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if resume.skills.length > 0}
    <section class="resume-section">
      <h3 class="section-title">Skills</h3>
      <div class="skills-by-category">
        {#each Object.entries(groupSkillsByCategory(resume.skills)) as [category, skills]}
          <div class="skill-category">
            <span class="category-name">{category}:</span>
            <span class="category-skills">{skills.join(", ")}</span>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</div>

<style>
  .resume-container {
    width: 210mm;
    min-height: 297mm;
    padding: 2rem;
    margin: 2rem auto;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background: white;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    color: #111827;
    line-height: 1.4;
    font-size: 0.85rem;
  }

  .resume-header {
    padding-bottom: 0.75rem;
    margin-bottom: 1rem;
    border-bottom: 1.5px solid #111827;
  }

  .name {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #000;
  }

  .contact-info {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .contact-item {
    font-size: 0.8rem;
    color: #374151;
  }

  .contact-item:not(:last-child)::after {
    content: "•";
    margin-left: 0.5rem;
    color: #9ca3af;
  }

  .resume-section {
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid #111827;
    color: #000;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .summary-text {
    line-height: 1.5;
    margin: 0;
    color: #374151;
    font-size: 0.85rem;
  }

  .experience-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .experience-item {
    page-break-inside: avoid;
  }

  .experience-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.25rem;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .experience-title-company {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .job-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    color: #000;
  }

  .company {
    font-size: 0.85rem;
    color: #4b5563;
  }

  .location {
    font-size: 0.8rem;
    color: #6b7280;
    font-style: italic;
  }

  .date-range {
    font-size: 0.8rem;
    color: #6b7280;
    white-space: nowrap;
  }

  .job-description {
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0.25rem 0 0 0;
    color: #374151;
  }

  .education-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .education-item {
    page-break-inside: avoid;
  }

  .education-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.15rem;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .institution {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    color: #000;
  }

  .degree-field {
    margin: 0;
    font-size: 0.85rem;
    color: #374151;
  }

  .degree {
    font-weight: 500;
  }

  .field {
    font-style: italic;
  }

  .edu-description {
    margin-top: 0.25rem;
    font-size: 0.8rem;
    color: #4b5563;
    line-height: 1.4;
    white-space: pre-wrap;
  }

  .project-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .project-item {
    page-break-inside: avoid;
  }

  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.15rem;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .project-name {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    color: #000;
  }

  .project-description {
    font-size: 0.85rem;
    line-height: 1.4;
    margin: 0;
    color: #374151;
  }

  .skills-by-category {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .skill-category {
    display: flex;
    flex-wrap: wrap;
    gap: 0.15rem;
  }

  .category-name {
    font-weight: 600;
    text-transform: capitalize;
    color: #374151;
    margin-right: 0.25rem;
  }

  .category-skills {
    font-size: 0.85rem;
    color: #4b5563;
  }

  @media (max-width: 640px) {
    .resume-container {
      width: 100%;
      padding: 1rem;
      margin: 1rem auto;
    }

    .name {
      font-size: 1.25rem;
    }

    .contact-info {
      flex-direction: column;
      gap: 0.25rem;
    }

    .contact-item:not(:last-child)::after {
      content: "";
      margin-left: 0;
    }

    .experience-header {
      flex-direction: column;
    }

    .education-header {
      flex-direction: column;
    }

    .project-header {
      flex-direction: column;
    }
  }

  @media print {
    .resume-container {
      width: 100%;
      min-height: auto;
      padding: 0;
      margin: 0;
      border: none;
      border-radius: 0;
      box-shadow: none;
      background: white;
      color: #000;
    }

    .resume-header {
      border-bottom: 1.5px solid #000;
      padding-bottom: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .name {
      color: #000;
    }

    .contact-item {
      color: #000;
    }

    .contact-item:not(:last-child)::after {
      color: #666;
    }

    .section-title {
      color: #000;
      border-bottom: 1px solid #000;
    }

    .summary-text,
    .job-description,
    .project-description {
      color: #000;
    }

    .job-title,
    .institution,
    .project-name {
      color: #000;
    }

    .company,
    .category-name {
      color: #000;
    }

    .location,
    .date-range,
    .category-skills {
      color: #333;
    }

    .degree-field,
    .edu-description {
      color: #000;
    }

    .experience-item,
    .education-item,
    .project-item {
      page-break-inside: avoid;
    }

    .resume-section {
      page-break-inside: avoid;
    }
  }
</style>
