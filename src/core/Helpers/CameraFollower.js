import { Euler } from 'three'

class CameraFollower {
  /**
   *
   * @param {Object3D} camera
   */
  constructor(camera) {
    /**
     *
     * @type {Object3D}
     */
    this.camera = camera

    /**
     *
     * @type {Euler}
     */
    this.euler = new Euler(0, 0, 0, 'YXZ')

    /**
     *
     * @type {number}
     */
    this.maxTop = Math.PI / 10

    /**
     *
     * @type {number}
     */
    this.maxBottom = Math.PI / 5.5
  }

  /**
   *
   * @param {MouseEvent} event
   */
  onMouseMove(event) {
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0

    this.euler.setFromQuaternion(this.camera.quaternion)
    this.euler.y -= movementX * 0.002
    this.euler.x -= movementY * 0.002
    this.euler.x = Math.max(- this.maxBottom, Math.min(this.maxTop, this.euler.x))
    this.camera.quaternion.setFromEuler(this.euler)
  }
}

export default CameraFollower