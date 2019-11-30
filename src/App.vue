<template>
  <div id="app">
    <Logo msg="3D engine"/>
    <div id="instructions">
      <input id="user-name" name="user-name" placeholder="User name" value="ssssss" />
      <span style="display: none" id="error">User name is not valid. min 4, max 16</span><br/>
      <button name="play" id="play">Click to play</button>

      <br />
      Move: WASD<br/>
      Jump: SPACE<br/>
      Look: MOUSE
    </div>
  </div>
</template>

<script>
import Engine from './core/Engine'
import Logo from './components/Logo.vue'
import Socket from './core/Socket'

export default {
  name: 'app',
  components: {
    Logo
  },
  mounted() {

    Engine.loadSoldierModel().then((gltf) => {
      const engine = new Engine(gltf)
      engine.prepare().then(() => {
        engine.setLight().registerEvents()
        engine.initGraph(this.$el).animate()

        const socket = new Socket(engine)

        this.instructions = document.getElementById('instructions')
        this.btnPlay = document.getElementById('play')

        let isStarted = false

        this.btnPlay.addEventListener('click', () => {
          if (isStarted) {
            engine.personControls.lock(engine.renderer.domElement)
            return
          }
          const errorElement = document.getElementById('error')
          errorElement.style.display = 'none'

          const userNameElement = document.getElementById('user-name')
          if (userNameElement.value.length > 3 && userNameElement.value.length < 56) {
            engine.personControls.userData.setName(userNameElement.value)
            engine.personControls.lock(engine.renderer.domElement)
            userNameElement.style.display = 'none'
            socket.connect()
            isStarted = true
          } else {
            errorElement.style.display = 'block'
          }
        }, false)

        engine.personControls.addEventListener('lock', () => {
          this.instructions.style.display = 'none'

        })
        engine.personControls.addEventListener('unlock', () => {
          this.instructions.style.display = ''
        })
      })
    })
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
    position: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    text-align: center;
    font-family: Arial;
    font-size: 14px;
    line-height: 24px;
    cursor: pointer;
  }
</style>
