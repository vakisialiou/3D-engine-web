import { Vector3 } from 'three'
import Object3DDirection from './Object3DDirection'

class Object3DStep {
    /**
     * Получение позиции точки в направлении объекта заданного интервалом.
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

        /**
         *
         * @type {Object3DDirection}
         */
        this.direction = new Object3DDirection(object)

        /**
         *
         * @type {Vector3}
         */
        this.useAxis = new Vector3(1, 0, 1)
    }

    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {Object3DStep}
     */
    setUsingAxis(x, y, z) {
        this.useAxis.set(x, y, z)
        return this
    }

    /**
     *
     * @param {number} size
     * @returns {Vector3}
     */
    get(size) {
        const directionScalar = this.direction.get().multiplyScalar(size)
        return this.vector.copy(this.object.position).add(directionScalar).multiply(this.useAxis)
    }
}

export default Object3DStep