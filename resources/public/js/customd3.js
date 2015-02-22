var margin = {
  top: 20,
  right: 40,
  bottom: 20,
  left: 30
};

var width = 960 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom,
    thinHeight = 40;

var fullWidthHeight = 50;

var barPadding = 5;
var dataset = [ 5, 19, 21, 25];

var color = d3.scale.quantize()
                    .domain([0, d3.max(dataset)])
                    .range(d3.range(8).map(function(d) { return "q" + d + "-9"; }));

var colorscale ={
  "q0-9": "rgb(247,251,255)",
  "q1-9": "rgb(222,235,247)",
  "q2-9": "rgb(198,219,239)",
  "q3-9": "rgb(158,202,225)",
  "q4-9": "rgb(107,174,214)",
  "q5-9": "rgb(66,146,198)",
  "q6-9": "rgb(33,113,181)",
  "q7-9": "rgb(8,81,156)"
}

function thinRow(svgElement, elementData, city, type, fontSize) {
    var textWidth = width / elementData.length - barPadding;
    var elementWidth = (width - textWidth) / elementData.length - barPadding;
    var colorCapIndex = d3.scale.quantize()
                                .domain([0, d3.max(elementData)])
                                .range(d3.range(8).map(function(d) { return "q" + d + "-9"; }));

    svgElement.selectAll("rect")
              .data(elementData)
              .enter()
              .append("rect")
              .attr("x", function(d, i) {
                return textWidth + i * (width - textWidth) / elementData.length;
              })
              .attr("width", elementWidth)
              .attr("height", thinHeight)
              .attr("fill", function(d) {
                return colorscale[colorCapIndex(d)];
              })
              .attr("rx", 3)
              .attr("ry", 3);

    svgElement.selectAll("text")
              .data(elementData)
              .enter()
              .append("text")
              .text(function(d) {
                return d + type;
              })
              .attr("x", function(d, i) {
                return textWidth + i * ((width - textWidth) / elementData.length) + ((width - textWidth) / elementData.length - barPadding) / 2;
              })
              .attr("y", function(d) {
                return thinHeight / 2 + 10;
              })
              .attr("font-size", "25px")
              .attr("fill", "black")
              .attr("text-anchor", "middle");

    svgElement.append("text")
              .text(city)
              .attr("x", function() {
                return ((width - textWidth) / elementData.length - barPadding) / 2 + 20;
              })
              .attr("y", thinHeight / 2 + 10)
              .attr("font-size", fontSize)
              .attr("text-anchor", "middle")
              .attr("fill", "white");
}

function thinRowHeader(svgElement, elementData, offset) {
  var textWidth = width / elementData.length - barPadding;
  var elementWidth = (width - textWidth) / elementData.length - barPadding;
  svgElement.selectAll("text")
             .data(elementData)
             .enter()
             .append("text")
             .text(function(d) {
               return d;
             })
             .attr("x", function(d, i) {
               return textWidth + i * ((width - textWidth) / elementData.length) + ((width - textWidth) / elementData.length - barPadding) / 2 ;
             })
             .attr("y", function(d) {
               return thinHeight / 2 + 10;
             })
             .attr("font-size", "15px")
             .attr("fill", "white")
             .attr("text-anchor", "middle");
}

function fullWidth(svgElement, elementData, offset) {
  var elementWidth = width - barPadding;
  svgElement.append("rect")
            .attr("width", elementWidth)
            .attr("height", 2)
            .attr("y", fullWidthHeight / 2 + 5)
            .attr("fill", "white");

  function proportion() {
    var range = elementData.max - elementData.min;
    var diff = elementData.value - elementData.min;
    var percent = diff / range;
    return percent * elementWidth;
  }

  svgElement.append("line")
            .attr("x1", proportion())
            .attr("x2", proportion())
            .attr("y1", 15)
            .attr("y2", fullWidthHeight-5)
            .attr("stroke", "white")
            .attr("stroke-width", "3")
            .attr("stroke-linecap", "round");

  svgElement.append("text")
            .text(elementData.value)
            .attr("x", proportion() - 8)
            .attr("y", 10)
            .attr("font-size", "14px")
            .attr("fill", "white");

  svgElement.append("text")
            .text(elementData.min)
            .attr("x", 0)
            .attr("y", fullWidthHeight)
            .attr("font-size", "12px")
            .attr("fill", "white");

  svgElement.append("text")
            .text(elementData.max)
            .attr("x", elementWidth - 13 - offset)
            .attr("y", fullWidthHeight)
            .attr("font-size", "12px")
            .attr("fill", "white");
}

function createTextRow(svgElement, elementData, fontSize, fontY) {
    var sideLength = width / elementData.length - barPadding
    svgElement.selectAll("text")
              .data(elementData)
              .enter()
              .append("text")
              .text(function(d) {
                return d;
              })
              .attr("x", function(d, i) {
                return i * (width / elementData.length) + (width / elementData.length - barPadding) / 2;
              })
              .attr("y", function(d) {
                return sideLength / 2 + fontY;
              })
              .attr("font-size", fontSize)
              .attr("fill", "white")
              .attr("text-anchor", "middle")
              .attr("fill", "white");
}

function createSvgRow(svgElement, elementData) {
  var sideLength = width / elementData.length - barPadding
  svgElement.selectAll("rect")
            .data(elementData)
            .enter()
            .append("rect")
            .attr("x", function(d, i) {
              return i * (width / elementData.length);
            })
            .attr("width", sideLength)
            .attr("height", sideLength)
            .attr("fill", function(d) {
              return colorscale[color(d)];
            })
            .attr("rx", 3)
            .attr("ry", 3);

  svgElement.selectAll("text")
            .data(elementData)
            .enter()
            .append("text")
            .text(function(d) {
              return d;
            })
            .attr("x", function(d, i) {
              return i * (width / elementData.length) + (width / elementData.length - barPadding) / 2;
            })
            .attr("y", function(d) {
              return sideLength / 2 + 30;
            })
            .attr("font-size", "80px")
            .attr("fill", "white")
            .attr("text-anchor", "middle")
            .attr("fill", "white");
}

function drawComparison (cities) {
  var selectedCity = cities[0];
  var ageRangeData = {min: 31, max: 53, value: selectedCity["age"]};
  d3.select("#agetitle")
    .style("visibility", "visible");
  d3.select("#incometitle")
    .style("visibility", "visible");

  var svgAgeRange = d3.select("#ageBar")
                      .append("svg")
                      .attr("width", width)
                      .attr("height", fullWidthHeight);

  fullWidth(svgAgeRange, ageRangeData, 0);

  var incomeRangeData = {min: 17500, max: 79720, value: selectedCity["income"]};
  var svgIncomeRange = d3.select("#incomeBar")
                         .append("svg")
                         .attr("width", width);
  
  fullWidth(svgIncomeRange, incomeRangeData, 20);

  var svgArray = [];
  var svgHeaderAge = d3.select("#ageChartHeader")
                       .append("svg")
                       .attr("width", width)
                       .attr("height", thinHeight);
  var headingText = ["0 to 24", "25 to 44", "45 to 64", "65+"];
  thinRowHeader(svgHeaderAge, headingText, 7);

  for (var i=0; i < cities.length; i++) {
    var city = cities[i];
    var svg = d3.select("#ageChart")
                .append("svg")
                .attr("width", width)
                .attr("height", thinHeight);

    var agePercentages = [city["Age0to24"], city["Age25to44"], city["Age45to64"], city["Age65up"]];

    thinRow(svg, agePercentages, city["name"], "%", "25px");
    svgArray.push(svg);
  }
  
  var svgArrayIncome = []
  var svgHeaderIncome = d3.select("#incomeChartHeader")
                          .append("svg")
                          .attr("width", width)
                          .attr("height", thinHeight);
  headingText = ["$0-15", "$15-25", "$25-35", "$35-50", "$50-75", "$75-100", "$100+"]
  thinRowHeader(svgHeaderIncome, headingText, 15)
  for (var i = 0; i < cities.length; i++) {
    var city = cities[i];
    var svgIncome = d3.select("#incomeChart")
                      .append("svg")
                      .attr("width", width)
                      .attr("height", thinHeight);
    
    var incomePercentages = [city["Inc0to15"], city["Inc25to35"], city["Inc35to50"], city["Inc50to75"], city["Inc75to100"], city["Inc100up"]];

    thinRow(svgIncome, incomePercentages, city["name"], "%", "15px");
    svgArrayIncome.push(svgIncome);
  }
}
