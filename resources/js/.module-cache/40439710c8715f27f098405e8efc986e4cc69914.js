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

var mocks = require('mocks');

describe('ReactMultiChild', function() {
  var React;

  beforeEach(function() {
    require('mock-modules').dumpCache();
    React = require('React');
  });

  describe('reconciliation', function() {
    it('should update children when possible', function() {
      var container = document.createElement('div');

      var mockMount = mocks.getMockFunction();
      var mockUpdate = mocks.getMockFunction();
      var mockUnmount = mocks.getMockFunction();

      var MockComponent = React.createClass({displayName: "MockComponent",
        componentDidMount: mockMount,
        componentDidUpdate: mockUpdate,
        componentWillUnmount: mockUnmount,
        render: function() {
          return React.createElement("span", null);
        }
      });

      expect(mockMount.mock.calls.length).toBe(0);
      expect(mockUpdate.mock.calls.length).toBe(0);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.render(React.createElement("div", null, React.createElement(MockComponent, null)), container);

      expect(mockMount.mock.calls.length).toBe(1);
      expect(mockUpdate.mock.calls.length).toBe(0);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.render(React.createElement("div", null, React.createElement(MockComponent, null)), container);

      expect(mockMount.mock.calls.length).toBe(1);
      expect(mockUpdate.mock.calls.length).toBe(1);
      expect(mockUnmount.mock.calls.length).toBe(0);
    });

    it('should replace children with different constructors', function() {
      var container = document.createElement('div');

      var mockMount = mocks.getMockFunction();
      var mockUnmount = mocks.getMockFunction();

      var MockComponent = React.createClass({displayName: "MockComponent",
        componentDidMount: mockMount,
        componentWillUnmount: mockUnmount,
        render: function() {
          return React.createElement("span", null);
        }
      });

      expect(mockMount.mock.calls.length).toBe(0);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.render(React.createElement("div", null, React.createElement(MockComponent, null)), container);

      expect(mockMount.mock.calls.length).toBe(1);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.render(React.createElement("div", null, React.createElement("span", null)), container);

      expect(mockMount.mock.calls.length).toBe(1);
      expect(mockUnmount.mock.calls.length).toBe(1);
    });

    it('should replace children with different owners', function() {
      var container = document.createElement('div');

      var mockMount = mocks.getMockFunction();
      var mockUnmount = mocks.getMockFunction();

      var MockComponent = React.createClass({displayName: "MockComponent",
        componentDidMount: mockMount,
        componentWillUnmount: mockUnmount,
        render: function() {
          return React.createElement("span", null);
        }
      });

      var WrapperComponent = React.createClass({displayName: "WrapperComponent",
        render: function() {
          return this.props.children || React.createElement(MockComponent, null);
        }
      });

      expect(mockMount.mock.calls.length).toBe(0);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.render(React.createElement(WrapperComponent, null), container);

      expect(mockMount.mock.calls.length).toBe(1);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.render(
        React.createElement(WrapperComponent, null, React.createElement(MockComponent, null)),
        container
      );

      expect(mockMount.mock.calls.length).toBe(2);
      expect(mockUnmount.mock.calls.length).toBe(1);
    });

    it('should replace children with different keys', function() {
      var container = document.createElement('div');

      var mockMount = mocks.getMockFunction();
      var mockUnmount = mocks.getMockFunction();

      var MockComponent = React.createClass({displayName: "MockComponent",
        componentDidMount: mockMount,
        componentWillUnmount: mockUnmount,
        render: function() {
          return React.createElement("span", null);
        }
      });

      expect(mockMount.mock.calls.length).toBe(0);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.render(React.createElement("div", null, React.createElement(MockComponent, {key: "A"})), container);

      expect(mockMount.mock.calls.length).toBe(1);
      expect(mockUnmount.mock.calls.length).toBe(0);

      React.render(React.createElement("div", null, React.createElement(MockComponent, {key: "B"})), container);

      expect(mockMount.mock.calls.length).toBe(2);
      expect(mockUnmount.mock.calls.length).toBe(1);
    });
  });

  describe('innerHTML', function() {
    var setInnerHTML;

    // Only run this suite if `Element.prototype.innerHTML` can be spied on.
    var innerHTMLDescriptor = Object.getOwnPropertyDescriptor(
      Element.prototype,
      'innerHTML'
    );
    if (!innerHTMLDescriptor) {
      return;
    }

    beforeEach(function() {
      Object.defineProperty(Element.prototype, 'innerHTML', {
        set: setInnerHTML = jasmine.createSpy().andCallFake(
          innerHTMLDescriptor.set
        )
      });
    });

    it('should only set `innerHTML` once on update', function() {
      var container = document.createElement('div');

      React.render(
        React.createElement("div", null, 
          React.createElement("p", null, React.createElement("span", null)), 
          React.createElement("p", null, React.createElement("span", null)), 
          React.createElement("p", null, React.createElement("span", null))
        ),
        container
      );
      // Warm the cache used by `getMarkupWrap`.
      React.render(
        React.createElement("div", null, 
          React.createElement("p", null, React.createElement("span", null), React.createElement("span", null)), 
          React.createElement("p", null, React.createElement("span", null), React.createElement("span", null)), 
          React.createElement("p", null, React.createElement("span", null), React.createElement("span", null))
        ),
        container
      );
      expect(setInnerHTML).toHaveBeenCalled();
      var callCountOnMount = setInnerHTML.callCount;

      React.render(
        React.createElement("div", null, 
          React.createElement("p", null, React.createElement("span", null), React.createElement("span", null), React.createElement("span", null)), 
          React.createElement("p", null, React.createElement("span", null), React.createElement("span", null), React.createElement("span", null)), 
          React.createElement("p", null, React.createElement("span", null), React.createElement("span", null), React.createElement("span", null))
        ),
        container
      );
      expect(setInnerHTML.callCount).toBe(callCountOnMount + 1);
    });
  });
});
