/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails react-core
 */

"use strict";

var React;
var ReactTestUtils;

var reactComponentExpect;

describe('ReactComponent', function() {
  beforeEach(function() {
    React = require('React');
    ReactTestUtils = require('ReactTestUtils');
    reactComponentExpect = require('reactComponentExpect');
  });

  it('should throw on invalid render targets', function() {
    var container = document.createElement('div');
    // jQuery objects are basically arrays; people often pass them in by mistake
    expect(function() {
      React.render(React.createElement("div", null), [container]);
    }).toThrow(
      'Invariant Violation: _registerComponent(...): Target container ' +
      'is not a DOM element.'
    );

    expect(function() {
      React.render(React.createElement("div", null), null);
    }).toThrow(
      'Invariant Violation: _registerComponent(...): Target container ' +
      'is not a DOM element.'
    );
  });

  it('should throw when supplying a ref outside of render method', function() {
    var instance = React.createElement("div", {ref: "badDiv"});
    expect(function() {
      instance = ReactTestUtils.renderIntoDocument(instance);
    }).toThrow();
  });

  it('should throw when attempting to hijack a ref', function() {
    var Component = React.createClass({displayName: "Component",
      render: function() {
        var child = this.props.child;
        this.attachRef('test', child);
        return child;
      }
    });

    var childInstance = ReactTestUtils.renderIntoDocument(React.createElement("span", null));
    var instance = React.createElement(Component, {child: childInstance});

    expect(function() {
      instance = ReactTestUtils.renderIntoDocument(instance);
    }).toThrow(
      'Invariant Violation: attachRef(test, ...): Only a component\'s owner ' +
      'can store a ref to it.'
    );
  });

  it('should support refs on owned components', function() {
    var innerObj = {}, outerObj = {};

    var Wrapper = React.createClass({displayName: "Wrapper",

      getObject: function() {
        return this.props.object;
      },

      render: function() {
        return React.createElement("div", null, this.props.children);
      }

    });

    var Component = React.createClass({displayName: "Component",
      render: function() {
        var inner = React.createElement(Wrapper, {object: innerObj, ref: "inner"});
        var outer = React.createElement(Wrapper, {object: outerObj, ref: "outer"}, inner);
        return outer;
      },
      componentDidMount: function() {
        expect(this.refs.inner.getObject()).toEqual(innerObj);
        expect(this.refs.outer.getObject()).toEqual(outerObj);
      }
    });

    var instance = React.createElement(Component, null);
    instance = ReactTestUtils.renderIntoDocument(instance);
  });

  it('should not have refs on unmounted components', function() {
    var Parent = React.createClass({displayName: "Parent",
      render: function() {
        return React.createElement(Child, null, React.createElement("div", {ref: "test"}));
      },
      componentDidMount: function() {
        expect(this.refs && this.refs.test).toEqual(undefined);
      }
    });
    var Child = React.createClass({displayName: "Child",
      render: function() {
        return React.createElement("div", null);
      }
    });

    var instance = React.createElement(Parent, {child: React.createElement("span", null)});
    instance = ReactTestUtils.renderIntoDocument(instance);
  });

  it('should correctly determine if a component is mounted', function() {
    var Component = React.createClass({displayName: "Component",
      componentWillMount: function() {
        expect(this.isMounted()).toBeFalsy();
      },
      componentDidMount: function() {
        expect(this.isMounted()).toBeTruthy();
      },
      render: function() {
        return React.createElement("div", null);
      }
    });

    var element = React.createElement(Component, null);

    var instance = ReactTestUtils.renderIntoDocument(element);
    expect(instance.isMounted()).toBeTruthy();
  });

  it('should know its simple mount depth', function() {
    var Owner = React.createClass({displayName: "Owner",
      render: function() {
        return React.createElement(Child, {ref: "child"});
      }
    });

    var Child = React.createClass({displayName: "Child",
      render: function() {
        return React.createElement("div", null);
      }
    });

    var instance = React.createElement(Owner, null);
    instance = ReactTestUtils.renderIntoDocument(instance);
    expect(instance._mountDepth).toBe(0);
    expect(instance.refs.child._mountDepth).toBe(1);
  });

  it('should know its (complicated) mount depth', function() {
    var Box = React.createClass({displayName: "Box",
      render: function() {
        return React.createElement("div", {ref: "boxDiv"}, this.props.children);
      }
    });

    var Child = React.createClass({displayName: "Child",
      render: function() {
        return React.createElement("span", {ref: "span"}, "child");
      }
    });

    var Switcher = React.createClass({displayName: "Switcher",
      getInitialState: function() {
        return {tabKey: 'hello'};
      },

      render: function() {
        var child = this.props.children;

        return (
          React.createElement(Box, {ref: "box"}, 
            React.createElement("div", {
              ref: "switcherDiv", 
              style: {
                display: this.state.tabKey === child.key ? '' : 'none'
            }}, 
              child
            )
          )
        );
      }
    });

    var App = React.createClass({displayName: "App",
      render: function() {
        return (
          React.createElement(Switcher, {ref: "switcher"}, 
            React.createElement(Child, {key: "hello", ref: "child"})
          )
        );
      }
    });

    var root = React.createElement(App, null);
    root = ReactTestUtils.renderIntoDocument(root);

    expect(root._mountDepth).toBe(0);
    expect(root.refs.switcher._mountDepth).toBe(1);
    expect(root.refs.switcher.refs.box._mountDepth).toBe(2);
    expect(root.refs.switcher.refs.switcherDiv._mountDepth).toBe(4);
    expect(root.refs.child._mountDepth).toBe(5);
    expect(root.refs.switcher.refs.box.refs.boxDiv._mountDepth).toBe(3);
    expect(root.refs.child.refs.span._mountDepth).toBe(6);
  });
});
