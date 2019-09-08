import {
    Fog,
    Color,
    Clock,
    Scene,
    HemisphereLight,
    DirectionalLight,
    PerspectiveCamera,
    HemisphereLightHelper,
    DirectionalLightHelper
} from 'three'
import SkyDome from './SkyDome'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import PersonControls from './Controls/PersonControls'
import PersonAnimation from './Controls/PersonAnimation'
import Stats from 'three/examples/jsm/libs/stats.module'
import EngineRenderer from './EngineRenderer'
import Storage from './../lib/Storage'
import Shape from './Helpers/Shape'
import Target from './Shapes/Target'

const gui = new GUI();

class Engine {
    constructor() {
        this.updates = []

        this.enabled = Storage.getStorageItem('engine-status') === 'enabled'

        const engineFolder = gui.addFolder('Engine')
        engineFolder.add(this, 'enabled').onChange(() => {
            Storage.setStorageItem('engine-status', this.enabled ? 'enabled' : 'disabled')
        })

        this.stats = new Stats()

        this.clock = new Clock()

        this.scene = new Scene()

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera = new PerspectiveCamera(60, width / height, 1, 5000)
        this.camera.position.set(0, 40, 80)

        this.cameraMap = new PerspectiveCamera(40, 1, 1, 500)

        this.renderer = new EngineRenderer()

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

        this.personControls = null
        this.personAnimation = null

        const folder = gui.addFolder('Small camera')
        folder.add(this.cameraMap.position, 'x', -500, 500)
        folder.add(this.cameraMap.position, 'y', 100, 1000)
        folder.add(this.cameraMap.position, 'z', -500, 500)


        this.target = new Target().load('textures/target.png')
        this.target.setSize(40)
        this.target.position.z = - 600
        this.camera.add(this.target)
        this.scene.add(this.camera)

        setInterval(() => {
            let i = 0
            const ss = setInterval(() => {
                i++
                this.target.vibrate()
                if (i === 20) {
                    clearInterval(ss)
                }
            }, 100)
        }, 5000)
    }

    loadPerson() {
        return new Promise((resolve) => {
            // PERSON
            const loader = new GLTFLoader()
            loader.load('models/Soldier.glb', (gltf) => {
                this.personAnimation = new PersonAnimation(gltf).activateAllActions()
                this.personControls = new PersonControls(this.personAnimation, this.camera, this.renderer.domElement).registerEventListeners()

                this.scene.add(this.personAnimation)

                this.personControls.addEventListener('action', (event) => {
                    switch (event.actionName) {
                        case PersonControls.ACTION_STOP:
                            this.personAnimation.stop()
                            break
                        case PersonControls.ACTION_WALK:
                            this.personAnimation.walk()
                            break
                        case PersonControls.ACTION_RUN:
                            this.personAnimation.run()
                            break
                        case PersonControls.ACTION_JUMP:
                            this.personAnimation.jump()
                            break
                    }
                })

                this.updates.push({
                    update: (delta) => {
                        this.personControls.update(delta)
                        this.cameraMap.position.x = this.personAnimation.position.x
                        this.cameraMap.position.y = this.personAnimation.position.y + 70
                        this.cameraMap.position.z = this.personAnimation.position.z + 100
                        this.cameraMap.lookAt(this.personAnimation.position)
                        this.sky.position.copy(this.personAnimation.position)
                        this.personAnimation.update(delta)
                        this.target.update()
                    }
                })

                resolve()
            })
        })
    }

    /**
     *
     * @param {Element} container
     * @returns {Engine}
     */
    initGraph(container) {
        this.renderer.start(this.camera)
        container.appendChild(this.stats.dom)
        container.appendChild(this.renderer.domElement)
        return this
    }

    /**
     *
     * @returns {Engine}
     */
    animate() {
        requestAnimationFrame(() => this.animate())

        if (!this.enabled) {
            this.stats.update()
            return this
        }

        const delta = this.clock.getDelta()

        for (const item of this.updates) {
            item.update(delta)
        }

        this.renderer
            .setWindowSize(window.innerWidth, window.innerHeight)
            .update(this.scene, this.camera)

        this.renderer
            .setWindowSize(200, 200)
            .update(this.scene, this.cameraMap)

        this.stats.update()
        return this
    }
}

export default Engine