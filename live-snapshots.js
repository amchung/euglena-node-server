
/**
 * Module dependencies.
 */

var Canvas = require('canvas')
  , canvas = new Canvas(320, 320)
  , ctx = canvas.getContext('2d')
  , Image = Canvas.Image;
  
var http = require('http');
  
function takeSnapshot(){
	var timestamp = new Date().getTime();
	
	http.get("http://171.65.102.132:8080/?action=snapshot?t=" + timestamp, function(res) {
        res.setEncoding('binary')
        var buf = ''
        res.on('data', function(chunk){
            buf+= chunk; 
        });
        res.on('end', function(){
        	var img = new Image();
        	img.onerror = function(err){
  				throw err;
			};

  			img.onload = function(){
				ctx.drawImage(img, 0, 0, img.width, img.height);
			};
			
			img.src = new Buffer(buf, 'binary');
        });
    }).on('error', function(e) {
    	console.log("Got error: " + e.message);
    });
}

/*  
var http = require('http')
  , fs = require('fs')
  , url = require('url');

var options = {
    host: '171.65.102.132'
  , port: 8080
  , path: '/?action=snapshot?t=' + new Date().getTime()
}

function getMjpeg(){
	http.get(options, function(res){
    	var imagedata = '';
    	res.setEncoding('binary');
		var data = new Buffer(parseInt(res.headers['content-length'],10));
	
    	res.on('data', function(chunk){
    		chunk.copy(data, imagedata);
        	imagedata += chunk;
    	});

    	res.on('end', function () {
  			//img = new canvas.Image;
  			var img = new Image();
  			
  			img.onerror = function(err){
  				throw err;
			};

  			img.onload = function(){
				ctx.drawImage(img, 0, 0, img.width, img.height);
			};
			
			img.src = imagedata;
		});
	});
}*/


/*var vid_width = 640
  , vid_height = 480;


function getMjpeg(){
    var img = new Image();
        
    img.onerror = function(err){
  		throw err;
	};

	img.onload = function(){
  		var w = img.width / 2
    	, h = img.height / 2
    	, canvas = new Canvas(w, h)
    	, ctx = canvas.getContext('2d');

  		ctx.drawImage(img, 0, 0, w, h, 0, 0, w, h);
	};

	img.src = "http://171.65.102.132:8080/?action=snapshot?t=" + new Date().getTime();
}*/

http.createServer(function (req, res) {
  takeSnapshot();
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('' + '<img src="' + canvas.toDataURL() + '" />');
}).listen(3000);
console.log('Server started on port 3000');
