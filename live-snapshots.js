
/**
 * Module dependencies.
 */

var Canvas = require('canvas')
  , canvas = new Canvas(320, 320)
  , ctx = canvas.getContext('2d')
  , Image = Canvas.Image
  , http = require('http');


var vid_width = 640
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

 	 	//var out = fs.createWriteStream(__dirname + '/crop.jpg');

  		//var stream = canvas.createJPEGStream({
  		//  	bufsize : 2048,
 		//   	quality : 80
 	 	//});

	  	//stream.pipe(out);
	};

	img.src = "http://171.65.102.132:8080/?action=snapshot?t=" + new Date().getTime();
}

http.createServer(function (req, res) {
  getMjpeg();
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('' + '<img src="' + canvas.toDataURL() + '" />');
}).listen(3000);
console.log('Server started on port 3000');
