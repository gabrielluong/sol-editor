(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var _cache = {};
var _hash_cache = {};
var _active_renderer = null;

/* -------------------------------------------------------------------------- */

var module = angular.module( 'service.renderer', [
  'service.accessories',
  'service.controls',
  'service.renderer.events',
  'renderer.object_selection',
  'renderer.object_movement',
  'renderer.utils',
  'renderer.keyboard',
  'renderer.changes',
  'service.events'
]);

/* -------------------------------------------------------------------------- */

module.factory('Renderer', function ($timeout,
    Controls, Accessories, __Events, ObjectSelection,
    ObjectMovement, Utils, Keyboard, Changes, Events) {

  function Renderer (guid, file_hash, options) {
    if (!guid) return;
    if (_cache[guid]) return _cache[guid];

    this.height = 0;
    this.width = 0;
    this.guid = guid;
    this.file_hash = file_hash;
    this.__loader = new THREE.ObjectLoader();
    this.state = 'translate';
    this.substate = '';
    this.playMode = false;
    this.space = 'world';

    this.signals = {
      element_changed: new signals.Signal(),
      size_changed: new signals.Signal(),
      object_selected: new signals.Signal()
    };

    Events.dispatch('renderer.before_create', this);

    // scene
    this.scene = this.getNewScene();

    // camera
    this.camera = this.__play_camera = new THREE.PerspectiveCamera( 75, this.width / this.height, 1, 10000 );
    this.camera.position.set( 50, 25, 50 );
    this.camera.lookAt(this.scene.position);

    this.selected = this.scene;

    // renderer
    this.__renderer = new THREE.CanvasRenderer({antialias: true});
    this.__renderer.setClearColor(0xFFFFFF);
    this.__renderer.setSize(this.width, this.height);
    this.__renderer.autoClear = false;

    // other
    this.accessories = new Accessories(this);
    this.controls = new Controls(this);

    // events (order is important)
    __Events.call(this);
    Utils.call(this);
    Keyboard.call(this);
    ObjectSelection.call(this);
    ObjectMovement.call(this);
    Changes.call(this);

    Events.dispatch('renderer.after_create', this);

    //DEBUG
    this.play();

    _cache[guid] = this;
  }

  Renderer.get = function (guid) {
    return _cache[guid];
  };

  Renderer.active = null;

  Renderer.getActive = function () {
    return _cache[Renderer.active];
  };

  Renderer.prototype.setElement = function (element) {
    this.element = element;

    this.width = element.width();
    this.height = element.height();

    this.size(this.width, this.height);

    this.signals.element_changed.dispatch(element);
    this.signals.size_changed.dispatch(this.width, this.height);
  };

  Renderer.prototype.setActive = function () {
    Renderer.active = this.guid;
  };

  Renderer.prototype.getNewScene = function () {
    return new THREE.Scene();
  };

  Renderer.prototype.resetInteractive = function (element) {
    this.setElement(element);

    this.controls = new Controls(this);
    this.accessories = new Accessories(this);
  };

  Renderer.prototype.setSpace = function (space) {
    this.space = space || 'local';
    this.accessories.axis.setSpace(this.space);
  };

  Renderer.prototype.setState = function (state) {
    this.state = state;
    this.accessories.axis.setMode(this.state);
    if (this.accessories.axis.object === undefined) {
      this.accessories.axis.detach();
    }
  };

  Renderer.prototype.setSubstate = function (substate) {
    this.substate = substate;
  };

  Renderer.prototype.spliceInNewScene = function (newScene) {
    var _this = this;

    var scene = this.getNewScene();

    // clear the scene
    newScene.traverse(function (object) {scene.add(object);})

    return scene;
  };

  Renderer.prototype.loadScene = function (json) {
    try {
      var newScene = this.__loader.parse(JSON.parse(json));

      this.scene = _hash_cache[this.file_hash] || this.spliceInNewScene(newScene);

      _hash_cache[this.file_hash] = this.scene;
    } catch(e) {}
  };

  Renderer.prototype.exportJSON = function () {
    var excludes = [
      this.accessories.grid.uuid,
      this.accessories.axis.uuid
    ];

    var exporter = new THREE.ObjectExporter();

    var output = JSON.stringify( exporter.parse( this.scene, excludes ), null, '\t' );
    output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

    var blob = new Blob( [ output ], { type: 'text/plain' } );

    return output;
  };

  Renderer.prototype.size = function (width, height) {
    if (!width && !height) {
      return {width: this.width, height: this.height};
    }

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.__renderer.setSize(width, height);
  };

  Renderer.prototype.pause = function () {
    console.log('pause');
    window.cancelAnimationFrame(this.__animationRequest);
  };

  Renderer.prototype.play = function () {
    console.log('play');
    this.render();
    this.__animationRequest = window.requestAnimationFrame(this.render.bind(this));
  };

  Renderer.prototype.render = function () {
    if (!this.__renderer) return;

    Events.dispatch('renderer.render', this);

    this.__renderer.clear();

    this.__renderer.render(this.scene, this.camera);
    this.__renderer.render(this.accessories.scene, this.camera);
    this.controls.update();

    if (this.playMode) {
      Events.dispatch('renderer.enter_play_mode', this);

      this.renderPlayMode();
      return;
    }

    this.__animationRequest = window.requestAnimationFrame(this.render.bind(this));
  };

  Renderer.prototype.renderPlayMode = function () {
    Events.dispatch('renderer.render_play_mode', this);

    this.__renderer.clear();
    this.__renderer.render(this.scene, this.__play_camera);

    if (!this.playMode) {
      Events.dispatch('renderer.exit_play_mode', this);

      this.render();
      return;
    }

    this.__animationRequest = window.requestAnimationFrame(this.renderPlayMode.bind(this));
  };


  return Renderer;
});

/* -------------------------------------------------------------------------- */
})();
