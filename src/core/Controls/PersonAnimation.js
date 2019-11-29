import { AnimationMixer, Group } from 'three'

class PersonAnimation extends Group {
  /**
   *
   * @param {Object} model
   */
  constructor(model) {
    super()

    /**
     * @type {Mesh}
     */
    this.model = model.scene.children[0]
    this.model.scale.set(0.20, 0.20, 0.20)
    this.add(this.model)

    /**
     *
     * @type {AnimationMixer}
     */
    this.mixer = new AnimationMixer(this.model)

    /**
     *
     * @type {AnimationAction}
     */
    this.idleAction = this.mixer.clipAction(model.animations[0])

    /**
     *
     * @type {AnimationAction}
     */
    this.runAction = this.mixer.clipAction(model.animations[1])

    /**
     *
     * @type {AnimationAction}
     */
    this.walkAction = this.mixer.clipAction(model.animations[3])

    /**
     *
     * @type {AnimationAction}
     */
    this.jumpAction = this.mixer.clipAction(model.animations[2])

    /**
     *
     * @type {AnimationAction[]}
     */
    this.actions = [this.idleAction, this.runAction, this.jumpAction, this.walkAction]

    /**
     *
     * @type {string|?}
     */
    this.actionName = null
  }

  stop() {
    if (this.actionName === PersonAnimation.ACTION_RUN) {
      this.prepareCrossFade(this.runAction, this.idleAction, 0.4)
      this.actionName = PersonAnimation.ACTION_STOP
    } else if (this.actionName === PersonAnimation.ACTION_JUMP) {
      this.prepareCrossFade(this.jumpAction, this.idleAction, 0.4)
      this.actionName = PersonAnimation.ACTION_STOP
    } else if (this.actionName === PersonAnimation.ACTION_WALK) {
      this.prepareCrossFade(this.walkAction, this.idleAction, 0.2)
      this.actionName = PersonAnimation.ACTION_STOP
    }
    return this
  }

  run() {
    if (this.actionName === null || this.actionName === PersonAnimation.ACTION_STOP) {
      this.prepareCrossFade(this.idleAction, this.runAction, 0.2)
      this.actionName = PersonAnimation.ACTION_RUN
    } else if (this.actionName === PersonAnimation.ACTION_JUMP) {
      this.prepareCrossFade(this.jumpAction, this.runAction, 0.1)
      this.actionName = PersonAnimation.ACTION_RUN
    } else if (this.actionName === PersonAnimation.ACTION_WALK) {
      this.prepareCrossFade(this.walkAction, this.runAction, 0.2)
      this.actionName = PersonAnimation.ACTION_RUN
    }
    return this
  }

  walk() {
    if (this.actionName === null || this.actionName === PersonAnimation.ACTION_STOP) {
      this.prepareCrossFade(this.idleAction, this.walkAction, 0.1)
      this.actionName = PersonAnimation.ACTION_WALK
    } else if (this.actionName === PersonAnimation.ACTION_JUMP) {
      this.prepareCrossFade(this.jumpAction, this.walkAction, 0.1)
      this.actionName = PersonAnimation.ACTION_WALK
    } else if (this.actionName === PersonAnimation.ACTION_RUN) {
      this.prepareCrossFade(this.runAction, this.walkAction, 0.4)
      this.actionName = PersonAnimation.ACTION_WALK
    }
    return this
  }

  jump() {
    if (this.actionName === null || this.actionName === PersonAnimation.ACTION_STOP) {
      this.prepareCrossFade(this.idleAction, this.jumpAction, 0.2)
      this.actionName = PersonAnimation.ACTION_JUMP
    } else if (this.actionName === PersonAnimation.ACTION_RUN) {
      this.prepareCrossFade(this.runAction, this.jumpAction, 0.1)
      this.actionName = PersonAnimation.ACTION_JUMP
    } else if (this.actionName === PersonAnimation.ACTION_WALK) {
      this.prepareCrossFade(this.walkAction, this.jumpAction, 0.1)
      this.actionName = PersonAnimation.ACTION_JUMP
    }
    return this
  }

  toggle(actionName) {
    switch (actionName) {
      case PersonAnimation.ACTION_STOP:
        this.stop()
        break
      case PersonAnimation.ACTION_WALK:
        this.walk()
        break
      case PersonAnimation.ACTION_RUN:
        this.run()
        break
      case PersonAnimation.ACTION_JUMP:
        this.jump()
        break
    }
    return this
  }

  prepareCrossFade(startAction, endAction, duration) {
    this.unPauseAllActions();
    this.executeCrossFade(startAction, endAction, duration)
    return this
  }

  setDefaultAction() {
    this.setWeight(this.idleAction, 1)
    this.setWeight(this.jumpAction, 0)
    this.setWeight(this.walkAction, 0)
    this.setWeight(this.runAction, 0)
    this.actions.forEach(action => action.play())
    return this
  }

  unPauseAllActions() {
    this.actions.forEach(action => {
      action.paused = false
    })
    return this
  }

  executeCrossFade(startAction, endAction, duration) {
    this.setWeight(endAction, 1)
    endAction.time = 0
    startAction.crossFadeTo(endAction, duration, true)
    return this
  }

  setWeight(action, weight) {
    action.enabled = true
    action.setEffectiveTimeScale(1)
    action.setEffectiveWeight(weight)
    return this
  }

  update(delta) {
    this.mixer.update(delta)
    return this
  }

  static get ACTION_STOP() {
    return 'stop'
  }

  static get ACTION_WALK() {
    return 'walk'
  }

  static get ACTION_RUN() {
    return 'run'
  }

  static get ACTION_JUMP() {
    return 'jump'
  }

  static get ACTION_SHOT() {
    return 'shot'
  }
}

export default PersonAnimation