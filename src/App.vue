<template>
  <div id="app">
    <Logo msg="3D engine"/>
    <div id="instructions">
      <input id="user-name" name="user-name" placeholder="User name" />
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
import io from 'socket.io-client'

export default {
  name: 'app',
  components: {
    Logo
  },
  mounted() {

    Engine.loadSoldierModel().then((gltf) => {
      const engine = new Engine(gltf)
      engine.prepare().then(() => {
        engine
          .setLight()
          .registerEvents()
        engine.initGraph(this.$el).animate()

        const winnerSocket = io('http://192.168.1.145:5001/winner');
        winnerSocket.on('connect', () => {
          winnerSocket.on('handshake', (handshakeData) => {
            const userRoomId = handshakeData.userRoomId

            // Сказать всем что я зашел в игру и вот мои координаты.
            winnerSocket.emit('come-in', {
              senderRoomId: userRoomId,
              actionName: engine.personControls.person.actionName,
              position: engine.personControls.person.position,
              rotation: engine.personControls.person.rotation,
              scale: engine.personControls.person.scale,
              actionData: engine.personControls.getActionData()
            })

            // Все кто в игре добавляют нового игрока себе на сцену.
            winnerSocket.on('new-user', (data) => {
              // Добавить нового игрока на сцену
              engine.loadPlayer().then((personControls) => {
                personControls.person.position.copy(data.position)
                personControls.person.rotation.copy(data.rotation)
                personControls.person.scale.copy(data.scale)
                personControls.setActionData(data.actionData)
                personControls.person.toggle(data.actionName)
                engine.addPlayer(data.senderRoomId, personControls)
              })


              // Сказать новому игроку что я тут в игре уже давно и вот мои координаты.
              winnerSocket.emit('share-info', {
                senderRoomId: userRoomId,
                receiverRoomId: data.senderRoomId,
                actionName: engine.personControls.person.actionName,
                position: engine.personControls.person.position,
                rotation: engine.personControls.person.rotation,
                scale: engine.personControls.person.scale,
                actionData: engine.personControls.getActionData()
              })
            })

            winnerSocket.on('old-user', (data) => {
              // Новый игрок добавляет к себе на сцену старых игроков. (тех кто уже давно на сцене)
              engine.loadPlayer().then((personControls) => {
                personControls.person.position.copy(data.position)
                personControls.person.rotation.copy(data.rotation)
                personControls.person.scale.copy(data.scale)
                personControls.setActionData(data.actionData)
                personControls.person.toggle(data.actionName)
                engine.addPlayer(data.senderRoomId, personControls)
              })
            })

            engine.personControls.addEventListener('action', (event) => {
              winnerSocket.emit('user-action', {
                senderRoomId: userRoomId,
                actionName: event.actionName,
                position: engine.personControls.person.position,
                rotation: engine.personControls.person.rotation,
                scale: engine.personControls.person.scale,
                actionData: engine.personControls.getActionData()
              })
            })

            engine.personControls.addEventListener('mouse-move', (event) => {
              winnerSocket.emit('user-action', {
                senderRoomId: userRoomId,
                actionName: event.actionName,
                position: engine.personControls.person.position,
                rotation: engine.personControls.person.rotation,
                scale: engine.personControls.person.scale,
                actionData: engine.personControls.getActionData()
              })
            })

            winnerSocket.on('action', (data) => {
              const personControls = engine.players[data.senderRoomId]
              if (!personControls) {
                console.log(`Can not find person by roomId: ${data.senderRoomId}`)
                return
              }

              personControls.person.position.copy(data.position)
              personControls.person.rotation.copy(data.rotation)
              personControls.person.scale.copy(data.scale)
              personControls.setActionData(data.actionData)
              personControls.person.toggle(data.actionName)
              if (data.actionName === 'shot') {
                const intersectionObjects = engine.getIntersectionObjects()
                personControls.shot.fire(personControls.gunPosition.clone(), personControls.gunDirection.clone(), intersectionObjects)
              }
            })

            window.addEventListener('beforeunload', (event) => {
              winnerSocket.emit('close-window', {
                senderRoomId: userRoomId,
              })
            })

            winnerSocket.on('leave', (data) => {
              engine.removePlayer(data.senderRoomId)
            })
          })
        })

        this.instructions = document.getElementById('instructions')
        this.btnPlay = document.getElementById('play')
        this.btnPlay.addEventListener('click', () => {
          const errorElement = document.getElementById('error')
          errorElement.style.display = 'none'

          const userNameElement = document.getElementById('user-name')
          if (userNameElement.value.length > 3 && userNameElement.value.length < 16) {
            engine.personControls.lock(engine.renderer.domElement)
            userNameElement.style.display = 'none'
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
