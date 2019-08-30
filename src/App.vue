<template>
  <div id="app">
    <Logo msg="3D engine"/>
    <div id="instructions">
      <span style="font-size:36px">Click to play</span>
      <br /><br />
      Move: WASD<br/>
      Jump: SPACE<br/>
      Look: MOUSE
    </div>
  </div>
</template>

<script>
import Engine from './core/Engine'
import Logo from './components/Logo.vue'

export default {
  name: 'app',
  components: {
    Logo
  },
  mounted() {
    const engine = new Engine()
    engine.render(this.$el).animate()

    setTimeout(() => {
      this.instructions = document.getElementById('instructions')
      this.instructions.addEventListener('click', () => {
        engine.controls.lock()
      }, false)

      engine.controls.addEventListener('lock', () => {
        this.instructions.style.display = 'none'
      })
      engine.controls.addEventListener('unlock', () => {
        this.instructions.style.display = ''
      })
    }, 1200)
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
    position: fixed;
  }
  #instructions {
    width: 100%;
    height: 100%;
    display: -webkit-box;
    display: -moz-box;
    display: box;
    -webkit-box-orient: horizontal;
    -moz-box-orient: horizontal;
    box-orient: horizontal;
    -webkit-box-pack: center;
    -moz-box-pack: center;
    box-pack: center;
    -webkit-box-align: center;
    -moz-box-align: center;
    box-align: center;
    color: #ffffff;
    text-align: center;
    font-family: Arial;
    font-size: 14px;
    line-height: 24px;
    cursor: pointer;
    position: fixed;
  }
</style>
