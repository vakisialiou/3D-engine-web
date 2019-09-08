import Object3DFollower from './../Helpers/Object3DFollower'
import Object3DPusher from './../Helpers/Object3DPusher'
import Object3DRoller from './../Helpers/Object3DRoller'
import CameraFollower from './../Helpers/CameraFollower'
import Object3DStep from './../Helpers/Object3DStep'
import {EventDispatcher, Vector3} from 'three'

class PersonControls extends EventDispatcher {
    /**
     *
     * @param {Object3D} person
     * @param {Camera} camera
     * @param {HTMLElement} [domElement]
     */
    constructor(person, camera, domElement) {
        super()

        /**
         *
         * @type {Object3D}
         */
        this.person = person

        /**
         *
         * @type {Camera}
         */
        this.camera = camera

        /**
         *
         * @type {number}
         */
        this.interval = camera.position.distanceTo(person.position) * 2

        /**
         *
         * @type {HTMLElement}
         */
        this.domElement = domElement || document.body

        /**
         *
         * @type {boolean}
         */
        this.isLocked = false

        /**
         *
         * @type {Object3DStep}
         */
        this.cameraNextStep = new Object3DStep(camera)

        /**
         *
         * @type {Object3DFollower}
         */
        this.personFollower = new Object3DFollower(person, 4.5)

        /**
         *
         * @type {CameraFollower}
         */
        this.cameraFollower = new CameraFollower(camera)

        /**
         *
         * @type {Object3DRoller}
         */
        this.cameraRoller = new Object3DRoller(person, camera, camera.position.z)

        /**
         *
         * @type {Object3DPusher}
         */
        this.personPusher = new Object3DPusher(person)

        /**
         *
         * @type {Vector3}
         */
        this.velocity = new Vector3()

        /**
         *
         * @type {Vector3}
         */
        this.direction = new Vector3()

        /**
         *
         * @type {boolean}
         */
        this.canMoveForward = false

        /**
         *
         * @type {boolean}
         */
        this.canMoveBackward = false

        /**
         *
         * @type {boolean}
         */
        this.canMoveLeft = false

        /**
         *
         * @type {boolean}
         */
        this.canMoveRight = false

        /**
         *
         * @type {boolean}
         */
        this.canJump = false

        /**
         *
         * @type {{canMoveLeft: number[], canMoveBackward: number[], canMoveRight: number[], canMoveForward: number[], canJump: number[]}}
         */
        this.keyboard = {
            canMoveForward: [
                38,/*up*/
                87 /*w*/
            ],
            canMoveLeft: [
                37,/*left*/
                65 /*a*/
            ],
            canMoveBackward: [
                40,/*down*/
                83 /*s*/
            ],
            canMoveRight: [
                39,/*right*/
                68 /*d*/
            ],
            canJump: [
                32 /*space*/
            ]
        }

        /**
         *
         * @type {{active: boolean, keyUpEvent: (Function|null), keyDownEvent: (Function|null), pointerLockErrorEvent: (Function|null), pointerLockChangeEvent: Function|null, mouseMoveEvent: Function|null}}
         */
        this.register = {
            active: false,
            keyUpEvent: null,
            keyDownEvent: null,
            mouseMoveEvent: null,
            pointerLockErrorEvent: null,
            pointerLockChangeEvent: null,
        }

        /**
         *
         * @type {string|null|?}
         */
        this.actionName = null
    }

    /**
     *
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseMove(event) {
        if (this.isLocked === false) {
            return
        }

        this.cameraFollower.onMouseMove(event)
        const target = this.cameraNextStep.get(- this.interval)
        this.personFollower.setTarget(target)
        this.dispatchEvent({ type: 'change' })
    }

    /**
     *
     * @returns {void}
     */
    onPointerLockError() {
        console.error( 'THREE.PersonControls: Unable to use Pointer Lock API' );
    }

    /**
     *
     * @returns {void}
     */
    onPointerLockChange() {
        if (document.pointerLockElement === this.domElement) {
            this.dispatchEvent({ type: 'lock' })
            this.isLocked = true
        } else {
            this.dispatchEvent({ type: 'unlock' })
            this.isLocked = false
        }
    }

    /**
     *
     * @returns {void}
     */
    onKeyDown(event) {
        const property = this.getKeyBoardProperty(event)
        switch (property) {
            case 'canMoveForward':
            case 'canMoveBackward':
            case 'canMoveLeft':
            case 'canMoveRight':
                this[property] = true
                break
            case 'canJump':
                if (this.canJump === true) {
                    this.velocity.y += 350
                }
                this.canJump = false
                break
        }
    }

    /**
     *
     * @returns {void}
     */
    onKeyUp(event) {
        const property = this.getKeyBoardProperty(event)
        switch (property) {
            case 'canMoveForward':
            case 'canMoveBackward':
            case 'canMoveLeft':
            case 'canMoveRight':
            case 'canJump':
                this[property] = false
                break
        }
    }

    /**
     *
     * @returns {string|null|?}
     */
    getKeyBoardProperty(event) {
        for (const property in this.keyboard) {
            if (!this.keyboard.hasOwnProperty(property)) {
                continue
            }
            if (this.keyboard[property].indexOf(event.keyCode) === -1) {
                continue
            }
            return property
        }
        return null
    }

    /**
     *
     * @returns {PersonControls}
     */
    lock() {
        this.domElement.requestPointerLock()
        return this
    }

    /**
     *
     * @returns {PersonControls}
     */
    unlock() {
        document.exitPointerLock()
        return this
    }

    /**
     *
     * @returns {PersonControls}
     */
    registerEventListeners() {
        this.unregisterEventListeners()
        this.register.active = true
        this.register.keyUpEvent = (event) => this.onKeyUp(event)
        this.register.keyDownEvent = (event) => this.onKeyDown(event)
        this.register.mouseMoveEvent = (event) => this.onMouseMove(event)
        this.register.pointerLockErrorEvent = (event) => this.onPointerLockError(event)
        this.register.pointerLockChangeEvent = (event) => this.onPointerLockChange(event)

        document.addEventListener('keyup', this.register.keyUpEvent, false)
        document.addEventListener('keydown', this.register.keyDownEvent, false)
        document.addEventListener('mousemove', this.register.mouseMoveEvent, false)
        document.addEventListener('pointerlockerror', this.register.pointerLockErrorEvent, false)
        document.addEventListener('pointerlockchange', this.register.pointerLockChangeEvent, false)
        return this
    }

    /**
     *
     * @returns {PersonControls}
     */
    unregisterEventListeners() {
        if (this.register.active) {
            document.removeEventListener('keyup', this.register.keyUpEvent, false)
            document.removeEventListener('keydown', this.register.keyDownEvent, false)
            document.removeEventListener('mousemove', this.register.mouseMoveEvent, false)
            document.removeEventListener('pointerlockerror', this.register.pointerLockErrorEvent, false)
            document.removeEventListener('pointerlockchange', this.register.pointerLockChangeEvent, false)

            this.register.active = false
            this.register.keyUpEvent = null
            this.register.keyDownEvent = null
            this.register.mouseMoveEvent = null
            this.register.pointerLockErrorEvent = null
            this.register.pointerLockChangeEvent = null
        }
        return this
    }

    update(delta) {
        const prevActionName = this.actionName
        this.actionName = null

        if (this.isLocked === true) {
            this.velocity.x -= this.velocity.x * 10.0 * delta
            this.velocity.z -= this.velocity.z * 10.0 * delta
            this.velocity.y -= 9.8 * 100.0 * delta // 100.0 = mass

            this.direction.z = Number(this.canMoveForward) - Number(this.canMoveBackward)
            this.direction.x = Number(this.canMoveRight) - Number(this.canMoveLeft)

            this.direction.normalize() // this ensures consistent movements in all directions
            if (this.canMoveForward || this.canMoveBackward) {
                this.velocity.z -= this.direction.z * 800.0 * delta
                this.actionName = PersonControls.ACTION_RUN
            }

            if (this.canMoveLeft || this.canMoveRight) {
                this.velocity.x -= this.direction.x * 800.0 * delta
                this.actionName = PersonControls.ACTION_RUN
            }

            if (!this.canMoveForward && !this.canMoveBackward && !this.canMoveLeft && !this.canMoveRight) {
                this.actionName = PersonControls.ACTION_STOP
            }

            if (this.canMoveLeft || this.canMoveRight) {
                this.personPusher.moveRight(-this.velocity.x * delta)
            }

            if (this.canMoveForward || this.canMoveBackward) {
                this.personPusher.moveForward(-this.velocity.z * delta)
            }

            const h = this.camera.position.y - this.person.position.y

            this.person.position.y += this.velocity.y * delta
            if (this.person.position.y < 0) {
                this.velocity.y = 0
                this.person.position.y = 0
                this.canJump = true
            } else {
                this.actionName = PersonControls.ACTION_STOP
            }

            this.camera.position.y = this.person.position.y + h

            this.cameraRoller.update(delta)

            if ((this.canMoveForward || this.canMoveBackward || this.canMoveLeft || this.canMoveRight) && this.canJump) {
                this.personFollower.update(delta)
            }

        } else {
            this.actionName = PersonControls.ACTION_STOP
        }

        if (prevActionName && prevActionName !== this.actionName) {
            this.dispatchEvent({ type: 'action', actionName: this.actionName, prevActionName })
        }
    }

    static get ACTION_STOP() {
        return 'stop'
    }

    static get ACTION_RUN() {
        return 'run'
    }

    static get ACTION_JUMP() {
        return 'jump'
    }
}

export default PersonControls