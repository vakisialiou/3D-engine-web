<template>
  <div class="logo">{{ msg }}</div>
</template>

<script>
export default {
  name: 'Logo',
  props: {
    msg: String
  }
}
</script>

<style>
  .logo {
    position: absolute;
    left: 0;
    top: 0;
  }
</style>
