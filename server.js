var express = require('express');
var app = express();

app.get('/', function(req, res) {
    res.json({'msg': 'Hello OCP!'})
});

var port = process.env.port || 3000;
app.listen(port, function() {
  console.log('server started');
});
