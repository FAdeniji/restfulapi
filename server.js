var app = require('./app');
var port = process.env.PORT || 3000;
var http = require("http");
setInterval(function() {
    http.get("https://users-dev-api-pr-2.herokuapp.com/api/register");
}, 300000); // every 5 minutes (300000)

var server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});

// This is just to add a comment
