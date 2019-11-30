import uuid from 'uuid/v4'

class UserData {
  constructor(userId = uuid()) {
    /**
     * @type {string}
     */
    this.userId = userId

    /**
     *
     * @type {string|?}
     */
    this.name = null

    /**
     *
     * @type {number}
     */
    this.health = 100
  }

  /**
   *
   * @param {String} value
   * @returns {UserData}
   */
  setUserId(value) {
    this.userId = value
    return this
  }

  /**
   *
   * @param {String} value
   * @returns {UserData}
   */
  setName(value) {
    this.name = value
    return this
  }

  /**
   *
   * @param {Number} value
   * @returns {UserData}
   */
  setHealth(value) {
    this.health = value
    return this
  }

  /**
   *
   * @param {UserData|Object} data
   */
  copy(data) {
    for (const property in this) {
      if (!this.hasOwnProperty(property) || !data.hasOwnProperty(property)) {
        continue
      }
      this[property] = data[property]
    }
    return this
  }
}

export default UserData