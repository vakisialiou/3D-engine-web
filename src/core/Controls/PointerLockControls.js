/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

import {
	Euler,
	EventDispatcher,
	Vector3
} from 'three'

import Object3DFollower from './../Helpers/Object3DFollower'
import Object3DRoller from './../Helpers/Object3DRoller'
import CameraFollower from './../Helpers/CameraFollower'
import Object3DStep from './../Helpers/Object3DStep'

var PointerLockControls = function ( person, camera, domElement ) {

	this.domElement = domElement || document.body;
	this.isLocked = false;

	var cameraNextStep = new Object3DStep(camera)
	var personFollower = new Object3DFollower(person, 4.5)
	var cameraFollower = new CameraFollower(camera)
	var cameraRoller = new Object3DRoller(person, camera, camera.position.z)
	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var lockEvent = { type: 'lock' };
	var unlockEvent = { type: 'unlock' };

    var tmp = new Vector3()//.copy(person.position)
	var interval = camera.position.z


	var eulerPerson = new Euler( 0, 0, 0, 'YXZ' );
    var eulerCamera = new Euler( 0, 0, 0, 'YXZ' );

	var PI_2 = Math.PI / 2;

	var vec = new Vector3();



	function onMouseMove( event ) {

		if ( scope.isLocked === false ) return;

		cameraFollower.onMouseMove(event)

		const target = cameraNextStep.get(- interval * 2)
		personFollower.setTarget(target)

		scope.dispatchEvent( changeEvent );

	}

	function onPointerlockChange() {

		if ( document.pointerLockElement === scope.domElement ) {

			scope.dispatchEvent( lockEvent );

			scope.isLocked = true;

		} else {

			scope.dispatchEvent( unlockEvent );

			scope.isLocked = false;

		}

	}

	function onPointerlockError() {

		console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );

	}

	this.connect = function () {

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'pointerlockchange', onPointerlockChange, false );
		document.addEventListener( 'pointerlockerror', onPointerlockError, false );

	};

	this.disconnect = function () {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'pointerlockchange', onPointerlockChange, false );
		document.removeEventListener( 'pointerlockerror', onPointerlockError, false );

	};

	this.dispose = function () {

		this.disconnect();

	};

	this.getObject = function () { // retaining this method for backward compatibility

		return camera;

	};

	this.getCameraDirection = function () {

		var direction = new Vector3( 0, 0, - 1 );
		var v = new Vector3();

		return function () {

			return v.copy( direction ).applyQuaternion( camera.quaternion );

		};

	}();

    this.getPersonDirection = function () {

        var direction = new Vector3( 0, 0, - 1 );
        var v = new Vector3();

        return function () {

            return v.copy( direction ).applyQuaternion( person.quaternion );

        };

    }();

	this.moveForward = function ( distance ) {

		// move forward parallel to the xz-plane
		// assumes person.up is y-up

		vec.setFromMatrixColumn( person.matrix, 0 );

		vec.crossVectors( person.up, vec );

        person.position.addScaledVector( vec, distance );

	};

	this.moveRight = function ( distance ) {

		vec.setFromMatrixColumn( person.matrix, 0 );

        person.position.addScaledVector( vec, distance );

	};

	this.lock = function () {

		this.domElement.requestPointerLock();

	};

	this.unlock = function () {

		document.exitPointerLock();

	};

	this.updateCamera = function (delta) {
		cameraRoller.update(delta)
	}

	this.updatePerson = function (delta) {
		personFollower.update(delta)
	}

	this.connect();

};

PointerLockControls.prototype = Object.create( EventDispatcher.prototype );
PointerLockControls.prototype.constructor = PointerLockControls;

export { PointerLockControls };
