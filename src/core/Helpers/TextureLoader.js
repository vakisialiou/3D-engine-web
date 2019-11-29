import { TextureLoader as TLoader, Texture } from 'three'

const loader = new TLoader()
const cache = {}

class TextureLoader {
  /**
   *
   * @param {string} path
   * @returns {Promise<Texture>}
   */
  static load(path) {
    return new Promise((resolve) => {
      if (cache.hasOwnProperty(path)) {
        resolve(cache[path])
        return
      }
      loader.load(path, (texture) => {
        cache[path] = texture
        resolve(cache[path])
      })
    })
  }
}

export default TextureLoader