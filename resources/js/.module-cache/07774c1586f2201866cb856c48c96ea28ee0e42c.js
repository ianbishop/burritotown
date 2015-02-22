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

// Requires
var React;
var ReactTestUtils;
var reactComponentExpect;

// Test components
var LowerLevelComposite;
var MyCompositeComponent;

var expectSingleChildlessDiv;

/**
 * Integration test, testing the combination of JSX with our unit of
 * abstraction, `ReactCompositeComponent` does not ever add superfluous DOM
 * nodes.
 */
describe('ReactCompositeComponentDOMMinimalism', function() {

  beforeEach(function() {
    reactComponentExpect = require('reactComponentExpect');
    React = require('React');
    ReactTestUtils = require('ReactTestUtils');

    LowerLevelComposite = React.createClass({displayName: "LowerLevelComposite",
      render: function() {
        return (
          React.createElement("div", null, 
            this.props.children
          )
        );
      }
    });

    MyCompositeComponent = React.createClass({displayName: "MyCompositeComponent",
      render: function() {
        return (
          React.createElement(LowerLevelComposite, null, 
            this.props.children
          )
        );
      }
    });

    expectSingleChildlessDiv = function(instance) {
      reactComponentExpect(instance)
        .expectRenderedChild()
        .toBeCompositeComponentWithType(LowerLevelComposite)
          .expectRenderedChild()
          .toBeDOMComponentWithTag('div')
          .toBeDOMComponentWithNoChildren();
    };
  });

  it('should not render extra nodes for non-interpolated text', function() {
    var instance = (
      React.createElement(MyCompositeComponent, null, 
        "A string child"
      )
    );
    instance = ReactTestUtils.renderIntoDocument(instance);
    expectSingleChildlessDiv(instance);
  });

  it('should not render extra nodes for non-interpolated text', function() {
    var instance = (
      React.createElement(MyCompositeComponent, null, 
        'Interpolated String Child'
      )
    );
    instance = ReactTestUtils.renderIntoDocument(instance);
    expectSingleChildlessDiv(instance);
  });

  it('should not render extra nodes for non-interpolated text', function() {
    var instance = (
      React.createElement(MyCompositeComponent, null, 
        React.createElement("ul", null, 
          "This text causes no children in ul, just innerHTML"
        )
      )
    );
    instance = ReactTestUtils.renderIntoDocument(instance);
    reactComponentExpect(instance)
      .expectRenderedChild()
      .toBeCompositeComponentWithType(LowerLevelComposite)
        .expectRenderedChild()
        .toBeDOMComponentWithTag('div')
        .toBeDOMComponentWithChildCount(1)
        .expectRenderedChildAt(0)
          .toBeDOMComponentWithTag('ul')
          .toBeDOMComponentWithNoChildren();
  });

});
