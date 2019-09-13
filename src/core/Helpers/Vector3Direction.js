import { Vector3 } from 'three'

class Vector3Direction {
  /**
   *
   * @param {Vector3} targetVector3
   * @param {Vector3} casterVector3
   */
  constructor(targetVector3, casterVector3) {
    /**
     *
     * @type {Vector3}
     */
    this.tmp = new Vector3()

    /**
     *
     * @type {Vector3}
     */
    this.targetVector3 = targetVector3

    /**
     *
     * @type {Vector3}
     */
    this.casterVector3 = casterVector3
  }

  /**
   *
   * @returns {Vector3}
   */
  get() {
    return this.tmp.copy(this.targetVector3).sub(this.casterVector3).normalize()
  }
}

export default Vector3Direction