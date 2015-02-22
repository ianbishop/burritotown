function getSimilars(city) {
    var path = "/city/" + city + "/similar";
    var cities = [city];
    $.getJSON (path, function(data) {
        _.each(data, function(v) {
            cities.push(v.similar);
        });
    }).then(function() {return cities});
}

$("#city-picker #submit").click(function(e) {
    var city = $("#cities option:selected").text();
    var compareTo = $("#compare-to option:selected").text();
    var comparisonCities;
    switch(compareTo) {
     case "Big Cities": comparisonCities = [city, "Vancouver", "Montreal", "Toronto"];
     case "Similar Cities": comparisonCities = [];
     default: console.log(compareTo);
    }

    var majors = [city, "Vancouver", "Montreal", "Toronto"];
    _.each(majors, function(v) {
        var results = [];
        var path = "/city/" + v;
        $.getJSON(path, function(data) {
            results.push(data);
        }).then(function() {
            drawComparison(results);
        });
    });
});
