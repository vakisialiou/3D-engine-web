import {Color, Vector2, WebGLRenderer} from 'three'

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
         * @type {{active: boolean, resize: Function|null}}
         */
        this.eventListeners = { active: false, resize: null }
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
     * @returns {void}
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
    }

    /**
     *
     * @param {PerspectiveCamera} camera
     */
    resize(camera) {
        camera.aspect = this.width / this.height
        camera.updateProjectionMatrix()
        this.setSize(this.width, this.height)
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
}

export default EngineRenderer