import * as THREE from 'three'

const CSS3DObject = function ( element ) {

  THREE.Object3D.call( this );

  this.element = element;
  this.element.style.position = 'absolute';

  this.addEventListener( 'removed', function () {

    if ( this.element.parentNode !== null ) {

      this.element.parentNode.removeChild( this.element );

    }

  } );

};

CSS3DObject.prototype = Object.create( THREE.Object3D.prototype );
CSS3DObject.prototype.constructor = CSS3DObject;

export default CSS3DObject