$("#city-picker #submit").click(function(e) {
    var city = $("#cities option:selected").text();
    var path = "/cities/" + city;
    $.getJSON(path, function(data) {
        console.log(data)});
    console.log(path)});
