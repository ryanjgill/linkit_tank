var express = require('express')
  , app = express()
  , fs = require('fs')
  , path = require('path')
  , http = require('http').createServer(app)
  , socketIO = require('socket.io')(http)
  , five = require('johnny-five')
  , os = require('os')
  , eth0 = os.networkInterfaces().apcli0
  , address = eth0 && eth0.length && eth0[0].address
      ? eth0[0].address
      : null
  , PORT = 3030
  , board = new five.Board({
      port: '/dev/ttyS0'
    })
  ;

function emitUserCount(socketIO) {
  socketIO.sockets.emit('user:count', socketIO.engine.clientsCount);
}

app.use('/public', express.static(path.join(__dirname + '/public')));

// index route
app.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname + '/public/index.html'))
});

// board ready event
board.on('ready', function (err) {
  if (err) {
    console.log(err);
    board.reset();
    return;
  }

  console.log('board connected! Johnny-Five ready to go.')

  // setup motors 
  var motor1 = new five.Motor({
    pins: {
      pwm: 3,
      dir: 5,
      cdir: 6
    }
  })
  , motor2 = new five.Motor({
    pins: {
      pwm: 9,
      dir: 10,
      cdir: 11
    }
  });

  function forward(_speed) {
    var speed = _speed ? _speed : 255;

    motor1.forward(speed);
    motor2.forward(speed);
  }

  function reverse(_speed) {
    var speed = _speed ? _speed : 255;

    motor1.reverse(speed);
    motor2.reverse(speed);
  }

  function spinLeft(_speed) {
    var speed = _speed ? _speed : 128;

    motor1.forward(speed);
    motor2.reverse(speed);
  }

  function spinRight(_speed) {
    var speed = _speed ? _speed : 128;

    motor1.reverse(speed);
    motor2.forward(speed);
  }

  // SocketIO events
  socketIO.on('connection', function (socket) {
    console.log('New connection!');

    emitUserCount(socketIO);

    socket.on('forward', function (speed) {
      forward(speed);
    });

    socket.on('reverse', function (speed) {
      reverse(speed);
    });

    socket.on('spinLeft', function (speed) {
      spinLeft(speed);
    });

    socket.on('spinRight', function (speed) {
      spinRight(speed);
    });

    socket.on('disconnect', function() {
      console.log('User disconnected.');
      emitUserCount(socketIO);
    });
  });

  // set the app to listen on PORT
  http.listen(PORT);

  // log the address and port
  console.log('Up and running on ' + address + ':' + PORT);
});



