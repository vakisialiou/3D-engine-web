import { Color } from 'three'

class GlowParams {
  constructor() {
    /**
     *
     * @type {Color}
     */
    this.color = new Color(0xFFFFFF)

    /**
     *
     * @type {number}
     */
    this.coefficient = 0.5

    /**
     *
     * @type {number}
     */
    this.power = 1.7

    /**
     *
     * @type {number}
     */
    this.length = 1.5
  }
}

export default GlowParams