<template>
  <div id="app">
    <Logo msg="3D engine"/>
  </div>
</template>

<script>
import Engine from './lib/Engine'
import Logo from './components/Logo.vue'

export default {
  name: 'app',
  components: {
    Logo
  },
  mounted() {
    new Engine().render(this.$el).animate()
  }
}
</script>

<style>
  body {
    margin: 0;
    padding: 0;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    position: relative;
  }
</style>
