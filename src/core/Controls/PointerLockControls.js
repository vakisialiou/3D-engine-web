import {
    Euler,
    EventDispatcher,
    Vector3,
    Group
} from "three/build/three.module.js";

var PointerLockControls = function ( object, camera, domElement ) {

    this.domElement = domElement || document.body;
    this.isLocked = false;

    var group = new Group()
    group.add(object)
    group.add(camera)

    //
    // internals
    //

    var scope = this;

    var changeEvent = { type: 'change' };
    var lockEvent = { type: 'lock' };
    var unlockEvent = { type: 'unlock' };

    var eulerObject = new Euler( 0, 0, 0, 'YXZ' );
    var eulerCamera = new Euler( 0, 0, 0, 'YXZ' );

    var PI_2 = Math.PI / 2;

    var vec = new Vector3();

    function onMouseMove( event ) {

        if ( scope.isLocked === false ) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        eulerObject.setFromQuaternion( object.quaternion );

        eulerObject.y -= movementX * 0.002;

        // eulerCamera.y -= movementX * 0.002;
        eulerCamera.x -= movementY * 0.002;
        eulerCamera.x = Math.max( - PI_2, Math.min( PI_2, eulerCamera.x ) );

        object.quaternion.setFromEuler( eulerObject );


        camera.quaternion.setFromEuler( eulerCamera );

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

        return group;

    };

    this.getDirection = function () {

        var direction = new Vector3( 0, 0, - 1 );

        return function ( v ) {

            return v.copy( direction ).applyQuaternion( object.quaternion );

        };

    }();

    this.moveForward = function ( distance ) {

        // move forward parallel to the xz-plane
        // assumes object.up is y-up

        vec.setFromMatrixColumn( group.matrix, 0 );

        vec.crossVectors( group.up, vec );

        group.position.addScaledVector( vec, distance );

    };

    this.moveRight = function ( distance ) {

        vec.setFromMatrixColumn( group.matrix, 0 );

        group.position.addScaledVector( vec, distance );

    };

    this.lock = function () {

        this.domElement.requestPointerLock();

    };

    this.unlock = function () {

        document.exitPointerLock();

    };

    this.connect();

};

PointerLockControls.prototype = Object.create( EventDispatcher.prototype );
PointerLockControls.prototype.constructor = PointerLockControls;

export { PointerLockControls };