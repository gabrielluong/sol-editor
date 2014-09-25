(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

function selectedOutlineMaterial () {
  return new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0x78C0BD,
    wireframeLinewidth: 2
  });
}

/* -------------------------------------------------------------------------- */

var module = angular.module( 'renderer.object_selection', [
  'service.signals'
]);

module.factory('ObjectSelection', function($rootScope, Signals) {
  function update () {
    if (!$rootScope.$$phase) $rootScope.$apply();
  }

  function ObjectSelection () {
    this.__allSelected = [];
    this.__outlines = [];

    this.selectObjectsIn2DCoordinates = function (el, start, end) {
      var tr, tl, br, bl;
      var box = new THREE.Box2();

      if (start.x > end.x && start.y > end.y) {
        box.set(
          new THREE.Vector2(end.x, end.y),
          new THREE.Vector2(start.x, start.y)
        );
      } else if (start.x < end.x && start.y < end.y) {
        box.set(
          new THREE.Vector2(start.x, start.y),
          new THREE.Vector2(end.x, end.y)
        );
      } else if (start.x < end.x && start.y > end.y) {
        box.set(
          new THREE.Vector2(start.x, end.y),
          new THREE.Vector2(end.x, start.y)
        );
      } else if (start.x > end.x && start.y < end.y) {
        box.set(
          new THREE.Vector2(end.x, start.y),
          new THREE.Vector2(start.x, end.y)
        );
      } else {return;}

      this.filterSelection = function (objects) {
        var projector = new THREE.Projector();

        var selected = [];
        var width = el.width();
        var height = el.height();
        var offset = el.offset();
        var projScreenMat = new THREE.Matrix4();
        projScreenMat.multiply(this.camera.projectionMatrix, this.camera.matrixWorldInverse);

        for (var i = 0; i < objects.length; i++) {
          var pos = new THREE.Vector3().setFromMatrixPosition( objects[i].matrixWorld );
          projector.projectVector(pos, this.camera);

          if (box.containsPoint({
                x: ((pos.x + 1) * width) / 2 + offset.left,
                y: ((-pos.y + 1) * height) / 2 + offset.top
              })) {
            selected.push(objects[i]);
          }
        }

        return selected;
      };

      this.__allSelected = this.filterSelection(this.scene.children);
      if (this.__allSelected.length > 0) {
        this.signals.object_selected.dispatch(this.__allSelected[ this.__allSelected.length - 1 ]);
      }
    };

    this.outlineSelectedObjects = function () {
      for (var i = 0; i < this.__outlines.length; i++) {
        this.accessories.scene.remove(this.__outlines[i]);
      }
      this.__outlines = [];

      this.runOnAllSelectedObjects(function (object) {
        var meshOutline = new THREE.BoxHelper();
        meshOutline.update(object);

        meshOutline.material.depthTest = false;
        meshOutline.material.transparent = true;
        meshOutline.material.color.set(0x78C0BD);
        meshOutline.quaternion = object.quaternion;
        meshOutline.scale = object.scale;
        meshOutline.position = object.position.clone().applyMatrix4( object.parent.matrixWorld );
        meshOutline.updateMatrix();
        meshOutline.matrixWorld = object.matrixWorld;
        meshOutline.matrixAutoUpdate = false;

        this.accessories.scene.add(meshOutline);

        this.__outlines.push(meshOutline);
      });
    };

    this.removeSelectedObjects = function () {
      for (var i = 0; i < this.__allSelected.length; i++) {
        this.scene.remove(this.__allSelected[i]);
        this.accessories.scene.remove(this.__outlines[i]);
      }

      this.__outlines = [];
      this.__allSelected = [];

      this.signals.object_selected.dispatch(this.scene);
      Signals.sceneChanged.dispatch(this.scene);
    };

    Mousetrap.bind('d', (function () {
      this.removeSelectedObjects();
    }).bind(this));

    this.duplicateSelectedObjects = function () {
      var __newSelection = [];
      var newSelected = null;

      for (var i = 0; i < this.__allSelected.length; i++) {
        var clone = this.__allSelected[i].clone();

        if (clone.name === this.selected.name) newSelected = clone;

        if ( clone.material ) {
          clone.material = this.__allSelected[i].material.clone();
        }

        this.scene.add(clone);
        __newSelection.push(clone);
      }

      this.__allSelected = __newSelection;

      this.setState('translate');

      this.signals.object_selected.dispatch(newSelected);
      Signals.sceneChanged.dispatch(this.scene);
    };

    Mousetrap.bind('shift+d', (function () {
      this.duplicateSelectedObjects();
    }).bind(this));

    this.events.dblclick = (function (e, el) {
      var intersects = this.getIntersectsFromClick(e.pageX, e.pageY, el, this.scene.children);

      if (intersects.length > 0) {
        var object = intersects[0].object;
        this.controls.center.copy(object.position);
      }
    }).bind(this);

    this.events.mousedown = (function (e, el) {
      if ($(':focus').prop('tagName') === 'INPUT') {
        $(':focus').blur();
      }

      var intersects = this.getIntersectsFromClick(e.pageX, e.pageY, el, this.scene.children);
      var axisIntersects = this.getIntersectsFromClick(e.pageX, e.pageY, el,
        this.accessories.axis.gizmo[this.accessories.axis.mode].pickers.children);

      if (intersects.length > 0) {
        var object = intersects[0].object;

        if (this.keys.shift) {
          this.__allSelected.push(object);
        } else {
          this.__allSelected = [object];
        }

        this.signals.object_selected.dispatch(object);
        this.lockState();
      }

      if (axisIntersects.length === 0 &&
          intersects.length === 0 &&
          !this.keys.command) {

        this.selected = null;
        this.__allSelected = [];
        this.outlineSelectedObjects();
        this.accessories.axis.detach();

      }
    }).bind(this);

    this.events.mouseup = (function (e, el) {
      this.releaseState();
    }).bind(this);

    this.signals.object_selected.add((function (object) {
      this.selected = object;
      this.outlineSelectedObjects();

      if (object.attachment) {
        this.accessories.axis.attach(object.attachment);
      } else {
        this.accessories.axis.attach(object);
      }
    }).bind(this));
  }

  return ObjectSelection;
});

/* -------------------------------------------------------------------------- */
})();
