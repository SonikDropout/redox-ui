<script>
  export let isReversed;
  export let isVertical;
  export let checked;
  export let id;
  export let boundingBox;
  $: start = {
    x: boundingBox.x + (isReversed ? boundingBox.width : 0),
    y: boundingBox.y + (isVertical ? 0 : boundingBox.height / 2),
  };
  $: end = {
    x: boundingBox.x + (isReversed ? 0 : boundingBox.width),
    y: boundingBox.y + (isVertical ? boundingBox.height : boundingBox.height / 2),
  };
  let keyPosition;
  let position;
  $: if (isReversed) {
    position = 'h-' + boundingBox.width;
  } else {
    position = 'h' + boundingBox.width;
  }
</script>

<circle cx={start.x} cy={start.y} r="4" />
<circle cx={end.x} cy={end.y} r="4" />
<path class="switch" class:checked class:reversed={isReversed} d="M {start.x},{start.y} {position}" />
<rect
  class="switch-hitbox"
  pointer-events="all"
  fill="none"
  on:click
  x={boundingBox.x}
  y={boundingBox.y}
  {id}
  width={boundingBox.width}
  height={boundingBox.height} />

<style>
  .switch-hitbox {
    cursor: pointer;
  }
  circle {
    fill: #37abb8;
  }
  path {
    fill: none;
    stroke: #37abb8;
    stroke-width: 4px;
  }
  .switch {
    transform: rotate(-45deg);
  }
  .switch.reversed {
    transform-origin: 100% 0;
    transform: rotate(45deg);
  }
  .switch.checked {
    transform: rotate(0);
  }
  .switch {
    transform-origin: 0%, 50%;
    transform-box: fill-box;
  }
</style>
