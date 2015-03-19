var amqp = require('amqp');
var io = require('socket.io').listen(8000);
var pubsub = require('pubsub-js');
var yaml = require('js-yaml');
var fs = require('fs');

try{
  var config = yaml.safeLoad(fs.readFileSync(__dirname+'/../config/config.yaml', 'utf8'));
}catch(e){
  console.log(e);
}

var connection = amqp.createConnection({ host: config.rabbit.host, 
                                         port: config.rabbit.port, 
                                         login: config.rabbit.login, 
                                         password: config.rabbit.pass, 
                                         vhost: config.rabbit.vhost });

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
