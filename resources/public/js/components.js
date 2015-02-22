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

$("#city-picker #submit").click(function(e) {
    var city = $("#cities option:selected").text();
    var majors = [city, "Vancouver", "Montreal", "Toronto"];
    var results = [];
    _.each(majors, function(v) {
        var path = "/city/" + v;
        $.getJSON(path, function(data) {
            results.push(data);
        }).then(function() {
            drawComparison(results);
        });
    });
});
