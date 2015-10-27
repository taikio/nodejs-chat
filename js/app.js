	 
(function () {
		var getNode = function (s) {
			return document.querySelector(s);
		},
		// Get required nodes
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

			if (s !== statusDefault) {
				var delay = setTimeout(function () {
					setStatus(statusDefault);
					clearInterval(delay);
				}, 3000);
			};
		};

		

		var socket = io.connect();
      

		if (socket == null) {
			alert("Não foi possível conetar ao servidor");
		};

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

			// Listen for a status
			socket.on('status', function (data) {
				setStatus((typeof data === 'object') ? data.message : data);

				if (data.clear === true) {
					textarea.value = '';
				}
			});

			// Listen for keydown
			textarea.addEventListener('keydown', function (event) {
				var self = this,
					name = chatName.value;


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

	 
