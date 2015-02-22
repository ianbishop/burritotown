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

/*jslint evil: true */

"use strict";

require('mock-modules');

var React = require('React');
var ReactTestUtils = require('ReactTestUtils');

var reactComponentExpect = require('reactComponentExpect');

// Helpers
var testAllPermutations = function(testCases) {
  for (var i = 0; i < testCases.length; i += 2) {
    var renderWithChildren = testCases[i];
    var expectedResultAfterRender = testCases[i + 1];

    for (var j = 0; j < testCases.length; j += 2) {
      var updateWithChildren = testCases[j];
      var expectedResultAfterUpdate = testCases[j + 1];

      var d = renderChildren(renderWithChildren);
      expectChildren(d, expectedResultAfterRender);

      updateChildren(d, updateWithChildren);
      expectChildren(d, expectedResultAfterUpdate);
    }
  }
};

var renderChildren = function(children) {
  return ReactTestUtils.renderIntoDocument(
    React.createElement("div", null, children)
  );
};

var updateChildren = function(d, children) {
  d.replaceProps({children: children});
};

var expectChildren = function(d, children) {
  var textNode;
  if (typeof children === 'string') {
    textNode = d.getDOMNode().firstChild;

    if (children === '') {
      expect(textNode != null).toBe(false);
    } else {
      expect(textNode != null).toBe(true);
      expect(textNode.nodeType).toBe(3);
      expect(textNode.data).toBe('' + children);
    }
  } else {
    expect(d.getDOMNode().childNodes.length).toBe(children.length);

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (typeof child === 'string') {
        reactComponentExpect(d)
          .expectRenderedChildAt(i)
          .toBeTextComponent()
          .instance();

        textNode = d.getDOMNode().childNodes[i].firstChild;

        if (child === '') {
          expect(textNode != null).toBe(false);
        } else {
          expect(textNode != null).toBe(true);
          expect(textNode.nodeType).toBe(3);
          expect(textNode.data).toBe('' + child);
        }
      } else {
        var elementDOMNode =
          reactComponentExpect(d)
            .expectRenderedChildAt(i)
            .toBeComponentOfType('div')
            .instance()
            .getDOMNode();

        expect(elementDOMNode.tagName).toBe('DIV');
      }
    }
  }
};


/**
 * ReactMultiChild DOM integration test. In ReactDOM components, we make sure
 * that single children that are strings are treated as "content" which is much
 * faster to render and update.
 */
describe('ReactMultiChildText', function() {
  it('should correctly handle all possible children for render and update', function() {
    testAllPermutations([
      // basic values
      undefined, [],
      null, [],
      false, [],
      true, [],
      0, '0',
      1.2, '1.2',
      '', '',
      'foo', 'foo',

      [], [],
      [undefined], [],
      [null], [],
      [false], [],
      [true], [],
      [0], ['0'],
      [1.2], ['1.2'],
      [''], [''],
      ['foo'], ['foo'],
      [React.createElement("div", null)], [React.createElement("div", null)],

      // two adjacent values
      [true, 0], ['0'],
      [0, 0], ['0', '0'],
      [1.2, 0], ['1.2', '0'],
      [0, ''], ['0', ''],
      ['foo', 0], ['foo', '0'],
      [0, React.createElement("div", null)], ['0', React.createElement("div", null)],

      [true, 1.2], ['1.2'],
      [1.2, 0], ['1.2', '0'],
      [1.2, 1.2], ['1.2', '1.2'],
      [1.2, ''], ['1.2', ''],
      ['foo', 1.2], ['foo', '1.2'],
      [1.2, React.createElement("div", null)], ['1.2', React.createElement("div", null)],

      [true, ''], [''],
      ['', 0], ['', '0'],
      [1.2, ''], ['1.2', ''],
      ['', ''], ['', ''],
      ['foo', ''], ['foo', ''],
      ['', React.createElement("div", null)], ['', React.createElement("div", null)],

      [true, 'foo'], ['foo'],
      ['foo', 0], ['foo', '0'],
      [1.2, 'foo'], ['1.2', 'foo'],
      ['foo', ''], ['foo', ''],
      ['foo', 'foo'], ['foo', 'foo'],
      ['foo', React.createElement("div", null)], ['foo', React.createElement("div", null)],

      // values separated by an element
      [true, React.createElement("div", null), true], [React.createElement("div", null)],
      [1.2, React.createElement("div", null), 1.2], ['1.2', React.createElement("div", null), '1.2'],
      ['', React.createElement("div", null), ''], ['', React.createElement("div", null), ''],
      ['foo', React.createElement("div", null), 'foo'], ['foo', React.createElement("div", null), 'foo'],

      [true, 1.2, React.createElement("div", null), '', 'foo'], ['1.2', React.createElement("div", null), '', 'foo'],
      [1.2, '', React.createElement("div", null), 'foo', true], ['1.2', '', React.createElement("div", null), 'foo'],
      ['', 'foo', React.createElement("div", null), true, 1.2], ['', 'foo', React.createElement("div", null), '1.2'],

      [true, 1.2, '', React.createElement("div", null), 'foo', true, 1.2], ['1.2', '', React.createElement("div", null), 'foo', '1.2'],
      ['', 'foo', true, React.createElement("div", null), 1.2, '', 'foo'], ['', 'foo', React.createElement("div", null), '1.2', '', 'foo'],

      // values inside arrays
      [[true], [true]], [],
      [[1.2], [1.2]], ['1.2', '1.2'],
      [[''], ['']], ['', ''],
      [['foo'], ['foo']], ['foo', 'foo'],
      [[React.createElement("div", null)], [React.createElement("div", null)]], [React.createElement("div", null), React.createElement("div", null)],

      [[true, 1.2, React.createElement("div", null)], '', 'foo'], ['1.2', React.createElement("div", null), '', 'foo'],
      [1.2, '', [React.createElement("div", null), 'foo', true]], ['1.2', '', React.createElement("div", null), 'foo'],
      ['', ['foo', React.createElement("div", null), true], 1.2], ['', 'foo', React.createElement("div", null), '1.2'],

      [true, [1.2, '', React.createElement("div", null), 'foo'], true, 1.2], ['1.2', '', React.createElement("div", null), 'foo', '1.2'],
      ['', 'foo', [true, React.createElement("div", null), 1.2, ''], 'foo'], ['', 'foo', React.createElement("div", null), '1.2', '', 'foo'],

      // values inside objects
      [{a: true}, {a: true}], [],
      [{a: 1.2}, {a: 1.2}], ['1.2', '1.2'],
      [{a: ''}, {a: ''}], ['', ''],
      [{a: 'foo'}, {a: 'foo'}], ['foo', 'foo'],
      [{a: React.createElement("div", null)}, {a: React.createElement("div", null)}], [React.createElement("div", null), React.createElement("div", null)],

      [{a: true, b: 1.2, c: React.createElement("div", null)}, '', 'foo'], ['1.2', React.createElement("div", null), '', 'foo'],
      [1.2, '', {a: React.createElement("div", null), b: 'foo', c: true}], ['1.2', '', React.createElement("div", null), 'foo'],
      ['', {a: 'foo', b: React.createElement("div", null), c: true}, 1.2], ['', 'foo', React.createElement("div", null), '1.2'],

      [true, {a: 1.2, b: '', c: React.createElement("div", null), d: 'foo'}, true, 1.2], ['1.2', '', React.createElement("div", null), 'foo', '1.2'],
      ['', 'foo', {a: true, b: React.createElement("div", null), c: 1.2, d: ''}, 'foo'], ['', 'foo', React.createElement("div", null), '1.2', '', 'foo'],

      // values inside elements
      [React.createElement("div", null, true, 1.2, React.createElement("div", null)), '', 'foo'], [React.createElement("div", null), '', 'foo'],
      [1.2, '', React.createElement("div", null, React.createElement("div", null), 'foo', true)], ['1.2', '', React.createElement("div", null)],
      ['', React.createElement("div", null, 'foo', React.createElement("div", null), true), 1.2], ['', React.createElement("div", null), '1.2'],

      [true, React.createElement("div", null, 1.2, '', React.createElement("div", null), 'foo'), true, 1.2], [React.createElement("div", null), '1.2'],
      ['', 'foo', React.createElement("div", null, true, React.createElement("div", null), 1.2, ''), 'foo'], ['', 'foo', React.createElement("div", null), 'foo']
    ]);
  });

  it('should throw if rendering both HTML and children', function() {
    expect(function() {
      ReactTestUtils.renderIntoDocument(
        React.createElement("div", {dangerouslySetInnerHTML: {_html: 'abcdef'}}, "ghjkl")
      );
    }).toThrow();
  });

  it('should render between nested components and inline children', function() {
    var container = document.createElement('div');
    React.render(React.createElement("div", null, React.createElement("h1", null, React.createElement("span", null), React.createElement("span", null))), container);

    expect(function() {
      React.render(React.createElement("div", null, React.createElement("h1", null, "A")), container);
    }).not.toThrow();

    React.render(React.createElement("div", null, React.createElement("h1", null, React.createElement("span", null), React.createElement("span", null))), container);

    expect(function() {
      React.render(React.createElement("div", null, React.createElement("h1", null, ['A'])), container);
    }).not.toThrow();

    React.render(React.createElement("div", null, React.createElement("h1", null, React.createElement("span", null), React.createElement("span", null))), container);

    expect(function() {
      React.render(React.createElement("div", null, React.createElement("h1", null, ['A', 'B'])), container);
    }).not.toThrow();
  });
});
