// Carrega dependência do banco de dados mongo DB
var mongo = require('mongodb').MongoClient,
	// Carrega dependência da biblioteca express (responsável por gerenciar as rotas)
    express = require('express'),
    app =  express();
    // Carrega a dependência da biblioteca nativa HTTP para permitir requisições
    http = require('http').createServer(app),
    // Carrega a dependência da biblioteca socket.io (implementação de socket usada na aplicação)
	client = require('socket.io'),
	client = client.listen(http),
	// Configura o servidor para escutar a porta 8080, ou a porta padrão do sistema de hospedagem
	http.listen(process.env.PORT || 8080);
    // usa o método static() passando como parâmetro o nome do diretório onde estão os arquivos html
	app.use(express.static('views'));
   

	// Conecta no banco de dados hospedado no serviço Mongolab
	mongo.connect('mongodb://mongodb:3101@ds043694.mongolab.com:43694/chat', function (err, db) {
		if(err) throw err;
		// Aguarda que um socket cliente se conecte
 		client.on('connection', function (socket) {
			console.log('Someone has connected');
			console.log(socket.id);
			// seleciona a coleção responsável por armazenar as mensagens no banco
			var col = db.collection('messages'),
				sendStatus = function (s) {
					socket.emit('status', s);
				};
			// Envia todas as mensagens armazenadas para a tela do chat
			col.find().limit(100).sort({_id : 1}).toArray(function (err, res) {
				if(err) throw err;
				socket.emit('output', res);
			});


			// Espera que o cliente emita um evento do tipo 'input' e recebe os dados digitados
			socket.on('input', function (data) {
	
				var name = data.name,
					message = data.message,
					whitespacePattern = /^\s*$/;
					// Testa o nome de usuário e a mensagem recebida para evitar que chegue algo vazio
				if (whitespacePattern.test(name) || whitespacePattern.test(message)) {
					sendStatus('Name and message is required.');
				} else{
					// Se não tiver nenhum campo vazio insere no banco de dados
					col.insert({name : name, message : message}, function () {
						// Envia a última mensagem gravada no banco para a tela do chat
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
