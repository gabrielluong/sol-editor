(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var module = angular.module( 'service.keyboard', [
  'service.signals',
  'service.tabs',
  'service.pallette'
]);

function Keyboard ( Signals, Tabs, Pallette, $injector ) {
  /* ------ SAVE ------ */
  Mousetrap.bind('command+s', function () {Signals.save.dispatch();} );

  this.create_new_file = function () {
    Signals.newEmptyFile.dispatch();
    var active = new Tabs('active');

    active.add({
      uid: guid(),
      title: 'untitled',
      templateUrl: '/file_handlers/renderer/renderer.tpl.html',
      controller: 'sol.file_handler.renderer',
      data: '',
      file: null
    });
  };

  /* ------ NEW EMPTY TAB ------ */
  Mousetrap.bind('command+n', function () {

  });

  /* ------ SHOW DEV TOOLS ------ */
  Mousetrap.bind('command+d', function () {
    require('nw.gui').Window.get().showDevTools();
  });

  /* ------ OPEN FILE ------ */
  Mousetrap.bind('command+t', function () {
    var pallette = new Pallette('files');
    pallette.toggle();
  });

  /* ------ OPEN ACTIONS PALLETTE ------ */
  Mousetrap.bind('command+shift+p', function () {
    var pallette = new Pallette('actions');
    pallette.toggle();
  });

  /* ------ SWITCH TAB LEFT ------ */
  Mousetrap.bind('command+shift+[', function () {
    var active = new Tabs('active');

    active.select(active.selectedIndex - 1);
  });

  /* ------ SWITCH TAB RIGHT ------ */
  Mousetrap.bind('command+shift+]', function () {
    var active = new Tabs('active');

    active.select(active.selectedIndex + 1);
  });

  /* ------ CLOSE CURRENT TAB ------ */
  Mousetrap.bind('command+w', function (e) {
    e.preventDefault();
    e.stopPropagation();

    var active = new Tabs('active');

    active.remove(active.selectedIndex);
  });
}

module.service('__keyboard', Keyboard);

/* -------------------------------------------------------------------------- */
})();
