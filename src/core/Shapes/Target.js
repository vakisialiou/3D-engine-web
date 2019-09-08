import {Sprite, SpriteMaterial, AdditiveBlending, TextureLoader, Vector3} from 'three'

class Target extends Sprite {
    constructor(props) {
        super(props)

        /**
         *
         * @type {Vector3}
         */
        this.size = new Vector3()

        this.maxSize = new Vector3()

        this.step = 2.5
    }

    vibrate() {
        this.scale.addScalar(this.step * 2)
        return this
    }

    /**
     *
     * @param {number} value
     * @returns {Target}
     */
    setSize(value) {
        this.size.setScalar(value)
        this.scale.setScalar(value)
        return this
    }

    /**
     *
     * @param {string} path
     * @returns {Target}
     */
    load(path) {
        this.material = new SpriteMaterial({
            depthTest: false,
            depthWrite: false,
            blending: AdditiveBlending,
            map: new TextureLoader().load(path)
        })
        return this
    }

    update() {
        if (!this.scale.equals(this.size)) {
            this.scale.subScalar(this.step / 6)
        }
    }
}

export default Target