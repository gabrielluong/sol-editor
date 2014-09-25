
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

//TODO: fix this file. the service is setup wront @blocker 1

var self;

var service = angular.module( 'service.signals', []);

/* ---------------------------------------------------- */

function Signals () {
  if (self) return self;
  var SIGNALS = signals;

  self = {

    // import / export
    exportProject: new SIGNALS.Signal(),
    importProject: new SIGNALS.Signal(),
    exportScene: new SIGNALS.Signal(),
    importScene: new SIGNALS.Signal(),

    // actions
    cloneObject: new SIGNALS.Signal(),
    removeObject: new SIGNALS.Signal(),
    toggleHelpers: new SIGNALS.Signal(),
    resetScene: new SIGNALS.Signal(),
    addScene: new SIGNALS.Signal(),
    addScript: new SIGNALS.Signal(),
    toProjectNavigation: new SIGNALS.Signal(),
    toSceneNavigation: new SIGNALS.Signal(),
    save: new SIGNALS.Signal(),

    // notifications
    sceneAdded: new SIGNALS.Signal(),
    sceneChanged: new SIGNALS.Signal(),
    objectAdded: new SIGNALS.Signal(),
    objectSelected: new SIGNALS.Signal(),
    objectChanged: new SIGNALS.Signal(),
    materialChanged: new SIGNALS.Signal(),
    clearColorChanged: new SIGNALS.Signal(),
    cameraChanged: new SIGNALS.Signal(),
    fogTypeChanged: new SIGNALS.Signal(),
    fogColorChanged: new SIGNALS.Signal(),
    fogParametersChanged: new SIGNALS.Signal(),

    // change view
    positionChanged: new SIGNALS.Signal(),
    rotationChanged: new SIGNALS.Signal(),

    // files
    openFile: new SIGNALS.Signal(),
    showFileDialog: new SIGNALS.Signal(),
    newEmptyFile: new SIGNALS.Signal(),

    viewResize: new SIGNALS.Signal(),
    canvasClicked: new SIGNALS.Signal()

  };

  $(window).resize(function () {
    self.viewResize.dispatch();
  });

  return self;
}

service.factory( 'Signals', Signals);

/* ----------------------------------------------------------------------------- */
})();
