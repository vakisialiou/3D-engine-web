import Object3DDirection from '../../Helpers/Object3DDirection'
import { Mesh, MeshBasicMaterial, Vector3, SphereBufferGeometry, EventDispatcher } from 'three'

class SingleShot extends Mesh {
    /**
     *
     * @param {Object3D} person
     */
    constructor(person) {
        super()

        /**
         *
         * @type {Object3D}
         */
        this.person = person

        /**
         *
         * @type {number}
         */
        this.speed = 1200

        /**
         *
         * @type {number}
         */
        this.maxDistance = 1200

        /**
         *
         * @type {Vector3}
         */
        this.offset = new Vector3(0, 27, 0)

        /**
         *
         * @type {Vector3}
         */
        this.direction = new Object3DDirection(person).get()

        /**
         *
         * @type {Vector3}
         */
        this.startPosition = new Vector3().copy(this.person.position).add(this.offset)

        /**
         *
         * @type {EventDispatcher}
         */
        this.event = new EventDispatcher()

        this.enabled = true
    }

    /**
     *
     * @returns {SingleShot}
     */
    render() {
        this.position.copy(this.startPosition)
        this.material = new MeshBasicMaterial({ color: 0x000000 })
        this.geometry = new SphereBufferGeometry(2, 10, 10)
        return this
    }

    /**
     *
     * @param {Function} callback
     * @returns {SingleShot}
     */
    destroy(callback) {
        this.event.addEventListener('destroy', callback)
        return this
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

        const speed = this.speed * 100.0 * delta
        this.position.addScaledVector(this.direction, speed * delta)
        if (this.startPosition.distanceTo(this.position) >= this.maxDistance) {
            this.event.dispatchEvent({ type: 'destroy' })
            this.enabled = false
        }
    }
}

export default SingleShot