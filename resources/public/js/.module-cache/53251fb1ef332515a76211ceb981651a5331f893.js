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


/**
 * Counts clicks and has a renders an item for each click. Each item rendered
 * has a ref of the form "clickLogN".
 */
var ClickCounter = React.createClass({displayName: "ClickCounter",
  getInitialState: function() {
    return {count: this.props.initialCount};
  },
  triggerReset: function() {
    this.setState({count: this.props.initialCount});
  },
  handleClick: function() {
    this.setState({count: this.state.count + 1});
  },
  render: function() {
    var children = [];
    var i;
    for (i=0; i < this.state.count; i++) {
      children.push(
        React.createElement("div", {
          className: "clickLogDiv", 
          key: "clickLog" + i, 
          ref: "clickLog" + i}
        )
      );
    }
    return (
      React.createElement("span", {className: "clickIncrementer", onClick: this.handleClick}, 
        children
      )
    );
  }
});

/**
 * Only purpose is to test that refs are tracked even when applied to a
 * component that is injected down several layers. Ref systems are difficult to
 * build in such a way that ownership is maintained in an airtight manner.
 */
var GeneralContainerComponent = React.createClass({displayName: "GeneralContainerComponent",
  render: function() {
    return React.createElement("div", null, this.props.children);
  }
});

/**
 * Notice how refs ownership is maintained even when injecting a component
 * into a different parent.
 */
var TestRefsComponent = React.createClass({displayName: "TestRefsComponent",
  doReset: function() {
    this.refs.myCounter.triggerReset();
  },
  render: function() {
    return (
      React.createElement("div", null, 
        React.createElement("div", {ref: "resetDiv", onClick: this.doReset}, 
          "Reset Me By Clicking This."
        ), 
        React.createElement(GeneralContainerComponent, {ref: "myContainer"}, 
          React.createElement(ClickCounter, {ref: "myCounter", initialCount: 1})
        )
      )
    );
  }
});

/**
 * Render a TestRefsComponent and ensure that the main refs are wired up.
 */
var renderTestRefsComponent = function() {
  var testRefsComponent =
      ReactTestUtils.renderIntoDocument(React.createElement(TestRefsComponent, null));

  reactComponentExpect(testRefsComponent)
      .toBeCompositeComponentWithType(TestRefsComponent);

  var generalContainer = testRefsComponent.refs.myContainer;
  var counter = testRefsComponent.refs.myCounter;

  reactComponentExpect(generalContainer)
      .toBeCompositeComponentWithType(GeneralContainerComponent);
  reactComponentExpect(counter)
      .toBeCompositeComponentWithType(ClickCounter);

  return testRefsComponent;
};


var expectClickLogsLengthToBe = function(instance, length) {
  var clickLogs =
    ReactTestUtils.scryRenderedDOMComponentsWithClass(instance, 'clickLogDiv');
  expect(clickLogs.length).toBe(length);
  expect(Object.keys(instance.refs.myCounter.refs).length).toBe(length);
};

describe('reactiverefs', function() {
  beforeEach(function() {
    require('mock-modules').dumpCache();
  });

  /**
   * Ensure that for every click log there is a corresponding ref (from the
   * perspective of the injected ClickCounter component.
   */
  it("Should increase refs with an increase in divs", function() {
    var testRefsComponent = renderTestRefsComponent();
    var clickIncrementer =
      ReactTestUtils.findRenderedDOMComponentWithClass(
        testRefsComponent,
        'clickIncrementer'
      );

    expectClickLogsLengthToBe(testRefsComponent, 1);

    // After clicking the reset, there should still only be one click log ref.
    ReactTestUtils.Simulate.click(testRefsComponent.refs.resetDiv);
    expectClickLogsLengthToBe(testRefsComponent, 1);

    // Begin incrementing clicks (and therefore refs).
    ReactTestUtils.Simulate.click(clickIncrementer);
    expectClickLogsLengthToBe(testRefsComponent, 2);

    ReactTestUtils.Simulate.click(clickIncrementer);
    expectClickLogsLengthToBe(testRefsComponent, 3);

    // Now reset again
    ReactTestUtils.Simulate.click(testRefsComponent.refs.resetDiv);
    expectClickLogsLengthToBe(testRefsComponent, 1);

  });

});



/**
 * Tests that when a ref hops around children, we can track that correctly.
 */
describe('ref swapping', function() {
  beforeEach(function() {
    require('mock-modules').dumpCache();
  });

  var RefHopsAround = React.createClass({displayName: "RefHopsAround",
    getInitialState: function() {
      return {count: 0};
    },
    moveRef: function() {
      this.setState({ count: this.state.count + 1 });
    },
    render: function() {
      var count = this.state.count;
      /**
       * What we have here, is three divs with refs (div1/2/3), but a single
       * moving cursor ref `hopRef` that "hops" around the three. We'll call the
       * `moveRef()` function several times and make sure that the hop ref
       * points to the correct divs.
       */
      return (
        React.createElement("div", null, 
          React.createElement("div", {
            className: "first", 
            ref: count % 3 === 0 ? 'hopRef' : 'divOneRef'}
          ), 
          React.createElement("div", {
            className: "second", 
            ref: count % 3 === 1 ? 'hopRef' : 'divTwoRef'}
          ), 
          React.createElement("div", {
            className: "third", 
            ref: count % 3 === 2 ? 'hopRef' : 'divThreeRef'}
          )
        )
      );
    }
  });

  it("Allow refs to hop around children correctly", function() {
    var refHopsAround = ReactTestUtils.renderIntoDocument(React.createElement(RefHopsAround, null));

    var firstDiv =
      ReactTestUtils.findRenderedDOMComponentWithClass(refHopsAround, 'first');
    var secondDiv =
      ReactTestUtils.findRenderedDOMComponentWithClass(refHopsAround, 'second');
    var thirdDiv =
      ReactTestUtils.findRenderedDOMComponentWithClass(refHopsAround, 'third');

    expect(refHopsAround.refs.hopRef).toEqual(firstDiv);
    expect(refHopsAround.refs.divTwoRef).toEqual(secondDiv);
    expect(refHopsAround.refs.divThreeRef).toEqual(thirdDiv);

    refHopsAround.moveRef();
    expect(refHopsAround.refs.divOneRef).toEqual(firstDiv);
    expect(refHopsAround.refs.hopRef).toEqual(secondDiv);
    expect(refHopsAround.refs.divThreeRef).toEqual(thirdDiv);

    refHopsAround.moveRef();
    expect(refHopsAround.refs.divOneRef).toEqual(firstDiv);
    expect(refHopsAround.refs.divTwoRef).toEqual(secondDiv);
    expect(refHopsAround.refs.hopRef).toEqual(thirdDiv);

    /**
     * Make sure that after the third, we're back to where we started and the
     * refs are completely restored.
     */
    refHopsAround.moveRef();
    expect(refHopsAround.refs.hopRef).toEqual(firstDiv);
    expect(refHopsAround.refs.divTwoRef).toEqual(secondDiv);
    expect(refHopsAround.refs.divThreeRef).toEqual(thirdDiv);
  });


  it('always has a value for this.refs', function() {
    var Component = React.createClass({displayName: "Component",
      render: function() {
        return React.createElement("div", null);
      }
    });

    var instance = ReactTestUtils.renderIntoDocument(React.createElement(Component, null));
    expect(!!instance.refs).toBe(true);
  });
});

