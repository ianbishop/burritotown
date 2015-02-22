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
var ReactMount;

describe('ReactIdentity', function() {

  beforeEach(function() {
    require('mock-modules').dumpCache();
    React = require('React');
    ReactTestUtils = require('ReactTestUtils');
    reactComponentExpect = require('reactComponentExpect');
    ReactMount = require('ReactMount');
  });

  var idExp = /^\.[^.]+(.*)$/;
  function checkId(child, expectedId) {
    var actual = idExp.exec(ReactMount.getID(child));
    var expected = idExp.exec(expectedId);
    expect(actual).toBeTruthy();
    expect(expected).toBeTruthy();
    expect(actual[1]).toEqual(expected[1]);
  }

  it('should allow keyed objects to express identity', function() {
    var instance =
      React.createElement("div", null, 
        {
          first: React.createElement("div", null),
          second: React.createElement("div", null)
        }
      );

    instance = React.render(instance, document.createElement('div'));
    var node = instance.getDOMNode();
    reactComponentExpect(instance).toBeDOMComponentWithChildCount(2);
    checkId(node.childNodes[0], '.0.$first:0');
    checkId(node.childNodes[1], '.0.$second:0');
  });

  it('should allow key property to express identity', function() {
    var instance =
      React.createElement("div", null, 
        React.createElement("div", {key: "apple"}), 
        React.createElement("div", {key: "banana"}), 
        React.createElement("div", {key: 0}), 
        React.createElement("div", {key: 123})
      );

    instance = React.render(instance, document.createElement('div'));
    var node = instance.getDOMNode();
    reactComponentExpect(instance).toBeDOMComponentWithChildCount(4);
    checkId(node.childNodes[0], '.0.$apple');
    checkId(node.childNodes[1], '.0.$banana');
    checkId(node.childNodes[2], '.0.$0');
    checkId(node.childNodes[3], '.0.$123');
  });

  it('should use instance identity', function() {

    var Wrapper = React.createClass({displayName: "Wrapper",
      render: function() {
        return React.createElement("a", {key: "i_get_overwritten"}, this.props.children);
      }
    });

    var instance =
      React.createElement("div", null, 
        React.createElement(Wrapper, {key: "wrap1"}, React.createElement("span", {key: "squirrel"})), 
        React.createElement(Wrapper, {key: "wrap2"}, React.createElement("span", {key: "bunny"})), 
        React.createElement(Wrapper, null, React.createElement("span", {key: "chipmunk"}))
      );

    instance = React.render(instance, document.createElement('div'));
    var node = instance.getDOMNode();
    reactComponentExpect(instance).toBeDOMComponentWithChildCount(3);

    checkId(node.childNodes[0], '.0.$wrap1');
    checkId(node.childNodes[0].firstChild, '.0.$wrap1.$squirrel');
    checkId(node.childNodes[1], '.0.$wrap2');
    checkId(node.childNodes[1].firstChild, '.0.$wrap2.$bunny');
    checkId(node.childNodes[2], '.0.2');
    checkId(node.childNodes[2].firstChild, '.0.2.$chipmunk');
  });

  function renderAComponentWithKeyIntoContainer(key, container) {

    var Wrapper = React.createClass({displayName: "Wrapper",

      render: function() {
        var span1 = React.createElement("span", {ref: "span1", key: key});
        var span2 = React.createElement("span", {ref: "span2"});

        var map = {};
        map[key] = span2;
        return React.createElement("div", null, [span1, map]);
      }

    });

    var instance = React.render(React.createElement(Wrapper, null), container);
    var span1 = instance.refs.span1;
    var span2 = instance.refs.span2;

    expect(span1.getDOMNode()).not.toBe(null);
    expect(span2.getDOMNode()).not.toBe(null);

    key = key.replace(/=/g, '=0');

    checkId(span1.getDOMNode(), '.0.$' + key);
    checkId(span2.getDOMNode(), '.0.1:$' + key + ':0');
  }

  it('should allow any character as a key, in a detached parent', function() {
    var detachedContainer = document.createElement('div');
    renderAComponentWithKeyIntoContainer("<'WEIRD/&\\key'>", detachedContainer);
  });

  it('should allow any character as a key, in an attached parent', function() {
    // This test exists to protect against implementation details that
    // incorrectly query escaped IDs using DOM tools like getElementById.
    var attachedContainer = document.createElement('div');
    document.body.appendChild(attachedContainer);

    renderAComponentWithKeyIntoContainer("<'WEIRD/&\\key'>", attachedContainer);

    document.body.removeChild(attachedContainer);
  });

  it('should not allow scripts in keys to execute', function() {
    var h4x0rKey =
      '"><script>window[\'YOUVEBEENH4X0RED\']=true;</script><div id="';

    var attachedContainer = document.createElement('div');
    document.body.appendChild(attachedContainer);

    renderAComponentWithKeyIntoContainer(h4x0rKey, attachedContainer);

    document.body.removeChild(attachedContainer);

    // If we get this far, make sure we haven't executed the code
    expect(window.YOUVEBEENH4X0RED).toBe(undefined);
  });

  it('should let restructured components retain their uniqueness', function() {
    var instance0 = React.createElement("span", null);
    var instance1 = React.createElement("span", null);
    var instance2 = React.createElement("span", null);

    var TestComponent = React.createClass({displayName: "TestComponent",
      render: function() {
        return (
          React.createElement("div", null, 
            instance2, 
            this.props.children[0], 
            this.props.children[1]
          )
        );
      }
    });

    var TestContainer = React.createClass({displayName: "TestContainer",

      render: function() {
        return React.createElement(TestComponent, null, instance0, instance1);
      }

    });

    expect(function() {

      React.render(React.createElement(TestContainer, null), document.createElement('div'));

    }).not.toThrow();
  });

  it('should let nested restructures retain their uniqueness', function() {
    var instance0 = React.createElement("span", null);
    var instance1 = React.createElement("span", null);
    var instance2 = React.createElement("span", null);

    var TestComponent = React.createClass({displayName: "TestComponent",
      render: function() {
        return (
          React.createElement("div", null, 
            instance2, 
            this.props.children[0], 
            this.props.children[1]
          )
        );
      }
    });

    var TestContainer = React.createClass({displayName: "TestContainer",

      render: function() {
        return (
          React.createElement("div", null, 
            React.createElement(TestComponent, null, instance0, instance1)
          )
        );
      }

    });

    expect(function() {

      React.render(React.createElement(TestContainer, null), document.createElement('div'));

    }).not.toThrow();
  });

  it('should let text nodes retain their uniqueness', function() {
    var TestComponent = React.createClass({displayName: "TestComponent",
      render: function() {
        return React.createElement("div", null, this.props.children, React.createElement("span", null));
      }
    });

    var TestContainer = React.createClass({displayName: "TestContainer",

      render: function() {
        return (
          React.createElement(TestComponent, null, 
            React.createElement("div", null), 
            'second'
          )
        );
      }

    });

    expect(function() {

      React.render(React.createElement(TestContainer, null), document.createElement('div'));

    }).not.toThrow();
  });

  it('should retain key during updates in composite components', function() {

    var TestComponent = React.createClass({displayName: "TestComponent",
      render: function() {
        return React.createElement("div", null, this.props.children);
      }
    });

    var TestContainer = React.createClass({displayName: "TestContainer",

      getInitialState: function() {
        return { swapped: false };
      },

      swap: function() {
        this.setState({ swapped: true });
      },

      render: function() {
        return (
          React.createElement(TestComponent, null, 
            this.state.swapped ? this.props.second : this.props.first, 
            this.state.swapped ? this.props.first : this.props.second
          )
        );
      }

    });

    var instance0 = React.createElement("span", {key: "A"});
    var instance1 = React.createElement("span", {key: "B"});

    var wrapped = React.createElement(TestContainer, {first: instance0, second: instance1});

    wrapped = React.render(wrapped, document.createElement('div'));

    var beforeID = ReactMount.getID(wrapped.getDOMNode().firstChild);

    wrapped.swap();

    var afterID = ReactMount.getID(wrapped.getDOMNode().firstChild);

    expect(beforeID).not.toEqual(afterID);

  });

  it('should not allow implicit and explicit keys to collide', function() {
    var component =
      React.createElement("div", null, 
        React.createElement("span", null), 
        React.createElement("span", {key: "0"})
      );

    expect(function() {
      React.render(component, document.createElement('div'));
    }).not.toThrow();
  });


});
