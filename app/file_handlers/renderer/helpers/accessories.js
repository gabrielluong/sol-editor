(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var _cache = {};

/* -------------------------------------------------------------------------- */

var module = angular.module( 'service.accessories', []);

module.factory( 'Accessories', function() {
  function Accessories (ctx) {
    this.guid = ctx.guid;

    this.intersectionPlane = new THREE.Mesh(
      new THREE.PlaneGeometry( 100000, 100000, 8, 8 ),
      new THREE.MeshBasicMaterial({
        wireframe:true, side: THREE.DoubleSide, visible: false})
    );

    this.scene = new THREE.Scene();

    this.grid = new THREE.GridHelper(150, 5);
    this.grid.setColors(0xECECEC, 0xE5E5E5);

    this.scene.add(this.grid);
    this.scene.add(this.intersectionPlane);

    this.createAxis = function () {
      this.axis = new THREE.TransformControls(ctx.camera, ctx.element[0]);

      this.scene.add(this.axis);
    };

    if (ctx.element) {
      this.createAxis();
    }

    ctx.signals.element_changed.add(this.createAxis, this);
  }

  Accessories.get = function (guid) {
    return _cache[guid];
  };

  return Accessories;
});

/* -------------------------------------------------------------------------- */

function SelectionAxis ( size ) {
  var lineGeometry = new THREE.Geometry();
  var headGeometry = new THREE.CylinderGeometry(0, 0.8, 2.5);

  //Invisible geometry for selecting axes
  var selectionGeometry = new THREE.CubeGeometry( 1, 10, 1 );

  //The object that will hold all of our other objects
  var axis = new THREE.Object3D();

  //******** X SELECTION BOX
  var selectionx = new THREE.Mesh(selectionGeometry);
  selectionx.rotation.z = -Math.PI / 2;
  selectionx.position.x = 5;
  selectionx.name = "selx";
  selectionx.material.visible = false;

  axis.add( selectionx );

  //******** Y SELECTION BOX
  var selectiony = new THREE.Mesh(selectionGeometry);
  selectiony.position.y = 5;
  selectiony.name = "sely";
  selectiony.material.visible = false;

  axis.add( selectiony );

  //******** Z SELECTION BOX
  var selectionz = new THREE.Mesh(selectionGeometry);
  selectionz.rotation.x = Math.PI / 2;
  selectionz.position.z = 5;
  selectionz.name = "selz";
  selectionz.material.visible = false;

  axis.add( selectionz );

  //Add our selection boxes so we can raycast against it
  axis.selectionBoxes = new Array( selectionx, selectiony, selectionz );

  //---------------------------------------------//

  lineGeometry.vertices.push(
    new THREE.Vector3(), new THREE.Vector3( size || 1, 0, 0 ),
    new THREE.Vector3(), new THREE.Vector3( 0, size || 1, 0 ),
    new THREE.Vector3(), new THREE.Vector3( 0, 0, size || 1 )
  );

  lineGeometry.colors.push(
    new THREE.Color( 0xff0000 ), new THREE.Color( 0xffaa00 ),
    new THREE.Color( 0x00ff00 ), new THREE.Color( 0xaaff00 ),
    new THREE.Color( 0x0000ff ), new THREE.Color( 0x00aaff )
  );

  var lineMaterial = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );
    lineMaterial.depthTest = false;
    lineMaterial.transparent = true;
  var lines = new THREE.Line( lineGeometry, lineMaterial, THREE.LinePieces );
    lines.visible = false;

  axis.add( lines );

  var headxMat = new THREE.MeshBasicMaterial( { color: new THREE.Color( 0xD75B5B ) } );
    headxMat.depthTest = false;
    headxMat.transparent = true;
  var headx = new THREE.Mesh( headGeometry, headxMat );
    headx.position.x = 10;
    headx.visible = false;
    headx.rotation.z = -Math.PI / 2;

  axis.add( headx );

  var headyMat = new THREE.MeshBasicMaterial( { color: new THREE.Color( 0xB2D75B ) } );
    headyMat.depthTest = false;
    headyMat.transparent = true;
  var heady = new THREE.Mesh( headGeometry, headyMat );
    heady.position.y = 10;
    heady.visible = false;

  axis.add( heady );

  var headzMat = new THREE.MeshBasicMaterial( { color: new THREE.Color( 0x5B9ED7 ) } );
    headzMat.depthTest = false;
    headzMat.transparent = true;
  var headz = new THREE.Mesh( headGeometry, headzMat );
    headz.position.z = 10;
    headz.visible = false;
    headz.rotation.x = Math.PI / 2;

  axis.add( headz );

  this.axis = axis;


  axis.show = function () {
    this.children[3].visible = true;
    this.children[4].visible = true;
    this.children[5].visible = true;
    this.children[6].visible = true;
  };

  axis.hide = function () {
    this.children[3].visible = false;
    this.children[4].visible = false;
    this.children[5].visible = false;
    this.children[6].visible = false;
  };

  return axis;
}

/* -------------------------------------------------------------------------- */
})();
