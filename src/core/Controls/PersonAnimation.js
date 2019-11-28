import { AnimationMixer, Group } from 'three'
import PersonControls from './PersonControls'

const ACTION_STOP = 'stop'
const ACTION_JUMP = 'jump'
const ACTION_WALK = 'walk'
const ACTION_RUN = 'run'

class PersonAnimation extends Group {
    constructor(gltf) {
        super()

        /**
         * @type {Mesh}
         */
        this.model = gltf.scene.children[0]
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
        this.idleAction = this.mixer.clipAction(gltf.animations[0])

        /**
         *
         * @type {AnimationAction}
         */
        this.runAction = this.mixer.clipAction(gltf.animations[1])

        /**
         *
         * @type {AnimationAction}
         */
        this.walkAction = this.mixer.clipAction(gltf.animations[3])

        /**
         *
         * @type {AnimationAction}
         */
        this.jumpAction = this.mixer.clipAction(gltf.animations[2])

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
        if (this.actionName === ACTION_RUN) {
            this.prepareCrossFade(this.runAction, this.idleAction, 0.4)
            this.actionName = ACTION_STOP
        } else if (this.actionName === ACTION_JUMP) {
            this.prepareCrossFade(this.jumpAction, this.idleAction, 0.4)
            this.actionName = ACTION_STOP
        } else if (this.actionName === ACTION_WALK) {
            this.prepareCrossFade(this.walkAction, this.idleAction, 0.2)
            this.actionName = ACTION_STOP
        }
        return this
    }

    run() {
        if (this.actionName === null || this.actionName === ACTION_STOP) {
            this.prepareCrossFade(this.idleAction, this.runAction, 0.2)
            this.actionName = ACTION_RUN
        } else if (this.actionName === ACTION_JUMP) {
            this.prepareCrossFade(this.jumpAction, this.runAction, 0.1)
            this.actionName = ACTION_RUN
        } else if (this.actionName === ACTION_WALK) {
            this.prepareCrossFade(this.walkAction, this.runAction, 0.2)
            this.actionName = ACTION_RUN
        }
        return this
    }

    walk() {
        if (this.actionName === null || this.actionName === ACTION_STOP) {
            this.prepareCrossFade(this.idleAction, this.walkAction, 0.1)
            this.actionName = ACTION_WALK
        } else if (this.actionName === ACTION_JUMP) {
            this.prepareCrossFade(this.jumpAction, this.walkAction, 0.1)
            this.actionName = ACTION_WALK
        } else if (this.actionName === ACTION_RUN) {
            this.prepareCrossFade(this.runAction, this.walkAction, 0.4)
            this.actionName = ACTION_WALK
        }
        return this
    }

    jump() {
        if (this.actionName === null || this.actionName === ACTION_STOP) {
            this.prepareCrossFade(this.idleAction, this.jumpAction, 0.2)
            this.actionName = ACTION_JUMP
        } else if (this.actionName === ACTION_RUN) {
            this.prepareCrossFade(this.runAction, this.jumpAction, 0.1)
            this.actionName = ACTION_JUMP
        } else if (this.actionName === ACTION_WALK) {
            this.prepareCrossFade(this.walkAction, this.jumpAction, 0.1)
            this.actionName = ACTION_JUMP
        }
        return this
    }

    toggle(actionName) {
        this.actionName = actionName
        switch (actionName) {
            case PersonControls.ACTION_STOP:
                this.stop()
                break
            case PersonControls.ACTION_WALK:
                this.walk()
                break
            case PersonControls.ACTION_RUN:
                this.run()
                break
            case PersonControls.ACTION_JUMP:
                this.jump()
                break
        }
    }

    prepareCrossFade(startAction, endAction, duration) {
        this.unPauseAllActions();
        this.executeCrossFade(startAction, endAction, duration)
        return this
    }

    activateAllActions() {
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
}

export default PersonAnimation