import { Vector3 } from 'three'

class Object3DDirection {

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
    this.direction = new Vector3(0, 0, - 1)

    /**
     *
     * @type {Vector3}
     */
    this.tmp = new Vector3()
  }

  /**
   *
   * @returns {Vector3}
   */
  get() {
    return this.tmp.copy(this.direction).applyQuaternion(this.object.quaternion)
  }
}

export default Object3DDirection