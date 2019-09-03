import { AnimationMixer, Group } from 'three'

const ACTION_STOP = 'stop'
const ACTION_RUN = 'run'

class Person extends Group {
    constructor(gltf) {
        super()
        this.model = gltf.scene.children[0]
        this.model.scale.set(0.20, 0.20, 0.20)

        this.mixer = new AnimationMixer(this.model)

        this.idleAction = this.mixer.clipAction(gltf.animations[0])
        this.runAction = this.mixer.clipAction(gltf.animations[1])

        this.actions = [this.idleAction, this.runAction]
        this.action = null
        this.add(this.model)
    }

    stop() {
        if (this.action !== ACTION_STOP) {
            this.prepareCrossFade(this.runAction, this.idleAction, 0.4)
            this.action = ACTION_STOP
        }
        return this
    }

    run() {
        if (this.action !== ACTION_RUN) {
            this.prepareCrossFade(this.idleAction, this.runAction, 0.1)
            this.action = ACTION_RUN
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

export default Person