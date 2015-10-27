var mongo = require('mongodb').MongoClient,
    http  = require('http'),
    app =  http.createServer(listener),
	  client = require('socket.io')(app),
    fs = require('fs');

app.listen(process.env.PORT || 8080);


function listener (req, res) {
  var url =  req.url;
  res.sendStatus = 200;
  if(/chat.html/.test(url) || url == '/'){
    res.setHeader("Content-Type", "text/html");
    var file = fs.readFileSync("./chat.html");
    res.end(file);
  }else if(/\.css/.test(url)) {
    res.setHeader("Content-Type", "text/css");
    var css = fs.readFileSync("./css/chat.css");
    res.end(css);
  }else if(/\.js/.test(url)) {
    res.setHeader("Content-Type", "aplication/javascript");
    var js = fs.readFileSync("./js/app.js");
    res.end(js);
  }else {
    res.sendStatus = 404; 
    res.end("Link não existe");
  }

}
	mongo.connect('mongodb://mongodb:3101@ds043694.mongolab.com:43694/chat', function (err, db) {
		if(err) throw err;
		
 		client.on('connection', function (socket) {
			console.log('Someone has connected');
			console.log(socket.id);

			var col = db.collection('messages'),
				sendStatus = function (s) {
					socket.emit('status', s);
				};
			// Emit all messages
			col.find().limit(100).sort({_id : 1}).toArray(function (err, res) {
				if(err) throw err;
				socket.emit('output', res);
			});


			// Wait for input
			socket.on('input', function (data) {
	
				var name = data.name,
					message = data.message,
					whitespacePattern = /^\s*$/;

				if (whitespacePattern.test(name) || whitespacePattern.test(message)) {
					sendStatus('Name and message is required.');
				} else{
					
					col.insert({name : name, message : message}, function () {
						// Emit latest message to all users
						client.emit('output', [data]);

						sendStatus({
							message : "Message is sent",
							clear : true
						});
					});

				};	

			})
		});

	});

	console.log('Server is on');
