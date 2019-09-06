
class Storage {
  /**
   *
   * @returns {Array}
   */
  static get getStorageKeys() {
    return Object.keys(localStorage)
  }

  /**
   *
   * @param {string} name
   * @returns {string|?}
   */
  static getStorageItem(name) {
    return localStorage.getItem(name) || null
  }

  /**
   *
   * @param {string} name
   * @param {string|number} value
   * @returns {void}
   */
  static setStorageItem(name, value) {
    localStorage.setItem(name, value || '')
  }

  /**
   *
   * @param {string} name
   * @returns {void}
   */
  static removeStorageItem(name) {
    localStorage.removeItem(name)
  }

  /**
   *
   * @param {string} name
   * @returns {*}
   */
  static decodeStorageItem(name) {
    try {
      const data = Storage.getStorageItem(name)
      return data ? JSON.parse(data) : null
    } catch (e) {
      console.error(e)
      return null
    }
  }

  /**
   *
   * @param {string} name
   * @param {Object} value
   * @returns {void}
   */
  static encodeStorageItem(name, value) {
    Storage.setStorageItem(name, JSON.stringify(value))
  }
}

export default Storage