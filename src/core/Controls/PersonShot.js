import SingleShot from './Shot/SingleShot'

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
        this.person =  person

        /**
         *
         * @type {Scene}
         */
        this.scene = scene

        /**
         *
         * @type {Array.<Object3D|SingleShot>}
         */
        this.shots = []
    }

    fire(position, target) {
        const model = new SingleShot(this.person).render()
            .destroy(() => this.remove(model))
        this.add(model)
    }

    /**
     *
     * @param {Object3D|SingleShot} model
     * @returns {void}
     */
    remove(model) {
        this.scene.remove(model)
        const index = this.shots.indexOf(model)
        if (index !== -1) {
            this.shots.splice(index, 1)
        }
    }

    /**
     *
     * @param {Object3D|SingleShot} model
     * @returns {void}
     */
    add(model) {
        this.scene.add(model)
        this.shots.push(model)
    }

    /**
     *
     * @param {number} delta
     * @returns {void}
     */
    update(delta) {
        for (const model of this.shots) {
            model.update(delta)
        }
    }
}

export default PersonShot