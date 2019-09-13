import { ShaderMaterial, Color, Face4, Face3, Object3D, Mesh, BackSide } from 'three'

class Glow {
  /**
   *
   * @returns {string}
   * @private
   */
  static get _vertexShader() {
    return `
      varying vec3 vVertexWorldPosition;
      varying vec3 vVertexNormal;
      varying vec4 vFragColor;
      void main() {
        vVertexNormal = normalize(normalMatrix * normal);
        vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        // set gl_Position
        gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
  }

  /**
   *
   * @returns {string}
   * @private
   */
  static get _fragmentShader() {
    return `
      uniform vec3 glowColor;
      uniform float	coefficient;
      uniform float power;
      varying vec3 vVertexNormal;
      varying vec3 vVertexWorldPosition;
      varying vec4 vFragColor;
      void main() {
      	vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;
      	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
      	viewCameraToVertex = normalize(viewCameraToVertex);
      	float intensity	= pow(coefficient + dot(vVertexNormal, viewCameraToVertex), power);
      	gl_FragColor = vec4(glowColor, intensity);
      }
    `
  }

  /**
   *
   * @returns {ShaderMaterial}
   * @private
   */
  static get _material() {
    return new ShaderMaterial({
      uniforms: {
        coefficient	: {
          type: 'f',
          value: 1.0
        },
        power: {
          type: 'f',
          value: 2
        },
        glowColor: {
          type: 'c',
          value: new Color('pink')
        },
      },
      vertexShader: Glow._vertexShader,
      fragmentShader: Glow._fragmentShader,
      //blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })
  }

  /**
   *
   * @param {Geometry} geometry
   * @param {number} length
   * @private
   */
  static _dilateGeometry(geometry, length) {
    const vertexNormals	= [geometry.vertices.length]

    geometry.faces.forEach((face) => {
      if (face instanceof Face4) {
        vertexNormals[face.a]	= face.vertexNormals[0]
        vertexNormals[face.b]	= face.vertexNormals[1]
        vertexNormals[face.c]	= face.vertexNormals[2]
        vertexNormals[face.d]	= face.vertexNormals[3]
      } else if(face instanceof Face3) {
        vertexNormals[face.a]	= face.vertexNormals[0]
        vertexNormals[face.b]	= face.vertexNormals[1]
        vertexNormals[face.c]	= face.vertexNormals[2]
      } else {
        console.assert(false, 'Glow.dilateGeometry()')
      }
    })

    geometry.vertices.forEach((vertex, idx) => {
      const vertexNormal = vertexNormals[idx]
      vertex.x += vertexNormal.x * length
      vertex.y += vertexNormal.y * length
      vertex.z += vertexNormal.z * length
    })
  }

  /**
   * color, coefficient, power, length
   */

  /**
   *
   * @param {Mesh} mesh
   * @param {GlowParams} options
   * @returns {Mesh}
   */
  static getGlowInsideMesh(mesh, options) {
    const material = Glow._material
    material.uniforms.glowColor.value	= new Color(options.color)
    material.uniforms.coefficient.value = options.coefficient
    material.uniforms.power.value	= options.power

    const geometry = mesh.geometry.clone()
    Glow._dilateGeometry(geometry, options.length)

    return new Mesh(geometry, material)
  }

  /**
   *
   * @param {Mesh} mesh
   * @param {GlowParams} options
   * @returns {Mesh}
   */
  static getGlowOutsideMesh(mesh, options) {
    const material = Glow._material
    material.uniforms.glowColor.value = new Color(options.color)
    material.uniforms.coefficient.value = options.coefficient
    material.uniforms.power.value = options.power
    material.side = BackSide

    const geometry	= mesh.geometry.clone()
    Glow._dilateGeometry(geometry, options.length)

    return new Mesh(geometry, material)
  }
}

export default Glow