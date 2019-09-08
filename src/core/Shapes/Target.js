import {Sprite, SpriteMaterial, AdditiveBlending, TextureLoader} from 'three'

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
        this.scale.set(value, value, value)
        return this
    }

    /**
     *
     * @param {string} path
     * @returns {Target}
     */
    load(path) {
        this.material = new SpriteMaterial({
            transparent: true ,
            blending: AdditiveBlending,
            map: new TextureLoader().load(path)
        })
        return this
    }
}

export default Target