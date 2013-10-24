const PORT = 3000;
const HOST = '171.65.102.132';

var express = require('express'),
	http = require('http'),
	server = http.createServer(app);
	
var fs  = require('fs');
	
var app = express();

/*******************************************************************************
  Show Euglena Live Screen Gallery
*******************************************************************************/

app.use(express.static(__dirname + '/tmp/'));
app.listen(PORT);

/*******************************************************************************
  Capture Euglena Live Screen
*******************************************************************************/

var snapshot_t_interval = 1000 * 60 * 1; // every minute
setInterval(takeSnapshot, snapshot_t_interval);
takeSnapshot();

function takeSnapshot(){
  var timestamp = new Date().getTime();
  
  http.get("http://171.65.102.132:8080/?action=snapshot?t=" + timestamp, function(res) {
        res.setEncoding('binary');
        var imagedata = '';
        res.on('data', function(chunk){
            imagedata+= chunk; 
        });
        res.on('end', function(){
          console.log("tmp/"+timestamp+".jpg");
          var path = require('path');
          var file = path.join(__dirname, 'tmp', timestamp+".jpg");
            fs.writeFile(file, imagedata, 'binary');
        });
    }).on('error', function(e) {
      		console.log("Got error: " + e.message);
	});
}
