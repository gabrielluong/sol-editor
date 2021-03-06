/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ObjectLoader = function () {};

THREE.ObjectLoader.prototype = {

  constructor: THREE.ObjectLoader,

  addEventListener: THREE.EventDispatcher.prototype.addEventListener,
  hasEventListener: THREE.EventDispatcher.prototype.hasEventListener,
  removeEventListener: THREE.EventDispatcher.prototype.removeEventListener,
  dispatchEvent: THREE.EventDispatcher.prototype.dispatchEvent,

  load: function ( url ) {

    var scope = this;
    var request = new XMLHttpRequest();

    request.addEventListener( 'load', function ( event ) {

      var response = scope.parse( JSON.parse( event.target.responseText ) );

      scope.dispatchEvent( { type: 'load', content: response } );

    }, false );

    request.addEventListener( 'progress', function ( event ) {

      scope.dispatchEvent( { type: 'progress', loaded: event.loaded, total: event.total } );

    }, false );

    request.addEventListener( 'error', function () {

      scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

    }, false );

    request.open( 'GET', url, true );
    request.send( null );

  },

  parse: function ( json ) {
    var loader, i = 0, data;

    // geometries

    if ( json.geometries !== undefined ) {

      var geometries = [];
      loader = new THREE.JSONLoader();

      for ( i = 0, l = json.geometries.length; i < l; i ++ ) {

        var geometry;
        data = json.geometries[ i ];

        switch ( data.type ) {

          case 'PlaneGeometry':

            geometry = new THREE.PlaneGeometry(
              data.width,
              data.height,
              data.widthSegments,
              data.heightSegments
            );

            break;

          case 'CubeGeometry':

            geometry = new THREE.CubeGeometry(
              data.width,
              data.height,
              data.depth,
              data.widthSegments,
              data.heightSegments,
              data.depthSegments
            );

            break;

          case 'CylinderGeometry':

            geometry = new THREE.CylinderGeometry(
              data.radiusTop,
              data.radiusBottom,
              data.height,
              data.radiusSegments,
              data.heightSegments,
              data.openEnded
            );

            break;

          case 'SphereGeometry':

            geometry = new THREE.SphereGeometry(
              data.radius,
              data.widthSegments,
              data.heightSegments,
              data.phiStart,
              data.phiLength,
              data.thetaStart,
              data.thetaLength
            );

            break;

          case 'IcosahedronGeometry':

            geometry = new THREE.IcosahedronGeometry(
              data.radius,
              data.detail
            );

            break;

          case 'TorusGeometry':

            geometry = new THREE.TorusGeometry(
              data.radius,
              data.tube,
              data.radialSegments,
              data.tubularSegments,
              data.arc
            );

            break;

          case 'TorusKnotGeometry':

            geometry = new THREE.TorusKnotGeometry(
              data.radius,
              data.tube,
              data.radialSegments,
              data.tubularSegments,
              data.p,
              data.q,
              data.heightScale
            );

            break;

          case 'Geometry':

            geometry = loader.parse( data.data ).geometry;

            break;

        }

        if ( data.name !== undefined ) geometry.name = data.name;
        geometries.push( geometry );

      }

    }

    // materials

    if ( json.materials !== undefined ) {

      var materials = [];
      loader = new THREE.MaterialLoader();

      for ( i = 0, l = json.materials.length; i < l; i ++ ) {

        data = json.materials[ i ];
        var material = loader.parse( data );

        if ( data.name !== undefined ) material.name = data.name;

        materials.push( material );

      }

    }

    // objects

    var parseObject = function ( data ) {

      var object;

      switch ( data.type ) {

        case 'Scene':

          object = new THREE.Scene();

          break;

        case 'PerspectiveCamera':

          object = new THREE.PerspectiveCamera( data.fov, data.aspect, data.near, data.far );
          object.position.fromArray( data.position );
          object.rotation.fromArray( data.rotation );

          break;

        case 'OrthographicCamera':

          object = new THREE.OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far );
          object.position.fromArray( data.position );
          object.rotation.fromArray( data.rotation );

          break;

        case 'AmbientLight':

          object = new THREE.AmbientLight( data.color );

          break;

        case 'DirectionalLight':

          object = new THREE.DirectionalLight( data.color, data.intensity );
          object.position.fromArray( data.position );

          break;

        case 'PointLight':

          object = new THREE.PointLight( data.color, data.intensity, data.distance );
          object.position.fromArray( data.position );

          break;

        case 'SpotLight':

          object = new THREE.SpotLight( data.color, data.intensity, data.distance, data.angle, data.exponent );
          object.position.fromArray( data.position );

          break;

        case 'HemisphereLight':

          object = new THREE.HemisphereLight( data.color, data.groundColor, data.intensity );
          object.position.fromArray( data.position );

          break;

        case 'Mesh':

          object = new THREE.Mesh( geometries[ data.geometry ], materials[ data.material ] );
          object.position.fromArray( data.position );
          object.rotation.fromArray( data.rotation );
          object.scale.fromArray( data.scale );

          break;

        default:

          object = new THREE.Object3D();
          object.position.fromArray( data.position );
          object.rotation.fromArray( data.rotation );
          object.scale.fromArray( data.scale );

      }

      if ( data.name !== undefined ) object.name = data.name;
      if ( data.visible !== undefined ) object.visible = data.visible;
      if ( data.userData !== undefined ) object.userData = data.userData;

      object.scripts = data.scripts || [];
      object.tags = data.tags || [];

      // var places = {
      //   update: object.scripts.update,
      //   load: object.scripts.load,
      //   other: object.scripts.other,
      //   destroy: object.scripts.destroy
      // };

      // for ( var i in data.scripts ) {

      //   for ( var j = 0; j < data.scripts[i].length; j++ ) {

      //     places[i].push({
      //       script: new Function( data.scripts[i][j].script ),
      //       name: data.scripts[i][j].name
      //     });

      //   }

      // }


      if ( data.children !== undefined ) {

        for ( var i = 0, l = data.children.length; i < l; i ++ ) {

          object.add( parseObject( data.children[ i ] ) );

        }

      }

      return object;

    };

    return parseObject( json.object );

  }

};
