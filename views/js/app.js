	 
(function () {
		var getNode = function (s) {
			return document.querySelector(s);
		},
		// Captura os elementos DOM através da função getNode()
		messages = getNode('.chat-messages'),
		status = getNode('.chat-status span'),
		textarea = getNode('.chat textarea'),	
		chatName = getNode('.chat-name'),	
	    n =''+ window.location;
	    n2 = n.split('?user=');
	    name = n2[1];
		chatName.value = name;
		chatName.disabled = true;		
		statusDefault = status.textContent,		   
		

		setStatus = function (s) {
			status.textContent = s;
			// Seta o valor padrão do status
			if (s !== statusDefault) {
				var delay = setTimeout(function () {
					setStatus(statusDefault);
					clearInterval(delay);
				}, 3000);
			};
		};

		
		// Se conecta no servidor através do socket
		var socket = io.connect();
      

		if (socket == null) {
			alert("Não foi possível conetar ao servidor");
		};
		// Se a conexão for bem sucedida recebe as mensagens armazenadas no banco de dados e exibe na tela
		if(socket !== undefined){
			// Listen for output
			socket.on('output', function (data) {
				if (data.length) {
					// Loop through results
					for (var x = 0; x < data.length; x++) {
						var message = document.createElement('div');
						message.setAttribute('class', 'chat-message');
						message.textContent = data[x].name + ': ' + data[x].message;

						//Append
						messages.appendChild(message);
					//	messages.insertBefore(message, messages.firstChild)
					}
				}
			})

			// Espera um evento do servidor do tipo status, recebe o valor do status, seta o valor na tela e limpa a textarea de digitação de mensagens
			socket.on('status', function (data) {
				setStatus((typeof data === 'object') ? data.message : data);

				if (data.clear === true) {
					textarea.value = '';
				}
			});

			// Evento adicionado na textarea de mensagem que escuta as teclas digitadas
			textarea.addEventListener('keydown', function (event) {
				var self = this,
					name = chatName.value;

						// Se a tecla digitada for Enter envia a mensagem através do evento input
					if (event.which === 13 && event.shiftKey === false) {
						socket.emit('input',{
							name : name,
							message : self.value 
						});

						event.preventDefault();
					}
			});
		}

		

	})();

	 
