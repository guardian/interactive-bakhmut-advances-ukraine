<script>
  export let name = "atom";
</script>

<div class="atom">
  <h2>Hello {name}</h2>
</div>

<style lang="scss">
  h2 {
    @include f-headline();
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
  }
</style>
