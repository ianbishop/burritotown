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

$("#city-picker #submit").click(function(e) {
  clean();

  var city = $("#cities option:selected").text();
  var comparison = $("#compare-to option:selected").text();

  var d;

  if (comparison === "Big Cities") {
    d = $.Deferred();
    d.resolve({"similar": ["Toronto", "Montreal", "Vancouver"]});
  }
  else if (comparison === "Similar Cities") {
    d = $.getJSON("/city/" + city + "/similar");
  }

  d.then(function(similar) {
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
