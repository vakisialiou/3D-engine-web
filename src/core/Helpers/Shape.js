import {
  MirroredRepeatWrapping,
  RepeatWrapping,
  BoxGeometry,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  Mesh
} from 'three'
import TextureLoader from './TextureLoader'
import UserData from './../Store/UserData'

class Shape extends Mesh {
  /**
   *
   * @param {string|?} name
   */
  constructor(name = null) {
    super()
    this.name = name

    /**
     *
     * @type {UserData}
     */
    this.userData = new UserData()
  }

  /**
   *
   * @param {string} name
   * @returns {Shape}
   */
  setName(name) {
    this.name = name
    return this
  }

  /**
   *
   * @param {string} path
   * @param {Number} [repeatX]
   * @param {Number} [repeatY]
   * @param {boolean} [mirrored]
   * @returns {Promise}
   */
  async setTextureMaterial(path, repeatX = 1, repeatY = 1, mirrored = false) {
    const texture = await TextureLoader.load(path)
    if (mirrored) {
      texture.wrapT = MirroredRepeatWrapping
      texture.wrapS = MirroredRepeatWrapping
    } else {
      texture.wrapT = RepeatWrapping
      texture.wrapS = RepeatWrapping
    }
    texture.repeat.set(repeatX, repeatY)
    this.material = new MeshBasicMaterial({ map: texture })
    this.material.needsUpdate = true
  }

  /**
   *
   * @param {number} color
   * @returns {Shape}
   */
  setColorMaterial(color) {
    this.material = new MeshBasicMaterial({ color: color })
    this.material.needsUpdate = true
    return this
  }

  /**
   *
   * @param {number} size
   * @returns {Shape}
   */
  cube(size) {
    this.geometry = new BoxGeometry(size, size, size)
    return this
  }

  /**
   *
   * @param {number} width
   * @param {number} height
   * @returns {Shape}
   */
  ground(width, height) {
    this.geometry = new PlaneBufferGeometry(width, height)
    this.rotation.x = - Math.PI / 2
    return this
  }

  /**
   *
   * @param {number} value
   * @returns {Shape}
   */
  setPositionX(value) {
    this.position.x = value
    return this
  }

  /**
   *
   * @param {number} value
   * @returns {Shape}
   */
  setPositionY(value) {
    this.position.y = value
    return this
  }

  /**
   *
   * @param {number} value
   * @returns {Shape}
   */
  setPositionZ(value) {
    this.position.z = value
    return this
  }
}

export default Shape