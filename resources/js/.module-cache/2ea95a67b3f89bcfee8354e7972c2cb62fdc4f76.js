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

describe('sliceChildren', function() {

  var React;
  var ReactTestUtils;

  var sliceChildren;
  var reactComponentExpect;

  var Partial;

  beforeEach(function() {
    React = require('React');
    ReactTestUtils = require('ReactTestUtils');

    sliceChildren = require('sliceChildren');
    reactComponentExpect = require('reactComponentExpect');

    Partial = React.createClass({displayName: "Partial",
      render: function() {
        return (
          React.createElement("div", null, 
            sliceChildren(
              this.props.children,
              this.props.start,
              this.props.end
            )
          )
        );
      }
    });
  });

  function renderAndSlice(set, start, end) {
    var instance = React.createElement(Partial, {start: start, end: end}, set);
    instance = ReactTestUtils.renderIntoDocument(instance);
    var rendered = reactComponentExpect(instance)
      .expectRenderedChild()
      .instance();
    return rendered.props.children;
  }

  it('should render the whole set if start zero is supplied', function() {
    var fullSet = [
      React.createElement("div", {key: "A"}),
      React.createElement("div", {key: "B"}),
      React.createElement("div", {key: "C"})
    ];
    var children = renderAndSlice(fullSet, 0);
    expect(children).toEqual({
      '.$A': fullSet[0],
      '.$B': fullSet[1],
      '.$C': fullSet[2]
    });
  });

  it('should render the remaining set if no end index is supplied', function() {
    var fullSet = [
      React.createElement("div", {key: "A"}),
      React.createElement("div", {key: "B"}),
      React.createElement("div", {key: "C"})
    ];
    var children = renderAndSlice(fullSet, 1);
    expect(children).toEqual({
      '.$B': fullSet[1],
      '.$C': fullSet[2]
    });
  });

  it('should exclude everything at or after the end index', function() {
    var fullSet = [
      React.createElement("div", {key: "A"}),
      React.createElement("div", {key: "B"}),
      React.createElement("div", {key: "C"}),
      React.createElement("div", {key: "D"})
    ];
    var children = renderAndSlice(fullSet, 1, 2);
    expect(children).toEqual({
      '.$B': fullSet[1]
    });
  });

  it('should allow static children to be sliced', function() {
    var a = React.createElement("div", null);
    var b = React.createElement("div", null);
    var c = React.createElement("div", null);

    var instance = React.createElement(Partial, {start: 1, end: 2}, a, b, c);
    instance = ReactTestUtils.renderIntoDocument(instance);
    var rendered = reactComponentExpect(instance)
      .expectRenderedChild()
      .instance();

    expect(rendered.props.children).toEqual({
      '.1': b
    });
  });

});
