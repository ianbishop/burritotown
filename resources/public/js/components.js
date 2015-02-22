function getSimilars(city) {
  $("#compare-to >").remove();
  var path = "/city/" + city + "/similar";
  _.each(["Compare To:", "Vancouver", "Montreal", "Toronto"], function(v) {
    $("<option>" + v + "</option>").appendTo("#compare-to");
  });
  $.getJSON(path, function(data) {
    var opts = _.each(data.similar, function(v) {
      $("<option>" + v + "</option>").appendTo("#compare-to");
    });
  });
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
  var majors = [city, "Vancouver", "Montreal", "Toronto"];
  var reqs = _.map(majors, function(v) {
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
