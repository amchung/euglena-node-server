
/**
 * Module dependencies.
 */

var Canvas = require('canvas')
  , canvas = new Canvas(320, 320)
  , ctx = canvas.getContext('2d')
  , http = require('http');


var vid_width = 640
  , vid_height = 480;


function getMjpeg(){
    var img = new Image();
        img.onload = function() {
            ctx.clearRect(0, 0, vid_width, vid_height);
            ctx.drawImage(img, 0, 0, vid_width, vid_height);
            // motion detection
            //compareFrame(img);
            // load frame
            //requestAnimFrame(getMjpeg);
        };
        img.src = "http://171.65.102.132:8080/?action=snapshot?t=" + new Date().getTime();
}

http.createServer(function (req, res) {
  clock(ctx);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('' + '<img src="' + canvas.toDataURL() + '" />');
}).listen(3000);
console.log('Server started on port 3000');
