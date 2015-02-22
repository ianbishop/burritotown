function getSimilars(city) {
    var path = "/city/" + city + "/similar";
    var cities = [city];
    $.getJSON (path, function(data) {
        _.each(data, function(v) {
            cities.push(v.similar);
        });
    }).then(function() {return cities});
}

function clean() {
  var containers = ["incomeBar", "incomeChartHeader", "incomeChart",
                    "ageBar", "ageChartHeader", "ageChart"];
  _.each(containers, function(k) {
    var selector = "#" + k;
    if ($(selector).children().length > 0) {
      $(selector).empty();
    }
  });
}

function getSimilar(city) {
  var comparison = $("#compare-to option:selected").text();

  var d;

  if (comparison === "Big Cities") {
    d = $.Deferred();
    d.resolve({"similar": ["Toronto", "Montreal", "Vancouver"]});
  }
  else if (comparison === "Similar Cities") {
    d = $.getJSON("/city/" + city + "/similar");
  }

  return d;
}

$("#city-picker #submit").click(function(e) {
  clean();

  var city = $("#cities option:selected").text();

  var sim = getSimilar(city);

  sim.then(function(similar) {
    var cities = similar["similar"];
    cities.unshift(city);

    var reqs = _.map(cities, function(v) {
      return $.getJSON("/city/" + v);
    });

    $.when.apply($, reqs).then(function() {
      var args = Array.prototype.slice.call(arguments);
      var cities = _.map(args, function(v) {
        return v[0];
      });
      drawComparison(cities);
    });
  });

});

$(".icon-row").children().click(function() {
  var category = $(this).attr('id');

  var city = $("#cities option:selected").text();

  var sim = getSimilar(city);

  sim.then(function(similar) {
    var cities = similar["similar"];

    var reqs = _.map(cities, function(v) {
      return $.getJSON("/city/" + city + "/compare/" + category + "/" + v);
    });

    $.when.apply($, reqs).then(function() {
      var args = Array.prototype.slice.call(arguments);
      var citycomps = _.map(args, function(v) {
        return v[0];
      });

      var comptainer =  $("#comparison");
      comptainer.empty();

      var tbl = $("<table>").addClass("pure-table");
      var thead = $("<thead>");
      var theadInside = $("<tr>");

      theadInside.append($("<th>#</th>"));
      for (var i=0; i < cities.length; i++) {
        theadInside.append($("<th>" + cities[i] + "</th>"));
      }
      thead.append(theadInside);

      tbl.append(thead);

      var tbody = $("<tbody>");

      for (i=0; i < 5; i++) {
        var row = $("<tr>");
        for (var j=0; j < cities.length + 1; j++) {
          if (j == 0) {
            row.append($("<td>" + (i + 1) + "</td>"));
          }
          else {
            row.append($("<td>" + citycomps[j-1][i] + "</td>"));
          }
        }
        tbody.append(row);
      }

      tbl.append(tbody);

      comptainer.append(tbl);
    });
  });
});
