import SingleCharge from './Charge/SingleCharge'
import {EventDispatcher} from 'three'

class PersonShot {
  /**
   *
   * @param {Object3D} person
   * @param {Scene} scene
   */
  constructor(person, scene) {
    /**
     *
     * @type {Object3D}
     */
    this.person = person

    /**
     *
     * @type {Scene}
     */
    this.scene = scene

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
   * @param {Object} data
   * @callback HitCallback
   */

  /**
   *
   * @param {HitCallback} hitCallback
   * @returns {PersonShot}
   */
  onHit(hitCallback) {
    this.event.addEventListener('hit', hitCallback)
    return this
  }

  /**
   *
   * @param {Array.<Object3D>} intersectObjects
   * @param {boolean} [recursive]
   * @returns {PersonShot}
   */
  fire(intersectObjects, recursive = false) {
    const model = new SingleCharge(this.person).render()
      .destroy(() => this.removeCharge(model))
      .change(() => {
        const intersections = model.findIntersection(intersectObjects, recursive)
        if (intersections.length > 0) {
          this.event.dispatchEvent({ type: 'hit', intersections })
          this.removeCharge(model)
        }
      })
    this.addCharge(model)
    return this
  }

  /**
   *
   * @param {SingleCharge} model
   * @returns {void}
   */
  removeCharge(model) {
    this.scene.remove(model)
    const index = this.charges.indexOf(model)
    if (index !== -1) {
      this.charges.splice(index, 1)
    }
  }

  /**
   *
   * @param {SingleCharge} model
   * @returns {void}
   */
  addCharge(model) {
    this.scene.add(model)
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