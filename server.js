var express = require('express');
var app = express();
const path = require('path');
app.get('/', function(req, res){
    console.log(path.join(__dirname+'/index.html'));
    res.sendFile(path.join(__dirname+'/index.html'));
});
app.listen(3000, function(){
    console.log("server is running ");
});  