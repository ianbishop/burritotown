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

var React = require('React');
var ReactTestUtils = require('ReactTestUtils');
var reactComponentExpect= require('reactComponentExpect');

var TestComponent = React.createClass({displayName: "TestComponent",
  render: function() {
    return (
      React.createElement("div", null, 
        React.createElement("div", {ref: "theInnerDiv"}, 
          "Lets try to destroy this."
        )
      )
    );
  }
});

describe('refs-destruction', function() {
  beforeEach(function() {
    require('mock-modules').dumpCache();
  });

  it("should remove refs when destroying the parent", function() {
    var testInstance = ReactTestUtils.renderIntoDocument(React.createElement(TestComponent, null));
    reactComponentExpect(testInstance.refs.theInnerDiv)
        .toBeDOMComponentWithTag('div');
    expect(Object.keys(testInstance.refs || {}).length).toEqual(1);
    testInstance.unmountComponent();
    expect(Object.keys(testInstance.refs || {}).length).toEqual(0);
  });

  it("should remove refs when destroying the child", function() {
    var testInstance = ReactTestUtils.renderIntoDocument(React.createElement(TestComponent, null));
    reactComponentExpect(testInstance.refs.theInnerDiv)
        .toBeDOMComponentWithTag('div');
    expect(Object.keys(testInstance.refs || {}).length).toEqual(1);
    testInstance.refs.theInnerDiv.unmountComponent();
    expect(Object.keys(testInstance.refs || {}).length).toEqual(0);
  });
});
