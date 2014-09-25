(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var module = angular.module( 'sol.launch_bar.file_tree', [
  'service.files',
  'service.tabs',
  'service.pallette'
]);

module.controller( 'sol.launch_bar.file_tree', function FileTreeController($scope, File, Tabs, Pallette) {
  $scope.files = File;

  $scope.open = function (fileObj) {
    if (fileObj.isDirectory) {
      if (!fileObj.files) fileObj.files = File.loadFileTree(fileObj.path);

      fileObj.open = !fileObj.open;
    } else {
      File.open(fileObj.path);
    }
  };

  $scope.tab_events = new Tabs();
  $scope.tab_events.onSelected.add(function (tab, index) {
    function checkFiles(files) {
      for (var i = 0; i < files.length; i++) {
        files[i].selected = false;

        if (files[i].files) checkFiles(files[i].files);

        if (files[i].path === tab.uid) {
          files[i].selected = true;
        }
      }
    }

    checkFiles($scope.files);
  });

  $scope.tab_events.onDeselected.add(function (tab, index) {
    function checkFiles(files) {
      for (var i = 0; i < files.length; i++) {
        if (files[i].path === tab.uid) files[i].selected = false;
        if (files[i].files) checkFiles(files[i].files);
      }
    }

    checkFiles($scope.files);
  });
});

/* -------------------------------------------------------------------------- */
})();
