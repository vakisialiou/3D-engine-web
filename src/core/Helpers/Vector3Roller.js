import { Vector3 } from 'three'

class Vector3Roller {

    /**
     * Вращение точки (вектор) вокруг цели (вектор).
     *
     * @param {Vector3} targetVector
     * @param {Vector3} rollerVector
     * @param {number} [angle]
     * @param {number|null} [interval]
     */
    constructor(targetVector, rollerVector, angle, interval = null) {
        /**
         *
         * @type {Vector3}
         */
        this.targetVector = targetVector

        /**
         *
         * @type {Vector3}
         */
        this.rollerVector = rollerVector

        /**
         *
         * @type {number}
         */
        this.angle = angle

        /**
         *
         * @type {number}
         */
        this.interval = interval || this.rollerVector.distanceTo(this.targetVector)
    }

    /**
     *
     * @param {number} value
     * @returns {Vector3Roller}
     */
    setInterval(value) {
        this.interval = value
        return this
    }

    /**
     *
     * @param {number} value
     * @returns {Vector3Roller}
     */
    setAngle(value) {
        this.angle = value
        return this
    }

    /**
     * @param {number} delta
     * @returns {void}
     */
    update(delta) {
        this.rollerVector.x = this.targetVector.x + this.interval * Math.cos(this.angle)
        this.rollerVector.z = this.targetVector.z + this.interval * Math.sin(this.angle)
    }
}

export default Vector3Roller