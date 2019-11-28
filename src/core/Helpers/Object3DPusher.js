import { Vector3 } from 'three'

class Object3DPusher extends Vector3 {
    /**
     *
     * @param {Object3D} object
     */
    constructor(object) {
        super()

        /**
         *
         * @type {Object3D}
         */
        this.object = object
    }

    moveForward(distance) {

        // move forward parallel to the xz-plane
        // assumes person.up is y-up

        this.setFromMatrixColumn(this.object.matrix, 0)
        this.crossVectors(this.object.up, this)
        this.object.position.addScaledVector(this, distance)
    }

    moveRight(distance) {
        this.setFromMatrixColumn(this.object.matrix, 0)
        this.object.position.addScaledVector(this, distance)
    }
}

export default Object3DPusher