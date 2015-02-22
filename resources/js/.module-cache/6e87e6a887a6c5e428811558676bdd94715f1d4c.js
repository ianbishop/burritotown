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

var TestComponent;

describe('ReactPropTransferer', function() {

  beforeEach(function() {
    require('mock-modules').dumpCache();

    React = require('React');
    ReactTestUtils = require('ReactTestUtils');
    reactComponentExpect = require('reactComponentExpect');

    // We expect to get a warning from transferPropsTo since it's deprecated
    spyOn(console, 'warn');

    TestComponent = React.createClass({displayName: "TestComponent",
      render: function() {
        var result = this.transferPropsTo(
          React.createElement("input", {
            className: "textinput", 
            style: {display: 'block', color: 'green'}, 
            type: "text", 
            value: ""}
          )
        );
        expect(console.warn).toHaveBeenCalled();
        return result;
      }
    });
  });

  it('should leave explicitly specified properties intact', function() {
    var instance = React.createElement(TestComponent, {type: "radio"});
    instance = ReactTestUtils.renderIntoDocument(instance);

    reactComponentExpect(instance)
      .expectRenderedChild()
        .toBeComponentOfType('input')
        .scalarPropsEqual({
          className: 'textinput',
          style: {display: 'block', color: 'green'},
          type: 'text',
          value: ''
        });
  });

  it('should transfer unspecified properties', function() {
    var instance = React.createElement(TestComponent, {placeholder: "Type here..."});
    instance = ReactTestUtils.renderIntoDocument(instance);

    reactComponentExpect(instance)
      .expectRenderedChild()
        .toBeComponentOfType('input')
        .scalarPropsEqual({placeholder: 'Type here...'});
  });

  it('should transfer using merge strategies', function() {
    var instance =
      React.createElement(TestComponent, {
        className: "hidden_elem", 
        style: {width: '100%', display: 'none'}}
      );
    instance = ReactTestUtils.renderIntoDocument(instance);

    reactComponentExpect(instance)
      .expectRenderedChild()
        .toBeComponentOfType('input')
        .scalarPropsEqual({
          className: 'textinput hidden_elem',
          style: {
            color: 'green',
            display: 'block',
            width: '100%'
          }
        });
  });

  it('should not transfer children', function() {
    var ChildrenTestComponent = React.createClass({displayName: "ChildrenTestComponent",
      render: function() {
        return this.transferPropsTo(React.createElement("div", null));
      }
    });

    var instance =
      React.createElement(ChildrenTestComponent, null, 
        React.createElement("span", null, "Hello!")
      );

    instance = ReactTestUtils.renderIntoDocument(instance);
    reactComponentExpect(instance)
      .expectRenderedChild()
        .toBeDOMComponentWithTag('div')
        .toBeDOMComponentWithNoChildren();
  });

  it('should not transfer ref or key', function() {
    var TestComponent = React.createClass({displayName: "TestComponent",
      render: function() {
        expect(this.props.ref).toBeUndefined();
        expect(this.props.key).toBeUndefined();
        return React.createElement("div", null);
      }
    });
    var OuterTestComponent = React.createClass({displayName: "OuterTestComponent",
      render: function() {
        return this.transferPropsTo(React.createElement(TestComponent, null));
      }
    });
    var OuterOuterTestComponent = React.createClass({displayName: "OuterOuterTestComponent",
      render: function() {
        return React.createElement(OuterTestComponent, {ref: "testref", key: "testkey"});
      }
    });

    ReactTestUtils.renderIntoDocument(React.createElement(OuterOuterTestComponent, null));
  });

  it('should not transferPropsTo() a component you don\'t own', function() {
    var Parent = React.createClass({displayName: "Parent",
      render: function() {
        return React.createElement(Child, null, React.createElement("span", null));
      }
    });

    var Child = React.createClass({displayName: "Child",
      render: function() {
        return this.transferPropsTo(this.props.children);
      }
    });

    expect(function() {
      ReactTestUtils.renderIntoDocument(React.createElement(Parent, null));
    }).toThrow(
      'Invariant Violation: ' +
      'Child: You can\'t call transferPropsTo() on a component that you ' +
      'don\'t own, span. ' +
      'This usually means you are calling transferPropsTo() on a component ' +
      'passed in as props or children.'
    );
  });

  it('uses the default instead of the transferred prop (regress)', function() {

    var Child = React.createClass({displayName: "Child",

      getDefaultProps: function() {
        return {
          x: 2
        };
      },

      render: function() {
        expect(this.props.x).toBe(2);
        return React.createElement("div", null);
      }

    });

    var Parent = React.createClass({displayName: "Parent",

      render: function() {
        return this.transferPropsTo(React.createElement(Child, null));
      }

    });

    ReactTestUtils.renderIntoDocument(React.createElement(Parent, {x: 5}));

  });

});
