import Object3DDirection from './Object3DDirection'
import {Vector3} from 'three'

class Object3DRoller {
  /**
   * Вращение объекта вокруг цели (объекта) на растоянии.
   *
   * @param {Object3D} targetObject
   * @param {Object3D} rollerObject
   * @param {number|null} [interval]
   */
  constructor(targetObject, rollerObject, interval = null) {
    /**
     *
     * @type {Object3D}
     */
    this.targetObject = targetObject

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
    this.interval = interval || this.rollerObject.position.z

    /**
     *
     * @type {Vector3}
     */
    this.vector = new Vector3()
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
    const point = this.vector.copy(this.targetObject.position).add(directionScalar)
    this.rollerObject.position.x = point.x
    this.rollerObject.position.z = point.z
  }
}

export default Object3DRoller