
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

var module = angular.module( 'service.tabcontainer', [
  'service.tabs'
]);

/* ---------------------------------------------------- */

function Module (Tabs) {
  var _this = this;

  function defaultTabContainer () {
    var id = guid();

    return {
      id: id,
      children: [],
      flexDirection: 'column',
      tabs: new Tabs(id)
    };
  }

  var id = guid();

  this.root = {
    id: id,
    children: [
      {
        id: guid(),
        children: [],
        flexDirection: 'column',
        tabs: new Tabs(id)
      }
    ]
  };

  this.selected = this.root.children[0];
  this.parent = this.root;

  this.select = function (child) {
    this.parent = this.selected;
    this.selected = child;
    this.selected.tabs.setToActive();
  };

  this.addChildrenToSelected = function () {
    this.selected.children.push(defaultTabContainer());
    this.selected.children.push(defaultTabContainer());

    this.selected.children[0].tabs = this.selected.tabs;
    this.selected.children[0].id = this.selected.id;

    this.selected.id = guid();
  };

  this.splitRight = function () {
    this.addChildrenToSelected();
    this.selected.flexDirection = 'row';
    this.select(this.selected.children[0]);
  };

  this.splitDown = function () {
    this.addChildrenToSelected();
    this.selected.flexDirection = 'column';
    this.select(this.selected.children[0]);
  };

  this.remove = function (parent) {
    if (!parent) parent = this.root;

    for (var i = 0; i < parent.children.length; i++) {
      if (parent.children[i].id === this.selected.id) {
        return this.__remove(i, parent);
      }
      if (parent.children[i].children.length > 0) {
        return this.remove(parent.children[i]);
      }
    }
  };

  this.__remove = function (index, parent) {
    if (parent.id === this.root.id) return;

    parent.children.splice(index, 1);
    var safe = parent.children.splice(0, 1)[0];

    parent.id = safe.id;
    parent.tabs = safe.tabs;
    parent.flexDirection = 'column';
    this.selected = parent;
  };
}

module.service('TabContainer', Module);

/* ----------------------------------------------------------------------------- */
})();
