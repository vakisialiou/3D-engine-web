import SingleCharge from './Charge/SingleCharge'
import {EventDispatcher} from 'three'

class PersonShot {
  constructor() {

    /**
     *
     * @type {Array.<Object3D|SingleCharge>}
     */
    this.charges = []

    /**
     *
     * @type {EventDispatcher}
     */
    this.event = new EventDispatcher()
  }

  /**
   * @param {Object3D|Object} data
   * @callback HitCallback
   */

  /**
   *
   * @param {HitCallback} collisionCallback
   * @returns {PersonShot}
   */
  collisionEvent(collisionCallback) {
    this.event.addEventListener('collision', collisionCallback)
    return this
  }

  /**
   *
   * @param {HitCallback} addCallback
   * @returns {PersonShot}
   */
  addChargeEvent(addCallback) {
    this.event.addEventListener('add', addCallback)
    return this
  }

  /**
   *
   * @param {HitCallback} removeCallback
   * @returns {PersonShot}
   */
  removeChargeEvent(removeCallback) {
    this.event.addEventListener('remove', removeCallback)
    return this
  }

  /**
   *
   * @param {Vector3} startPosition
   * @param {Vector3} direction
   * @param {Array.<Object3D>} intersectObjects
   * @param {boolean} [recursive]
   * @returns {PersonShot}
   */
  fire(startPosition, direction, intersectObjects, recursive = false) {
    const model = new SingleCharge(startPosition, direction).render()
      .destroy(() => this._removeCharge(model))
      .change(() => {
        const intersections = model.findIntersection(intersectObjects, recursive)
        if (intersections.length > 0) {
          this.event.dispatchEvent({ type: 'collision', model: intersections[0]['object'], intersections })
          this._removeCharge(model)
        }
      })
    this._addCharge(model)
    return this
  }

  /**
   *
   * @param {SingleCharge} model
   * @returns {void}
   * @private
   */
  _removeCharge(model) {
    this.event.dispatchEvent({ type: 'remove', model })
    const index = this.charges.indexOf(model)
    if (index !== -1) {
      this.charges.splice(index, 1)
    }
  }

  /**
   *
   * @param {SingleCharge} model
   * @returns {void}
   * @private
   */
  _addCharge(model) {
    this.event.dispatchEvent({ type: 'add', model })
    this.charges.push(model)
  }

  /**
   *
   * @param {number} delta
   * @returns {void}
   */
  update(delta) {
    for (const charge of this.charges) {
      charge.update(delta)
    }
  }
}

export default PersonShot