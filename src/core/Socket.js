import io from 'socket.io-client'
import Storage from './../lib/Storage'
import uuid from 'uuid/v4'

class Socket {
  /**
   *
   * @param {Engine} engine
   */
  constructor(engine) {
    /**
     *
     * @type {Engine}
     */
    this.engine = engine

    /**
     *
     * @type {string|?}
     */
    this.userId = Storage.getStorageItem('userId')
    if (!this.userId) {
      Storage.setStorageItem('userId', uuid())
      this.userId = Storage.getStorageItem('userId')
    }
  }

  connect() {
    const winnerSocket = io('http://localhost:5001/winner')
    winnerSocket.on('connect', () => {
      this.engine.personControls.userData.setUserId(this.userId)
      // Сказать всем что я зашел в игру и вот мои координаты.
      winnerSocket.emit('come-in', {
        senderUserId: this.userId,
        userData: this.engine.personControls.userData,
        actionName: this.engine.personControls.person.actionName,
        position: this.engine.personControls.person.position,
        rotation: this.engine.personControls.person.rotation,
        scale: this.engine.personControls.person.scale,
        actionData: this.engine.personControls.getActionData()
      })

      // Все кто в игре добавляют нового игрока себе на сцену.
      winnerSocket.on('new-user', (data) => {
        // Добавить нового игрока на сцену
        this.engine.loadPlayer().then((personControls) => {
          personControls.person.position.copy(data.position)
          personControls.person.rotation.copy(data.rotation)
          personControls.person.scale.copy(data.scale)
          personControls.setActionData(data.actionData)
          personControls.person.toggle(data.actionName)
          personControls.userData.copy(data.userData)
          this.engine.addPlayer(data.senderUserId, personControls)
        })

        // Сказать новому игроку что я тут в игре уже давно и вот мои координаты.
        winnerSocket.emit('share-info', {
          senderUserId: this.userId,
          userData: this.engine.personControls.userData,
          receiverUserId: data.senderUserId,
          actionName: this.engine.personControls.person.actionName,
          position: this.engine.personControls.person.position,
          rotation: this.engine.personControls.person.rotation,
          scale: this.engine.personControls.person.scale,
          actionData: this.engine.personControls.getActionData()
        })
      })

      winnerSocket.on('old-user', (data) => {
        // Новый игрок добавляет к себе на сцену старых игроков. (тех кто уже давно на сцене)
        this.engine.loadPlayer().then((personControls) => {
          personControls.person.position.copy(data.position)
          personControls.person.rotation.copy(data.rotation)
          personControls.person.scale.copy(data.scale)
          personControls.setActionData(data.actionData)
          personControls.person.toggle(data.actionName)
          personControls.userData.copy(data.userData)
          this.engine.addPlayer(data.senderUserId, personControls)
        })
      })

      this.engine.personControls.addEventListener('action', (event) => {
        winnerSocket.emit('user-action', {
          senderUserId: this.userId,
          actionName: event.actionName,
          position: this.engine.personControls.person.position,
          rotation: this.engine.personControls.person.rotation,
          scale: this.engine.personControls.person.scale,
          actionData: this.engine.personControls.getActionData()
        })
      })

      this.engine.personControls.addEventListener('mouse-move', (event) => {
        winnerSocket.emit('user-action', {
          senderUserId: this.userId,
          actionName: event.actionName,
          position: this.engine.personControls.person.position,
          rotation: this.engine.personControls.person.rotation,
          scale: this.engine.personControls.person.scale,
          actionData: this.engine.personControls.getActionData()
        })
      })

      winnerSocket.on('action', (data) => {
        const personControls = this.engine.players[data.senderUserId]
        if (!personControls) {
          console.log(`Can not find person by roomId: ${data.senderUserId}`)
          return
        }

        personControls.person.position.copy(data.position)
        personControls.person.rotation.copy(data.rotation)
        personControls.person.scale.copy(data.scale)
        personControls.setActionData(data.actionData)
        personControls.person.toggle(data.actionName)
        if (data.actionName === 'shot') {
          const intersectionObjects = this.engine.getIntersectionObjects()
          personControls.shot.fire(personControls.gunPosition.clone(), personControls.gunDirection.clone(), intersectionObjects, true)
        }
      })

      window.addEventListener('beforeunload', (event) => {
        winnerSocket.emit('close-window', {
          senderUserId: this.userId,
        })
      })

      winnerSocket.on('leave', (data) => {
        this.engine.removePlayer(data.senderUserId)
      })
    })
  }
}

export default Socket