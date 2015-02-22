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

describe('onlyChild', function() {

  var React;
  var onlyChild;
  var WrapComponent;

  beforeEach(function() {
    React = require('React');
    onlyChild = require('onlyChild');
    WrapComponent = React.createClass({displayName: "WrapComponent",
      render: function() {
        return (
          React.createElement("div", null, 
            onlyChild(this.props.children, this.props.mapFn, this)
          )
        );
      }
    });
  });

  it('should fail when passed two children', function() {
    expect(function() {
      var instance =
        React.createElement(WrapComponent, null, 
          React.createElement("div", null), 
          React.createElement("span", null)
        );
      onlyChild(instance.props.children);
    }).toThrow();
  });

  it('should fail when passed nully values', function() {
    expect(function() {
      var instance =
        React.createElement(WrapComponent, null, 
          null
        );
      onlyChild(instance.props.children);
    }).toThrow();

    expect(function() {
      var instance =
        React.createElement(WrapComponent, null, 
          undefined
        );
      onlyChild(instance.props.children);
    }).toThrow();
  });

  it('should fail when key/value objects', function() {
    expect(function() {
      var instance =
        React.createElement(WrapComponent, null, 
          {oneThing: React.createElement("span", null)}
        );
      onlyChild(instance.props.children);
    }).toThrow();
  });


  it('should not fail when passed interpolated single child', function() {
    expect(function() {
      var instance =
        React.createElement(WrapComponent, null, 
          React.createElement("span", null)
        );
      onlyChild(instance.props.children);
    }).not.toThrow();
  });


  it('should return the only child', function() {
    expect(function() {
      var instance =
        React.createElement(WrapComponent, null, 
          React.createElement("span", null)
        );
      onlyChild(instance.props.children);
    }).not.toThrow();
  });

});
