import * as THREE from 'three'
import {Vector3} from 'three'

class OrientationTransform {
  /**
   *
   * @param {Object3D} object
   * @param {number} [speed]
   */
  constructor(object, speed = 0) {
    /**
     *
     * @type {Object3D}
     */
    this.object = object

    /**
     *
     * @type {number}
     */
    this.speed = speed

    /**
     *
     * @type {Matrix4}
     */
    this.rotationMatrix = new THREE.Matrix4()

    /**
     *
     * @type {Quaternion}
     */
    this.targetRotation = new THREE.Quaternion()
  }

  /**
   *
   * @param {number} value
   * @returns {OrientationTransform}
   */
  setSpeed(value) {
    this.speed = value
    return this
  }

  /**
   *
   * @param {Object|Vector3} vector
   * @returns {OrientationTransform}
   */
  setTarget(vector) {
    this.rotationMatrix.lookAt(vector, this.object.position, this.object.up)
    this.targetRotation.setFromRotationMatrix(this.rotationMatrix)
    return this
  }

  /**
   *
   * @param {number} delta
   * @returns {void}
   */
  update(delta) {
    if (this.speed > 0 && !this.object.quaternion.equals(this.targetRotation)) {
      const step = this.speed * delta
      this.object.quaternion.rotateTowards(this.targetRotation, step)
    }
  }
}

export default OrientationTransform