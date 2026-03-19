<script lang="ts">
  let count = $state(0);

  function increment() {
    count += 1;
  }
</script>

<main>
  <h1>CV Builder</h1>
  <p>Svelte 5 + Vite + TypeScript</p>
  <button onclick={increment}>
    Count: {count}
  </button>
</main>

<style>
  main {
    padding: 1rem;
  }

  h1 {
    color: #ff3e00;
  }

  button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid #ccc;
    background: white;
    color: #333;
  }

  button:hover {
    background: #f0f0f0;
  }
</style>
