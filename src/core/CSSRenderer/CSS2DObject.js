import { Object3D } from 'three'

const CSS2DObject = function ( element ) {

  Object3D.call( this );

  this.element = element;
  this.element.style.position = 'absolute';

  this.addEventListener( 'removed', function () {

    if ( this.element.parentNode !== null ) {

      this.element.parentNode.removeChild( this.element );

    }

  } );

};

CSS2DObject.prototype = Object.create( Object3D.prototype );
CSS2DObject.prototype.constructor = CSS2DObject;

export default CSS2DObject