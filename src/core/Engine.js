import {
  Fog,
  Color,
  Clock,
  Scene,
  HemisphereLight,
  DirectionalLight,
  PerspectiveCamera,
  DirectionalLightHelper,
  PointLight,
  PointLightHelper
} from 'three'
import SkyDome from './SkyDome'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import PersonControls from './Controls/PersonControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import EngineRenderer from './EngineRenderer'
import Storage from './../lib/Storage'
import Shape from './Helpers/Shape'
import Target from './Shapes/Target'
import Object3DStep from './Helpers/Object3DStep'
import CameraFollower from './Helpers/CameraFollower'
import Object3DRoller from './Helpers/Object3DRoller'
import PersonAnimation from "./Controls/PersonAnimation";

const gui = new GUI();

/**
 * @param {Object} gltf
 */
class Engine {
  constructor(gltf) {
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
    this.hemiLight.groundColor.setHSL(0.095, 1, 0.75)
    this.hemiLight.position.set(0, 50, 0)
    this.scene.add(this.hemiLight)

    this.dirLight = new DirectionalLight(0xFFFFFF, 2)
    this.dirLight.position.set(150, 150, 150)
    this.scene.add(this.dirLight)

    this.dirLightHelper = new DirectionalLightHelper(this.dirLight)
    this.scene.add(this.dirLightHelper)

    this.pointLight = new PointLight(0xFFFFFF, 1, 100)
    this.pointLight.position.set(30, 10, 40)
    this.scene.add(this.pointLight)

    this.pointLightHelper = new PointLightHelper(this.pointLight)
    this.scene.add(this.pointLightHelper)

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
    ground.name = 'Ground'
    this.scene.add(ground)

    // SKYDOME
    this.sky = new SkyDome()
    this.scene.add(this.sky)

    this.target = new Target().load('textures/target.png')
    this.target.setSize(55)
    this.scene.add(this.target)

    this.personControls = new PersonControls(gltf).registerEventListeners(this.renderer.domElement)
    this.scene.add(this.personControls.person)

    const folder = gui.addFolder('Small camera')
    folder.add(this.cameraMap.position, 'x', -500, 500)
    folder.add(this.cameraMap.position, 'y', 100, 1000)
    folder.add(this.cameraMap.position, 'z', -500, 500)

    this.players = {}

    /**
     *
     * @type {Object3DStep|Vector3}
     */
    this.targetPosition = new Object3DStep(this.camera, 1900)

    /**
     *
     * @type {CameraFollower}
     */
    this.cameraFollower = new CameraFollower(this.camera)

    /**
     *
     * @type {Object3DRoller}
     */
    this.cameraRoller = new Object3DRoller(this.personControls.person, this.camera, this.camera.position.z)

    this.register = {
      mouseMoveEvent: null
    }
  }

  onMouseMove(event) {
    if (!this.personControls.isLocked) {
      return
    }
    this.cameraFollower.onMouseMove(event)
    this.personControls.personFollower.setTarget(this.targetPosition.clone().setY(0))
  }

  registerEvents() {
    this.register.mouseMoveEvent = (event) => this.onMouseMove(event)
    document.addEventListener('mousemove', this.register.mouseMoveEvent, false)

    this.personControls.addEventListener('lock', () => {
      this.target.show()
    })

    this.personControls.addEventListener('unlock', () => {
      this.target.hide()
    })

    this.personControls.addEventListener('show-target', () => {
      this.target.show()
    })

    this.personControls.addEventListener('hide-target', () => {
      this.target.hide()
    })

    this.personControls.addEventListener('action', (event) => {
      switch (event.actionName) {
        case PersonAnimation.ACTION_STOP:
          this.personControls.person.stop()
          break
        case PersonAnimation.ACTION_WALK:
          this.personControls.person.walk()
          break
        case PersonAnimation.ACTION_RUN:
          this.personControls.person.run()
          break
        case PersonAnimation.ACTION_JUMP:
          this.personControls.person.jump()
          break
        case PersonAnimation.ACTION_SHOT:
          const intersectionObjects = this.scene.children.filter((object) => {
            if (['Ground'].includes(object.name)) {
              return false
            }
            return object instanceof Shape
          })

          this.personControls.shot.fire(this.personControls.gunPosition.clone(), this.personControls.gunDirection.clone(), intersectionObjects)
          break
      }
    })

    this.personControls.shot.collisionEvent((data) => {
      this.scene.remove(data.model)
    })

    this.personControls.shot.addChargeEvent((data) => {
      this.scene.add(data.model)
    })

    this.personControls.shot.removeChargeEvent((data) => {
      this.scene.remove(data.model)
    })
  }

  unregisterEvents() {
    document.removeEventListener('mousemove', this.register.mouseMoveEvent, false)
    this.register.mouseMoveEvent = null
  }

  async loadOtherPlayer() {
    const gltf = await Engine.loadSoldierModel()
    return new PersonControls(gltf)
  }

  addPlayerToScene(personControls) {
    this.scene.add(personControls.person)
    this.updates.push({
      update: (delta) => {
        personControls.update(delta)
      }
    })
  }

  static loadSoldierModel() {
    return new Promise((resolve) => {
      const loader = new GLTFLoader()
      loader.load('models/Soldier.glb', resolve)
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

    this.targetPosition.update(delta)
    this.cameraRoller.update(delta)

    this.personControls.update(delta)
    this.personControls.updateTargetPosition(this.targetPosition)
    this.target.position.copy(this.targetPosition)
    this.cameraMap.position.x = this.personControls.person.position.x
    this.cameraMap.position.y = this.personControls.person.position.y + 70
    this.cameraMap.position.z = this.personControls.person.position.z + 100
    this.cameraMap.lookAt(this.personControls.person.position)
    this.sky.position.copy(this.personControls.person.position)

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