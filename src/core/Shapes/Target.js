import { Sprite, SpriteMaterial, AdditiveBlending } from 'three'
import TextureLoader from './../Helpers/TextureLoader'

class Target extends Sprite {
  constructor(name) {
    super()
    this.name = name
  }

  /**
   *
   * @returns {Target}
   */
  hide() {
    this.material.opacity = 0
    this.material.needsUpdate = true
    return this
  }

  /**
   *
   * @returns {Target}
   */
  show() {
    this.material.opacity = 1
    this.material.needsUpdate = true
    return this
  }

  /**
   *
   * @param {number} value
   * @returns {Target}
   */
  setSize(value) {
    this.scale.setScalar(value)
    return this
  }

  /**
   *
   * @param {string} path
   * @returns {Promise}
   */
  async load(path) {
    this.material = new SpriteMaterial({
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
      map: await TextureLoader.load(path),
      transparent: true,
      opacity: 0
    })
  }

  /**
   *
   * @param {Vector3} position
   * @returns {Target}
   */
  update(position) {
    this.position.copy(position)
    return this
  }
}

export default Target