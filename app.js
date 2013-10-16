var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var redis = require('redis');
var fs = require('fs');
var _ = require('underscore');
var path = require('path');

app.listen(8088);

function handler(req,res){	
	var filePath = '.' + req.url;
	if (filePath == './'){
		filePath = './index.html';
		}
		
	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
		case '.png':
			contentType = 'image/png';
			break;
	}
	fs.exists(filePath, function(exists){
		if (exists) {
			fs.readFile(filePath, function(err, data){
				if(err){
					res.writeHead(500);
					return res.end('Error loading files');
				}
				else{
					res.writeHead(200, {'Content-Type': contentType});
					console.log("Listening on port 8088");
					res.end(data, 'utf-8');
				}
			});
		}
		else {
			res.writeHead(404);
			res.end();
		}
	});
}

var store = redis.createClient();
var pub = redis.createClient();
var sub = redis.createClient();
var list = redis.createClient();

sub.subscribe("chatting");
sub.on("message", function (channel, message) {
	console.log(channel + ": message received on server from publish ");
	client.send(message);
});

io.sockets.on('connection', function (client) {
	list.zrevrange("myset", 0 , 4, 'withscores', function(err,members){
		var lists=_.groupBy(members,function(a,b){
			return Math.floor(b/2);
		});
		console.log( _.toArray(lists) );
		client.emit("postscore",  _.toArray(lists) );
	});
	
	client.on("message", function (msg) {
		console.log(msg);
		
		switch(msg.type)
		{
			case "setUsername":
  				pub.publish("chatting", "A New Challenger Enters the Ring:" + msg.user);
				store.sadd("onlineUsers", msg.user);
  			break;
			case "sendscore":
  				list.zadd("myset", msg.score , msg.user);
				list.zrevrange("myset", 0 , 4, 'withscores', function(err,members){
					var lists=_.groupBy(members,function(a,b){
						return Math.floor(b/2);
					});
					console.log( _.toArray(lists) );
					client.emit("postscore",  _.toArray(lists) );
				});
  			break;
  			case "chat":
  				pub.publish("chatting", msg.message);
  			break;
			default:
  				console.log("!!!received unknown input msg!!!");
		}
	});
	client.on('disconnect',function () {
		sub.quit();
		pub.publish("chatting","Disconnected :" + client.id);
	});
});

/*function setUser(username, img, area, expire){
	client.set(area+':users:' + username, username);
	client.expire(area+':users:' + username, expire);
	client.set(area+':users:' + username + ':img', img);
	client.expire(area+':users:' + username + ':img', expire);
	//set a timer
	client.set(area+':users:timer', expire);
	client.expire(area+':users:timer', expire);
	client.sadd(area+':users', area+':users:' + username);
	//add the set to the expire set
	client.sadd('expireKeys', area+':users');
}

function checkExpires(){
	//grab the expire set
	store.smembers('expireKeys', function(err, keys){
		if(keys != null){
			keys.forEach(function(key){
				client.get(key+':timer', function(err, timer){
					//grab the timer
					if(timer != null){
						//timer exists check the ttl on it
						client.ttl(key+':timer', function(err, ttl){
							//the ttl is two hours and if it is under
							//a half hour we delete it
							if(ttl < 1800){
								client.del(key);
								client.srem('expireKeys', key);
							}
						});
					}else{
						//the timer is gone delete the key
						client.del(key);
						client.srem('expireKeys', key);
					}
				})
			});
		}
	});
};*/