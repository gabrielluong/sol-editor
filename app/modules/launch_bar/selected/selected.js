(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var path = require('path');

/* -------------------------------------------------------------------------- */

var module = angular.module( 'sol.launch_bar.selected', [
  'service.renderer',
  'factory.script_events',
  'mgcrea.ngStrap.select',
  'directive.round_number',
  'directive.section_tags'
]);

module.controller( 'sol.launch_bar.selected',
  function SelectedController($scope, Renderer, $timeout, script_events) {
  $scope.renderer = {};
  $scope.script_events = script_events;

  $scope.$watch('guid', function () {
    $timeout(function () {
      $scope.renderer = Renderer.get($scope.guid);
    });
  });

  $scope.addScript = function () {
    $scope.renderer = Renderer.getActive();

    var selected = $scope.renderer.selected;

    selected.scripts = selected.scripts || [];

    selected.scripts.unshift({
      name: 'New Script',
      file: '',
      event: $scope.script_events[0]
    });
  };

  $scope.chooseFile = function (script) {
    var elem = $('<input type="file"/>');

    elem.change(function(evt) {
      var name = $(this).val();

      _chose(name);
    });

    elem.trigger('click');

    function _chose (name) {
      script.file = name;
    }
  };

  $scope.getFileName = function (file) {
    if (!file) return 'No File';

    var splits = file.split('/');
    return splits[splits.length - 1];
  };

  $scope.visible = true;
});

/* -------------------------------------------------------------------------- */
})();
