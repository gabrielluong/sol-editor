(function () {

/*
 // -----------------------------------------------------------------------------
 // -----------------------------------------------------------------------------
 // --
 // -- File Name: app.js
 // --
 // -- Author: Paul Nispel
 // --
 // -----------------------------------------------------------------------------
 // -- History:
 // **
 // -- PMN - 1/18/14 - Baseline
 // --
 // -----------------------------------------------------------------------------
 // -- Copyright 2014 Skwintz
 // -----------------------------------------------------------------------------
 */

var service = angular.module( 'service.controls', [
  'service.signals',
  'service.navigator'
]);

/* ---------------------------------------------------- */

service.factory( 'Controls', function(Signals, Navigator) {

  function Controls (ctx) {
    this.guid = ctx.guid;
    this.ctx = ctx;

    this.other = new Navigator({guid: this.guid}).camera;

    this.object = ctx.camera;
    this.selectionAxis = ctx.accessories.axis;
    this.intersectionPlane = ctx.accessories.intersectionPlane;
    this.domElement = ctx.element;

    this.center = new THREE.Vector3();
    //this.centerCircle.position = this.center;

    this.userZoom = true;
    this.userZoomSpeed = 1.0;

    this.userRotate = true;
    this.userRotateSpeed = 1.0;

    this.userPan = true;
    this.userPanSpeed = 7.0;

    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    this.minDistance = 0;
    this.maxDistance = Infinity;

    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    var scope = this;

    var EPS = 0.000001;
    var PIXELS_PER_ROUND = 1800;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var zoomStart = new THREE.Vector2();
    var zoomEnd = new THREE.Vector2();
    var zoomDelta = new THREE.Vector2();

    var phiDelta = 0;
    this.phi = 0;
    var thetaDelta = 0;
    this.theta = 0;
    var scale = 1;

    var lastPosition = new THREE.Vector3();

    var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
    var state = STATE.NONE;

    // events

    var changeEvent = { type: 'change' };

    this.rotateTo = function ( angle ) {

    };

    this.rotateLeft = function ( angle ) {

      if ( angle === undefined ) {

        angle = getAutoRotationAngle();

      }

      thetaDelta -= angle;

    };

    this.rotateRight = function ( angle ) {

      if ( angle === undefined ) {

        angle = getAutoRotationAngle();

      }

      thetaDelta += angle;

    };

    this.rotateUp = function ( angle ) {

      if ( angle === undefined ) {

        angle = getAutoRotationAngle();

      }

      phiDelta -= angle;

    };

    this.rotateDown = function ( angle ) {

      if ( angle === undefined ) {

        angle = getAutoRotationAngle();

      }

      phiDelta += angle;

    };

    this.zoomIn = function ( zoomScale ) {

      if ( zoomScale === undefined ) {

        zoomScale = getZoomScale();

      }

      scale /= zoomScale;

    };

    this.zoomOut = function ( zoomScale ) {

      if ( zoomScale === undefined ) {

        zoomScale = getZoomScale();

      }

      scale *= zoomScale;

    };

    this.pan = function ( distance ) {

      distance.transformDirection( this.object.matrix );
      //distance.multiplyScalar( scope.userPanSpeed );

      this.object.position.add( distance );
      this.center.add( distance );

    };

    this.update = function () {
      if (!this.domElement) return;

      var position = this.object.position;
      var offset = position.clone().sub( this.center );

      // angle from z-axis around y-axis

      var theta = Math.atan2( offset.x, offset.z );
      this.theta = theta;

      // angle from y-axis

      var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

      if ( this.autoRotate ) {

        this.rotateLeft( getAutoRotationAngle() );

      }

      theta += thetaDelta;
      phi += phiDelta;

      // restrict phi to be between desired limits
      phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

      // restrict phi to be betwee EPS and PI-EPS
      phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

      this.phi = phi;

      var radius = offset.length() * scale;

      // restrict radius to be between desired limits
      radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

      var partRadius = radius/120;
      // if ( partRadius < 1 ) { partRadius = 1; }
      this.selectionAxis.scale.set( partRadius,partRadius,partRadius );
      //this.centerCircle.scale.set( partRadius,partRadius,partRadius );

      var otherRadius = 10;
      var otherOffset = offset.clone();

      otherOffset.x = 200 * Math.sin( phi ) * Math.sin( theta );
      otherOffset.y = 200 * Math.cos( phi );
      otherOffset.z = 200 * Math.sin( phi ) * Math.cos( theta );

      offset.x = radius * Math.sin( phi ) * Math.sin( theta );
      offset.y = radius * Math.cos( phi );
      offset.z = radius * Math.sin( phi ) * Math.cos( theta );

      position.copy( this.center ).add( offset );

      this.other.position.copy(new THREE.Vector3(0,0,0)).add( otherOffset );
      this.other.lookAt( new THREE.Vector3(0,0,0) );

      this.object.lookAt( this.center );

      thetaDelta = 0;
      phiDelta = 0;
      scale = 1;

      if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

        // this.dispatchEvent( changeEvent );

        lastPosition.copy( this.object.position );

      }

      //this.centerCircle.lookAt( this.object.position );

    };


    function getAutoRotationAngle() {

      return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

    }

    function getZoomScale() {

      return Math.pow( 0.95, scope.userZoomSpeed );

    }

    var projector = new THREE.Projector();
    var ray = new THREE.Raycaster();
    var lastPos = new THREE.Vector3();

    function getMouseCoord( e ) {

      var vector = new THREE.Vector3(
        ( ( e.pageX - scope.domElement.offset().left ) / scope.domElement.width() ) * 2 - 1,
        -( ( e.pageY - scope.domElement.offset().top ) / scope.domElement.height() ) * 2 + 1,
        0.5
      );

      projector.unprojectVector( vector, scope.object );

      ray.set( scope.object.position, vector.sub( scope.object.position ).normalize() );

      var intersects = ray.intersectObject( scope.intersectionPlane );

      if ( intersects.length > 0 ) {

        return intersects[0].point;

      }

      return new THREE.Vector3();

    }

    function onMouseDown( event ) {

      $("#center").attr("tabindex",-1).focus();

      scope.intersectionPlane.lookAt( scope.object.position );
      // scope.intersectionPlane.position.copy( scope.center );

      lastPos = getMouseCoord( event );

      if ( !scope.userRotate ) {return;}

      if ( event.button !== 2 ) {
        event.preventDefault();
      }

      if ( ctx.keys.command ) {
        state = STATE.ROTATE;

        rotateStart.set( event.clientX, event.clientY );

      } else if ( ctx.keys.control ) {

        state = STATE.PAN;

      }

      document.addEventListener( 'mousemove', onMouseMove, false );
      document.addEventListener( 'mouseup', onMouseUp, false );

    }

    function onMouseMove( event ) {

      event.preventDefault();

      if ( state === STATE.ROTATE ) {

        rotateEnd.set( event.clientX, event.clientY );
        rotateDelta.subVectors( rotateEnd, rotateStart );

        scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
        scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

        rotateStart.copy( rotateEnd );

        ctx.accessories.axis.update();

      } else if ( state === STATE.ZOOM ) {

        zoomEnd.set( event.clientX, event.clientY );
        zoomDelta.subVectors( zoomEnd, zoomStart );

        if ( zoomDelta.y > 0 ) {

          scope.zoomIn();

        } else {

          scope.zoomOut();

        }

        zoomStart.copy( zoomEnd );

      } else if ( state === STATE.PAN ) {

        handlePan( event );
        event.stopPropagation();
        //var newPanPos = BRANDY._editor.getMouseRayPoint( event.clientX, event.clientY );
        //var panDiff = lastPanPos.sub( newPanPos );
        //lastPanPos = newPanPos;

        //scope.pan( new THREE.Vector3( panDiff.x, panDiff.y, 0 ) );

      }

    }

    function handlePan ( e ) {

      var newPos = getMouseCoord( e );

      var diff = lastPos.sub( newPos );

      scope.object.position.add( diff.divideScalar(1.3) );
      scope.center.add( diff.divideScalar(1.3) );

      lastPos = newPos;

      //distance.transformDirection( this.object.matrix );
      //distance.multiplyScalar( scope.userPanSpeed );

      //this.object.position.add( distance );
      //this.center.add( distance );
    }

    function onMouseUp( event ) {

      if ( ! scope.userRotate ) {return;}

      document.removeEventListener( 'mousemove', onMouseMove, false );
      document.removeEventListener( 'mouseup', onMouseUp, false );

      state = STATE.NONE;

    }

    function onMouseWheel( event ) {
      event.preventDefault();

      if ( !scope.userZoom ) {return;}

      var delta = event.originalEvent.wheelDelta;

      ctx.accessories.axis.update();

      if ( delta > 0 ) {

        scope.zoomOut();

      } else {

        scope.zoomIn();

      }
    }

    function onKeyDown( event ) {
      if ( ! scope.userPan ) {return;}

      switch ( event.keyCode ) {

        case scope.keys.UP:
          scope.pan( new THREE.Vector3( 0, 10, 0 ) );
          break;
        case scope.keys.BOTTOM:
          scope.pan( new THREE.Vector3( 0, - 10, 0 ) );
          break;
        case scope.keys.LEFT:
          scope.pan( new THREE.Vector3( - 10, 0, 0 ) );
          break;
        case scope.keys.RIGHT:
          scope.pan( new THREE.Vector3( 10, 0, 0 ) );
          break;
      }
    }

    this.ctx.signals.element_changed.add((function () {
      this.domElement = this.ctx.element;

      this.domElement.on('mousedown', onMouseDown);
      this.domElement.on('mousewheel', onMouseWheel);
      this.domElement.on('keydown', onKeyDown);
    }).bind(this));

    this.rotationChanged = function ( phi, theta ) {
      var currentPhi = scope.phi;
      var currentTheta = scope.theta;

      var phiDelta = {x: currentPhi - phi};
      var thetaDelta = {x: currentTheta - theta};

      var phiStart = {x:0};
      var thetaStart = {x:0};

      var phiLast = 0;
      var thetaLast = 0;

      var phiTween = new TWEEN.Tween( phiStart ).to( phiDelta, 300 );

      var thetaTween = new TWEEN.Tween( thetaStart ).to( thetaDelta, 300 );

      phiTween.onUpdate( function () {
        scope.rotateUp( phiStart.x - phiLast );

        phiLast = phiStart.x;
      });

      thetaTween.onUpdate( function () {
        scope.rotateLeft( thetaStart.x - thetaLast );

        thetaLast = thetaStart.x;
      });

      phiTween.start();
      thetaTween.start();

      setInterval( function () {
        TWEEN.update();
      }, 33);
    };
  }

  Controls.get = function (guid) {
    return _cache[guid];
  };

  return Controls;

});

/* ----------------------------------------------------------------------------- */
})();
