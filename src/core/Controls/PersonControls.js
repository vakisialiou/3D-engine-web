import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { Vector3 } from 'three'

class PersonControls extends PointerLockControls {
    constructor(camera, domElement) {
        super(camera, domElement)

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
    }

    update(delta) {
        if (this.isLocked === true) {
            this.velocity.x -= this.velocity.x * 10.0 * delta
            this.velocity.z -= this.velocity.z * 10.0 * delta
            this.velocity.y -= 9.8 * 100.0 * delta // 100.0 = mass

            this.direction.z = Number(this.canMoveForward) - Number(this.canMoveBackward)
            this.direction.x = Number(this.canMoveRight) - Number(this.canMoveLeft)

            this.direction.normalize() // this ensures consistent movements in all directions
            if (this.canMoveForward || this.canMoveBackward) {
                this.velocity.z -= this.direction.z * 400.0 * delta
            }

            if (this.canMoveLeft || this.canMoveRight) {
                this.velocity.x -= this.direction.x * 400.0 * delta
            }

            this.moveRight(- this.velocity.x * delta)
            this.moveForward(- this.velocity.z * delta)

            this.getObject().position.y += this.velocity.y * delta // new behavior
            if (this.getObject().position.y < 10) {
                this.velocity.y = 0
                this.getObject().position.y = 10
                this.canJump = true
            }
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

export default PersonControls