<script>
  export let len = 'full';
  export let nodes = 'none';
  export let angle = 0;
</script>

<div class={`wire ${nodes} ${len}`} style="transform: rotate({angle}deg)"></div>

<style>
  div {
    border-bottom: 4px solid var(--corporate-emerald);
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: left center;
  }
  div.left::before,
  div.right::after,
  div.both::after,
  div.both::before {
    display: block;
    border-radius: 50%;
    width: 1rem;
    height: 1rem;
    border: 4px solid var(--corporate-emerald);
  }
</style>