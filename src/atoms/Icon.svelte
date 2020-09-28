<script>
  export let caption;
  export let captionPosition;
  export let src
</script>

<figure class={captionPosition}>
  <img {src} alt = {caption} />
  <figcaption>{caption}</figcaption>
</figure>

<style>
  figure { display: flex; }
  .top {flex-direction: column-reverse;}
  .bottom {flex-direction: column;}
  .left {flex-direction: row-reverse;}
</style>