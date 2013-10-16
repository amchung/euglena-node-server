const PORT = 8088;
const HOST = '171.65.102.132';

var express = require('express'),
	http = require('http'),
	server = http.createServer(app);
	
var app = express();

const redis = require('redis');
const client = redis.createClient();

const io = require('socket.io');
const list = redis.createClient();

if (!module.parent) {
    server.listen(PORT, HOST);
    const socket  = io.listen(server);
 
    socket.on('connection', function(client) {
        const sub = redis.createClient();
        sub.subscribe('realtime');
        const pub = redis.createClient();
        
    	list.zrevrange("myset", 0 , 4, 'withscores', function(err,members){
			var lists=_.groupBy(members,function(a,b){
				return Math.floor(b/2);
			});
			console.log( _.toArray(lists) );
			client.emit("postscore",  _.toArray(lists) );
		});
 
        sub.on("message", function(channel, message) {
            client.send(message);
        });
 
        client.on('message', function(msg) {
        	switch(msg.type)
			{
				case "setUsername":
  					pub.publish("realtime", "A New Challenger Enters the Ring:" + msg.user);
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
  					pub.publish("realtime", msg.message);
  					break;
				default:
  					console.log("!!!received unknown input msg!!!");
		}
        });
 
        client.on('disconnect', function() {
            sub.quit();
            pub.publish("realtime","Disconnected :" + client.id);
        });
    });
}


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