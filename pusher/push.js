var amqp = require('amqp');
var connection = amqp.createConnection({ host: "", port: , login: '', password: 'guest', vhost: '' });
var io = require('socket.io').listen(3000);
var pubsub = require('pubsub-js');

connection.on('ready', function () {
    connection.exchange("notification", options={type:'fanout'}, function(exchange) {

        // Receive message from server and broadcast to all
        connection.queue("msgs", function(queue){
            console.log('Created queue')
            queue.bind('#');
            queue.subscribe(function (message) {
                console.log('subscribed to queue');
                console.log(message.data.toString());
                var encoded_payload = unescape(message.data)
                var payload = JSON.parse(encoded_payload)
                console.log('Received a message:');
      	        console.log(payload);
                io.sockets.emit(payload.type, payload.data);
            })
        })
    })
})
