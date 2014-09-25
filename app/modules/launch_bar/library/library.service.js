(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var module = angular.module('sol.launch_bar.library_service', [
  'service.renderer'
]);

module.factory('Library', function ($rootScope, Renderer) {
  var i = 0;

  function build (name) {
    if (!ret) return;

    var renderer = Renderer.getActive();
    var obj = createDefault(name, renderer);

    renderer.scene.add(obj);
  }

  function update () {
    if (!$rootScope.$$phase) {
      $rootScope.$apply();
    }
  }

  var ret = {
    _$scope: null,
    items: [
      {
        name: 'Native',
        children: []
      },
      {
        name: 'Lights',
        children: []
      },
      {
        name: 'Other',
        children: []
      }
    ],
    add: function (items) {
      this.items.push(items);
      update();
    }
  };

  ['Sphere', 'Cube', 'Plane', 'Cylinder', 'Cone'].forEach(function (item) {
    ret.items[0].children.push({
      name: item,
      build: build.bind(this, item.toLowerCase())
    });
  });

  ['Directional', 'Hemisphere', 'Ambient', 'Spot', 'Point'].forEach(function (item) {
    ret.items[1].children.push({
      name: item,
      build: build.bind(this, item.toLowerCase())
    });
  });

  ['Camera'].forEach(function (item) {
    ret.items[2].children.push({
      name: item,
      build: build.bind(this, item.toLowerCase())
    });
  });

  return ret;
});

/* -------------------------------------------------------------------------- */

function createDummyMaterial() {
  return new THREE.MeshPhongMaterial();
}

function createDefault ( id, renderer ) {

  var width, height, widthSegments, depthSegments, depth, geometry, mesh, light,
      radius, radiusTop, radiusBottom, heightSegments, openEnded, distance,
      angle, exponent, skyColor, groundColor, color, intensity;

  switch ( id ) {

    //-------------------------------------------//
    /**///    G E O M E T R I E S
    //-------------------------------------------//

    case 'cube':

      width = 10;
      height = 10;
      depth = 10;

      widthSegments = 1;
      heightSegments = 1;
      depthSegments = 1;

      geometry = new THREE.CubeGeometry( width, height, depth, widthSegments, heightSegments, depthSegments );
      geometry.name = 'Cube ' + geometry.id;

      mesh = new THREE.Mesh(
        geometry,
        createDummyMaterial( geometry )
      );

      mesh.name = 'Cube ' + mesh.id;

      return mesh;

    //-------------------------------------------//

    case 'plane':

      width = 20;
      height = 20;

      widthSegments = 1;
      heightSegments = 1;

      geometry = new THREE.PlaneGeometry( width, height, widthSegments, heightSegments );
      geometry.name = 'Plane ' + geometry.id;

      mesh = new THREE.Mesh(
        geometry,
        createDummyMaterial( geometry )
      );

      mesh.name = 'Plane ' + mesh.id;

      mesh.rotation.x = - Math.PI/2;

      return mesh;

    //-------------------------------------------//

    case 'cylinder':

      radiusTop = 2;
      radiusBottom = 2;
      height = 10;
      radiusSegments = 8;
      heightSegments = 1;
      openEnded = false;

      geometry = new THREE.CylinderGeometry( radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded );
      geometry.name = 'Cylinder ' + geometry.id;

      mesh = new THREE.Mesh(
        geometry,
        createDummyMaterial( geometry )
      );

      mesh.name = 'Cylinder ' + mesh.id;

      return mesh;

    //-------------------------------------------//

    case 'sphere':

      radius = 7.5;
      widthSegments = 32;
      heightSegments = 16;

      geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
      geometry.name = 'Sphere ' + geometry.id;

      mesh = new THREE.Mesh(
        geometry,
        createDummyMaterial( geometry )
      );

      mesh.name = 'Sphere ' + mesh.id;

      return mesh;

    //-------------------------------------------//

    case 'cone':

      radiusTop = 0;
      radiusBottom = 4;
      height = 10;
      radiusSegments = 8;
      heightSegments = 1;
      openEnded = false;

      geometry = new THREE.CylinderGeometry( radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded );
      geometry.name = 'Cone ' + geometry.id;

      mesh = new THREE.Mesh(
        geometry,
        createDummyMaterial( geometry )
      );

      mesh.name = 'Cone ' + mesh.id;

      return mesh;

    //-------------------------------------------//
    /**///    L I G H T S
    //-------------------------------------------//

    case 'point':

      color = 0xffffff;
      intensity = 1;
      distance = 0;

      light = new THREE.PointLight( color, intensity, distance );
      light.name = 'PointLight ' + light.id;

      light.position.set( 1, 1, 1 ).multiplyScalar( 20 );

      return light;

    //-------------------------------------------//

    case 'spot':

      color = 0xffffff;
      intensity = 1;
      distance = 0;
      angle = Math.PI * 0.1;
      exponent = 10;

      light = new THREE.SpotLight( color, intensity, distance, angle, exponent );
      light.name = 'SpotLight ' + light.id;
      light.target.name = 'SpotLight ' + light.id + ' Target';

      light.position.set( 0, 1, 0 ).multiplyScalar( 20 );

      return light;

    //-------------------------------------------//

    case 'hemisphere':

      skyColor = 0x00aaff;
      groundColor = 0xffaa00;
      intensity = 1;

      light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
      light.name = 'HemisphereLight ' + light.id;
      //light.groundColor = 0xfaad51;

      light.position.set( 1, 1, 1 ).multiplyScalar( 20 );

      return light;

    //-------------------------------------------//

    case 'directional':

      color = 0xffffff;
      intensity = 1;

      light = new THREE.DirectionalLight( color, intensity );
      light.name = 'DirectionalLight ' + light.id;
      light.target.name = 'DirectionalLight ' + light.id + ' Target';

      light.position.set( 1, 1, 1 ).multiplyScalar( 20 );

      return light;

    //-------------------------------------------//

    case 'ambient':

      color = 0x222222;

      light = new THREE.AmbientLight( color );
      light.name = 'AmbientLight ' + light.id;

      return light;

    //-------------------------------------------//
    /**///    O T H E R
    //-------------------------------------------//

    case 'camera':
      var camera = new THREE.PerspectiveCamera( 75, renderer.width / renderer.height, 1, 10000 );
      var helper = new THREE.CameraHelper(camera);

      helper.attachment = camera;

      renderer.__play_camera = camera;
      renderer.scene.add(helper);

      return camera;

  }

}



/* ----------------------------------------------------------------------------- */
})();
