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

function selectCategory() {
}

$("#city-picker #submit").click(function(e) {
    var city = $("#cities option:selected").text();
    var path = "/city/" + city;
    $.getJSON(path, function(data) {
        console.log(data)});
    console.log(path)});
