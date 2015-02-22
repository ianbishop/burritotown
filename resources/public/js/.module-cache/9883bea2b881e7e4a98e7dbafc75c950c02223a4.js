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

describe('traverseAllChildren', function() {
  var traverseAllChildren;
  var React;
  beforeEach(function() {
    traverseAllChildren = require('traverseAllChildren');
    React = require('React');
  });


  it('should support identity for simple', function() {
    var traverseContext = [];
    var traverseFn =
      jasmine.createSpy().andCallFake(function(context, kid, key, index) {
        context.push(true);
      });

    var simpleKid = React.createElement("span", {key: "simple"});

    // Jasmine doesn't provide a way to test that the fn was invoked with scope.
    var instance = React.createElement("div", null, simpleKid);
    traverseAllChildren(instance.props.children, traverseFn, traverseContext);
    expect(traverseFn).toHaveBeenCalledWith(
      traverseContext,
      simpleKid,
      '.$simple',
      0
    );
    expect(traverseContext.length).toEqual(1);
  });

  it('should treat single arrayless child as being in array', function() {
    var traverseContext = [];
    var traverseFn =
      jasmine.createSpy().andCallFake(function(context, kid, key, index) {
        context.push(true);
      });

    var simpleKid = React.createElement("span", null);
    var instance = React.createElement("div", null, simpleKid);
    traverseAllChildren(instance.props.children, traverseFn, traverseContext);
    expect(traverseFn).toHaveBeenCalledWith(
      traverseContext,
      simpleKid,
      '.0',
      0
    );
    expect(traverseContext.length).toEqual(1);
  });

  it('should treat single child in array as expected', function() {
    var traverseContext = [];
    var traverseFn =
      jasmine.createSpy().andCallFake(function(context, kid, key, index) {
        context.push(true);
      });

    var simpleKid = React.createElement("span", null);
    var instance = React.createElement("div", null, [simpleKid]);
    traverseAllChildren(instance.props.children, traverseFn, traverseContext);
    expect(traverseFn).toHaveBeenCalledWith(
      traverseContext,
      simpleKid,
      '.0',
      0
    );
    expect(traverseContext.length).toEqual(1);
  });

  it('should be called for each child', function() {
    var zero = React.createElement("div", {key: "keyZero"});
    var one = null;
    var two = React.createElement("div", {key: "keyTwo"});
    var three = null;
    var four = React.createElement("div", {key: "keyFour"});

    var traverseContext = [];
    var traverseFn =
      jasmine.createSpy().andCallFake(function(context, kid, key, index) {
        context.push(true);
      });

    var instance = (
      React.createElement("div", null, 
        zero, 
        one, 
        two, 
        three, 
        four
      )
    );

    traverseAllChildren(instance.props.children, traverseFn, traverseContext);
    expect(traverseFn).toHaveBeenCalledWith(
      traverseContext,
      zero,
      '.$keyZero',
      0
    );
    expect(traverseFn).toHaveBeenCalledWith(traverseContext, one, '.1', 1);
    expect(traverseFn).toHaveBeenCalledWith(
      traverseContext,
      two,
      '.$keyTwo',
      2
    );
    expect(traverseFn).toHaveBeenCalledWith(traverseContext, three, '.3', 3);
    expect(traverseFn).toHaveBeenCalledWith(
      traverseContext,
      four,
      '.$keyFour',
      4
    );
  });

  // Todo: test that nums/strings are converted to ReactComponents.

  it('should be called for each child in nested structure', function() {
    var zero = React.createElement("div", {key: "keyZero"});
    var one = null;
    var two = React.createElement("div", {key: "keyTwo"});
    var three = null;
    var four = React.createElement("div", {key: "keyFour"});
    var five = React.createElement("div", {key: "keyFiveInner"});
    // five is placed into a JS object with a key that is joined to the
    // component key attribute.
    // Precedence is as follows:
    // 1. If grouped in an Object, the object key combined with `key` prop
    // 2. If grouped in an Array, the `key` prop, falling back to array index


    var traverseContext = [];
    var traverseFn =
      jasmine.createSpy().andCallFake(function(context, kid, key, index) {
        context.push(true);
      });

    var instance = (
      React.createElement("div", null, 
        [{
          firstHalfKey: [zero, one, two],
          secondHalfKey: [three, four],
          keyFive: five
        }]
      )
    );

    traverseAllChildren(instance.props.children, traverseFn, traverseContext);
    expect(traverseFn.calls.length).toBe(6);
    expect(traverseContext.length).toEqual(6);
    expect(traverseFn).toHaveBeenCalledWith(
      traverseContext,
      zero,
      '.0:$firstHalfKey:0:$keyZero',
      0
    );

    expect(traverseFn)
      .toHaveBeenCalledWith(traverseContext, one, '.0:$firstHalfKey:0:1', 1);

    expect(traverseFn).toHaveBeenCalledWith(
      traverseContext,
      two,
      '.0:$firstHalfKey:0:$keyTwo',
      2
    );

    expect(traverseFn).toHaveBeenCalledWith(
      traverseContext,
      three,
      '.0:$secondHalfKey:0:0',
      3
    );

    expect(traverseFn).toHaveBeenCalledWith(
      traverseContext,
      four,
      '.0:$secondHalfKey:0:$keyFour',
      4
    );

    expect(traverseFn).toHaveBeenCalledWith(
      traverseContext,
      five,
      '.0:$keyFive:$keyFiveInner',
      5
    );
  });

  it('should retain key across two mappings', function() {
    var zeroForceKey = React.createElement("div", {key: "keyZero"});
    var oneForceKey = React.createElement("div", {key: "keyOne"});
    var traverseContext = [];
    var traverseFn =
      jasmine.createSpy().andCallFake(function(context, kid, key, index) {
        context.push(true);
      });

    var forcedKeys = (
      React.createElement("div", null, 
        zeroForceKey, 
        oneForceKey
      )
    );

    traverseAllChildren(forcedKeys.props.children, traverseFn, traverseContext);
    expect(traverseContext.length).toEqual(2);
    expect(traverseFn).toHaveBeenCalledWith(
      traverseContext,
      zeroForceKey,
      '.$keyZero',
      0
    );
    expect(traverseFn).toHaveBeenCalledWith(
      traverseContext,
      oneForceKey,
      '.$keyOne',
      1
    );
  });

});
