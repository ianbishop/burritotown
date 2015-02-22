(function(){
    React.render(React.createElement(ReactTypeahead.Tokenizer, {defaultValue: "foo", 
        options: 
            ["foobar", "spameggs", "hameggs",
             "spamfoo", "spam"]}),
        document.getElementById("example"));
})()
