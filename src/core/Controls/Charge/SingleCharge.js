import Object3DDirection from '../../Helpers/Object3DDirection'
import { Mesh, MeshBasicMaterial, Vector3, SphereBufferGeometry, EventDispatcher, Raycaster } from 'three'

class SingleCharge extends Mesh {
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
         * @type {Vector3}
         */
        this.prevPosition = new Vector3()

        /**
         *
         * @type {EventDispatcher}
         */
        this.event = new EventDispatcher()

        /**
         *
         * @type {Raycaster}
         */
        this.raycaster = new Raycaster()

        /**
         *
         * @type {boolean}
         */
        this.enabled = true
    }

    /**
     *
     * @param {Object3D[]} objects
     * @param {boolean} [recursive]
     * @returns {Intersection[]}
     */
    findIntersection(objects, recursive = false) {
        this.raycaster.ray.origin.copy(this.prevPosition)
        this.raycaster.ray.direction.copy(this.direction)
        this.raycaster.near = 0
        this.raycaster.far = this.prevPosition.distanceTo(this.position)
        return this.raycaster.intersectObjects(objects, recursive)
    }

    /**
     *
     * @returns {SingleCharge}
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
     * @returns {SingleCharge}
     */
    destroy(callback) {
        this.event.addEventListener('destroy', callback)
        return this
    }

   /**
     *
     * @param {Function} callback
     * @returns {SingleCharge}
     */
   change(callback) {
        this.event.addEventListener('change', callback)
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

        this.prevPosition.copy(this.position)
        const speed = this.speed * 100.0 * delta
        this.position.addScaledVector(this.direction, speed * delta)
        this.event.dispatchEvent({ type: 'change' })

        if (this.startPosition.distanceTo(this.position) >= this.maxDistance) {
            this.event.dispatchEvent({ type: 'destroy' })
            this.enabled = false
        }
    }
}

export default SingleCharge