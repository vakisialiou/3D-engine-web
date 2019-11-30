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
  PointLightHelper,
  SkinnedMesh
} from 'three'
import SkyDome from './SkyDome'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import PersonControls from './Controls/PersonControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import EngineRenderer from './EngineRenderer'
import Shape from './Helpers/Shape'
import Target from './Shapes/Target'
import Object3DStep from './Helpers/Object3DStep'
import CameraFollower from './Helpers/CameraFollower'
import Object3DRoller from './Helpers/Object3DRoller'
import PersonAnimation from './Controls/PersonAnimation'
import CSS3DSprite from './CSSRenderer/CSS3DSprite'

const gui = new GUI();

/**
 * @param {Object} gltf
 */
class Engine {
  constructor(gltf) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    /**
     *
     * @type {{ [userId]: PersonControls }}
     */
    this.players = {}

    /**
     *
     * @type {Array.<{callback: Function, controlId: string}>}
     */
    this.contols = []

    /**
     *
     * @type {Stats}
     */
    this.stats = new Stats()

    /**
     *
     * @type {Clock}
     */
    this.clock = new Clock()

    /**
     *
     * @type {Scene}
     */
    this.scene = new Scene()
    this.scene.background = new Color().setHSL(0.6, 0, 1)
    this.scene.fog = new Fog(this.scene.background, 1, 3000)

    /**
     *
     * @type {PerspectiveCamera}
     */
    this.camera = new PerspectiveCamera(60, width / height, 1, 5000)
    this.camera.position.set(0, 40, 80)

    /**
     *
     * @type {PerspectiveCamera}
     */
    this.cameraMap = new PerspectiveCamera(40, 1, 1, 500)

    /**
     *
     * @type {EngineRenderer}
     */
    this.renderer = new EngineRenderer()

    /**
     *
     * @type {HemisphereLight}
     */
    this.hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.6)

    /**
     *
     * @type {DirectionalLight}
     */
    this.dirLight = new DirectionalLight(0xFFFFFF, 2)

    /**
     *
     * @type {DirectionalLightHelper}
     */
    this.dirLightHelper = new DirectionalLightHelper(this.dirLight)

    /**
     *
     * @type {PointLight}
     */
    this.pointLight = new PointLight(0xFFFFFF, 1, 100)

    /**
     *
     * @type {PointLightHelper}
     */
    this.pointLightHelper = new PointLightHelper(this.pointLight)

    /**
     *
     * @type {Shape}
     */
    this.ground = new Shape('Ground')

    /**
     *
     * @type {SkyDome}
     */
    this.sky = new SkyDome('SkyDome')

    /**
     *
     * @type {Target}
     */
    this.target = new Target('Target')

    /**
     *
     * @type {PersonControls}
     */
    this.personControls = new PersonControls(gltf)

    /**
     *
     * @type {Object3DStep|Vector3}
     */
    this.targetPosition = new Object3DStep(this.camera, 1200)

    /**
     *
     * @type {CameraFollower}
     */
    this.cameraFollower = new CameraFollower(this.camera)

    /**
     *
     * @type {Object3DRoller}
     */
    this.cameraRoller = new Object3DRoller(this.personControls.person.position, this.camera, 20)

    /**
     *
     * @type {{mouseMoveEvent: Function|?}}
     */
    this.register = { mouseMoveEvent: null }
  }

  /**
   *
   * @returns {Engine}
   */
  debugMiniMap() {
    const folder = gui.addFolder('Small camera')
    folder.add(this.cameraMap.position, 'x', -500, 500)
    folder.add(this.cameraMap.position, 'y', 100, 1000)
    folder.add(this.cameraMap.position, 'z', -500, 500)
    return this
  }

  /**
   *
   * @returns {Engine}
   */
  debugLight() {
    this.scene.add(this.dirLightHelper)
    this.scene.add(this.pointLightHelper)
    return this
  }

  /**
   *
   * @returns {Engine}
   */
  setLight() {
    this.hemiLight.color.setHSL(0.6, 1, 0.6)
    this.hemiLight.groundColor.setHSL(0.095, 1, 0.75)
    this.hemiLight.position.set(0, 50, 0)
    this.scene.add(this.hemiLight)

    this.dirLight.position.set(150, 150, 150)
    this.scene.add(this.dirLight)

    this.pointLight.position.set(30, 10, 40)
    this.scene.add(this.pointLight)
    return this
  }

  /**
   *
   * @param {MouseEvent} event
   * @returns {void}
   * @private
   */
  _onMouseMove(event) {
    if (!this.personControls.isLocked) {
      return
    }
    this.cameraFollower.onMouseMove(event)
    this.personControls.onMouseMove(event, this.targetPosition.get())
  }

  /**
   *
   * @returns {Engine}
   */
  registerEvents() {
    this.register.mouseMoveEvent = (event) => this._onMouseMove(event)
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
          const intersectionObjects = this.getIntersectionObjects()
          this.personControls.shot.fire(this.personControls.gunPosition.clone(), this.personControls.gunDirection.clone(), intersectionObjects, true)
          break
      }
    })

    this.personControls.shot.collisionEvent((data) => {
      if (data.model instanceof SkinnedMesh) {
        // model = model.parent.parent
        // console.log(model)
        // this.removePlayer()
      } else {
        this.removeModel(data.model)
      }
    })

    this.personControls.shot.addChargeEvent((data) => {
      this.scene.add(data.model)
    })

    this.personControls.shot.removeChargeEvent((data) => {
      this.removeModel(data.model)
    })

    return this
  }

  removeModel(model) {
    for (const children of model.children) {
      if (children instanceof CSS3DSprite) {
        model.remove(children)
        break
      }
    }
    this.scene.remove(model)
    return this
  }

  getIntersectionObjects() {
    return this.scene.children.filter((object) => {
      if (['Ground'].includes(object.name)) {
        return false
      }

      if (object instanceof Shape) {
        return true
      }

      return object instanceof PersonAnimation && object.uuid !== this.personControls.person.uuid
    })
  }

  async prepare() {
    // GROUND
    await this.ground.setTextureMaterial('textures/2.png', 50, 50, true)
    this.ground.ground(5000, 5000)
    this.scene.add(this.ground)

    // TARGET
    await this.target.load('textures/target.png')
    this.target.setSize(55)
    this.scene.add(this.target)

    // SKY DOME
    this.scene.add(this.sky)

    this.personControls.registerEventListeners(this.renderer.domElement)
    this.scene.add(this.personControls.person)

    // CUBES
    const counts = 5
    for (let i = - counts; i < counts; i++) {
      for (let a = - counts; a < counts; a++) {
        const shape = new Shape(`cube-${i}-${a}`)
        await shape.setTextureMaterial('textures/1.png')
        shape
          .setPositionY(50 / 2)
          .setPositionX((i * 250) - 100)
          .setPositionZ(a * 250)
          .cube(50)

        shape.userData.setName(`Cube ${i} - ${a}`)

        const divElement = document.createElement('div')
        divElement.className = 'label'
        divElement.textContent = `${shape.userData.name}: ${shape.userData.health}%`
        const label = new CSS3DSprite(divElement)
        label.scale.set(0.2, 0.2, 0.2)
        label.position.set(0, 30, 0)
        shape.add(label)
        this.scene.add(shape)
      }
    }

    this.renderer.prepareCSS3DRenderer().enableCSS3D()
  }

  unregisterEvents() {
    document.removeEventListener('mousemove', this.register.mouseMoveEvent, false)
    this.register.mouseMoveEvent = null
  }

  async loadPlayer() {
    const gltf = await Engine.loadSoldierModel()
    return new PersonControls(gltf)
  }

  addControls(controlId, callback) {
    this.contols.push({ callback: callback, controlId })
    return this
  }

  removeControls(controlId) {
    for (let i = 0; i < this.contols.length; i++) {
      if (this.contols[i]['controlId'] === controlId) {
        this.contols.splice(i, 1)
        break
      }
    }
    return this
  }

  addPlayer(userId, personControls) {
    this.players[userId] = personControls
    this.scene.add(personControls.person)
    this.addControls(userId, (delta) => {
      personControls.update(delta)
    })

    personControls.shot.collisionEvent((data) => {
      this.removeModel(data.model)
    })

    personControls.shot.addChargeEvent((data) => {
      this.scene.add(data.model)
    })

    personControls.shot.removeChargeEvent((data) => {
      this.removeModel(data.model)
    })

    const divElement = document.createElement('div')
    divElement.className = 'label'
    divElement.textContent = `${personControls.userData.name}: ${personControls.userData.health}%`
    const label = new CSS3DSprite(divElement)
    label.scale.set(0.2, 0.2, 0.2)
    label.position.set(0, 40, 0)
    personControls.person.add(label)
  }

  removePlayer(userId) {
    const personControls = this.players[userId]
    if (!personControls) {
      return
    }

    for (const charge of personControls.shot.charges) {
      this.scene.remove(charge)
    }

    this.removeControls(userId)
    this.removeModel(personControls.person)
    delete this.players[userId]
  }

  /**
   *
   * @returns {Promise<Object3D|Object>}
   */
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

    const delta = this.clock.getDelta()

    this.personControls.update(delta)
    this.targetPosition.update(delta)
    this.cameraRoller.update(delta)
    this.target.update(this.targetPosition.get())
    this.personControls.updateTargetPosition(this.targetPosition.get())

    this.cameraMap.position.x = this.personControls.person.position.x
    this.cameraMap.position.y = this.personControls.person.position.y + 70
    this.cameraMap.position.z = this.personControls.person.position.z + 100
    this.cameraMap.lookAt(this.personControls.person.position)
    this.sky.position.copy(this.personControls.person.position)

    for (const contol of this.contols) {
      contol.callback(delta)
    }

    this.renderer
      .setWindowSize(window.innerWidth, window.innerHeight)
      .cssRendererUpdate(this.scene, this.camera)
      .update(this.scene, this.camera)

    this.renderer
      .setWindowSize(200, 200)
      .update(this.scene, this.cameraMap)

    this.stats.update()
    return this
  }
}

export default Engine
