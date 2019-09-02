import {
    AnimationMixer
} from 'three'

class PersonAnimation {
    constructor(gltf) {
        this.mesh = gltf.scene.children[0]
        this.mesh.scale.set(0.20, 0.20, 0.20)

        this.mixer = new AnimationMixer(this.mesh)

        this.idleAction = this.mixer.clipAction(gltf.animations[0])
        this.runAction = mixer.clipAction(gltf.animations[1])

        this.actions = [this.idleAction, this.runAction]
    }

    prepareCrossFade(startAction, endAction, duration) {
        this.unPauseAllActions();
        // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
        // else wait until the current action has finished its current loop
        if (startAction === this.idleAction) {
            this.executeCrossFade(startAction, endAction, duration)
        } else {
            this.synchronizeCrossFade(startAction, endAction, duration)
        }
    }

    activateAllActions() {
        this.setWeight(this.idleAction, 1)
        this.setWeight(this.runAction, 0)
        this.actions.forEach(action => action.play())
    }

    unPauseAllActions() {
        this.actions.forEach(action => {
            action.paused = false
        })
    }

    executeCrossFade(startAction, endAction, duration) {
        // Not only the start action, but also the end action must get a weight of 1 before fading
        // (concerning the start action this is already guaranteed in this place)
        this.setWeight(endAction, 1)
        endAction.time = 0
        // Crossfade with warping - you can also try without warping by setting the third parameter to false
        startAction.crossFadeTo(endAction, duration, true)
    }

    setWeight(action, weight) {
        action.enabled = true
        action.setEffectiveTimeScale(1)
        action.setEffectiveWeight(weight)
    }

    synchronizeCrossFade(startAction, endAction, duration) {
        const onLoopFinished = ( event ) => {
            if (event.action === startAction) {
                this.mixer.removeEventListener('loop', onLoopFinished)
                this.executeCrossFade(startAction, endAction, duration)
            }
        }
        this.mixer.addEventListener('loop', onLoopFinished)
    }
}

export default PersonAnimation