(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var projector = new THREE.Projector();
var ray = new THREE.Raycaster();

/* -------------------------------------------------------------------------- */

var module = angular.module( 'renderer.utils', [
  'service.signals'
]);

function Module (Signals) {
  function Utils () {
    this.getIntersectsFromClick = function(x, y, el, objects){
      return this.getIntersectsFromCoords(
        ( ( x - el.offset().left ) / el.width() ) * 2 - 1,
        -( ( y - el.offset().top ) / el.height() ) * 2 + 1,
        objects
      );
    };

    this.getIntersectsFromCoords = function (x, y, objects) {
      var vector = new THREE.Vector3(
        x,
        y,
        0.5
      );

      projector.unprojectVector(vector, this.camera);

      ray.set(this.camera.position, vector.sub(this.camera.position).normalize());

      return ray.intersectObjects(objects, true);
    };

    this.runOnAllSelectedObjects = function (fn) {
      for (var i = 0, l = this.__allSelected.length; i < l; i++) {
        fn.call(this, this.__allSelected[i]);
      }
    };

    this.worldRotation = function (object) {
      var rotationMatrix = new THREE.Matrix4().extractRotation( object.matrixWorld );

      return new THREE.Quaternion().setFromRotationMatrix( rotationMatrix );
    };

    this.worldPosition = function (object) {
      if ( object.parent ) {
        return object.position.clone().applyMatrix4( object.parent.matrixWorld );
      } else {
        return new THREE.Vector3();
      }
    };

    this.rotateWorld = function ( object, axis, angle) {
      var quat = new THREE.Quaternion();

      quat.setFromAxisAngle( axis, angle );
      object.quaternion.copy( quat.multiply(object.quaternion) );
    };

    this.rotateOnAxis = function ( object, axis, angle ) {
      var _q1 = new THREE.Quaternion();

      _q1.setFromAxisAngle( axis, angle );
      object.quaternion.multiply( _q1 );
    };

    this.getMouseRayPoint = function ( x, y, object ) {
      var intersectionPlane = this.accessories.intersectionPlane;
      var intersects;
      var end = new THREE.Vector3();
      var vector = new THREE.Vector3(
        ( ( x ) / this.element.width() ) * 2 - 1,
        -( ( y ) / this.element.height() ) * 2 + 1,
        0.5
      );

      intersectionPlane.position.copy( this.selected.position );
      intersectionPlane.lookAt( this.camera.position );

      object = object || intersectionPlane;

      projector.unprojectVector( vector, this.camera );

      ray.set( this.camera.position, vector.sub( this.camera.position ).normalize() );

      if ( object instanceof Array ) {
        intersects = ray.intersectObjects( object );
      } else {
        intersects = ray.intersectObject( object );
      }



      if ( intersects.length > 0 ) {
        end = intersects[0].point;
      }

      return end;

    };
  }
  return Utils;
}

module.factory('Utils', Module);

/* -------------------------------------------------------------------------- */
})();
