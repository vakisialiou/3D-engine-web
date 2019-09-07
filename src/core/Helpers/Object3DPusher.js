import { Vector3 } from 'three'

class Object3DPusher {
    /**
     *
     * @param {Object3D} object
     */
    constructor(object) {

        /**
         *
         * @type {Object3D}
         */
        this.object = object

        /**
         *
         * @type {Vector3}
         */
        this.vector = new Vector3()
    }

    moveForward(distance) {

        // move forward parallel to the xz-plane
        // assumes person.up is y-up

        this.vector.setFromMatrixColumn(this.object.matrix, 0)
        this.vector.crossVectors(this.object.up, this.vector)
        this.object.position.addScaledVector(this.vector, distance)
    }

    moveRight(distance) {
        this.vector.setFromMatrixColumn(this.object.matrix, 0)
        this.object.position.addScaledVector(this.vector, distance)
    }
}

export default Object3DPusher