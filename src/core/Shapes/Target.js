import {Sprite, SpriteMaterial, AdditiveBlending, TextureLoader, Vector3} from 'three'

class Target extends Sprite {
    constructor(props) {
        super(props)
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
            map: new TextureLoader().load(path)
        })
        return this
    }
}

export default Target