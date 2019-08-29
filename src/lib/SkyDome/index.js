import { fragmentShader, vertexShader } from './Shader'
import { BackSide, Color, Mesh, ShaderMaterial, SphereBufferGeometry } from 'three'

class SkyDome extends Mesh {
    constructor() {
        super()
        this.type = SkyDome.name

        this.geometry = new SphereBufferGeometry(4000, 32, 15)
        this.material = new ShaderMaterial({
            uniforms: {
                topColor: { value: new Color(0x0077ff) },
                bottomColor: { value: new Color(0xffffff) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: BackSide
        })
    }
}

export default SkyDome