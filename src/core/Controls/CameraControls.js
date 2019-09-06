import { PointerLockControls } from './PointerLockControls'
import { Vector3 } from 'three'

class CameraControls extends PointerLockControls {
    constructor(person, camera, domElement) {
        super(person, camera, domElement)

        this.person = person
        this.camera = camera


        this.velocity = new Vector3()
        this.direction = new Vector3()

        this.canMoveForward = false
        this.canMoveBackward = false
        this.canMoveLeft = false
        this.canMoveRight = false
        this.canJump = false

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

        this.onKeyDown = (event) => this._onKeyDown(event)
        this.onKeyUp = (event) => this._onKeyUp(event)

        this.setKeyboardEvents()

        this.action = null
    }

    update(delta) {
        const prevAction = this.action
        this.action = null

        if (this.isLocked === true) {
            this.velocity.x -= this.velocity.x * 10.0 * delta
            this.velocity.z -= this.velocity.z * 10.0 * delta
            this.velocity.y -= 9.8 * 100.0 * delta // 100.0 = mass

            this.direction.z = Number(this.canMoveForward) - Number(this.canMoveBackward)
            this.direction.x = Number(this.canMoveRight) - Number(this.canMoveLeft)

            this.direction.normalize() // this ensures consistent movements in all directions
            if (this.canMoveForward || this.canMoveBackward) {
                this.velocity.z -= this.direction.z * 800.0 * delta
                this.action = 'run'
            }

            if (this.canMoveLeft || this.canMoveRight) {
                this.velocity.x -= this.direction.x * 800.0 * delta
                this.action = 'run'
            }

            if (!this.canMoveForward && !this.canMoveBackward && !this.canMoveLeft && !this.canMoveRight) {
                this.action = 'stop'
            }

            if (this.canMoveLeft || this.canMoveRight) {
                this.moveRight(-this.velocity.x * delta)
            }

            if (this.canMoveForward || this.canMoveBackward) {
                this.moveForward(-this.velocity.z * delta)
            }

            const h = this.camera.position.y - this.person.position.y

            this.person.position.y += this.velocity.y * delta // new behavior
            if (this.person.position.y < 0) {
                this.velocity.y = 0
                this.person.position.y = 0
                this.canJump = true
            } else {
                this.action = 'stop'
            }

            this.camera.position.y = this.person.position.y + h

            this.updateCamera(delta)

            if ((this.canMoveForward || this.canMoveBackward || this.canMoveLeft || this.canMoveRight) && this.canJump) {
                this.updatePerson(delta)
            }

        } else {
            this.action = 'stop'
        }

        if (prevAction && prevAction !== this.action) {
            this.dispatchEvent({ type: 'change-action', action: this.action, prevAction })
        }


    }

    setKeyboardEvents() {
        document.addEventListener('keydown', this.onKeyDown, false)
        document.addEventListener('keyup', this.onKeyUp, false)
    }

    removeKeyboardEvents() {
        document.removeEventListener('keydown', this.onKeyDown, false)
        document.removeEventListener('keyup', this.onKeyUp, false)
    }

    _onKeyDown(event) {
        const property = this._getKeyBoardProperty(event)
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

    _onKeyUp(event) {
        const property = this._getKeyBoardProperty(event)
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

    _getKeyBoardProperty(event) {
        for (const property in this.keyboard) {
            if (!this.keyboard.hasOwnProperty(property)) {
                continue
            }
            if (this.keyboard[property].indexOf(event.keyCode) === -1) {
                continue
            }
            return property
        }
    }
}

export default CameraControls