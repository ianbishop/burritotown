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

require('mock-modules')
  .dontMock('ExecutionEnvironment')
  .dontMock('React')
  .dontMock('ReactMount')
  .dontMock('ReactServerRendering')
  .dontMock('ReactTestUtils')
  .dontMock('ReactMarkupChecksum');

var mocks = require('mocks');

var ExecutionEnvironment;
var React;
var ReactMarkupChecksum;
var ReactMount;
var ReactReconcileTransaction;
var ReactTestUtils;
var ReactServerRendering;

var ID_ATTRIBUTE_NAME;

describe('ReactServerRendering', function() {
  beforeEach(function() {
    require('mock-modules').dumpCache();
    React = require('React');
    ReactMarkupChecksum = require('ReactMarkupChecksum');
    ReactMount = require('ReactMount');
    ReactTestUtils = require('ReactTestUtils');
    ReactReconcileTransaction = require('ReactReconcileTransaction');

    ExecutionEnvironment = require('ExecutionEnvironment');
    ExecutionEnvironment.canUseDOM = false;
    ReactServerRendering = require('ReactServerRendering');

    var DOMProperty = require('DOMProperty');
    ID_ATTRIBUTE_NAME = DOMProperty.ID_ATTRIBUTE_NAME;
  });

  describe('renderComponentToString', function() {
    it('should generate simple markup', function() {
      var response = ReactServerRendering.renderToString(
        React.createElement("span", null, "hello world")
      );
      expect(response).toMatch(
        '<span ' + ID_ATTRIBUTE_NAME + '="[^"]+" ' +
          ReactMarkupChecksum.CHECKSUM_ATTR_NAME + '="[^"]+">hello world</span>'
      );
    });

    it('should not register event listeners', function() {
      var EventPluginHub = require('EventPluginHub');
      var cb = mocks.getMockFunction();

      ReactServerRendering.renderToString(
        React.createElement("span", {onClick: cb}, "hello world")
      );
      expect(EventPluginHub.__getListenerBank()).toEqual({});
    });

    it('should render composite components', function() {
      var Parent = React.createClass({displayName: "Parent",
        render: function() {
          return React.createElement("div", null, React.createElement(Child, {name: "child"}));
        }
      });
      var Child = React.createClass({displayName: "Child",
        render: function() {
          return React.createElement("span", null, "My name is ", this.props.name);
        }
      });
      var response = ReactServerRendering.renderToString(
        React.createElement(Parent, null)
      );
      expect(response).toMatch(
        '<div ' + ID_ATTRIBUTE_NAME + '="[^"]+" ' +
          ReactMarkupChecksum.CHECKSUM_ATTR_NAME + '="[^"]+">' +
          '<span ' + ID_ATTRIBUTE_NAME + '="[^"]+">' +
            '<span ' + ID_ATTRIBUTE_NAME + '="[^"]+">My name is </span>' +
            '<span ' + ID_ATTRIBUTE_NAME + '="[^"]+">child</span>' +
          '</span>' +
        '</div>'
      );
    });

    it('should only execute certain lifecycle methods', function() {
      function runTest() {
        var lifecycle = [];
        var TestComponent = React.createClass({displayName: "TestComponent",
          componentWillMount: function() {
            lifecycle.push('componentWillMount');
          },
          componentDidMount: function() {
            lifecycle.push('componentDidMount');
          },
          getInitialState: function() {
            lifecycle.push('getInitialState');
            return {name: 'TestComponent'};
          },
          render: function() {
            lifecycle.push('render');
            return React.createElement("span", null, "Component name: ", this.state.name);
          },
          componentWillUpdate: function() {
            lifecycle.push('componentWillUpdate');
          },
          componentDidUpdate: function() {
            lifecycle.push('componentDidUpdate');
          },
          shouldComponentUpdate: function() {
            lifecycle.push('shouldComponentUpdate');
          },
          componentWillReceiveProps: function() {
            lifecycle.push('componentWillReceiveProps');
          },
          componentWillUnmount: function() {
            lifecycle.push('componentWillUnmount');
          }
        });

        var response = ReactServerRendering.renderToString(
          React.createElement(TestComponent, null)
        );

        expect(response).toMatch(
          '<span ' + ID_ATTRIBUTE_NAME + '="[^"]+" ' +
            ReactMarkupChecksum.CHECKSUM_ATTR_NAME + '="[^"]+">' +
            '<span ' + ID_ATTRIBUTE_NAME + '="[^"]+">Component name: </span>' +
            '<span ' + ID_ATTRIBUTE_NAME + '="[^"]+">TestComponent</span>' +
          '</span>'
        );
        expect(lifecycle).toEqual(
          ['getInitialState', 'componentWillMount', 'render']
        );
      }

      runTest();

      // This should work the same regardless of whether you can use DOM or not.
      ExecutionEnvironment.canUseDOM = true;
      runTest();
    });

    it('should have the correct mounting behavior', function() {
      // This test is testing client-side behavior.
      ExecutionEnvironment.canUseDOM = true;

      var mountCount = 0;
      var numClicks = 0;

      var TestComponent = React.createClass({displayName: "TestComponent",
        componentDidMount: function() {
          mountCount++;
        },
        click: function() {
          numClicks++;
        },
        render: function() {
          return (
            React.createElement("span", {ref: "span", onClick: this.click}, "Name: ", this.props.name)
          );
        }
      });

      var element = document.createElement('div');
      React.render(React.createElement(TestComponent, null), element);

      var lastMarkup = element.innerHTML;

      // Exercise the update path. Markup should not change,
      // but some lifecycle methods should be run again.
      React.render(React.createElement(TestComponent, {name: "x"}), element);
      expect(mountCount).toEqual(1);

      // Unmount and remount. We should get another mount event and
      // we should get different markup, as the IDs are unique each time.
      React.unmountComponentAtNode(element);
      expect(element.innerHTML).toEqual('');
      React.render(React.createElement(TestComponent, {name: "x"}), element);
      expect(mountCount).toEqual(2);
      expect(element.innerHTML).not.toEqual(lastMarkup);

      // Now kill the node and render it on top of server-rendered markup, as if
      // we used server rendering. We should mount again, but the markup should
      // be unchanged. We will append a sentinel at the end of innerHTML to be
      // sure that innerHTML was not changed.
      React.unmountComponentAtNode(element);
      expect(element.innerHTML).toEqual('');

      ExecutionEnvironment.canUseDOM = false;
      lastMarkup = ReactServerRendering.renderToString(
        React.createElement(TestComponent, {name: "x"})
      );
      ExecutionEnvironment.canUseDOM = true;
      element.innerHTML = lastMarkup + ' __sentinel__';

      React.render(React.createElement(TestComponent, {name: "x"}), element);
      expect(mountCount).toEqual(3);
      expect(element.innerHTML.indexOf('__sentinel__') > -1).toBe(true);
      React.unmountComponentAtNode(element);
      expect(element.innerHTML).toEqual('');

      // Now simulate a situation where the app is not idempotent. React should
      // warn but do the right thing.
      var _warn = console.warn;
      console.warn = mocks.getMockFunction();
      element.innerHTML = lastMarkup;
      var instance = React.render(React.createElement(TestComponent, {name: "y"}), element);
      expect(mountCount).toEqual(4);
      expect(console.warn.mock.calls.length).toBe(1);
      expect(element.innerHTML.length > 0).toBe(true);
      expect(element.innerHTML).not.toEqual(lastMarkup);
      console.warn = _warn;

      // Ensure the events system works
      expect(numClicks).toEqual(0);
      ReactTestUtils.Simulate.click(instance.refs.span.getDOMNode());
      expect(numClicks).toEqual(1);
    });

    it('should throw with silly args', function() {
      expect(
        ReactServerRendering.renderToString.bind(
          ReactServerRendering,
          'not a component'
        )
      ).toThrow(
        'Invariant Violation: renderToString(): You must pass ' +
        'a valid ReactElement.'
      );
    });
  });

  describe('renderComponentToStaticMarkup', function() {
    it('should not put checksum and React ID on components', function() {
      var lifecycle = [];
      var NestedComponent = React.createClass({displayName: "NestedComponent",
        render: function() {
          return React.createElement("div", null, "inner text");
        }
      });

      var TestComponent = React.createClass({displayName: "TestComponent",
        render: function() {
          lifecycle.push('render');
          return React.createElement("span", null, React.createElement(NestedComponent, null));
        }
      });

      var response = ReactServerRendering.renderToStaticMarkup(
        React.createElement(TestComponent, null)
      );

      expect(response).toBe('<span><div>inner text</div></span>');
    });

    it('should not put checksum and React ID on text components', function() {
      var TestComponent = React.createClass({displayName: "TestComponent",
        render: function() {
          return React.createElement("span", null, 'hello', " ", 'world');
        }
      });

      var response = ReactServerRendering.renderToStaticMarkup(
        React.createElement(TestComponent, null)
      );

      expect(response).toBe('<span>hello world</span>');
    });

    it('should not register event listeners', function() {
      var EventPluginHub = require('EventPluginHub');
      var cb = mocks.getMockFunction();

      ReactServerRendering.renderToString(
        React.createElement("span", {onClick: cb}, "hello world")
      );
      expect(EventPluginHub.__getListenerBank()).toEqual({});
    });

    it('should only execute certain lifecycle methods', function() {
      function runTest() {
        var lifecycle = [];
        var TestComponent = React.createClass({displayName: "TestComponent",
          componentWillMount: function() {
            lifecycle.push('componentWillMount');
          },
          componentDidMount: function() {
            lifecycle.push('componentDidMount');
          },
          getInitialState: function() {
            lifecycle.push('getInitialState');
            return {name: 'TestComponent'};
          },
          render: function() {
            lifecycle.push('render');
            return React.createElement("span", null, "Component name: ", this.state.name);
          },
          componentWillUpdate: function() {
            lifecycle.push('componentWillUpdate');
          },
          componentDidUpdate: function() {
            lifecycle.push('componentDidUpdate');
          },
          shouldComponentUpdate: function() {
            lifecycle.push('shouldComponentUpdate');
          },
          componentWillReceiveProps: function() {
            lifecycle.push('componentWillReceiveProps');
          },
          componentWillUnmount: function() {
            lifecycle.push('componentWillUnmount');
          }
        });

        var response = ReactServerRendering.renderToStaticMarkup(
          React.createElement(TestComponent, null)
        );

        expect(response).toBe('<span>Component name: TestComponent</span>');
        expect(lifecycle).toEqual(
          ['getInitialState', 'componentWillMount', 'render']
        );
      }

      runTest();

      // This should work the same regardless of whether you can use DOM or not.
      ExecutionEnvironment.canUseDOM = true;
      runTest();
    });

    it('should throw with silly args', function() {
      expect(
        ReactServerRendering.renderToStaticMarkup.bind(
          ReactServerRendering,
          'not a component'
        )
      ).toThrow(
        'Invariant Violation: renderToStaticMarkup(): You must pass ' +
        'a valid ReactElement.'
      );
    });

    it('allows setState in componentWillMount without using DOM', function() {
      var Component = React.createClass({displayName: "Component",
        componentWillMount: function() {
          this.setState({text: 'hello, world'});
        },
        render: function() {
          return React.createElement("div", null, this.state.text);
        }
      });

      ReactReconcileTransaction.prototype.perform = function() {
        // We shouldn't ever be calling this on the server
        throw new Error('Browser reconcile transaction should not be used');
      };
      var markup = ReactServerRendering.renderToString(
        React.createElement(Component, null)
      );
      expect(markup.indexOf('hello, world') >= 0).toBe(true);
    });
  });
});
