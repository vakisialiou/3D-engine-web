import {Sprite, SpriteMaterial, AdditiveBlending, TextureLoader, Vector3} from 'three'

class Target extends Sprite {
    constructor(props) {
        super(props)
    }

    /**
     *
     * @returns {Target}
     */
    hide() {
        this.material.opacity = 0
        this.material.needsUpdate = true
        return this
    }

    /**
     *
     * @returns {Target}
     */
    show() {
        this.material.opacity = 1
        this.material.needsUpdate = true
        return this
    }

    /**
     *
     * @param {number} value
     * @returns {Target}
     */
    setSize(value) {
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
            map: new TextureLoader().load(path),
            transparent: true,
            opacity: 0
        })
        return this
    }
}

export default Target