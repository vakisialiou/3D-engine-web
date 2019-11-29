import CSS3DObject from './CSS3DObject'

const CSS3DSprite = function ( element ) {

  CSS3DObject.call( this, element );

};

CSS3DSprite.prototype = Object.create( CSS3DObject.prototype );
CSS3DSprite.prototype.constructor = CSS3DSprite;

export default CSS3DSprite