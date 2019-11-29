import {Color, Vector2, WebGLRenderer} from 'three'
import CSS2DRenderer from './CSSRenderer/CSS2DRenderer'
import CSS3DRenderer from './CSSRenderer/CSS3DRenderer'

class EngineRenderer extends WebGLRenderer {
  /**
   *
   * @param {WebGLRendererParameters} [parameters]
   */
  constructor(parameters) {
    super(parameters)

    this.antialias = true
    this.alpha = true
    this.gammaInput = true
    this.gammaOutput = true

    /**
     * Margin left, top
     *
     * @type {Vector2}
     */
    this.windowMargin = new Vector2()

    /**
     * Size width, height
     *
     * @type {Vector2}
     */
    this.windowSize = new Vector2(this.width,  this.height)

    /**
     *
     * @type {CSS2DRenderer}
     */
    this.css2DRenderer = new CSS2DRenderer()

    /**
     *
     * @type {CSS3DRenderer}
     */
    this.css3DRenderer = new CSS3DRenderer()

    /**
     *
     * @type {{active: boolean, resize: Function|null}}
     */
    this.eventListeners = { active: false, resize: null }

    /**
     *
     * @type {{enable2D: boolean, enable3D: boolean}}
     */
    this.cssRenderer = { enable2D: false, enable3D: false }
  }

  /**
   * Margin left, top
   *
   * @param {number} left
   * @param {number} top
   * @returns {EngineRenderer}
   */
  setWindowMargin(left, top) {
    this.windowMargin.x = left
    this.windowMargin.y = top
    return this
  }

  /**
   * Size width, height
   *
   * @param {number} width
   * @param {number} height
   * @returns {EngineRenderer}
   */
  setWindowSize(width, height) {
    this.windowSize.x = width
    this.windowSize.y = height
    return this
  }

  /**
   *
   * @returns {number}
   */
  get width() {
    return window.innerWidth
  }

  /**
   *
   * @returns {number}
   */
  get height() {
    return window.innerHeight
  }

  /**
   *
   * @param {Scene} scene
   * @param {PerspectiveCamera} camera
   * @returns {EngineRenderer}
   */
  update(scene, camera) {
    const left = Math.floor(this.windowMargin.x)
    const bottom = Math.floor(this.height - (this.windowSize.y + this.windowMargin.y))
    const width = Math.floor(this.windowSize.x)
    const height = Math.floor(this.windowSize.y)

    this.setViewport(left, bottom, width, height)
    this.setScissor(left, bottom, width, height)
    this.setScissorTest(true)

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    this.render(scene, camera)
    return this
  }

  /**
   *
   * @param {Scene} scene
   * @param {PerspectiveCamera} camera
   * @returns {EngineRenderer}
   */
  cssRendererUpdate(scene, camera) {
    if (this.cssRenderer.enable2D) {
      this.css2DRenderer.render(scene, camera)
    }
    if (this.cssRenderer.enable3D) {
      this.css3DRenderer.render(scene, camera)
    }
    return this
  }

  /**
   *
   * @param {PerspectiveCamera} camera
   * @returns {void}
   */
  resize(camera) {
    camera.aspect = this.width / this.height
    camera.updateProjectionMatrix()
    this.setSize(this.width, this.height)
    this.css2DRenderer.setSize(this.width, this.height)
    this.css3DRenderer.setSize(this.width, this.height)
  }

  /**
   *
   * @param {PerspectiveCamera} camera
   * @returns {EngineRenderer}
   */
  start(camera) {
    this.setPixelRatio(window.devicePixelRatio)
    this.setSize(this.width, this.height)

    if (!this.eventListeners.active) {
      this.eventListeners.resize = () => this.resize(camera)
      window.addEventListener('resize', this.eventListeners.resize, false )
    }
    return this
  }

  /**
   *
   * @returns {EngineRenderer}
   */
  stop() {
    if (this.eventListeners.active) {
      this.eventListeners.resize = null
      window.removeEventListener('resize', this.eventListeners.resize, false )
    }
    return this
  }

  /**
   *
   * @returns {EngineRenderer}
   */
  enableCSS2D() {
    this.cssRenderer.enable2D = true
    return this
  }

  /**
   *
   * @returns {EngineRenderer}
   */
  enableCSS3D() {
    this.cssRenderer.enable3D = true
    return this
  }

  /**
   *
   * @returns {EngineRenderer}
   */
  prepareCSS2DRenderer() {
    this.css2DRenderer.setSize(this.width, this.height)
    this.css2DRenderer.domElement.style.position = 'absolute'
    this.css2DRenderer.domElement.style.top = 0
    document.body.appendChild(this.css2DRenderer.domElement)
    return this
  }

  /**
   *
   * @returns {EngineRenderer}
   */
  prepareCSS3DRenderer() {
    this.css3DRenderer.setSize(this.width, this.height)
    this.css3DRenderer.domElement.style.position = 'absolute'
    this.css3DRenderer.domElement.style.top = 0
    document.body.appendChild(this.css3DRenderer.domElement)
    return this
  }
}

export default EngineRenderer