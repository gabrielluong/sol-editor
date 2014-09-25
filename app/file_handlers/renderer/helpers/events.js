(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var _cache = {};
var projector = new THREE.Projector();
var ray = new THREE.Raycaster();
var lastRot = 0;
var lastPos = new THREE.Vector3();

function rotateOnAxis( object, axis, angle ) {
  var _q1 = new THREE.Quaternion();

    _q1.setFromAxisAngle( axis, angle );
    object.quaternion.multiply( _q1 );
}

function worldRotation ( object ) {
  var rotationMatrix = new THREE.Matrix4().extractRotation( object.matrixWorld );

  return new THREE.Quaternion().setFromRotationMatrix( rotationMatrix );
}

function worldPosition ( object ) {
  if ( object.parent ) {
    return object.position.clone().applyMatrix4( object.parent.matrixWorld );
  } else {
    return new THREE.Vector3();
  }
}

function rotateWorld( object, axis, angle) {
  var quat = new THREE.Quaternion();

  quat.setFromAxisAngle( axis, angle );
  object.quaternion.copy( quat.multiply(object.quaternion) );
}

/* -------------------------------------------------------------------------- */

var module = angular.module('service.renderer.events', [
  'service.signals'
]);

module.factory('__Events', function($rootScope, Signals) {
  function update () {
    if (!$rootScope.$$phase) {
      $rootScope.$apply();
    }
  }

  function Events () {
    this.events = {};

    var lockedVars = {
      position: new THREE.Vector3(),
      _quaternion: new THREE.Quaternion(),
      scale: new THREE.Vector3()
    };

    var diffVars = {
      position: new THREE.Vector3(),
      _quaternion: new THREE.Quaternion(),
      scale: new THREE.Vector3()
    };

    this.getScreenCoordSelected = function () {
      var vec = new THREE.Vector3().setFromMatrixPosition( this.selected.matrixWorld );

      var vector = projector.projectVector( vec, this.camera );
      vector.x = ( vector.x * ( this.element.width() / 2 ) ) + ( this.element.width() / 2 );
      vector.y = -( ( vector.y * ( this.element.height() / 2 ) ) - ( this.element.height() / 2 ) );

      var ret = new THREE.Vector2( vector.x, vector.y );

      return ret;
    };

    this.lockState = function () {
      if (!this.selected) return;

      lockedVars.position.copy(this.selected.position);
      lockedVars._quaternion.copy(this.selected._quaternion);
      lockedVars.scale.copy(this.selected.scale);
    };

    var fn = function (locked, obj) {
      return function () {
        obj.copy(locked);
      };
    };

    this.releaseState = function () {
      if (!this.selected) return;

      var type;

      diffVars.position.copy(this.selected.position);
      diffVars._quaternion.copy(this.selected._quaternion);
      diffVars.scale.copy(this.selected.scale);

      switch (this.state) {
        case 'translate':
          type = 'position';
          break;
        case 'rotate':
          type = '_quaternion';
          break;
        case 'scale':
          type = 'scale';
          break;
      }

      this.pushChange({
        undo: fn(angular.copy(lockedVars[type]), this.selected[type]),
        redo: fn(angular.copy(diffVars[type]), this.selected[type])
      });
    };

    this.events.mouseup = (function (e, el) {
      var types = ['moving', 'rotating', 'scaling'];
      var index = types.indexOf(this.state);

      if (index !== -1) {
        Signals.sceneChanged.dispatch(this.scene);
      }

      this.setSubstate();
    }).bind(this);

    this.events.mousemove = (function (e, el) {
      this.mousePosition = new THREE.Vector2(
        e.pageX - el.offset().left,
        e.pageY - el.offset().top
      );
    }).bind(this);
  }

  return Events;
});

/* -------------------------------------------------------------------------- */
})();
