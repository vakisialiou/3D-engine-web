import { AnimationMixer, Group } from 'three'

const ACTION_STOP = 'stop'
const ACTION_JUMP = 'jump'
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
        this.jumpAction = this.mixer.clipAction(gltf.animations[2])

        /**
         *
         * @type {AnimationAction[]}
         */
        this.actions = [this.idleAction, this.runAction, this.jumpAction]

        /**
         *
         * @type {string|?}
         */
        this.actionName = null
    }

    stop() {
        if (this.actionName !== ACTION_STOP) {
            this.prepareCrossFade(this.runAction, this.idleAction, 0.4)
            this.actionName = ACTION_STOP
        }
        return this
    }

    run() {
        if (this.actionName !== ACTION_RUN) {
            this.prepareCrossFade(this.idleAction, this.runAction, 0.1)
            this.actionName = ACTION_RUN
        }
        return this
    }

    jump() {
        if (this.actionName === ACTION_STOP) {
            this.prepareCrossFade(this.idleAction, this.jumpAction, 0.1)
            this.actionName = ACTION_JUMP
        } else if (this.actionName === ACTION_RUN) {
            this.prepareCrossFade(this.runAction, this.jumpAction, 0.1)
            this.actionName = ACTION_JUMP
        }
        return this
    }

    prepareCrossFade(startAction, endAction, duration) {
        this.unPauseAllActions();
        this.executeCrossFade(startAction, endAction, duration)
        return this
    }

    activateAllActions() {
        this.setWeight(this.idleAction, 1)
        this.setWeight(this.runAction, 0)
        this.setWeight(this.jumpAction, 0)
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