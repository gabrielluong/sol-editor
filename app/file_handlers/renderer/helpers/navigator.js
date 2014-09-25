
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

var _cache = {};

var service = angular.module( 'service.navigator', [
  'service.signals'
]);

/* ---------------------------------------------------- */

service.factory('Navigator', function(Signals) {
  function Navigator (scope, element) {
    if (!scope.guid) return;
    if (_cache[scope.guid]) {
      angular.extend(_cache[scope.guid].scope, scope);
      return _cache[scope.guid];
    }

    this.scope = scope;

    this.guid = scope.guid;

    this.signals = {
      element_changed: new signals.Signal()
    };

    if (element) {
      this.setElement(element);
    }

    // renderer
    this.__renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    this.__renderer.setSize( 75, 75 );

    // scene
    this.scene = new THREE.Scene();

    // camera
    this.camera = new THREE.PerspectiveCamera( 50, 1, 1, 5000 );
    this.camera.position.set( 140, 100, 140 );
    this.camera.lookAt( this.scene.position );

    this.selected = 'cube';

    addNavObjects(this.scene);
    this.navObject = create3DObject();
    this.scene.add(this.navObject);

    //DEBUG
    this.play();

    this.yellow = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xf1f122 ) } );
    this.red = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xD75B5B ) } );
    this.green = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xB2D75B ) } );
    this.blue = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0x5B9ED7 ) } );
    this.light_grey = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xcccccc ) } );

    _cache[scope.guid] = this;
  }

  Navigator.get = function (guid) {
    return _cache[guid];
  };

  Navigator.prototype.setElement = function (element) {
    this.element = element;

    this.signals.element_changed.dispatch(element);
  };

  Navigator.prototype.project = function (x, y, clicked) {
    var s = this.navObject.children;
      s[0].material = new THREE.MeshPhongMaterial({color: 0x333333});
      s[1].material = this.red;
      s[2].material = this.green;
      s[3].material = this.blue;
      s[4].material = this.light_grey;
      s[5].material = this.light_grey;
      s[6].material = this.light_grey;


    var projector = new THREE.Projector();
    var raycaster = new THREE.Raycaster();

    var vector = new THREE.Vector3(
      ( x / 75 ) * 2 - 1,
      -( y / 75 ) * 2 + 1,
      0.5
    );

    projector.unprojectVector( vector, this.camera );

    raycaster.ray = new THREE.Ray( this.camera.position, vector.sub( this.camera.position ).normalize() );

    var intersects = raycaster.intersectObjects( this.navObject.children, true );

    if ( intersects.length > 0 ) {
      var object = intersects[0].object;

      object.material = this.yellow;

      // from a click event
      if ( clicked ) {
        if ( object.name === this.selected ) {
          this.scope.renderer.controls.rotationChanged(1.2204874418288088,0.7958701389094145);
          this.selected = 'cube';
          return;
        }

        switch ( object.name ) {
          case 'cube':
            this.scope.renderer.controls.rotationChanged(1.2204874418288088,0.7958701389094145);
            this.selected = 'cube';
            break;

          case 'y+':
            this.scope.renderer.controls.rotationChanged(
              0,
              0
            );
            this.selected = 'y+';
            break;

          case 'x+':
            this.scope.renderer.controls.rotationChanged(
              Math.PI/2,
              Math.PI/2
            );
            this.selected = 'x+';
            break;

          case 'z+':
            this.scope.renderer.controls.rotationChanged(
              Math.PI/2,
              0
            );
            this.selected = 'z+';
            break;

          case 'x-':
            this.scope.renderer.controls.rotationChanged(
              Math.PI/2,
              -Math.PI/2
            );
            this.selected = 'x-';
            break;

          case 'y-':
            this.scope.renderer.controls.rotationChanged(
              Math.PI,
              0
            );
            this.selected = 'y-';
            break;

          case 'z-':
            this.scope.renderer.controls.rotationChanged(
              Math.PI/2,
              -Math.PI
            );
            this.selected = 'z-';
            break;
        }
      }
    }
  };

  Navigator.prototype.pause = function () {
    this.cancelAnimationFrame(this.__animationRequest);
  };

  Navigator.prototype.play = function () {
    this.__animationRequest = window.requestAnimationFrame(this.render.bind(this));
  };

  Navigator.prototype.render = function () {
    this.__renderer.render(this.scene, this.camera);
    this.__animationRequest = window.requestAnimationFrame(this.render.bind(this));
  };

  return Navigator;
});

function addNavObjects (scene) {
  var navLight;

  scene.add( new THREE.AmbientLight(0x444444) );

  navLight = new THREE.PointLight( 0xffffff, 0.5, 1000);
  navLight.position.set(0,0,200);
  scene.add(navLight);

  navLight = new THREE.PointLight( 0xffffff, 0.5, 1000);
  navLight.position.set(0,0,-200);
  scene.add(navLight);

  navLight = new THREE.PointLight( 0xffffff, 0.5, 1000);
  navLight.position.set(200,0,0);
  scene.add(navLight);

  navLight = new THREE.PointLight( 0xffffff, 0.5, 1000);
  navLight.position.set(-200,0,0);
  scene.add(navLight);

  navLight = new THREE.PointLight( 0xffffff, 0.5, 1000);
  navLight.position.set(0,200,0);
  scene.add(navLight);

  navLight = new THREE.PointLight( 0xffffff, 0.5, 1000);
  navLight.position.set(0,-200,0);
  scene.add(navLight);
}

function create3DObject () {
  var viewNav = new THREE.Object3D();

  var geo = new THREE.CubeGeometry(50,50,50);
  var mat = new THREE.MeshPhongMaterial({color: 0x333333});

  var cube = new THREE.Mesh( geo, mat );
  cube.name = "cube";

  viewNav.add( cube );

  var headGeometry = new THREE.CylinderGeometry(0, 20, 55);

  var headxMat = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xD75B5B ) } );
  headx = new THREE.Mesh( headGeometry, headxMat );
    headx.position.x = 50;
    headx.rotation.z = Math.PI / 2;
    headx.name = "x+";
    headx.defaultMat = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xD75B5B ) } );

  viewNav.add( headx );

  var headyMat = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xB2D75B ) } );
  heady = new THREE.Mesh( headGeometry, headyMat );
    heady.position.y = 50;
    heady.rotation.x = Math.PI;
    heady.name = "y+";
    heady.defaultMat = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xB2D75B ) } );

  viewNav.add( heady );

  var headzMat = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0x5B9ED7 ) } );
  headz = new THREE.Mesh( headGeometry, headzMat );
    headz.position.z = 50;
    headz.rotation.x = -Math.PI / 2;
    headz.name = "z+";
    headz.defaultMat = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0x5B9ED7 ) } );

  viewNav.add( headz );

  var headBlankMatz = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xcccccc ) } );

  var headzneg = new THREE.Mesh( headGeometry, headBlankMatz );
    headzneg.position.z = -50;
    headzneg.rotation.x = Math.PI / 2;
    headzneg.name = 'z-';
    headzneg.defaultMat = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xcccccc ) } );

  var headBlankMatx = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xcccccc ) } );
  headxneg = new THREE.Mesh( headGeometry, headBlankMatx );
    headxneg.position.x = -50;
    headxneg.rotation.z = -Math.PI / 2;
    headxneg.name = 'x-';
    headxneg.defaultMat = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xcccccc ) } );

  var headBlankMaty = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xcccccc ) } );
  headyneg = new THREE.Mesh( headGeometry, headBlankMaty );
    headyneg.position.y = -50;
    headyneg.name = 'y-';
    headyneg.defaultMat = new THREE.MeshPhongMaterial( { color: new THREE.Color( 0xcccccc ) } );

  viewNav.add( headzneg );
  viewNav.add( headxneg );
  viewNav.add( headyneg );

  return viewNav;
}

/* ----------------------------------------------------------------------------- */
})();
