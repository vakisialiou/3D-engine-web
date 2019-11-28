import { Vector3 } from 'three'
import Object3DDirection from './Object3DDirection'

class Object3DStep extends Vector3 {
    /**
     * Получение позиции точки в направлении объекта заданного интервалом.
     *
     * @param {Object3D} object
     * @param {number} size
     */
    constructor(object, size) {
        super()

        /**
         *
         * @type {number}
         */
        this.size = size

        /**
         *
         * @type {Object3D}
         */
        this.object = object

        /**
         *
         * @type {Object3DDirection}
         */
        this.direction = new Object3DDirection(object)

        /**
         *
         * @type {Vector3}
         */
        this.useAxis = new Vector3(1, 1, 1)
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
     * @param {number} [delta]
     * @returns {this}
     */
    update(delta) {
        const directionScalar = this.direction.get().multiplyScalar(this.size)
        this.copy(this.object.position).add(directionScalar).multiply(this.useAxis)
        return this
    }
}

export default Object3DStep