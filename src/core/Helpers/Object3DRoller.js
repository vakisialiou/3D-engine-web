import Object3DDirection from './Object3DDirection'
import {Vector3} from 'three'

class Object3DRoller {
  /**
   * Вращение объекта вокруг цели (объекта) на растоянии.
   *
   * @param {Vector3} targetVector
   * @param {Object3D} rollerObject
   * @param {number} interval
   */
  constructor(targetVector, rollerObject, interval) {
    /**
     *
     * @type {Vector3}
     */
    this.vector = new Vector3()

    /**
     *
     * @type {Vector3}
     */
    this.targetVector = targetVector

    /**
     *
     * @type {Object3D}
     */
    this.rollerObject = rollerObject

    /**
     *
     * @type {Object3DDirection}
     */
    this.direction = new Object3DDirection(rollerObject)

    /**
     *
     * @type {number}
     */
    this.interval = interval
  }

  /**
   *
   * @param {number} value
   * @returns {Object3DRoller}
   */
  setInterval(value) {
    this.interval = value
    return this
  }

  /**
   * @param {number} delta
   * @returns {void}
   */
  update(delta) {
    const directionScalar = this.direction.get().multiplyScalar(- this.interval)
    const point = this.vector.copy(this.targetVector).add(directionScalar)
    this.rollerObject.position.x = point.x
    this.rollerObject.position.z = point.z
  }
}

export default Object3DRoller