$("#city-picker #submit").click(function(e) {
    var city = $("#cities option:selected").text();
    var path = "/city/" + city;
    $.getJSON(path, function(data) {
        console.log(data)});
    console.log(path)});
