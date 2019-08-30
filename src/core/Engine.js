import {
    Fog,
    Mesh,
    Color,
    Clock,
    Scene,
    WebGLRenderer,
    AnimationMixer,
    HemisphereLight,
    DirectionalLight,
    PerspectiveCamera,
    PlaneBufferGeometry,
    MeshLambertMaterial,
    HemisphereLightHelper,
    DirectionalLightHelper, Euler
} from 'three'
import SkyDome from './SkyDome'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import PersonControls from './Controls/PersonControls'

class Engine {
    constructor() {
        this.updates = []

        this.clock = new Clock()

        this.scene = new Scene()

        this.camera = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 5000)

        this.renderer = new WebGLRenderer({
            antialias: true
        })

        this.camera.position.set(0, 30, 250)

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

        // const geometry = new BoxBufferGeometry(10, 10, 10)
        // const material = new MeshBasicMaterial({ color: 0x000000 })
        // const mesh = new Mesh(geometry, material)
        // mesh.position.y = 15;
        // mesh.rotation.y = - 1;
        // mesh.castShadow = true;
        // mesh.receiveShadow = true;
        // this.scene.add(mesh)

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
        const sky = new SkyDome()
        this.scene.add(sky)


        const euler = new Euler( 0, 0, 0, 'YXZ' );

        this.mixers = []
        const loader = new GLTFLoader()
        loader.load('models/Soldier.glb', (gltf) => {

            const mesh = gltf.scene.children[0]

            const s = 0.20
            mesh.scale.set(s, s, s)
            mesh.position.y = -33
            mesh.castShadow = true
            mesh.receiveShadow = true
            this.scene.add(mesh)
            const mixer = new AnimationMixer(mesh)
            mixer.clipAction(gltf.animations[0]).setDuration(0.6).play()
            this.mixers.push(mixer)

            this.updates.push({update: () => {

                const camera = this.controls.getObject()
                mesh.rotation.z = Math.atan2( ( camera.position.x - mesh.position.x ), ( camera.position.z - mesh.position.z ) );

                    // mesh.quaternion.setFromEuler( this.controls.getObject().rotation );
                    // mesh.rotation.setFromQuaternion(this.camera.quaternion)
                    // mesh.rotation.z = this.camera.rotation.z
                    // mesh.rotation.copy(this.camera.rotation)

            }})



            console.log(mesh, this.camera)
        })

        this.controls = new PersonControls(this.camera, this.renderer.domElement)
        this.updates.push(this.controls)
        this.scene.add(this.controls.getObject())
    }

    /**
     *
     * @param {Element} container
     * @returns {Engine}
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
     * @returns {Engine}
     */
    animate() {
        requestAnimationFrame(() => this.animate())

        const delta = this.clock.getDelta()

        for (const item of this.updates) {
            item.update(delta)
        }


        for (let i = 0; i < this.mixers.length; i ++) {
            this.mixers[i].update(delta)
        }

        this.renderer.render(this.scene, this.camera)
        return this
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
}

export default Engine