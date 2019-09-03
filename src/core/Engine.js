import {
    Fog,
    Euler,
    Color,
    Clock,
    Scene,
    Vector3,
    WebGLRenderer,
    HemisphereLight,
    DirectionalLight,
    PerspectiveCamera,
    HemisphereLightHelper,
    DirectionalLightHelper
} from 'three'
import SkyDome from './SkyDome'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import CameraControls from './Controls/CameraControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import Shape from './Helpers/Shape'
import PersonControls from './Controls/PersonControls'


const gui = new GUI();

class Engine {
    constructor() {
        this.updates = []

        this.stats = new Stats()

        this.clock = new Clock()

        this.scene = new Scene()

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera = new PerspectiveCamera(60, width / height, 1, 5000)
        this.camera.position.set(0, 30, 250)

        this.camera2 = new PerspectiveCamera(30, 1, 1, 5000);
        this.camera2.position.set(-200, 600, -200);
        this.camera2.lookAt(new Vector3())

        this.renderer = new WebGLRenderer({
            antialias: true,
            alpha: true
        })

        this.scene.background = new Color().setHSL(0.6, 0, 1)
        this.scene.fog = new Fog(this.scene.background, 1, 3000)

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

        // CUBES
        const counts = 5
        for (let i = - counts; i < counts; i++) {
            for (let a = - counts; a < counts; a++) {
                const shape = new Shape()
                    .setTextureMaterial('textures/1.png')
                    .setPositionY(50 / 2)
                    .setPositionX((i * 250) - 100)
                    .setPositionZ(a * 250)
                    .cube(50)
                this.scene.add(shape)
            }
        }


        // GROUND
        const ground = new Shape().setTextureMaterial('textures/2.png', 50, 50, true).ground(5000, 5000)
        this.scene.add(ground)

        // SKYDOME
        this.sky = new SkyDome()
        this.scene.add(this.sky)


        this.cameraControls = new CameraControls(this.camera, this.renderer.domElement)

        // PERSON
        const loader = new GLTFLoader()
        loader.load('models/Soldier.glb', (gltf) => {
            this.person = new PersonControls(gltf).activateAllActions()
            this.scene.add(this.person)

            this.cameraControls.addEventListener('change-action', (event) => {
                switch (event.action) {
                    case 'stop':
                        this.person.stop()
                        break
                    case 'run':
                        this.person.run()
                        break
                }
            })

            const eulerCamera = new Euler(0, 0, 0, 'YXZ')

            const tmpVector = new Vector3()
            this.updates.push({
                update: (delta) => {
                    this.cameraControls.update(delta)
                    const o = this.cameraControls.getObject()
                    const v = this.cameraControls.getDirection(tmpVector).multiplyScalar(-10)
                    const p = o.position.clone().add(v)

                    this.person.position.x = p.x
                    this.person.position.z = p.z

                    eulerCamera.setFromQuaternion(o.quaternion)
                    eulerCamera.x = - Math.PI / 2
                    this.person.model.quaternion.setFromEuler(eulerCamera)

                    this.camera2.position.x = this.person.position.x
                    this.camera2.position.y = this.person.position.y + 100
                    this.camera2.position.z = this.person.position.z + 100
                    this.camera2.lookAt(this.person.position)
                    this.sky.position.copy(o.position)
                    this.person.update(delta)
                }
            })

            this.scene.add(this.cameraControls.getObject())
        })

        const folder = gui.addFolder('Small camera')
        folder.add(this.camera2.position, 'x', -500, 500)
        folder.add(this.camera2.position, 'y', 100, 1000)
        folder.add(this.camera2.position, 'z', -500, 500)

    }

    /**
     *
     * @param {Element} container
     * @returns {Engine}
     */
    render(container) {

        container.appendChild(this.stats.dom)

        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        container.appendChild(this.renderer.domElement)

        this.renderer.autoClear = false;
        this.renderer.gammaInput = true
        this.renderer.gammaOutput = true
        // this.renderer.shadowMap.enabled = true

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

        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        let left = Math.floor( 0 );
        let bottom = Math.floor( 0 );
        let width = Math.floor( windowWidth );
        let height = Math.floor( windowHeight );

        this.renderer.setViewport( left, bottom, width, height );
        this.renderer.setScissor( left, bottom, width, height );
        this.renderer.setScissorTest( true );
        this.renderer.setClearColor( new Color( 0.5, 0.5, 0.7 ) );
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.clear();
        this.renderer.render(this.scene, this.camera)


        windowWidth = window.innerHeight;
        windowHeight = window.innerHeight;

        left = Math.floor( 0 );
        bottom = Math.floor( windowHeight - (windowHeight * 0.3) );
        width = Math.floor( windowWidth * 0.3 );
        height = Math.floor( windowHeight * 0.3 );

        this.renderer.setViewport( left, bottom, width, height );
        this.renderer.setScissor( left, bottom, width, height );
        this.renderer.setScissorTest( true );
        this.renderer.setClearColor( new Color( 0.5, 0.5, 0.7 ) );
        this.camera2.aspect = width / height;

        this.camera2.updateProjectionMatrix();
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera2)

        this.stats.update()
        return this
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
}

export default Engine