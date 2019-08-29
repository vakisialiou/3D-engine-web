import {
    Fog,
    Mesh,
    Color,
    Clock,
    Scene,
    BackSide,
    WebGLRenderer,
    ShaderMaterial,
    HemisphereLight,
    DirectionalLight,
    PerspectiveCamera,
    MeshBasicMaterial,
    BoxBufferGeometry,
    PlaneBufferGeometry,
    MeshLambertMaterial,
    SphereBufferGeometry,
    HemisphereLightHelper,
    DirectionalLightHelper, Geometry
} from 'three'

class Ini {
    constructor() {
        this.clock = new Clock()

        this.scene = new Scene()

        this.camera = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 5000)

        this.renderer = new WebGLRenderer({
            antialias: true
        })

        this.camera.position.set(0, 0, 250)

        this.scene.background = new Color().setHSL(0.6, 0, 1)
        this.scene.fog = new Fog(this.scene.background, 1, 5000)

        this.hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.6)
        this.hemiLight.color.setHSL(0.6, 1, 0.6)
        this.hemiLight.groundColor.setHSL( 0.095, 1, 0.75)
        this.hemiLight.position.set(0, 50, 0)
        this.scene.add(this.hemiLight)

        this.hemiLightHelper = new HemisphereLightHelper(this.hemiLight, 10)
        this.scene.add(this.hemiLightHelper)

        this.dirLight = new DirectionalLight(0xffffff, 1)
        this.dirLight.color.setHSL(0.1, 1, 0.95)
        this.dirLight.position.set(- 1, 1.75, 1)
        this.dirLight.position.multiplyScalar(30)
        this.scene.add(this.dirLight)
        this.dirLight.castShadow = true
        this.dirLight.shadow.mapSize.width = 2048
        this.dirLight.shadow.mapSize.height = 2048

        const d = 50;
        this.dirLight.shadow.camera.left = - d
        this.dirLight.shadow.camera.right = d
        this.dirLight.shadow.camera.top = d
        this.dirLight.shadow.camera.bottom = - d
        this.dirLight.shadow.camera.far = 3500
        this.dirLight.shadow.bias = - 0.0001

        this.dirLightHeper = new DirectionalLightHelper(this.dirLight, 10)
        this.scene.add(this.dirLightHeper)

        const geometry = new BoxBufferGeometry(10, 10, 10)
        const material = new MeshBasicMaterial({ color: 0x000000 })
        const mesh = new Mesh(geometry, material)
        mesh.position.y = 15;
        mesh.rotation.y = - 1;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh)

        // GROUND
        const groundGeo = new PlaneBufferGeometry(10000, 10000)
        const groundMat = new MeshLambertMaterial({ color: 0xffffff })
        groundMat.color.setHSL(0.095, 1, 0.75)
        const ground = new Mesh(groundGeo, groundMat)
        ground.position.y = - 33
        ground.rotation.x = - Math.PI / 2
        ground.receiveShadow = true
        this.scene.add(ground)

        // SKYDOME
        const vertexShader = `
        
            varying vec3 vWorldPosition;
            
			void main() {
			
				vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
				vWorldPosition = worldPosition.xyz;
				
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}
			
        `
        const fragmentShader = `
        
            uniform vec3 topColor;
			uniform vec3 bottomColor;
			uniform float offset;
			uniform float exponent;
			
			varying vec3 vWorldPosition;
			
			void main() {
			
				float h = normalize( vWorldPosition + offset ).y;
				gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
			}
			
        `
        const uniforms = {
            topColor: { value: new Color(0x0077ff) },
            bottomColor: { value: new Color(0xffffff) },
            offset: { value: 33 },
            exponent: { value: 0.6 }
        }
        uniforms['topColor'].value.copy(this.hemiLight.color)
        this.scene.fog.color.copy(uniforms['bottomColor'].value)

        const skyGeo = new SphereBufferGeometry(4000, 32, 15)
        const skyMat = new ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: BackSide
        })

        const sky = new Mesh(skyGeo, skyMat)
        this.scene.add(sky)
    }

    /**
     *
     * @param {Element} container
     * @returns {Ini}
     */
    render(container) {
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        container.appendChild(this.renderer.domElement)

        this.renderer.gammaInput = true
        this.renderer.gammaOutput = true
        this.renderer.shadowMap.enabled = true

        window.addEventListener('resize', () => this.onWindowResize(), false )
        return this
    }

    /**
     *
     * @returns {Ini}
     */
    animate() {
        requestAnimationFrame(() => this.animate)
        this.renderer.render(this.scene, this.camera)
        return this
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
}

export default Ini