<script lang="ts">
  import { startKeyUX, focusGroupKeyUX } from "keyux";
  import "invokers-polyfill";
  import "dialog-closedby-polyfill";
  import { browser } from "$app/environment";
  import "../app.css";

  if (browser) {
    startKeyUX(window, [focusGroupKeyUX()]);
  }
</script>

<slot />
