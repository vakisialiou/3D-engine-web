import { Vector3, Matrix4, Quaternion } from 'three'

class Object3DFollower {
  /**
   * Плавное направление объекта в сторону цели с заданной скоростью.
   *
   * @param {Object3D} object
   * @param {number} [speed]
   * @param {boolean} [enabled]
   */
  constructor(object, speed = 0.5, enabled = true) {
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
     * @type {boolean}
     */
    this.enabled = enabled

    /**
     *
     * @type {Matrix4}
     */
    this.rotationMatrix = new Matrix4()

    /**
     *
     * @type {Quaternion}
     */
    this.targetRotation = new Quaternion()

    /**
     *
     * @type {Vector3}
     */
    this.vector = new Vector3()

    /**
     *
     * @type {Vector3}
     */
    this.useAxis = new Vector3(1, 0, 1)
  }

  /**
   *
   * @param {boolean} [value]
   * @returns {Object3DFollower}
   */
  enable(value = true) {
    this.enabled = value
    return this
  }

  /**
   *
   * @param {number} value
   * @returns {Object3DFollower}
   */
  setSpeed(value) {
    this.speed = value
    return this
  }

  /**
   *
   * @param {Object|Vector3} vector
   * @returns {Object3DFollower}
   */
  setTarget(vector) {
    this.vector.copy(vector)
    const v = vector.clone().multiply(this.useAxis)
    this.rotationMatrix.lookAt(this.object.position, v, this.object.up)
    this.targetRotation.setFromRotationMatrix(this.rotationMatrix)
    return this
  }

  /**
   *
   * @returns {Vector3}
   */
  getTarget() {
    return this.vector
  }

  /**
   *
   * @param {number} delta
   * @returns {void}
   */
  update(delta) {
    if (!this.enabled) {
      return
    }

    if (this.speed === 0) {
      return
    }

    if (this.object.quaternion.equals(this.targetRotation)) {
      return
    }

    this.object.quaternion.rotateTowards(this.targetRotation, this.speed * delta)
  }
}

export default Object3DFollower