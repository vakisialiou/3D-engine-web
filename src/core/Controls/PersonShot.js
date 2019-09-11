import Shape from './../Helpers/Shape'
import Object3DDirection from './../Helpers/Object3DDirection'
import { Vector3 } from 'three'

class PersonShot {
    /**
     *
     * @param {Scene} scene
     */
    constructor(person, scene) {
        this.person =  person
        /**
         *
         * @type {Scene}
         */
        this.scene = scene

        this.shots = []
    }

    fire(position, target) {
        const model = new Shape()
        model.setColorMaterial(0xFF0000)
        model.cube(5)
        model.position.copy(position).add(new Vector3(0, 25, 0))
        model.rotation.copy(this.person.rotation)
        this.scene.add(model)

        this.shots.push({
            model: model,
            direction: new Object3DDirection(model).get().clone(),
            velocity: new Vector3(0, 0, 1200)
        })

    }

    update(delta) {
        for (const shot of this.shots) {
            const z = shot.velocity.z * 100.0 * delta
            shot.model.position.addScaledVector(shot.direction, z * delta)
        }
    }
}

export default PersonShot