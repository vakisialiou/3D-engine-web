import Object3DFollower from './../Helpers/Object3DFollower'
import Object3DPusher from './../Helpers/Object3DPusher'
import { EventDispatcher, Vector3, Raycaster } from 'three'
import PersonAnimation from './PersonAnimation'
import PersonShot from './PersonShot'

class PersonControls extends EventDispatcher {
  /**
   *
   * @param {Object3D|Object} model
   */
  constructor(model) {
    super()

    this.walkSpeed = 400.0
    this.runSpeed = 800.0
    this.jumpHeight = 350

    /**
     *
     * @type {PersonShot}
     */
    this.shot = new PersonShot()

    /**
     *
     * @type {PersonAnimation|Object3D}
     */
    this.person = new PersonAnimation(model)
    this.person.setDefaultAction()

    /**
     *
     * @type {Vector3}
     */
    this.gunDirection = new Vector3()

    /**
     *
     * @type {Vector3}
     */
    this.gunPosition = new Vector3()

    /**
     *
     * @type {boolean}
     */
    this.isLocked = false

    /**
     *
     * @type {Object3DFollower}
     */
    this.personFollower = new Object3DFollower(this.person, 4.5)

    /**
     *
     * @type {Object3DPusher}
     */
    this.personPusher = new Object3DPusher(this.person)

    /**
     *
     * @type {Vector3}
     */
    this.velocity = new Vector3()

    /**
     *
     * @type {Vector3}
     */
    this.direction = new Vector3()

    /**
     *
     * @type {boolean}
     */
    this.canMoveForward = false

    /**
     *
     * @type {boolean}
     */
    this.canMoveBackward = false

    /**
     *
     * @type {boolean}
     */
    this.canMoveLeft = false

    /**
     *
     * @type {boolean}
     */
    this.canMoveRight = false

    /**
     *
     * @type {boolean}
     */
    this.canJump = false

    /**
     *
     * @type {boolean}
     */
    this.canRun = false

    /**
     *
     * @type {{canMoveLeft: number[], canMoveBackward: number[], canMoveRight: number[], canMoveForward: number[], canJump: number[]}}
     */
    this.keyboard = {
      canMoveForward: [
        38,/*up*/
        87 /*w*/
      ],
      canMoveLeft: [
        37,/*left*/
        65 /*a*/
      ],
      canMoveBackward: [
        40,/*down*/
        83 /*s*/
      ],
      canMoveRight: [
        39,/*right*/
        68 /*d*/
      ],
      canJump: [
        32 /*space*/
      ],
      canRun: [
        16, /* shift */
      ]
    }

    /**
     *
     * @type {{active: boolean, clickEvent: (Function|null), keyUpEvent: (Function|null), keyDownEvent: (Function|null), pointerLockErrorEvent: (Function|null), pointerLockChangeEvent: Function|null}}
     */
    this.register = {
      active: false,
      clickEvent: null,
      keyUpEvent: null,
      keyDownEvent: null,
      pointerLockErrorEvent: null,
      pointerLockChangeEvent: null,
    }

    /**
     *
     * @type {string|null|?}
     */
    this.actionName = null

    /**
     *
     * @type {Raycaster}
     */
    this.raycaster = new Raycaster()
  }

  /**
   *
   * @param {MouseEvent} event
   * @returns {void}
   */
  onMouseMove(event) {
    // if (this.isLocked === false) {
    //     return
    // }
    //
    // if (!this.camera) {
    //     return
    // }



    // const cameraTarget = this.cameraNextStep.get(this.targetDistance)
    // this.personFollower.setTarget(cameraTarget.clone().setY(0))
    //
    // this.targetPosition.copy(cameraTarget)



    //
    // // Направление пушки персонажа
    // this.gunDirection.copy(cameraTarget).sub(this.gunPosition).normalize()
    // this.dispatchEvent({ type: 'mouse-move' })
    //
    // // Проверить пересечение прицела с персонажем. Если прицел находится на персонаже то нужно скрыть прицел.
    // this.raycaster.ray.origin.copy(this.camera.position)
    // this.raycaster.ray.direction.copy(this.cameraNextStep.direction.get())
    // this.raycaster.near = 0
    // this.raycaster.far = this.camera.position.distanceTo(this.targetPosition)
    // const intersectObjects = this.raycaster.intersectObjects([this.person], true)
    // if (intersectObjects.length > 0) {
    //     this.dispatchEvent({ type: 'hide-target' })
    // } else {
    //     this.dispatchEvent({ type: 'show-target' })
    // }
  }

  /**
   *
   * @returns {void}
   */
  onPointerLockError() {
    console.error( 'THREE.PersonControls: Unable to use Pointer Lock API' );
  }

  /**
   *
   * @param {Element} domElement
   * @returns {void}
   */
  onPointerLockChange(domElement) {
    if (document.pointerLockElement === domElement) {
      this.dispatchEvent({ type: 'lock' })
      this.isLocked = true
    } else {
      this.dispatchEvent({ type: 'unlock' })
      this.isLocked = false
    }
  }

  /**
   *
   * @returns {void}
   */
  onKeyDown(event) {
    const property = this.getKeyBoardProperty(event)
    switch (property) {
      case 'canMoveForward':
      case 'canMoveBackward':
      case 'canMoveLeft':
      case 'canMoveRight':
      case 'canRun':
        this[property] = true
        break
      case 'canJump':
        if (this.canJump === true) {
          this.velocity.y += this.jumpHeight
        }
        this.canJump = false
        break
    }
  }

  /**
   *
   * @returns {void}
   */
  onKeyUp(event) {
    const property = this.getKeyBoardProperty(event)
    switch (property) {
      case 'canMoveForward':
      case 'canMoveBackward':
      case 'canMoveLeft':
      case 'canMoveRight':
      case 'canJump':
      case 'canRun':
        this[property] = false
        break
    }
  }

  /**
   *
   * @param {MouseEvent} event
   * @returns {void}
   */
  onClick(event) {
    this.dispatchEvent({ type: 'action', actionName: PersonAnimation.ACTION_SHOT, event })
  }

  /**
   *
   * @returns {string|null|?}
   */
  getKeyBoardProperty(event) {
    for (const property in this.keyboard) {
      if (!this.keyboard.hasOwnProperty(property)) {
        continue
      }
      if (this.keyboard[property].indexOf(event.keyCode) === -1) {
        continue
      }
      return property
    }
    return null
  }

  /**
   *
   * @param {Element} [domElement]
   * @returns {PersonControls}
   */
  lock(domElement = document.body) {
    domElement.requestPointerLock()
    return this
  }

  /**
   *
   * @returns {PersonControls}
   */
  unlock() {
    document.exitPointerLock()
    return this
  }

  /**
   *
   * @param {Element} [domElement]
   * @returns {PersonControls}
   */
  registerEventListeners(domElement = document.body) {
    this.unregisterEventListeners(domElement)
    this.register.active = true
    this.register.clickEvent = (event) => this.onClick(event)
    this.register.keyUpEvent = (event) => this.onKeyUp(event)
    this.register.keyDownEvent = (event) => this.onKeyDown(event)
    this.register.pointerLockErrorEvent = () => this.onPointerLockError()
    this.register.pointerLockChangeEvent = () => this.onPointerLockChange(domElement)

    document.addEventListener('keyup', this.register.keyUpEvent, false)
    document.addEventListener('keydown', this.register.keyDownEvent, false)
    document.addEventListener('pointerlockerror', this.register.pointerLockErrorEvent, false)
    document.addEventListener('pointerlockchange', this.register.pointerLockChangeEvent, false)
    domElement.addEventListener('click', this.register.clickEvent, false)
    return this
  }

  /**
   *
   * @param {Element} domElement
   * @returns {PersonControls}
   */
  unregisterEventListeners(domElement) {
    if (this.register.active) {
      document.removeEventListener('keyup', this.register.keyUpEvent, false)
      document.removeEventListener('keydown', this.register.keyDownEvent, false)
      document.removeEventListener('pointerlockerror', this.register.pointerLockErrorEvent, false)
      document.removeEventListener('pointerlockchange', this.register.pointerLockChangeEvent, false)
      domElement.removeEventListener('click', this.register.clickEvent, false)

      this.register.active = false
      this.register.clickEvent = null
      this.register.keyUpEvent = null
      this.register.keyDownEvent = null
      this.register.pointerLockErrorEvent = null
      this.register.pointerLockChangeEvent = null
    }
    return this
  }

  getActionData() {
    return {
      actionName: this.actionName,
      isLocked: this.isLocked,
      velocity: this.velocity,
      direction: this.direction,
      canMoveForward: this.canMoveForward,
      canMoveBackward: this.canMoveBackward,
      canMoveRight: this.canMoveRight,
      canMoveLeft: this.canMoveLeft,
      canRun: this.canRun,
      runSpeed: this.runSpeed,
      walkSpeed: this.walkSpeed
    }
  }

  /**
   *
   * @param {Object} data
   * @returns {PersonControls}
   */
  setActionData(data) {
    for (const property in this.getActionData()) {
      if (!data.hasOwnProperty(property)) {
        continue
      }
      if (['velocity', 'direction'].includes(property)) {
        this[property].copy(data[property])
        continue
      }
      this[property] = data[property]
    }
    return this
  }


  update(delta) {
    const prevActionName = this.actionName
    this.actionName = null

    if (this.isLocked === true) {
      this.velocity.x -= this.velocity.x * 10.0 * delta
      this.velocity.z -= this.velocity.z * 10.0 * delta
      this.velocity.y -= 9.8 * 100.0 * delta // 100.0 = mass

      this.direction.z = Number(this.canMoveForward) - Number(this.canMoveBackward)
      this.direction.x = Number(this.canMoveRight) - Number(this.canMoveLeft)

      this.direction.normalize() // this ensures consistent movements in all directions

      const speed = this.canRun ? this.runSpeed : this.walkSpeed
      const actionName = this.canRun ? PersonAnimation.ACTION_RUN : PersonAnimation.ACTION_WALK

      if (this.canMoveForward || this.canMoveBackward) {
        this.velocity.z -= this.direction.z * speed * delta
        this.actionName = actionName
      }

      if (this.canMoveLeft || this.canMoveRight) {
        this.velocity.x -= this.direction.x * speed * delta
        this.actionName = actionName
      }

      if (!this.canMoveForward && !this.canMoveBackward && !this.canMoveLeft && !this.canMoveRight) {
        this.actionName = PersonAnimation.ACTION_STOP
      }

      if (this.canMoveLeft || this.canMoveRight) {
        this.personPusher.moveRight(- this.velocity.x * delta)
      }

      if (this.canMoveForward || this.canMoveBackward) {
        this.personPusher.moveForward(- this.velocity.z * delta)
      }

      this.person.position.y += this.velocity.y * delta
      if (this.person.position.y < 0) {
        this.velocity.y = 0
        this.person.position.y = 0
        this.canJump = true
      } else {
        this.actionName = PersonAnimation.ACTION_JUMP
      }

      if ((this.canMoveForward || this.canMoveBackward || this.canMoveLeft || this.canMoveRight) && this.canJump) {
        this.personFollower.update(delta)
      }

    } else {
      this.actionName = PersonAnimation.ACTION_STOP
    }

    this.person.update(delta)
    // Позиция пушки персонажа
    const y = this.person.position.y
    this.gunPosition.copy(this.person.position).setY(y + 26)

    if (prevActionName && prevActionName !== this.actionName) {
      this.dispatchEvent({ type: 'action', actionName: this.actionName })
    }

    this.shot.update(delta)
  }

  /**
   *
   * @param {Vector3} targetPosition
   * @returns {PersonControls}
   */
  updateTargetPosition(targetPosition) {
    // Направление пушки персонажа
    this.gunDirection.copy(targetPosition).sub(this.gunPosition).normalize()
    return this
  }
}

export default PersonControls